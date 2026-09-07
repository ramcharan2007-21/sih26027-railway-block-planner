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
  ExternalLink 
} from "lucide-react";
import { api } from "../services/api";

export default function RailwayMap({ setActiveTab, onSelectRequestForAI }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionDetails, setSectionDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
              Railway Network Topology & Block Status Map
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Interactive corridor schematic showing real-time line occupancy, scheduled blocks, and infrastructure assets.
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
        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">
          MAIN LINE CORRIDOR TOPOLOGY: NEW DELHI (NDLS) ➔ PRAYAGRAJ (PRYJ)
        </h2>

        <div className="min-w-[900px] py-6 relative">
          <svg className="w-full h-44">
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
                    x={(startStation.x + endStation.x) / 2 - 65}
                    y={startStation.y - 42}
                    width="130"
                    height="36"
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

                  {/* Train or Maintenance Icon on track */}
                  {sec.status === "Blocked" && (
                    <foreignObject
                      x={(startStation.x + endStation.x) / 2 - 12}
                      y={startStation.y + 10}
                      width="24"
                      height="24"
                    >
                      <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] animate-bounce">
                        🚧
                      </div>
                    </foreignObject>
                  )}

                  {sec.status === "Maintenance Planned" && (
                    <foreignObject
                      x={(startStation.x + endStation.x) / 2 - 12}
                      y={startStation.y + 10}
                      width="24"
                      height="24"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px]">
                        🔧
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
                  y={st.y + 35}
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
                  y={st.y + 50}
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
          💡 Click any railway section above (e.g. <strong>Section A-B</strong>) to inspect live assets, scheduled trains, and active blocks.
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

          {/* 3 Columns: Assets, Trains, Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Installed Assets */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  Assets Located ({sectionDetails.assets.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {sectionDetails.assets.map((ast) => (
                  <div key={ast.asset_id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-cyan-300">{ast.asset_id}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          ast.condition === "Needs Repair"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {ast.condition}
                      </span>
                    </div>
                    <p className="text-slate-200 font-medium mt-0.5">{ast.name}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Type: {ast.asset_type}</span>
                      <span>Health: <strong className={ast.health_index < 60 ? "text-rose-400" : "text-emerald-400"}>{ast.health_index}%</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Trains */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-amber-400" />
                  Scheduled Trains ({sectionDetails.trains.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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

            {/* Existing Blocks & Requests */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Existing Blocks ({sectionDetails.blocks.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
