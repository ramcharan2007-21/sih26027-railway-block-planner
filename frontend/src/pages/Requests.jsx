import React, { useState, useEffect } from "react";
import { Bell, Plus, Cpu, Trash2, Edit2, CheckCircle2, Clock, AlertTriangle, ArrowRight, Lock, ShieldCheck, Wrench } from "lucide-react";
import { api } from "../services/api";

export default function Requests({ onSelectRequestForAI, setActiveTab, currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManageRequests = currentUser?.username === "engineer" || currentUser?.username === "admin";

  const initialForm = {
    request_id: `MR${Math.floor(100 + Math.random() * 900)}`,
    asset_id: "S102",
    asset_type: "Signal",
    section_id: "A-B",
    maintenance_type: "Signal Repair & Relay Overhaul",
    required_duration: 2.0,
    priority: "High",
    requested_date: "2026-09-08",
    status: "Pending",
    created_by: currentUser?.role || "SSE / Signal GZB",
  };
  const [formData, setFormData] = useState(initialForm);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getMaintenanceRequests();
      setRequests(data);
    } catch (err) {
      console.error("Error loading requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      request_id: `MR${Math.floor(100 + Math.random() * 900)}`,
      created_by: currentUser?.role || "SSE / Signal GZB",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this maintenance request?")) return;
    try {
      await api.deleteMaintenanceRequest(id);
      loadRequests();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createMaintenanceRequest(formData);
      setIsModalOpen(false);
      loadRequests();
    } catch (err) {
      alert("Failed to submit request: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Maintenance Requests Dispatch Pipeline
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Submit, track and dispatch railway maintenance requests directly to the AI Block Planning engine.
          </p>
        </div>

        {canManageRequests ? (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Maintenance Request</span>
          </button>
        ) : (
          <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono flex items-center gap-1.5 self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Requisitions initiated by Engineers</span>
          </div>
        )}
      </div>

      {/* Role Notice Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          {canManageRequests ? (
            <>
              <Wrench className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong>ENGINEERING WORKBENCH:</strong> As <strong>{currentUser?.role || "Engineer"}</strong>, you can raise new track / signal work orders and submit them for corridor planning.
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span className="text-slate-300">
                <strong>OPERATIONAL DISPATCH BENCH:</strong> As <strong>{currentUser?.role || "Controller"}</strong>, you evaluate engineering requests and click <strong>Plan with AI</strong> to find conflict-free maintenance slots.
              </span>
            </>
          )}
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 hidden sm:inline-block">
          Active: {currentUser?.username?.toUpperCase()}
        </span>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req) => {
          const isPending = req.status === "Pending";
          return (
            <div
              key={req.id}
              className={`p-5 rounded-xl border transition ${
                isPending
                  ? "bg-slate-900/90 border-slate-700 hover:border-cyan-500/50"
                  : "bg-slate-950/60 border-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-cyan-400">{req.request_id}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 font-mono">Sec {req.section_id}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.priority === "High"
                        ? "bg-rose-950 text-rose-300 border border-rose-800"
                        : "bg-amber-950 text-amber-300 border border-amber-800"
                    }`}
                  >
                    {req.priority} Priority
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === "Approved"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : req.status === "Pending"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-white">{req.maintenance_type}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Target Asset: <strong className="text-slate-300">{req.asset_id}</strong> ({req.asset_type})
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Duration Window</span>
                  <span className="font-mono font-bold text-amber-400">{req.required_duration} Hours</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Target Date</span>
                  <span className="font-mono text-slate-300">{req.requested_date}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">By: {req.created_by}</span>

                <div className="flex items-center space-x-2">
                  {isPending && (
                    <button
                      onClick={() => {
                        if (onSelectRequestForAI) onSelectRequestForAI(req.request_id);
                        setActiveTab("planner");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Plan with AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canManageRequests && (
                    <button
                      onClick={() => handleDelete(req.id)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-rose-400 hover:border-rose-700 border border-slate-700"
                      title="Delete Request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Maintenance Request</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Request ID</label>
                  <input
                    type="text"
                    required
                    value={formData.request_id}
                    onChange={(e) => setFormData({ ...formData, request_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Asset ID</label>
                  <input
                    type="text"
                    required
                    value={formData.asset_id}
                    onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                    placeholder="e.g. S102, OHE-88"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Asset Type</label>
                  <select
                    value={formData.asset_type}
                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Signal">Signal</option>
                    <option value="Track">Track</option>
                    <option value="Point / Switch">Point / Switch</option>
                    <option value="Bridge">Bridge</option>
                    <option value="Overhead Equipment (OHE)">Overhead Equipment (OHE)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Section</label>
                  <select
                    value={formData.section_id}
                    onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="A-B">Section A-B</option>
                    <option value="B-C">Section B-C</option>
                    <option value="C-D">Section C-D</option>
                    <option value="D-E">Section D-E</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Maintenance Work Required *</label>
                <input
                  type="text"
                  required
                  value={formData.maintenance_type}
                  onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                  placeholder="e.g. Signal Repair, Catenary Wire Splicing"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Duration (Hours) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    required
                    value={formData.required_duration}
                    onChange={(e) => setFormData({ ...formData, required_duration: parseFloat(e.target.value) || 2.0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Requested Date</label>
                  <input
                    type="date"
                    required
                    value={formData.requested_date}
                    onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Created By (Engineering Unit)</label>
                <input
                  type="text"
                  value={formData.created_by}
                  onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                  placeholder="e.g. SSE / Signal GZB"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
