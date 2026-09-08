import React, { useState } from "react";
import { Shield, RefreshCw, Sliders, Database, Server, Key, CheckCircle, ExternalLink, Lock } from "lucide-react";
import { api } from "../services/api";

export default function Settings({ currentUser, setCurrentUser, onResetDemo }) {
  const [resetting, setResetting] = useState(false);
  const [priorityWeight, setPriorityWeight] = useState(25);
  const [delayWeight, setDelayWeight] = useState(1.0);
  const [bufferMins, setBufferMins] = useState(5);
  const [savedSettings, setSavedSettings] = useState(false);

  const [switchToast, setSwitchToast] = useState(null);
  const isAdmin = currentUser?.username === "admin";

  const demoRoles = [
    { 
      username: "controller", 
      name: "Rajesh Sharma", 
      role: "Chief Section Controller", 
      badge: "Controller",
      authority: "Corridor Operating Command",
      desc: "Full operational authority across corridor sections.",
      perms: ["Approve / Reject Blocks", "Timetable Management", "Live Corridor Dispatch"],
      denied: ["Cannot calibrate AI weights", "Cannot edit asset register"]
    },
    { 
      username: "cohost", 
      name: "Co-Host Controller (Joint Operations)", 
      role: "Co-Host Controller", 
      badge: "Co-Host",
      authority: "Joint Operations & Simulation",
      desc: "Joint operating authority for hackathon team & co-controllers.",
      perms: ["Co-Approve AI Blocks", "Run Conflict Sim", "Live Telemetry Access"],
      denied: ["Cannot calibrate AI weights", "Cannot edit asset register"]
    },
    { 
      username: "engineer", 
      name: "Vikram Patel", 
      role: "Sr. Section Engineer (P-Way)", 
      badge: "Maintenance",
      authority: "Permanent Way & Asset Health",
      desc: "Engineering team submitting track and asset maintenance requests.",
      perms: ["Submit Block Requests", "Add/Edit Assets & Health", "Inspection Logs"],
      denied: ["Cannot approve blocks", "Timetable is read-only", "Cannot calibrate AI weights"]
    },
    { 
      username: "admin", 
      name: "Priya Nair", 
      role: "System Administrator", 
      badge: "Admin",
      authority: "Enterprise Governance & AI Tuning",
      desc: "Calibrate AI multi-objective weights & configure CRIS integrations.",
      perms: ["Tune AI Penalty Weights", "Database Demo Reset", "CRIS Connector Config", "Emergency Overrides"],
      denied: []
    },
  ];

  const handleSwitchUser = (user) => {
    setCurrentUser({
      username: user.username,
      full_name: user.name,
      role: user.role,
    });
    setSwitchToast(`Active profile switched to: ${user.name} (${user.role})`);
    setTimeout(() => setSwitchToast(null), 3500);
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
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Active Controller Profile & Role-Based Access (RBAC)
            </h2>
            <p className="text-xs text-slate-400">
              Click any profile to instantly assume that operational role across the system.
            </p>
          </div>

          {switchToast && (
            <div className="p-2 px-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center space-x-2 shadow-lg animate-pulse">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{switchToast}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoRoles.map((r) => {
            const isActive = currentUser?.username === r.username;
            return (
              <div
                key={r.username}
                onClick={() => handleSwitchUser(r)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isActive
                    ? "bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50"
                    : "bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">{r.badge}</span>
                    {isActive ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-400 text-slate-950 shadow">
                        CURRENT ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 hover:text-slate-300">
                        Click to activate
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2 leading-tight">{r.name}</h3>
                  <p className="text-[11px] text-cyan-300/80 font-mono mt-0.5">{r.role}</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{r.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Authority Level:
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold block">
                      {r.authority}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Allowed Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {r.perms.map((p, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                        >
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {r.denied && r.denied.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                        Strict Restrictions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {r.denied.map((d, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-400 border border-rose-900/60"
                          >
                            ✕ {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-right">
                    <button
                      className={`text-xs font-bold transition flex items-center justify-end space-x-1 w-full ${
                        isActive ? "text-emerald-400" : "text-cyan-400 hover:text-cyan-300 hover:underline"
                      }`}
                    >
                      <span>{isActive ? "Active Profile ✓" : "Switch to this role ➔"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optimization Tuning Parameters */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Optimization Engine Scoring Weights
          </h2>
          {isAdmin ? (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
              Admin Access: Calibrate Weights
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-amber-800/50 font-mono flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read Only (Admin Required)
            </span>
          )}
        </div>

        {!isAdmin && (
          <div className="mb-4 p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center space-x-2.5 text-amber-300 text-xs">
            <Lock className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              <strong>Parameters Locked:</strong> Active role (<strong>{currentUser?.role}</strong>) cannot modify AI objective penalty weights. Switch above to <strong>System Administrator (Priya Nair)</strong> to calibrate.
            </span>
          </div>
        )}

        <form onSubmit={handleSaveWeights} className="space-y-4 text-xs max-w-xl">
          <div className={!isAdmin ? "opacity-50 pointer-events-none" : ""}>
            <div className="flex justify-between font-semibold mb-1">
              <label className="text-slate-300">Asset Priority Weight (Urgency Multiplier)</label>
              <span className="font-mono text-cyan-400">{priorityWeight} pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              disabled={!isAdmin}
              value={priorityWeight}
              onChange={(e) => setPriorityWeight(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 disabled:cursor-not-allowed"
            />
          </div>

          <div className={!isAdmin ? "opacity-50 pointer-events-none" : ""}>
            <div className="flex justify-between font-semibold mb-1">
              <label className="text-slate-300">Train Delay Penalty Weight (per minute delay)</label>
              <span className="font-mono text-rose-400">-{delayWeight} pts/min</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              disabled={!isAdmin}
              value={delayWeight}
              onChange={(e) => setDelayWeight(Number(e.target.value))}
              className="w-full accent-rose-400 bg-slate-950 disabled:cursor-not-allowed"
            />
          </div>

          <div className={!isAdmin ? "opacity-50 pointer-events-none" : ""}>
            <div className="flex justify-between font-semibold mb-1">
              <label className="text-slate-300">Safety Buffer Clearance Time</label>
              <span className="font-mono text-amber-400">{bufferMins} Minutes</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              disabled={!isAdmin}
              value={bufferMins}
              onChange={(e) => setBufferMins(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-950 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            {isAdmin ? (
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
              >
                Update Solver Weights
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold flex items-center space-x-1.5 cursor-not-allowed opacity-60"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Weights Locked (Admin Only)</span>
              </button>
            )}
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
          disabled={resetting || !isAdmin}
          className={`px-4 py-2.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition self-start sm:self-auto ${
            isAdmin
              ? "bg-rose-950 hover:bg-rose-900 text-rose-200 border-rose-800 shadow-lg shadow-rose-950/40"
              : "bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-60"
          }`}
        >
          {isAdmin ? (
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          <span>
            {resetting
              ? "Resetting Database..."
              : isAdmin
              ? "Reset All Data to Demo State"
              : "Reset Locked (Admin Only)"}
          </span>
        </button>
      </div>
    </div>
  );
}
