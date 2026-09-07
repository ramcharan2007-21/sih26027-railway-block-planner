from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import Asset, AssetCreate
from database import query_db, execute_db

router = APIRouter(prefix="/api/assets", tags=["Assets"])

@router.get("", response_model=List[Asset])
def get_assets(section_id: Optional[str] = None, status: Optional[str] = None):
    query = "SELECT * FROM assets WHERE 1=1"
    args = []
    if section_id:
        query += " AND section_id = ?"
        args.append(section_id)
    if status:
        query += " AND status = ?"
        args.append(status)
    query += " ORDER BY health_index ASC"
    return query_db(query, tuple(args))

@router.get("/needing-maintenance", response_model=List[Asset])
def get_assets_needing_maintenance():
    return query_db("SELECT * FROM assets WHERE status = 'Maintenance Required' OR condition IN ('Needs Repair', 'Critical')")

@router.get("/{asset_id}")
def get_asset(asset_id: str):
    asset = query_db("SELECT * FROM assets WHERE asset_id = ?", (asset_id,), one=True)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("", response_model=Asset)
def add_asset(asset: AssetCreate):
    existing = query_db("SELECT * FROM assets WHERE asset_id = ?", (asset.asset_id,), one=True)
    if existing:
        raise HTTPException(status_code=400, detail="Asset ID already exists")

    new_id = execute_db(
        """INSERT INTO assets (asset_id, name, asset_type, section_id, condition, status, priority, last_inspected, health_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (asset.asset_id, asset.name, asset.asset_type.value, asset.section_id, asset.condition.value,
         asset.status.value, asset.priority.value, asset.last_inspected, asset.health_index)
    )
    return query_db("SELECT * FROM assets WHERE id = ?", (new_id,), one=True)

@router.put("/{id}", response_model=Asset)
def update_asset(id: int, asset: AssetCreate):
    existing = query_db("SELECT * FROM assets WHERE id = ?", (id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Asset not found")

    execute_db(
        """UPDATE assets SET asset_id=?, name=?, asset_type=?, section_id=?, condition=?, 
           status=?, priority=?, last_inspected=?, health_index=? WHERE id=?""",
        (asset.asset_id, asset.name, asset.asset_type.value, asset.section_id, asset.condition.value,
         asset.status.value, asset.priority.value, asset.last_inspected, asset.health_index, id)
    )
    return query_db("SELECT * FROM assets WHERE id = ?", (id,), one=True)

@router.delete("/{id}")
def delete_asset(id: int):
    existing = query_db("SELECT * FROM assets WHERE id = ?", (id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Asset not found")
    execute_db("DELETE FROM assets WHERE id = ?", (id,))
    return {"message": "Asset deleted successfully"}
