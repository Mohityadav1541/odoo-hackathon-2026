import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

import authRoutes from "./routes/auth.routh.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/leave", leaveRoutes);
app.use("/api/v1/payroll", payrollRoutes);

export default app;