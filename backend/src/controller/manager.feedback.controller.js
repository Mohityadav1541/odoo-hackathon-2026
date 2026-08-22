import prisma from "../config/prisma.js";

// =====================================================
// dayflow.manager.feedback  CONTROLLER
// =====================================================

// Helper: compute overall score as average of 4 competency scores
const computeOverall = (comm, lead, own, rel) =>
    parseFloat(((parseFloat(comm) + parseFloat(lead) + parseFloat(own) + parseFloat(rel)) / 4).toFixed(2));


// ─────────────────────────────────────────────────
// CREATE   POST /api/v1/promotion/manager-feedback
// Admin / HR only
// ─────────────────────────────────────────────────
export const createManagerFeedback = async (req, res) => {
    try {
        const {
            employeeId,
            reviewPeriod,
            communicationScore,
            leadershipScore,
            ownershipScore,
            reliabilityScore,
            comments,
            feedbackDate,
        } = req.body;

        const managerId = req.user.userId;

        // ── Validation ──────────────────────────────
        if (!employeeId || !reviewPeriod) {
            return res.status(400).json({ success: false, message: "employeeId and reviewPeriod are required" });
        }

        const scores = [communicationScore, leadershipScore, ownershipScore, reliabilityScore];
        if (scores.some(s => s === undefined || s === null || parseFloat(s) < 0 || parseFloat(s) > 100)) {
            return res.status(400).json({ success: false, message: "All scores must be between 0 and 100" });
        }

        if (managerId === employeeId) {
            return res.status(400).json({ success: false, message: "Manager cannot give feedback to themselves" });
        }

        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        // Compute and store overall score for auditability
        const overallScore = computeOverall(communicationScore, leadershipScore, ownershipScore, reliabilityScore);

        const feedback = await prisma.managerFeedback.create({
            data: {
                employeeId,
                managerId,
                reviewPeriod,
                communicationScore: parseFloat(communicationScore),
                leadershipScore:    parseFloat(leadershipScore),
                ownershipScore:     parseFloat(ownershipScore),
                reliabilityScore:   parseFloat(reliabilityScore),
                overallScore,
                comments:           comments    || null,
                feedbackDate:       feedbackDate ? new Date(feedbackDate) : new Date(),
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
                manager:  { select: { id: true, employeeId: true, email: true } },
            },
        });

        return res.status(201).json({ success: true, message: "Manager feedback submitted", data: feedback });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Feedback from this manager for this employee and period already exists",
            });
        }
        console.error("CREATE MANAGER FEEDBACK ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// UPDATE   PUT /api/v1/promotion/manager-feedback/:id
// ─────────────────────────────────────────────────
export const updateManagerFeedback = async (req, res) => {
    try {
        const { communicationScore, leadershipScore, ownershipScore, reliabilityScore, comments } = req.body;

        const scores = [communicationScore, leadershipScore, ownershipScore, reliabilityScore];
        if (scores.some(s => parseFloat(s) < 0 || parseFloat(s) > 100)) {
            return res.status(400).json({ success: false, message: "All scores must be between 0 and 100" });
        }

        const overallScore = computeOverall(communicationScore, leadershipScore, ownershipScore, reliabilityScore);

        const updated = await prisma.managerFeedback.update({
            where: { id: parseInt(req.params.id) },
            data: {
                communicationScore: parseFloat(communicationScore),
                leadershipScore:    parseFloat(leadershipScore),
                ownershipScore:     parseFloat(ownershipScore),
                reliabilityScore:   parseFloat(reliabilityScore),
                overallScore,
                comments:           comments || null,
            },
        });

        return res.status(200).json({ success: true, message: "Feedback updated", data: updated });
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ success: false, message: "Feedback not found" });
        console.error("UPDATE MANAGER FEEDBACK ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET ALL FOR EMPLOYEE   GET /api/v1/promotion/manager-feedback/employee/:employeeId
// ─────────────────────────────────────────────────
export const getFeedbackByEmployee = async (req, res) => {
    try {
        const { period } = req.query;
        const where = {
            employeeId: parseInt(req.params.employeeId),
            ...(period ? { reviewPeriod: period } : {}),
        };

        const feedbacks = await prisma.managerFeedback.findMany({
            where,
            include: { manager: { select: { id: true, employeeId: true, email: true, employee: { select: { firstName: true, lastName: true } } } } },
            orderBy: { feedbackDate: "desc" },
        });

        // Aggregate overall score across multiple managers for the period
        const avg = feedbacks.length
            ? parseFloat((feedbacks.reduce((sum, f) => sum + parseFloat(f.overallScore), 0) / feedbacks.length).toFixed(2))
            : 0;

        return res.status(200).json({ success: true, data: feedbacks, aggregatedScore: avg });
    } catch (error) {
        console.error("GET MANAGER FEEDBACK ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET SINGLE   GET /api/v1/promotion/manager-feedback/:id
// ─────────────────────────────────────────────────
export const getFeedbackById = async (req, res) => {
    try {
        const feedback = await prisma.managerFeedback.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                employee: true,
                manager:  { select: { id: true, employeeId: true, email: true } },
            },
        });
        if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found" });
        return res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        console.error("GET FEEDBACK BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// DELETE   DELETE /api/v1/promotion/manager-feedback/:id
// ─────────────────────────────────────────────────
export const deleteManagerFeedback = async (req, res) => {
    try {
        await prisma.managerFeedback.delete({ where: { id: parseInt(req.params.id) } });
        return res.status(200).json({ success: true, message: "Feedback deleted" });
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ success: false, message: "Feedback not found" });
        console.error("DELETE MANAGER FEEDBACK ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
