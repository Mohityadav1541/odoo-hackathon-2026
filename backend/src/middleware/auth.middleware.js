import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ success: false, message: "A token is required for authentication" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
    return next();
};
