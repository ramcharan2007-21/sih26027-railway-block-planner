from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import MaintenanceRequest, MaintenanceRequestCreate
from database import query_db, execute_db

router = APIRouter(prefix="/api/maintenance-requests", tags=["Maintenance Requests"])

@router.get("", response_model=List[MaintenanceRequest])
def get_maintenance_requests(section_id: Optional[str] = None, status: Optional[str] = None):
    query = "SELECT * FROM maintenance_requests WHERE 1=1"
    args = []
    if section_id:
        query += " AND section_id = ?"
        args.append(section_id)
    if status:
        query += " AND status = ?"
        args.append(status)
    query += " ORDER BY id DESC"
    return query_db(query, tuple(args))

@router.get("/{request_id}")
def get_maintenance_request(request_id: str):
    req = query_db("SELECT * FROM maintenance_requests WHERE request_id = ?", (request_id,), one=True)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    return req

@router.post("", response_model=MaintenanceRequest)
def create_maintenance_request(req: MaintenanceRequestCreate):
    existing = query_db("SELECT * FROM maintenance_requests WHERE request_id = ?", (req.request_id,), one=True)
    if existing:
        raise HTTPException(status_code=400, detail="Request ID already exists")

    new_id = execute_db(
        """INSERT INTO maintenance_requests (request_id, asset_id, asset_type, section_id, maintenance_type, 
           required_duration, priority, requested_date, status, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (req.request_id, req.asset_id, req.asset_type, req.section_id, req.maintenance_type,
         req.required_duration, req.priority.value, req.requested_date, req.status.value, req.created_by)
    )
    
    # Update asset status if needed
    execute_db(
        "UPDATE assets SET status = 'Maintenance Required' WHERE asset_id = ?",
        (req.asset_id,)
    )

    return query_db("SELECT * FROM maintenance_requests WHERE id = ?", (new_id,), one=True)

@router.put("/{id}", response_model=MaintenanceRequest)
def update_maintenance_request(id: int, req: MaintenanceRequestCreate):
    existing = query_db("SELECT * FROM maintenance_requests WHERE id = ?", (id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Request not found")

    execute_db(
        """UPDATE maintenance_requests SET request_id=?, asset_id=?, asset_type=?, section_id=?, 
           maintenance_type=?, required_duration=?, priority=?, requested_date=?, status=?, created_by=?
           WHERE id=?""",
        (req.request_id, req.asset_id, req.asset_type, req.section_id, req.maintenance_type,
         req.required_duration, req.priority.value, req.requested_date, req.status.value, req.created_by, id)
    )
    return query_db("SELECT * FROM maintenance_requests WHERE id = ?", (id,), one=True)

@router.delete("/{id}")
def delete_maintenance_request(id: int):
    existing = query_db("SELECT * FROM maintenance_requests WHERE id = ?", (id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Request not found")
    execute_db("DELETE FROM maintenance_requests WHERE id = ?", (id,))
    return {"message": "Maintenance request deleted successfully"}
