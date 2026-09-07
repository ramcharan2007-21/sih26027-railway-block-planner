from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import Block, BlockCreate
from database import query_db, execute_db

router = APIRouter(prefix="/api/blocks", tags=["Track & Blocks"])

@router.get("", response_model=List[Block])
def get_blocks(section_id: Optional[str] = None, status: Optional[str] = None):
    query = "SELECT * FROM blocks WHERE 1=1"
    args = []
    if section_id:
        query += " AND section_id = ?"
        args.append(section_id)
    if status:
        query += " AND status = ?"
        args.append(status)
    query += " ORDER BY id DESC"
    return query_db(query, tuple(args))

@router.get("/{block_id}")
def get_block(block_id: str):
    blk = query_db("SELECT * FROM blocks WHERE block_id = ?", (block_id,), one=True)
    if not blk:
        raise HTTPException(status_code=404, detail="Block not found")
    return blk

@router.post("", response_model=Block)
def create_or_approve_block(block: BlockCreate):
    # Check if block_id already exists
    existing = query_db("SELECT * FROM blocks WHERE block_id = ?", (block.block_id,), one=True)
    if existing:
        raise HTTPException(status_code=400, detail="Block ID already exists")

    new_id = execute_db(
        """INSERT INTO blocks (block_id, request_id, section_id, asset_id, start_time, end_time, 
           date, status, maintenance_team, approved_by, conflicts_avoided, expected_delay_min, optimization_score)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (block.block_id, block.request_id, block.section_id, block.asset_id, block.start_time,
         block.end_time, block.date, block.status.value, block.maintenance_team, block.approved_by,
         block.conflicts_avoided, block.expected_delay_min, block.optimization_score)
    )

    # Automatically synchronize linked maintenance request
    if block.request_id:
        execute_db(
            "UPDATE maintenance_requests SET status = 'Approved' WHERE request_id = ?",
            (block.request_id,)
        )

    # Automatically set section status to 'Maintenance Planned' or 'Blocked'
    section_status = "Blocked" if block.status.value == "Active" else "Maintenance Planned"
    execute_db(
        "UPDATE sections SET status = ? WHERE section_id = ?",
        (section_status, block.section_id)
    )

    # Update asset status
    if block.asset_id:
        execute_db(
            "UPDATE assets SET status = 'Under Maintenance' WHERE asset_id = ?",
            (block.asset_id,)
        )

    return query_db("SELECT * FROM blocks WHERE id = ?", (new_id,), one=True)

@router.put("/{id}", response_model=Block)
def update_block(id: int, block: BlockCreate):
    existing = query_db("SELECT * FROM blocks WHERE id = ?", (id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Block not found")

    execute_db(
        """UPDATE blocks SET block_id=?, request_id=?, section_id=?, asset_id=?, start_time=?, 
           end_time=?, date=?, status=?, maintenance_team=?, approved_by=?, conflicts_avoided=?, 
           expected_delay_min=?, optimization_score=? WHERE id=?""",
        (block.block_id, block.request_id, block.section_id, block.asset_id, block.start_time,
         block.end_time, block.date, block.status.value, block.maintenance_team, block.approved_by,
         block.conflicts_avoided, block.expected_delay_min, block.optimization_score, id)
    )
    return query_db("SELECT * FROM blocks WHERE id = ?", (id,), one=True)

@router.delete("/{id}")
def delete_block(id: int):
    existing = query_db("SELECT * FROM blocks WHERE id = ?", (id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Block not found")
    
    # Restore section status to Available if no other active/planned blocks
    sec_id = existing["section_id"]
    execute_db("DELETE FROM blocks WHERE id = ?", (id,))
    
    remaining = query_db(
        "SELECT COUNT(*) as c FROM blocks WHERE section_id = ? AND status IN ('Active', 'Planned')",
        (sec_id,),
        one=True
    )["c"]
    if remaining == 0:
        execute_db("UPDATE sections SET status = 'Available' WHERE section_id = ?", (sec_id,))

    return {"message": "Block removed successfully"}
