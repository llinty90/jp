export interface Match {
  id: number;
  matchDate: string;
  matchTime: string;
  country: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  mozzHomeOdd: number;
  mozzDrawOdd: number;
  mozzAwayOdd: number;
  spHomeOdd?: number;
  spDrawOdd?: number;
  spAwayOdd?: number;
  b365HomeOdd?: number;
  b365DrawOdd?: number;
  b365AwayOdd?: number;
  spMatchedName?: string;
  spMatchConfidence?: number; // 0 to 1
  spMatchMethod?: "fuzzy_overlap" | "gemini_resolved" | "manual" | "failed";
  referee?: string;
  refereeHomeBias?: number; // home win rate deviation
  refereeDrawRate?: number;
  refereeMatches?: number;
  stadiumCapacity?: number;
  attendanceRate?: number;
  altitudeM?: number;
  homeSponsor?: string;
  awaySponsor?: string;
  sponsorsMatch?: boolean;
  isDerby?: boolean;
  relegationBattle?: boolean;
  h2hDrawRate?: number;
  h2hAwayWinRate?: number;
  overOdds?: number;
  underOdds?: number;
  ggOdds?: number;
  ngOdds?: number;
  predictions?: PredictionResult;
  outcome?: "H" | "D" | "A";
  overUnderOutcome?: "O" | "U";
  ggNgOutcome?: "GG" | "NG";
  homeScore?: number;
  awayScore?: number;
  // Cross-Pool and Positional Bias modeling properties
  poolType?: "daily" | "sportpesa_daily" | "mozz_weekly" | "sportpesa_weekly";
  mozzPosition?: number; // Slot index in Mozzart (e.g. 1 to 16/17)
  spPosition?: number;   // Slot index in SportPesa
  isRepeated?: boolean;  // Repeated across Daily vs Weekly or Mozzart vs SportPesa
  repeatedInPools?: string[];
  positionalBiasScore?: number; // Structural placement bias offset calculated by the engine
  expectedDistributionBias?: "H" | "D" | "A" | "NEUTRAL";
  positionalMetrics?: PositionalOutcomeMetrics;
  trapAdvised?: boolean;
  trapReason?: string;
}

export interface SpellStats {
  mean: number;
  median: number;
  stdev: number;
  variance: number;
  min: number;
  max: number;
  currentDrySpell: number;
  deviationSigma: number; // how many standard deviations the current dry spell is away from the mean
  frequencyPct: number;   // historical occurrence percentage
}

export interface PositionalOutcomeMetrics {
  position: number;
  outcomes: {
    H: SpellStats;
    D: SpellStats;
    A: SpellStats;
  };
  overUnder: {
    O: SpellStats;
    U: SpellStats;
  };
  ggNg: {
    GG: SpellStats;
    NG: SpellStats;
  };
  neuralCoFiringActivations?: {
    concurrentCorrelations: { targetOutcome: string; triggeringPosition: number; triggeringOutcome: string; weight: number }[];
    sequentialMatchPct: number;
    recommendedAdjustment: "H" | "D" | "A" | "NEUTRAL";
  };
}

export interface HistoricalMatchResult {
  id: number; // position (1 to 16)
  outcome: "H" | "D" | "A";
  overUnder: "O" | "U";
  ggNg: "GG" | "NG";
}

export interface HistoricalRound {
  roundNumber: number;
  date: string;
  results: HistoricalMatchResult[];
}

export interface NeuralPathActivation {
  position: number;
  outcome: string;
  triggerSequence: string[]; // sequence of past 3 states leading to trigger
  confidencePct: number;
  activeSequenceMatch: boolean;
}

export interface PredictionResult {
  probH: number;
  probD: number;
  probA: number;
  bestPick: "H" | "D" | "A";
  evH: number;
  evD: number;
  evA: number;
  kellyH: number;
  kellyD: number;
  kellyA: number;
  isTrap: boolean;
  isSponsorDraw: boolean;
  velocitySignal: "STABLE" | "SHARP_HOME_DRIFT" | "SHARP_AWAY_DRIFT" | "DRAW_ANOMALY";
  reasons: string[];
}

export interface Coupon {
  couponString: string; // e.g. "HHDDAHHDAHDDAHHH"
  weight: number;
  weightPct: string;
  coverage: number;
  ev: number;
}

export interface ScrapingLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
}

export interface RoundAccuracyRecord {
  roundNumber: number;
  date: string;
  totalMatches: number;
  correctPicks: number;
  accuracy: number;
  brierScore: number;
  trapAccuracy: number;
  spellAccuracy: number;
  drawAccuracy: number;
  paramSnapshot: Partial<CalibratedParameters>;
}

export interface DashboardState {
  matches: Match[];
  drawTarget: number[]; // e.g. [3, 4, 5]
  nSimulations: number;
  predictionMode: "standard" | "adaptive" | "ultimate";
  kellyFraction: number;
  bankroll: number;
  isScraping: boolean;
  isPredicting: boolean;
  logs: ScrapingLog[];
  optimizedCoupons: Coupon[];
  activePool: "daily" | "sportpesa_daily" | "mozz_weekly" | "sportpesa_weekly";
  historicalRounds?: HistoricalRound[];
  positionalMetricsSummary?: Record<number, PositionalOutcomeMetrics>;
  neuralActivationPaths?: NeuralPathActivation[];
  summaryMetrics?: {
    totalExpectedH: number;
    totalExpectedD: number;
    totalExpectedA: number;
    bookieExposure: number;
    upsetBudget: number;
    regime: string;
    // Structural/Positional metrics
    repeatedMatchesCount?: number;
    averagePositionDrift?: number;
    maxPositionalShiftFixture?: string;
    drawPatternConformity?: number; // % match of actual to historical structural draws
  };
  calibratedParameters?: CalibratedParameters;
  accuracyHistory?: RoundAccuracyRecord[];
}

export interface CalibratedParameters {
  baselinePriorH: number;
  baselinePriorD: number;
  baselinePriorA: number;
  priorWeight: number;
  marketWeight: number;
  refereeHomeBiasMultiplier: number;
  refereeDrawRateMultiplier: number;
  sponsorDrawBoost: number;
  trapHomeDiscount: number;
  trapAwayPremium: number;
  positionalSpellDrawMultiplier: number;
  positionalSpellAwayMultiplier: number;
  dirichletAlpha: number;
  llnCorrectionStrength: number;
  accuracyEstimate: number; // dynamic fit rating
  lastCalibratedAt?: string;
}

