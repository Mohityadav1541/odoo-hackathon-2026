import express from "express";
const router = express.Router();

import { verifyToken }  from "../middleware/auth.middleware.js";
import { requireRole }  from "../middleware/role.middleware.js";
import {
    createProjectPerformance,
    updateProjectPerformance,
    getProjectsByEmployee,
    getProjectById,
    deleteProjectPerformance,
} from "../controller/project.performance.controller.js";

router.post("/",                           verifyToken, requireRole("ADMIN", "HR"), createProjectPerformance);
router.put("/:id",                         verifyToken, requireRole("ADMIN", "HR"), updateProjectPerformance);
router.get("/employee/:employeeId",        verifyToken, requireRole("ADMIN", "HR"), getProjectsByEmployee);
router.get("/:id",                         verifyToken, requireRole("ADMIN", "HR"), getProjectById);
router.delete("/:id",                      verifyToken, requireRole("ADMIN"),       deleteProjectPerformance);

export default router;
