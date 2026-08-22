import express from "express";
const router = express.Router();
import * as attendanceController from "../controller/attendance.controller.js";

// Middleware can be added here if needed (e.g., verifying JWT token)
// For check-in and check-out, we are explicitly taking credentials in the body, 
// so JWT is technically optional for these endpoints, but typically you'd still 
// want it to prevent unauthenticated users from even reaching the endpoint.

router.post("/check-in", attendanceController.checkIn);
router.post("/check-out", attendanceController.checkOut);
router.get("/history", attendanceController.getHistory);

export default router;
