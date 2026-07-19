import { useState, useEffect } from "react";
import { Header } from "./components/Header.js";
import { ConfigPanel } from "./components/ConfigPanel.js";
import { MatchList } from "./components/MatchList.js";
import { ManualInputModal } from "./components/ManualInputModal.js";
import { PredictionConsole } from "./components/PredictionConsole.js";
import { CouponList } from "./components/CouponList.js";
import { SystemConsoleLogs } from "./components/SystemConsoleLogs.js";
import { PositionalNeuralDashboard } from "./components/PositionalNeuralDashboard.js";
import { DashboardState, Match } from "./types.js";
import { ShieldCheck, HelpCircle, Layers, Landmark } from "lucide-react";

export default function App() {
  const [state, setState] = useState<DashboardState | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<"fixtures" | "predictions" | "neural">("fixtures");

  // Helper to handle API responses safely (avoiding JSON parsing errors on HTML fallback pages during server boot/restarts)
  const handleResponse = async (res: Response) => {
    if (!res.ok) {
      let msg = `Server error (Status ${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson.error) msg = errJson.error;
      } catch (_) {}
      throw new Error(msg);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server responded with HTML. The backend might be starting or restarting. Please try again in a few seconds.");
    }
    return res.json();
  };

  // Load state on mount
  useEffect(() => {
    fetch("/api/state")
      .then(handleResponse)
      .then((data) => setState(data))
      .catch((err) => console.error("Failed to load initial state:", err));
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Layers className="h-10 w-10 text-blue-500 animate-spin" />
          <h3 className="font-display font-semibold text-lg">
            Warming Bayesian Prediction Core...
          </h3>
          <p className="text-slate-500 text-xs font-mono">Initializing local cache indices (Or server is restarting)</p>
        </div>
      </div>
    );
  }

  // Handle live scrapers trigger
  const handleScrape = async () => {
    setState((prev) => prev ? { ...prev, isScraping: true } : null);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await handleResponse(res);
      setState(data);
    } catch (err: any) {
      alert(err.message || "Scrape failed");
      console.error("Scrape failed:", err);
      setState((prev) => prev ? { ...prev, isScraping: false } : null);
    }
  };

  // Handle prediction engine simulation trigger
  const handlePredict = async () => {
    setState((prev) => prev ? { ...prev, isPredicting: true } : null);
    try {
      const res = await fetch("/api/predict", { method: "POST" });
      const data = await handleResponse(res);
      setState(data);
      // Automatically switch to predictions tab on generation complete
      setActiveTab("predictions");
    } catch (err: any) {
      alert(err.message || "Prediction failed");
      console.error("Prediction failed:", err);
      setState((prev) => prev ? { ...prev, isPredicting: false } : null);
    }
  };

  // Handle configuration updates (Simulation counts, mode, draw targets, bankroll, etc.)
  const handleUpdateConfig = async (updatedFields: Partial<DashboardState>) => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      const data = await handleResponse(res);
      setState(data);
    } catch (err: any) {
      alert(err.message || "Config update failed");
      console.error("Config update failed:", err);
    }
  };

  // Handle saving manual overrides for specific matches
  const handleSaveMatchOverride = async (updatedFields: Partial<Match>) => {
    if (!editingMatch) return;
    try {
      const res = await fetch("/api/update-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingMatch.id, ...updatedFields }),
      });
      const data = await handleResponse(res);
      setState(data);
      setEditingMatch(null);
    } catch (err: any) {
      alert(err.message || "Match override failed");
      console.error("Match override failed:", err);
    }
  };

  // Reset State defaults
  const handleReset = async () => {
    if (!confirm("Are you sure you want to purge all active configurations and logs?")) return;
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      const data = await handleResponse(res);
      setState(data);
      setActiveTab("fixtures");
    } catch (err: any) {
      alert(err.message || "Reset failed");
      console.error("Reset failed:", err);
    }
  };

  // Handle active pool switching
  const handleSelectPool = async (poolType: "daily" | "sportpesa_daily" | "mozz_weekly" | "sportpesa_weekly") => {
    try {
      const res = await fetch("/api/select-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolType }),
      });
      const data = await handleResponse(res);
      setState(data);
      setActiveTab("fixtures");
    } catch (err: any) {
      alert(err.message || "Pool selection failed");
      console.error("Pool selection failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-12">
      {/* Shared Header bar */}
      <Header
        state={state}
        onScrape={handleScrape}
        onPredict={handlePredict}
        onReset={handleReset}
      />

      {/* Main Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pool Selector Banner spanning all 4 columns */}
        <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-display font-bold text-sm text-slate-300 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" /> Active Syndicate Jackpot Pool
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Select pool to synchronize matches. Saturday & Sunday distributed pools will automatically activate positional drift and pattern conformity engines.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => handleSelectPool("daily")}
              className={`px-3 py-2 rounded-xl border transition-all text-left cursor-pointer flex flex-col ${
                state.activePool === "daily"
                  ? "bg-slate-800/80 border-blue-500/80 text-white shadow-md shadow-blue-500/10"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-xs font-bold font-display">1. Mozz Daily</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">16 Matches • Standard overround</span>
            </button>

            <button
              onClick={() => handleSelectPool("sportpesa_daily")}
              className={`px-3 py-2 rounded-xl border transition-all text-left cursor-pointer flex flex-col ${
                state.activePool === "sportpesa_daily"
                  ? "bg-slate-800/80 border-blue-500/80 text-white shadow-md shadow-blue-500/10"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-xs font-bold font-display">2. SportPesa Daily</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">13 Matches • SportPesa pool focus</span>
            </button>

            <button
              onClick={() => handleSelectPool("mozz_weekly")}
              className={`px-3 py-2 rounded-xl border transition-all text-left cursor-pointer flex flex-col ${
                state.activePool === "mozz_weekly"
                  ? "bg-slate-800/80 border-blue-500/80 text-white shadow-md shadow-blue-500/10"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-xs font-bold font-display">3. Mozz Weekly</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">17 Matches • Weekend distribution</span>
            </button>

            <button
              onClick={() => handleSelectPool("sportpesa_weekly")}
              className={`px-3 py-2 rounded-xl border transition-all text-left cursor-pointer flex flex-col ${
                state.activePool === "sportpesa_weekly"
                  ? "bg-slate-800/80 border-blue-500/80 text-white shadow-md shadow-blue-500/10"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="text-xs font-bold font-display">4. SportPesa Weekly</span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">17 Matches • Weekend distribution</span>
            </button>
          </div>
        </div>

        {/* Left Column: Parameter controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ConfigPanel state={state} onUpdateConfig={handleUpdateConfig} />

          {/* Quick Bankroll display widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/40">
                <Landmark className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                  Active Capital
                </span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  KES {state.bankroll.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                Mode
              </span>
              <span className="text-xs font-mono font-bold text-blue-400 capitalize">
                {state.predictionMode}
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Matches, predictions, coupons */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Main Tab selector */}
          <div className="bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 flex gap-1">
            <button
              onClick={() => setActiveTab("fixtures")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === "fixtures"
                  ? "bg-slate-800 text-white font-semibold border-b border-blue-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              1. Scrape & Fixtures Inspector
            </button>
            <button
              onClick={() => setActiveTab("predictions")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === "predictions"
                  ? "bg-slate-800 text-white font-semibold border-b border-blue-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2. Bayesian Log-Odds & Predictions
            </button>
            <button
              onClick={() => setActiveTab("neural")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                activeTab === "neural"
                  ? "bg-slate-800 text-white font-semibold border-b border-purple-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              3. Positional Spell-State & MLP Decoder
            </button>
          </div>

          {/* Active Tab rendering */}
          {activeTab === "fixtures" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <MatchList matches={state.matches} onEditMatch={(m) => setEditingMatch(m)} activePool={state.activePool} />
            </div>
          )}
          {activeTab === "predictions" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">
              {/* Detailed Predictions */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <PredictionConsole matches={state.matches} summaryMetrics={state.summaryMetrics} />
              </div>
              {/* Optimized Coupons */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <CouponList coupons={state.optimizedCoupons} drawTargets={state.drawTarget} />
              </div>
            </div>
          )}
          {activeTab === "neural" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <PositionalNeuralDashboard state={state} onWarmStartSuccess={(data) => setState(data)} />
            </div>
          )}

          {/* Console logger is always pinned at bottom */}
          <SystemConsoleLogs logs={state.logs} />
        </div>
      </main>

      {/* Manual Input modal overlay */}
      {editingMatch && (
        <ManualInputModal
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={handleSaveMatchOverride}
        />
      )}
    </div>
  );
}
