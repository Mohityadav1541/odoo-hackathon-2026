import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

// Mocking the allowed office IPs for now (In a real scenario, use environment variables)
const ALLOWED_OFFICE_IPS = ["127.0.0.1", "::1", "::ffff:127.0.0.1"]; 

// Utility to check if IP is in the allowed list
const isOfficeNetwork = (req) => {
    // Check x-forwarded-for first (if behind proxy/load balancer)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // In production, we'd do a stricter check. For dev, we allow localhost.
    if (process.env.NODE_ENV === 'development') return true;
    
    return ALLOWED_OFFICE_IPS.includes(ip);
};

// =====================================================
// CHECK-IN
// =====================================================

const checkIn = async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // 1. Office Network Check
        if (!isOfficeNetwork(req)) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: You must be connected to the office network to check in."
            });
        }

        // 2. Validate Input
        if (!employeeId || !password) {
            return res.status(400).json({ success: false, message: "Employee ID and password are required for check-in." });
        }

        // 3. Verify Identity
        const user = await prisma.user.findUnique({ where: { employeeId } });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // 4. Get today's date (stripped of time for the Date column)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 5. Check if already checked in today
        const existingAttendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today
                }
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: "You have already checked in today."
            });
        }

        // 6. Record Check-In
        const attendance = await prisma.attendance.create({
            data: {
                userId: user.id,
                date: today,
                checkIn: new Date(),
                checkInIp: clientIp,
                status: 'PRESENT'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Successfully checked in.",
            data: attendance
        });

    } catch (error) {
        console.error("Check-in Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// =====================================================
// CHECK-OUT
// =====================================================

const checkOut = async (req, res) => {
    try {
        const { employeeId, password } = req.body;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // 1. Office Network Check
        if (!isOfficeNetwork(req)) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: You must be connected to the office network to check out."
            });
        }

        // 2. Verify Identity
        const user = await prisma.user.findUnique({ where: { employeeId } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        // 3. Find today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today
                }
            }
        });

        if (!attendance) {
            return res.status(400).json({ success: false, message: "No check-in record found for today." });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ success: false, message: "You have already checked out today." });
        }

        // 4. Record Check-Out
        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: new Date(),
                checkOutIp: clientIp
            }
        });

        return res.status(200).json({
            success: true,
            message: "Successfully checked out.",
            data: updatedAttendance
        });

    } catch (error) {
        console.error("Check-out Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// =====================================================
// GET HISTORY
// =====================================================

const getHistory = async (req, res) => {
    try {
        // Assuming user ID is extracted from token by auth middleware
        // For testing, let's allow passing userId via query if admin, or strictly from req.user
        const targetUserId = req.user?.id || parseInt(req.query.userId);

        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "User ID is required." });
        }

        const history = await prisma.attendance.findMany({
            where: { userId: targetUserId },
            orderBy: { date: 'desc' },
            take: 30 // Get last 30 days
        });

        return res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("Get History Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

export {
    checkIn,
    checkOut,
    getHistory
};
