import React from "react";
import { Sparkles, Trophy, Percent, HelpCircle, ArrowUpRight } from "lucide-react";
import { Coupon } from "../types";

interface CouponListProps {
  coupons: Coupon[];
  drawTargets: number[];
}

export const CouponList: React.FC<CouponListProps> = ({ coupons, drawTargets }) => {
  const hasCoupons = coupons.length > 0;

  if (!hasCoupons) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center text-slate-400">
        <Trophy className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <h3 className="font-display font-bold text-slate-300">
          No Optimized Coupons Yet
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Run the Bayesian prediction engine to automatically construct optimized jackpot coupon combinations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h3 className="font-display font-bold text-lg text-slate-200">
            Optimized Jackpot Coupons
          </h3>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-900/50 rounded-full px-2.5 py-1 font-mono font-bold uppercase">
          Draw Target: {drawTargets.join(",")}
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Below are the top 15 simulated multi-bet coupon combinations matching your draw criteria, sorted by joint simulation frequency weight.
      </p>

      {/* Grid containing coupons */}
      <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
        {coupons.map((c, index) => {
          return (
            <div
              key={c.couponString}
              className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 hover:border-slate-800/80 hover:bg-slate-950/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Index & Coupon String */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-900 rounded border border-slate-800 h-6 w-6 flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex flex-col">
                  {/* Styled split string */}
                  <span className="font-mono text-sm font-bold text-emerald-400 tracking-widest break-all select-all">
                    {c.couponString}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Draws: {c.couponString.split("").filter(x => x === "D").length} / 16
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="flex items-center gap-6 font-mono text-xs shrink-0 pl-9 md:pl-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-600 block mb-0.5">Weight (Freq)</span>
                  <span className="text-slate-300 font-bold">{c.weightPct}</span>
                </div>
                <div className="text-right border-l border-slate-850 pl-4">
                  <span className="text-[10px] text-slate-600 block mb-0.5">Geometric Prob</span>
                  <span className="text-blue-400 font-bold">{(c.coverage * 100).toFixed(1)}%</span>
                </div>
                <div className="text-right border-l border-slate-850 pl-4">
                  <span className="text-[10px] text-slate-600 block mb-0.5">Mean EV</span>
                  <span className={`font-bold ${c.ev > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                    {c.ev > 0 ? `+${c.ev.toFixed(2)}` : c.ev.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
