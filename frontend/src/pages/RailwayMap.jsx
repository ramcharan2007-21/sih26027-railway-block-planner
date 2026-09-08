import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Train, 
  Shield, 
  Clock, 
  AlertTriangle, 
  Info, 
  X, 
  CheckCircle2, 
  Cpu, 
  ArrowRight,
  ExternalLink,
  Wrench,
  AlertCircle,
  Filter
} from "lucide-react";
import { api } from "../services/api";

export default function RailwayMap({ setActiveTab, onSelectRequestForAI }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionDetails, setSectionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [assetFilter, setAssetFilter] = useState("all"); // 'all' | 'needs_repair'

  const loadSections = async () => {
    try {
      const data = await api.getSections();
      setSections(data);
      if (data.length > 0 && !selectedSection) {
        handleSelectSection(data[0].section_id);
      }
    } catch (err) {
      console.error("Failed loading sections:", err);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleSelectSection = async (sectionId) => {
    setSelectedSection(sectionId);
    setLoadingDetails(true);
    try {
      const details = await api.getSectionDetail(sectionId);
      setSectionDetails(details);
    } catch (err) {
      console.error("Error fetching section detail:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const stations = [
    { id: "A", code: "NDLS", name: "Station A (New Delhi)", x: 80, y: 150 },
    { id: "B", code: "GZB", name: "Station B (Ghaziabad)", x: 260, y: 150 },
    { id: "C", code: "ALJN", name: "Station C (Aligarh Jn)", x: 440, y: 150 },
    { id: "D", code: "CNB", name: "Station D (Kanpur Central)", x: 640, y: 150 },
    { id: "E", code: "PRYJ", name: "Station E (Prayagraj Jn)", x: 840, y: 150 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return { stroke: "#22c55e", bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-600" };
      case "Maintenance Planned":
        return { stroke: "#eab308", bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-600" };
      case "Blocked":
        return { stroke: "#ef4444", bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-600" };
      case "Train Movement":
        return { stroke: "#06b6d4", bg: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-600" };
      default:
        return { stroke: "#22c55e", bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-600" };
    }
  };

  // Filter assets based on active filter
  const displayedAssets = sectionDetails?.assets?.filter((ast) => {
    if (assetFilter === "needs_repair") {
      return ast.requires_repair || ast.condition === "Needs Repair" || ast.status === "Maintenance Required";
    }
    return true;
  }) || [];

  const repairCount = sectionDetails?.assets?.filter(
    (a) => a.requires_repair || a.condition === "Needs Repair" || a.status === "Maintenance Required"
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Railway Network Topology & Asset Block Planning Map
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time corridor schematic: tracks, signals, points, overhead electrical equipment (OHE), and bridges requiring maintenance blocks.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Available
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Maintenance Planned
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Blocked
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Train Movement
          </span>
        </div>
      </div>

      {/* Visual Railway Network Diagram */}
      <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            MAIN LINE CORRIDOR TOPOLOGY: NEW DELHI (NDLS) ➔ PRAYAGRAJ (PRYJ)
          </h2>
          <span className="text-[11px] font-mono text-cyan-400">Click section to inspect assets</span>
        </div>

        <div className="min-w-[920px] py-6 relative">
          <svg className="w-full h-48">
            {/* Tracks / Sections */}
            {sections.map((sec, idx) => {
              const startStation = stations[idx];
              const endStation = stations[idx + 1];
              if (!startStation || !endStation) return null;

              const isSelected = selectedSection === sec.section_id;
              const color = getStatusColor(sec.status);

              return (
                <g 
                  key={sec.section_id} 
                  className="cursor-pointer transition-all duration-200 group"
                  onClick={() => handleSelectSection(sec.section_id)}
                >
                  {/* Outer glow line */}
                  <line
                    x1={startStation.x}
                    y1={startStation.y}
                    x2={endStation.x}
                    y2={endStation.y}
                    stroke={isSelected ? "#38bdf8" : color.stroke}
                    strokeWidth={isSelected ? "8" : "5"}
                    strokeOpacity={isSelected ? "0.9" : "0.7"}
                    strokeDasharray={sec.status === "Maintenance Planned" ? "8 6" : "none"}
                    className="transition-all duration-200"
                  />

                  {/* Section Label Badge (Clickable) */}
                  <foreignObject
                    x={(startStation.x + endStation.x) / 2 - 70}
                    y={startStation.y - 48}
                    width="140"
                    height="42"
                  >
                    <div
                      className={`text-center py-1 px-2 rounded-lg border text-[11px] font-mono font-bold shadow-md cursor-pointer transition ${
                        isSelected
                          ? "bg-cyan-950 text-cyan-200 border-cyan-400 scale-105"
                          : "bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <p className="leading-tight">Section {sec.section_id}</p>
                      <p className="text-[9px] text-slate-400 font-sans font-normal">{sec.length_km} km • {sec.status}</p>
                    </div>
                  </foreignObject>

                  {/* Highlight for Section A-B (SIH Demo Target Asset Signal S102) */}
                  {sec.section_id === "A-B" && (
                    <foreignObject
                      x={(startStation.x + endStation.x) / 2 - 75}
                      y={startStation.y + 16}
                      width="150"
                      height="24"
                    >
                      <div className="text-center py-0.5 px-2 rounded bg-rose-950/90 text-rose-300 border border-rose-600 text-[10px] font-bold animate-pulse shadow">
                        ⚠ S102 Needs Repair (2h)
                      </div>
                    </foreignObject>
                  )}

                  {/* Highlight for Section B-C (OHE-88) */}
                  {sec.section_id === "B-C" && (
                    <foreignObject
                      x={(startStation.x + endStation.x) / 2 - 75}
                      y={startStation.y + 16}
                      width="150"
                      height="24"
                    >
                      <div className="text-center py-0.5 px-2 rounded bg-amber-950/90 text-amber-300 border border-amber-600 text-[10px] font-bold shadow">
                        ⚠ OHE-88 Repair (3h)
                      </div>
                    </foreignObject>
                  )}

                  {/* Highlight for Section C-D (SW-22) */}
                  {sec.section_id === "C-D" && (
                    <foreignObject
                      x={(startStation.x + endStation.x) / 2 - 75}
                      y={startStation.y + 16}
                      width="150"
                      height="24"
                    >
                      <div className="text-center py-0.5 px-2 rounded bg-rose-950/90 text-rose-300 border border-rose-600 text-[10px] font-bold shadow">
                        🚧 BLOCKED (TRK-108)
                      </div>
                    </foreignObject>
                  )}

                  {/* Section D-E */}
                  {sec.section_id === "D-E" && (
                    <foreignObject
                      x={(startStation.x + endStation.x) / 2 - 75}
                      y={startStation.y + 16}
                      width="150"
                      height="24"
                    >
                      <div className="text-center py-0.5 px-2 rounded bg-amber-950/90 text-amber-300 border border-amber-600 text-[10px] font-bold shadow">
                        🔧 Planned (OHE-142)
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}

            {/* Stations Nodes */}
            {stations.map((st) => (
              <g key={st.id}>
                {/* Station Outer Ring */}
                <circle
                  cx={st.x}
                  cy={st.y}
                  r="14"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />
                {/* Station Inner Point */}
                <circle
                  cx={st.x}
                  cy={st.y}
                  r="6"
                  fill="#e2e8f0"
                />

                {/* Station Labels */}
                <text
                  x={st.x}
                  y={st.y + 40}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="Inter, sans-serif"
                >
                  {st.code}
                </text>
                <text
                  x={st.x}
                  y={st.y + 54}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                >
                  {st.name.split(" ")[0]} {st.name.split(" ")[1]}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <p className="text-center text-xs text-slate-400 italic">
          💡 Click any railway section above (e.g. <strong>Section A-B</strong>) to inspect live components, scheduled trains, and active blocks.
        </p>
      </div>

      {/* Section Telemetry Drawer / Detailed View */}
      {sectionDetails && (
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {sectionDetails.section.section_id}
                </span>
                <h2 className="text-lg font-bold text-white">
                  {sectionDetails.section.name}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Route: {sectionDetails.section.from_station} ➔ {sectionDetails.section.to_station} • 
                Length: {sectionDetails.section.length_km} km • Max Speed: {sectionDetails.section.max_speed_kmh} km/h • 
                Type: {sectionDetails.section.track_type}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  getStatusColor(sectionDetails.section.status).border
                } ${getStatusColor(sectionDetails.section.status).text} bg-slate-950`}
              >
                ● Status: {sectionDetails.section.status}
              </span>
              <button
                onClick={() => {
                  if (onSelectRequestForAI) onSelectRequestForAI("MR001");
                  setActiveTab("planner");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Optimize Maintenance on this Section</span>
              </button>
            </div>
          </div>

          {/* Section Repair Alert Banner (if any asset requires repair) */}
          {repairCount > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-600/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-rose-300">
                    ⚠ ACTION REQUIRED: {repairCount} Railway Component(s) in Section {sectionDetails.section.section_id} Require Maintenance Block
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Accurately tracked per SIH26027 specifications to maximize component availability and eliminate train delays.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAssetFilter("needs_repair")}
                  className="px-3 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-bold border border-rose-700"
                >
                  View Repair Queue ({repairCount})
                </button>
              </div>
            </div>
          )}

          {/* 3 Columns: Components, Trains, Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: Installed Components with ACCURATE REQUIRED REPAIRS */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-cyan-400" />
                    Components Located ({sectionDetails.assets.length})
                  </h3>

                  {/* Filter Toggle: All vs Required for Repair */}
                  <div className="flex rounded-md bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
                    <button
                      onClick={() => setAssetFilter("all")}
                      className={`px-2 py-0.5 rounded font-medium transition ${
                        assetFilter === "all"
                          ? "bg-cyan-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      All ({sectionDetails.assets.length})
                    </button>
                    <button
                      onClick={() => setAssetFilter("needs_repair")}
                      className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 ${
                        assetFilter === "needs_repair"
                          ? "bg-rose-600 text-white font-bold"
                          : "text-rose-400 hover:text-rose-300"
                      }`}
                    >
                      <span>⚠ Needs Repair ({repairCount})</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {displayedAssets.map((ast) => {
                    const isRepair = ast.requires_repair || ast.condition === "Needs Repair" || ast.status === "Maintenance Required";

                    return (
                      <div
                        key={ast.asset_id}
                        className={`p-3 rounded-lg border transition space-y-2 ${
                          isRepair
                            ? "bg-slate-900/90 border-rose-700/60 shadow-md shadow-rose-950/20 ring-1 ring-rose-500/20"
                            : "bg-slate-900 border-slate-800"
                        }`}
                      >
                        {/* Top: Asset ID, Priority & Condition */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-sm text-cyan-300">{ast.asset_id}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono">
                              {ast.asset_type}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                ast.priority === "High"
                                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {ast.priority}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                ast.condition === "Needs Repair" || ast.condition === "Critical"
                                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                                  : ast.condition === "Needs Inspection"
                                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              }`}
                            >
                              {ast.condition}
                            </span>
                          </div>
                        </div>

                        {/* Asset Name */}
                        <p className="text-slate-200 font-semibold text-xs leading-snug">{ast.name}</p>

                        {/* Health Bar */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span>Health Index:</span>
                          <div className="flex items-center space-x-1.5">
                            <div className="w-16 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  ast.health_index < 50
                                    ? "bg-rose-500"
                                    : ast.health_index < 80
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${ast.health_index}%` }}
                              ></div>
                            </div>
                            <span className={`font-mono font-bold ${ast.health_index < 50 ? "text-rose-400" : "text-emerald-400"}`}>
                              {ast.health_index}%
                            </span>
                          </div>
                        </div>

                        {/* ACCURATE REQUIRED FOR REPAIR CALLOUT (SIH26027 SPECIFICATION) */}
                        {isRepair ? (
                          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/80 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[10px] font-bold text-rose-300 uppercase tracking-wider font-mono">
                              <span className="flex items-center gap-1">
                                <Wrench className="w-3 h-3 text-rose-400" />
                                Required for Repair:
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-200">
                                {ast.required_duration_hours || 2.0}h Block Needed
                              </span>
                            </div>

                            <p className="text-slate-200 font-semibold text-[11px]">
                              Work: <span className="text-amber-300">{ast.repair_work || "Aspect & Relay Overhaul"}</span>
                            </p>

                            <p className="text-[10px] text-slate-300 leading-tight">
                              {ast.asset_id === "S102"
                                ? "Critical Track Circuit Signal. Scheduled Train 12601 passes at 10:30; optimal block required at 14:00-16:00 to eliminate delays."
                                : `Engineering maintenance block required to prevent speed restrictions on Section ${sectionDetails.section.section_id}.`}
                            </p>

                            {/* Direct AI Block Planning Action Button */}
                            <div className="pt-1.5 flex justify-end">
                              <button
                                onClick={() => {
                                  const reqId = ast.request_id || (ast.asset_id === "S102" ? "MR001" : "MR001");
                                  if (onSelectRequestForAI) onSelectRequestForAI(reqId);
                                  setActiveTab("planner");
                                }}
                                className="w-full py-1.5 px-2.5 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-[11px] flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-500/20 transition"
                              >
                                <Cpu className="w-3.5 h-3.5 text-slate-950" />
                                <span>Plan {ast.required_duration_hours || 2.0}h Block with AI</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 pt-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Operational. No maintenance block required.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Scheduled Trains */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-amber-400" />
                  Scheduled Trains ({sectionDetails.trains.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {sectionDetails.trains.map((tr) => (
                  <div key={tr.train_no} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-white">#{tr.train_no}</span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded">
                        {tr.arrival_time} - {tr.departure_time}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5 truncate">{tr.train_name}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{tr.train_type}</span>
                      <span className={tr.priority === "High" ? "text-rose-300 font-bold" : "text-slate-400"}>{tr.priority} Priority</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Existing Blocks */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Existing Blocks ({sectionDetails.blocks.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {sectionDetails.blocks.length === 0 ? (
                  <div className="p-4 rounded-lg bg-slate-900/50 text-center text-xs text-slate-400">
                    No active maintenance blocks currently on Section {sectionDetails.section.section_id}.
                  </div>
                ) : (
                  sectionDetails.blocks.map((b) => (
                    <div key={b.block_id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-amber-300">{b.block_id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-slate-200 mt-0.5">Time: {b.start_time} – {b.end_time}</p>
                      <p className="text-[11px] text-slate-400">Team: {b.maintenance_team}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
