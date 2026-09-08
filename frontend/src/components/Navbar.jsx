import React, { useState, useEffect } from "react";
import { Train, RefreshCw, Shield, Bell, Clock, Activity, Cpu } from "lucide-react";
import { api } from "../services/api";

export default function Navbar({ activeTab, setActiveTab, currentUser, setCurrentUser, onResetDemo, onOpenRoleModal }) {
  const [timeStr, setTimeStr] = useState("");
  const [resetting, setResetting] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const demoProfiles = [
    { username: "controller", name: "Rajesh Sharma", role: "Chief Section Controller", badge: "Controller" },
    { username: "cohost", name: "Co-Host Controller (Joint Operations)", role: "Co-Host Controller", badge: "Co-Host" },
    { username: "engineer", name: "Vikram Patel", role: "Sr. Section Engineer (P-Way)", badge: "Maintenance" },
    { username: "admin", name: "Priya Nair", role: "System Administrator", badge: "Admin" },
  ];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = async () => {
    try {
      setResetting(true);
      await api.resetDemo();
      if (onResetDemo) onResetDemo();
      alert("System restored to official SIH26027 demo scenario state!");
    } catch (err) {
      alert("Reset failed: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "planner", label: "AI Block Planner", icon: Cpu, badge: "AI" },
    { id: "map", label: "Railway Map", icon: Activity },
    { id: "trains", label: "Trains", icon: Train },
    { id: "assets", label: "Components", icon: Shield },
    { id: "requests", label: "Requests", icon: Bell },
    { id: "availability", label: "Block Availability", icon: Clock },
    { id: "conflicts", label: "Conflicts", icon: Bell, alert: true },
    { id: "analytics", label: "Analytics", icon: Activity },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Org */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 via-red-700 to-rose-900 flex items-center justify-center shadow-lg shadow-red-900/30 border border-amber-500/40">
              <Train className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  IR-<span className="text-cyan-400">BlockPlan</span> <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">AI</span>
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  SIH26027
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Ministry of Railways • Automated Component Block Planning System
              </p>
            </div>
          </div>

          {/* Right Status Info */}
          <div className="flex items-center space-x-4">
            {/* Live Clock */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-mono text-cyan-300 tracking-wider font-semibold">
                {timeStr || "10:00:00 IST"}
              </span>
            </div>

            {/* Simulated Data Badge */}
            <div className="hidden lg:flex items-center text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-700 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
              SIMULATED RAILWAY DATA
            </div>

            {/* Quick Demo Reset Button */}
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Reset database to initial SIH26027 scenario state"
              className="flex items-center space-x-1.5 text-xs bg-cyan-950 hover:bg-cyan-900 text-cyan-300 px-3 py-1.5 rounded-md border border-cyan-700/60 transition shadow-sm font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
              <span>{resetting ? "Resetting..." : "SIH Demo State"}</span>
            </button>

            {/* Interactive User Profile Pill & Quick Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 pl-2 border-l border-slate-800 hover:bg-slate-800/60 p-1.5 rounded-lg transition"
                title="Click to switch controller / co-host role"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-300">
                  {currentUser?.role?.[0] || "C"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser?.full_name?.split(" ")[0] || "Chief"}
                  </p>
                  <p className="text-[10px] text-cyan-400 uppercase font-mono leading-tight">
                    {currentUser?.role || "Controller"} ▾
                  </p>
                </div>
              </button>

              {/* Floating Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs backdrop-blur-md">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Active Operational Role
                  </div>
                  {demoProfiles.map((p) => {
                    const isSelected = currentUser?.username === p.username;
                    return (
                      <button
                        key={p.username}
                        onClick={() => {
                          if (setCurrentUser) {
                            setCurrentUser({
                              username: p.username,
                              full_name: p.name,
                              role: p.role,
                            });
                          }
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800/80 transition ${
                          isSelected ? "bg-cyan-950/60 text-cyan-300 font-bold" : "text-slate-300"
                        }`}
                      >
                        <div>
                          <p className="text-xs">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{p.role}</p>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-extrabold">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <div className="pt-1.5 border-t border-slate-800 px-3">
                    <button
                      onClick={() => {
                        if (onOpenRoleModal) onOpenRoleModal();
                        setShowUserMenu(false);
                      }}
                      className="text-[11px] text-cyan-400 hover:underline block py-0.5"
                    >
                      View Full RBAC Matrix & Role Authority ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isActive ? "bg-slate-950 text-cyan-400" : "bg-cyan-950 text-cyan-400 border border-cyan-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
