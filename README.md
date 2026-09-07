# IR-BlockPlan AI - Automated Railway Block Planning System
### Smart India Hackathon 2026 (SIH26027)
**Organization:** Ministry of Railways  
**Problem Statement:** *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*

---

## Executive Summary
Railway maintenance blocks (taking track sections out of commercial service for track tamping, rail replacement, signal overhauls, bridge repairs, and OHE catenary maintenance) are vital for safety and asset reliability. However, manual block planning frequently leads to:
- Severe passenger train delays (holding trains at outer loops or distant junctions).
- Bottlenecks on saturated double/quadruple line corridors.
- Sub-optimal asset utilization and delayed critical repairs.

**IR-BlockPlan AI** automates and optimizes railway block planning. By combining timetable traversal analysis, train priority modeling (Vande Bharat / Rajdhani vs. freight), safety buffers, and multi-objective constraint optimization, it automatically evaluates candidate time windows across a 24-hour cycle, eliminates conflicts, and produces explainable recommendations for Railway Section Controllers.

---

## Key Questions Answered Automatically
1. **Which railway asset needs maintenance?**  
   - Monitored via the Asset Management module across Signals, Tracks, Points/Switches, Bridges, and OHE.
2. **Which railway section is the asset located in?**  
   - Mapped to physical corridors (e.g. Section A-B between Station A / New Delhi and Station B / Ghaziabad).
3. **When should the maintenance block be taken?**  
   - Evaluated across 24-hour candidate slots to recommend zero-conflict or minimum-delay windows (e.g. 14:00–16:00).
4. **How long should the block be provided?**  
   - Dynamically matched to engineering job requirements (e.g., 2.0 hours for Signal S102 relay overhaul).
5. **How can the block be planned with minimum impact on train operations?**  
   - By scoring each slot using a multi-objective function penalizing passenger train disruption and holding delays while rewarding daylight track visibility and asset criticality.

---

## Demo Scenario Walkthrough (SIH26027 Official Specification)

| Parameter | Value |
| :--- | :--- |
| **Section** | Section A-B (New Delhi – Ghaziabad Corridor) |
| **Scheduled Train** | Train 12601 (*Mangalore Mail*), passing Section A-B at **10:30 AM** (Arrival 10:30, Departure 10:35, High Priority) |
| **Target Asset** | Auto Color Light Signal **S102** |
| **Asset Condition** | Needs Repair (Relay overhaul / Health: 42%) |
| **Maintenance Work** | Signal Aspect & Relay Repair (Request ID: `MR001`) |
| **Duration Required**| **2.0 Hours** |

### AI Engine Multi-Slot Evaluation Results:

| Candidate Slot | Train Conflicts | Expected Train Delay | Optimization Score | AI Decision |
| :---: | :---: | :---: | :---: | :---: |
| **10:00 – 12:00** | **3 conflicts** (Train 12004 Shatabdi @ 10:10, Train 12601 Mangalore Mail @ 10:30, Train 22436 Vande Bharat @ 11:15) | **30 minutes** | **45 / 100** | ❌ High Conflict Penalty |
| **12:00 – 14:00** | **1 conflict** (Train 12424 Dibrugarh Rajdhani @ 13:10) | **10 minutes** | **75 / 100** | ⚠ Moderate Delay |
| **14:00 – 16:00** | **0 conflicts** (No scheduled trains on Section A-B) | **0 minutes** | **95 / 100** | ✅ **RECOMMENDED OPTIMUM** |

### Controller Action:
The railway controller reviews the clear mathematical breakdown and reasons, then clicks **[APPROVE BLOCK]**.  
Upon approval:
1. Block is committed to the live **Railway Block Roster** (Status: `Planned`).
2. Linked Maintenance Request `MR001` status transitions to `Approved`.
3. Section A-B status updates to `Maintenance Planned`.
4. Signal S102 transitions to `Under Maintenance`.

---

## Mathematical Scoring & AI Optimization Model

$$\text{Optimization Score} = \text{Base} + P_{\text{asset}} + U_{\text{maint}} + D_{\text{daylight}} - \sum C_{\text{train}} - \sum D_{\text{delay}} - \sum O_{\text{block\_overlap}}$$

### Components:
- **Base Window Score**: 60 points.
- **Asset Priority Bonus ($P_{\text{asset}}$)**: High = +25, Medium = +15, Low = +10.
- **Maintenance Urgency ($U_{\text{maint}}$)**: +15 for pending repairs.
- **Daylight Operational Bonus ($D_{\text{daylight}}$)**: +10 for slots between 08:00 and 18:00 (optimal visibility and maintenance staff availability vs. night work requiring special illumination).
- **Train Conflict Penalty ($\sum C_{\text{train}}$)**:
  - High-priority / Vande Bharat / Rajdhani: **-20 pts** per train
  - Superfast Express: **-12 pts** per train
  - Freight / Local: **-7 pts** per train
- **Delay Penalty ($\sum D_{\text{delay}}$)**: $-0.9 \times \text{delay in minutes}$.
- **Block Overlap Penalty ($\sum O_{\text{block\_overlap}}$)**: **-45 pts** per conflicting maintenance block on the same section.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   React + Vite + Tailwind CSS Frontend                   │
│  (Controller Dashboard, AI Block Planner, Network Map, Gantt, etc.)     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ REST API (JSON)
┌────────────────────────────────────▼─────────────────────────────────────┐
│                        FastAPI Python Backend                            │
│  • Pydantic Schemas  • Auth & RBAC  • REST Endpoints  • CORS             │
├──────────────────────────────────────────────────────────────────────────┤
│                  AI & Optimization / Explainability Engine               │
│  • Multi-Objective Slot Evaluator • Conflict Engine • Delay Estimator     │
├──────────────────────────────────────────────────────────────────────────┤
│                        SQLite Database Engine                            │
│  • Trains • Assets • Sections • Maintenance Requests • Blocks • Users    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```
railway-block-planner/
├── backend/
│   ├── main.py                  # FastAPI server entrypoint
│   ├── database.py              # SQLite schema & database queries
│   ├── models.py                # Pydantic data schemas
│   ├── ai_engine.py             # Multi-objective optimization & explainability
│   ├── seed_data.py             # Realistic Indian Railways simulated dataset
│   ├── test_backend.py          # Backend test verification script
│   ├── requirements.txt         # Python dependencies
│   └── routes/
│       ├── auth.py              # Role-based login (Controller, SSE, Admin)
│       ├── trains.py            # Train schedule CRUD
│       ├── assets.py            # Asset health management
│       ├── sections.py          # Railway sections & map telemetry
│       ├── maintenance.py       # Maintenance requests pipeline
│       ├── blocks.py            # Track blocks roster & approval
│       ├── optimizer.py         # AI slot recommendation endpoints
│       ├── conflicts.py         # Conflict detection & alternative search
│       ├── analytics.py         # Delay & availability metrics
│       └── demo.py              # Reset to official SIH demo state
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── App.jsx              # Main app wrapper with tabbed router
    │   ├── index.css            # Tailwind & railway theme styles
    │   ├── components/
    │   │   ├── Navbar.jsx       # Indian Railways header, IST clock, user pill
    │   │   └── MetricCard.jsx   # KPI metric card widgets
    │   ├── pages/
    │   │   ├── Dashboard.jsx    # Executive control room dashboard
    │   │   ├── BlockPlanner.jsx # AI Planning Hub (SIH showcase feature)
    │   │   ├── RailwayMap.jsx   # Interactive corridor schematic & telemetry
    │   │   ├── Trains.jsx       # Train schedule management
    │   │   ├── Assets.jsx       # Infrastructure asset management
    │   │   ├── Requests.jsx     # Maintenance request pipeline
    │   │   ├── Availability.jsx # 24-hour Gantt timeline visualizer
    │   │   ├── Conflicts.jsx    # Conflict scanner & what-if simulator
    │   │   ├── Analytics.jsx    # Delay reduction & availability charts
    │   │   └── Settings.jsx     # Role switching, weight tuning & IR connectors
    │   └── services/
    │       └── api.js           # Centralized API client
```

---

## Setup & Run Instructions

### Prerequisites
- Python 3.10+ (Python 3.14 compatible)
- Node.js 18+ and npm

### 1. Backend Setup & Launch
```bash
# Navigate to backend directory
cd railway-block-planner/backend

# Install Python requirements
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend will be running at `http://127.0.0.1:8000` (Swagger docs at `http://127.0.0.1:8000/docs`).*

### 2. Frontend Setup & Launch
```bash
# Open a new terminal and navigate to frontend directory
cd railway-block-planner/frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
*Frontend will be running at `http://127.0.0.1:5173`.*

---

## Role-Based Demo Accounts
| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `controller` | `irail2026` | Chief Section Controller | Full authority to review & approve blocks |
| `engineer` | `irail2026` | Sr. Section Engineer (P-Way) | Submit maintenance requests & asset reports |
| `admin` | `irail2026` | System Administrator | Calibrate solver weights & system maintenance |

---

## Indian Railways Enterprise Integration Readiness
Designed for zero-friction integration with existing Centre for Railway Information Systems (CRIS) services:
- **FOIS (Freight Operations Information System)**: Ingests real-time goods rake movements and coal train positioning.
- **COA (Control Office Application)**: Syncs train charting, punctuality logs, and temporary speed restrictions.
- **TMS (Track Management System)**: Direct asset health feed from track recording cars and ultrasonic flaw detection.
