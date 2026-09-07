import React, { useState, useEffect } from "react";
import { Clock, Layers, Calendar, CheckCircle2, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { api } from "../services/api";

export default function Availability() {
  const [sections, setSections] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const loadData = async () => {
    try {
      setLoading(true);
      const [secData, blkData] = await Promise.all([
        api.getSections(),
        api.getBlocks(),
      ]);
      setSections(secData);
      setBlocks(blkData);
    } catch (err) {
      console.error("Error loading availability data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteBlock = async (id) => {
    if (!window.confirm("Cancel this maintenance block and restore track availability?")) return;
    try {
      await api.deleteBlock(id);
      loadData();
    } catch (err) {
      alert("Failed to delete block: " + err.message);
    }
  };

  const getPositionPercent = (timeStr) => {
    try {
      const [h, m] = timeStr.split(":").map(Number);
      return ((h * 60 + m) / (24 * 60)) * 100;
    } catch {
      return 0;
    }
  };

  const getWidthPercent = (startStr, endStr) => {
    try {
      const [sh, sm] = startStr.split(":").map(Number);
      const [eh, em] = endStr.split(":").map(Number);
      let durationMins = (eh * 60 + em) - (sh * 60 + sm);
      if (durationMins <= 0) durationMins += 24 * 60; // Crosses midnight
      return (durationMins / (24 * 60)) * 100;
    } catch {
      return 5;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Track & Block Availability Gantt Timeline
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            24-hour visual schedule across railway sections. Identifies available time slots for maintenance.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1.5 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Planned Block
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Active Block
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500"></span> Available Window
          </span>
        </div>
      </div>

      {/* 24-Hour Gantt Visualizer */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl overflow-x-auto">
        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">
          CORRIDOR TIMELINE: 00:00 TO 24:00 (TODAY'S OPERATIONS)
        </h2>

        <div className="min-w-[850px]">
          {/* Timeline Header (Hours) */}
          <div className="grid grid-cols-24 border-b border-slate-800 pb-2 text-[10px] font-mono text-slate-400">
            {hours.map((h) => (
              <div key={h} className="text-center">
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* Section Rows */}
          <div className="divide-y divide-slate-800/60 mt-3">
            {sections.map((sec) => {
              const secBlocks = blocks.filter((b) => b.section_id === sec.section_id);

              return (
                <div key={sec.section_id} className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                        Sec {sec.section_id}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{sec.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {secBlocks.length} Block(s) Scheduled
                    </span>
                  </div>

                  {/* Gantt Bar Track */}
                  <div className="relative h-10 bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-hidden">
                    {/* Hour grid lines */}
                    <div className="absolute inset-0 grid grid-cols-24 pointer-events-none">
                      {hours.map((h) => (
                        <div key={h} className="border-r border-slate-800/30 h-full"></div>
                      ))}
                    </div>

                    {/* High-value free maintenance window recommendation on Section A-B */}
                    {sec.section_id === "A-B" && (
                      <div
                        className="absolute top-1 bottom-1 bg-emerald-500/20 border border-emerald-500/50 rounded flex items-center justify-center text-[10px] text-emerald-300 font-bold px-2 pointer-events-none"
                        style={{
                          left: `${getPositionPercent("14:00")}%`,
                          width: `${getWidthPercent("14:00", "16:00")}%`,
                        }}
                      >
                        Free Slot (14:00–16:00)
                      </div>
                    )}

                    {/* Block spans */}
                    {secBlocks.map((blk) => {
                      const left = getPositionPercent(blk.start_time);
                      const width = getWidthPercent(blk.start_time, blk.end_time);
                      const isActive = blk.status === "Active";

                      return (
                        <div
                          key={blk.block_id}
                          className={`absolute top-1 bottom-1 rounded px-2 flex items-center justify-between text-[11px] font-bold shadow-md cursor-pointer transition hover:opacity-90 ${
                            isActive
                              ? "bg-rose-600 text-white border border-rose-400"
                              : "bg-amber-500 text-slate-950 border border-amber-300"
                          }`}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 4)}%`,
                          }}
                          title={`Block ${blk.block_id}: ${blk.start_time}-${blk.end_time} (${blk.status}) - ${blk.maintenance_team}`}
                        >
                          <span className="truncate">{blk.block_id} ({blk.start_time}-{blk.end_time})</span>
                          <span className="text-[9px] uppercase font-mono px-1 rounded bg-black/20">{blk.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Existing Blocks Table */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Roster of Registered Railway Blocks
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Block ID</th>
                <th className="py-2.5 px-3">Linked Request</th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Window</th>
                <th className="py-2.5 px-3">Maintenance Team</th>
                <th className="py-2.5 px-3">AI Optimization</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {blocks.map((blk) => (
                <tr key={blk.block_id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{blk.block_id}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{blk.request_id || "Direct Dispatch"}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{blk.section_id}</td>
                  <td className="py-2.5 px-3">{blk.asset_id || "Infrastructure"}</td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-amber-300">{blk.start_time}</span> –{" "}
                    <span className="text-amber-300">{blk.end_time}</span>
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
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleDeleteBlock(blk.id)}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-rose-400 hover:border-rose-700 border border-slate-700"
                      title="Cancel Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
