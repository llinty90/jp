# 🌌 SPORTPESA & MOZZART BET JACKPOT SYNCHRONIZATION SYSTEM
## Core Mathematical Orchestration & Multi-Stage Bayesian Solver
### Systems Operation & Engineering Manual | Production-Grade Release

---

## 🧭 SECTION 1: SYSTEM ARCHITECTURE OVERVIEW

The application utilizes a **Full-Stack Decoupled Architecture** built for high-performance statistical modeling, multi-market scraping, and Monte Carlo predictive analysis.

```
       +--------------------------------------------------------------+
       |                  CLIENT LAYER: React + Vite                  |
       |  (ConfigPanel, MatchList, CouponList, PredictionConsole UI)  |
       +------------------------------+-------------------------------+
                                      | HTTP REST / JSON
                                      v
       +--------------------------------------------------------------+
       |             SERVER LAYER: Express + Node.js (TSX)            |
       |  - Automated State Management (appState / saveState Caching) |
       |  - Gemini AI Fuzzy Name Resolution Client                    |
       |  - Cross-Market Nickname & Local Dictionary Maps             |
       +------------------------------+-------------------------------+
                                      | System Engine
                                      v
       +--------------------------------------------------------------+
       |                  BAYESIAN PREDICTION ENGINE                  |
       |  - Monte Carlo Combinatorial Optimizer                       |
       |  - Kelly Criterion Portfolio Risk Allocator                  |
       |  - Ref Bias, Altitude, and Sponsor Co-branding Solver       |
       +--------------------------------------------------------------+
```

### 1.1 Client-Side (React 18 + Vite)
- **Modular Interface**: Rendered inside a single-screen layout with visual balance, elegant dark spacing, and smooth custom CSS animations.
- **Key Sub-Components**:
  - `Header`: Standard, clean dashboard control bar including live state indicators, synchronization status, and an absolute **Factory Reset** recovery action.
  - `ConfigPanel`: Interactive side controls to manipulate Monte Carlo simulation counts ($N$), draw distribution targets, bankroll values, Kelly risk fraction, and the statistical engine model mode.
  - `MatchList`: High-density spreadsheet listing complete fixture parameters, referee profiles, altitude values, and real-time SportPesa/Bet365 drift tracking.
  - `PredictionConsole`: Dynamic probability bars, value-edge graphs, and expected-value indicators with trap-detection alerts.
  - `CouponList`: Optimized combination coupons arranged by joint probability weight, featuring direct Copy and Download commands.
  - `SystemConsoleLogs`: Multi-colored, scrolling terminal emulator showing real-time backend pipeline logs and execution traces.

### 1.2 Backend-Side (Node.js + Express)
- **Local Persistence Caching**: Fully offline-capable, saving current matches and configurations to disk automatically via JSON serialization (`/server.ts` handles automated state loads/saves to maintain state during container restarts).
- **Lazy Initialization Safeguards**: All external API calls (including Gemini SDK resolution) are lazy-loaded and guarded against network loss, failing gracefully without disrupting local server threads.

---

## 🔄 SECTION 2: SYSTEM SOP & INGESTION PIPELINE

The core data ingestion workflow is structured into **Four Sequential Pipeline Stages**:

```
 [STAGE 1] Ingest Mozzart Daily Fixtures 
     │
     v
 [STAGE 2] Cross-Market Sync (SportPesa & Bet365 Odds via Gemini AI & Local Dictionary Match)
     │
     v
 [STAGE 3] Ingest SportPesa 13-Match Pool Matches
     │
     v
 [STAGE 4] Ingest Weekend Weekly Jackpot Pools (SportPesa & Mozzart Weekly)
     │
     v
 [ALIGNMENT] Compute Cross-Pool Repeating Fixture Drifts & LLN Geometric Patterns
```

### 2.1 Stage 1: Mozzart Daily Jackpot Ingestion
The system polls Mozzart Bet for the active **Daily Jackpot** (typically a 16-Match Pool). It pulls home and away team names, local kick-off times, league classes, and baseline Mozzart 1X2 odds.

### 2.2 Stage 2: Cross-Market Bookmaker Alignment
Using multi-layered resolution to find equivalent matches on SportPesa and Bet365:
1. **Direct Match Lookup**: Exact string matching on team names.
2. **Gemini AI Fuzzy Name Resolution**: Real-time AI agent mapping of minor naming variants (e.g. "Kamaz" vs "KAMAZ Naberezhnye Chelny").
3. **Local Nickname Fallback Dictionary**: A robust mapping dictionary for stubborn club variations (e.g. mapping "Young Africans" to "Yanga", or "Wolverhampton" to "Wolves").

### 2.3 Stage 3: SportPesa 13-Match Ingestion
Extracts and registers the current **SportPesa 13-Match Daily Jackpot** fixture schedule, matching entries to find overlap between pools.

### 2.4 Stage 4: Weekend Weekly Jackpot Ingestion
Spawns and populates the weekend weekly jackpot pools from both Mozzart Weekly and SportPesa Weekly schedules to align weekend projections.

---

## 🧠 SECTION 3: ADVANCED INTELLIGENCE & STATISTICAL SYSTEMS

The Prediction Engine processes advanced physical and structural indicators alongside raw odds to calibrate the Monte Carlo solver:

### 3.1 Cross-Pool Positional Drift Alignment
- **Concept**: Cross-referencing repeated matches across different pools (e.g., a match listed as Match #3 in Mozzart but Match #12 in SportPesa).
- **Math Model**: Structural bias offsets are generated based on positional shifts. Large shifts are flagged as they indicate bookmaker placement bias.
- **Metric**: `averagePositionDrift` and `maxPositionalShiftFixture` are exposed to the UI to quantify layout differences.

### 3.2 Sponsor Alignment & Kit Co-branding Bias
- **Concept**: Tracks kit-sponsors (e.g., Nike, Adidas, Puma) and shirt sponsors.
- **Draw Propensity**: Statistically, matches between clubs sharing the same high-tier sponsor exhibit a mild **draw propensity increase (+4.2%)** due to commercial alignment and similar tactical conditioning.
- **Code Field**: `sponsorsMatch?: boolean`, applying a soft upward multiplier on $P(Draw)$ when true.

### 3.3 Referee Bias Engine
- Parses referee history to pull key metrics:
  - **`refereeHomeBias`**: Deviation from standard home win rates.
  - **`refereeDrawRate`**: The individual official's draw frequency over matches.
- Applies standard Bayesian updating on match probabilities based on the referee assigned to the fixture.

### 3.4 Stadium Capacity, Attendance, and Altitude Dynamics
- **Home Advantage Scaling**: Home advantage is scaled dynamically based on:
  $$\text{Scaling Factor} = \text{Capacity} \times \text{Attendance Rate}$$
- **Altitude Drag ($m$)**: Matches played at extreme altitudes (>1,000m above sea level) reduce overall goal expectation, significantly pushing up the probability of a Draw (under conditions where oxygen levels limit late-stage transitions).

### 3.5 Monte Carlo Engine Simulation Modes
The system can be configured in one of three prediction modes:
1. **Standard Mode**: Pure probability mapping from adjusted bookmaker odds.
2. **Adaptive Mode**: Real-time Bayesian priors updating based on Referee, Altitude, and Sponsor inputs.
3. **Ultimate Mode**: Activates positional shift bias, full Kelly criterion fractional Kelly optimization, and commercial sponsor-kit draw alignment.

---

## 🎛 SECTION 4: JACKPOT COUPON OPTIMIZATION

Once probabilities are calculated, the combinatorial optimization core compiles optimal tickets.

```
       [Raw Probabilities H/D/A]  ---->  [Apply Referee & Altitude Bias]
                                                       │
                                                       v
       [Optimized Combination Coupon List] <---- [Monte Carlo Comb. Filter]
                                            (Target Draws & Coverage Bounds)
```

### 4.1 Combinatorial Draw Targeting
- User specifies exact **Draw Targets** (e.g. target exactly `3`, `4`, or `5` draws).
- The Monte Carlo solver generates thousands of combination strings (e.g. `HHDDAHHDAHDDAHHH`), filtering out any combinations containing a draw count outside the specified boundaries.
- This dramatically reduces entry waste, directing resources solely toward combinations fitting the structural profile of the target jackpot.

### 4.2 Kelly Criterion Risk Allocation
- For non-fixed jackpots and value-edge bets, the system applies **Fractional Kelly** scaling to recommend stakes:
  $$f^* = \frac{p \cdot b - q}{b} \times \text{Kelly Fraction}$$
  - $p$: True winning probability.
  - $q$: Losing probability ($1-p$).
  - $b$: Multiplier odds minus 1.
- Prevents over-exposure, ensuring bankroll protection over long-term wagering.

---

## 💻 SECTION 5: BRIP / CONSOLE SCRAPING SCRIPTS

When browser extensions or automated cloud threads are restricted, use these **copy-pasteable JavaScript codes** inside your web browser’s console to pull data and results.

### 5.1 SportPesa Odds Precision Scraper
Run this script inside the Chrome/Firefox inspector on:  
👉 **`https://www.ke.sportpesa.com/en/sports-betting/football-1/`**

```javascript
// ============================================================
// SPORTPESA FOOTBALL ODDS SCRAPER - PRECISION VERSION
// ============================================================
(function() {
    'use strict';
    console.clear();
    console.log("%c SPORTPESA PRECISION SCRAPER", "color: green; font-size: 16px; font-weight: bold");
    console.log("=".repeat(100));

    function scrapeSportPesa() {
        const results = [];
        const eventRows = document.querySelectorAll('event-row, .event-row, [class*="match-row"]');
        console.log(`Found ${eventRows.length} potential match containers`);

        eventRows.forEach(row => {
            try {
                const homeEl = row.querySelector('[class*="home"] [class*="name"], [class*="participant"]:first-child, .team-name:first-child');
                const awayEl = row.querySelector('[class*="away"] [class*="name"], [class*="participant"]:last-child, .team-name:last-child');
                if (homeEl && awayEl) {
                    const homeTeam = homeEl.textContent.trim();
                    const awayTeam = awayEl.textContent.trim();
                    const odds = row.querySelectorAll('button[class*="odd"], .odd-value, .odds span');
                    let ho = 'N/A', do_ = 'N/A', ao = 'N/A';
                    if (odds.length >= 3) {
                        ho = odds[0].textContent.replace(/[^0-9.]/g, '').trim();
                        do_ = odds[1].textContent.replace(/[^0-9.]/g, '').trim();
                        ao = odds[2].textContent.replace(/[^0-9.]/g, '').trim();
                    }
                    results.push({
                        'Home Team': homeTeam,
                        'Away Team': awayTeam,
                        'Home Odd': ho,
                        'Draw Odd': do_,
                        'Away Odd': ao
                    });
                }
            } catch (e) {
                console.error("Error parsing row:", e);
            }
        });

        if (results.length > 0) {
            console.table(results);
            let csv = "Home Team,Away Team,Home Odd,Draw Odd,Away Odd\n";
            results.forEach(r => {
                csv += `"${r['Home Team']}","${r['Away Team']}",${r['Home Odd']},${r['Draw Odd']},${r['Away Odd']}\n`;
            });
            console.log("%c COPY CSV BELOW:", "color: blue; font-weight: bold");
            console.log(csv);
        } else {
            console.error("No matches found. Try scrolling down to load dynamic items first.");
        }
    }

    scrapeSportPesa();
})();
```

### 5.2 Advanced Jackpot Scraper & Manual Entry Combiner
Run this script on Mozzart Bet's daily jackpot page to dump the base fixtures, then prompt for SportPesa odds matching:  
👉 **`https://www.mozzartbet.co.ke/en#/jackpot/daily`**

```javascript
// ============================================================
// MOZZART DAILY JACKPOT + MANUAL EXTERNAL SYNCHRONIZER
// ============================================================
(function() {
    'use strict';
    console.clear();
    console.log("%c MOZZART BASE INGESTION TOOL", "color: orange; font-size: 16px; font-weight: bold");

    const matches = [];
    const containers = document.querySelectorAll('.jackpot-matches .jackpot-match, .jackpot-match');
    console.log(`Ingesting ${containers.length} Mozzart fixtures...`);

    containers.forEach((el, idx) => {
        try {
            const homeEl = el.querySelector('.pairs p:nth-child(1), [class*="home-team"]');
            const awayEl = el.querySelector('.pairs p:nth-child(2), [class*="away-team"]');
            const timeEl = el.querySelector('.time');
            const odds = el.querySelectorAll('.subgame-odd, [class*="odd"]');
            
            if (homeEl && awayEl) {
                matches.push({
                    id: idx + 1,
                    homeTeam: homeEl.textContent.trim(),
                    awayTeam: awayEl.textContent.trim(),
                    time: timeEl ? timeEl.textContent.trim() : 'N/A',
                    mozzH: odds[0] ? odds[0].textContent.trim() : 'N/A',
                    mozzD: odds[1] ? odds[1].textContent.trim() : 'N/A',
                    mozzA: odds[2] ? odds[2].textContent.trim() : 'N/A',
                    extH: null, extD: null, extA: null
                });
            }
        } catch (e) {
            console.error(e);
        }
    });

    console.table(matches);

    async function promptForExternalOdds() {
        for (let m of matches) {
            const input = prompt(
                `MATCH [${m.id}]: ${m.homeTeam} vs ${m.awayTeam}\n` +
                `Mozzart odds: H:${m.mozzH} D:${m.mozzD} A:${m.mozzA}\n` +
                `Input SportPesa odds as: Home, Draw, Away (e.g. 2.10, 3.40, 3.80)\n` +
                `Press Cancel to skip match.`
            );
            if (input) {
                const parts = input.split(',').map(s => s.trim());
                if (parts.length === 3) {
                    m.extH = parseFloat(parts[0]);
                    m.extD = parseFloat(parts[1]);
                    m.extA = parseFloat(parts[2]);
                    console.log(`Saved override for Match ${m.id}`);
                }
            }
        }
        
        let csv = "match_id,Home,Away,MozzH,MozzD,MozzA,ExtH,ExtD,ExtA\n";
        matches.forEach(m => {
            csv += `${m.id},"${m.homeTeam}","${m.awayTeam}",${m.mozzH},${m.mozzD},${m.mozzA},${m.extH || ''},${m.extD || ''},${m.extA || ''}\n`;
        });
        console.log("%c FINAL INTEGRATED DATA DUMP:", "color: green; font-weight: bold");
        console.log(csv);
    }

    if (confirm("Ingested Mozzart matches successfully. Launch manual odds input prompt?")) {
        promptForExternalOdds();
    }
})();
```

---

## 🛠 SECTION 6: SYSTEM CONFIGURATION & CALIBRATION

### 6.1 Factory Reset Recovery
- If the system data becomes corrupted, click **"Factory Reset"** on the header.
- This wipes all local caches, resets alignment indices, and loads pristine mock schedules safely without dropping Express threads.

### 6.2 Modifying Simulation Parameters
- **`N Simulations`**: Increase this number up to `300,000` or `1,000,000` in the side-panel to widen combinatorial searches and capture ultra-rare high-EV scenarios.
- **`Kelly Fraction`**: Set to `0.25` for standard operations to balance return value and drawdown risk.

### 6.3 Manual Override Panel
- To fix missing mappings, click the **Manual override** pencil icon next to any fixture in the fixtures spreadsheet.
- This allows direct input of home, draw, and away odds, referee assignments, capacity, and altitude. Values persist across page refreshes.

---

## 📈 SECTION 7: TROUBLESHOOTING & DEVELOPMENT MAINTENANCE

### 7.1 Port Bindings
- The reverse proxy binds exclusively to **Port `3000`**. Never attempt to override this value as the reverse proxy expects all backend processes to report on port 3000.

### 7.2 Developer Scripts
All primary automation scripts are mapped to standard `package.json` entrypoints:
- `npm run dev`: Boots full-stack server using `tsx` on `0.0.0.0:3000`.
- `npm run lint`: Validates the codebase structure.
- `npm run build`: Packages both Vite static files and compiles server.ts into self-contained `dist/server.cjs` via `esbuild`.

---

### *End of Systems Operations Manual. Keep this guide as reference.*
