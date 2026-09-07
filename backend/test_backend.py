import urllib.request
import json
import sys
import os

# Test AI engine directly
sys.path.insert(0, os.path.dirname(__file__))
from ai_engine import run_block_optimization, evaluate_maintenance_slot
from seed_data import seed_database
from database import query_db

print("=== 1. Seeding Database ===")
seed_database()

print("\n=== 2. Testing AI Slot Evaluation for Demo Scenario ===")
# Signal S102 on Section A-B with 2h duration
res = run_block_optimization(
    request_id="MR001",
    asset_id="S102",
    section_id="A-B",
    duration_hours=2.0
)

print(f"Asset: {res['asset_name']}")
print(f"Section: {res['section_name']}")
print(f"Recommended Slot: {res['recommended_slot']['start_time']} - {res['recommended_slot']['end_time']}")
print(f"Score: {res['recommended_slot']['optimization_score']}")
print(f"Train Conflicts: {res['recommended_slot']['train_conflicts_count']}")
print(f"Expected Delay: {res['recommended_slot']['expected_delay_min']} mins")
print(f"AI Rationale: {res['ai_rationale']}")

print("\n=== Candidate Slots Comparison ===")
for s in res['all_evaluated_slots']:
    print(f"  Slot {s['start_time']} - {s['end_time']}: Conflicts={s['train_conflicts_count']}, Delay={s['expected_delay_min']}m, Score={s['optimization_score']}, Status={s['status']}")

# Verify assertions
slot_10_12 = next((s for s in res['all_evaluated_slots'] if s['start_time'] == '10:00'), None)
slot_12_14 = next((s for s in res['all_evaluated_slots'] if s['start_time'] == '12:00'), None)
slot_14_16 = next((s for s in res['all_evaluated_slots'] if s['start_time'] == '14:00'), None)

assert slot_10_12 is not None, "Slot 10:00-12:00 should exist"
assert slot_12_14 is not None, "Slot 12:00-14:00 should exist"
assert slot_14_16 is not None, "Slot 14:00-16:00 should exist"

print("\n[VERIFICATION PASS] Slot 10:00-12:00 has", slot_10_12['train_conflicts_count'], "conflicts, Score:", slot_10_12['optimization_score'])
print("[VERIFICATION PASS] Slot 12:00-14:00 has", slot_12_14['train_conflicts_count'], "conflicts, Score:", slot_12_14['optimization_score'])
print("[VERIFICATION PASS] Slot 14:00-16:00 has", slot_14_16['train_conflicts_count'], "conflicts, Score:", slot_14_16['optimization_score'], "(RECOMMENDED)")

assert res['recommended_slot']['start_time'] == '14:00', "14:00-16:00 MUST be recommended!"
print("\n>>> ALL DEMO SCENARIO LOGIC PERFECTLY VERIFIED! <<<")
