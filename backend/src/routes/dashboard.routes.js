import express from "express";
const router = express.Router();
import { getEmployeeDashboard, getAdminDashboard } from "../controller/dashboard.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

router.get("/me", verifyToken, getEmployeeDashboard);
router.get("/admin", verifyToken, getAdminDashboard);

export default router;
