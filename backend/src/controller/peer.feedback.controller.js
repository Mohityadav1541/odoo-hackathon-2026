import prisma from "../config/prisma.js";

// =====================================================
// dayflow.peer.feedback  CONTROLLER
// =====================================================

// Helper: average of 3 peer scores
const computeOverall = (team, comm, collab) =>
    parseFloat(((parseFloat(team) + parseFloat(comm) + parseFloat(collab)) / 3).toFixed(2));


// ─────────────────────────────────────────────────
// CREATE   POST /api/v1/promotion/peer-feedback
// Any JWT-authenticated user can give peer feedback
// ─────────────────────────────────────────────────
export const createPeerFeedback = async (req, res) => {
    try {
        const {
            employeeId,
            reviewPeriod,
            teamworkScore,
            communicationScore,
            collaborationScore,
            comments,
            feedbackDate,
        } = req.body;

        const reviewerId = req.user.userId;

        // ── Validation ──────────────────────────────
        if (!employeeId || !reviewPeriod) {
            return res.status(400).json({ success: false, message: "employeeId and reviewPeriod are required" });
        }

        const scores = [teamworkScore, communicationScore, collaborationScore];
        if (scores.some(s => s === undefined || s === null || parseFloat(s) < 0 || parseFloat(s) > 100)) {
            return res.status(400).json({ success: false, message: "All scores must be between 0 and 100" });
        }

        // Reviewer must be a different person than the employee being reviewed
        const reviewerUser = await prisma.user.findUnique({
            where: { id: reviewerId },
            include: { employee: true },
        });
        if (!reviewerUser?.employee) {
            return res.status(404).json({ success: false, message: "Reviewer has no employee profile" });
        }
        if (reviewerUser.employee.id === employeeId) {
            return res.status(400).json({ success: false, message: "Employees cannot review themselves" });
        }

        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        const overallScore = computeOverall(teamworkScore, communicationScore, collaborationScore);

        const feedback = await prisma.peerFeedback.create({
            data: {
                employeeId,
                reviewerId,
                reviewPeriod,
                teamworkScore:      parseFloat(teamworkScore),
                communicationScore: parseFloat(communicationScore),
                collaborationScore: parseFloat(collaborationScore),
                overallScore,
                comments:           comments     || null,
                feedbackDate:       feedbackDate ? new Date(feedbackDate) : new Date(),
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
                reviewer: { select: { id: true, employeeId: true, email: true } },
            },
        });

        return res.status(201).json({ success: true, message: "Peer feedback submitted", data: feedback });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Peer feedback for this employee from this reviewer in the same period already exists",
            });
        }
        console.error("CREATE PEER FEEDBACK ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET ALL FOR EMPLOYEE   GET /api/v1/promotion/peer-feedback/employee/:employeeId
// Returns individual feedbacks + aggregated score
// ─────────────────────────────────────────────────
export const getPeerFeedbackByEmployee = async (req, res) => {
    try {
        const { period } = req.query;
        const where = {
            employeeId: Number(req.params.employeeId),
            ...(period ? { reviewPeriod: period } : {}),
        };

        const feedbacks = await prisma.peerFeedback.findMany({
            where,
            include: {
                reviewer: {
                    select: { id: true, employeeId: true, employee: { select: { firstName: true, lastName: true } } },
                },
            },
            orderBy: { feedbackDate: "desc" },
        });

        // Aggregate: average overallScore across all peers
        const aggregatedScore = feedbacks.length
            ? parseFloat((feedbacks.reduce((sum, f) => sum + parseFloat(f.overallScore), 0) / feedbacks.length).toFixed(2))
            : 0;

        return res.status(200).json({ success: true, data: feedbacks, aggregatedScore });
    } catch (error) {
        console.error("GET PEER FEEDBACK ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET SINGLE   GET /api/v1/promotion/peer-feedback/:id
// ─────────────────────────────────────────────────
export const getPeerFeedbackById = async (req, res) => {
    try {
        const feedback = await prisma.peerFeedback.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                employee: true,
                reviewer: { select: { id: true, employeeId: true, email: true } },
            },
        });
        if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found" });
        return res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        console.error("GET PEER FEEDBACK BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// DELETE   DELETE /api/v1/promotion/peer-feedback/:id
// Admin only
// ─────────────────────────────────────────────────
export const deletePeerFeedback = async (req, res) => {
    try {
        await prisma.peerFeedback.delete({ where: { id: Number(req.params.id) } });
        return res.status(200).json({ success: true, message: "Peer feedback deleted" });
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ success: false, message: "Feedback not found" });
        console.error("DELETE PEER FEEDBACK ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
