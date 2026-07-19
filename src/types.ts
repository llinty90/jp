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
  predictions?: PredictionResult;
  // Cross-Pool and Positional Bias modeling properties
  poolType?: "daily" | "sportpesa_daily" | "mozz_weekly" | "sportpesa_weekly";
  mozzPosition?: number; // Slot index in Mozzart (e.g. 1 to 16/17)
  spPosition?: number;   // Slot index in SportPesa
  isRepeated?: boolean;  // Repeated across Daily vs Weekly or Mozzart vs SportPesa
  repeatedInPools?: string[];
  positionalBiasScore?: number; // Structural placement bias offset calculated by the engine
  expectedDistributionBias?: "H" | "D" | "A" | "NEUTRAL";
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
}
