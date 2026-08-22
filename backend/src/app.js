import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// ── Existing routes ───────────────────────────────
import authRoutes           from "./routes/auth.routh.js";
import attendanceRoutes     from "./routes/attendance.routes.js";
import dashboardRoutes      from "./routes/dashboard.routes.js";
import profileRoutes        from "./routes/profile.routes.js";
import leaveRoutes          from "./routes/leave.routes.js";
import payrollRoutes        from "./routes/payroll.routes.js";

// ── Promotion Analysis routes (Step 2) ───────────
import performanceReviewRoutes  from "./routes/performance.review.routes.js";
import managerFeedbackRoutes    from "./routes/manager.feedback.routes.js";
import peerFeedbackRoutes       from "./routes/peer.feedback.routes.js";
import projectPerformanceRoutes from "./routes/project.performance.routes.js";
import employeeExperienceRoutes from "./routes/employee.experience.routes.js";
import promotionRoutes          from "./routes/promotion.routes.js";

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// ── Existing API mounts ───────────────────────────
app.use("/api/v1/auth",       authRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/dashboard",  dashboardRoutes);
app.use("/api/v1/profile",    profileRoutes);
app.use("/api/v1/leave",      leaveRoutes);
app.use("/api/v1/payroll",    payrollRoutes);

// ── Promotion Analysis API mounts ─────────────────
// dayflow.performance.review
app.use("/api/v1/promotion/performance-review",  performanceReviewRoutes);
// dayflow.manager.feedback
app.use("/api/v1/promotion/manager-feedback",    managerFeedbackRoutes);
// dayflow.peer.feedback
app.use("/api/v1/promotion/peer-feedback",       peerFeedbackRoutes);
// dayflow.project.performance
app.use("/api/v1/promotion/project-performance", projectPerformanceRoutes);
// dayflow.employee.experience
app.use("/api/v1/promotion/experience",          employeeExperienceRoutes);
// dayflow.promotion.config + dayflow.promotion.analysis
app.use("/api/v1/promotion",                     promotionRoutes);

export default app;