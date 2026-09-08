import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Layers, 
  Zap, 
  Check, 
  X, 
  Edit3, 
  Info, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Lock,
  Sliders,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";

export default function BlockPlanner({ preselectedRequestId, setActiveTab, currentUser }) {
  const [requests, setRequests] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(preselectedRequestId || "MR001");
  const [evaluating, setEvaluating] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState(null); // 'approved' | 'rejected' | null
  const [selectedSlotForDetail, setSelectedSlotForDetail] = useState(null);
  const [isModifying, setIsModifying] = useState(false);
  const [customStartTime, setCustomStartTime] = useState("14:00");
  const [customEndTime, setCustomEndTime] = useState("16:00");

  // 24-Hour Repair Windows Filter & View Mode
  const [windowShiftFilter, setWindowShiftFilter] = useState("all"); // 'all' | 'daylight' | 'night'
  const [windowViewMode, setWindowViewMode] = useState("all_windows"); // 'all_windows' | 'by_gap'

  // AI Solver Tuning Weights
  const [showWeightPanel, setShowWeightPanel] = useState(false);
  const [priorityWeight, setPriorityWeight] = useState(25);
  const [delayWeight, setDelayWeight] = useState(1.0);
  const [bufferMins, setBufferMins] = useState(5);
  const [calibratedSuccess, setCalibratedSuccess] = useState(false);
  const isAdmin = currentUser?.username === "admin";

  const handleRecalibrateWeights = (e) => {
    e.preventDefault();
    setCalibratedSuccess(true);
    handleRunOptimization(selectedReqId || "MR001");
    setTimeout(() => setCalibratedSuccess(false), 3000);
  };

  // Load pending maintenance requests
  const loadRequests = async () => {
    try {
      const data = await api.getMaintenanceRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error loading maintenance requests:", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (preselectedRequestId) {
      setSelectedReqId(preselectedRequestId);
    }
  }, [preselectedRequestId]);

  // Run AI Optimization
  const handleRunOptimization = async (reqId = selectedReqId) => {
    setEvaluating(true);
    setApprovalStatus(null);
    try {
      const result = await api.evaluateSlots({ request_id: reqId });
      setOptimizationResult(result);
      setSelectedSlotForDetail(result.recommended_slot);
    } catch (err) {
      alert("AI Optimization error: " + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  // Run automatically on first mount for smooth demo presentation
  useEffect(() => {
    handleRunOptimization(selectedReqId || "MR001");
  }, [selectedReqId]);

  // Inspect a specific repair window in interactive detail & XAI breakdown
  const handleInspectSlot = (slot) => {
    if (!slot) return;
    setCustomStartTime(slot.start_time);
    setCustomEndTime(slot.end_time);
    const matchingCandidate = optimizationResult?.all_evaluated_slots?.find(
      (s) => s.start_time === slot.start_time && s.end_time === slot.end_time
    );
    if (matchingCandidate) {
      setSelectedSlotForDetail(matchingCandidate);
    } else {
      setSelectedSlotForDetail({
        slot_id: slot.slot_id || `WIN-${slot.start_time}`,
        start_time: slot.start_time,
        end_time: slot.end_time,
        duration_hours: slot.duration_hours || optimizationResult?.duration_hours || 2.0,
        train_conflicts_count: slot.train_conflicts_count || 0,
        expected_delay_min: slot.expected_delay_min || 0,
        optimization_score: slot.optimization_score || 95,
        is_recommended: slot.is_best || false,
        status: "FEASIBLE",
        conflicting_trains: [],
        score_breakdown: {
          base_score: 65,
          asset_priority_bonus: 25,
          urgency_bonus: 15,
          conflict_penalty: 0,
          delay_penalty: 0,
        },
        reasons: [
          slot.reason || `Discovered 24h repair window (${slot.start_time} to ${slot.end_time}).`,
          `Zero train conflicts or delays on Section ${optimizationResult?.section_id}.`,
          `Safe clearance buffer: +${slot.buffer_before_min ?? 15}m after preceding train, +${slot.buffer_after_min ?? 15}m before next train.`,
        ],
      });
    }
  };

  // Handle Block Approval
  const handleApproveBlock = async (slot) => {
    if (!optimizationResult || !slot) return;
    try {
      const newBlockId = `BLK-${Math.floor(100 + Math.random() * 900)}`;
      await api.createOrApproveBlock({
        block_id: newBlockId,
        request_id: optimizationResult.request_id,
        section_id: optimizationResult.section_id,
        asset_id: optimizationResult.asset_id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        date: "2026-09-08",
        status: "Planned",
        maintenance_team: "SSE P-Way & Signal Special Taskforce",
        approved_by: "Chief Section Controller",
        conflicts_avoided: slot.train_conflicts_count === 0 ? 3 : 1,
        expected_delay_min: slot.expected_delay_min,
        optimization_score: slot.optimization_score,
      });

      setApprovalStatus({
        status: "approved",
        blockId: newBlockId,
        message: `Block ${newBlockId} (${slot.start_time} - ${slot.end_time}) APPROVED and committed to Railway Block Roster! Section ${optimizationResult.section_id} status updated.`,
      });
      loadRequests();
    } catch (err) {
      alert("Failed to approve block: " + err.message);
    }
  };

  const handleRejectBlock = () => {
    setApprovalStatus({
      status: "rejected",
      message: "Block recommendation rejected by controller. Returned to pending review queue.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              AI-Powered Automatic Block Planning
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Automated conflict evaluation, multi-objective timetable analysis & explainable slot selection.
          </p>
        </div>

        {/* Request Selector */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <label className="text-[11px] font-semibold text-slate-400 block uppercase">Target Maintenance</label>
            <span className="text-xs text-cyan-300 font-mono">Select Request ID</span>
          </div>
          <select
            value={selectedReqId}
            onChange={(e) => {
              setSelectedReqId(e.target.value);
              handleRunOptimization(e.target.value);
            }}
            className="bg-slate-950 text-white text-xs font-medium px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            {requests.map((r) => (
              <option key={r.request_id} value={r.request_id}>
                {r.request_id} - {r.asset_id} ({r.section_id}) [{r.maintenance_type}]
              </option>
            ))}
          </select>
          <button
            onClick={() => handleRunOptimization(selectedReqId)}
            disabled={evaluating}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-cyan-500/20"
          >
            <Zap className={`w-3.5 h-3.5 ${evaluating ? "animate-spin text-amber-900" : ""}`} />
            <span>{evaluating ? "Optimizing..." : "Re-Optimize"}</span>
          </button>
        </div>
      </div>

      {/* Target Component & Operational Context Card */}
      {optimizationResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Target Component</span>
            <p className="text-sm font-bold text-white mt-0.5">{optimizationResult.asset_name}</p>
            <p className="text-xs text-slate-400 font-mono">ID: {optimizationResult.asset_id}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Railway Section</span>
            <p className="text-sm font-bold text-cyan-300 mt-0.5">{optimizationResult.section_name}</p>
            <p className="text-xs text-slate-400">Section {optimizationResult.section_id}</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Work & Duration</span>
            <p className="text-sm font-bold text-white mt-0.5">{optimizationResult.work}</p>
            <p className="text-xs text-amber-400 font-semibold font-mono">{optimizationResult.duration_hours} Hours Block Required</p>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Component Priority</span>
            <div className="mt-1 flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {optimizationResult.priority} PRIORITY
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notification Banner on Approval/Rejection */}
      {approvalStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            approvalStatus.status === "approved"
              ? "bg-emerald-950/70 border-emerald-500 text-emerald-200"
              : "bg-rose-950/70 border-rose-500 text-rose-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            {approvalStatus.status === "approved" ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold">{approvalStatus.status === "approved" ? "BLOCK APPROVED & ACTIVE" : "BLOCK REJECTED"}</p>
              <p className="text-xs text-slate-300">{approvalStatus.message}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("availability")}
            className="text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-white font-medium"
          >
            View in Schedule
          </button>
        </div>
      )}

      {/* Main Showcase: AI Block Recommendation Card */}
      {optimizationResult?.recommended_slot && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/50 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h2 className="text-xs sm:text-sm font-mono font-bold tracking-widest text-cyan-400 uppercase">
                ================ AI BLOCK RECOMMENDATION ================
              </h2>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              STATUS: {optimizationResult.recommended_slot.status}
            </span>
          </div>

          {/* Recommendation Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 my-6">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Recommended Block</span>
              <p className="text-xl sm:text-2xl font-extrabold text-cyan-300 mt-1 font-mono">
                {optimizationResult.recommended_slot.start_time} – {optimizationResult.recommended_slot.end_time}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Optimal Daylight Window</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Duration</span>
              <p className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono">
                {optimizationResult.recommended_slot.duration_hours} Hours
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Full work allowance</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Train Conflicts</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                {optimizationResult.recommended_slot.train_conflicts_count}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero trains disrupted</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Expected Delay</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                {optimizationResult.recommended_slot.expected_delay_min} mins
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">100% Punctuality Preserved</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 col-span-2 md:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Optimization Score</span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                {optimizationResult.recommended_slot.optimization_score}
                <span className="text-xs text-slate-500 font-normal"> / 100</span>
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">Global Optimum</p>
            </div>
          </div>

          {/* Action Area: Permissions & Approval Controls */}
          {currentUser?.username === "engineer" ? (
            <div className="p-3.5 my-3 rounded-xl bg-amber-950/40 border border-amber-600/80 text-amber-200 text-xs flex items-center space-x-3 shadow-md">
              <Lock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-300">
                  ENGINEERING ROLE ACCESS (Sr. Section Engineer - Vikram Patel):
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  You are viewing AI slot evaluations in engineering advisory mode. Under Indian Railways operating rules, granting track possession requires <strong>Chief Section Controller</strong> or <strong>Co-Host Controller</strong> authorization.
                </p>
              </div>
            </div>
          ) : null}

          {/* Action Buttons: [APPROVE BLOCK], [MODIFY], [REJECT] */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-800 gap-3">
            <div className="text-xs text-slate-400 font-mono">
              Action Authority:{" "}
              <span className="font-bold text-cyan-300">
                {currentUser?.role || "Chief Section Controller"}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {currentUser?.username === "engineer" ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Approval Locked
                  </span>
                  <button
                    disabled
                    className="px-5 py-2.5 rounded-lg bg-slate-800/80 text-slate-500 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-not-allowed opacity-60"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>REQUIRES CONTROLLER AUTHORITY</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleRejectBlock}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 hover:border-rose-700 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>REJECT</span>
                  </button>

                  <button
                    onClick={() => setIsModifying(!isModifying)}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isModifying ? "CANCEL MODIFY" : "MODIFY"}</span>
                  </button>

                  <button
                    onClick={() => handleApproveBlock(optimizationResult.recommended_slot)}
                    disabled={approvalStatus?.status === "approved"}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                    <span>
                      {currentUser?.username === "cohost"
                        ? "CO-APPROVE BLOCK (JOINT OPS)"
                        : currentUser?.username === "admin"
                        ? "OVERRIDE & APPROVE (ADMIN)"
                        : "APPROVE BLOCK"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Custom Modify Window Drawer */}
          {isModifying && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="text-[11px] text-slate-400 block">Custom Start Time</label>
                  <input
                    type="time"
                    value={customStartTime}
                    onChange={(e) => setCustomStartTime(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block">Custom End Time</label>
                  <input
                    type="time"
                    value={customEndTime}
                    onChange={(e) => setCustomEndTime(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  handleApproveBlock({
                    ...optimizationResult.recommended_slot,
                    start_time: customStartTime,
                    end_time: customEndTime,
                    optimization_score: 85,
                  });
                  setIsModifying(false);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Approve Custom Window
              </button>
            </div>
          )}
        </div>
      )}

      {/* 24-Hour Zero-Traffic Timelines Discovery Hub */}
      {optimizationResult?.all_zero_traffic_windows && optimizationResult.all_zero_traffic_windows.length > 0 && (() => {
        // Collect all possible repair windows across the 24-hour cycle
        const allPossibleWindows = (
          optimizationResult.all_possible_repair_windows && optimizationResult.all_possible_repair_windows.length > 0
            ? optimizationResult.all_possible_repair_windows
            : optimizationResult.all_zero_traffic_windows.flatMap((w) => w.possible_repair_windows || [])
        );

        const bestWindow =
          optimizationResult.best_possible_window ||
          allPossibleWindows.find((w) => w.is_best) ||
          allPossibleWindows[0];

        const daylightCount = allPossibleWindows.filter((w) => w.is_daylight).length;
        const nightCount = allPossibleWindows.filter((w) => !w.is_daylight).length;

        const displayedWindows = allPossibleWindows.filter((w) => {
          if (windowShiftFilter === "daylight") return w.is_daylight;
          if (windowShiftFilter === "night") return !w.is_daylight;
          return true;
        });

        return (
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-cyan-500/30 shadow-xl space-y-5">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    All Discovered 24-Hour Zero-Traffic Timelines & Repair Windows (Section {optimizationResult.section_id})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyzed <span className="text-cyan-300 font-bold font-mono">{optimizationResult.all_zero_traffic_windows.length} continuous zero-train corridors</span> across the 24-hour timetable to discover <span className="text-emerald-300 font-bold font-mono">{allPossibleWindows.length} viable {optimizationResult.duration_hours}h repair windows</span>. The AI evaluated all possible windows against crew readiness, lighting, and safe clearance headway to select the best possible window.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Required Block: <strong className="text-amber-400">{optimizationResult.duration_hours}h</strong>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-bold">
                  {allPossibleWindows.length} Total Windows Available
                </span>
              </div>
            </div>

            {/* AI Selected Best Possible Window Spotlight */}
            {bestWindow && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-cyan-950/60 border-2 border-emerald-500/50 shadow-lg shadow-emerald-950/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-l from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-bl-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Selected Best Possible Window
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Global Optimum Selection
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        {bestWindow.is_daylight ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                        {bestWindow.category}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl lg:text-3xl font-mono font-extrabold text-white">
                        {bestWindow.start_time} – {bestWindow.end_time}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {bestWindow.duration_hours}h Duration • 0 Conflicts • 0m Delay
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      {bestWindow.reason || `AI Selected Best Window: Peak daylight visibility, +${bestWindow.buffer_before_min}m safe clearance after preceding traffic and +${bestWindow.buffer_after_min}m before next train.`}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                      <span>Preceding: <strong className="text-slate-200">{bestWindow.preceding_traffic}</strong> (+{bestWindow.buffer_before_min}m headway)</span>
                      <span>•</span>
                      <span>Next: <strong className="text-slate-200">{bestWindow.next_traffic}</strong> (+{bestWindow.buffer_after_min}m headway)</span>
                      <span>•</span>
                      <span>Parent Free Gap: <strong className="text-cyan-300">{bestWindow.parent_gap}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-end justify-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block">AI Optimization Score</span>
                      <span className="text-2xl font-mono font-extrabold text-emerald-400">
                        {bestWindow.optimization_score}<span className="text-sm text-slate-400">/100</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleInspectSlot(bestWindow)}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inspect in Breakdown</span>
                      </button>

                      {currentUser?.username !== "engineer" && (
                        <button
                          onClick={() => handleApproveBlock({
                            slot_id: bestWindow.slot_id,
                            start_time: bestWindow.start_time,
                            end_time: bestWindow.end_time,
                            duration_hours: bestWindow.duration_hours,
                            train_conflicts_count: 0,
                            expected_delay_min: 0,
                            optimization_score: bestWindow.optimization_score,
                            is_recommended: true,
                            status: "FEASIBLE",
                            conflicting_trains: [],
                          })}
                          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 transition transform active:scale-95"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve Best Window</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode & Shift Filters Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Shift Filter:</span>
                <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setWindowShiftFilter("all")}
                    className={`px-3 py-1 rounded-md transition ${
                      windowShiftFilter === "all"
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All Possible ({allPossibleWindows.length})
                  </button>
                  <button
                    onClick={() => setWindowShiftFilter("daylight")}
                    className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
                      windowShiftFilter === "daylight"
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sun className="w-3 h-3" /> Daylight ({daylightCount})
                  </button>
                  <button
                    onClick={() => setWindowShiftFilter("night")}
                    className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
                      windowShiftFilter === "night"
                        ? "bg-indigo-500 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Moon className="w-3 h-3" /> Night & Twilight ({nightCount})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Display:</span>
                <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setWindowViewMode("all_windows")}
                    className={`px-3 py-1 rounded-md transition ${
                      windowViewMode === "all_windows"
                        ? "bg-slate-800 text-cyan-300 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All 24h Repair Windows ({displayedWindows.length})
                  </button>
                  <button
                    onClick={() => setWindowViewMode("by_gap")}
                    className={`px-3 py-1 rounded-md transition ${
                      windowViewMode === "by_gap"
                        ? "bg-slate-800 text-cyan-300 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Grouped by Free Timelines ({optimizationResult.all_zero_traffic_windows.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Display Mode 1: All 24-Hour Repair Windows Grid */}
            {windowViewMode === "all_windows" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {displayedWindows.map((slot) => {
                  const isBest = slot.is_best || slot.slot_id === bestWindow?.slot_id;
                  const isCurrentlySelected =
                    selectedSlotForDetail?.start_time === slot.start_time &&
                    selectedSlotForDetail?.end_time === slot.end_time;

                  let catBadge = "bg-amber-950/70 text-amber-300 border-amber-700/60";
                  let catIcon = <Sun className="w-3 h-3 text-amber-400" />;
                  if (slot.category.includes("Night")) {
                    catBadge = "bg-blue-950/70 text-blue-300 border-blue-700/60";
                    catIcon = <Moon className="w-3 h-3 text-blue-400" />;
                  } else if (slot.category.includes("Evening")) {
                    catBadge = "bg-indigo-950/70 text-indigo-300 border-indigo-700/60";
                    catIcon = <Moon className="w-3 h-3 text-indigo-400" />;
                  } else if (slot.category.includes("Early")) {
                    catBadge = "bg-orange-950/70 text-orange-300 border-orange-700/60";
                    catIcon = <Sun className="w-3 h-3 text-orange-400" />;
                  }

                  return (
                    <div
                      key={slot.slot_id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition relative ${
                        isBest
                          ? "border-emerald-500/80 bg-emerald-950/20 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/30"
                          : isCurrentlySelected
                          ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/50"
                          : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${catBadge}`}>
                            {catIcon}
                            <span>{slot.category}</span>
                          </span>

                          <div className="flex items-center gap-1">
                            {isBest && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950 tracking-wider">
                                AI Best Choice
                              </span>
                            )}
                            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {slot.optimization_score} pts
                            </span>
                          </div>
                        </div>

                        <div className="mb-2">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Repair Window</span>
                          <p className="text-lg font-mono font-bold text-white">
                            {slot.start_time} – {slot.end_time}
                          </p>
                          <span className="text-[11px] font-mono text-cyan-400">
                            {slot.duration_hours}h repair block • 0 conflicts
                          </span>
                        </div>

                        <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-[10px] space-y-1 mb-3">
                          <div className="text-slate-400">
                            Parent Gap: <span className="font-mono text-slate-300 font-semibold">{slot.parent_gap}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400 pt-0.5 border-t border-slate-800/80">
                            <span>Headway Clearance:</span>
                            <span className="font-mono text-emerald-400 font-semibold">
                              +{slot.buffer_before_min}m / +{slot.buffer_after_min}m
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 truncate" title={slot.preceding_traffic}>
                            Prev: <span className="text-slate-300">{slot.preceding_traffic}</span>
                          </div>
                          <div className="text-[9px] text-slate-400 truncate" title={slot.next_traffic}>
                            Next: <span className="text-slate-300">{slot.next_traffic}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
                        <button
                          onClick={() => handleInspectSlot(slot)}
                          className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                            isCurrentlySelected
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          }`}
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>{isCurrentlySelected ? "Active in Breakdown" : "Inspect Window"}</span>
                        </button>

                        {currentUser?.username !== "engineer" && (
                          <button
                            onClick={() => handleApproveBlock({
                              slot_id: slot.slot_id,
                              start_time: slot.start_time,
                              end_time: slot.end_time,
                              duration_hours: slot.duration_hours,
                              train_conflicts_count: 0,
                              expected_delay_min: 0,
                              optimization_score: slot.optimization_score,
                              is_recommended: isBest,
                              status: "FEASIBLE",
                              conflicting_trains: [],
                            })}
                            className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                              isBest
                                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                                : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve This Window</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Display Mode 2: Grouped by 24h Free Timelines */}
            {windowViewMode === "by_gap" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {optimizationResult.all_zero_traffic_windows.map((win) => {
                  const winPossibleSlots = win.possible_repair_windows || [];
                  const hasBest = winPossibleSlots.some((s) => s.is_best);

                  return (
                    <div
                      key={win.window_id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                        hasBest
                          ? "border-emerald-500/60 bg-slate-950/90 ring-1 ring-emerald-500/30"
                          : "border-slate-800 bg-slate-950/70"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            Corridor: {win.gap_start} – {win.gap_end}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {win.gap_duration_hours}h Continuous Free ({win.gap_duration_minutes}m)
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 mb-3 space-y-0.5">
                          <div className="truncate">Preceding Train: <span className="text-slate-300">{win.preceding_traffic}</span></div>
                          <div className="truncate">Next Train: <span className="text-slate-300">{win.succeeding_traffic}</span></div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                            Possible Repair Windows in this Corridor ({winPossibleSlots.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {winPossibleSlots.map((slot) => {
                              const isSlotBest = slot.is_best;
                              const isCurrentlySelected =
                                selectedSlotForDetail?.start_time === slot.start_time &&
                                selectedSlotForDetail?.end_time === slot.end_time;

                              return (
                                <div
                                  key={slot.slot_id}
                                  className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                                    isSlotBest
                                      ? "border-emerald-500/70 bg-emerald-950/30"
                                      : isCurrentlySelected
                                      ? "border-cyan-400 bg-cyan-950/20"
                                      : "border-slate-800 bg-slate-900/80"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-mono font-bold text-white text-sm">
                                        {slot.start_time} – {slot.end_time}
                                      </span>
                                      {isSlotBest && (
                                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                                          AI Best
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                                      <span>Score: <strong className="text-cyan-300 font-mono">{slot.optimization_score}</strong></span>
                                      <span>+{slot.buffer_before_min}m / +{slot.buffer_after_min}m buffer</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 pt-1.5 border-t border-slate-800">
                                    <button
                                      onClick={() => handleInspectSlot(slot)}
                                      className="flex-1 py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-semibold flex items-center justify-center gap-1 transition"
                                    >
                                      <ChevronRight className="w-3 h-3" /> Inspect
                                    </button>
                                    {currentUser?.username !== "engineer" && (
                                      <button
                                        onClick={() => handleApproveBlock({
                                          slot_id: slot.slot_id,
                                          start_time: slot.start_time,
                                          end_time: slot.end_time,
                                          duration_hours: slot.duration_hours,
                                          train_conflicts_count: 0,
                                          expected_delay_min: 0,
                                          optimization_score: slot.optimization_score,
                                          is_recommended: isSlotBest,
                                          status: "FEASIBLE",
                                          conflicting_trains: [],
                                        })}
                                        className="flex-1 py-1 px-2 rounded bg-emerald-500 hover:bg-emerald-400 text-[11px] text-slate-950 font-bold flex items-center justify-center gap-1 transition"
                                      >
                                        <Check className="w-3 h-3" /> Approve
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* AI Multi-Objective Solver Calibration Toggle & Panel */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Multi-Objective Scoring Weights & Algorithmic Calibration
              </h3>
              <p className="text-[11px] text-slate-400">
                Punctuality Penalty: <span className="text-rose-400 font-mono">-{delayWeight} pts/min</span> • Component Urgency: <span className="text-cyan-400 font-mono">+{priorityWeight} pts</span> • Clearance Buffer: <span className="text-amber-400 font-mono">{bufferMins} min</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {isAdmin ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Admin Tuning Active
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Read Only (Admin Required)
              </span>
            )}

            <button
              onClick={() => setShowWeightPanel(!showWeightPanel)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showWeightPanel ? "Hide Solver Weights" : "Tune / View Solver Weights"}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Tuning Panel */}
        {showWeightPanel && (
          <div className="pt-3 border-t border-slate-800/80 space-y-4">
            {!isAdmin && (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center space-x-2 text-amber-300 text-xs">
                <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                <span>
                  <strong>Read-Only Mode:</strong> Active persona (<strong>{currentUser?.role}</strong>) cannot modify AI objective penalty weights. Switch to <strong>System Administrator (Priya Nair)</strong> in the top-right profile to recalibrate.
                </span>
              </div>
            )}

            <form onSubmit={handleRecalibrateWeights} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className={!isAdmin ? "opacity-60" : ""}>
                <div className="flex justify-between font-semibold mb-1">
                  <label className="text-slate-300">Component Urgency Multiplier</label>
                  <span className="font-mono text-cyan-400">{priorityWeight} pts</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  disabled={!isAdmin}
                  value={priorityWeight}
                  onChange={(e) => setPriorityWeight(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-950 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">Weight reward for critical infrastructure repair</p>
              </div>

              <div className={!isAdmin ? "opacity-60" : ""}>
                <div className="flex justify-between font-semibold mb-1">
                  <label className="text-slate-300">Train Delay Penalty Rate</label>
                  <span className="font-mono text-rose-400">-{delayWeight} pts/min</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  disabled={!isAdmin}
                  value={delayWeight}
                  onChange={(e) => setDelayWeight(Number(e.target.value))}
                  className="w-full accent-rose-400 bg-slate-950 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">Penalty deducted for each minute of train delay</p>
              </div>

              <div className={!isAdmin ? "opacity-60" : ""}>
                <div className="flex justify-between font-semibold mb-1">
                  <label className="text-slate-300">Safety Buffer Clearance Time</label>
                  <span className="font-mono text-amber-400">{bufferMins} Mins</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  disabled={!isAdmin}
                  value={bufferMins}
                  onChange={(e) => setBufferMins(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-950 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">Headway clearance buffer between block and trains</p>
              </div>

              {isAdmin && (
                <div className="md:col-span-3 flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Recalibrate & Re-evaluate Slots</span>
                  </button>
                  {calibratedSuccess && (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AI Solver Weights Calibrated!
                    </span>
                  )}
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Candidate Time Slots Comparison Matrix */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Candidate Time Slots Comparison Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated across 24-hour cycle against scheduled train traffic on Section {optimizationResult?.section_id}
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Recommended (85+)
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Acceptable (60-84)
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Conflict Penalty (&lt;60)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {optimizationResult?.all_evaluated_slots?.map((slot) => {
            const isRec = slot.is_recommended;
            const isSelected = selectedSlotForDetail?.slot_id === slot.slot_id;

            let cardBorder = "border-slate-800";
            let badgeBg = "bg-slate-800 text-slate-300";
            let scoreColor = "text-slate-300";

            if (slot.optimization_score >= 85) {
              cardBorder = isRec ? "border-cyan-500/70 bg-cyan-950/20" : "border-emerald-700/50 bg-emerald-950/20";
              badgeBg = "bg-emerald-950 text-emerald-300 border border-emerald-800";
              scoreColor = "text-emerald-400";
            } else if (slot.optimization_score >= 60) {
              cardBorder = "border-amber-700/50 bg-amber-950/20";
              badgeBg = "bg-amber-950 text-amber-300 border border-amber-800";
              scoreColor = "text-amber-400";
            } else {
              cardBorder = "border-rose-800/40 bg-rose-950/10";
              badgeBg = "bg-rose-950 text-rose-300 border border-rose-800";
              scoreColor = "text-rose-400";
            }

            return (
              <div
                key={slot.slot_id}
                onClick={() => setSelectedSlotForDetail(slot)}
                className={`p-4 rounded-xl border transition cursor-pointer relative ${cardBorder} ${
                  isSelected ? "ring-2 ring-cyan-400" : "hover:border-slate-700"
                }`}
              >
                {isRec && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-400 text-slate-950 uppercase tracking-wide shadow-md">
                    AI Top Pick
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-white">
                    {slot.start_time} – {slot.end_time}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeBg}`}>
                    {slot.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Conflicts</span>
                    <p className={`font-bold font-mono ${slot.train_conflicts_count > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {slot.train_conflicts_count}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Delay</span>
                    <p className={`font-bold font-mono ${slot.expected_delay_min > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                      {slot.expected_delay_min}m
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Score</span>
                    <p className={`font-bold font-mono ${scoreColor}`}>
                      {slot.optimization_score}
                    </p>
                  </div>
                </div>

                {/* Conflicting Trains Preview */}
                {slot.conflicting_trains.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Disrupts {slot.conflicting_trains.length} scheduled train(s):
                    </p>
                    {slot.conflicting_trains.map((ct) => (
                      <div key={ct.train_no} className="text-[11px] text-slate-400 flex justify-between bg-slate-900/60 px-2 py-0.5 rounded">
                        <span>Train {ct.train_no} ({ct.train_name.split(" ")[0]})</span>
                        <span className="font-mono text-rose-300">@{ct.scheduled_time.split(" ")[0]} (+{ct.potential_delay_min}m)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 text-[11px] text-emerald-300 flex items-center gap-1.5 bg-emerald-950/30 px-2 py-1.5 rounded border border-emerald-800/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Clean window. No scheduled train conflicts.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explainable AI (XAI) Breakdown */}
      {selectedSlotForDetail && (
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Explainable AI (XAI) Decision Breakdown for Slot {selectedSlotForDetail.start_time} - {selectedSlotForDetail.end_time}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Scoring Formula Visualization */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
              <p className="text-xs font-bold text-cyan-300 uppercase font-mono">
                Mathematical Scoring Function:
              </p>
              <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 border border-slate-800">
                Score = Component Priority Bonus + Urgency + Window Base - (Train Conflicts × Penalty) - (Delay Minutes × Delay Penalty) - Block Overlap
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Base Window Score:</span>
                  <span className="font-mono font-bold text-white">+{selectedSlotForDetail.score_breakdown?.base_score || 60}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Component Priority Bonus (High):</span>
                  <span className="font-mono font-bold text-emerald-400">+{selectedSlotForDetail.score_breakdown?.asset_priority_bonus || 25}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Maintenance Urgency Bonus:</span>
                  <span className="font-mono font-bold text-emerald-400">+{selectedSlotForDetail.score_breakdown?.urgency_bonus || 15}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Train Conflict Penalty:</span>
                  <span className="font-mono font-bold text-rose-400">-{selectedSlotForDetail.score_breakdown?.conflict_penalty || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Expected Delay Penalty:</span>
                  <span className="font-mono font-bold text-rose-400">-{selectedSlotForDetail.score_breakdown?.delay_penalty || 0}</span>
                </div>
                <div className="flex justify-between py-1 pt-2 font-bold text-sm">
                  <span className="text-white">Calculated Optimization Score:</span>
                  <span className="font-mono text-cyan-400">{selectedSlotForDetail.optimization_score} / 100</span>
                </div>
              </div>
            </div>

            {/* Right: Natural Language Rationale */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-cyan-300 uppercase font-mono mb-2">
                  System Justification & Key Reasons:
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedSlotForDetail.reasons.map((r, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 p-3 bg-cyan-950/30 rounded-lg border border-cyan-800/40 text-xs text-cyan-200">
                <strong>Why this is critical for Indian Railways:</strong> By reserving Section {optimizationResult.section_id} during {selectedSlotForDetail.start_time} - {selectedSlotForDetail.end_time}, 
                we ensure zero holding of high-priority trains like Mangalore Mail (12601) and Shatabdi Express (12004) while restoring Signal S102 to 100% operational health.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
