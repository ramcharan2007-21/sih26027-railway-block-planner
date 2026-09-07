from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class PriorityEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class TrainTypeEnum(str, Enum):
    VANDE_BHARAT = "Vande Bharat"
    RAJDHANI = "Rajdhani"
    EXPRESS = "Superfast Express"
    PASSENGER = "Passenger"
    FREIGHT = "Freight / Goods"

class AssetTypeEnum(str, Enum):
    SIGNAL = "Signal"
    TRACK = "Track"
    SWITCH_POINT = "Point / Switch"
    BRIDGE = "Bridge"
    OHE = "Overhead Equipment (OHE)"
    INTERLOCKING = "Interlocking"

class AssetConditionEnum(str, Enum):
    GOOD = "Good"
    NEEDS_INSPECTION = "Needs Inspection"
    NEEDS_REPAIR = "Needs Repair"
    CRITICAL = "Critical"

class AssetStatusEnum(str, Enum):
    OPERATIONAL = "Operational"
    MAINTENANCE_REQUIRED = "Maintenance Required"
    UNDER_MAINTENANCE = "Under Maintenance"

class MaintenanceStatusEnum(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    REJECTED = "Rejected"

class BlockStatusEnum(str, Enum):
    PLANNED = "Planned"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class SectionStatusEnum(str, Enum):
    AVAILABLE = "Available"
    MAINTENANCE_PLANNED = "Maintenance Planned"
    BLOCKED = "Blocked"
    TRAIN_ACTIVE = "Train Movement"

# --- Models for Trains ---
class TrainBase(BaseModel):
    train_no: str
    train_name: str
    source: str
    destination: str
    section_id: str
    arrival_time: str   # HH:MM
    departure_time: str # HH:MM
    priority: PriorityEnum = PriorityEnum.HIGH
    train_type: TrainTypeEnum = TrainTypeEnum.EXPRESS

class TrainCreate(TrainBase):
    pass

class Train(TrainBase):
    id: int

# --- Models for Assets ---
class AssetBase(BaseModel):
    asset_id: str
    name: str
    asset_type: AssetTypeEnum
    section_id: str
    condition: AssetConditionEnum = AssetConditionEnum.GOOD
    status: AssetStatusEnum = AssetStatusEnum.OPERATIONAL
    priority: PriorityEnum = PriorityEnum.MEDIUM
    last_inspected: Optional[str] = None
    health_index: int = 100 # 0-100%

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int

# --- Models for Railway Sections ---
class SectionBase(BaseModel):
    section_id: str
    name: str
    from_station: str
    to_station: str
    length_km: float
    track_type: str = "Double Electrified"
    max_speed_kmh: int = 130
    status: SectionStatusEnum = SectionStatusEnum.AVAILABLE

class Section(SectionBase):
    id: int
    asset_count: Optional[int] = 0
    active_trains_count: Optional[int] = 0
    pending_maintenance_count: Optional[int] = 0

# --- Models for Maintenance Requests ---
class MaintenanceRequestBase(BaseModel):
    request_id: str
    asset_id: str
    asset_type: str
    section_id: str
    maintenance_type: str
    required_duration: float # hours
    priority: PriorityEnum = PriorityEnum.HIGH
    requested_date: str
    status: MaintenanceStatusEnum = MaintenanceStatusEnum.PENDING
    created_by: Optional[str] = "SSE / Signal"

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequest(MaintenanceRequestBase):
    id: int

# --- Models for Blocks ---
class BlockBase(BaseModel):
    block_id: str
    request_id: Optional[str] = None
    section_id: str
    asset_id: Optional[str] = None
    start_time: str # HH:MM
    end_time: str   # HH:MM
    date: str
    status: BlockStatusEnum = BlockStatusEnum.PLANNED
    maintenance_team: str
    approved_by: Optional[str] = "Chief Controller"
    conflicts_avoided: int = 0
    expected_delay_min: int = 0
    optimization_score: int = 85

class BlockCreate(BlockBase):
    pass

class Block(BlockBase):
    id: int

# --- Conflict Models ---
class ConflictItem(BaseModel):
    conflict_id: str
    conflict_type: str
    severity: str
    section_id: str
    time: str
    description: str
    train_no: Optional[str] = None
    asset_id: Optional[str] = None
    suggested_action: str

# --- Optimizer Models ---
class SlotEvaluationRequest(BaseModel):
    request_id: Optional[str] = None
    asset_id: Optional[str] = None
    section_id: Optional[str] = None
    duration_hours: Optional[float] = 2.0
    date: Optional[str] = "2026-09-08"

class ConflictDetail(BaseModel):
    train_no: str
    train_name: str
    train_type: str
    scheduled_time: str
    priority: str
    potential_delay_min: int

class CandidateSlot(BaseModel):
    slot_id: str
    start_time: str
    end_time: str
    duration_hours: float
    train_conflicts_count: int
    conflicting_trains: List[ConflictDetail]
    expected_delay_min: int
    optimization_score: int
    is_recommended: bool
    status: str
    reasons: List[str]
    score_breakdown: Dict[str, Any]

class OptimizationResult(BaseModel):
    request_id: str
    asset_id: str
    asset_name: str
    section_id: str
    section_name: str
    work: str
    duration_hours: float
    priority: str
    recommended_slot: CandidateSlot
    all_evaluated_slots: List[CandidateSlot]
    summary_message: str
    ai_rationale: str
