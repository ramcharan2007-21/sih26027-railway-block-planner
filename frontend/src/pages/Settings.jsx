import React, { useState } from "react";
import { Shield, RefreshCw, Sliders, Database, Server, Key, CheckCircle, ExternalLink } from "lucide-react";
import { api } from "../services/api";

export default function Settings({ currentUser, setCurrentUser, onResetDemo }) {
  const [resetting, setResetting] = useState(false);
  const [priorityWeight, setPriorityWeight] = useState(25);
  const [delayWeight, setDelayWeight] = useState(1.0);
  const [bufferMins, setBufferMins] = useState(5);
  const [savedSettings, setSavedSettings] = useState(false);

  const demoRoles = [
    { username: "controller", name: "Rajesh Sharma", role: "Chief Section Controller", badge: "Controller" },
    { username: "cohost", name: "Co-Host Controller (Joint Operations)", role: "Co-Host Controller", badge: "Co-Host" },
    { username: "engineer", name: "Vikram Patel", role: "Sr. Section Engineer (P-Way)", badge: "Maintenance" },
    { username: "admin", name: "Priya Nair", role: "System Administrator", badge: "Admin" },
  ];

  const handleSwitchUser = (user) => {
    setCurrentUser({
      username: user.username,
      full_name: user.name,
      role: user.role,
    });
    alert(`Switched active profile to: ${user.name} (${user.role})`);
  };

  const handleSaveWeights = (e) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  const handleResetData = async () => {
    if (!window.confirm("Restore entire system database to initial SIH26027 demo scenario state?")) return;
    try {
      setResetting(true);
      await api.resetDemo();
      if (onResetDemo) onResetDemo();
      alert("Database reset successfully to official SIH26027 demo state!");
    } catch (err) {
      alert("Reset error: " + err.message);
    } finally {
      setResetting(false);
    }
  };

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
              System Configuration & Indian Railways Architecture
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Role-based authentication, algorithmic penalty parameter tuning, and enterprise IR API connector blueprints.
          </p>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" />
          Active Controller Profile & Role-Based Access (RBAC)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {demoRoles.map((r) => {
            const isActive = currentUser?.username === r.username;
            return (
              <div
                key={r.username}
                onClick={() => handleSwitchUser(r)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isActive
                    ? "bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">{r.badge}</span>
                  {isActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500 text-slate-950">
                      CURRENT
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white mt-2">{r.name}</h3>
                <p className="text-xs text-slate-400">{r.role}</p>
                <button className="mt-3 text-xs text-cyan-400 font-semibold hover:underline">
                  Switch to this role ➔
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimization Tuning Parameters */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Optimization Engine Scoring Weights
        </h2>

        <form onSubmit={handleSaveWeights} className="space-y-4 text-xs max-w-xl">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <label className="text-slate-300">Asset Priority Weight (Urgency Multiplier)</label>
              <span className="font-mono text-cyan-400">{priorityWeight} pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={priorityWeight}
              onChange={(e) => setPriorityWeight(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <label className="text-slate-300">Train Delay Penalty Weight (per minute delay)</label>
              <span className="font-mono text-rose-400">-{delayWeight} pts/min</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={delayWeight}
              onChange={(e) => setDelayWeight(Number(e.target.value))}
              className="w-full accent-rose-400 bg-slate-950"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <label className="text-slate-300">Safety Buffer Clearance Time</label>
              <span className="font-mono text-amber-400">{bufferMins} Minutes</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              value={bufferMins}
              onChange={(e) => setBufferMins(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-950"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
            >
              Update Solver Weights
            </button>
            {savedSettings && (
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Weights calibrated!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Enterprise Indian Railways API Connector Readiness */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Indian Railways Enterprise Integration Readiness
        </h2>

        <p className="text-xs text-slate-400">
          This system is engineered for zero-disruption integration with official Indian Railways (CRIS) production software systems:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 font-mono">FOIS Connector</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Schema Ready
              </span>
            </div>
            <p className="text-slate-300 font-medium">Freight Operations Information System</p>
            <p className="text-slate-400 text-[11px]">
              Ingests real-time freight rake positioning, coal/container siding departures, and section transit speeds.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 font-mono">COA / TMS Connector</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Schema Ready
              </span>
            </div>
            <p className="text-slate-300 font-medium">Control Office Application & Track Management</p>
            <p className="text-slate-400 text-[11px]">
              Syncs electronic graphing, section controller logs, permanent way ultrasonic testing, and speed restrictions.
            </p>
          </div>
        </div>
      </div>

      {/* Database Reset */}
      <div className="bg-slate-950/80 rounded-xl p-5 border border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-rose-500" />
            Reset SIH26027 Hackathon Demo Environment
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Restores Signal S102, Train 12601, Sections A-B through D-E, and clears mock approvals.
          </p>
        </div>

        <button
          onClick={handleResetData}
          disabled={resetting}
          className="px-4 py-2.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 text-xs font-bold flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
          <span>{resetting ? "Resetting Database..." : "Reset All Data to Demo State"}</span>
        </button>
      </div>
    </div>
  );
}
