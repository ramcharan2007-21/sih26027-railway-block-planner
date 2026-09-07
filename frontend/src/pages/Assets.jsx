import React, { useState, useEffect } from "react";
import { Shield, Plus, Edit2, Trash2, Search, Filter, AlertCircle, Wrench, Cpu, CheckCircle } from "lucide-react";
import { api } from "../services/api";

export default function Assets({ onSelectRequestForAI, setActiveTab }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialForm = {
    asset_id: "",
    name: "",
    asset_type: "Signal",
    section_id: "A-B",
    condition: "Needs Repair",
    status: "Maintenance Required",
    priority: "High",
    last_inspected: "2026-08-20",
    health_index: 45,
  };
  const [formData, setFormData] = useState(initialForm);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await api.getAssets(selectedSection, selectedStatus);
      setAssets(data);
    } catch (err) {
      console.error("Error loading assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [selectedSection, selectedStatus]);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asset) => {
    setFormData({
      asset_id: asset.asset_id,
      name: asset.name,
      asset_type: asset.asset_type,
      section_id: asset.section_id,
      condition: asset.condition,
      status: asset.status,
      priority: asset.priority,
      last_inspected: asset.last_inspected || "",
      health_index: asset.health_index,
    });
    setIsEditing(true);
    setEditingId(asset.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await api.deleteAsset(id);
      loadAssets();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateAsset(editingId, formData);
      } else {
        await api.addAsset(formData);
      }
      setIsModalOpen(false);
      loadAssets();
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.asset_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Railway Infrastructure Asset Management
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time health telemetry across Signals, Tracks, Points, Bridges, and Overhead Catenary (OHE).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Filter and Highlights Bar */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset ID, type, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-slate-900 text-xs text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">All Sections</option>
            <option value="A-B">Section A-B</option>
            <option value="B-C">Section B-C</option>
            <option value="C-D">Section C-D</option>
            <option value="D-E">Section D-E</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 text-xs text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Maintenance Required">Needs Maintenance</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Operational">Operational</option>
          </select>
        </div>
      </div>

      {/* Assets Grid / Table */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Maintenance Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Health Index</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredAssets.map((ast) => {
                const isUrgent = ast.status === "Maintenance Required" || ast.condition === "Needs Repair";
                return (
                  <tr
                    key={ast.id}
                    className={`hover:bg-slate-800/30 transition ${
                      isUrgent ? "bg-rose-950/15" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400 flex items-center space-x-1.5">
                      {isUrgent && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{ast.asset_id}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{ast.name}</td>
                    <td className="py-3 px-4 text-slate-400">{ast.asset_type}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-semibold border border-slate-700">
                        {ast.section_id}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ast.condition === "Needs Repair" || ast.condition === "Critical"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : ast.condition === "Needs Inspection"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {ast.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ast.status === "Maintenance Required"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : ast.status === "Under Maintenance"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {ast.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ast.priority === "High"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {ast.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
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
                        <span className="font-mono text-xs">{ast.health_index}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(ast)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                        title="Edit Asset"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ast.id)}
                        className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-rose-400 hover:border-rose-700 border border-slate-700"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Edit Asset ${formData.asset_id}` : "Register New Railway Asset"}
              </h3>
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
                  <label className="text-slate-400 font-semibold block mb-1">Asset ID *</label>
                  <input
                    type="text"
                    required
                    disabled={isEditing}
                    value={formData.asset_id}
                    onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                    placeholder="e.g. S102, TRK-014"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Auto Color Light Signal S102"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
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
                    <option value="Interlocking">Interlocking</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Section Location</label>
                  <select
                    value={formData.section_id}
                    onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="A-B">Section A-B (New Delhi - Ghaziabad)</option>
                    <option value="B-C">Section B-C (Ghaziabad - Aligarh)</option>
                    <option value="C-D">Section C-D (Aligarh - Kanpur)</option>
                    <option value="D-E">Section D-E (Kanpur - Prayagraj)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Good">Good</option>
                    <option value="Needs Inspection">Needs Inspection</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Maintenance Required">Maintenance Required</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Health Index (0 - 100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.health_index}
                    onChange={(e) => setFormData({ ...formData, health_index: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Last Inspected Date</label>
                  <input
                    type="date"
                    value={formData.last_inspected}
                    onChange={(e) => setFormData({ ...formData, last_inspected: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
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
                  {isEditing ? "Update Asset" : "Register Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
