from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models import Train, TrainCreate
from database import query_db, execute_db

router = APIRouter(prefix="/api/trains", tags=["Trains"])

@router.get("", response_model=List[Train])
def get_trains(section_id: Optional[str] = None, priority: Optional[str] = None):
    query = "SELECT * FROM trains WHERE 1=1"
    args = []
    if section_id:
        query += " AND section_id = ?"
        args.append(section_id)
    if priority:
        query += " AND priority = ?"
        args.append(priority)
    query += " ORDER BY arrival_time ASC"
    return query_db(query, tuple(args))

@router.get("/{train_no}")
def get_train_by_no(train_no: str):
    train = query_db("SELECT * FROM trains WHERE train_no = ?", (train_no,), one=True)
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    return train

@router.post("", response_model=Train)
def add_train(train: TrainCreate):
    new_id = execute_db(
        """INSERT INTO trains (train_no, train_name, source, destination, section_id, arrival_time, departure_time, priority, train_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (train.train_no, train.train_name, train.source, train.destination, train.section_id, 
         train.arrival_time, train.departure_time, train.priority.value, train.train_type.value)
    )
    return query_db("SELECT * FROM trains WHERE id = ?", (new_id,), one=True)

@router.put("/{id}", response_model=Train)
def update_train(id: int, train: TrainCreate):
    existing = query_db("SELECT * FROM trains WHERE id = ?", (id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Train not found")
    
    execute_db(
        """UPDATE trains SET train_no=?, train_name=?, source=?, destination=?, section_id=?, 
           arrival_time=?, departure_time=?, priority=?, train_type=? WHERE id=?""",
        (train.train_no, train.train_name, train.source, train.destination, train.section_id, 
         train.arrival_time, train.departure_time, train.priority.value, train.train_type.value, id)
    )
    return query_db("SELECT * FROM trains WHERE id = ?", (id,), one=True)

@router.delete("/{id}")
def delete_train(id: int):
    existing = query_db("SELECT * FROM trains WHERE id = ?", (id,), one=True)
    if not existing:
        raise HTTPException(status_code=404, detail="Train not found")
    execute_db("DELETE FROM trains WHERE id = ?", (id,))
    return {"message": "Train deleted successfully"}
