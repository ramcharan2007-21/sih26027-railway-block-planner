import React, { useState, useEffect } from "react";
import { 
  Train, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  Cpu, 
  TrendingUp, 
  Layers, 
  ShieldCheck,
  Key
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import { api } from "../services/api";

export default function Dashboard({ setActiveTab, onSelectRequestForAI, currentUser, onOpenRoleModal }) {
  const [kpis, setKpis] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiRes, secRes, blkRes, reqRes] = await Promise.all([
        api.getKPIs(),
        api.getSections(),
        api.getBlocks(),
        api.getMaintenanceRequests(),
      ]);
      setKpis(kpiRes);
      setSections(secRes);
      setActiveBlocks(blkRes);
      setPendingRequests(reqRes);
    } catch (err) {
      console.error("Failed loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLaunchScenario = () => {
    // Jump straight to AI Block Planner with MR001 (Signal S102) selected
    if (onSelectRequestForAI) {
      onSelectRequestForAI("MR001");
    }
    setActiveTab("planner");
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Scenario Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 p-6 border border-cyan-900/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                LIVE CONTROL ROOM
              </span>
              <span className="text-xs text-slate-400 font-mono">Northern Railway Division (Delhi - Prayagraj)</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Automatic Railway Block Planning
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Intelligent slot evaluation engine balancing track maintenance availability against train punctuality. 
              Powered by multi-objective constraint scoring and automatic conflict elimination.
            </p>
          </div>

          {/* Quick Scenario Button */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row items-center gap-3">
            <div>
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                SIH26027 Live Demo Scenario
              </p>
              <p className="text-[11px] text-slate-300">
                Signal S102 (Sec A-B) vs Train 12601 at 10:30
              </p>
            </div>
            <button
              onClick={handleLaunchScenario}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-1.5 transition"
            >
              <Cpu className="w-4 h-4 text-slate-950" />
              <span>Launch AI Planner</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Operational Persona & Role Privileges Banner */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-1 sm:mt-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Active Profile Authority:</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700">
                {currentUser?.role || "Chief Section Controller"}
              </span>
              <span className="text-xs font-bold text-white">({currentUser?.full_name || "Rajesh Sharma"})</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser?.username === "controller" && (
                <span>
                  <strong className="text-emerald-400">Operating Privileges:</strong> Full block grant authority, train timetable dispatch, and corridor speed restriction control.
                </span>
              )}
              {currentUser?.username === "cohost" && (
                <span>
                  <strong className="text-cyan-400">Operating Privileges:</strong> Joint operational command, co-approve AI blocks, and live conflict simulation.
                </span>
              )}
              {currentUser?.username === "engineer" && (
                <span>
                  <strong className="text-amber-400">Operating Privileges:</strong> Register railway assets, update ultrasonic testing & health indices, submit maintenance requisitions. <span className="text-rose-400 font-bold">(Block approval restricted to Controllers)</span>.
                </span>
              )}
              {currentUser?.username === "admin" && (
                <span>
                  <strong className="text-purple-400">Operating Privileges:</strong> Calibrate AI objective weights, full CRIS connector configuration, and demo environment reset.
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRoleModal}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition flex items-center space-x-1.5 flex-shrink-0 self-end md:self-auto shadow-sm"
        >
          <Key className="w-3.5 h-3.5 text-cyan-400" />
          <span>Switch Operational Role</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Total Trains"
          value={kpis?.total_trains ?? 18}
          subtext="Active corridor schedules"
          icon={Train}
          color="cyan"
        />
        <MetricCard
          title="Active Blocks"
          value={kpis?.active_blocks ?? 1}
          subtext={`${kpis?.planned_blocks ?? 1} planned blocks`}
          icon={Clock}
          color="amber"
          badge="Live"
        />
        <MetricCard
          title="Pending Maint."
          value={kpis?.pending_maintenance ?? 3}
          subtext="Urgent requests"
          icon={AlertTriangle}
          color="rose"
        />
        <MetricCard
          title="Conflicts Avoided"
          value={kpis?.conflicts_avoided ?? 18}
          subtext="Via AI slot placement"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Avg Delay"
          value={`${kpis?.average_expected_delay_min ?? 0}m`}
          subtext="AI reduction from 42m"
          icon={TrendingUp}
          color="indigo"
        />
        <MetricCard
          title="Asset Availability"
          value={`${kpis?.asset_availability_pct ?? 94}%`}
          subtext="Safe operational index"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Two Column Layout: Network Sections & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Railway Corridor Sections */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Corridor Section Telemetry
              </h2>
            </div>
            <button
              onClick={() => setActiveTab("map")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>View Schematic Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((sec) => {
              const statusColors = {
                Available: "bg-emerald-950/40 text-emerald-300 border-emerald-700/60",
                "Maintenance Planned": "bg-amber-950/40 text-amber-300 border-amber-700/60",
                Blocked: "bg-rose-950/40 text-rose-300 border-rose-700/60",
                "Train Movement": "bg-cyan-950/40 text-cyan-300 border-cyan-700/60",
              };

              const dotColors = {
                Available: "bg-emerald-400",
                "Maintenance Planned": "bg-amber-400",
                Blocked: "bg-rose-500",
                "Train Movement": "bg-cyan-400",
              };

              return (
                <div
                  key={sec.section_id}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-bold text-cyan-300 text-xs border border-slate-700">
                      {sec.section_id}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{sec.name}</p>
                      <p className="text-xs text-slate-400">
                        {sec.from_station} ➔ {sec.to_station} • {sec.length_km} km • {sec.track_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-xs">
                      <span className="text-slate-400">Traffic: </span>
                      <span className="font-semibold text-slate-200">{sec.active_trains_count} Trains</span>
                      <span className="text-slate-600 mx-1">|</span>
                      <span className="text-slate-400">Assets: </span>
                      <span className="font-semibold text-slate-200">{sec.asset_count}</span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        statusColors[sec.status] || statusColors.Available
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          dotColors[sec.status] || "bg-emerald-400"
                        }`}
                      ></span>
                      {sec.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Urgent Maintenance Pipeline */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Urgent Maintenance Queue
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("requests")}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingRequests.slice(0, 3).map((req) => (
                <div
                  key={req.request_id}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{req.request_id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.priority === "High"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {req.priority} Priority
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-200">{req.maintenance_type}</p>
                  <p className="text-[11px] text-slate-400">
                    Asset: <strong className="text-slate-300">{req.asset_id}</strong> ({req.asset_type}) • Section:{" "}
                    <strong className="text-slate-300">{req.section_id}</strong>
                  </p>
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800/50">
                    <span className="text-[11px] text-slate-400 font-mono">Duration: {req.required_duration}h</span>
                    <button
                      onClick={() => {
                        if (onSelectRequestForAI) onSelectRequestForAI(req.request_id);
                        setActiveTab("planner");
                      }}
                      className="text-[11px] bg-cyan-950 hover:bg-cyan-900 text-cyan-300 px-2 py-1 rounded border border-cyan-800 flex items-center space-x-1 font-semibold"
                    >
                      <Cpu className="w-3 h-3" />
                      <span>Plan with AI</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => setActiveTab("conflicts")}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Inspect Automated Conflict Scanner (5 Flags)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Blocks Roster */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Approved & Active Maintenance Blocks
            </h2>
          </div>
          <button
            onClick={() => setActiveTab("availability")}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
          >
            <span>Timeline Gantt View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Block ID</th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Time Window</th>
                <th className="py-2.5 px-3">Team Assigned</th>
                <th className="py-2.5 px-3">AI Score</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {activeBlocks.map((blk) => (
                <tr key={blk.block_id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{blk.block_id}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{blk.section_id}</td>
                  <td className="py-2.5 px-3">{blk.asset_id || "Track Infrastructure"}</td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-amber-300">{blk.start_time}</span> -{" "}
                    <span className="text-amber-300">{blk.end_time}</span> ({blk.date})
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{blk.maintenance_team}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{blk.optimization_score}/100</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        blk.status === "Active"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {blk.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
