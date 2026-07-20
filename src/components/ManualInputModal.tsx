import React, { useState, useEffect } from "react";
import { X, Save, AlertTriangle, ShieldCheck, HelpCircle, CheckCircle2 } from "lucide-react";
import { Match } from "../types";

interface ManualInputModalProps {
  match: Match | null;
  onClose: () => void;
  onSave: (updatedFields: Partial<Match>) => void;
}

export const ManualInputModal: React.FC<ManualInputModalProps> = ({ match, onClose, onSave }) => {
  const [spHomeOdd, setSpHomeOdd] = useState<string>("");
  const [spDrawOdd, setSpDrawOdd] = useState<string>("");
  const [spAwayOdd, setSpAwayOdd] = useState<string>("");
  const [b365HomeOdd, setB365HomeOdd] = useState<string>("");
  const [b365DrawOdd, setB365DrawOdd] = useState<string>("");
  const [b365AwayOdd, setB365AwayOdd] = useState<string>("");
  const [overOdds, setOverOdds] = useState<string>("");
  const [underOdds, setUnderOdds] = useState<string>("");
  const [referee, setReferee] = useState<string>("");
  const [refereeHomeBias, setRefereeHomeBias] = useState<string>("");
  const [refereeDrawRate, setRefereeDrawRate] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");
  const [overUnderOutcome, setOverUnderOutcome] = useState<string>("");
  const [ggNgOutcome, setGgNgOutcome] = useState<string>("");

  useEffect(() => {
    if (match) {
      setSpHomeOdd(match.spHomeOdd?.toString() || "");
      setSpDrawOdd(match.spDrawOdd?.toString() || "");
      setSpAwayOdd(match.spAwayOdd?.toString() || "");
      setB365HomeOdd(match.b365HomeOdd?.toString() || "");
      setB365DrawOdd(match.b365DrawOdd?.toString() || "");
      setB365AwayOdd(match.b365AwayOdd?.toString() || "");
      setOverOdds(match.overOdds?.toString() || "");
      setUnderOdds(match.underOdds?.toString() || "");
      setReferee(match.referee || "");
      setRefereeHomeBias(match.refereeHomeBias?.toString() || "0");
      setRefereeDrawRate(match.refereeDrawRate?.toString() || "0.25");
      setOutcome(match.outcome || "");
      setOverUnderOutcome(match.overUnderOutcome || "");
      setGgNgOutcome(match.ggNgOutcome || "");
    }
  }, [match]);

  if (!match) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      spHomeOdd: spHomeOdd ? Number(spHomeOdd) : undefined,
      spDrawOdd: spDrawOdd ? Number(spDrawOdd) : undefined,
      spAwayOdd: spAwayOdd ? Number(spAwayOdd) : undefined,
      b365HomeOdd: b365HomeOdd ? Number(b365HomeOdd) : undefined,
      b365DrawOdd: b365DrawOdd ? Number(b365DrawOdd) : undefined,
      b365AwayOdd: b365AwayOdd ? Number(b365AwayOdd) : undefined,
      overOdds: overOdds ? Number(overOdds) : undefined,
      underOdds: underOdds ? Number(underOdds) : undefined,
      referee: referee || undefined,
      refereeHomeBias: refereeHomeBias ? Number(refereeHomeBias) : undefined,
      refereeDrawRate: refereeDrawRate ? Number(refereeDrawRate) : undefined,
      outcome: outcome ? (outcome as "H" | "D" | "A") : undefined,
      overUnderOutcome: overUnderOutcome ? (overUnderOutcome as "O" | "U") : undefined,
      ggNgOutcome: ggNgOutcome ? (ggNgOutcome as "GG" | "NG") : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-200">
              Manual Override: Match #{match.id}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {match.homeTeam} vs {match.awayTeam}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Warning context */}
          {!match.spHomeOdd && (
            <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-3 flex gap-2.5 items-start text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold block mb-0.5">Scrape Failure Mitigation</span>
                This fixture was not matched on SportPesa automatically. Provide SportPesa odds below to complete the adversarial betting computations.
              </div>
            </div>
          )}

          {/* SportPesa Odds block */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              SportPesa Match Odds (1X2)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">HOME (1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={spHomeOdd}
                  onChange={(e) => setSpHomeOdd(e.target.value)}
                  placeholder={match.mozzHomeOdd.toFixed(2)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">DRAW (X)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={spDrawOdd}
                  onChange={(e) => setSpDrawOdd(e.target.value)}
                  placeholder={match.mozzDrawOdd.toFixed(2)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">AWAY (2)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={spAwayOdd}
                  onChange={(e) => setSpAwayOdd(e.target.value)}
                  placeholder={match.mozzAwayOdd.toFixed(2)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bet365 Odds block */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Bet365 Match Odds (1X2)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">HOME (1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={b365HomeOdd}
                  onChange={(e) => setB365HomeOdd(e.target.value)}
                  placeholder={match.mozzHomeOdd.toFixed(2)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">DRAW (X)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={b365DrawOdd}
                  onChange={(e) => setB365DrawOdd(e.target.value)}
                  placeholder={match.mozzDrawOdd.toFixed(2)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">AWAY (2)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={b365AwayOdd}
                  onChange={(e) => setB365AwayOdd(e.target.value)}
                  placeholder={match.mozzAwayOdd.toFixed(2)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Over/Under Odds */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              O/U 2.5 Market Lines (Optional)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">OVER 2.5</label>
                <input
                  type="number"
                  step="0.01"
                  value={overOdds}
                  onChange={(e) => setOverOdds(e.target.value)}
                  placeholder="2.00"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-mono">UNDER 2.5</label>
                <input
                  type="number"
                  step="0.01"
                  value={underOdds}
                  onChange={(e) => setUnderOdds(e.target.value)}
                  placeholder="1.75"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Played/Actual Outcomes block */}
          <div className="flex flex-col gap-2 p-3.5 bg-purple-950/20 border border-purple-900/40 rounded-xl">
            <span className="text-xs font-bold text-purple-300 tracking-wider uppercase flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
              Settle Actual Played Result
            </span>
            <p className="text-[10px] text-slate-400 leading-normal">
              Enter the actual played outcome to feed back into the AI calibration core.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-mono">1X2 OUTCOME</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">— Pending —</option>
                  <option value="H">Home (H)</option>
                  <option value="D">Draw (D)</option>
                  <option value="A">Away (A)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-mono">O/U 2.5 OUTCOME</label>
                <select
                  value={overUnderOutcome}
                  onChange={(e) => setOverUnderOutcome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">— Pending —</option>
                  <option value="O">Over 2.5 (O)</option>
                  <option value="U">Under 2.5 (U)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-mono">GG/NG OUTCOME</label>
                <select
                  value={ggNgOutcome}
                  onChange={(e) => setGgNgOutcome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">— Pending —</option>
                  <option value="GG">Goal-Goal (GG)</option>
                  <option value="NG">No Goal (NG)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Referee metrics */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Referee & Statistical Bias
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="text-[10px] text-slate-500 block mb-1">REFEREE NAME</label>
                <input
                  type="text"
                  value={referee}
                  onChange={(e) => setReferee(e.target.value)}
                  placeholder="E.g. Ismail Elfath"
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 truncate">HOME BIAS (-1 to 1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="-0.5"
                  max="0.5"
                  value={refereeHomeBias}
                  onChange={(e) => setRefereeHomeBias(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 truncate">DRAW BIAS (0 to 1)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="0.6"
                  value={refereeDrawRate}
                  onChange={(e) => setRefereeDrawRate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Save/Cancel */}
          <div className="flex justify-end gap-2 border-t border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 glow-blue transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Apply Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
