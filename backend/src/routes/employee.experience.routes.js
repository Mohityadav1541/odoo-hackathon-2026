import express from "express";
const router = express.Router();

import { verifyToken }  from "../middleware/auth.middleware.js";
import { requireRole }  from "../middleware/role.middleware.js";
import {
    upsertExperience,
    getExperience,
    refreshExperienceDerivedFields,
} from "../controller/employee.experience.controller.js";

// Admin / HR — create or update experience record
router.post("/",                           verifyToken, requireRole("ADMIN", "HR"), upsertExperience);

// Admin / HR — get experience record for an employee
router.get("/:employeeId",                 verifyToken, requireRole("ADMIN", "HR"), getExperience);

// Admin / HR — recompute yearsAtCompany and yearsInCurrentRole without changing inputs
router.patch("/:employeeId/refresh",       verifyToken, requireRole("ADMIN", "HR"), refreshExperienceDerivedFields);

export default router;
