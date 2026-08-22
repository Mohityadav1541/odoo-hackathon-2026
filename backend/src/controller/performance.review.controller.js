import prisma from "../config/prisma.js";

// =====================================================
// dayflow.performance.review  CONTROLLER
// =====================================================


// ─────────────────────────────────────────────────
// CREATE   POST /api/v1/promotion/performance-review
// Admin / HR only
// ─────────────────────────────────────────────────
export const createPerformanceReview = async (req, res) => {
    try {
        const {
            employeeId,
            reviewPeriod,
            managerScore,
            performanceScore,
            goalCompletionScore,
            projectDeliveryScore,
            strengths,
            improvementAreas,
            managerComments,
            reviewDate,
        } = req.body;

        const managerId = req.user.userId;

        // ── Validation ──────────────────────────────
        if (!employeeId || !reviewPeriod) {
            return res.status(400).json({
                success: false,
                message: "employeeId and reviewPeriod are required",
            });
        }

        const scores = [managerScore, performanceScore, goalCompletionScore, projectDeliveryScore];
        if (scores.some(s => s === undefined || s === null || s < 0 || s > 100)) {
            return res.status(400).json({
                success: false,
                message: "All scores must be numeric values between 0 and 100",
            });
        }

        // ── Verify employee exists ───────────────────
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        const review = await prisma.performanceReview.create({
            data: {
                employeeId,
                managerId,
                reviewPeriod,
                managerScore:         parseFloat(managerScore),
                performanceScore:     parseFloat(performanceScore),
                goalCompletionScore:  parseFloat(goalCompletionScore),
                projectDeliveryScore: parseFloat(projectDeliveryScore),
                strengths:            strengths       || null,
                improvementAreas:     improvementAreas || null,
                managerComments:      managerComments  || null,
                reviewDate:           reviewDate ? new Date(reviewDate) : new Date(),
                state:                "DRAFT",
            },
            include: { employee: true, manager: { select: { id: true, employeeId: true, email: true } } },
        });

        return res.status(201).json({ success: true, message: "Performance review created", data: review });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "A review for this employee, manager, and period already exists",
            });
        }
        console.error("CREATE PERFORMANCE REVIEW ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// UPDATE STATE   PATCH /api/v1/promotion/performance-review/:id/state
// Moves review through DRAFT → SUBMITTED → APPROVED
// ─────────────────────────────────────────────────
export const updateReviewState = async (req, res) => {
    try {
        const { id } = req.params;
        const { state } = req.body;

        const validStates = ["DRAFT", "SUBMITTED", "APPROVED"];
        if (!validStates.includes(state)) {
            return res.status(400).json({
                success: false,
                message: `state must be one of: ${validStates.join(", ")}`,
            });
        }

        const updated = await prisma.performanceReview.update({
            where: { id: parseInt(id) },
            data:  { state },
        });

        return res.status(200).json({ success: true, message: `Review moved to ${state}`, data: updated });
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ success: false, message: "Review not found" });
        console.error("UPDATE REVIEW STATE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET ALL FOR EMPLOYEE   GET /api/v1/promotion/performance-review/employee/:employeeId
// ─────────────────────────────────────────────────
export const getReviewsByEmployee = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.employeeId);
        const { period } = req.query;

        const where = { employeeId, ...(period ? { reviewPeriod: period } : {}) };

        const reviews = await prisma.performanceReview.findMany({
            where,
            include: { manager: { select: { id: true, employeeId: true, email: true, employee: { select: { firstName: true, lastName: true } } } } },
            orderBy: { reviewDate: "desc" },
        });

        return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error("GET REVIEWS BY EMPLOYEE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET SINGLE   GET /api/v1/promotion/performance-review/:id
// ─────────────────────────────────────────────────
export const getReviewById = async (req, res) => {
    try {
        const review = await prisma.performanceReview.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                employee: { include: { user: { select: { email: true, employeeId: true } } } },
                manager:  { select: { id: true, employeeId: true, email: true } },
            },
        });

        if (!review) return res.status(404).json({ success: false, message: "Review not found" });
        return res.status(200).json({ success: true, data: review });
    } catch (error) {
        console.error("GET REVIEW BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// DELETE   DELETE /api/v1/promotion/performance-review/:id
// Admin only — removes a draft review
// ─────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
    try {
        const review = await prisma.performanceReview.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });
        if (review.state === "APPROVED") {
            return res.status(400).json({ success: false, message: "Approved reviews cannot be deleted" });
        }
        await prisma.performanceReview.delete({ where: { id: parseInt(req.params.id) } });
        return res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
        console.error("DELETE REVIEW ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
