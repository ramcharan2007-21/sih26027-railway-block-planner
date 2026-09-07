import React from "react";

export default function MetricCard({ title, value, subtext, icon: Icon, color = "cyan", badge }) {
  const colorMap = {
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20",
    emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20",
    amber: "text-amber-400 border-amber-500/30 bg-amber-950/20",
    rose: "text-rose-400 border-rose-500/30 bg-rose-950/20",
    indigo: "text-indigo-400 border-indigo-500/30 bg-indigo-950/20",
  };

  const iconBgMap = {
    cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  };

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${colorMap[color] || colorMap.cyan}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBgMap[color] || iconBgMap.cyan}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {badge && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
