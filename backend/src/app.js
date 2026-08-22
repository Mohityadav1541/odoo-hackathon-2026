import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

import authRoutes from "./routes/auth.routh.js";
import attendanceRoutes from "./routes/attendance.routes.js";

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/attendance", attendanceRoutes);

export default app;