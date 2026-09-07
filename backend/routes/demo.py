from fastapi import APIRouter
from seed_data import seed_database
from database import query_db

router = APIRouter(prefix="/api/demo", tags=["Demo Simulation"])

@router.post("/reset")
def reset_to_demo_state():
    seed_database()
    return {"status": "success", "message": "Database reset to official SIH26027 demo scenario state."}

@router.get("/scenario")
def get_demo_scenario():
    """Returns the exact demonstration parameters specified in the SIH problem statement."""
    return {
        "problem_statement": "SIH26027 - AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways",
        "scenario_title": "Signal S102 Maintenance vs Train 12601 on Section A-B",
        "description": "Train 12601 is scheduled through Section A-B at 10:30. Signal S102 requires a 2-hour maintenance block. AI evaluates all time windows and recommends the zero-conflict slot.",
        "target_asset": {
            "asset_id": "S102",
            "name": "Auto Color Light Signal S102",
            "section_id": "A-B",
            "condition": "Needs Repair",
            "required_duration": 2.0,
            "priority": "High"
        },
        "target_train": {
            "train_no": "12601",
            "train_name": "Mangalore Mail",
            "section_id": "A-B",
            "arrival_time": "10:30",
            "departure_time": "10:35",
            "priority": "High"
        },
        "expected_outcomes": [
            {"slot": "10:00–12:00", "conflicts": 3, "delay": "30 mins", "score": 45, "verdict": "High Congestion"},
            {"slot": "12:00–14:00", "conflicts": 1, "delay": "10 mins", "score": 75, "verdict": "Moderate Congestion"},
            {"slot": "14:00–16:00", "conflicts": 0, "delay": "0 mins", "score": 95, "verdict": "RECOMMENDED"}
        ]
    }
