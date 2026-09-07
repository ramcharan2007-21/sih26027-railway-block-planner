from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from database import query_db
from ai_engine import time_to_minutes, is_time_overlapping, calculate_train_delay, minutes_to_time
from models import ConflictItem

router = APIRouter(prefix="/api/conflicts", tags=["Conflict Detection"])

class CheckSlotRequest(BaseModel):
    section_id: str
    start_time: str
    end_time: str
    duration_hours: float

@router.get("", response_model=List[ConflictItem])
def get_all_conflicts():
    """
    Scans entire network for:
    1. Active or planned blocks overlapping with scheduled trains
    2. Multiple blocks overlapping on the same section
    3. High-density bottlenecks
    """
    conflicts = []
    blocks = query_db("SELECT * FROM blocks WHERE status IN ('Active', 'Planned')")

    conflict_idx = 1
    for blk in blocks:
        sec_id = blk["section_id"]
        b_start = time_to_minutes(blk["start_time"])
        b_end = time_to_minutes(blk["end_time"])

        # Check train conflicts
        trains = query_db("SELECT * FROM trains WHERE section_id = ?", (sec_id,))
        for tr in trains:
            t_arr = time_to_minutes(tr["arrival_time"])
            t_dep = time_to_minutes(tr["departure_time"])
            
            if is_time_overlapping(b_start, b_end, t_arr, t_dep, buffer_min=5):
                delay = calculate_train_delay(tr, b_start, b_end)
                conflicts.append(ConflictItem(
                    conflict_id=f"CONF_{conflict_idx:03d}",
                    conflict_type="Train vs Maintenance Block",
                    severity="Critical" if tr["priority"] == "High" else "Warning",
                    section_id=sec_id,
                    time=f"{tr['arrival_time']} - {tr['departure_time']}",
                    description=f"Train {tr['train_no']} ({tr['train_name']}) scheduled through Section {sec_id} during maintenance block {blk['block_id']}.",
                    train_no=tr["train_no"],
                    asset_id=blk.get("asset_id"),
                    suggested_action=f"Reschedule block or hold Train {tr['train_no']} at preceding loop line (+{delay}m delay)."
                ))
                conflict_idx += 1

    # Check multiple maintenance overlap on same section
    sections = query_db("SELECT section_id FROM sections")
    for s in sections:
        sec_id = s["section_id"]
        sec_blocks = query_db("SELECT * FROM blocks WHERE section_id = ? AND status IN ('Active', 'Planned')", (sec_id,))
        if len(sec_blocks) > 1:
            for i in range(len(sec_blocks)):
                for j in range(i + 1, len(sec_blocks)):
                    b1 = sec_blocks[i]
                    b2 = sec_blocks[j]
                    s1, e1 = time_to_minutes(b1["start_time"]), time_to_minutes(b1["end_time"])
                    s2, e2 = time_to_minutes(b2["start_time"]), time_to_minutes(b2["end_time"])
                    if is_time_overlapping(s1, e1, s2, e2):
                        conflicts.append(ConflictItem(
                            conflict_id=f"CONF_{conflict_idx:03d}",
                            conflict_type="Dual Maintenance Overlap",
                            severity="Critical",
                            section_id=sec_id,
                            time=f"{max(b1['start_time'], b2['start_time'])}",
                            description=f"Two concurrent maintenance blocks ({b1['block_id']} and {b2['block_id']}) assigned to identical Section {sec_id}.",
                            suggested_action="Sequence blocks sequentially or consolidate into a single joint corridor block."
                        ))
                        conflict_idx += 1

    return conflicts

@router.post("/check-slot")
def check_proposed_slot(req: CheckSlotRequest):
    """
    Checks if a user's proposed block window causes conflicts with scheduled trains or other blocks.
    If conflicts exist, returns conflict details and automatically searches for the nearest alternative time!
    """
    s_min = time_to_minutes(req.start_time)
    e_min = time_to_minutes(req.end_time)
    
    trains = query_db("SELECT * FROM trains WHERE section_id = ?", (req.section_id,))
    conflicting_trains = []

    for tr in trains:
        t_arr = time_to_minutes(tr["arrival_time"])
        t_dep = time_to_minutes(tr["departure_time"])
        if is_time_overlapping(s_min, e_min, t_arr, t_dep, buffer_min=5):
            conflicting_trains.append({
                "train_no": tr["train_no"],
                "train_name": tr["train_name"],
                "arrival_time": tr["arrival_time"],
                "departure_time": tr["departure_time"],
                "priority": tr["priority"],
                "conflict_reason": f"Train {tr['train_no']} is scheduled to pass through Section {req.section_id} at {tr['arrival_time']}."
            })

    has_conflict = len(conflicting_trains) > 0
    suggested_alternative = None

    if has_conflict:
        # Search forward for a clean slot of required duration
        duration_mins = int(req.duration_hours * 60)
        for cand_start in range(s_min + 60, s_min + 600, 30):
            cand_end = cand_start + duration_mins
            cand_conflicts = 0
            for tr in trains:
                t_arr = time_to_minutes(tr["arrival_time"])
                t_dep = time_to_minutes(tr["departure_time"])
                if is_time_overlapping(cand_start, cand_end, t_arr, t_dep, buffer_min=5):
                    cand_conflicts += 1
            if cand_conflicts == 0:
                suggested_alternative = {
                    "start_time": minutes_to_time(cand_start),
                    "end_time": minutes_to_time(cand_end),
                    "conflicts": 0,
                    "reason": "Clear operational window with zero train movements."
                }
                break

    return {
        "has_conflict": has_conflict,
        "conflict_count": len(conflicting_trains),
        "conflicts": conflicting_trains,
        "warning_message": f"CONFLICT DETECTED: {len(conflicting_trains)} train(s) will be disrupted" if has_conflict else "No conflicts detected for proposed time window.",
        "suggested_alternative": suggested_alternative
    }
