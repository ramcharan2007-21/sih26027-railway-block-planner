from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from models import Section, SectionBase
from database import query_db, execute_db

router = APIRouter(prefix="/api/sections", tags=["Sections & Map"])

@router.get("", response_model=List[Section])
def get_sections():
    sections = query_db("SELECT * FROM sections")
    result = []
    for s in sections:
        sec_id = s["section_id"]
        asset_count = query_db("SELECT COUNT(*) as c FROM assets WHERE section_id = ?", (sec_id,), one=True)["c"]
        train_count = query_db("SELECT COUNT(*) as c FROM trains WHERE section_id = ?", (sec_id,), one=True)["c"]
        pending_maint = query_db(
            "SELECT COUNT(*) as c FROM maintenance_requests WHERE section_id = ? AND status = 'Pending'",
            (sec_id,),
            one=True
        )["c"]
        
        sec_dict = dict(s)
        sec_dict["asset_count"] = asset_count
        sec_dict["active_trains_count"] = train_count
        sec_dict["pending_maintenance_count"] = pending_maint
        result.append(sec_dict)
    return result

@router.get("/{section_id}")
def get_section_detail(section_id: str):
    section = query_db("SELECT * FROM sections WHERE section_id = ?", (section_id,), one=True)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    assets = query_db("SELECT * FROM assets WHERE section_id = ?", (section_id,))
    trains = query_db("SELECT * FROM trains WHERE section_id = ? ORDER BY arrival_time ASC", (section_id,))
    requests = query_db("SELECT * FROM maintenance_requests WHERE section_id = ?", (section_id,))
    blocks = query_db("SELECT * FROM blocks WHERE section_id = ?", (section_id,))

    return {
        "section": section,
        "assets": assets,
        "trains": trains,
        "maintenance_requests": requests,
        "blocks": blocks,
        "availability": "Available" if section["status"] == "Available" else section["status"]
    }

@router.put("/{section_id}/status")
def update_section_status(section_id: str, status: str):
    existing = query_db("SELECT * FROM sections WHERE section_id = ?", (section_id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Section not found")
    
    execute_db("UPDATE sections SET status = ? WHERE section_id = ?", (status, section_id))
    return {"message": f"Section {section_id} status updated to {status}"}
