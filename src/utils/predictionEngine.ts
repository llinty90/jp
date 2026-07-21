/**
 * ============================================================================
 * ELITE GHOST — UNIFIED PREDICTION ENGINE  v8.0
 * ============================================================================
 *
 * A fully merged, maximally intelligent prediction engine combining every
 * analysis module from the previous v6/v7 orchestrators:
 *
 *  MODULE 1  — Bayesian Log-Odds Core (prior + market fusion)
 *  MODULE 2  — Dirichlet Smoothing (adaptive alpha per match)
 *  MODULE 3  — Positional Spell-State Engine (CLT mean-reversion)
 *  MODULE 4  — Neural Co-Firing Activations (sequence path matching)
 *  MODULE 5  — Adversarial Trap Solver (bookmaker line detection)
 *  MODULE 6  — Referee Bias Integrator
 *  MODULE 7  — Sponsorship Conflict Draw Booster
 *  MODULE 8  — Cross-Bookie Discrepancy Detector
 *  MODULE 9  — Positional Drift / Cross-Pool Alignment Exploiter
 *  MODULE 10 — Recursive Belief Updater (LLN Pool Convergence)
 *  MODULE 11 — Segment Draw Damping (Geometric Sequence Filter)
 *  MODULE 12 — Velocity / Sharp Money Signal (O/U + 1X2)
 *  MODULE 13 — H2H Draw Rate Integrator
 *  MODULE 14 — Kelly Criterion Staking Calculator
 *  MODULE 15 — EV (Expected Value) Calculator
 *  MODULE 16 — Monte Carlo Coupon Simulator
 *  MODULE 17 — Accuracy Tracker & Online Learning Loop
 *              (learns from every settled round, updates module weights)
 *
 * LEARNING LOOP:
 *   Every time /api/resolve-round is called, runOnlineLearning() is invoked.
 *   It compares each match's `bestPick` against the real `outcome`, then:
 *     - Adjusts `priorWeight` vs `marketWeight` based on which was more accurate
 *     - Tunes `positionalSpellDrawMultiplier` if draw spells over/under-fired
 *     - Tunes `trapHomeDiscount`/`trapAwayPremium` based on trap accuracy
 *     - Tunes `llnCorrectionStrength` based on pool distribution error
 *     - Tunes `dirichletAlpha` based on calibration error (Brier score)
 *     - Records per-round accuracy history for trend analysis
 *   All changes are bounded and gradual (no single round causes wild swings).
 * ============================================================================
 */

import {
  Match,
  CalibratedParameters,
  DashboardState,
  Coupon,
  HistoricalRound,
  PositionalOutcomeMetrics,
  NeuralPathActivation,
  RoundAccuracyRecord
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// EMPIRICAL BASELINE — from jackpot_main_clean.csv (1,246 matches, 2026)
// ─────────────────────────────────────────────────────────────────────────────
export const EMPIRICAL_BASELINE_H = 0.373;
export const EMPIRICAL_BASELINE_D = 0.303;
export const EMPIRICAL_BASELINE_A = 0.324;

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT CALIBRATED PARAMETERS
// All multipliers start at empirically reasonable values.
// The online learning loop adjusts these after each settled round.
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_CALIBRATED_PARAMETERS: CalibratedParameters = {
  // Prior vs market blend (must sum to ~1.0 for balanced fusion)
  baselinePriorH: EMPIRICAL_BASELINE_H,
  baselinePriorD: EMPIRICAL_BASELINE_D,
  baselinePriorA: EMPIRICAL_BASELINE_A,
  priorWeight: 0.35,
  marketWeight: 0.65,

  // Referee signal weights
  refereeHomeBiasMultiplier: 1.5,
  refereeDrawRateMultiplier: 1.2,

  // Sponsorship conflict draw boost (log-odds addition)
  sponsorDrawBoost: 0.35,

  // Trap line discounts/premiums (log-odds)
  trapHomeDiscount: 0.28,
  trapAwayPremium: 0.22,

  // Positional spell mean-reversion multipliers
  positionalSpellDrawMultiplier: 0.18,
  positionalSpellAwayMultiplier: 0.14,

  // Dirichlet smoothing alpha (higher = more conservative / prior-hugging)
  dirichletAlpha: 2.8,

  // LLN pool convergence strength
  llnCorrectionStrength: 1.9,

  // Accuracy tracking
  accuracyEstimate: 50.0,
  lastCalibratedAt: new Date().toISOString(),
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Safe natural log of odds — clamps extreme probs to prevent ±Infinity */
function logit(p: number): number {
  const clamped = Math.max(0.001, Math.min(0.999, p));
  return Math.log(clamped / (1 - clamped));
}

/** Sigmoid (inverse logit) */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Fractional Kelly sizing — returns fraction of bankroll to stake */
function kelly(prob: number, decimalOdd: number, fraction: number): number {
  const b = decimalOdd - 1; // net decimal odds
  if (b <= 0) return 0;
  const k = (b * prob - (1 - prob)) / b;
  return Math.max(0, Math.round(k * fraction * 10000) / 10000);
}

/** Remove bookmaker overround from raw 1X2 odds → fair implied probs */
function fairImpliedProbs(
  hOdd: number,
  dOdd: number,
  aOdd: number,
): { marketH: number; marketD: number; marketA: number; overround: number } {
  const overround = 1 / hOdd + 1 / dOdd + 1 / aOdd;
  return {
    marketH: 1 / hOdd / overround,
    marketD: 1 / dOdd / overround,
    marketA: 1 / aOdd / overround,
    overround,
  };
}

/** Brier score for a single match — measures calibration quality (lower = better) */
function brierScore(
  probH: number,
  probD: number,
  probA: number,
  actual: "H" | "D" | "A",
): number {
  const rH = actual === "H" ? 1 : 0;
  const rD = actual === "D" ? 1 : 0;
  const rA = actual === "A" ? 1 : 0;
  return (
    Math.pow(probH - rH, 2) +
    Math.pow(probD - rD, 2) +
    Math.pow(probA - rA, 2)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 1–12: CORE PREDICTION FUNCTION FOR A SINGLE MATCH
// Returns the enriched prediction object plus detailed reason log.
// ─────────────────────────────────────────────────────────────────────────────
export function predictMatch(
  m: Match,
  params: CalibratedParameters,
  posMetric: PositionalOutcomeMetrics | undefined,
  neuralActivations: NeuralPathActivation[],
  poolRunningCounts: { rH: number; rD: number; rA: number; total: number },
): Required<Match>["predictions"] {
  const reasons: string[] = [];

  // ── Resolve best available odds (SP preferred, Mozzart fallback) ──────────
  const hOdd = m.spHomeOdd || m.mozzHomeOdd;
  const dOdd = m.spDrawOdd || m.mozzDrawOdd;
  const aOdd = m.spAwayOdd || m.mozzAwayOdd;

  // Use B365 as third-source consensus if available
  const b365H = m.b365HomeOdd;
  const b365D = m.b365DrawOdd;
  const b365A = m.b365AwayOdd;

  // ── MODULE 1: Bayesian Log-Odds Core ─────────────────────────────────────
  // Combine empirical baseline prior (logit-transformed) with
  // fair market probabilities (overround-removed) using calibrated weights.
  const { marketH, marketD, marketA, overround } = fairImpliedProbs(hOdd, dOdd, aOdd);

  let logH =
    logit(params.baselinePriorH) * params.priorWeight +
    logit(marketH) * params.marketWeight;
  let logD =
    logit(params.baselinePriorD) * params.priorWeight +
    logit(marketD) * params.marketWeight;
  let logA =
    logit(params.baselinePriorA) * params.priorWeight +
    logit(marketA) * params.marketWeight;

  reasons.push(
    `[M1] Bayesian fusion: Prior(H=${(params.baselinePriorH * 100).toFixed(1)}% D=${(params.baselinePriorD * 100).toFixed(1)}% A=${(params.baselinePriorA * 100).toFixed(1)}%) × market(H=${(marketH * 100).toFixed(1)}% D=${(marketD * 100).toFixed(1)}% A=${(marketA * 100).toFixed(1)}%, OR=${overround.toFixed(3)}).`,
  );

  // ── MODULE 8: Cross-Bookie Discrepancy (3-source consensus) ──────────────
  // If B365 differs from Mozzart/SP by >0.35 on Draw, there is hidden value.
  if (b365H && b365D && b365A) {
    const { marketH: b365IH, marketD: b365ID, marketA: b365IA } = fairImpliedProbs(
      b365H,
      b365D,
      b365A,
    );
    // Weighted average of all 3 sources for each outcome
    const triH = (marketH + b365IH) / 2;
    const triD = (marketD + b365ID) / 2;
    const triA = (marketA + b365IA) / 2;
    // Apply a small residual correction toward the 3-source consensus
    const consensusBoost = 0.4;
    logH += logit(triH) * consensusBoost * 0.1;
    logD += logit(triD) * consensusBoost * 0.1;
    logA += logit(triA) * consensusBoost * 0.1;

    const drawGap = Math.abs((m.b365DrawOdd ?? 0) - (m.spDrawOdd ?? m.mozzDrawOdd));
    if (drawGap > 0.35) {
      logD += 0.22;
      reasons.push(
        `[M8] Cross-bookie Draw discrepancy: B365 vs SP gap of ${drawGap.toFixed(2)}. Hidden Draw value detected. +0.22 log-odds.`,
      );
    }
    reasons.push(
      `[M8] 3-source consensus correction applied (B365+SP+Mozz blend).`,
    );
  } else if (m.spDrawOdd && m.mozzDrawOdd) {
    const drawGap = Math.abs(m.spDrawOdd - m.mozzDrawOdd);
    if (drawGap > 0.35) {
      logD += 0.20;
      reasons.push(
        `[M8] SP vs Mozzart Draw gap of ${drawGap.toFixed(2)} → hidden value, +0.20 log-odds.`,
      );
    }
  }

  // ── MODULE 6: Referee Bias Integrator ────────────────────────────────────
  if (m.refereeHomeBias && Math.abs(m.refereeHomeBias) > 0.01) {
    logH += m.refereeHomeBias * params.refereeHomeBiasMultiplier;
    reasons.push(
      `[M6] Referee "${m.referee}": home bias ${m.refereeHomeBias > 0 ? "+" : ""}${(m.refereeHomeBias * 100).toFixed(1)}% × multiplier ${params.refereeHomeBiasMultiplier}. logH adjusted.`,
    );
  }
  if (m.refereeDrawRate && m.refereeDrawRate > params.baselinePriorD + 0.03) {
    const drawBoost =
      (m.refereeDrawRate - params.baselinePriorD) *
      params.refereeDrawRateMultiplier;
    logD += drawBoost;
    reasons.push(
      `[M6] Referee "${m.referee}": draw rate ${(m.refereeDrawRate * 100).toFixed(1)}% > baseline. +${drawBoost.toFixed(3)} logD.`,
    );
  }

  // ── MODULE 12: Velocity / Sharp Money Signal ──────────────────────────────
  // Detects late sharp money movement from O/U + 1X2 odds drift.
  let velocitySignal: "STABLE" | "SHARP_HOME_DRIFT" | "SHARP_AWAY_DRIFT" | "DRAW_ANOMALY" =
    "STABLE";

  if (m.overOdds && m.underOdds) {
    const ouRatio = m.overOdds / m.underOdds;
    if (ouRatio < 0.82) {
      // Under heavily favoured — sharp money on low-scoring match → suppresses Home
      logH -= 0.12;
      logA -= 0.10;
      logD += 0.18;
      velocitySignal = "DRAW_ANOMALY";
      reasons.push(
        `[M12] O/U velocity: Under heavily favoured (ratio ${ouRatio.toFixed(2)}). Low-scoring signal. Draw boosted +0.18.`,
      );
    } else if (ouRatio > 1.25) {
      // Over heavily favoured — high-scoring match → suppresses Draw
      logD -= 0.14;
      velocitySignal = "SHARP_HOME_DRIFT";
      reasons.push(
        `[M12] O/U velocity: Over favoured (ratio ${ouRatio.toFixed(2)}). High-scoring signal. Draw suppressed -0.14.`,
      );
    }
  }

  // GG/NG signal
  if (m.ggOdds && m.ngOdds) {
    const ggRatio = m.ggOdds / m.ngOdds;
    if (ggRatio < 0.85) {
      // Both teams expected to score — increases draw probability slightly
      logD += 0.10;
      reasons.push(
        `[M12] GG/NG: Both teams likely to score (ratio ${ggRatio.toFixed(2)}). +0.10 logD.`,
      );
    }
  }

  // ── MODULE 13: H2H Draw Rate Integrator ──────────────────────────────────
  if (m.h2hDrawRate && m.h2hDrawRate > params.baselinePriorD + 0.05) {
    const h2hBoost = (m.h2hDrawRate - params.baselinePriorD) * 1.1;
    logD += h2hBoost;
    reasons.push(
      `[M13] H2H history: Historical draw rate ${(m.h2hDrawRate * 100).toFixed(1)}% > baseline. +${h2hBoost.toFixed(3)} logD.`,
    );
  }
  if (m.h2hAwayWinRate && m.h2hAwayWinRate > params.baselinePriorA + 0.05) {
    const h2hABoost = (m.h2hAwayWinRate - params.baselinePriorA) * 0.9;
    logA += h2hABoost;
    reasons.push(
      `[M13] H2H history: Away win rate ${(m.h2hAwayWinRate * 100).toFixed(1)}% > baseline. +${h2hABoost.toFixed(3)} logA.`,
    );
  }

  // ── MODULE 7: Sponsorship Conflict Draw Booster ───────────────────────────
  let isSponsorDraw = false;
  if (m.sponsorsMatch) {
    logD += params.sponsorDrawBoost;
    isSponsorDraw = true;
    reasons.push(
      `[M7] Sponsorship conflict: Both clubs share kit sponsor (${m.homeSponsor}). Draw boosted +${params.sponsorDrawBoost.toFixed(2)}.`,
    );
  }

  // ── MODULE 5: Adversarial Trap Solver ────────────────────────────────────
  // isTrap = true if trapAdvised (from solveTrapLines) OR heuristic positions
  let isTrap = false;
  if (m.trapAdvised) {
    isTrap = true;
    logH -= params.trapHomeDiscount;
    logA += params.trapAwayPremium;
    reasons.push(
      `[M5] Adversarial trap detected: ${m.trapReason || "Bookmaker pricing anomaly"}. Home suppressed -${params.trapHomeDiscount.toFixed(2)}, Away boosted +${params.trapAwayPremium.toFixed(2)}.`,
    );
  } else if (m.id === 3 || m.id === 5 || m.id === 13) {
    // Historically identified heuristic trap positions
    isTrap = true;
    logH -= params.trapHomeDiscount * 0.75;
    logA += params.trapAwayPremium * 0.71;
    reasons.push(
      `[M5] Heuristic trap position (Slot ${m.id}): Structural inverse bookie model applied.`,
    );
  }

  // ── MODULE 3: Positional Spell-State Engine ───────────────────────────────
  if (posMetric) {
    // Draw spell: if σ > 1.5 → draws overdue → boost
    if (posMetric.outcomes.D.deviationSigma > 1.5) {
      const drawBoost =
        posMetric.outcomes.D.deviationSigma * params.positionalSpellDrawMultiplier;
      logD += drawBoost;
      reasons.push(
        `[M3] Draw spell at Slot ${m.id}: dry spell ${posMetric.outcomes.D.currentDrySpell} rounds (μ=${posMetric.outcomes.D.mean}, σ=+${posMetric.outcomes.D.deviationSigma}). Mean-reversion: +${drawBoost.toFixed(3)} logD.`,
      );
    }
    // Away spell: if σ > 1.6 → Away wins overdue → boost
    if (posMetric.outcomes.A.deviationSigma > 1.6) {
      const awayBoost =
        posMetric.outcomes.A.deviationSigma * params.positionalSpellAwayMultiplier;
      logA += awayBoost;
      reasons.push(
        `[M3] Away spell at Slot ${m.id}: dry spell ${posMetric.outcomes.A.currentDrySpell} rounds (μ=${posMetric.outcomes.A.mean}, σ=+${posMetric.outcomes.A.deviationSigma}). Mean-reversion: +${awayBoost.toFixed(3)} logA.`,
      );
    }
    // Home spell: if H is far overdue (σ > 1.9) → boost
    if (posMetric.outcomes.H.deviationSigma > 1.9) {
      const homeBoost =
        posMetric.outcomes.H.deviationSigma * 0.10;
      logH += homeBoost;
      reasons.push(
        `[M3] Home spell at Slot ${m.id}: σ=+${posMetric.outcomes.H.deviationSigma}. +${homeBoost.toFixed(3)} logH.`,
      );
    }
    // O/U spell signals
    if (posMetric.overUnder.U.deviationSigma > 1.7 && velocitySignal === "STABLE") {
      logD += 0.10;
      reasons.push(
        `[M3] Under spell at Slot ${m.id}: σ=+${posMetric.overUnder.U.deviationSigma}. Low-scoring match likely → Draw boosted +0.10.`,
      );
    }
    // Recommended adjustment from neural co-firing
    const recAdj = posMetric.neuralCoFiringActivations?.recommendedAdjustment;
    if (recAdj && recAdj !== "NEUTRAL") {
      const boost = 0.12;
      if (recAdj === "D") logD += boost;
      else if (recAdj === "A") logA += boost;
      else if (recAdj === "H") logH += boost;
      reasons.push(
        `[M3+M4] Neural co-firing recommendation: ${recAdj} (+${boost} log-odds from concurrent position activations).`,
      );
    }
  }

  // ── MODULE 4: Neural Path Activation Check ────────────────────────────────
  const matchActivation = neuralActivations.find(
    (a) => a.position === m.id && a.activeSequenceMatch,
  );
  if (matchActivation) {
    const seqBoost = (matchActivation.confidencePct / 100) * 0.20;
    if (matchActivation.outcome === "D") logD += seqBoost;
    else if (matchActivation.outcome === "A") logA += seqBoost;
    else if (matchActivation.outcome === "H") logH += seqBoost;
    else if (matchActivation.outcome === "O") {
      logD -= 0.10; // Over expected → reduce draw
    }
    reasons.push(
      `[M4] Neural path active at Slot ${m.id}: Sequence [${matchActivation.triggerSequence.join("→")}] matched. Predicts ${matchActivation.outcome} with ${matchActivation.confidencePct}% confidence. +${seqBoost.toFixed(3)} log-odds applied.`,
    );
  }

  // ── MODULE 9: Positional Drift / Cross-Pool Alignment ────────────────────
  if (m.isRepeated && m.mozzPosition !== undefined && m.spPosition !== undefined) {
    const drift = Math.abs(m.mozzPosition - m.spPosition);
    if (drift > 5) {
      logD += 0.30;
      m.positionalBiasScore = 0.30;
      m.expectedDistributionBias = "D";
      reasons.push(
        `[M9] Cross-pool drift: Slot ${m.mozzPosition} (Mozz) vs ${m.spPosition} (SP) — drift ${drift}. Bookmaker draw-cluster bias. +0.30 logD.`,
      );
    } else if (drift === 0) {
      logH += 0.15;
      m.positionalBiasScore = -0.10;
      m.expectedDistributionBias = "H";
      reasons.push(
        `[M9] Cross-pool conformity: Same slot ${m.mozzPosition} across bookmakers → strong home baseline. +0.15 logH.`,
      );
    } else {
      m.positionalBiasScore = 0.08;
      m.expectedDistributionBias = "NEUTRAL";
      reasons.push(
        `[M9] Cross-pool modest drift (${drift} slots) → normal pricing consensus.`,
      );
    }
  }

  // ── MODULE 2: Adaptive Dirichlet Smoothing ────────────────────────────────
  // Convert log-odds → probabilities
  const pH = sigmoid(logH);
  const pD = sigmoid(logD);
  const pA = sigmoid(logA);
  const sumRaw = pH + pD + pA;
  let probH = pH / sumRaw;
  let probD = pD / sumRaw;
  let probA = pA / sumRaw;

  // Adaptive alpha: use a smaller alpha when positional spells are strong
  // (i.e., trust the spell signal more, smooth less)
  const spellStrength = posMetric
    ? Math.max(
        posMetric.outcomes.D.deviationSigma,
        posMetric.outcomes.A.deviationSigma,
      )
    : 0;
  const adaptiveAlpha = Math.max(
    1.2,
    params.dirichletAlpha - spellStrength * 0.3,
  );
  const dirPrior = 1 / 3; // symmetric Dirichlet prior
  probH = (probH + adaptiveAlpha * dirPrior) / (1 + adaptiveAlpha);
  probD = (probD + adaptiveAlpha * dirPrior) / (1 + adaptiveAlpha);
  probA = (probA + adaptiveAlpha * dirPrior) / (1 + adaptiveAlpha);

  // Re-normalize
  const sumDir = probH + probD + probA;
  probH /= sumDir;
  probD /= sumDir;
  probA /= sumDir;

  reasons.push(
    `[M2] Adaptive Dirichlet smoothing: α=${adaptiveAlpha.toFixed(2)} (spell strength=${spellStrength.toFixed(2)}). Final: H=${(probH * 100).toFixed(1)}% D=${(probD * 100).toFixed(1)}% A=${(probA * 100).toFixed(1)}%.`,
  );

  // ── Pool balance suppression (applied before LLN pass) ───────────────────
  // If pool already has many H or D predictions, softly suppress
  const { rH, rD, rA, total } = poolRunningCounts;
  if (total > 0) {
    const ratioH = rH / total;
    const ratioD = rD / total;
    if (ratioH > params.baselinePriorH + 0.08) {
      probH *= 0.92;
    }
    if (ratioD > params.baselinePriorD + 0.06) {
      probD *= 0.93;
    }
    // Renormalize
    const s = probH + probD + probA;
    probH /= s;
    probD /= s;
    probA /= s;
  }

  // ── Best pick selection ───────────────────────────────────────────────────
  const bestPick =
    probH >= probD && probH >= probA
      ? "H"
      : probD >= probA
      ? "D"
      : "A";

  // ── MODULE 15: Expected Value ─────────────────────────────────────────────
  const evH = Math.round((probH * hOdd - 1) * 1000) / 1000;
  const evD = Math.round((probD * dOdd - 1) * 1000) / 1000;
  const evA = Math.round((probA * aOdd - 1) * 1000) / 1000;

  // ── MODULE 14: Kelly Criterion Staking ───────────────────────────────────
  // kellyFraction hardcoded at 0.25 here; caller should pass it if different
  const kf = 0.25;
  const kellyH = kelly(probH, hOdd, kf);
  const kellyD = kelly(probD, dOdd, kf);
  const kellyA = kelly(probA, aOdd, kf);

  return {
    probH: Math.round(probH * 10000) / 10000,
    probD: Math.round(probD * 10000) / 10000,
    probA: Math.round(probA * 10000) / 10000,
    bestPick,
    evH,
    evD,
    evA,
    kellyH,
    kellyD,
    kellyA,
    isTrap,
    isSponsorDraw,
    velocitySignal,
    reasons,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 10 + 11: LLN CONVERGENCE + SEGMENT DRAW DAMPING
// Called as a second pass AFTER all matches have been predicted.
// ─────────────────────────────────────────────────────────────────────────────
export function applyLLNPass(
  matches: Match[],
  params: CalibratedParameters,
): void {
  const totalN = matches.length;
  const segmentSize = Math.ceil(totalN / 4);
  let runH = 0;
  let runD = 0;
  let runA = 0;

  for (let i = 0; i < totalN; i++) {
    const m = matches[i];
    const pred = m.predictions;
    if (!pred) continue;

    // ── MODULE 10: LLN Convergence ──────────────────────────────────────
    let llnH = 1.0;
    let llnD = 1.0;
    let llnA = 1.0;

    if (i > 0) {
      const ratioH = runH / i;
      const ratioD = runD / i;
      const ratioA = runA / i;
      const str = params.llnCorrectionStrength;

      if (ratioH > params.baselinePriorH + 0.10)
        llnH = Math.max(0.60, 1.0 - (ratioH - params.baselinePriorH) * str);
      else if (ratioH < params.baselinePriorH - 0.10)
        llnH = Math.min(1.40, 1.0 + (params.baselinePriorH - ratioH) * str);

      if (ratioD > params.baselinePriorD + 0.08)
        llnD = Math.max(0.60, 1.0 - (ratioD - params.baselinePriorD) * str * 1.1);
      else if (ratioD < params.baselinePriorD - 0.08)
        llnD = Math.min(1.40, 1.0 + (params.baselinePriorD - ratioD) * str * 1.1);

      if (ratioA > params.baselinePriorA + 0.10)
        llnA = Math.max(0.60, 1.0 - (ratioA - params.baselinePriorA) * str);
      else if (ratioA < params.baselinePriorA - 0.10)
        llnA = Math.min(1.40, 1.0 + (params.baselinePriorA - ratioA) * str);
    }

    // ── MODULE 11: Segment Draw Damping ────────────────────────────────
    const segStart = Math.floor(i / segmentSize) * segmentSize;
    let drawsInSeg = 0;
    for (let j = segStart; j < i; j++) {
      if (matches[j].predictions?.bestPick === "D") drawsInSeg++;
    }
    const segDamp = drawsInSeg >= 2 ? Math.pow(0.83, drawsInSeg) : 1.0;

    // Apply corrections
    let newH = pred.probH * llnH;
    let newD = pred.probD * llnD * segDamp;
    let newA = pred.probA * llnA;
    const s = newH + newD + newA;
    pred.probH = Math.round((newH / s) * 10000) / 10000;
    pred.probD = Math.round((newD / s) * 10000) / 10000;
    pred.probA = Math.round((newA / s) * 10000) / 10000;

    // Re-elect best pick
    pred.bestPick =
      pred.probH >= pred.probD && pred.probH >= pred.probA
        ? "H"
        : pred.probD >= pred.probA
        ? "D"
        : "A";

    if (llnH !== 1.0 || llnD !== 1.0 || llnA !== 1.0 || segDamp !== 1.0) {
      pred.reasons.push(
        `[M10+M11] LLN correction [H:×${llnH.toFixed(2)} D:×${llnD.toFixed(2)} A:×${llnA.toFixed(2)}]. Segment draw damping: ×${segDamp.toFixed(2)} (${drawsInSeg} draws in segment Q${Math.floor(i / segmentSize) + 1}).`,
      );
    }

    // Update running counts
    if (pred.bestPick === "H") runH++;
    else if (pred.bestPick === "D") runD++;
    else runA++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL POOL PREDICTION ORCHESTRATOR
// Runs all 16 modules in the correct order for a pool of matches.
// ─────────────────────────────────────────────────────────────────────────────
export function runFullPrediction(
  matches: Match[],
  params: CalibratedParameters,
  positionalMetrics: Record<number, PositionalOutcomeMetrics> | undefined,
  neuralActivations: NeuralPathActivation[],
  kellyFraction: number,
): Match[] {
  const running = { rH: 0, rD: 0, rA: 0, total: 0 };

  // PASS 1: Per-match Bayesian + signal fusion
  for (const m of matches) {
    const posMetric = positionalMetrics?.[m.id];
    m.predictions = predictMatch(m, params, posMetric, neuralActivations, running);

    // Update running tally
    const pick = m.predictions.bestPick;
    if (pick === "H") running.rH++;
    else if (pick === "D") running.rD++;
    else running.rA++;
    running.total++;
  }

  // PASS 2: LLN convergence + segment damping
  applyLLNPass(matches, params);

  return matches;
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 16: MONTE CARLO COUPON OPTIMIZER
// ─────────────────────────────────────────────────────────────────────────────
export function runMonteCarloCoupons(
  matches: Match[],
  drawTargets: number[],
  nSimulations: number,
): Coupon[] {
  const couponsMap = new Map<string, number>();

  for (let sim = 0; sim < nSimulations; sim++) {
    let couponStr = "";
    let drawsCount = 0;

    for (const m of matches) {
      const pred = m.predictions!;
      const rand = Math.random();
      let pick: string;
      if (rand < pred.probH) {
        pick = "H";
      } else if (rand < pred.probH + pred.probD) {
        pick = "D";
        drawsCount++;
      } else {
        pick = "A";
      }
      couponStr += pick;
    }

    if (drawTargets.includes(drawsCount)) {
      couponsMap.set(couponStr, (couponsMap.get(couponStr) || 0) + 1);
    }
  }

  // Sort by weight
  const sortedEntries = Array.from(couponsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const totalWeight = sortedEntries.reduce((s, [, w]) => s + w, 0);

  return sortedEntries.map(([couponString, weight]) => {
    let ev = 0;
    couponString.split("").forEach((pick, idx) => {
      const pred = matches[idx]?.predictions;
      if (!pred) return;
      if (pick === "H") ev += pred.evH;
      else if (pick === "D") ev += pred.evD;
      else if (pick === "A") ev += pred.evA;
    });

    return {
      couponString,
      weight,
      weightPct: totalWeight > 0 ? `${((weight / totalWeight) * 100).toFixed(2)}%` : "0.00%",
      coverage: weight / nSimulations,
      ev: Math.round((ev / matches.length) * 1000) / 1000,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 17: ONLINE LEARNING LOOP
// Called from /api/resolve-round after real outcomes are confirmed.
// Adjusts calibrated parameters based on actual vs predicted outcomes.
// ─────────────────────────────────────────────────────────────────────────────
export function runOnlineLearning(
  settledMatches: Match[],
  params: CalibratedParameters,
  accuracyHistory: RoundAccuracyRecord[],
  roundNumber: number,
): CalibratedParameters {
  const updated = { ...params };

  const playedMatches = settledMatches.filter(
    (m) => m.outcome && m.predictions,
  );
  if (playedMatches.length === 0) return updated;

  // ── Accuracy stats ────────────────────────────────────────────────────────
  let correct = 0;
  let totalBrier = 0;
  let trapCorrect = 0;
  let trapTotal = 0;
  let spellCorrect = 0;
  let spellTotal = 0;
  let drawCorrect = 0;
  let drawTotal = 0;

  // Track which signal types were right/wrong
  let priorAlignedCount = 0; // matches where prior side (H) was correct
  let marketAlignedCount = 0; // matches where market side was correct

  for (const m of playedMatches) {
    const pred = m.predictions!;
    const actual = m.outcome!;

    const isCorrect = pred.bestPick === actual;
    if (isCorrect) correct++;

    // Brier score
    totalBrier += brierScore(pred.probH, pred.probD, pred.probA, actual);

    // Trap accuracy
    if (m.trapAdvised) {
      trapTotal++;
      if (isCorrect) trapCorrect++;
    }

    // Spell accuracy (any spell σ > 1.5)
    if (
      pred.reasons.some((r) => r.includes("[M3]"))
    ) {
      spellTotal++;
      if (isCorrect) spellCorrect++;
    }

    // Draw accuracy
    if (pred.bestPick === "D") {
      drawTotal++;
      if (actual === "D") drawCorrect++;
    }

    // Prior vs market alignment
    const priorPick =
      params.baselinePriorH >= params.baselinePriorD &&
      params.baselinePriorH >= params.baselinePriorA
        ? "H"
        : params.baselinePriorD >= params.baselinePriorA
        ? "D"
        : "A";
    const marketH = 1 / m.mozzHomeOdd;
    const marketD = 1 / m.mozzDrawOdd;
    const marketA = 1 / m.mozzAwayOdd;
    const marketPick =
      marketH >= marketD && marketH >= marketA
        ? "H"
        : marketD >= marketA
        ? "D"
        : "A";

    if (priorPick === actual) priorAlignedCount++;
    if (marketPick === actual) marketAlignedCount++;
  }

  const n = playedMatches.length;
  const accuracy = (correct / n) * 100;
  const avgBrier = totalBrier / n;
  const trapAcc = trapTotal > 0 ? (trapCorrect / trapTotal) * 100 : -1;
  const spellAcc = spellTotal > 0 ? (spellCorrect / spellTotal) * 100 : -1;
  const drawAcc = drawTotal > 0 ? (drawCorrect / drawTotal) * 100 : -1;

  // ── Learning Step 1: Prior vs Market weight adjustment ───────────────────
  // If market was more correct than prior, increase marketWeight slightly
  const priorRate = priorAlignedCount / n;
  const marketRate = marketAlignedCount / n;
  const WEIGHT_STEP = 0.02;

  if (marketRate > priorRate + 0.05) {
    updated.marketWeight = Math.min(0.80, params.marketWeight + WEIGHT_STEP);
    updated.priorWeight = Math.max(0.20, params.priorWeight - WEIGHT_STEP);
  } else if (priorRate > marketRate + 0.05) {
    updated.priorWeight = Math.min(0.50, params.priorWeight + WEIGHT_STEP);
    updated.marketWeight = Math.max(0.50, params.marketWeight - WEIGHT_STEP);
  }

  // ── Learning Step 2: Dirichlet alpha via Brier score ─────────────────────
  // Good calibration (Brier < 0.60) → reduce alpha (trust predictions more)
  // Poor calibration (Brier > 0.75) → increase alpha (smooth toward prior)
  const ALPHA_STEP = 0.15;
  if (avgBrier < 0.58 && params.dirichletAlpha > 1.5) {
    updated.dirichletAlpha = Math.max(1.5, params.dirichletAlpha - ALPHA_STEP);
  } else if (avgBrier > 0.72 && params.dirichletAlpha < 4.5) {
    updated.dirichletAlpha = Math.min(4.5, params.dirichletAlpha + ALPHA_STEP);
  }

  // ── Learning Step 3: Positional spell multiplier ─────────────────────────
  // If spell-triggered matches were accurate → strengthen multiplier
  // If spell-triggered matches were inaccurate → weaken multiplier
  const SPELL_STEP = 0.015;
  if (spellAcc >= 0) {
    if (spellAcc > 55) {
      updated.positionalSpellDrawMultiplier = Math.min(
        0.35,
        params.positionalSpellDrawMultiplier + SPELL_STEP,
      );
      updated.positionalSpellAwayMultiplier = Math.min(
        0.30,
        params.positionalSpellAwayMultiplier + SPELL_STEP,
      );
    } else if (spellAcc < 40) {
      updated.positionalSpellDrawMultiplier = Math.max(
        0.05,
        params.positionalSpellDrawMultiplier - SPELL_STEP,
      );
      updated.positionalSpellAwayMultiplier = Math.max(
        0.05,
        params.positionalSpellAwayMultiplier - SPELL_STEP,
      );
    }
  }

  // ── Learning Step 4: Trap accuracy ───────────────────────────────────────
  const TRAP_STEP = 0.02;
  if (trapAcc >= 0) {
    if (trapAcc > 60) {
      // Traps are working → strengthen
      updated.trapHomeDiscount = Math.min(0.45, params.trapHomeDiscount + TRAP_STEP);
      updated.trapAwayPremium = Math.min(0.40, params.trapAwayPremium + TRAP_STEP);
    } else if (trapAcc < 40) {
      // Traps not working → weaken
      updated.trapHomeDiscount = Math.max(0.10, params.trapHomeDiscount - TRAP_STEP);
      updated.trapAwayPremium = Math.max(0.08, params.trapAwayPremium - TRAP_STEP);
    }
  }

  // ── Learning Step 5: LLN strength via pool distribution error ────────────
  // Check if final H/D/A distribution in this round was far from baseline
  const roundH = playedMatches.filter((m) => m.outcome === "H").length / n;
  const roundD = playedMatches.filter((m) => m.outcome === "D").length / n;
  const roundA = playedMatches.filter((m) => m.outcome === "A").length / n;
  const distError =
    Math.abs(roundH - params.baselinePriorH) +
    Math.abs(roundD - params.baselinePriorD) +
    Math.abs(roundA - params.baselinePriorA);

  const LLN_STEP = 0.05;
  if (distError > 0.15) {
    // Pool diverged heavily — increase LLN strength next round
    updated.llnCorrectionStrength = Math.min(3.0, params.llnCorrectionStrength + LLN_STEP);
  } else if (distError < 0.06) {
    // Pool converged well — can relax LLN a bit
    updated.llnCorrectionStrength = Math.max(1.2, params.llnCorrectionStrength - LLN_STEP);
  }

  // ── Learning Step 6: Update baseline priors with exponential decay ────────
  // Slowly nudge baseline toward empirical rolling average (10% blend)
  const PRIOR_BLEND = 0.08;
  updated.baselinePriorH =
    params.baselinePriorH * (1 - PRIOR_BLEND) + roundH * PRIOR_BLEND;
  updated.baselinePriorD =
    params.baselinePriorD * (1 - PRIOR_BLEND) + roundD * PRIOR_BLEND;
  updated.baselinePriorA =
    1 - updated.baselinePriorH - updated.baselinePriorD;

  // ── Record this round's accuracy ──────────────────────────────────────────
  updated.accuracyEstimate =
    accuracyHistory.length > 0
      ? (accuracyHistory.slice(-5).reduce((s, r) => s + r.accuracy, 0) /
          Math.min(5, accuracyHistory.length)) *
          0.6 +
        accuracy * 0.4
      : accuracy;
  updated.lastCalibratedAt = new Date().toISOString();

  accuracyHistory.push({
    roundNumber,
    date: new Date().toLocaleDateString(),
    totalMatches: n,
    correctPicks: correct,
    accuracy: Math.round(accuracy * 10) / 10,
    brierScore: Math.round(avgBrier * 10000) / 10000,
    trapAccuracy: trapAcc >= 0 ? Math.round(trapAcc * 10) / 10 : -1,
    spellAccuracy: spellAcc >= 0 ? Math.round(spellAcc * 10) / 10 : -1,
    drawAccuracy: drawAcc >= 0 ? Math.round(drawAcc * 10) / 10 : -1,
    paramSnapshot: {
      priorWeight: updated.priorWeight,
      marketWeight: updated.marketWeight,
      dirichletAlpha: updated.dirichletAlpha,
      positionalSpellDrawMultiplier: updated.positionalSpellDrawMultiplier,
      llnCorrectionStrength: updated.llnCorrectionStrength,
      trapHomeDiscount: updated.trapHomeDiscount,
    },
  });

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY METRICS BUILDER
// Computes the summary block shown in PredictionConsole.
// ─────────────────────────────────────────────────────────────────────────────
export function buildSummaryMetrics(
  matches: Match[],
  params: CalibratedParameters,
): DashboardState["summaryMetrics"] {
  let totalH = 0;
  let totalD = 0;
  let totalA = 0;
  let sumEv = 0;
  let repeatedCount = 0;
  let totalDrift = 0;
  let maxDrift = 0;
  let maxDriftFixture = "";
  let drawPatternMatches = 0;

  for (const m of matches) {
    const pred = m.predictions;
    if (!pred) continue;

    if (pred.bestPick === "H") totalH++;
    else if (pred.bestPick === "D") { totalD++; drawPatternMatches++; }
    else totalA++;

    const bestEv = Math.max(pred.evH, pred.evD, pred.evA);
    sumEv += bestEv;

    if (m.isRepeated) {
      repeatedCount++;
      const drift =
        m.mozzPosition !== undefined && m.spPosition !== undefined
          ? Math.abs(m.mozzPosition - m.spPosition)
          : 0;
      totalDrift += drift;
      if (drift > maxDrift) {
        maxDrift = drift;
        maxDriftFixture = `${m.homeTeam} vs ${m.awayTeam}`;
      }
    }
  }

  const n = matches.length || 1;
  const bookieExposure = Math.round(
    (Math.abs(totalH - Math.round(params.baselinePriorH * n)) +
      Math.abs(totalD - Math.round(params.baselinePriorD * n))) *
      10,
  ) / 10;

  const upsetBudget = matches.filter(
    (m) => m.predictions?.isTrap,
  ).length;

  const regime =
    totalD > params.baselinePriorD * n * 1.3
      ? "DRAW_HEAVY_REGIME"
      : totalA > params.baselinePriorA * n * 1.3
      ? "AWAY_HEAVY_REGIME"
      : totalH > params.baselinePriorH * n * 1.15
      ? "HOME_FAVOURED_REGIME"
      : "BALANCED_FIELD";

  return {
    totalExpectedH: totalH,
    totalExpectedD: totalD,
    totalExpectedA: totalA,
    bookieExposure,
    upsetBudget,
    regime,
    repeatedMatchesCount: repeatedCount,
    averagePositionDrift:
      repeatedCount > 0
        ? Math.round((totalDrift / repeatedCount) * 10) / 10
        : 0,
    maxPositionalShiftFixture: maxDriftFixture,
    drawPatternConformity: Math.round(
      (drawPatternMatches /
        Math.max(1, Math.round(params.baselinePriorD * n))) *
        100,
    ),
  };
}
