const express = require("express");

const {
    signup,
    verifyEmail,
    login
} = require("../controllers/auth.controller");

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


module.exports = router;