import dotenv from "dotenv";
dotenv.config();

/**
 * Sends a notification to the configured HR Slack Webhook.
 * Ensure SLACK_HR_WEBHOOK_URL is set in your .env file.
 */
export const notifyHrSlack = async (employeeName, promotionData, aiRecommendation, analysisId) => {
    try {
        const webhookUrl = process.env.SLACK_HR_WEBHOOK_URL;
        if (!webhookUrl) {
            console.warn("SLACK_HR_WEBHOOK_URL is not configured. Skipping Slack notification.");
            return;
        }

        // We assume the frontend URL is configured in env, default to localhost for development
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        const analysisLink = `${frontendUrl}/admin/promotion/${analysisId}`;

        // Human-readable status formatting
        let readableStatus = "Under Consideration";
        if (promotionData.status === "PROMOTION_READY" || promotionData.status === "Strong Candidate") {
            readableStatus = "Strong Candidate";
        } else if (promotionData.status === "NEEDS_DEVELOPMENT") {
            readableStatus = "Needs Development";
        }

        const messageBlock = {
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🌟 AI HR INSIGHT",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Employee:* ${employeeName}\n*Promotion Score:* ${promotionData.final_score}/100\n*Status:* ${readableStatus}`
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Key factors:*\n• Performance: ${promotionData.raw_scores?.performance || "N/A"}\n• Attendance: ${promotionData.raw_scores?.attendance || "N/A"}\n• Project Delivery: ${promotionData.raw_scores?.project || "N/A"}\n• Manager Feedback: ${promotionData.raw_scores?.manager_feedback || "N/A"}`
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Recommendation:*\n${aiRecommendation || "Consider this employee for HR promotion review."}`
                    }
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "View Analysis",
                                emoji: true
                            },
                            url: analysisLink,
                            style: "primary"
                        }
                    ]
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "🔒 Confidential HR Information. Do not share outside this private channel."
                        }
                    ]
                }
            ]
        };

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageBlock)
        });

        if (!response.ok) {
            throw new Error(`Slack API returned ${response.status}: ${await response.text()}`);
        }

        console.log(`Slack notification sent for ${employeeName}`);
    } catch (error) {
        console.error("Slack Notification Error:", error);
    }
};
