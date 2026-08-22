import prisma from "../config/prisma.js";
import { generatePromotionInsights } from "../services/gemini.service.js";
import { notifyHrSlack } from "../services/slack.service.js";

// =====================================================
// dayflow.promotion.analysis  CONTROLLER
//
// Now delegates calculation and persistence to the
// Python promotion score engine microservice, and then
// calls Gemini to generate the HR insights (Step 11).
// =====================================================

// ─────────────────────────────────────────────────
// RUN ANALYSIS   POST /api/v1/promotion/analysis/run
// Admin / HR only
//
// Calls the Python Engine to compute scores and save history,
// then calls Gemini to generate AI insights and updates the record.
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

        // Fetch employee details to pass to Gemini
        const employee = await prisma.employee.findUnique({
            where: { id: Number(employeeId) },
            select: { firstName: true, lastName: true, department: true, designation: true, jobLevel: true }
        });

        // 1. Calculate a 90 day period for the engine
        const periodEnd = new Date();
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - 90);

        // 2. Call the Python service for numerical scoring
        const response = await fetch("http://localhost:8001/api/engine/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                employee_id: Number(employeeId),
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
        
        // 3. Prepare data for Gemini (Step 11)
        const dataForGemini = {
            employee_role: employee?.designation,
            evaluation_period: evaluationPeriod,
            promotion_score: engineResult.final_score,
            status: engineResult.status,
            factor_scores: engineResult.raw_scores,
            factor_weights: engineResult.weights,
            key_metrics: engineResult.metrics_detail
        };

        // 4. Call Gemini to generate HR Insights
        // This process is independent of the numerical calculation.
        const aiInsights = await generatePromotionInsights(dataForGemini);

        // 5. Update the PromotionAnalysis record with the AI narrative
        if (aiInsights && engineResult.analysis_id) {
            await prisma.promotionAnalysis.update({
                where: { id: engineResult.analysis_id },
                data: {
                    aiSummary: aiInsights.executive_summary,
                    // Store as stringified JSON or plain strings since the schema expects String?
                    // We'll join arrays into bulleted lists
                    aiStrengths: aiInsights.top_strengths ? aiInsights.top_strengths.map(s => `• ${s}`).join('\n') : null,
                    aiRisks: (aiInsights.areas_needing_improvement ? aiInsights.areas_needing_improvement.map(s => `• ${s}`).join('\n') + '\n\n' : '') +
                             (aiInsights.review_questions ? "HR Review Questions:\n" + aiInsights.review_questions.map(q => `• ${q}`).join('\n') : ''),
                    aiRecommendation: aiInsights.suggested_hr_actions ? aiInsights.suggested_hr_actions.map(s => `• ${s}`).join('\n') : null,
                }
            });

            // 6. Slack Notification (Step 13)
            // Send only if the employee meets the minimum consideration threshold
            if (engineResult.status === "Strong Candidate" || engineResult.status === "Consider") {
                const empName = employee ? `${employee.firstName} ${employee.lastName}` : "Employee";
                // Extract the first recommended action from AI insights if available, otherwise use default
                const fallbackRec = engineResult.status === "Strong Candidate" ? "Strongly recommend for promotion panel." : "Consider this employee for HR promotion review.";
                const aiRecText = (aiInsights.suggested_hr_actions && aiInsights.suggested_hr_actions.length > 0) ? aiInsights.suggested_hr_actions[0] : fallbackRec;
                
                // Call Slack webhook async (do not block the response)
                notifyHrSlack(empName, engineResult, aiRecText, engineResult.analysis_id).catch(console.error);
            }
        }

        return res.status(200).json({
            success: true,
            message: `Promotion analysis complete — status: ${engineResult.status}`,
            data: engineResult,
            insightsGenerated: !!aiInsights
        });
    } catch (error) {
        console.error("RUN PROMOTION ANALYSIS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error connecting to Python engine or AI" });
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
            where: { id: Number(req.params.id) },
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
            where:   { employeeId: Number(req.params.employeeId) },
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
            where: { id: Number(req.params.id) },
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
