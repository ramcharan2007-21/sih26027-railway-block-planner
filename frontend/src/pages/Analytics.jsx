import React, { useState, useEffect } from "react";
import { Activity, TrendingUp, CheckCircle2, ShieldCheck, Clock, BarChart3, PieChart, Server } from "lucide-react";
import MetricCard from "../components/MetricCard";
import { api } from "../services/api";

export default function Analytics() {
  const [chartData, setChartData] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [charts, kpiData] = await Promise.all([
          api.getChartData(),
          api.getKPIs(),
        ]);
        setChartData(charts);
        setKpis(kpiData);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Railway Punctuality & Component Availability Analytics
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Comparative performance metrics: Manual Block Planning vs. AI-Optimized Automatic Scheduling.
          </p>
        </div>

        <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-amber-300 font-mono">
          DEMO ANALYTICS SIMULATION
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Delay Reduction"
          value="-78.4%"
          subtext="From 42 mins to 8 mins avg delay"
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          title="Conflicts Avoided"
          value={kpis?.conflicts_avoided ?? 18}
          subtext="Zero passenger holding"
          icon={CheckCircle2}
          color="cyan"
        />
        <MetricCard
          title="Component Availability"
          value={`${kpis?.asset_availability_pct ?? 96.2}%`}
          subtext="+8.0% gain over 4 months"
          icon={ShieldCheck}
          color="indigo"
        />
        <MetricCard
          title="Maintenance Rate"
          value="93.8%"
          subtext="On-schedule work completion"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Main Chart 1: Delay Comparison Before vs After Optimization */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Train Delays by Section: Before vs After AI Optimization
            </h2>
            <p className="text-xs text-slate-400">
              Average delay (minutes) imposed on train operations per scheduled maintenance block.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded bg-rose-500"></span> Manual Planning (Before)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded bg-emerald-500"></span> AI Optimized (After)
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {chartData?.delay_comparison?.map((row) => (
            <div key={row.section} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300 font-bold">{row.section}</span>
                <span className="font-mono text-slate-400">
                  <span className="text-rose-400 font-bold">{row.manual_planning_delay}m</span> ➔{" "}
                  <span className="text-emerald-400 font-bold">{row.ai_optimized_delay}m</span> (-
                  {Math.round(
                    ((row.manual_planning_delay - row.ai_optimized_delay) / row.manual_planning_delay) * 100
                  )}
                  %)
                </span>
              </div>

              {/* Stacked comparison bar */}
              <div className="grid grid-cols-2 gap-2">
                <div className="h-6 bg-slate-950 rounded-md overflow-hidden flex items-center p-1 border border-slate-800">
                  <div
                    className="h-full bg-rose-600 rounded flex items-center px-2 text-[10px] font-bold text-white font-mono transition-all duration-500"
                    style={{ width: `${(row.manual_planning_delay / 70) * 100}%` }}
                  >
                    {row.manual_planning_delay} min
                  </div>
                </div>
                <div className="h-6 bg-slate-950 rounded-md overflow-hidden flex items-center p-1 border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded flex items-center px-2 text-[10px] font-bold text-slate-950 font-mono transition-all duration-500"
                    style={{ width: `${(row.ai_optimized_delay / 70) * 100}%` }}
                  >
                    {row.ai_optimized_delay} min
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Conflicts Avoided Trend & Asset Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Conflicts Avoided */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Weekly Conflicts Detected vs Avoided by AI
          </h2>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-800">
            {chartData?.conflicts_avoided_trend?.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Detected */}
                  <div
                    className="w-3 bg-rose-500/70 rounded-t"
                    style={{ height: `${(item.detected / 16) * 100}%` }}
                    title={`Detected: ${item.detected}`}
                  ></div>
                  {/* Avoided */}
                  <div
                    className="w-3 bg-emerald-500 rounded-t shadow-lg shadow-emerald-500/30"
                    style={{ height: `${(item.avoided_by_ai / 16) * 100}%` }}
                    title={`Avoided by AI: ${item.avoided_by_ai}`}
                  ></div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2">
            <span>Red: Potential Conflicts</span>
            <span className="text-emerald-400 font-bold">Green: Avoided via AI Rescheduling</span>
          </div>
        </div>

        {/* Component Availability Trend */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Component Availability Trajectory (May – Sep 2026)
          </h2>

          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-800">
            {chartData?.asset_availability_trend?.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-8 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t shadow-lg shadow-cyan-500/20 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950"
                  style={{ height: `${((item.availability - 80) / 20) * 100}%` }}
                >
                  {item.availability}%
                </div>
                <span className="text-[11px] font-mono text-slate-400">{item.month}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-3 pt-2">
            Continuous predictive maintenance increased overall railway component uptime from 88.2% to <strong>96.2%</strong>.
          </p>
        </div>
      </div>

      {/* Enterprise Indian Railways API Connector Readiness */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Indian Railways Enterprise System Integration (CRIS Connectors)
        </h2>

        <p className="text-xs text-slate-400">
          This AI Block Planning architecture is engineered for seamless data interoperability with official Indian Railways (CRIS) production software systems:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 font-mono text-sm">FOIS Connector</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                Schema Ready
              </span>
            </div>
            <p className="text-slate-200 font-medium">Freight Operations Information System</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ingests real-time freight rake positioning, coal/container siding departures, section transit speeds, and freight corridor priority windows.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 font-mono text-sm">COA / TMS Connector</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                Schema Ready
              </span>
            </div>
            <p className="text-slate-200 font-medium">Control Office Application & Track Management System</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Synchronizes electronic master charts, section controller log sheets, permanent way ultrasonic rail flaw detection, and temporary speed restrictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
