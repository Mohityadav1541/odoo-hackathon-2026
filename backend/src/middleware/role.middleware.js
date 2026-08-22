// =====================================================
// ROLE GUARD MIDDLEWARE
// Restricts routes to ADMIN and/or HR roles
// =====================================================

/**
 * requireRole(...roles)
 * Usage: router.post("/", verifyToken, requireRole("ADMIN", "HR"), handler)
 */
export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied. Required role: ${roles.join(" or ")}`
        });
    }
    return next();
};
