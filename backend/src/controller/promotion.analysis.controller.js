import prisma from "../config/prisma.js";

// =====================================================
// dayflow.promotion.analysis  CONTROLLER
//
// Now delegates calculation and persistence to the
// Python promotion score engine microservice.
// =====================================================

// ─────────────────────────────────────────────────
// RUN ANALYSIS   POST /api/v1/promotion/analysis/run
// Admin / HR only
//
// Calls the Python Engine to compute scores and save history
// ─────────────────────────────────────────────────
export const runPromotionAnalysis = async (req, res) => {
    try {
        const { employeeId, evaluationPeriod } = req.body;
        const evaluatedById = req.user.userId;

        if (!employeeId || !evaluationPeriod) {
            return res.status(400).json({
                success: false,
                message: "employeeId and evaluationPeriod are required",
            });
        }

        // Calculate a 90 day period for the engine
        const periodEnd = new Date();
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - 90);

        // Call the Python service
        const response = await fetch("http://localhost:8001/api/engine/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                employee_id: parseInt(employeeId),
                period: evaluationPeriod,
                period_start: periodStart.toISOString().split('T')[0],
                period_end: periodEnd.toISOString().split('T')[0],
                evaluated_by_id: evaluatedById
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ success: false, message: err.detail || "Python engine error" });
        }

        const engineResult = await response.json();

        return res.status(200).json({
            success: true,
            message: `Promotion analysis complete — status: ${engineResult.status}`,
            data: engineResult
        });
    } catch (error) {
        console.error("RUN PROMOTION ANALYSIS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error connecting to Python engine" });
    }
};

// ─────────────────────────────────────────────────
// UPDATE HR DECISION   PATCH /api/v1/promotion/analysis/:id/decision
// After analysis, HR records their final decision
// ─────────────────────────────────────────────────
export const updateHrDecision = async (req, res) => {
    try {
        const { hrDecision, hrComments } = req.body;
        const validDecisions = ["PENDING", "APPROVED", "DEFERRED", "REJECTED"];

        if (!validDecisions.includes(hrDecision)) {
            return res.status(400).json({
                success: false,
                message: `hrDecision must be one of: ${validDecisions.join(", ")}`,
            });
        }

        const updated = await prisma.promotionAnalysis.update({
            where: { id: parseInt(req.params.id) },
            data:  { hrDecision, hrComments: hrComments || null },
            include: { employee: { select: { id: true, firstName: true, lastName: true } } },
        });

        // If approved → update Employee.lastPromotionDate
        if (hrDecision === "APPROVED") {
            await prisma.employee.update({
                where: { id: updated.employeeId },
                data:  { lastPromotionDate: new Date() },
            });
        }

        return res.status(200).json({ success: true, message: `HR decision recorded: ${hrDecision}`, data: updated });
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ success: false, message: "Analysis not found" });
        console.error("UPDATE HR DECISION ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET BY EMPLOYEE   GET /api/v1/promotion/analysis/employee/:employeeId
// Returns all analysis records for this employee (History for Trend)
// ─────────────────────────────────────────────────
export const getAnalysisByEmployee = async (req, res) => {
    try {
        const records = await prisma.promotionAnalysis.findMany({
            where:   { employeeId: parseInt(req.params.employeeId) },
            include: { evaluatedBy: { select: { id: true, employeeId: true, email: true } } },
            orderBy: { evaluatedAt: "desc" },
        });
        return res.status(200).json({ success: true, data: records });
    } catch (error) {
        console.error("GET ANALYSIS BY EMPLOYEE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET ALL (Admin Dashboard)   GET /api/v1/promotion/analysis
// Optionally filter by period or status
// ─────────────────────────────────────────────────
export const getAllAnalyses = async (req, res) => {
    try {
        const { period, status } = req.query;
        const where = {
            ...(period ? { evaluationPeriod: period } : {}),
            ...(status ? { promotionStatus: status } : {}),
        };

        const records = await prisma.promotionAnalysis.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true, firstName: true, lastName: true,
                        designation: true, department: true, jobLevel: true,
                    },
                },
                evaluatedBy: { select: { id: true, employeeId: true } },
            },
            orderBy: [{ promotionScore: "desc" }, { evaluatedAt: "desc" }],
        });

        // Summary cards logic for the Dashboard
        const summary = {
            promotionReady:      records.filter(r => r.promotionStatus === "PROMOTION_READY").length,
            underConsideration:  records.filter(r => r.promotionStatus === "UNDER_CONSIDERATION").length,
            needsDevelopment:    records.filter(r => r.promotionStatus === "NEEDS_DEVELOPMENT").length,
            total:               records.length,
            averageScore:        records.length > 0 
                                    ? (records.reduce((sum, r) => sum + parseFloat(r.promotionScore), 0) / records.length).toFixed(2) 
                                    : 0
        };

        return res.status(200).json({ success: true, summary, data: records });
    } catch (error) {
        console.error("GET ALL ANALYSES ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET SINGLE   GET /api/v1/promotion/analysis/:id
// ─────────────────────────────────────────────────
export const getAnalysisById = async (req, res) => {
    try {
        const record = await prisma.promotionAnalysis.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                employee:    { include: { user: { select: { email: true, employeeId: true } }, experience: true } },
                evaluatedBy: { select: { id: true, employeeId: true, email: true } },
            },
        });
        if (!record) return res.status(404).json({ success: false, message: "Analysis not found" });
        return res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error("GET ANALYSIS BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
