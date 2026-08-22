import prisma from "../config/prisma.js";

// =====================================================
// dayflow.promotion.analysis  CONTROLLER
//
// RUN ANALYSIS — numerical score computation only.
// AI narrative (aiSummary, aiStrengths, aiRisks,
// aiRecommendation) is intentionally left null here
// and is populated in Step 3 (Gemini integration).
//
// Scores are computed from real DB data — NOT from
// Gemini. Gemini only generates the text narrative.
// =====================================================

// ── Score normalisation helpers ───────────────────

/**
 * Clamp a value between 0 and 100
 */
const clamp = (v) => Math.max(0, Math.min(100, parseFloat(v) || 0));

/**
 * Compute the attendance score (0–100) from the last N days
 * PRESENT = 1, HALF_DAY = 0.5, LEAVE / ABSENT = 0
 */
const computeAttendanceScore = (records) => {
    if (!records.length) return 0;
    const weighted = records.reduce((sum, r) => {
        if (r.status === "PRESENT")  return sum + 1;
        if (r.status === "HALF_DAY") return sum + 0.5;
        return sum; // ABSENT / LEAVE = 0
    }, 0);
    return parseFloat(((weighted / records.length) * 100).toFixed(2));
};

/**
 * Average of all PerformanceReview scores for the employee in the period
 * Score = avg(managerScore, performanceScore, goalCompletionScore, projectDeliveryScore)
 */
const computePerformanceScore = (reviews) => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, r) => {
        const avg = (parseFloat(r.managerScore) + parseFloat(r.performanceScore) +
                     parseFloat(r.goalCompletionScore) + parseFloat(r.projectDeliveryScore)) / 4;
        return sum + avg;
    }, 0);
    return parseFloat((total / reviews.length).toFixed(2));
};

/**
 * Average of all ProjectPerformance projectScores in the period
 */
const computeProjectScore = (projects) => {
    if (!projects.length) return 0;
    const total = projects.reduce((sum, p) =>
        sum + (parseFloat(p.projectScore) + parseFloat(p.qualityScore) + parseFloat(p.deliveryScore)) / 3, 0);
    return parseFloat((total / projects.length).toFixed(2));
};

/**
 * Average overallScore across all ManagerFeedbacks in the period
 */
const computeManagerFeedbackScore = (feedbacks) => {
    if (!feedbacks.length) return 0;
    const total = feedbacks.reduce((sum, f) => sum + parseFloat(f.overallScore), 0);
    return parseFloat((total / feedbacks.length).toFixed(2));
};

/**
 * Average overallScore across all PeerFeedbacks in the period
 */
const computePeerFeedbackScore = (feedbacks) => {
    if (!feedbacks.length) return 0;
    const total = feedbacks.reduce((sum, f) => sum + parseFloat(f.overallScore), 0);
    return parseFloat((total / feedbacks.length).toFixed(2));
};

/**
 * Experience score (0–100):
 *   base: years at company normalised to 10 years = 100
 *   bonus: years in current role (capped at 40 bonus points)
 *   seniority bonus from jobLevel
 */
const computeExperienceScore = (experience, employee) => {
    if (!experience) return 0;

    const yearsAtCompany    = parseFloat(experience.yearsAtCompany) || 0;
    const yearsInRole       = parseFloat(experience.yearsInCurrentRole) || 0;
    const prevYears         = parseFloat(experience.previousExperienceYears) || 0;

    // Map jobLevel to a bonus
    const levelBonusMap = { L1: 0, L2: 5, L3: 10, Senior: 15, Lead: 20, Manager: 25 };
    const levelBonus    = levelBonusMap[employee?.jobLevel] ?? 0;

    const base   = Math.min(yearsAtCompany / 10 * 60, 60);           // 0–60 pts from tenure
    const role   = Math.min(yearsInRole / 5 * 20, 20);               // 0–20 pts from role tenure
    const prev   = Math.min(prevYears / 10 * 10, 10);                // 0–10 pts from prior experience
    const level  = Math.min(levelBonus, 10);                         // 0–10 pts from job level

    return clamp(base + role + prev + level);
};

/**
 * Determine promotion status from score and config thresholds
 */
const determineStatus = (score, config) => {
    if (score >= parseFloat(config.promotionThreshold))    return "PROMOTION_READY";
    if (score >= parseFloat(config.considerationThreshold)) return "UNDER_CONSIDERATION";
    return "NEEDS_DEVELOPMENT";
};


// ─────────────────────────────────────────────────
// RUN ANALYSIS   POST /api/v1/promotion/analysis/run
// Admin / HR only
//
// Body: { employeeId, evaluationPeriod }
// evaluationPeriod must match the period strings used
// in PerformanceReview, ManagerFeedback, etc.
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

        const empId = parseInt(employeeId);

        // ── 1. Load employee ─────────────────────────
        const employee = await prisma.employee.findUnique({
            where:   { id: empId },
            include: { user: { select: { id: true, employeeId: true, email: true } } },
        });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        // ── 2. Load active promotion config ──────────
        const config = await prisma.promotionConfig.findFirst({
            where:   { isActive: true },
            orderBy: { createdAt: "desc" },
        });
        if (!config) {
            return res.status(422).json({
                success: false,
                message: "No active PromotionConfig found. Create and activate one first.",
            });
        }

        // ── 3. Gather all factor data for the period ─

        // Attendance: look back 90 days from now (last quarter)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const [
            attendanceRecords,
            performanceReviews,
            projectRecords,
            managerFeedbacks,
            peerFeedbacks,
            experience,
        ] = await Promise.all([
            prisma.attendance.findMany({
                where: { userId: employee.userId, date: { gte: ninetyDaysAgo } },
            }),
            prisma.performanceReview.findMany({
                where: { employeeId: empId, reviewPeriod: evaluationPeriod, state: "APPROVED" },
            }),
            prisma.projectPerformance.findMany({
                where: { employeeId: empId, reviewPeriod: evaluationPeriod },
            }),
            prisma.managerFeedback.findMany({
                where: { employeeId: empId, reviewPeriod: evaluationPeriod },
            }),
            prisma.peerFeedback.findMany({
                where: { employeeId: empId, reviewPeriod: evaluationPeriod },
            }),
            prisma.employeeExperience.findUnique({
                where: { employeeId: empId },
            }),
        ]);

        // ── 4. Compute individual factor scores ──────
        const attendanceScore      = computeAttendanceScore(attendanceRecords);
        const performanceScore     = computePerformanceScore(performanceReviews);
        const projectScore         = computeProjectScore(projectRecords);
        const managerFeedbackScore = computeManagerFeedbackScore(managerFeedbacks);
        const peerFeedbackScore    = computePeerFeedbackScore(peerFeedbacks);
        const experienceScore      = computeExperienceScore(experience, employee);

        // ── 5. Apply weights from config (numerical only — no Gemini here) ──
        const promotionScore = parseFloat((
            (attendanceScore      * parseFloat(config.attendanceWeight)      / 100) +
            (performanceScore     * parseFloat(config.performanceWeight)     / 100) +
            (projectScore         * parseFloat(config.projectWeight)         / 100) +
            (managerFeedbackScore * parseFloat(config.managerFeedbackWeight) / 100) +
            (peerFeedbackScore    * parseFloat(config.peerFeedbackWeight)    / 100) +
            (experienceScore      * parseFloat(config.experienceWeight)      / 100)
        ).toFixed(2));

        // ── 6. Determine promotion status ────────────
        const promotionStatus = determineStatus(promotionScore, config);

        // ── 7. Fetch previous analysis for trend tracking ─
        const previousAnalysis = await prisma.promotionAnalysis.findUnique({
            where: { employeeId_evaluationPeriod: { employeeId: empId, evaluationPeriod } },
            select: { promotionScore: true },
        });

        const previousScore = previousAnalysis ? parseFloat(previousAnalysis.promotionScore) : null;
        const scoreChange   = previousScore !== null ? parseFloat((promotionScore - previousScore).toFixed(2)) : null;

        // ── 8. Upsert analysis — snapshot stored for auditability ──
        const analysis = await prisma.promotionAnalysis.upsert({
            where: { employeeId_evaluationPeriod: { employeeId: empId, evaluationPeriod } },
            update: {
                attendanceScore,
                performanceScore,
                projectScore,
                managerFeedbackScore,
                peerFeedbackScore,
                experienceScore,
                promotionScore,
                promotionStatus,
                previousScore,
                scoreChange,
                evaluatedById,
                evaluatedAt: new Date(),
                // AI fields remain untouched on update — set by Step 3
            },
            create: {
                employeeId: empId,
                evaluationPeriod,
                attendanceScore,
                performanceScore,
                projectScore,
                managerFeedbackScore,
                peerFeedbackScore,
                experienceScore,
                promotionScore,
                promotionStatus,
                previousScore,
                scoreChange,
                // AI fields left null — populated by Step 3 (Gemini)
                aiSummary:        null,
                aiStrengths:      null,
                aiRisks:          null,
                aiRecommendation: null,
                hrDecision:       "PENDING",
                evaluatedById,
                evaluatedAt: new Date(),
            },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, designation: true, department: true, jobLevel: true },
                },
                evaluatedBy: { select: { id: true, employeeId: true, email: true } },
            },
        });

        return res.status(200).json({
            success: true,
            message: `Promotion analysis complete — status: ${promotionStatus}`,
            data: {
                analysis,
                breakdown: {
                    attendanceScore,
                    performanceScore,
                    projectScore,
                    managerFeedbackScore,
                    peerFeedbackScore,
                    experienceScore,
                    promotionScore,
                    promotionStatus,
                    configUsed: config.name,
                    dataPoints: {
                        attendanceDays:    attendanceRecords.length,
                        reviewsApproved:   performanceReviews.length,
                        projects:          projectRecords.length,
                        managerFeedbacks:  managerFeedbacks.length,
                        peerFeedbacks:     peerFeedbacks.length,
                        hasExperience:     !!experience,
                    },
                },
            },
        });
    } catch (error) {
        console.error("RUN PROMOTION ANALYSIS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
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
// Returns all analysis records for this employee
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
// GET ALL (Admin)   GET /api/v1/promotion/analysis
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

        // Summary counts
        const summary = {
            promotionReady:      records.filter(r => r.promotionStatus === "PROMOTION_READY").length,
            underConsideration:  records.filter(r => r.promotionStatus === "UNDER_CONSIDERATION").length,
            needsDevelopment:    records.filter(r => r.promotionStatus === "NEEDS_DEVELOPMENT").length,
            total:               records.length,
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
