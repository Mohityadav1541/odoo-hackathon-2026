import prisma from "../config/prisma.js";
import { generateSalaryInsights } from "../services/gemini.salary.service.js";

// =====================================================
// dayflow.salary.analysis  CONTROLLER (Step 12)
// =====================================================

export const runSalaryAnalysis = async (req, res) => {
    try {
        const { employeeId } = req.body;
        if (!employeeId) return res.status(400).json({ success: false, message: "employeeId is required" });

        // 1. Fetch Salary Structure
        const salaryStructure = await prisma.salaryStructure.findUnique({
            where: { employeeId: parseInt(employeeId) }
        });

        // 2. Fetch Experience
        const experience = await prisma.employeeExperience.findUnique({
            where: { employeeId: parseInt(employeeId) }
        });

        // 3. Fetch latest Promotion Analysis
        const latestPromo = await prisma.promotionAnalysis.findFirst({
            where: { employeeId: parseInt(employeeId) },
            orderBy: { evaluatedAt: "desc" }
        });

        if (!salaryStructure || !experience) {
            return res.status(400).json({ 
                success: false, 
                message: "Insufficient data: Employee must have a SalaryStructure and EmployeeExperience record." 
            });
        }

        const currentSalary = parseFloat(salaryStructure.basicSalary) || 0;
        const bandMin = parseFloat(salaryStructure.fromSalary) || 0;
        const bandMax = parseFloat(salaryStructure.toSalary) || 0;
        const yearsInRole = parseFloat(experience.yearsInCurrentRole) || 0;
        
        const perfScore = latestPromo ? parseFloat(latestPromo.performanceScore) : null;
        const promoScore = latestPromo ? parseFloat(latestPromo.promotionScore) : null;

        // 4. Calculate Position in Band & Gap
        let positionInBand = null;
        if (bandMax > bandMin) {
            positionInBand = ((currentSalary - bandMin) / (bandMax - bandMin)) * 100;
        }

        let salaryBandGap = 0;
        if (currentSalary < bandMin) {
            salaryBandGap = bandMin - currentSalary; // negative logic representation -> we store the absolute gap amount
        } else if (currentSalary > bandMax) {
            salaryBandGap = currentSalary - bandMax;
        }

        // 5. Indicator Logic
        let indicator = "REVIEW_NOT_REQUIRED";
        
        if (bandMin === 0 || bandMax === 0) {
            indicator = "INSUFFICIENT_DATA";
        } else if (currentSalary < bandMin) {
            indicator = "REVIEW_RECOMMENDED"; // Below band
        } else if (perfScore && perfScore > 85 && positionInBand !== null && positionInBand < 25) {
            indicator = "REVIEW_RECOMMENDED"; // High performer stuck at bottom of band
        } else if (yearsInRole > 3 && positionInBand !== null && positionInBand < 50) {
            indicator = "REVIEW_RECOMMENDED"; // Tenured but below midpoint
        } else if (promoScore && promoScore > 85) {
            indicator = "REVIEW_RECOMMENDED"; // Up for promotion anyway
        }

        const analysisData = {
            currentSalary,
            roleSalaryBandMin: bandMin,
            roleSalaryBandMax: bandMax,
            performanceScore: perfScore,
            promotionScore: promoScore,
            yearsInRole,
            positionInBand,
            salaryBandGap,
            reviewIndicator: indicator,
            aiExplanation: null
        };

        // 6. Gemini Explanation (Optional Context)
        if (indicator !== "INSUFFICIENT_DATA") {
            const aiInsights = await generateSalaryInsights(analysisData);
            if (aiInsights?.aiExplanation) {
                analysisData.aiExplanation = aiInsights.aiExplanation;
            }
        }

        // 7. Upsert to DB
        const savedRecord = await prisma.salaryAnalysis.upsert({
            where: { employeeId: parseInt(employeeId) },
            update: analysisData,
            create: {
                employeeId: parseInt(employeeId),
                ...analysisData
            }
        });

        return res.status(200).json({
            success: true,
            data: savedRecord
        });

    } catch (error) {
        console.error("SALARY ANALYSIS ERROR:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getSalaryAnalysis = async (req, res) => {
    try {
        const record = await prisma.salaryAnalysis.findUnique({
            where: { employeeId: parseInt(req.params.employeeId) }
        });
        if (!record) return res.status(404).json({ success: false, message: "No salary analysis found." });
        
        return res.status(200).json({ success: true, data: record });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
