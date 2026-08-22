from typing import Dict, Any, List
from database import get_cursor

def calculate_manager_feedback_score(employee_id: int, review_period: str) -> Dict[str, Any]:
    """
    Manager Feedback Score calculation.
    """
    with get_cursor() as cur:
        cur.execute("""
            SELECT "communicationScore", "leadershipScore", "ownershipScore", "reliabilityScore", "overallScore", "managerId"
            FROM "ManagerFeedback"
            WHERE "employeeId" = %s AND "reviewPeriod" = %s
        """, (employee_id, review_period))
        feedbacks = cur.fetchall()

    if not feedbacks:
        return {"score": None, "metrics": {}}

    count = len(feedbacks)
    # Using the pre-calculated overallScore from the DB model (which is an average of the 4 factors)
    avg_overall = sum(float(f['overallScore']) for f in feedbacks) / count
    avg_comm = sum(float(f['communicationScore']) for f in feedbacks) / count
    avg_lead = sum(float(f['leadershipScore']) for f in feedbacks) / count
    avg_own = sum(float(f['ownershipScore']) for f in feedbacks) / count
    avg_rel = sum(float(f['reliabilityScore']) for f in feedbacks) / count

    return {
        "score": round(avg_overall, 2),
        "metrics": {
            "communication": round(avg_comm, 2),
            "leadership": round(avg_lead, 2),
            "ownership": round(avg_own, 2),
            "reliability": round(avg_rel, 2),
            "evaluator_count": count
        }
    }

def calculate_peer_feedback_score(employee_id: int, review_period: str) -> Dict[str, Any]:
    """
    Peer Feedback Score calculation.
    Uses median-like dampening to prevent a single extreme rating from dominating.
    """
    with get_cursor() as cur:
        cur.execute("""
            SELECT "teamworkScore", "communicationScore", "collaborationScore", "overallScore", "reviewerId"
            FROM "PeerFeedback"
            WHERE "employeeId" = %s AND "reviewPeriod" = %s
        """, (employee_id, review_period))
        feedbacks = cur.fetchall()

    if not feedbacks:
        return {"score": None, "metrics": {}}

    count = len(feedbacks)
    overall_scores = sorted([float(f['overallScore']) for f in feedbacks])
    
    # Simple dampening: if > 2 reviewers, drop the absolute highest and lowest to remove extremes
    if count > 2:
        valid_scores = overall_scores[1:-1]
    else:
        valid_scores = overall_scores
        
    avg_overall = sum(valid_scores) / len(valid_scores)

    avg_team = sum(float(f['teamworkScore']) for f in feedbacks) / count
    avg_comm = sum(float(f['communicationScore']) for f in feedbacks) / count
    avg_collab = sum(float(f['collaborationScore']) for f in feedbacks) / count

    return {
        "score": round(avg_overall, 2),
        "metrics": {
            "teamwork": round(avg_team, 2),
            "collaboration": round(avg_collab, 2),
            "communication": round(avg_comm, 2),
            "evaluator_count": count,
            "dampened": count > 2
        }
    }
