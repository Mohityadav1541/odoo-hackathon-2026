import prisma from "../config/prisma.js";

// =====================================================
// GET PROFILE
// =====================================================

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                employee: {
                    include: {
                        documents: true,
                        salary: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const emp = user.employee || {};
        const salary = emp.salary || {};
        
        const mappedProfile = {
            id: user.employeeId,
            name: `${emp.firstName || user.employeeId} ${emp.lastName || ''}`.trim(),
            avatar: emp.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: emp.designation || user.role,
            department: emp.department || "General",
            email: user.email,
            phone: emp.phone || "",
            address: emp.address || "",
            
            // Salary mapped
            basicSalary: salary.basicSalary ? Number(salary.basicSalary) : 0,
            hra: salary.hra ? Number(salary.hra) : 0,
            allowances: salary.allowances ? Number(salary.allowances) : 0,
            deductions: salary.deductions ? Number(salary.deductions) : 0,

            // Documents mapped
            documents: (emp.documents || []).map(doc => ({
                id: doc.id,
                name: doc.name,
                url: doc.url,
                date: new Date(doc.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                size: "N/A" // Placeholder as size is not stored
            }))
        };

        return res.status(200).json({
            success: true,
            data: mappedProfile
        });

    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const { name, phone, avatar, department, role: jobRole, address } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { employee: true }
        });

        if (!user || !user.employee) {
            return res.status(404).json({ success: false, message: "Employee profile not found" });
        }

        const employeeId = user.employee.id;

        // Base updates (anyone can update their own phone, avatar, address)
        const updateData = {
            phone: phone !== undefined ? phone : user.employee.phone,
            profilePicture: avatar !== undefined ? avatar : user.employee.profilePicture,
            address: address !== undefined ? address : user.employee.address
        };

        // Name split logic
        if (name && role === 'ADMIN') {
            const nameParts = name.trim().split(" ");
            updateData.firstName = nameParts[0];
            updateData.lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;
        }

        // Job details updates (Admin only)
        if (role === 'ADMIN') {
            if (department !== undefined) updateData.department = department;
            if (jobRole !== undefined) updateData.designation = jobRole;
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id: employeeId },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
