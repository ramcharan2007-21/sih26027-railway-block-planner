import sqlite3
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "railway.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Sections table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        from_station TEXT NOT NULL,
        to_station TEXT NOT NULL,
        length_km REAL NOT NULL,
        track_type TEXT DEFAULT 'Double Electrified',
        max_speed_kmh INTEGER DEFAULT 130,
        status TEXT DEFAULT 'Available'
    )
    """)

    # Trains table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        train_no TEXT NOT NULL,
        train_name TEXT NOT NULL,
        source TEXT NOT NULL,
        destination TEXT NOT NULL,
        section_id TEXT NOT NULL,
        arrival_time TEXT NOT NULL,
        departure_time TEXT NOT NULL,
        priority TEXT DEFAULT 'High',
        train_type TEXT DEFAULT 'Superfast Express',
        FOREIGN KEY(section_id) REFERENCES sections(section_id)
    )
    """)

    # Assets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        section_id TEXT NOT NULL,
        condition TEXT DEFAULT 'Good',
        status TEXT DEFAULT 'Operational',
        priority TEXT DEFAULT 'Medium',
        last_inspected TEXT,
        health_index INTEGER DEFAULT 100,
        FOREIGN KEY(section_id) REFERENCES sections(section_id)
    )
    """)

    # Maintenance Requests table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maintenance_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id TEXT UNIQUE NOT NULL,
        asset_id TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        section_id TEXT NOT NULL,
        maintenance_type TEXT NOT NULL,
        required_duration REAL NOT NULL,
        priority TEXT DEFAULT 'High',
        requested_date TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_by TEXT DEFAULT 'SSE / Signal',
        FOREIGN KEY(asset_id) REFERENCES assets(asset_id),
        FOREIGN KEY(section_id) REFERENCES sections(section_id)
    )
    """)

    # Blocks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        block_id TEXT UNIQUE NOT NULL,
        request_id TEXT,
        section_id TEXT NOT NULL,
        asset_id TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'Planned',
        maintenance_team TEXT NOT NULL,
        approved_by TEXT DEFAULT 'Chief Controller',
        conflicts_avoided INTEGER DEFAULT 0,
        expected_delay_min INTEGER DEFAULT 0,
        optimization_score INTEGER DEFAULT 85,
        FOREIGN KEY(section_id) REFERENCES sections(section_id)
    )
    """)

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

def query_db(query: str, args: tuple = (), one: bool = False) -> Any:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, args)
    r = cursor.fetchall()
    conn.close()
    if one:
        return dict(r[0]) if r else None
    return [dict(row) for row in r]

def execute_db(query: str, args: tuple = ()) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, args)
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return last_id
