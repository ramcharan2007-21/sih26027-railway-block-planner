import React, { useState, useEffect } from "react";
import { Clock, Layers, Calendar, CheckCircle2, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { api } from "../services/api";

export default function Availability() {
  const [sections, setSections] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const activeBlocksCount = blocks.filter((b) => b.status === "Active").length;
  const plannedBlocksCount = blocks.filter((b) => b.status === "Planned").length;

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
              Track & Block Availability
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time schedule and roster across railway corridor sections. Oversees active and registered maintenance block possessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Active:</span>
            <span className="text-rose-400 font-bold">{activeBlocksCount}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Planned:</span>
            <span className="text-amber-400 font-bold">{plannedBlocksCount}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Sections:</span>
            <span className="text-cyan-300 font-bold">{sections.length}</span>
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
                <th className="py-2.5 px-3">Component</th>
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
