import express from "express";
const router = express.Router();
import { applyLeave, updateLeaveStatus } from "../controller/leave.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

router.post("/", verifyToken, applyLeave);
router.put("/:id/status", verifyToken, updateLeaveStatus);

export default router;
