import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import BlockPlanner from "./pages/BlockPlanner";
import RailwayMap from "./pages/RailwayMap";
import Trains from "./pages/Trains";
import Assets from "./pages/Assets";
import Requests from "./pages/Requests";
import Availability from "./pages/Availability";
import Conflicts from "./pages/Conflicts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedReqForAI, setSelectedReqForAI] = useState("MR001");
  const [currentUser, setCurrentUser] = useState({
    username: "controller",
    full_name: "Rajesh Sharma",
    role: "Chief Section Controller",
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResetDemo = () => {
    setRefreshKey((prev) => prev + 1);
    setSelectedReqForAI("MR001");
  };

  const handleSelectRequestForAI = (reqId) => {
    setSelectedReqForAI(reqId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <Dashboard
            key={`dash-${refreshKey}`}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onSelectRequestForAI={handleSelectRequestForAI}
          />
        )}

        {activeTab === "planner" && (
          <BlockPlanner
            key={`plan-${refreshKey}-${selectedReqForAI}`}
            currentUser={currentUser}
            preselectedRequestId={selectedReqForAI}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "map" && (
          <RailwayMap
            key={`map-${refreshKey}`}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onSelectRequestForAI={handleSelectRequestForAI}
          />
        )}

        {activeTab === "trains" && (
          <Trains key={`trains-${refreshKey}`} currentUser={currentUser} />
        )}

        {activeTab === "assets" && (
          <Assets
            key={`assets-${refreshKey}`}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onSelectRequestForAI={handleSelectRequestForAI}
          />
        )}

        {activeTab === "requests" && (
          <Requests
            key={`reqs-${refreshKey}`}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onSelectRequestForAI={handleSelectRequestForAI}
          />
        )}

        {activeTab === "availability" && (
          <Availability key={`avail-${refreshKey}`} currentUser={currentUser} />
        )}

        {activeTab === "conflicts" && (
          <Conflicts
            key={`conf-${refreshKey}`}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onSelectRequestForAI={handleSelectRequestForAI}
          />
        )}

        {activeTab === "analytics" && (
          <Analytics key={`anal-${refreshKey}`} />
        )}

        {activeTab === "settings" && (
          <Settings
            key={`sett-${refreshKey}`}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs py-4 px-6 text-center text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Smart India Hackathon 2026 • Problem Statement <strong className="text-slate-300">SIH26027</strong> (Ministry of Railways)
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            AI-Powered Automatic Block Planning Engine • Simulated Demonstration Environment
          </p>
        </div>
      </footer>
    </div>
  );
}
