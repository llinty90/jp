import React from "react";
import { Edit3, CheckCircle2, AlertCircle, FileEdit, Users, Award, ShieldAlert } from "lucide-react";
import { Match } from "../types";

interface MatchListProps {
  matches: Match[];
  onEditMatch: (match: Match) => void;
  activePool?: "daily" | "sportpesa_daily" | "mozz_weekly" | "sportpesa_weekly";
}

export const MatchList: React.FC<MatchListProps> = ({ matches, onEditMatch, activePool = "daily" }) => {
  const getPoolTitle = () => {
    switch (activePool) {
      case "sportpesa_daily":
        return "SportPesa Daily Jackpot (13 Matches)";
      case "mozz_weekly":
        return "Mozzart Weekend Weekly Jackpot (17 Matches)";
      case "sportpesa_weekly":
        return "SportPesa Weekend Weekly Jackpot (17 Matches)";
      default:
        return "Jackpot Fixtures (16 Daily Matches)";
    }
  };

  const getPoolDesc = () => {
    switch (activePool) {
      case "sportpesa_daily":
        return "13 Daily SportPesa jackpot matches utilized for prediction computations and daily syndicate tracking.";
      case "mozz_weekly":
      case "sportpesa_weekly":
        return "Weekend-distributed matches. Features advanced cross-bookie repeated fixture and positional drift analysis.";
      default:
        return "Auto-scraped Mozzart fixtures aligned to SportPesa and Bet365 counterparts via Intelligent Mapping.";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-100">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-200">
            {getPoolTitle()}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {getPoolDesc()}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-950/40 text-slate-400 font-mono text-xs uppercase tracking-wider border-b border-slate-850">
              <th className="py-4 px-6 text-center w-12">Slot</th>
              <th className="py-4 px-4 w-52">Fixture Context</th>
              <th className="py-4 px-4">Match Pairings</th>
              <th className="py-4 px-4 text-center w-40">Mozzartbet (1X2)</th>
              <th className="py-4 px-4 text-center w-44">SportPesa (1X2)</th>
              <th className="py-4 px-4 text-center w-44">Bet365 (1X2)</th>
              <th className="py-4 px-4 text-center w-28">O/U 2.5 (Mozz)</th>
              <th className="py-4 px-4 text-center w-28">Referee Bias</th>
              <th className="py-4 px-6 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/60">
            {matches.map((m) => {
              const spMatched = m.spHomeOdd !== undefined;
              const mozzPos = m.mozzPosition !== undefined ? m.mozzPosition : m.id;
              const spPos = m.spPosition !== undefined ? m.spPosition : m.id;
              const drift = Math.abs(mozzPos - spPos);

              return (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors group">
                  {/* Position ID */}
                  <td className="py-4 px-6 text-center font-mono font-bold text-sm text-slate-500">
                    {m.id}
                  </td>

                  {/* Context (Date, League, Altitude) */}
                  <td className="py-4 px-4">
                    <div className="text-xs font-semibold text-slate-300">
                      {m.matchDate} @ {m.matchTime}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]" title={`${m.country} - ${m.league}`}>
                      {m.country} • {m.league}
                    </div>
                    {m.altitudeM && m.altitudeM > 1000 && (
                      <span className="inline-block bg-red-950/30 text-red-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-900/40 mt-1">
                        Alt: {m.altitudeM}m (Upset Bias)
                      </span>
                    )}
                  </td>

                  {/* Fixture names */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{m.homeTeam}</span>
                        {m.homeSponsor === m.awaySponsor && m.homeSponsor && (
                          <span className="bg-amber-950 text-amber-400 text-[9px] px-1 rounded border border-amber-900/60" title="Same Sponsor Match">
                            Sponsor Draw Bias
                          </span>
                        )}
                        {m.isRepeated && (
                          <span className="bg-blue-950 text-blue-400 text-[9px] px-1.5 py-0.5 rounded border border-blue-900/50 font-mono font-medium">
                            Repeated Match
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs">vs <span className="font-semibold text-slate-200">{m.awayTeam}</span></div>
                    </div>

                    {/* Show matched counterpart info & Positional drift info */}
                    <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                      {m.spMatchMethod === "fuzzy_overlap" && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                          <CheckCircle2 className="h-3 w-3" />
                          Fuzzy-Matched ({Math.round((m.spMatchConfidence || 0) * 100)}% match)
                        </div>
                      )}
                      {m.spMatchMethod === "gemini_resolved" && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-400 font-mono bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/50">
                          <Award className="h-3 w-3" />
                          AI Resolved
                        </div>
                      )}
                      {m.spMatchMethod === "manual" && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/50">
                          <FileEdit className="h-3 w-3" />
                          Manual Entry
                        </div>
                      )}
                      {m.spMatchMethod === "failed" && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-400 font-mono bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/50">
                          <AlertCircle className="h-3 w-3" />
                          Scrape Failed
                        </div>
                      )}

                      {/* Display Positional Drift Info */}
                      {m.isRepeated && m.mozzPosition !== undefined && m.spPosition !== undefined && (
                        <div className="text-[9px] font-mono flex items-center gap-1 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          <span>Mozz Slot: {m.mozzPosition}</span>
                          <span className="text-slate-600">•</span>
                          <span>SportPesa Slot: {m.spPosition}</span>
                          <span className="text-slate-600">•</span>
                          <span className={drift > 5 ? "text-amber-400 font-bold" : "text-slate-400"}>
                            Drift: {drift} Slots {drift > 5 && "⚠️ (Draw Cluster)"}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Mozzartbet Odds */}
                  <td className="py-4 px-4 text-center font-mono">
                    <div className="flex items-center justify-center gap-1.5 text-xs">
                      <div className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 w-10" title="Mozzart Home Odd">
                        {m.mozzHomeOdd.toFixed(2)}
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 w-10" title="Mozzart Draw Odd">
                        {m.mozzDrawOdd.toFixed(2)}
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 w-10" title="Mozzart Away Odd">
                        {m.mozzAwayOdd.toFixed(2)}
                      </div>
                    </div>
                  </td>

                  {/* SportPesa Odds with failed mapping handle */}
                  <td className="py-4 px-4 text-center font-mono">
                    {spMatched ? (
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        <div className="bg-blue-950/30 border border-blue-900/40 rounded px-1.5 py-1 text-blue-400 font-bold w-10" title="SportPesa Home Odd">
                          {m.spHomeOdd?.toFixed(2)}
                        </div>
                        <div className="bg-blue-950/30 border border-blue-900/40 rounded px-1.5 py-1 text-blue-400 font-bold w-10" title="SportPesa Draw Odd">
                          {m.spDrawOdd?.toFixed(2)}
                        </div>
                        <div className="bg-blue-950/30 border border-blue-900/40 rounded px-1.5 py-1 text-blue-400 font-bold w-10" title="SportPesa Away Odd">
                          {m.spAwayOdd?.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-rose-500 font-mono text-[10px] flex flex-col items-center gap-1">
                        <span className="bg-rose-950/50 text-rose-400 px-2 py-1 rounded border border-rose-900/50 font-semibold uppercase tracking-wider">
                          Missing Odds
                        </span>
                        <span className="text-slate-500 text-[9px]">Click edit to input manually</span>
                      </div>
                    )}
                  </td>

                  {/* Bet365 Odds */}
                  <td className="py-4 px-4 text-center font-mono">
                    {m.b365HomeOdd !== undefined ? (
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        <div className="bg-amber-950/30 border border-amber-900/40 rounded px-1.5 py-1 text-amber-400 font-bold w-10" title="Bet365 Home Odd">
                          {m.b365HomeOdd.toFixed(2)}
                        </div>
                        <div className="bg-amber-950/30 border border-amber-900/40 rounded px-1.5 py-1 text-amber-400 font-bold w-10" title="Bet365 Draw Odd">
                          {m.b365DrawOdd?.toFixed(2)}
                        </div>
                        <div className="bg-amber-950/30 border border-amber-900/40 rounded px-1.5 py-1 text-amber-400 font-bold w-10" title="Bet365 Away Odd">
                          {m.b365AwayOdd?.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs italic">—</span>
                    )}
                  </td>

                  {/* Over/Under 2.5 Market lines */}
                  <td className="py-4 px-4 text-center font-mono">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] text-slate-500 font-mono">Over:</span>
                        <span className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-emerald-400 font-semibold text-center min-w-[40px]" title="Over 2.5 Goals Odd">
                          {m.overOdds ? m.overOdds.toFixed(2) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] text-slate-500 font-mono">Under:</span>
                        <span className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-blue-400 font-semibold text-center min-w-[40px]" title="Under 2.5 Goals Odd">
                          {m.underOdds ? m.underOdds.toFixed(2) : "—"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Referee bias representation */}
                  <td className="py-4 px-4 text-center">
                    {m.referee ? (
                      <div>
                        <div className="text-xs font-semibold text-slate-300 truncate max-w-[120px]" title={m.referee}>
                          {m.referee}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Bias: {m.refereeHomeBias && m.refereeHomeBias > 0 ? `+${Math.round(m.refereeHomeBias * 100)}% H` : `-${Math.round(Math.abs(m.refereeHomeBias || 0) * 100)}% H`}
                        </div>
                        {m.refereeDrawRate && m.refereeDrawRate > 0.28 && (
                          <div className="text-[9px] text-amber-500 font-mono mt-0.5 font-semibold">
                            Draw Rate: {Math.round(m.refereeDrawRate * 100)}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs italic">Unassigned</span>
                    )}
                  </td>

                  {/* Actions column */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onEditMatch(m)}
                      className="bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 text-slate-400 hover:text-white p-2 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center shadow"
                      title="Manually Override Match Data / Add Missing Odds"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
