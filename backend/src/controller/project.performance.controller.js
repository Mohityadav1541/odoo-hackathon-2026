import prisma from "../config/prisma.js";

// =====================================================
// dayflow.project.performance  CONTROLLER
// =====================================================


// ─────────────────────────────────────────────────
// CREATE   POST /api/v1/promotion/project-performance
// Admin / HR only
// completionPercentage is computed automatically —
// never accept it from the request body
// ─────────────────────────────────────────────────
export const createProjectPerformance = async (req, res) => {
    try {
        const {
            employeeId,
            projectName,
            reviewPeriod,
            goalsAssigned,
            goalsCompleted,
            projectScore,
            qualityScore,
            deliveryScore,
            comments,
        } = req.body;

        const reviewerId = req.user.userId;

        // ── Validation ──────────────────────────────
        if (!employeeId || !projectName || !reviewPeriod) {
            return res.status(400).json({
                success: false,
                message: "employeeId, projectName, and reviewPeriod are required",
            });
        }

        const assigned  = parseInt(goalsAssigned);
        const completed = parseInt(goalsCompleted);

        if (isNaN(assigned) || assigned <= 0) {
            return res.status(400).json({ success: false, message: "goalsAssigned must be a positive integer" });
        }
        if (isNaN(completed) || completed < 0) {
            return res.status(400).json({ success: false, message: "goalsCompleted must be a non-negative integer" });
        }
        if (completed > assigned) {
            return res.status(400).json({
                success: false,
                message: "goalsCompleted cannot exceed goalsAssigned",
            });
        }

        const scores = [projectScore, qualityScore, deliveryScore];
        if (scores.some(s => s === undefined || s === null || parseFloat(s) < 0 || parseFloat(s) > 100)) {
            return res.status(400).json({ success: false, message: "All scores must be between 0 and 100" });
        }

        const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        // ── Compute completionPercentage and store it ─
        const completionPercentage = parseFloat(((completed / assigned) * 100).toFixed(2));

        const record = await prisma.projectPerformance.create({
            data: {
                employeeId,
                projectName,
                reviewPeriod,
                goalsAssigned:       assigned,
                goalsCompleted:      completed,
                completionPercentage,
                projectScore:        parseFloat(projectScore),
                qualityScore:        parseFloat(qualityScore),
                deliveryScore:       parseFloat(deliveryScore),
                reviewerId,
                comments:            comments || null,
            },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, designation: true } },
                reviewer: { select: { id: true, employeeId: true, email: true } },
            },
        });

        return res.status(201).json({ success: true, message: "Project performance record created", data: record });
    } catch (error) {
        console.error("CREATE PROJECT PERFORMANCE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// UPDATE   PUT /api/v1/promotion/project-performance/:id
// ─────────────────────────────────────────────────
export const updateProjectPerformance = async (req, res) => {
    try {
        const { goalsAssigned, goalsCompleted, projectScore, qualityScore, deliveryScore, comments } = req.body;

        const assigned  = parseInt(goalsAssigned);
        const completed = parseInt(goalsCompleted);

        if (completed > assigned) {
            return res.status(400).json({ success: false, message: "goalsCompleted cannot exceed goalsAssigned" });
        }

        const completionPercentage = parseFloat(((completed / assigned) * 100).toFixed(2));

        const updated = await prisma.projectPerformance.update({
            where: { id: parseInt(req.params.id) },
            data: {
                goalsAssigned:       assigned,
                goalsCompleted:      completed,
                completionPercentage,
                projectScore:        parseFloat(projectScore),
                qualityScore:        parseFloat(qualityScore),
                deliveryScore:       parseFloat(deliveryScore),
                comments:            comments || null,
            },
        });

        return res.status(200).json({ success: true, message: "Record updated", data: updated });
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ success: false, message: "Record not found" });
        console.error("UPDATE PROJECT PERFORMANCE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET ALL FOR EMPLOYEE   GET /api/v1/promotion/project-performance/employee/:employeeId
// Optionally filter by reviewPeriod
// Returns records + period-level aggregate
// ─────────────────────────────────────────────────
export const getProjectsByEmployee = async (req, res) => {
    try {
        const { period } = req.query;
        const where = {
            employeeId: parseInt(req.params.employeeId),
            ...(period ? { reviewPeriod: period } : {}),
        };

        const records = await prisma.projectPerformance.findMany({
            where,
            include: { reviewer: { select: { id: true, employeeId: true, email: true } } },
            orderBy: { createdAt: "desc" },
        });

        // Aggregate: average project score across projects in the period
        const aggregatedScore = records.length
            ? parseFloat(
                (records.reduce((sum, r) => sum + parseFloat(r.projectScore), 0) / records.length).toFixed(2)
              )
            : 0;

        return res.status(200).json({ success: true, data: records, aggregatedScore });
    } catch (error) {
        console.error("GET PROJECTS BY EMPLOYEE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET SINGLE   GET /api/v1/promotion/project-performance/:id
// ─────────────────────────────────────────────────
export const getProjectById = async (req, res) => {
    try {
        const record = await prisma.projectPerformance.findUnique({
            where:   { id: parseInt(req.params.id) },
            include: { employee: true, reviewer: { select: { id: true, employeeId: true, email: true } } },
        });
        if (!record) return res.status(404).json({ success: false, message: "Record not found" });
        return res.status(200).json({ success: true, data: record });
    } catch (error) {
        console.error("GET PROJECT BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// DELETE   DELETE /api/v1/promotion/project-performance/:id
// ─────────────────────────────────────────────────
export const deleteProjectPerformance = async (req, res) => {
    try {
        await prisma.projectPerformance.delete({ where: { id: parseInt(req.params.id) } });
        return res.status(200).json({ success: true, message: "Record deleted" });
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ success: false, message: "Record not found" });
        console.error("DELETE PROJECT PERFORMANCE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
