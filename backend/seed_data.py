from database import init_db, execute_db, query_db

def seed_database():
    init_db()
    
    # Clear existing data
    tables = ["trains", "assets", "sections", "maintenance_requests", "blocks", "users"]
    for t in tables:
        execute_db(f"DELETE FROM {t}")
        execute_db(f"DELETE FROM sqlite_sequence WHERE name='{t}'")

    # 1. Sections
    sections = [
        ("A-B", "Section A-B (New Delhi - Ghaziabad)", "Station A (NDLS)", "Station B (GZB)", 28.5, "Double Electrified", 130, "Available"),
        ("B-C", "Section B-C (Ghaziabad - Aligarh)", "Station B (GZB)", "Station C (ALJN)", 106.0, "Double Electrified", 130, "Available"),
        ("C-D", "Section C-D (Aligarh - Kanpur Central)", "Station C (ALJN)", "Station D (CNB)", 210.0, "Double Electrified", 160, "Blocked"),
        ("D-E", "Section D-E (Kanpur - Prayagraj)", "Station D (CNB)", "Station E (PRYJ)", 194.5, "Double Electrified", 160, "Maintenance Planned")
    ]
    for s in sections:
        execute_db(
            """INSERT INTO sections (section_id, name, from_station, to_station, length_km, track_type, max_speed_kmh, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            s
        )

    # 2. Trains
    trains = [
        # Section A-B (Exact SIH Scenario Setup!)
        ("12601", "Mangalore Mail", "Chennai", "Mangalore", "A-B", "10:30", "10:35", "High", "Superfast Express"),
        ("12004", "Lucknow Swarna Shatabdi", "New Delhi", "Lucknow", "A-B", "10:10", "10:15", "High", "Superfast Express"),
        ("22436", "Vande Bharat Express", "New Delhi", "Varanasi", "A-B", "11:15", "11:20", "High", "Vande Bharat"),
        ("12424", "Dibrugarh Rajdhani", "New Delhi", "Dibrugarh", "A-B", "13:10", "13:15", "High", "Rajdhani"),
        ("12566", "Bihar Sampark Kranti", "New Delhi", "Darbhanga", "A-B", "17:00", "17:05", "Medium", "Superfast Express"),
        ("12398", "Mahabodhi Express", "New Delhi", "Gaya", "A-B", "18:20", "18:25", "Medium", "Superfast Express"),
        ("BOXN-401", "Container Cargo Freight", "Tughlakabad", "Dadri", "A-B", "02:30", "03:00", "Low", "Freight / Goods"),

        # Section B-C
        ("14006", "Lichchavi Express", "Anand Vihar", "Sitamarhi", "B-C", "11:45", "11:50", "Medium", "Superfast Express"),
        ("12802", "Purushottam Express", "New Delhi", "Puri", "B-C", "14:20", "14:25", "High", "Superfast Express"),
        ("22416", "Vande Bharat Express (Varanasi)", "New Delhi", "Varanasi", "B-C", "07:10", "07:15", "High", "Vande Bharat"),
        ("BCN-902", "Grain Freight Rake", "Ghaziabad", "Kanpur", "B-C", "03:45", "04:15", "Low", "Freight / Goods"),

        # Section C-D
        ("12314", "Sealdah Rajdhani Express", "New Delhi", "Sealdah", "C-D", "16:30", "16:35", "High", "Rajdhani"),
        ("12302", "Howrah Rajdhani Express", "New Delhi", "Howrah", "C-D", "16:55", "17:00", "High", "Rajdhani"),
        ("12402", "Magadh Express", "New Delhi", "Islampur", "C-D", "20:45", "20:50", "Medium", "Superfast Express"),
        ("BOXN-402", "Coal Rake Northern", "Dadri", "Panki", "C-D", "01:45", "02:30", "Low", "Freight / Goods"),

        # Section D-E
        ("12560", "Shiv Ganga Express", "New Delhi", "Banaras", "D-E", "21:30", "21:35", "High", "Superfast Express"),
        ("12418", "Prayagraj Express", "New Delhi", "Prayagraj", "D-E", "22:45", "22:50", "High", "Superfast Express"),
        ("14164", "Sangam Express", "Meerut City", "Subedarganj", "D-E", "06:15", "06:20", "Medium", "Passenger")
    ]
    for t in trains:
        execute_db(
            """INSERT INTO trains (train_no, train_name, source, destination, section_id, arrival_time, departure_time, priority, train_type)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            t
        )

    # 3. Assets
    assets = [
        ("S102", "Auto Color Light Signal S102", "Signal", "A-B", "Needs Repair", "Maintenance Required", "High", "2026-08-15", 42),
        ("TRK-014", "Turnout Switch Point 14A", "Track", "A-B", "Needs Inspection", "Operational", "Medium", "2026-08-20", 72),
        ("BRG-09", "Yamuna Bridge Substructure Pier 4", "Bridge", "A-B", "Good", "Operational", "Medium", "2026-07-10", 89),
        ("OHE-88", "Catenary Tensioner OHE-88", "Overhead Equipment (OHE)", "B-C", "Needs Repair", "Maintenance Required", "High", "2026-08-12", 51),
        ("SIG-204", "Home Signal SIG-204", "Signal", "B-C", "Good", "Operational", "Low", "2026-08-25", 96),
        ("SW-22", "Electronic Interlocking Point 22B", "Point / Switch", "C-D", "Needs Repair", "Maintenance Required", "High", "2026-08-18", 47),
        ("TRK-108", "High Speed Track Joint 108", "Track", "C-D", "Good", "Under Maintenance", "Medium", "2026-09-01", 91),
        ("OHE-142", "OHE Mast Insulator 142", "Overhead Equipment (OHE)", "D-E", "Needs Inspection", "Maintenance Required", "Medium", "2026-08-05", 64),
        ("BRG-15", "Ganga Bridge Steel Truss BR-15", "Bridge", "D-E", "Good", "Operational", "High", "2026-07-28", 85)
    ]
    for a in assets:
        execute_db(
            """INSERT INTO assets (asset_id, name, asset_type, section_id, condition, status, priority, last_inspected, health_index)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            a
        )

    # 4. Maintenance Requests
    requests = [
        ("MR001", "S102", "Signal", "A-B", "Signal Aspect & Relay Repair", 2.0, "High", "2026-09-08", "Pending", "SSE / Signal GZB"),
        ("MR002", "OHE-88", "Overhead Equipment (OHE)", "B-C", "Catenary Wire Splicing & Re-tensioning", 3.0, "High", "2026-09-08", "Pending", "SSE / Electrical ALJN"),
        ("MR003", "SW-22", "Point / Switch", "C-D", "Point Motor Servicing & Lubrication", 1.5, "High", "2026-09-08", "Pending", "SSE / P-Way Tundla"),
        ("MR004", "OHE-142", "Overhead Equipment (OHE)", "D-E", "Insulator Replacement & Cleaning", 2.0, "Medium", "2026-09-08", "Approved", "SSE / TRD Prayagraj")
    ]
    for r in requests:
        execute_db(
            """INSERT INTO maintenance_requests (request_id, asset_id, asset_type, section_id, maintenance_type, required_duration, priority, requested_date, status, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            r
        )

    # 5. Blocks
    blocks = [
        ("BLK-081", "MR004", "C-D", "TRK-108", "01:30", "04:30", "2026-09-08", "Active", "SSE Permanent Way Kanpur", "Chief Controller", 4, 0, 92),
        ("BLK-082", "MR004", "D-E", "OHE-142", "23:30", "01:30", "2026-09-08", "Planned", "OHE Maintenance Prayagraj", "Chief Controller", 2, 0, 88)
    ]
    for b in blocks:
        execute_db(
            """INSERT INTO blocks (block_id, request_id, section_id, asset_id, start_time, end_time, date, status, maintenance_team, approved_by, conflicts_avoided, expected_delay_min, optimization_score)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            b
        )

    # 6. Users
    users = [
        ("controller", "irail2026", "Rajesh Sharma (Chief Section Controller)", "Controller"),
        ("cohost", "irail2026", "Co-Host Controller (Joint Operations)", "Co-Host Controller"),
        ("engineer", "irail2026", "Vikram Patel (Sr. Section Engineer - P-Way)", "Maintenance Engineer"),
        ("admin", "irail2026", "Priya Nair (System Administrator)", "Admin")
    ]
    for u in users:
        execute_db(
            """INSERT INTO users (username, password, full_name, role)
               VALUES (?, ?, ?, ?)""",
            u
        )

    print("Database seeded successfully with realistic Indian Railways demo data!")

if __name__ == "__main__":
    seed_database()
