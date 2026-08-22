import express from "express";
const router = express.Router();

import { verifyToken }  from "../middleware/auth.middleware.js";
import { requireRole }  from "../middleware/role.middleware.js";
import {
    createPerformanceReview,
    updateReviewState,
    getReviewsByEmployee,
    getReviewById,
    deleteReview,
} from "../controller/performance.review.controller.js";

// Admin / HR — create a review
router.post("/",                             verifyToken, requireRole("ADMIN", "HR"), createPerformanceReview);

// Admin / HR — change state (DRAFT → SUBMITTED → APPROVED)
router.patch("/:id/state",                   verifyToken, requireRole("ADMIN", "HR"), updateReviewState);

// Admin / HR — get all reviews for an employee
router.get("/employee/:employeeId",          verifyToken, requireRole("ADMIN", "HR"), getReviewsByEmployee);

// Admin / HR — get single review
router.get("/:id",                           verifyToken, requireRole("ADMIN", "HR"), getReviewById);

// Admin only — delete a DRAFT review
router.delete("/:id",                        verifyToken, requireRole("ADMIN"),        deleteReview);

export default router;
