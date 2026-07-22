import React from "react";
import { Settings, ShieldAlert, Cpu, Percent, Landmark, Clock } from "lucide-react";
import { DashboardState } from "../types";

interface ConfigPanelProps {
  state: DashboardState;
  onUpdateConfig: (config: Partial<DashboardState>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ state, onUpdateConfig }) => {
  const drawOptions = [2, 3, 4, 5, 6, 7];

  const handleDrawToggle = (num: number) => {
    let newTargets = [...state.drawTarget];
    if (newTargets.includes(num)) {
      newTargets = newTargets.filter(t => t !== num);
    } else {
      newTargets.push(num);
    }
    // Sort array
    newTargets.sort((a, b) => a - b);
    if (newTargets.length > 0) {
      onUpdateConfig({ drawTarget: newTargets });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-100 flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Settings className="h-5 w-5 text-blue-500" />
        <h2 className="font-display font-semibold text-lg text-slate-200">
          Engine Parameters
        </h2>
      </div>

      {/* Target Draws Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          Target Draws (Pool filter)
        </label>
        <p className="text-xs text-slate-500 mb-1 leading-relaxed">
          Filter optimized coupons to contain exactly these many drawn matches.
        </p>
        <div className="flex gap-2">
          {drawOptions.map(num => {
            const isSelected = state.drawTarget.includes(num);
            return (
              <button
                key={num}
                onClick={() => handleDrawToggle(num)}
                className={`flex-1 py-2 text-sm font-mono font-semibold rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm"
                    : "bg-slate-800 border-slate-700/50 text-slate-400 hover:text-slate-300"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prediction Mode */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-blue-500" />
          Prediction Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["standard", "adaptive", "ultimate"] as const).map(mode => {
            const isSelected = state.predictionMode === mode;
            return (
              <button
                key={mode}
                onClick={() => onUpdateConfig({ predictionMode: mode })}
                className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/50"
                    : "bg-slate-800 border-slate-700/50 text-slate-400 hover:text-slate-300"
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monte Carlo Simulations */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-400 tracking-wider uppercase">
            MC Simulations
          </label>
          <span className="font-mono text-blue-400 font-semibold bg-blue-950 px-2 py-0.5 rounded border border-blue-900/60">
            {state.nSimulations.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="50000"
          max="500000"
          step="50000"
          value={state.nSimulations}
          onChange={e => onUpdateConfig({ nSimulations: Number(e.target.value) })}
          className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Kelly Criterion Fraction */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-amber-500" />
            Kelly Fraction
          </label>
          <span className="font-mono text-amber-400 font-semibold bg-amber-950 px-2 py-0.5 rounded border border-amber-900/60">
            {state.kellyFraction.toFixed(2)}x
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={state.kellyFraction}
          onChange={e => onUpdateConfig({ kellyFraction: Number(e.target.value) })}
          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
          Multiplier fraction applied to Kelly staking formula to avoid aggressive drawdowns.
        </p>
      </div>

      {/* Current Bankroll */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Landmark className="h-3.5 w-3.5 text-emerald-500" />
          Active Bankroll (KES)
        </label>
        <div className="relative">
          <input
            type="number"
            value={state.bankroll}
            onChange={e => onUpdateConfig({ bankroll: Math.max(1, Number(e.target.value)) })}
            className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-emerald-400 font-mono font-semibold focus:outline-none focus:border-emerald-500"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
            KES
          </span>
        </div>
      </div>

      {/* Automated Time Check Trigger */}
      <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
        <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-blue-500" />
          Time Check Trigger Scraper
        </label>
        
        <div className="flex items-center justify-between text-xs bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400">Auto Scraping Status</span>
          <button
            onClick={() => onUpdateConfig({ isAutoScrapeEnabled: !state.isAutoScrapeEnabled })}
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg border transition-all cursor-pointer ${
              state.isAutoScrapeEnabled
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800 text-slate-500 border-slate-700/50"
            }`}
          >
            {state.isAutoScrapeEnabled ? "ACTIVE (Auto)" : "DISABLED"}
          </button>
        </div>

        {state.isAutoScrapeEnabled && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>Trigger Interval</span>
              <span className="text-slate-300 font-semibold">{state.autoScrapeIntervalHours || 4} Hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={state.autoScrapeIntervalHours || 4}
              onChange={e => onUpdateConfig({ autoScrapeIntervalHours: Number(e.target.value) })}
              className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {state.lastScrapeTime && (
          <div className="text-[10px] text-slate-500 font-mono flex justify-between items-center bg-slate-950/40 p-2 rounded-lg">
            <span>Last Auto-Scrape:</span>
            <span className="text-slate-400 font-semibold">
              {new Date(state.lastScrapeTime).toLocaleTimeString()} ({new Date(state.lastScrapeTime).toLocaleDateString()})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
