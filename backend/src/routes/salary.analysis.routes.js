import express from "express";
import { runSalaryAnalysis, getSalaryAnalysis } from "../controller/salary.analysis.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/run", verifyToken, requireRole("ADMIN", "HR"), runSalaryAnalysis);
router.get("/employee/:employeeId", verifyToken, requireRole("ADMIN", "HR"), getSalaryAnalysis);

export default router;
