import express from "express";
const router = express.Router();

import { verifyToken }  from "../middleware/auth.middleware.js";
import { requireRole }  from "../middleware/role.middleware.js";
import {
    createManagerFeedback,
    updateManagerFeedback,
    getFeedbackByEmployee,
    getFeedbackById,
    deleteManagerFeedback,
} from "../controller/manager.feedback.controller.js";

// Admin / HR — submit feedback
router.post("/",                           verifyToken, requireRole("ADMIN", "HR"), createManagerFeedback);

// Admin / HR — update scores/comments
router.put("/:id",                         verifyToken, requireRole("ADMIN", "HR"), updateManagerFeedback);

// Admin / HR — all feedbacks for an employee (supports ?period=Q3-2026)
router.get("/employee/:employeeId",        verifyToken, requireRole("ADMIN", "HR"), getFeedbackByEmployee);

// Admin / HR — single record
router.get("/:id",                         verifyToken, requireRole("ADMIN", "HR"), getFeedbackById);

// Admin only — delete
router.delete("/:id",                      verifyToken, requireRole("ADMIN"),       deleteManagerFeedback);

export default router;
