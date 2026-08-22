import prisma from "../config/prisma.js";

// =====================================================
// GET MY PAYROLL (EMPLOYEE)
// =====================================================

export const getMyPayroll = async (req, res) => {
    try {
        const userId = req.user.userId;

        const payrolls = await prisma.payroll.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Format for frontend
        const formatted = payrolls.map(p => {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthName = months[p.month - 1];
            return {
                id: `PAY-${p.year}-${String(p.month).padStart(2, '0')}`,
                month: `${monthName} ${p.year}`,
                gross: parseFloat(p.grossSalary),
                deductions: parseFloat(p.deductions),
                net: parseFloat(p.netSalary),
                status: "Paid", // Assuming paid once generated
                issuedDate: new Date(p.year, p.month, 0).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            };
        });

        return res.status(200).json({ success: true, data: formatted });

    } catch (error) {
        console.error("GET MY PAYROLL ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error getting payroll" });
    }
};

// =====================================================
// UPDATE SALARY STRUCTURE (ADMIN ONLY)
// =====================================================

export const updateSalaryStructure = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { basicSalary, hra, allowances, deductions } = req.body;
        const role = req.user.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: "Forbidden. Admin access required." });
        }

        let numericId = parseInt(employeeId);
        if (isNaN(numericId) && employeeId.startsWith('EMP-')) {
            // Frontend passes "EMP-1001", but DB employee.id is likely 1
            numericId = parseInt(employeeId.replace('EMP-100', '')); // quick hack to convert EMP-1001 to 1
        }

        // Calculate gross and net
        const basic = parseFloat(basicSalary || 0);
        const h = parseFloat(hra || 0);
        const allow = parseFloat(allowances || 0);
        const deduct = parseFloat(deductions || 0);

        const gross = basic + h + allow;
        const net = gross - deduct;

        const updated = await prisma.salaryStructure.upsert({
            where: { employeeId: numericId },
            update: {
                basicSalary: basic,
                hra: h,
                allowances: allow,
                deductions: deduct,
                grossSalary: gross,
                netSalary: net,
                updatedAt: new Date()
            },
            create: {
                employeeId: numericId,
                basicSalary: basic,
                hra: h,
                allowances: allow,
                deductions: deduct,
                grossSalary: gross,
                netSalary: net
            }
        });

        return res.status(200).json({ success: true, message: "Salary structure updated.", data: updated });

    } catch (error) {
        console.error("UPDATE SALARY ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error updating salary structure" });
    }
};

// =====================================================
// GENERATE PAYROLL (ADMIN ONLY)
// =====================================================

export const generatePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;
        const role = req.user.role;

        if (role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: "Forbidden. Admin access required." });
        }

        if (!month || !year) {
             return res.status(400).json({ success: false, message: "Month and Year are required." });
        }

        // Fetch all employees and their salary structures
        const employees = await prisma.employee.findMany({
            include: { salary: true }
        });

        let generatedCount = 0;

        for (const emp of employees) {
            if (emp.salary) {
                // Upsert to ensure we don't duplicate payrolls for the same month/year
                await prisma.payroll.upsert({
                    where: {
                        userId_month_year: {
                            userId: emp.userId,
                            month: month,
                            year: year
                        }
                    },
                    update: {
                        basicSalary: emp.salary.basicSalary,
                        allowances: emp.salary.allowances, // Basic + HRA + Allowances logically? Schema has basic, allowances, deductions
                        deductions: emp.salary.deductions,
                        grossSalary: emp.salary.grossSalary,
                        netSalary: emp.salary.netSalary,
                    },
                    create: {
                        userId: emp.userId,
                        month: month,
                        year: year,
                        basicSalary: emp.salary.basicSalary,
                        allowances: emp.salary.allowances,
                        deductions: emp.salary.deductions,
                        grossSalary: emp.salary.grossSalary,
                        netSalary: emp.salary.netSalary,
                    }
                });
                generatedCount++;
            }
        }

        return res.status(200).json({ success: true, message: `Successfully generated ${generatedCount} payslips.` });

    } catch (error) {
        console.error("GENERATE PAYROLL ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error generating payroll" });
    }
};
