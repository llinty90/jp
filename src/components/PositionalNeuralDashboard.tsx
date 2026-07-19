import React, { useState } from "react";
import { DashboardState, PositionalOutcomeMetrics, NeuralPathActivation } from "../types";
import { Cpu, Zap, Network, TrendingUp, AlertTriangle, ShieldAlert, GitMerge, BarChart2, CheckCircle2, RefreshCw, Upload, Flame, FileSpreadsheet, Check, AlertCircle } from "lucide-react";

interface PositionalNeuralDashboardProps {
  state: DashboardState;
  onWarmStartSuccess?: (data: DashboardState) => void;
}

export const PositionalNeuralDashboard: React.FC<PositionalNeuralDashboardProps> = ({ state, onWarmStartSuccess }) => {
  const [selectedPosition, setSelectedPosition] = useState<number>(4);
  const [activeType, setActiveType] = useState<"1x2" | "ou" | "ggng">("1x2");

  const [dragActive, setDragActive] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isWarmStarting, setIsWarmStarting] = useState(false);
  const [warmStartError, setWarmStartError] = useState<string | null>(null);
  const [parsedRoundsCount, setParsedRoundsCount] = useState<number | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        setCsvFile(file);
        setWarmStartError(null);
        analyzeCsvPreview(file);
      } else {
        setWarmStartError("Only .csv files are supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".csv")) {
        setCsvFile(file);
        setWarmStartError(null);
        analyzeCsvPreview(file);
      } else {
        setWarmStartError("Only .csv files are supported.");
      }
    }
  };

  const analyzeCsvPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        setWarmStartError("The selected CSV file is empty or missing data.");
        setParsedRoundsCount(null);
        return;
      }
      
      const isWeekly = file.name.toLowerCase().includes("weekly");
      const poolSize = isWeekly ? 17 : 16;
      const matchesCount = lines.length - 1; // subtract header
      const roundsCount = Math.floor(matchesCount / poolSize);
      setParsedRoundsCount(roundsCount);
    };
    reader.readAsText(file);
  };

  const executeWarmStart = async () => {
    if (!csvFile) return;
    setIsWarmStarting(true);
    setWarmStartError(null);

    const isWeekly = csvFile.name.toLowerCase().includes("weekly");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;
      try {
        const res = await fetch("/api/warmstart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvContent, isWeekly }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to parse historical csv on the server.");
        }

        const updatedState = await res.json();
        if (onWarmStartSuccess) {
          onWarmStartSuccess(updatedState);
        }
        setCsvFile(null);
        setParsedRoundsCount(null);
      } catch (err: any) {
        setWarmStartError(err.message || "An unexpected error occurred during ingestion.");
      } finally {
        setIsWarmStarting(false);
      }
    };
    reader.readAsText(csvFile);
  };

  const metricsSummary = state.positionalMetricsSummary || {};
  const activeMetrics = metricsSummary[selectedPosition];
  const activations = state.neuralActivationPaths || [];

  const totalRoundsLoaded = state.historicalRounds?.length || 0;
  const isEmpiricalDataActive = totalRoundsLoaded > 100 || (state.historicalRounds && state.historicalRounds[0]?.date.includes("Round"));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6 animate-fade-in w-full">
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2.5 flex-wrap">
            <Cpu className="h-6 w-6 text-purple-500 animate-pulse" />
            Conscious Positional Spell-State & MLP Neural Transition Decoder
            {isEmpiricalDataActive ? (
              <span className="flex items-center gap-1 bg-purple-950/80 text-purple-300 text-[10px] px-2.5 py-0.5 rounded-full border border-purple-800 font-mono font-bold uppercase animate-pulse">
                <Flame className="h-3 w-3 text-purple-400 fill-purple-400" />
                Empirical Warm-Start Active
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-slate-950 text-slate-500 text-[10px] px-2.5 py-0.5 rounded-full border border-slate-800 font-mono">
                Baseline Priors Active
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing central limit distributions, standard deviation variances, dry spells, and concurrent neuron co-firing sequence paths across <strong className="text-purple-400 font-mono">{totalRoundsLoaded} rounds</strong> ({totalRoundsLoaded * (state.activePool.includes("weekly") ? 17 : 16)} total matches).
          </p>
        </div>
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 gap-1 self-start">
          <button
            onClick={() => setActiveType("1x2")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeType === "1x2" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            1X2 Spells
          </button>
          <button
            onClick={() => setActiveType("ou")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeType === "ou" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Over/Under Spells
          </button>
          <button
            onClick={() => setActiveType("ggng")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeType === "ggng" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            GG/NG Spells
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sub-column: Positions Grid selector */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Position to Inspect Neuronal Alignment
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }, (_, idx) => {
                const pos = idx + 1;
                const active = selectedPosition === pos;
                const mInfo = metricsSummary[pos];
                
                // Highlight high-elastic pressure outcomes
                const hasDAnomaly = mInfo?.outcomes?.D.deviationSigma > 1.5;
                const hasAAnomaly = mInfo?.outcomes?.A.deviationSigma > 1.6;
                const hasTrap = pos === 4 || pos === 13;

                return (
                  <button
                    key={pos}
                    onClick={() => setSelectedPosition(pos)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col items-center justify-center gap-1 ${
                      active
                        ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                        : "bg-slate-950/20 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-sm font-mono font-bold">Slot {pos}</span>
                    <div className="flex gap-1">
                      {hasTrap && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Adversarial Trap Node" />}
                      {hasDAnomaly && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Draw Deviation High" />}
                      {hasAAnomaly && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Away Win Deviation High" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empirical Ingestion & Warm Start Panel */}
          <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-400" />
              Empirical Ingestion & Warm-Start Core
            </span>
            <p className="text-[11px] text-slate-500">
              Drag & drop or select your <code className="text-purple-400 font-mono">jackpot_main_clean.csv</code> (Daily 16 games) or <code className="text-purple-400 font-mono">weekly_historical.csv</code> matches dataset to initialize 2,000+ empirical historical records!
            </p>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-all ${
                dragActive 
                  ? "border-purple-500 bg-purple-950/20 text-purple-300" 
                  : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
              }`}
            >
              <FileSpreadsheet className="h-7 w-7 text-purple-500" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-slate-200">
                  {csvFile ? csvFile.name : "Drag & drop CSV dataset here"}
                </span>
                <span className="text-[10px] text-slate-500">
                  {csvFile ? `Size: ${(csvFile.size / 1024).toFixed(1)} KB` : "or click to search computer"}
                </span>
              </div>
              
              {!csvFile && (
                <label className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] font-semibold cursor-pointer border border-slate-700">
                  Select CSV File
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              )}

              {csvFile && parsedRoundsCount !== null && (
                <div className="flex flex-col items-center gap-2 mt-1">
                  <span className="text-[10px] bg-purple-950/60 border border-purple-800 text-purple-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    Parsed {parsedRoundsCount} Rounds Successfully
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={executeWarmStart}
                      disabled={isWarmStarting}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isWarmStarting ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Flame className="h-3 w-3 fill-white" />
                      )}
                      {isWarmStarting ? "Ingesting..." : "Execute Warm-Start"}
                    </button>
                    <button
                      onClick={() => {
                        setCsvFile(null);
                        setParsedRoundsCount(null);
                        setWarmStartError(null);
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-[10px] font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {warmStartError && (
              <div className="bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl flex items-start gap-2 text-[10px] text-rose-400 font-mono">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{warmStartError}</span>
              </div>
            )}
          </div>

          {/* Active Sequential Activations list */}
          <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-400" />
              Active Sequential Transition Mappings (MLP)
            </span>
            <div className="flex flex-col gap-2">
              {activations.map((act, index) => (
                <div key={index} className="bg-slate-900/60 p-3 border border-slate-800/50 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-200">Slot {act.position} &rarr; {act.outcome}</span>
                      {act.activeSequenceMatch ? (
                        <span className="text-[9px] bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded-md font-mono flex items-center gap-1">
                          <CheckCircle2 className="h-2 w-2" /> Active Trigger
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-950 text-slate-600 px-1.5 py-0.5 rounded-md font-mono">Idle Path</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                      Seq: {act.triggerSequence.join(" -> ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-purple-400 block">{act.confidencePct}%</span>
                    <span className="text-[9px] text-slate-500 block">Confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sub-column: Statistics Details and Graphs */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {activeMetrics ? (
            <div className="flex flex-col gap-5">
              {/* Detailed statistical metrics card */}
              <div className="bg-slate-950/30 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm font-bold font-display text-slate-200">
                    Positional Central Tendency Metrics - Position {selectedPosition}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Calculated from 50 rounds
                  </span>
                </div>

                {activeType === "1x2" && (
                  <div className="flex flex-col gap-4">
                    {/* Render stats for H, D, A outcomes */}
                    {(["H", "D", "A"] as const).map(outcome => {
                      const stat = activeMetrics.outcomes[outcome];
                      const isHighPressure = stat.deviationSigma > 1.5;
                      const outcomeName = outcome === "H" ? "Home Win (H)" : (outcome === "D" ? "Draw (D)" : "Away Win (A)");
                      
                      return (
                        <div key={outcome} className="bg-slate-900/40 p-4 border border-slate-800/60 rounded-xl flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 font-display flex items-center gap-2">
                              {outcomeName}
                              {isHighPressure && (
                                <span className="text-[9px] bg-rose-950/40 border border-rose-900/60 text-rose-400 px-1.5 py-0.5 rounded-md font-mono flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="h-2.5 w-2.5" /> High Deviation Sigma
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Dry Spell: <strong className="text-white font-bold">{stat.currentDrySpell}</strong> rounds
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mean Spell</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.mean} rnds</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Median Spell</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.median} rnds</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Standard Dev</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.stdev}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Deviation Sigma</span>
                              <span className={`text-xs font-mono font-bold block ${stat.deviationSigma > 1.5 ? "text-rose-400" : "text-slate-300"}`}>
                                {stat.deviationSigma > 0 ? `+${stat.deviationSigma}` : stat.deviationSigma} &sigma;
                              </span>
                            </div>
                          </div>

                          {/* Progress bar comparison */}
                          <div>
                            <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                              <span>Min spell: {stat.min}</span>
                              <span>Frequency: {stat.frequencyPct}%</span>
                              <span>Max spell: {stat.max}</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  stat.currentDrySpell > stat.mean ? "bg-rose-500" : "bg-purple-500"
                                }`}
                                style={{ width: `${Math.min(100, (stat.currentDrySpell / (stat.max || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeType === "ou" && (
                  <div className="flex flex-col gap-4">
                    {/* Render stats for Over/Under outcomes */}
                    {(["O", "U"] as const).map(outcome => {
                      const stat = activeMetrics.overUnder[outcome];
                      const outcomeName = outcome === "O" ? "Over 2.5 Goals (O)" : "Under 2.5 Goals (U)";
                      
                      return (
                        <div key={outcome} className="bg-slate-900/40 p-4 border border-slate-800/60 rounded-xl flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 font-display flex items-center gap-2">
                              {outcomeName}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Dry Spell: <strong className="text-white font-bold">{stat.currentDrySpell}</strong> rounds
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mean Spell</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.mean} rnds</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Median Spell</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.median} rnds</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Standard Dev</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.stdev}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Deviation Sigma</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">
                                {stat.deviationSigma > 0 ? `+${stat.deviationSigma}` : stat.deviationSigma} &sigma;
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                              <span>Min spell: {stat.min}</span>
                              <span>Frequency: {stat.frequencyPct}%</span>
                              <span>Max spell: {stat.max}</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (stat.currentDrySpell / (stat.max || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeType === "ggng" && (
                  <div className="flex flex-col gap-4">
                    {/* Render stats for GG/NG outcomes */}
                    {(["GG", "NG"] as const).map(outcome => {
                      const stat = activeMetrics.ggNg[outcome];
                      const outcomeName = outcome === "GG" ? "Both Teams Score (GG)" : "No Goal (NG)";
                      
                      return (
                        <div key={outcome} className="bg-slate-900/40 p-4 border border-slate-800/60 rounded-xl flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 font-display flex items-center gap-2">
                              {outcomeName}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Dry Spell: <strong className="text-white font-bold">{stat.currentDrySpell}</strong> rounds
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/30 p-3 rounded-lg border border-slate-800/40">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mean Spell</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.mean} rnds</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Median Spell</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.median} rnds</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Standard Dev</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">{stat.stdev}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">Deviation Sigma</span>
                              <span className="text-xs font-mono font-semibold text-slate-300">
                                {stat.deviationSigma > 0 ? `+${stat.deviationSigma}` : stat.deviationSigma} &sigma;
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                              <span>Min spell: {stat.min}</span>
                              <span>Frequency: {stat.frequencyPct}%</span>
                              <span>Max spell: {stat.max}</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (stat.currentDrySpell / (stat.max || 1)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Concurrent Co-firing Neurons panel */}
              {activeMetrics.neuralCoFiringActivations && activeMetrics.neuralCoFiringActivations.concurrentCorrelations.length > 0 && (
                <div className="bg-slate-950/40 p-5 border border-slate-800 rounded-2xl flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <GitMerge className="h-4 w-4 text-purple-400" />
                    Slot {selectedPosition} Co-Firing Neuron Connections (Correlations Matrix)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    When Slot {selectedPosition} activates, other position nodes fire concurrently. Positive weights indicate simultaneous firing, while negative weights indicate inhibitory behavior.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {activeMetrics.neuralCoFiringActivations.concurrentCorrelations.map((corr, idx) => (
                      <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-200">
                            Slot {corr.triggeringPosition} &rarr; {corr.triggeringOutcome}
                          </span>
                          <span className={`text-xs font-mono font-bold ${corr.weight > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {corr.weight > 0 ? `+${corr.weight}` : corr.weight}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${corr.weight > 0 ? "bg-emerald-500" : "bg-rose-500"}`}
                            style={{ width: `${Math.abs(corr.weight) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {corr.weight > 0 ? "Co-excitation effect" : "Inhibitory damping"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500 font-mono text-sm">
              <ShieldAlert className="h-10 w-10 text-amber-500/80 mx-auto mb-3 animate-pulse" />
              Compute metrics on server initialization by reloading state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
