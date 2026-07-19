import React, { useState } from "react";
import { Sparkles, HelpCircle, ChevronDown, ChevronUp, AlertCircle, AlertOctagon, TrendingUp, Landmark } from "lucide-react";
import { Match } from "../types";

interface PredictionConsoleProps {
  matches: Match[];
  summaryMetrics?: {
    totalExpectedH: number;
    totalExpectedD: number;
    totalExpectedA: number;
    bookieExposure: number;
    upsetBudget: number;
    regime: string;
    // Positional / Cross-pool weekly metrics
    repeatedMatchesCount?: number;
    averagePositionDrift?: number;
    maxPositionalShiftFixture?: string;
    drawPatternConformity?: number;
  };
}

export const PredictionConsole: React.FC<PredictionConsoleProps> = ({ matches, summaryMetrics }) => {
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  const hasPredictions = matches.some((m) => m.predictions !== undefined);

  if (!hasPredictions) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center text-slate-400">
        <Sparkles className="h-10 w-10 text-blue-500 mx-auto mb-3 opacity-60 animate-pulse" />
        <h3 className="font-display font-bold text-lg text-slate-300">
          No Predictions Generated Yet
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Ensure Mozzart and SportPesa odds are fully matched or overridden, then click the **"Generate Predix"** button in the header to run Monte Carlo simulations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      {/* Metrics Header */}
      {summaryMetrics && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="border-r border-slate-800/80 last:border-0">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                Expected H-D-A Outcomes
              </span>
              <span className="font-mono font-bold text-lg text-slate-200 mt-1 block">
                {summaryMetrics.totalExpectedH}H - {summaryMetrics.totalExpectedD}D - {summaryMetrics.totalExpectedA}A
              </span>
            </div>
            <div className="border-r border-slate-800/80 last:border-0">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                Bookie Exposure Metric
              </span>
              <span className="font-mono font-bold text-lg text-rose-400 mt-1 block">
                {summaryMetrics.bookieExposure > 0 ? `+${summaryMetrics.bookieExposure}` : summaryMetrics.bookieExposure}
              </span>
            </div>
            <div className="border-r border-slate-800/80 last:border-0">
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                Upset Budget Allocated
              </span>
              <span className="font-mono font-bold text-lg text-blue-400 mt-1 block">
                {summaryMetrics.upsetBudget} / {matches.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                Detected Regime Shift
              </span>
              <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-full px-2 py-0.5 mt-2.5 inline-block">
                {summaryMetrics.regime.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {summaryMetrics.repeatedMatchesCount !== undefined && (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center animate-fade-in">
              <div className="border-r border-slate-800/80 last:border-0">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                  Cross-Bookie Overlap
                </span>
                <span className="font-mono font-bold text-lg text-blue-400 mt-1 block">
                  {summaryMetrics.repeatedMatchesCount} Matches
                </span>
              </div>
              <div className="border-r border-slate-800/80 last:border-0">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                  Avg Positional Drift
                </span>
                <span className="font-mono font-bold text-lg text-amber-400 mt-1 block">
                  {summaryMetrics.averagePositionDrift} Slots
                </span>
              </div>
              <div className="border-r border-slate-800/80 last:border-0 flex flex-col justify-center items-center px-2">
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block truncate max-w-full">
                  Max Shift Fixture
                </span>
                <span className="font-mono text-[9px] font-bold text-slate-300 mt-1 block truncate max-w-full" title={summaryMetrics.maxPositionalShiftFixture}>
                  {summaryMetrics.maxPositionalShiftFixture}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                  Draw Cluster Conformity
                </span>
                <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-full px-2.5 py-0.5 mt-2 inline-block">
                  {summaryMetrics.drawPatternConformity}% Alignment
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main predictions inspector header */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-200">
            Bayesian Log-Odds & EV Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Expand any match to view adversarial decision-reason logging.
          </p>
        </div>
      </div>

      {/* List of predicted matches */}
      <div className="flex flex-col gap-3">
        {matches.map((m) => {
          const pred = m.predictions;
          if (!pred) return null;

          const isExpanded = expandedMatchId === m.id;

          return (
            <div
              key={m.id}
              className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850 rounded-xl overflow-hidden transition-all"
            >
              {/* Closed Brief Panel */}
              <div
                onClick={() => toggleExpand(m.id)}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-950 rounded border border-slate-850 h-6 w-6 flex items-center justify-center mt-1">
                    {m.id}
                  </span>
                  <div>
                    <div className="font-display font-semibold text-slate-200 flex items-center gap-2">
                      {m.homeTeam} vs {m.awayTeam}
                      {pred.isTrap && (
                        <span className="bg-rose-950 text-rose-400 text-[10px] px-2 py-0.5 rounded border border-rose-900/40 flex items-center gap-1 font-mono">
                          <AlertOctagon className="h-3 w-3" /> Trap Line
                        </span>
                      )}
                      {pred.isSponsorDraw && (
                        <span className="bg-amber-950 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-900/40 flex items-center gap-1 font-mono">
                          Conflict Bias
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {m.league} • Best Syndicate Pick: <strong className="text-blue-400 font-mono">{pred.bestPick}</strong>
                    </div>
                  </div>
                </div>

                {/* Probabilities Row */}
                <div className="flex items-center gap-6 font-mono text-xs shrink-0 ml-9 md:ml-0">
                  {/* Prob H */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-600 font-semibold mb-1">H %</span>
                    <span className={`font-bold ${pred.bestPick === 'H' ? 'text-blue-400' : 'text-slate-400'}`}>
                      {Math.round(pred.probH * 100)}%
                    </span>
                  </div>
                  {/* Prob D */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-600 font-semibold mb-1">D %</span>
                    <span className={`font-bold ${pred.bestPick === 'D' ? 'text-blue-400' : 'text-slate-400'}`}>
                      {Math.round(pred.probD * 100)}%
                    </span>
                  </div>
                  {/* Prob A */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-600 font-semibold mb-1">A %</span>
                    <span className={`font-bold ${pred.bestPick === 'A' ? 'text-blue-400' : 'text-slate-400'}`}>
                      {Math.round(pred.probA * 100)}%
                    </span>
                  </div>

                  {/* Best EV */}
                  <div className="flex flex-col items-center ml-2 border-l border-slate-800 pl-4">
                    <span className="text-[10px] text-slate-600 font-semibold mb-1">Max EV</span>
                    <span className={`font-bold ${pred.evH > 0 || pred.evD > 0 || pred.evA > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {Math.max(pred.evH, pred.evD, pred.evA) > 0 
                        ? `+${Math.max(pred.evH, pred.evD, pred.evA).toFixed(2)}` 
                        : Math.max(pred.evH, pred.evD, pred.evA).toFixed(2)}
                    </span>
                  </div>

                  {/* Expand Icon */}
                  <div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded details container */}
              {isExpanded && (
                <div className="border-t border-slate-850 bg-slate-950/30 p-4 animate-fade-in flex flex-col md:flex-row gap-5">
                  {/* Left Column: Staking & EV info */}
                  <div className="md:w-1/3 flex flex-col gap-3 font-mono text-xs">
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase border-b border-slate-850 pb-1">
                      Calculated Betting Metrics
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>Home EV:</div>
                      <div className={pred.evH > 0 ? "text-emerald-400" : ""}>{pred.evH > 0 ? `+${pred.evH}` : pred.evH}</div>
                      
                      <div>Draw EV:</div>
                      <div className={pred.evD > 0 ? "text-emerald-400" : ""}>{pred.evD > 0 ? `+${pred.evD}` : pred.evD}</div>
                      
                      <div>Away EV:</div>
                      <div className={pred.evA > 0 ? "text-emerald-400" : ""}>{pred.evA > 0 ? `+${pred.evA}` : pred.evA}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300 border-t border-slate-850 pt-2">
                      <div className="flex items-center gap-1">
                        <Landmark className="h-3 w-3 text-amber-500" /> Staking H:
                      </div>
                      <div className="text-amber-400 font-bold">{pred.kellyH > 0 ? `${(pred.kellyH * 100).toFixed(1)}%` : "0%"}</div>
                      
                      <div className="flex items-center gap-1">
                        <Landmark className="h-3 w-3 text-amber-500" /> Staking D:
                      </div>
                      <div className="text-amber-400 font-bold">{pred.kellyD > 0 ? `${(pred.kellyD * 100).toFixed(1)}%` : "0%"}</div>
                      
                      <div className="flex items-center gap-1">
                        <Landmark className="h-3 w-3 text-amber-500" /> Staking A:
                      </div>
                      <div className="text-amber-400 font-bold">{pred.kellyA > 0 ? `${(pred.kellyA * 100).toFixed(1)}%` : "0%"}</div>
                    </div>
                  </div>

                  {/* Right Column: Reasoning and adversarial signals */}
                  <div className="md:w-2/3 flex flex-col gap-2.5">
                    <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase border-b border-slate-850 pb-1">
                      Bayesian Decision-Reason Log
                    </span>
                    <ul className="flex flex-col gap-1.5 list-disc pl-4 text-xs text-slate-400 leading-relaxed">
                      {pred.reasons.map((r, i) => (
                        <li key={i} className="marker:text-blue-500">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
