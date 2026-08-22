import prisma from "../config/prisma.js";

// =====================================================
// dayflow.promotion.config  CONTROLLER
//
// HR/Admin can configure the weights used to calculate
// the promotion score. The sum of all six weights MUST
// equal exactly 100 — enforced here in the controller.
// =====================================================

// Helper: sum all six weight fields
const weightsSum = (body) =>
    ["attendanceWeight", "performanceWeight", "projectWeight",
     "managerFeedbackWeight", "peerFeedbackWeight", "experienceWeight"]
        .reduce((sum, key) => sum + parseFloat(body[key] || 0), 0);


// ─────────────────────────────────────────────────
// CREATE   POST /api/v1/promotion/config
// Admin / HR only
// ─────────────────────────────────────────────────
export const createConfig = async (req, res) => {
    try {
        const {
            name,
            attendanceWeight,
            performanceWeight,
            projectWeight,
            managerFeedbackWeight,
            peerFeedbackWeight,
            experienceWeight,
            promotionThreshold,
            considerationThreshold,
            developmentThreshold,
            isActive,
        } = req.body;

        const createdById = req.user.userId;

        // ── Validation ──────────────────────────────
        if (!name) {
            return res.status(400).json({ success: false, message: "Config name is required" });
        }

        const total = weightsSum(req.body);
        if (Math.abs(total - 100) > 0.01) {
            return res.status(400).json({
                success: false,
                message: `All six weights must sum to 100. Current sum: ${total.toFixed(2)}`,
            });
        }

        const thresholds = [promotionThreshold, considerationThreshold, developmentThreshold];
        if (thresholds.some(t => t === undefined || parseFloat(t) < 0 || parseFloat(t) > 100)) {
            return res.status(400).json({
                success: false,
                message: "Thresholds must be numeric values between 0 and 100",
            });
        }

        // If this config is being set active, deactivate all others first
        if (isActive) {
            await prisma.promotionConfig.updateMany({ where: { isActive: true }, data: { isActive: false } });
        }

        const config = await prisma.promotionConfig.create({
            data: {
                name,
                isActive:              isActive ?? false,
                attendanceWeight:      parseFloat(attendanceWeight),
                performanceWeight:     parseFloat(performanceWeight),
                projectWeight:         parseFloat(projectWeight),
                managerFeedbackWeight: parseFloat(managerFeedbackWeight),
                peerFeedbackWeight:    parseFloat(peerFeedbackWeight),
                experienceWeight:      parseFloat(experienceWeight),
                promotionThreshold:    parseFloat(promotionThreshold),
                considerationThreshold:parseFloat(considerationThreshold),
                developmentThreshold:  parseFloat(developmentThreshold),
                createdById,
            },
            include: { createdBy: { select: { id: true, employeeId: true, email: true } } },
        });

        return res.status(201).json({ success: true, message: "Promotion config created", data: config });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json({ success: false, message: "A config with this name already exists" });
        }
        console.error("CREATE CONFIG ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// SET ACTIVE   PATCH /api/v1/promotion/config/:id/activate
// Deactivates all others and activates this one
// ─────────────────────────────────────────────────
export const activateConfig = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const config = await prisma.promotionConfig.findUnique({ where: { id } });
        if (!config) return res.status(404).json({ success: false, message: "Config not found" });

        // Deactivate all → activate the chosen one
        await prisma.promotionConfig.updateMany({ data: { isActive: false } });
        const activated = await prisma.promotionConfig.update({ where: { id }, data: { isActive: true } });

        return res.status(200).json({ success: true, message: `Config "${activated.name}" is now active`, data: activated });
    } catch (error) {
        console.error("ACTIVATE CONFIG ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET ACTIVE   GET /api/v1/promotion/config/active
// Returns the currently active config
// ─────────────────────────────────────────────────
export const getActiveConfig = async (req, res) => {
    try {
        const config = await prisma.promotionConfig.findFirst({
            where:   { isActive: true },
            include: { createdBy: { select: { id: true, employeeId: true, email: true } } },
            orderBy: { createdAt: "desc" },
        });

        if (!config) {
            return res.status(404).json({
                success: false,
                message: "No active promotion config found. Please create and activate one.",
            });
        }

        return res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error("GET ACTIVE CONFIG ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET ALL   GET /api/v1/promotion/config
// ─────────────────────────────────────────────────
export const getAllConfigs = async (req, res) => {
    try {
        const configs = await prisma.promotionConfig.findMany({
            include: { createdBy: { select: { id: true, employeeId: true, email: true } } },
            orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
        });
        return res.status(200).json({ success: true, data: configs });
    } catch (error) {
        console.error("GET ALL CONFIGS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// UPDATE   PUT /api/v1/promotion/config/:id
// Validates weight sum before saving
// ─────────────────────────────────────────────────
export const updateConfig = async (req, res) => {
    try {
        const total = weightsSum(req.body);
        if (Math.abs(total - 100) > 0.01) {
            return res.status(400).json({
                success: false,
                message: `All six weights must sum to 100. Current sum: ${total.toFixed(2)}`,
            });
        }

        const {
            name, attendanceWeight, performanceWeight, projectWeight,
            managerFeedbackWeight, peerFeedbackWeight, experienceWeight,
            promotionThreshold, considerationThreshold, developmentThreshold,
        } = req.body;

        const updated = await prisma.promotionConfig.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                attendanceWeight:      parseFloat(attendanceWeight),
                performanceWeight:     parseFloat(performanceWeight),
                projectWeight:         parseFloat(projectWeight),
                managerFeedbackWeight: parseFloat(managerFeedbackWeight),
                peerFeedbackWeight:    parseFloat(peerFeedbackWeight),
                experienceWeight:      parseFloat(experienceWeight),
                promotionThreshold:    parseFloat(promotionThreshold),
                considerationThreshold:parseFloat(considerationThreshold),
                developmentThreshold:  parseFloat(developmentThreshold),
            },
        });

        return res.status(200).json({ success: true, message: "Config updated", data: updated });
    } catch (error) {
        if (error.code === "P2025") return res.status(404).json({ success: false, message: "Config not found" });
        console.error("UPDATE CONFIG ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// DELETE   DELETE /api/v1/promotion/config/:id
// Cannot delete the active config
// ─────────────────────────────────────────────────
export const deleteConfig = async (req, res) => {
    try {
        const config = await prisma.promotionConfig.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!config) return res.status(404).json({ success: false, message: "Config not found" });
        if (config.isActive) {
            return res.status(400).json({ success: false, message: "Cannot delete the active config. Activate another first." });
        }
        await prisma.promotionConfig.delete({ where: { id: parseInt(req.params.id) } });
        return res.status(200).json({ success: true, message: "Config deleted" });
    } catch (error) {
        console.error("DELETE CONFIG ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
