from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from datetime import date
from engine import run_promotion_engine
from database import get_cursor, close_pool

app = FastAPI(title="DayFlow Promotion Calculation Service")

@app.on_event("shutdown")
def shutdown_event():
    close_pool()

class EngineRequest(BaseModel):
    employee_id: int
    period: str
    period_start: date
    period_end: date
    evaluated_by_id: int

@app.post("/api/engine/calculate")
def calculate_promotion(req: EngineRequest):
    try:
        result = run_promotion_engine(
            req.employee_id, 
            req.period, 
            req.period_start, 
            req.period_end
        )
        if "error" in result:
            raise HTTPException(status_code=422, detail=result["error"])

        # Step 8: Store Historical Promotion Analysis (Save to DB)
        # Using the same Node.js DB schema "PromotionAnalysis"
        with get_cursor() as cur:
            # Check for previous score to calculate trend
            cur.execute("""
                SELECT "promotionScore" 
                FROM "PromotionAnalysis"
                WHERE "employeeId" = %s AND "evaluationPeriod" != %s
                ORDER BY "evaluatedAt" DESC LIMIT 1
            """, (req.employee_id, req.period))
            prev = cur.fetchone()
            prev_score = float(prev['promotionScore']) if prev else None
            
            score_change = None
            if prev_score is not None:
                score_change = round(result['final_score'] - prev_score, 2)

            raw = result['raw_scores']
            # DO NOT overwrite previous evaluation records for the exact same period, 
            # wait, the DB schema has a UNIQUE constraint on (employeeId, evaluationPeriod).
            # If we shouldn't overwrite previous periods, we just upsert or insert depending on rules.
            # We will use ON CONFLICT (employeeId, evaluationPeriod) DO UPDATE to allow corrections,
            # but keep history for distinct periods.
            
            # Map Python status strings to Prisma Enum values
            prisma_status = "UNDER_CONSIDERATION"
            if result['status'] == "Strong Candidate":
                prisma_status = "PROMOTION_READY"
            elif result['status'] == "Development Required" or result['status'] == "Not Recommended":
                prisma_status = "NEEDS_DEVELOPMENT"

            cur.execute("""
                INSERT INTO "PromotionAnalysis" (
                    "employeeId", "evaluationPeriod", "attendanceScore", "performanceScore",
                    "projectScore", "managerFeedbackScore", "peerFeedbackScore", "experienceScore",
                    "promotionScore", "promotionStatus", "previousScore", "scoreChange", 
                    "evaluatedById", "evaluatedAt", "updatedAt"
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
                )
                ON CONFLICT ("employeeId", "evaluationPeriod") DO UPDATE SET
                    "attendanceScore" = EXCLUDED."attendanceScore",
                    "performanceScore" = EXCLUDED."performanceScore",
                    "projectScore" = EXCLUDED."projectScore",
                    "managerFeedbackScore" = EXCLUDED."managerFeedbackScore",
                    "peerFeedbackScore" = EXCLUDED."peerFeedbackScore",
                    "experienceScore" = EXCLUDED."experienceScore",
                    "promotionScore" = EXCLUDED."promotionScore",
                    "promotionStatus" = EXCLUDED."promotionStatus",
                    "previousScore" = EXCLUDED."previousScore",
                    "scoreChange" = EXCLUDED."scoreChange",
                    "evaluatedById" = EXCLUDED."evaluatedById",
                    "evaluatedAt" = NOW(),
                    "updatedAt" = NOW()
                RETURNING id
            """, (
                req.employee_id, req.period,
                raw['attendance'], raw['performance'], raw['project'],
                raw['manager_feedback'], raw['peer_feedback'], raw['experience'],
                result['final_score'], prisma_status, prev_score, score_change,
                req.evaluated_by_id
            ))
            analysis_id = cur.fetchone()['id']
            result['analysis_id'] = analysis_id

        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
