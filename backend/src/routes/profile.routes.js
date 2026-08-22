import express from "express";
const router = express.Router();
import { getProfile, updateProfile } from "../controller/profile.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);

export default router;
