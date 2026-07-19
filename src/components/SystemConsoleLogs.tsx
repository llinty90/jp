import React from "react";
import { Terminal, ShieldCheck, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { ScrapingLog } from "../types";

interface SystemConsoleLogsProps {
  logs: ScrapingLog[];
}

export const SystemConsoleLogs: React.FC<SystemConsoleLogsProps> = ({ logs }) => {
  return (
    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl font-mono text-xs flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
        <Terminal className="h-4.5 w-4.5 text-slate-400" />
        <h3 className="font-display font-bold text-sm text-slate-300">
          Orchestrator System Console
        </h3>
      </div>

      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-4">No active system events.</div>
        ) : (
          logs.map((log) => {
            let badgeColor = "text-slate-400 bg-slate-900 border-slate-800";
            let icon = <Info className="h-3 w-3 mt-0.5" />;

            if (log.level === "success") {
              badgeColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/40";
              icon = <CheckCircle2 className="h-3 w-3 mt-0.5" />;
            } else if (log.level === "warning") {
              badgeColor = "text-amber-400 bg-amber-950/20 border-amber-900/40";
              icon = <AlertTriangle className="h-3 w-3 mt-0.5" />;
            } else if (log.level === "error") {
              badgeColor = "text-rose-400 bg-rose-950/20 border-rose-900/40";
              icon = <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />;
            }

            return (
              <div
                key={log.id}
                className="flex items-start gap-2.5 py-1.5 px-2.5 rounded-lg border border-slate-900/50 hover:bg-slate-900/40 transition-colors"
              >
                {/* Status Icon */}
                <div className={`p-1 rounded border ${badgeColor} shrink-0`}>
                  {icon}
                </div>

                {/* Time & Msg */}
                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 text-slate-300">
                  <span className="text-slate-500 text-[10px] select-none shrink-0">
                    [{log.timestamp}]
                  </span>
                  <span className="leading-relaxed break-all select-all font-mono">
                    {log.message}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
