import prisma from "../config/prisma.js";

// =====================================================
// EMPLOYEE DASHBOARD
// =====================================================

export const getEmployeeDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Get User Profile with Employee Details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: { include: { salary: true } }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Get Today's Attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAttendance = await prisma.attendance.findUnique({
            where: {
                userId_date: {
                    userId: userId,
                    date: today
                }
            }
        });

        // 3. Get Weekly Attendance (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const weeklyAttendanceRaw = await prisma.attendance.findMany({
            where: {
                userId: userId,
                date: {
                    gte: sevenDaysAgo
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Map Prisma attendance to frontend expected format
        const weeklyAttendance = weeklyAttendanceRaw.map(att => {
            const d = new Date(att.date);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            let hoursWorked = 0;
            if (att.checkIn && att.checkOut) {
                hoursWorked = (new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / (1000 * 60 * 60);
            }
            return {
                day: days[d.getDay()],
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                status: att.status.toLowerCase().replace('_', '-'),
                checkIn: att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
                checkOut: att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
                hoursWorked: Number(hoursWorked.toFixed(1))
            };
        });

        // 4. Get Pending Leaves
        const leaveRequests = await prisma.leaveRequest.findMany({
            where: { employeeId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        const mappedLeaves = leaveRequests.map(lr => ({
            id: `LR-${lr.id}`,
            type: lr.type === 'PAID' ? 'Paid Leave' : (lr.type === 'SICK' ? 'Sick Leave' : 'Unpaid Leave'),
            startDate: new Date(lr.startDate).toISOString().split('T')[0],
            endDate: new Date(lr.endDate).toISOString().split('T')[0],
            days: Math.ceil((new Date(lr.endDate).getTime() - new Date(lr.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
            remarks: lr.remarks || "",
            status: lr.status.toLowerCase(),
            rejectComment: lr.approvalComment,
            appliedDate: new Date(lr.createdAt).toISOString().split('T')[0],
        }));

        // 5. Get Recent Payslips
        const payrolls = await prisma.payroll.findMany({
            where: { userId: userId },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            take: 3
        });

        const mappedPayslips = payrolls.map(p => {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            return {
                id: `PAY-${p.year}-${p.month}`,
                month: `${months[p.month - 1]} ${p.year}`,
                gross: Number(p.grossSalary),
                deductions: Number(p.deductions),
                net: Number(p.netSalary),
                status: "Paid",
                issuedDate: new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            }
        });

        // 6. Map Employee Profile to frontend expected format
        const emp = user.employee || {};
        const userProfile = {
            id: user.employeeId,
            name: `${emp.firstName || user.employeeId} ${emp.lastName || ''}`.trim(),
            avatar: emp.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // placeholder
            role: emp.designation || user.role,
            department: emp.department || "General",
            email: user.email,
            phone: emp.phone || "",
            status: todayAttendance ? todayAttendance.status.toLowerCase().replace('_', '-') : "absent",
            checkIn: todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
            checkOut: todayAttendance?.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
            hours: todayAttendance?.checkIn && todayAttendance?.checkOut ? 
                   ((new Date(todayAttendance.checkOut).getTime() - new Date(todayAttendance.checkIn).getTime()) / (1000 * 60 * 60)) : 
                   (todayAttendance?.checkIn ? ((new Date().getTime() - new Date(todayAttendance.checkIn).getTime()) / (1000 * 60 * 60)) : 0),
            basicSalary: emp.salary?.basicSalary ? Number(emp.salary.basicSalary) : 0,
            hra: emp.salary?.hra ? Number(emp.salary.hra) : 0,
            allowances: emp.salary?.allowances ? Number(emp.salary.allowances) : 0,
            deductions: emp.salary?.deductions ? Number(emp.salary.deductions) : 0
        };

        return res.status(200).json({
            success: true,
            data: {
                userProfile,
                weeklyAttendance,
                leaveRequests: mappedLeaves,
                payslips: mappedPayslips
            }
        });

    } catch (error) {
        console.error("GET EMPLOYEE DASHBOARD ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// =====================================================
// ADMIN DASHBOARD
// =====================================================

export const getAdminDashboard = async (req, res) => {
    try {
        // 1. Get all employees
        const users = await prisma.user.findMany({
            include: {
                employee: { include: { salary: true } },
                attendance: {
                    where: {
                        date: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }
        });

        const mappedEmployees = users.map(u => {
            const emp = u.employee || {};
            const todayAtt = u.attendance[0];
            return {
                id: u.employeeId,
                name: `${emp.firstName || u.employeeId} ${emp.lastName || ''}`.trim(),
                avatar: emp.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                role: emp.designation || u.role,
                department: emp.department || "General",
                email: u.email,
                phone: emp.phone || "",
                status: todayAtt ? todayAtt.status.toLowerCase().replace('_', '-') : "absent",
                checkIn: todayAtt?.checkIn ? new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
                checkOut: todayAtt?.checkOut ? new Date(todayAtt.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
                basicSalary: emp.salary?.basicSalary ? Number(emp.salary.basicSalary) : 0,
                hra: emp.salary?.hra ? Number(emp.salary.hra) : 0,
                allowances: emp.salary?.allowances ? Number(emp.salary.allowances) : 0,
                deductions: emp.salary?.deductions ? Number(emp.salary.deductions) : 0
            };
        });

        // 2. Get all pending leaves
        const pendingLeavesRaw = await prisma.leaveRequest.findMany({
            where: { status: 'PENDING' },
            include: { employee: { include: { employee: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const mappedPendingLeaves = pendingLeavesRaw.map(lr => {
            const emp = lr.employee.employee || {};
            return {
                id: `LR-${lr.id}`,
                employeeId: lr.employee.employeeId,
                employeeName: `${emp.firstName || lr.employee.employeeId} ${emp.lastName || ''}`.trim(),
                employeeAvatar: emp.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                type: lr.type === 'PAID' ? 'Paid Leave' : (lr.type === 'SICK' ? 'Sick Leave' : 'Unpaid Leave'),
                startDate: new Date(lr.startDate).toISOString().split('T')[0],
                endDate: new Date(lr.endDate).toISOString().split('T')[0],
                days: Math.ceil((new Date(lr.endDate).getTime() - new Date(lr.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
                remarks: lr.remarks || "",
                status: "pending",
                appliedDate: new Date(lr.createdAt).toISOString().split('T')[0],
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                employees: mappedEmployees,
                pendingLeaves: mappedPendingLeaves
            }
        });

    } catch (error) {
        console.error("GET ADMIN DASHBOARD ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
