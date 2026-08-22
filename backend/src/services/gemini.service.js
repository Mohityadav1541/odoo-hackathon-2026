import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Google Gen AI client with the key from .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates an HR Promotion Insights report based purely on 
 * the numerical analysis from the Python engine.
 * 
 * It forces Gemini to return a structured JSON object.
 */
export const generatePromotionInsights = async (engineData) => {
    try {
        const prompt = `
You are an expert HR Analyst AI for the DayFlow HRMS.
Review the following Promotion Analysis data for an employee and provide an objective evaluation.

IMPORTANT RULES:
1. Do not invent facts, fabricate missing information, or guess what the employee does.
2. Do not change any numerical values. Use the exact scores provided.
3. Do not claim certainty or diagnose the employee.
4. Do not make the final promotion decision. Clearly state that the final decision belongs to HR.
5. Use a professional, evidence-based tone.

INPUT DATA:
${JSON.stringify(engineData, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executive_summary: {
                            type: Type.STRING,
                            description: "A short executive summary and evidence-based explanation of the score. (Must state that the final decision belongs to HR)"
                        },
                        top_strengths: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of the employee's top strengths based on the data"
                        },
                        areas_needing_improvement: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "List of areas where the employee needs improvement based on the data"
                        },
                        suggested_hr_actions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Suggested actions for HR (e.g., 'Approve for promotion panel', 'Enroll in leadership training')"
                        },
                        review_questions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "Questions HR should review before making a final decision"
                        }
                    },
                    required: [
                        "executive_summary", 
                        "top_strengths", 
                        "areas_needing_improvement", 
                        "suggested_hr_actions", 
                        "review_questions"
                    ]
                }
            }
        });

        if (!response.text) {
            throw new Error("Gemini returned empty response");
        }

        return JSON.parse(response.text);

    } catch (error) {
        console.error("Gemini Generation Error:", error);
        return null;
    }
};
