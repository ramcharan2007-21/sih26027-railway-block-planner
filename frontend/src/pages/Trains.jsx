import React, { useState, useEffect } from "react";
import { Train as TrainIcon, Plus, Trash2, Edit2, Search, Filter, Check, X } from "lucide-react";
import { api } from "../services/api";

export default function Trains() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const initialForm = {
    train_no: "",
    train_name: "",
    source: "",
    destination: "",
    section_id: "A-B",
    arrival_time: "10:30",
    departure_time: "10:35",
    priority: "High",
    train_type: "Superfast Express",
  };
  const [formData, setFormData] = useState(initialForm);

  const loadTrains = async () => {
    try {
      setLoading(true);
      const data = await api.getTrains(selectedSection, selectedPriority);
      setTrains(data);
    } catch (err) {
      console.error("Error loading trains:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrains();
  }, [selectedSection, selectedPriority]);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (train) => {
    setFormData({
      train_no: train.train_no,
      train_name: train.train_name,
      source: train.source,
      destination: train.destination,
      section_id: train.section_id,
      arrival_time: train.arrival_time,
      departure_time: train.departure_time,
      priority: train.priority,
      train_type: train.train_type,
    });
    setIsEditing(true);
    setEditingId(train.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this train schedule?")) return;
    try {
      await api.deleteTrain(id);
      loadTrains();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.updateTrain(editingId, formData);
      } else {
        await api.addTrain(formData);
      }
      setIsModalOpen(false);
      loadTrains();
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  const filteredTrains = trains.filter(
    (t) =>
      t.train_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.train_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrainIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Train Schedule Management
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Maintain passenger timetables, priority hierarchies & section traversal timeframes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-cyan-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Train</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search train no, name, station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
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
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-900 text-xs text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Trains Table */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Train No.</th>
                <th className="py-3 px-4">Train Name</th>
                <th className="py-3 px-4">Route / Section</th>
                <th className="py-3 px-4">Origin ➔ Destination</th>
                <th className="py-3 px-4">Arrival</th>
                <th className="py-3 px-4">Departure</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTrains.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{tr.train_no}</td>
                  <td className="py-3 px-4 font-medium text-white">{tr.train_name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-semibold border border-slate-700">
                      Sec {tr.section_id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {tr.source} ➔ {tr.destination}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-300 font-semibold">{tr.arrival_time}</td>
                  <td className="py-3 px-4 font-mono text-amber-300 font-semibold">{tr.departure_time}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tr.priority === "High"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : tr.priority === "Medium"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {tr.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{tr.train_type}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(tr)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                      title="Edit Train"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tr.id)}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-rose-400 hover:border-rose-700 border border-slate-700"
                      title="Delete Train"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {isEditing ? `Edit Train #${formData.train_no}` : "Add New Train Schedule"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Train Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.train_no}
                    onChange={(e) => setFormData({ ...formData, train_no: e.target.value })}
                    placeholder="e.g. 12601"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Train Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.train_name}
                    onChange={(e) => setFormData({ ...formData, train_name: e.target.value })}
                    placeholder="e.g. Mangalore Mail"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Source Station</label>
                  <input
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g. Chennai Central"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g. Mangalore"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
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
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Arrival Time</label>
                  <input
                    type="time"
                    required
                    value={formData.arrival_time}
                    onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Departure Time</label>
                  <input
                    type="time"
                    required
                    value={formData.departure_time}
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-slate-400 font-semibold block mb-1">Train Type</label>
                  <select
                    value={formData.train_type}
                    onChange={(e) => setFormData({ ...formData, train_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Vande Bharat">Vande Bharat</option>
                    <option value="Rajdhani">Rajdhani</option>
                    <option value="Superfast Express">Superfast Express</option>
                    <option value="Passenger">Passenger</option>
                    <option value="Freight / Goods">Freight / Goods</option>
                  </select>
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
                  {isEditing ? "Update Train" : "Save Train"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
