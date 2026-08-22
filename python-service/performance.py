from typing import Dict, Any, List
from database import get_cursor

def calculate_performance_score(reviews: List[Dict]) -> float:
    """
    Performance review score.
    Average of all approved manager reviews in the period.
    """
    if not reviews:
        return 0.0
    total = sum((float(r['managerScore']) + float(r['performanceScore'])) / 2 for r in reviews)
    return total / len(reviews)

def calculate_goal_score(reviews: List[Dict], projects: List[Dict]) -> float:
    """
    Goal completion score.
    Uses goalCompletionScore from reviews, and completionPercentage from projects.
    """
    scores = []
    for r in reviews:
        if r.get('goalCompletionScore') is not None:
            scores.append(float(r['goalCompletionScore']))
            
    for p in projects:
        if p.get('completionPercentage') is not None:
            scores.append(float(p['completionPercentage']))
            
    if not scores:
        return 0.0
    return sum(scores) / len(scores)

def calculate_project_score(projects: List[Dict]) -> Dict[str, float]:
    """
    Project delivery and project quality scores.
    """
    if not projects:
        return {"delivery": 0.0, "quality": 0.0, "overall": 0.0}
        
    delivery_total = sum(float(p['deliveryScore']) for p in projects)
    quality_total = sum(float(p['qualityScore']) for p in projects)
    overall_total = sum(float(p['projectScore']) for p in projects)
    
    count = len(projects)
    return {
        "delivery": delivery_total / count,
        "quality": quality_total / count,
        "overall": overall_total / count
    }

def calculate_overall_performance(employee_id: int, review_period: str) -> Dict[str, Any]:
    """
    Calculate the overall performance score from the separate performance-related models.
    """
    with get_cursor() as cur:
        # Fetch APPROVED Performance Reviews
        cur.execute("""
            SELECT "managerScore", "performanceScore", "goalCompletionScore", "projectDeliveryScore"
            FROM "PerformanceReview"
            WHERE "employeeId" = %s AND "reviewPeriod" = %s AND state = 'APPROVED'
        """, (employee_id, review_period))
        reviews = cur.fetchall()
        
        # Fetch Project Performances
        cur.execute("""
            SELECT "completionPercentage", "projectScore", "qualityScore", "deliveryScore"
            FROM "ProjectPerformance"
            WHERE "employeeId" = %s AND "reviewPeriod" = %s
        """, (employee_id, review_period))
        projects = cur.fetchall()

    if not reviews and not projects:
        return {"score": None, "metrics": {}}

    review_score = calculate_performance_score(reviews)
    goal_score = calculate_goal_score(reviews, projects)
    proj_scores = calculate_project_score(projects)
    
    # We aggregate them into a single overall performance component.
    # We weight them: review (40%), goals (30%), projects (30%)
    weights = []
    components = []
    
    if reviews:
        weights.append(0.4)
        components.append(review_score)
        
    if goal_score > 0:
        weights.append(0.3)
        components.append(goal_score)
        
    if projects:
        weights.append(0.3)
        components.append(proj_scores['overall'])
        
    if not components:
        overall_score = None
    else:
        # Normalize weights if some components are missing
        total_weight = sum(weights)
        overall_score = sum(c * (w / total_weight) for c, w in zip(components, weights))

    return {
        "score": round(overall_score, 2) if overall_score is not None else None,
        "metrics": {
            "performance_review_score": round(review_score, 2) if reviews else None,
            "goal_completion_score": round(goal_score, 2) if (reviews or projects) else None,
            "project_delivery_score": round(proj_scores['delivery'], 2) if projects else None,
            "project_quality_score": round(proj_scores['quality'], 2) if projects else None,
            "project_overall_score": round(proj_scores['overall'], 2) if projects else None,
            "reviews_count": len(reviews),
            "projects_count": len(projects)
        }
    }
