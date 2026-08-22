import express from "express";
const router = express.Router();

import { verifyToken }  from "../middleware/auth.middleware.js";
import { requireRole }  from "../middleware/role.middleware.js";
import {
    createConfig,
    activateConfig,
    getActiveConfig,
    getAllConfigs,
    updateConfig,
    deleteConfig,
} from "../controller/promotion.config.controller.js";

import {
    runPromotionAnalysis,
    updateHrDecision,
    getAnalysisByEmployee,
    getAllAnalyses,
    getAnalysisById,
} from "../controller/promotion.analysis.controller.js";

// ── Config routes ──────────────────────────────────

// Admin / HR — list all configs
router.get("/config",                      verifyToken, requireRole("ADMIN", "HR"), getAllConfigs);

// Admin / HR — get the currently active config
router.get("/config/active",               verifyToken, requireRole("ADMIN", "HR"), getActiveConfig);

// Admin / HR — create a new config (validates weight sum = 100)
router.post("/config",                     verifyToken, requireRole("ADMIN", "HR"), createConfig);

// Admin / HR — update an existing config
router.put("/config/:id",                  verifyToken, requireRole("ADMIN", "HR"), updateConfig);

// Admin / HR — set a config as active
router.patch("/config/:id/activate",       verifyToken, requireRole("ADMIN", "HR"), activateConfig);

// Admin only — delete (cannot delete active config)
router.delete("/config/:id",               verifyToken, requireRole("ADMIN"),       deleteConfig);


// ── Analysis routes ────────────────────────────────

// Admin / HR — run full promotion analysis for an employee
router.post("/analysis/run",               verifyToken, requireRole("ADMIN", "HR"), runPromotionAnalysis);

// Admin / HR — get all analyses (supports ?period= and ?status=)
router.get("/analysis",                    verifyToken, requireRole("ADMIN", "HR"), getAllAnalyses);

// Admin / HR — get all analyses for one employee
router.get("/analysis/employee/:employeeId", verifyToken, requireRole("ADMIN", "HR"), getAnalysisByEmployee);

// Admin / HR — get a single analysis record
router.get("/analysis/:id",                verifyToken, requireRole("ADMIN", "HR"), getAnalysisById);

// Admin / HR — record HR decision after reviewing AI summary
router.patch("/analysis/:id/decision",     verifyToken, requireRole("ADMIN", "HR"), updateHrDecision);

export default router;
