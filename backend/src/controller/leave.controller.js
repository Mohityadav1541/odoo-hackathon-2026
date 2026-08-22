import prisma from "../config/prisma.js";

// =====================================================
// APPLY FOR LEAVE
// =====================================================

export const applyLeave = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, startDate, endDate, remarks } = req.body;

        if (!type || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Type, Start Date, and End Date are required." });
        }

        // Map frontend "Paid Leave" format to prisma enum "PAID"
        let prismaLeaveType = 'PAID';
        if (type === 'Sick Leave') prismaLeaveType = 'SICK';
        if (type === 'Unpaid Leave') prismaLeaveType = 'UNPAID';
        if (type === 'Casual Leave') prismaLeaveType = 'PAID'; // Mapping Casual to Paid for MVP

        const newLeave = await prisma.leaveRequest.create({
            data: {
                employeeId: userId,
                type: prismaLeaveType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                remarks: remarks || "",
                status: 'PENDING'
            }
        });

        return res.status(201).json({
            success: true,
            message: "Leave application submitted successfully.",
            data: newLeave
        });

    } catch (error) {
        console.error("APPLY LEAVE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error applying for leave" });
    }
};

// =====================================================
// UPDATE LEAVE STATUS (ADMIN ONLY)
// =====================================================

export const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvalComment } = req.body;
        const adminId = req.user.userId;
        const role = req.user.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: "Forbidden. Admin access required." });
        }

        if (status !== 'APPROVED' && status !== 'REJECTED') {
            return res.status(400).json({ success: false, message: "Invalid status. Must be APPROVED or REJECTED." });
        }

        // We use parseInt since id is passed as string in params (Wait, frontend sends `LR-5` or just `5`? 
        // Dashboard maps it to `LR-5`, so we need to extract the number if it has a prefix).
        let numericId = parseInt(id);
        if (isNaN(numericId) && id.startsWith('LR-')) {
            numericId = parseInt(id.replace('LR-', ''));
        }

        if (isNaN(numericId)) {
            return res.status(400).json({ success: false, message: "Invalid Leave ID format." });
        }

        const updatedLeave = await prisma.leaveRequest.update({
            where: { id: numericId },
            data: {
                status: status,
                approvalComment: approvalComment || null,
                approvedById: adminId
            }
        });

        return res.status(200).json({
            success: true,
            message: `Leave request ${status.toLowerCase()} successfully.`,
            data: updatedLeave
        });

    } catch (error) {
        console.error("UPDATE LEAVE STATUS ERROR:", error);
        if (error.code === 'P2025') {
             return res.status(404).json({ success: false, message: "Leave request not found." });
        }
        return res.status(500).json({ success: false, message: "Server error updating leave status" });
    }
};
