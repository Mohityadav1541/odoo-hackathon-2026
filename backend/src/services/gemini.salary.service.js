import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateSalaryInsights = async (salaryData) => {
    try {
        const prompt = `
You are an expert HR Compensation Analyst for DayFlow HRMS.
Review the following Salary Review Analysis data and provide an objective explanation of the compensation review.

IMPORTANT RULES:
1. Do not invent facts, fabricate missing information, or guess.
2. Do not change any numerical values.
3. Do not override configured company salary policies.
4. Do not automatically decide the employee's new salary. The final compensation decision belongs to HR.
5. Explain the compensation review indicator based on their position in the salary band, their performance/promotion score, and tenure.

INPUT DATA:
${JSON.stringify(salaryData, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        aiExplanation: {
                            type: Type.STRING,
                            description: "Evidence-based explanation of why a review is recommended or not, addressing the band gap, scores, and tenure."
                        }
                    },
                    required: ["aiExplanation"]
                }
            }
        });

        if (!response.text) return null;
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Gemini Salary Generation Error:", error);
        return null;
    }
};
