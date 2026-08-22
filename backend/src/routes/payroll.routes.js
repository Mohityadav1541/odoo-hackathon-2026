import express from "express";
const router = express.Router();
import { getMyPayroll, updateSalaryStructure, generatePayroll } from "../controller/payroll.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

router.get("/me", verifyToken, getMyPayroll);
router.post("/generate", verifyToken, generatePayroll);
router.put("/salary-structure/:employeeId", verifyToken, updateSalaryStructure);

export default router;
