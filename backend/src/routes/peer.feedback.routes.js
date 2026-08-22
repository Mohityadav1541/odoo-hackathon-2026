import express from "express";
const router = express.Router();

import { verifyToken }  from "../middleware/auth.middleware.js";
import { requireRole }  from "../middleware/role.middleware.js";
import {
    createPeerFeedback,
    getPeerFeedbackByEmployee,
    getPeerFeedbackById,
    deletePeerFeedback,
} from "../controller/peer.feedback.controller.js";

// Any authenticated user can give peer feedback
router.post("/",                           verifyToken,                              createPeerFeedback);

// Admin / HR — view all peer feedbacks for an employee (supports ?period=)
router.get("/employee/:employeeId",        verifyToken, requireRole("ADMIN", "HR"), getPeerFeedbackByEmployee);

// Admin / HR — single record
router.get("/:id",                         verifyToken, requireRole("ADMIN", "HR"), getPeerFeedbackById);

// Admin only — delete
router.delete("/:id",                      verifyToken, requireRole("ADMIN"),       deletePeerFeedback);

export default router;
