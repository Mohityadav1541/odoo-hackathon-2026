import pytest
from unittest.mock import patch, MagicMock
from datetime import date
from engine import run_promotion_engine, determine_status, validate_weights
import engine

# Mock configuration
MOCK_CONFIG = {
    "name": "Test Config",
    "attendanceWeight": 10.0,
    "performanceWeight": 30.0,
    "projectWeight": 20.0,
    "managerFeedbackWeight": 20.0,
    "peerFeedbackWeight": 10.0,
    "experienceWeight": 10.0,
    "promotionThreshold": 90.0,
    "considerationThreshold": 80.0,
    "developmentThreshold": 70.0
}

@pytest.fixture
def mock_get_config(mocker):
    return mocker.patch("engine.get_active_config", return_value=MOCK_CONFIG)

@pytest.fixture
def mock_calculators(mocker):
    mocker.patch("engine.calculate_attendance_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_overall_performance", return_value={"score": 90.0, "metrics": {"performance_review_score": 90.0, "project_overall_score": 90.0}})
    mocker.patch("engine.calculate_manager_feedback_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_peer_feedback_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_experience_score", return_value={"score": 90.0, "metrics": {}})

def test_excellent_performance(mock_get_config, mock_calculators):
    """Test 1: Employee with excellent performance."""
    result = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    assert result["final_score"] == 90.0
    assert result["status"] == "Strong Candidate"

def test_poor_attendance_strong_performance(mocker, mock_get_config):
    """Test 2: Employee with poor attendance but strong performance."""
    mocker.patch("engine.calculate_attendance_score", return_value={"score": 40.0, "metrics": {}})
    mocker.patch("engine.calculate_overall_performance", return_value={"score": 95.0, "metrics": {"performance_review_score": 95.0, "project_overall_score": 95.0}})
    mocker.patch("engine.calculate_manager_feedback_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_peer_feedback_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_experience_score", return_value={"score": 80.0, "metrics": {}})

    result = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    # 40*.1 + 95*.3 + 95*.2 + 90*.2 + 90*.1 + 80*.1 = 4 + 28.5 + 19 + 18 + 9 + 8 = 86.5
    assert result["final_score"] == 86.5
    assert result["status"] == "Consider"

def test_excellent_attendance_weak_performance(mocker, mock_get_config):
    """Test 3: Employee with excellent attendance but weak performance."""
    mocker.patch("engine.calculate_attendance_score", return_value={"score": 100.0, "metrics": {}})
    mocker.patch("engine.calculate_overall_performance", return_value={"score": 50.0, "metrics": {"performance_review_score": 50.0, "project_overall_score": 50.0}})
    mocker.patch("engine.calculate_manager_feedback_score", return_value={"score": 60.0, "metrics": {}})
    mocker.patch("engine.calculate_peer_feedback_score", return_value={"score": 60.0, "metrics": {}})
    mocker.patch("engine.calculate_experience_score", return_value={"score": 80.0, "metrics": {}})

    result = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    # 100*.1 + 50*.3 + 50*.2 + 60*.2 + 60*.1 + 80*.1 = 10 + 15 + 10 + 12 + 6 + 8 = 61.0
    assert result["final_score"] == 61.0
    assert result["status"] == "Not Recommended"

def test_missing_feedback(mocker, mock_get_config):
    """Test 4: Employee with missing feedback."""
    mocker.patch("engine.calculate_attendance_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_overall_performance", return_value={"score": 90.0, "metrics": {"performance_review_score": 90.0, "project_overall_score": 90.0}})
    mocker.patch("engine.calculate_manager_feedback_score", return_value={"score": None, "metrics": {}})
    mocker.patch("engine.calculate_peer_feedback_score", return_value={"score": None, "metrics": {}})
    mocker.patch("engine.calculate_experience_score", return_value={"score": 90.0, "metrics": {}})

    result = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    assert "manager_feedback" in result["missing_data"]
    assert "peer_feedback" in result["missing_data"]
    # 90*.1 + 90*.3 + 90*.2 + 0*.2 + 0*.1 + 90*.1 = 9 + 27 + 18 + 0 + 0 + 9 = 63.0
    assert result["final_score"] == 63.0

def test_no_project_data(mocker, mock_get_config):
    """Test 5: Employee with no project data."""
    mocker.patch("engine.calculate_attendance_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_overall_performance", return_value={"score": None, "metrics": {"performance_review_score": 90.0, "project_overall_score": None}})
    mocker.patch("engine.calculate_manager_feedback_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_peer_feedback_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_experience_score", return_value={"score": 90.0, "metrics": {}})
    
    result = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    assert "project" in result["missing_data"]

def test_incomplete_performance_reviews(mocker, mock_get_config):
    """Test 6: Employee with incomplete performance reviews."""
    mocker.patch("engine.calculate_attendance_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_overall_performance", return_value={"score": None, "metrics": {"performance_review_score": None, "project_overall_score": 90.0}})
    mocker.patch("engine.calculate_manager_feedback_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_peer_feedback_score", return_value={"score": 90.0, "metrics": {}})
    mocker.patch("engine.calculate_experience_score", return_value={"score": 90.0, "metrics": {}})
    
    result = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    assert "performance" in result["missing_data"]

def test_invalid_promotion_weights(mocker):
    """Test 9: Invalid promotion weights."""
    bad_config = MOCK_CONFIG.copy()
    bad_config["attendanceWeight"] = 50.0 # Sum is now 140
    mocker.patch("engine.get_active_config", return_value=bad_config)
    result = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    assert "error" in result
    assert "weights do not total 100%" in result["error"]

def test_score_boundaries(mocker, mock_get_config):
    """Test 10 and 11: Score below 0 and above 100."""
    # Test above 100 (if calculators returned 150)
    mocker.patch("engine.calculate_attendance_score", return_value={"score": 150.0, "metrics": {}})
    mocker.patch("engine.calculate_overall_performance", return_value={"score": 150.0, "metrics": {"performance_review_score": 150.0, "project_overall_score": 150.0}})
    mocker.patch("engine.calculate_manager_feedback_score", return_value={"score": 150.0, "metrics": {}})
    mocker.patch("engine.calculate_peer_feedback_score", return_value={"score": 150.0, "metrics": {}})
    mocker.patch("engine.calculate_experience_score", return_value={"score": 150.0, "metrics": {}})
    
    result = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    assert result["final_score"] == 100.0  # Capped at 100
    
    # Test below 0
    mocker.patch("engine.calculate_attendance_score", return_value={"score": -50.0, "metrics": {}})
    mocker.patch("engine.calculate_overall_performance", return_value={"score": -50.0, "metrics": {"performance_review_score": -50.0, "project_overall_score": -50.0}})
    mocker.patch("engine.calculate_manager_feedback_score", return_value={"score": -50.0, "metrics": {}})
    mocker.patch("engine.calculate_peer_feedback_score", return_value={"score": -50.0, "metrics": {}})
    mocker.patch("engine.calculate_experience_score", return_value={"score": -50.0, "metrics": {}})
    
    result2 = run_promotion_engine(1, "Q1", date(2026,1,1), date(2026,3,31))
    assert result2["final_score"] == 0.0  # Floored at 0
