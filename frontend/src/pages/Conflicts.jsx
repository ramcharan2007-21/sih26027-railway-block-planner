import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, Search, ArrowRight, Cpu, Zap, Sun, Moon, Sparkles, Check, ChevronRight } from "lucide-react";
import { api } from "../services/api";

export default function Conflicts({ setActiveTab, onSelectRequestForAI, currentUser }) {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactive What-If Slot Simulator
  const [testSection, setTestSection] = useState("A-B");
  const [testStart, setTestStart] = useState("10:00");
  const [testEnd, setTestEnd] = useState("12:00");
  const [testDuration, setTestDuration] = useState(2.0);
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const loadConflicts = async () => {
    try {
      setLoading(true);
      const data = await api.getConflicts();
      setConflicts(data);
    } catch (err) {
      console.error("Error loading conflicts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConflicts();
    handleCheckSlot(); // Initial check with the exact SIH demo conflict!
  }, []);

  const handleCheckSlot = async (customStart, customEnd) => {
    const s = typeof customStart === "string" ? customStart : testStart;
    const e = typeof customEnd === "string" ? customEnd : testEnd;
    if (typeof customStart === "string") setTestStart(customStart);
    if (typeof customEnd === "string") setTestEnd(customEnd);

    setChecking(true);
    try {
      const res = await api.checkSlot({
        section_id: testSection,
        start_time: s,
        end_time: e,
        duration_hours: testDuration,
      });
      setCheckResult(res);
    } catch (err) {
      alert("Conflict check failed: " + err.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Automated Railway Conflict Detection Engine
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time multi-dimensional constraint validation across train schedules, simultaneous track occupancies, and interlocking corridors.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950 text-cyan-300 border border-slate-800 font-mono">
            Continuous Safety Monitor
          </span>
          <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800">
            {currentUser?.role || "Controller"}
          </span>
        </div>
      </div>

      {/* Interactive Conflict Simulator (Interactive Sandbox) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-2xl border border-cyan-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Interactive "What-If" Block Conflict Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Test any proposed maintenance block window. If conflicts are detected, the AI engine will automatically locate an alternative clean window.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Section</label>
            <select
              value={testSection}
              onChange={(e) => setTestSection(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="A-B">Section A-B (New Delhi - Ghaziabad)</option>
              <option value="B-C">Section B-C (Ghaziabad - Aligarh)</option>
              <option value="C-D">Section C-D (Aligarh - Kanpur)</option>
              <option value="D-E">Section D-E (Kanpur - Prayagraj)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Proposed Start Time</label>
            <input
              type="time"
              value={testStart}
              onChange={(e) => setTestStart(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Proposed End Time</label>
            <input
              type="time"
              value={testEnd}
              onChange={(e) => setTestEnd(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleCheckSlot()}
              disabled={checking}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-md shadow-cyan-500/20"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{checking ? "Scanning..." : "Scan for Conflicts"}</span>
            </button>
          </div>
        </div>

        {/* Scan Results Banner */}
        {checkResult && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
            {checkResult.has_conflict ? (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-rose-300 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 animate-bounce" />
                    <span>⚠ CONFLICT DETECTED</span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-400 bg-rose-950/90 px-2.5 py-0.5 rounded-full border border-rose-800 self-start sm:self-auto">
                    Proposed Slot Conflict
                  </span>
                </div>

                {/* Conflict Impact Metrics: Conflicts | Trains affected | Delay (min) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 py-2.5 px-3 bg-slate-950/90 rounded-lg border border-rose-900/60 font-mono">
                  <div className="text-center">
                    <div className="text-[10px] sm:text-[11px] text-rose-400 font-semibold uppercase tracking-wider">
                      Conflicts
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-rose-300 mt-0.5">
                      {checkResult.conflict_count || checkResult.conflicts?.length || 1}
                    </div>
                  </div>
                  <div className="text-center border-x border-rose-900/50 px-2">
                    <div className="text-[10px] sm:text-[11px] text-rose-400 font-semibold uppercase tracking-wider">
                      Trains affected
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-rose-300 mt-0.5">
                      {checkResult.trains_affected || checkResult.conflicts?.length || 1}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-[11px] text-rose-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Delay (min)</span>
                    </div>
                    <div className="text-base sm:text-xl font-extrabold text-amber-400 mt-0.5">
                      {checkResult.total_delay_min !== undefined ? checkResult.total_delay_min : 30} min
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {checkResult.conflicts.map((c, i) => (
                    <div key={i} className="p-3 bg-slate-950/80 rounded-lg border border-rose-900/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <p className="font-semibold text-white">
                          "{c.conflict_reason}"
                        </p>
                        <p className="text-slate-400 mt-0.5">
                          Train: <strong>{c.train_no}</strong> ({c.train_name}) • Priority: <strong className="text-rose-400">{c.priority}</strong> • Scheduled: <span className="font-mono text-cyan-300">{c.arrival_time} – {c.departure_time}</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0 self-start sm:self-auto">
                        <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>+{c.delay_min || 30}m Delay</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary Recommended Alternative Time Suggestion */}
                {checkResult.suggested_alternative && (
                  <div className="p-4 bg-emerald-950/50 rounded-xl border border-emerald-500 space-y-3.5 mt-3 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          AI PRIMARY RECOMMENDATION (OPTIMAL DAYLIGHT)
                        </span>
                        <p className="text-xs font-bold text-white mt-1">
                          Clean Alternative Slot:{" "}
                          <span className="text-cyan-300 font-mono text-sm font-extrabold">
                            {checkResult.suggested_alternative.start_time} – {checkResult.suggested_alternative.end_time}
                          </span>
                          <span className="ml-2 text-[11px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                            {checkResult.suggested_alternative.total_free_label || "Clear Window"} • 0 Conflicts
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          {checkResult.suggested_alternative.reason}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
                        <button
                          onClick={() => handleCheckSlot(checkResult.suggested_alternative.start_time, checkResult.suggested_alternative.end_time)}
                          className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 font-bold text-xs flex items-center space-x-1 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply Slot</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onSelectRequestForAI) onSelectRequestForAI("MR001");
                            setActiveTab("planner");
                          }}
                          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-md shadow-emerald-500/20 transition"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Open in AI Planner</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* AI Outcome Metrics & Improvement Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-emerald-800/60">
                      {/* AI Resolved State Metrics */}
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-emerald-800/70">
                        <div className="text-[10px] font-bold uppercase text-emerald-400 font-mono tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>AI Primary Recommendation</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 font-mono text-center">
                          <div className="bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Conflicts</div>
                            <div className="text-base sm:text-lg font-extrabold text-emerald-400">0</div>
                          </div>
                          <div className="bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Trains affected</div>
                            <div className="text-base sm:text-lg font-extrabold text-emerald-400">0</div>
                          </div>
                          <div className="bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Delay</div>
                            <div className="text-base sm:text-lg font-extrabold text-emerald-400">0 min</div>
                          </div>
                        </div>
                      </div>

                      {/* Improvement Section */}
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-cyan-800/60">
                        <div className="text-[10px] font-bold uppercase text-cyan-400 font-mono tracking-wider mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Improvement</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">100% Resolved</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 font-mono text-center">
                          <div className="bg-cyan-950/30 p-2 rounded border border-cyan-900/50">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold leading-tight">Conflict reduction</div>
                            <div className="text-base sm:text-lg font-extrabold text-cyan-300 mt-0.5">100%</div>
                          </div>
                          <div className="bg-cyan-950/30 p-2 rounded border border-cyan-900/50">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold leading-tight">Delay reduction</div>
                            <div className="text-base sm:text-lg font-extrabold text-cyan-300 mt-0.5">100%</div>
                          </div>
                          <div className="bg-emerald-950/40 p-2 rounded border border-emerald-800/50 flex flex-col justify-center items-center">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold leading-tight">Maintenance/ completed</div>
                            <div className="text-base sm:text-lg font-extrabold text-emerald-400 mt-0.5 flex items-center justify-center">
                              ✓
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* All Remaining Discovered Zero-Traffic Timelines */}
                {checkResult.suggested_alternatives && checkResult.suggested_alternatives.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-rose-900/60 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          All Clean Timelines Discovered ({checkResult.suggested_alternatives.length} Zero-Train Windows)
                        </h3>
                        <p className="text-[11px] text-slate-300">
                          The AI scanned the complete 24h timetable across Section {testSection}. Below are all alternative windows where zero trains are running:
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 text-cyan-300 border border-slate-800 self-start sm:self-auto">
                        Section {testSection} • 24h Timeline Analysis
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {checkResult.suggested_alternatives.map((alt, idx) => {
                        const isPrimary = alt.start_time === checkResult.suggested_alternative?.start_time;
                        return (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                              isPrimary
                                ? "bg-cyan-950/40 border-cyan-400/80 shadow-md shadow-cyan-950/50"
                                : alt.is_daylight
                                ? "bg-slate-900/90 border-slate-700 hover:border-cyan-500/50"
                                : "bg-slate-950/90 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 font-mono ${
                                  alt.is_daylight
                                    ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                                    : "bg-slate-900 text-slate-300 border border-slate-700"
                                }`}>
                                  {alt.is_daylight ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-cyan-400" />}
                                  {alt.category}
                                </span>
                                <span className="text-xs font-mono font-extrabold text-emerald-400">
                                  {alt.total_free_label} Free
                                </span>
                              </div>

                              <div className="mt-2.5">
                                <span className="text-[10px] text-slate-400 block uppercase font-mono">Full Clean Gap:</span>
                                <p className="text-xs font-extrabold text-white font-mono">
                                  {alt.timeline_window}
                                </p>
                                <span className="text-[10px] text-slate-400 block uppercase font-mono mt-1.5">Suggested {testDuration}h Block:</span>
                                <p className="text-sm font-mono font-extrabold text-cyan-300">
                                  {alt.start_time} – {alt.end_time}
                                </p>
                              </div>

                              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5 font-mono">
                                <p className="truncate" title={alt.preceding_traffic}><strong>Prev:</strong> {alt.preceding_traffic}</p>
                                <p className="truncate" title={alt.next_traffic}><strong>Next:</strong> {alt.next_traffic}</p>
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                              <button
                                onClick={() => handleCheckSlot(alt.start_time, alt.end_time)}
                                className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold border border-slate-700 transition flex items-center justify-center space-x-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Apply Slot</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (onSelectRequestForAI) onSelectRequestForAI("MR001");
                                  setActiveTab("planner");
                                }}
                                title="Plan in AI Block Planner"
                                className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center flex-shrink-0"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500 text-emerald-300 space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">ZERO CONFLICTS DETECTED</p>
                    <p className="text-xs text-slate-300">
                      Window <strong className="text-cyan-300 font-mono">{testStart} – {testEnd}</strong> on Section <strong>{testSection}</strong> is completely clear of scheduled train traffic and overlapping maintenance blocks.
                    </p>
                  </div>
                </div>

                {/* Also show remaining clean timelines when in zero conflict state */}
                {checkResult.suggested_alternatives && checkResult.suggested_alternatives.length > 0 && (
                  <div className="pt-3 border-t border-emerald-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2 font-mono">
                      Other Clean Timelines Available Across Section {testSection}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {checkResult.suggested_alternatives.map((alt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCheckSlot(alt.start_time, alt.end_time)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700 transition flex items-center space-x-1.5"
                        >
                          <span className="text-cyan-300 font-bold">{alt.start_time}–{alt.end_time}</span>
                          <span className="text-slate-500">({alt.total_free_label})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Network Active Conflicts Scanner List */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Network-Wide Registered Conflict Logs ({conflicts.length})
        </h2>

        <div className="space-y-3">
          {conflicts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
              No active network conflicts registered. AI block planning has resolved corridor bottlenecks.
            </div>
          ) : (
            conflicts.map((c) => (
              <div
                key={c.conflict_id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-cyan-400">{c.conflict_id}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-300 font-semibold">{c.conflict_type}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.severity === "Critical"
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}
                  >
                    {c.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium">{c.description}</p>

                <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
                  <span>
                    Location: <strong className="text-cyan-300">Section {c.section_id}</strong> @ {c.time}
                  </span>
                  <div className="text-amber-300 font-medium">
                    Suggested Action: {c.suggested_action}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
