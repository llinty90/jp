import React from "react";
import { Play, Sparkles, RefreshCw, Layers, ShieldCheck, Database } from "lucide-react";
import { DashboardState } from "../types";

interface HeaderProps {
  state: DashboardState;
  onScrape: () => void;
  onPredict: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ state, onScrape, onPredict, onReset }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 py-5 px-6 shadow-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl glow-blue">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                ELITE GHOST
              </h1>
              <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-800/60 font-mono">
                v7.0 Orchestrator
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Bayesian Daily Jackpot Scraper & Predix Engine (Syndicate v9.0)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono mr-2">
            <span className={`h-2.5 w-2.5 rounded-full ${state.isScraping || state.isPredicting ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-slate-300">
              {state.isScraping
                ? `Scraping ${state.activePool ? state.activePool.replace("_", " ").toUpperCase() : "Jackpot"}...`
                : state.isPredicting
                ? "Running 1X2 Sims..."
                : "Engine Idle"}
            </span>
          </div>

          <button
            onClick={onScrape}
            disabled={state.isScraping || state.isPredicting}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 font-medium text-sm transition-all cursor-pointer"
            id="btn-scrape"
          >
            <Play className={`h-4 w-4 ${state.isScraping ? "animate-spin" : ""}`} />
            {state.isScraping ? "Scraping..." : "Scrape Odds"}
          </button>

          <button
            onClick={onPredict}
            disabled={state.isScraping || state.isPredicting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md glow-blue cursor-pointer"
            id="btn-predict"
          >
            <Sparkles className={`h-4 w-4 ${state.isPredicting ? "animate-pulse" : ""}`} />
            {state.isPredicting ? "Simulating..." : "Generate Predix"}
          </button>

          <button
            onClick={onReset}
            disabled={state.isScraping || state.isPredicting}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-300 p-2.5 rounded-xl border border-slate-800 text-sm transition-all cursor-pointer"
            title="Reset Engine to Defaults"
            id="btn-reset"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
