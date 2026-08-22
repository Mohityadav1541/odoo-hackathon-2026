import express from "express";

import {
    signup,
    verifyEmail,
    login
} from "../controller/auth.controller.js";

const router = express.Router();


// =====================================================
// SIGNUP
// =====================================================

router.post(
    "/signup",
    signup
);


// =====================================================
// VERIFY EMAIL
// =====================================================

router.get(
    "/verify-email/:token",
    verifyEmail
);


// =====================================================
// LOGIN
// =====================================================

router.post(
    "/login",
    login
);


export default router;