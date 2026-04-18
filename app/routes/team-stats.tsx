import { useMemo, useState } from "react";
import resultsData from "../../public/data/results.json";
import "./team-stats.css";

export function meta() {
  return [{ title: "Team Stats — Peterborough Warriors" }];
}

// ── Types ─────────────────────────────────────────────────────────────────────

type GoalEntry = { type: string };
type PeriodScore = {
  goals: GoalEntry[];
  opponentGoals: GoalEntry[];
  penalties: unknown[];
  opponentPenalties: unknown[];
};
type RawResult = {
  seasonId: string;
  date: string;
  location: string;
  score: {
    warriorsScore: number;
    opponentScore: number;
    period: { one: PeriodScore; two: PeriodScore; three: PeriodScore };
  };
};

// ── Static data ───────────────────────────────────────────────────────────────

const allResults = (resultsData as unknown as RawResult[]).filter(
  (r) => r.score !== undefined
);

const allSeasons = Array.from(new Set(allResults.map((r) => r.seasonId))).sort(
  (a, b) => parseInt(b.split("/")[0], 10) - parseInt(a.split("/")[0], 10)
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function periods(r: RawResult): PeriodScore[] {
  return [r.score.period.one, r.score.period.two, r.score.period.three];
}

function getResult(r: RawResult): "W" | "D" | "L" {
  if (r.score.warriorsScore > r.score.opponentScore) return "W";
  if (r.score.warriorsScore < r.score.opponentScore) return "L";
  return "D";
}

function calcBestStreak(games: RawResult[], type: "win" | "unbeaten"): number {
  let current = 0;
  let best = 0;
  for (const g of games) {
    const res = getResult(g);
    const qualifies = type === "win" ? res === "W" : res !== "L";
    if (qualifies) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

// ── Stats computation ─────────────────────────────────────────────────────────

interface TeamStats {
  gp: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  wins: number;
  draws: number;
  losses: number;
  winPct: number;
  gpg: number;
  gcpg: number;
  currentForm: Array<"W" | "D" | "L">;
  bestOverallWinStreak: number;
  bestHomeWinStreak: number;
  bestAwayWinStreak: number;
  bestOverallUnbeatenStreak: number;
  bestHomeUnbeatenStreak: number;
  bestAwayUnbeatenStreak: number;
  ppGoals: number;
  ppOpps: number;
  ppPct: number;
  pkOpps: number;
  ppGoalsAgainst: number;
  pkPct: number;
}

function computeStats(results: RawResult[]): TeamStats {
  const chrono = [...results].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const gp = results.length;
  const goalsFor = results.reduce((s, r) => s + r.score.warriorsScore, 0);
  const goalsAgainst = results.reduce((s, r) => s + r.score.opponentScore, 0);
  const wins = results.filter((r) => r.score.warriorsScore > r.score.opponentScore).length;
  const losses = results.filter((r) => r.score.warriorsScore < r.score.opponentScore).length;
  const draws = results.filter((r) => r.score.warriorsScore === r.score.opponentScore).length;

  const homeGames = chrono.filter((r) => r.location === "HOME");
  const awayGames = chrono.filter((r) => r.location === "AWAY");

  let ppGoals = 0, ppOpps = 0, pkOpps = 0, ppGoalsAgainst = 0;
  for (const r of results) {
    for (const p of periods(r)) {
      ppGoals += p.goals.filter((g) => g.type === "PP").length;
      ppOpps += p.opponentPenalties.length;
      pkOpps += p.penalties.length;
      ppGoalsAgainst += p.opponentGoals.filter((g) => g.type === "PP").length;
    }
  }

  return {
    gp,
    goalsFor,
    goalsAgainst,
    goalDiff: goalsFor - goalsAgainst,
    wins,
    draws,
    losses,
    winPct: gp > 0 ? (wins / gp) * 100 : 0,
    gpg: gp > 0 ? goalsFor / gp : 0,
    gcpg: gp > 0 ? goalsAgainst / gp : 0,
    currentForm: chrono.slice(-5).map(getResult),
    bestOverallWinStreak: calcBestStreak(chrono, "win"),
    bestHomeWinStreak: calcBestStreak(homeGames, "win"),
    bestAwayWinStreak: calcBestStreak(awayGames, "win"),
    bestOverallUnbeatenStreak: calcBestStreak(chrono, "unbeaten"),
    bestHomeUnbeatenStreak: calcBestStreak(homeGames, "unbeaten"),
    bestAwayUnbeatenStreak: calcBestStreak(awayGames, "unbeaten"),
    ppGoals,
    ppOpps,
    ppPct: ppOpps > 0 ? (ppGoals / ppOpps) * 100 : 0,
    pkOpps,
    ppGoalsAgainst,
    pkPct: pkOpps > 0 ? Math.max(0, (pkOpps - ppGoalsAgainst) / pkOpps) * 100 : 0,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <h2 className="ts-section-title">{title}</h2>;
}

function StatCard({
  label,
  value,
  sub,
  highlight,
  positive,
  negative,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
}) {
  const cls = [
    "ts-stat-value",
    highlight ? "ts-stat-value-hi" : "",
    positive ? "ts-stat-value-pos" : "",
    negative ? "ts-stat-value-neg" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ts-stat-card">
      <span className="ts-stat-label">{label}</span>
      <span className={cls}>{value}</span>
      {sub && <span className="ts-stat-sub">{sub}</span>}
    </div>
  );
}

function FormBadge({ result }: { result: "W" | "D" | "L" }) {
  const cls =
    result === "W"
      ? "ts-form-badge ts-form-w"
      : result === "L"
      ? "ts-form-badge ts-form-l"
      : "ts-form-badge ts-form-d";
  return <span className={cls}>{result}</span>;
}

function StreakCard({
  label,
  win,
  unbeaten,
}: {
  label: string;
  win: number;
  unbeaten: number;
}) {
  return (
    <div className="ts-streak-card">
      <span className="ts-streak-location">{label}</span>
      <div className="ts-streak-row">
        <span className="ts-streak-label">Best Win Streak</span>
        <span className="ts-streak-value ts-streak-value-win">{win}</span>
      </div>
      <div className="ts-streak-divider" />
      <div className="ts-streak-row">
        <span className="ts-streak-label">Best Unbeaten Streak</span>
        <span className="ts-streak-value ts-streak-value-unbeaten">{unbeaten}</span>
      </div>
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function TeamStats() {
  const [season, setSeason] = useState<string>("All");

  const filteredResults = useMemo(
    () =>
      season === "All"
        ? allResults
        : allResults.filter((r) => r.seasonId === season),
    [season]
  );

  const stats = useMemo(() => computeStats(filteredResults), [filteredResults]);

  const goalDiffDisplay =
    stats.goalDiff > 0 ? `+${stats.goalDiff}` : String(stats.goalDiff);

  return (
    <div className="ts-page">
      <section className="ts-hero">
        <div className="ts-hero-inner">
          <span className="ts-kicker">Statistics</span>
          <h1 className="ts-title">Team Stats</h1>
          <p className="ts-subtitle">
            Peterborough Warriors Ice Hockey Club — Team Performance &amp; Records
          </p>
        </div>
      </section>

      <section className="ts-body">
        <div className="ts-frame">

          {/* Season selector */}
          <div className="ts-season-bar">
            <div className="ts-filter-group">
              <label className="ts-filter-label" htmlFor="ts-season">
                Season
              </label>
              <select
                id="ts-season"
                className="ts-select"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                <option value="All">All Time</option>
                {allSeasons.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overview */}
          <div>
            <SectionHeader title="Overview" />
            <div className="ts-stats-grid ts-stats-grid-4">
              <StatCard label="Games Played" value={stats.gp} />
              <StatCard label="Goals For" value={stats.goalsFor} highlight />
              <StatCard label="Goals Against" value={stats.goalsAgainst} />
              <StatCard
                label="Goal Difference"
                value={goalDiffDisplay}
                positive={stats.goalDiff > 0}
                negative={stats.goalDiff < 0}
              />
              <StatCard label="Wins" value={stats.wins} positive />
              <StatCard label="Draws" value={stats.draws} />
              <StatCard label="Losses" value={stats.losses} negative />
              <StatCard
                label="Win %"
                value={`${stats.winPct.toFixed(1)}%`}
                highlight
              />
            </div>
          </div>

          {/* Current Form */}
          <div>
            <SectionHeader title="Current Form" />
            <div className="ts-form-card">
              <p className="ts-form-meta">
                Last {stats.currentForm.length} game
                {stats.currentForm.length !== 1 ? "s" : ""} — oldest to most recent
              </p>
              <div className="ts-form-badges">
                {stats.currentForm.length === 0 ? (
                  <span className="ts-empty">No results available.</span>
                ) : (
                  stats.currentForm.map((r, i) => (
                    <FormBadge key={i} result={r} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div>
            <SectionHeader title="Scoring" />
            <div className="ts-stats-grid ts-stats-grid-2">
              <StatCard
                label="Goals Per Game"
                value={stats.gpg.toFixed(2)}
                sub={`${stats.goalsFor} goals across ${stats.gp} game${stats.gp !== 1 ? "s" : ""}`}
                highlight
              />
              <StatCard
                label="Goals Conceded Per Game"
                value={stats.gcpg.toFixed(2)}
                sub={`${stats.goalsAgainst} goals conceded across ${stats.gp} game${stats.gp !== 1 ? "s" : ""}`}
              />
            </div>
          </div>

          {/* Special Teams */}
          <div>
            <SectionHeader title="Special Teams" />
            <div className="ts-stats-grid ts-stats-grid-2">
              <StatCard
                label="Power Play %"
                value={`${stats.ppPct.toFixed(1)}%`}
                sub={
                  stats.ppOpps > 0
                    ? `${stats.ppGoals} goals on ${stats.ppOpps} opportunit${stats.ppOpps !== 1 ? "ies" : "y"}`
                    : "No power play data"
                }
                highlight
              />
              <StatCard
                label="Penalty Kill %"
                value={`${stats.pkPct.toFixed(1)}%`}
                sub={
                  stats.pkOpps > 0
                    ? `${stats.pkOpps - stats.ppGoalsAgainst} kills from ${stats.pkOpps} opportunit${stats.pkOpps !== 1 ? "ies" : "y"}`
                    : "No penalty kill data"
                }
                highlight
              />
            </div>
          </div>

          {/* Streaks */}
          <div>
            <SectionHeader title="Best Streaks" />
            <div className="ts-streak-grid">
              <StreakCard
                label="Overall"
                win={stats.bestOverallWinStreak}
                unbeaten={stats.bestOverallUnbeatenStreak}
              />
              <StreakCard
                label="Home"
                win={stats.bestHomeWinStreak}
                unbeaten={stats.bestHomeUnbeatenStreak}
              />
              <StreakCard
                label="Away"
                win={stats.bestAwayWinStreak}
                unbeaten={stats.bestAwayUnbeatenStreak}
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
