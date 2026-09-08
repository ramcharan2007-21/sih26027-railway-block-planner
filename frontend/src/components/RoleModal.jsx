import React, { useState } from "react";
import { Key, Shield, ShieldCheck, CheckCircle, Lock, RefreshCw, X, Copy, Link2, ExternalLink } from "lucide-react";
import { api } from "../services/api";

export default function RoleModal({ isOpen, onClose, currentUser, setCurrentUser, onResetDemo }) {
  const [resetting, setResetting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  if (!isOpen) return null;

  const demoRoles = [
    { 
      username: "controller", 
      name: "Rajesh Sharma", 
      role: "Chief Section Controller", 
      badge: "Controller",
      authority: "Corridor Operating Command",
      desc: "Full operational authority across corridor sections. Grants official block possessions and oversees train traffic.",
      perms: ["Approve / Reject Blocks", "Timetable Management", "Live Corridor Dispatch"],
      denied: ["Cannot calibrate AI weights", "Cannot edit asset register"]
    },
    { 
      username: "cohost", 
      name: "Co-Host Controller (Joint Operations)", 
      role: "Co-Host Controller", 
      badge: "Co-Host",
      authority: "Joint Operations & Simulation",
      desc: "Joint operating authority for hackathon team & co-controllers. Performs real-time conflict simulations.",
      perms: ["Co-Approve AI Blocks", "Run Conflict Sim", "Live Telemetry Access"],
      denied: ["Cannot calibrate AI weights", "Cannot edit asset register"]
    },
    { 
      username: "engineer", 
      name: "Vikram Patel", 
      role: "Sr. Section Engineer (P-Way)", 
      badge: "Maintenance",
      authority: "Permanent Way & Asset Health",
      desc: "Field engineering lead submitting track, OHE, and signal maintenance requisitions and inspection data.",
      perms: ["Submit Block Requests", "Add/Edit Assets & Health", "Inspection Logs"],
      denied: ["Cannot approve blocks", "Timetable is read-only", "Cannot calibrate AI weights"]
    },
    { 
      username: "admin", 
      name: "Priya Nair", 
      role: "System Administrator", 
      badge: "Admin",
      authority: "Enterprise Governance & AI Tuning",
      desc: "Configures multi-objective scoring penalty weights, CRIS system connectors, and demo environment state.",
      perms: ["Tune AI Penalty Weights", "Database Demo Reset", "CRIS Connector Config", "Emergency Overrides"],
      denied: []
    },
  ];

  const handleSwitchUser = (user) => {
    if (setCurrentUser) {
      setCurrentUser({
        username: user.username,
        full_name: user.name,
        role: user.role,
      });
    }
    setToastMsg(`Switched active role to: ${user.name} (${user.role})`);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  const handleResetData = async () => {
    if (!window.confirm("Restore entire system database to initial SIH26027 demo scenario state?")) return;
    try {
      setResetting(true);
      await api.resetDemo();
      if (onResetDemo) onResetDemo();
      setToastMsg("Database successfully reset to official SIH26027 demo state!");
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      alert("Reset error: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  const isAdmin = currentUser?.username === "admin";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Active Operational Profile & Role-Based Access (RBAC)
              </h2>
              <p className="text-xs text-slate-400">
                Select any operational role below to immediately assume its authority, view permissions, and test role-restricted features.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center space-x-2 shadow-lg animate-pulse">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Direct Shareable Links for Co-Host & Controllers */}
        <div className="bg-slate-950/90 rounded-xl p-3.5 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Link2 className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Direct Co-Host Link (Joint Operations):
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                {window.location.origin}/?role=cohost
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const url = `${window.location.origin}/?role=cohost`;
                navigator.clipboard.writeText(url);
                setToastMsg("Co-Host direct link copied to clipboard!");
                setTimeout(() => setToastMsg(null), 2500);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Co-Host Link</span>
            </button>
            <a
              href={`${window.location.origin}/?role=cohost`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Database Demo Reset Footer (for Admin or Demo Testers) */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              SIH26027 Demonstration Environment
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Reset Signal S102, Train 12601 on Section A-B, and clear simulated approvals.
            </p>
          </div>

          <button
            onClick={handleResetData}
            disabled={resetting || !isAdmin}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition self-start sm:self-auto ${
              isAdmin
                ? "bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 shadow-md"
                : "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60"
            }`}
          >
            {isAdmin ? (
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>
              {resetting
                ? "Resetting..."
                : isAdmin
                ? "Reset Demo Database"
                : "Demo Reset (Admin Only)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
