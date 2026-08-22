import prisma from "../config/prisma.js";

// =====================================================
// dayflow.employee.experience  CONTROLLER
//
// joining_date is NOT stored here — it already exists
// on the Employee model and is reused from there.
//
// yearsAtCompany     = (today - Employee.joiningDate)   / 365.25
// yearsInCurrentRole = (today - currentRoleStartDate)   / 365.25
// Both are computed at upsert time and stored for auditability.
// =====================================================

// Helper: convert millisecond difference to years (2-dp)
const msToYears = (ms) => parseFloat((ms / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2));


// ─────────────────────────────────────────────────
// UPSERT   POST /api/v1/promotion/experience
// Creates or updates the experience record for an employee.
// Admin / HR only.
// ─────────────────────────────────────────────────
export const upsertExperience = async (req, res) => {
    try {
        const { employeeId, currentRoleStartDate, previousExperienceYears } = req.body;

        if (!employeeId || !currentRoleStartDate) {
            return res.status(400).json({
                success: false,
                message: "employeeId and currentRoleStartDate are required",
            });
        }

        // ── Fetch the employee to reuse joiningDate ──
        const employee = await prisma.employee.findUnique({
            where: { id: Number(employeeId) },
            select: { id: true, joiningDate: true, firstName: true, lastName: true },
        });

        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        const now            = new Date();
        const roleStart      = new Date(currentRoleStartDate);

        if (isNaN(roleStart.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid currentRoleStartDate" });
        }

        // ── Derive computed experience values ────────
        // yearsAtCompany: reuses Employee.joiningDate (not duplicated)
        const yearsAtCompany = employee.joiningDate
            ? msToYears(now - new Date(employee.joiningDate))
            : 0;

        // yearsInCurrentRole: from currentRoleStartDate stored in this model
        const yearsInCurrentRole = msToYears(now - roleStart);

        const prevYears = previousExperienceYears !== undefined ? parseFloat(previousExperienceYears) : 0;

        const record = await prisma.employeeExperience.upsert({
            where: { employeeId: Number(employeeId) },
            update: {
                currentRoleStartDate:    roleStart,
                previousExperienceYears: prevYears,
                yearsAtCompany,
                yearsInCurrentRole,
            },
            create: {
                employeeId:              Number(employeeId),
                currentRoleStartDate:    roleStart,
                previousExperienceYears: prevYears,
                yearsAtCompany,
                yearsInCurrentRole,
            },
            include: { employee: { select: { id: true, firstName: true, lastName: true, joiningDate: true, designation: true } } },
        });

        return res.status(200).json({
            success: true,
            message: "Employee experience record saved",
            data: {
                ...record,
                // Surface joiningDate from Employee to avoid confusion that it's stored here
                joiningDate: employee.joiningDate,
            },
        });
    } catch (error) {
        console.error("UPSERT EXPERIENCE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// GET   GET /api/v1/promotion/experience/:employeeId
// Also recalculates live derived values on read
// ─────────────────────────────────────────────────
export const getExperience = async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);

        const record = await prisma.employeeExperience.findUnique({
            where: { employeeId },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        joiningDate: true,
                        designation: true,
                        department: true,
                        jobLevel: true,
                        lastPromotionDate: true,
                    },
                },
            },
        });

        if (!record) {
            return res.status(404).json({ success: false, message: "No experience record found for this employee" });
        }

        // Provide a fresh live calculation alongside the stored snapshot
        const now = new Date();
        const liveYearsAtCompany = record.employee.joiningDate
            ? msToYears(now - new Date(record.employee.joiningDate))
            : null;
        const liveYearsInCurrentRole = msToYears(now - new Date(record.currentRoleStartDate));

        return res.status(200).json({
            success: true,
            data: {
                ...record,
                // joining_date is reused from Employee — not stored here
                joiningDate: record.employee.joiningDate,
                // Live recalculated values (the stored ones are the auditable snapshot)
                liveYearsAtCompany,
                liveYearsInCurrentRole,
            },
        });
    } catch (error) {
        console.error("GET EXPERIENCE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ─────────────────────────────────────────────────
// REFRESH DERIVED FIELDS   PATCH /api/v1/promotion/experience/:employeeId/refresh
// Recalculates yearsAtCompany and yearsInCurrentRole
// without changing any input values
// ─────────────────────────────────────────────────
export const refreshExperienceDerivedFields = async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);

        const record = await prisma.employeeExperience.findUnique({
            where: { employeeId },
            include: { employee: { select: { joiningDate: true } } },
        });

        if (!record) return res.status(404).json({ success: false, message: "Experience record not found" });

        const now = new Date();
        const yearsAtCompany     = record.employee.joiningDate
            ? msToYears(now - new Date(record.employee.joiningDate))
            : 0;
        const yearsInCurrentRole = msToYears(now - new Date(record.currentRoleStartDate));

        const updated = await prisma.employeeExperience.update({
            where: { employeeId },
            data:  { yearsAtCompany, yearsInCurrentRole },
        });

        return res.status(200).json({
            success: true,
            message: "Derived experience fields refreshed",
            data: updated,
        });
    } catch (error) {
        console.error("REFRESH EXPERIENCE ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
