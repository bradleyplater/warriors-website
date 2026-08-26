import { useState, useMemo } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/results";
import { getPlayers, getResults } from "~/data/client";
import { SectionHead } from "~/components/ds/SectionHead";
import "./results.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Results — Peterborough Warriors" }];
}

export async function clientLoader() {
  const [players, results] = await Promise.all([
    getPlayers<unknown[]>(),
    getResults<unknown[]>(),
  ]);
  return { players, results };
}

type Goal = {
  playerId: string;
  assists: string[];
};

type Period = {
  goals?: Goal[];
};

type Result = {
  season: string;
  opponentTeam: string;
  logoImage: string;
  date: string;
  competition: string;
  location: string;
  manOfTheMatchPlayerId: string;
  warriorOfTheGamePlayerId: string;
  score: {
    warriorsScore: number;
    opponentScore: number;
    period?: {
      one?: Period;
      two?: Period;
      three?: Period;
    };
  };
};

type PlayerStat = {
  id: string;
  name: string;
  goals: number;
  assists: number;
  points: number;
};

function getTopPerformers(result: Result, playerMap: Map<string, string>): PlayerStat[] {
  const statMap = new Map<string, { goals: number; assists: number }>();
  const periods = result.score.period ?? {};
  const allGoals: Goal[] = [
    ...(periods.one?.goals ?? []),
    ...(periods.two?.goals ?? []),
    ...(periods.three?.goals ?? []),
  ];

  for (const goal of allGoals) {
    const scorer = statMap.get(goal.playerId) ?? { goals: 0, assists: 0 };
    statMap.set(goal.playerId, { ...scorer, goals: scorer.goals + 1 });
    for (const assistId of goal.assists) {
      const assister = statMap.get(assistId) ?? { goals: 0, assists: 0 };
      statMap.set(assistId, { ...assister, assists: assister.assists + 1 });
    }
  }

  return Array.from(statMap.entries())
    .map(([id, { goals, assists }]) => ({
      id,
      name: playerMap.get(id) ?? id,
      goals,
      assists,
      points: goals + assists,
    }))
    .sort((a, b) => b.points - a.points || b.goals - a.goals)
    .slice(0, 3);
}

function getOutcome(ws: number, os: number): "W" | "L" | "D" {
  if (ws > os) return "W";
  if (ws < os) return "L";
  return "D";
}

const OUTCOME_STYLE: Record<"W" | "L" | "D", { background: string; color: string; borderColor: string }> = {
  W: { background: "var(--st-success-surface)", color: "var(--st-success-fg)", borderColor: "var(--st-success-border)" },
  L: { background: "var(--st-danger-surface)", color: "var(--st-danger-fg)", borderColor: "var(--st-danger-border)" },
  D: { background: "var(--bg-raised)", color: "var(--fg-secondary)", borderColor: "var(--border-functional)" },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ResultRow({ result, playerMap }: { result: Result; playerMap: Map<string, string> }) {
  const outcome = getOutcome(result.score.warriorsScore, result.score.opponentScore);
  const motm =
    result.manOfTheMatchPlayerId && result.manOfTheMatchPlayerId !== "MISSING"
      ? playerMap.get(result.manOfTheMatchPlayerId)
      : null;
  const wotg =
    result.warriorOfTheGamePlayerId && result.warriorOfTheGamePlayerId !== "MISSING"
      ? playerMap.get(result.warriorOfTheGamePlayerId)
      : null;
  const topPerformers = getTopPerformers(result, playerMap);
  const location =
    result.location === "HOME" || result.location === "AWAY" ? result.location : null;
  const gameHref = `/results/${encodeURIComponent(result.date)}`;

  return (
    <li className="rs-row">
      <Link to={gameHref} className="rs-row-main">
        <div className="rs-row-date-col">
          <span className="t-data rs-row-outcome" style={OUTCOME_STYLE[outcome]}>{outcome}</span>
          <div className="rs-row-date-copy">
            <span className="t-data rs-row-date-day">{formatDate(result.date)}</span>
            <span className="t-label rs-row-date-meta">
              {location === "HOME" ? "Home" : location === "AWAY" ? "Away" : ""} · {result.competition}
            </span>
          </div>
        </div>
        <div className="rs-row-opponent-col">
          <span className="rs-row-opponent-name">{result.opponentTeam}</span>
          <span className="rs-row-score">{result.score.warriorsScore} — {result.score.opponentScore}</span>
        </div>
        <div className="rs-row-meta-col">
          {topPerformers.length > 0 && (
            <span className="t-label rs-row-scorers">
              {topPerformers.map((p) => `${p.name} ${p.goals ? p.goals + "G" : ""}${p.assists ? " " + p.assists + "A" : ""}`).join(" · ")}
            </span>
          )}
          <span className="t-label" style={{ color: "var(--link)" }}>Match report</span>
        </div>
      </Link>

      {(motm || wotg) && (
        <div className="rs-row-sub">
          {motm && (
            <span className="rs-award">
              <span className="t-label rs-award-label">MOTM</span>
              <span className="t-data">{motm}</span>
            </span>
          )}
          {wotg && (
            <span className="rs-award">
              <span className="t-label rs-award-label">WOTG</span>
              <span className="t-data">{wotg}</span>
            </span>
          )}
        </div>
      )}
    </li>
  );
}

export default function Results({ loaderData }: Route.ComponentProps) {
  const players = loaderData.players as { id: string; name: string }[];
  const allResults = useMemo(
    () =>
      (loaderData.results as Result[])
        .filter((r) => new Date(r.date).getTime() < Date.now())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [loaderData.results]
  );
  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p.name])), [players]);
  const uniqueSeasons = useMemo(() => Array.from(new Set(allResults.map((r) => r.season))), [allResults]);
  const seasons = useMemo(() => ["All", ...uniqueSeasons], [uniqueSeasons]);

  const [activeSeason, setActiveSeason] = useState(uniqueSeasons[0] ?? "All");
  const [filter, setFilter] = useState<"All" | "Home" | "Away" | "Wins">("All");

  const bySeason = activeSeason === "All" ? allResults : allResults.filter((r) => r.season === activeSeason);
  const filtered = bySeason.filter((r) => {
    const outcome = getOutcome(r.score.warriorsScore, r.score.opponentScore);
    if (filter === "Home") return r.location === "HOME";
    if (filter === "Away") return r.location === "AWAY";
    if (filter === "Wins") return outcome === "W";
    return true;
  });

  const wins = bySeason.filter((r) => getOutcome(r.score.warriorsScore, r.score.opponentScore) === "W").length;
  const losses = bySeason.filter((r) => getOutcome(r.score.warriorsScore, r.score.opponentScore) === "L").length;
  const draws = bySeason.filter((r) => getOutcome(r.score.warriorsScore, r.score.opponentScore) === "D").length;
  const gf = bySeason.reduce((n, r) => n + r.score.warriorsScore, 0);
  const ga = bySeason.reduce((n, r) => n + r.score.opponentScore, 0);
  const form = bySeason.slice(0, 5).reverse().map((r) => getOutcome(r.score.warriorsScore, r.score.opponentScore));

  const months = new Map<string, Result[]>();
  for (const result of filtered) {
    const key = new Date(result.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    months.set(key, [...(months.get(key) ?? []), result]);
  }

  return (
    <div className="results-page">
      <div className="results-intro">
        <SectionHead eyebrow="EIH Recreational League South, Div 2" title="Results">
          Scores are confirmed against the official EIH game sheet, so they can differ from the score posted on the night until the sheet is filed.
        </SectionHead>
        <div className="results-season-row">
          <span className="t-label results-season-row-label">Season</span>
          <div className="results-season-chips">
            {seasons.map((s) => (
              <button
                key={s}
                type="button"
                className="ds-chip t-data"
                aria-pressed={activeSeason === s}
                onClick={() => setActiveSeason(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="results-record-section" aria-label="Season record">
        <div className="results-record-inner">
          <div>
            <span className="results-record-value">{bySeason.length}</span>
            <div className="t-label muted">Games played</div>
          </div>
          <div>
            <span className="results-record-value">{wins}</span>
            <div className="t-label muted">Won</div>
          </div>
          <div>
            <span className="results-record-value">{losses}</span>
            <div className="t-label muted">Lost</div>
          </div>
          <div>
            <span className="results-record-value">{draws}</span>
            <div className="t-label muted">Drawn</div>
          </div>
          <div>
            <span className="results-record-value">{gf}</span>
            <div className="t-label muted">Goals for</div>
          </div>
          <div>
            <span className="results-record-value">{ga}</span>
            <div className="t-label muted">Goals against</div>
          </div>
          {form.length > 0 && (
            <div className="results-form-wrap">
              <span className="t-label muted">Form — most recent last</span>
              <div className="results-form-list">
                {form.map((r, i) => (
                  <span key={i} className="results-form-item" style={OUTCOME_STYLE[r]}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="results-body">
        <div className="results-filters" role="group" aria-label="Filter results">
          {(["All", "Home", "Away", "Wins"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className="ds-chip t-label"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <span className="t-data results-filters-count">{filtered.length} games shown</span>
        </div>

        {filtered.length === 0 ? (
          <p className="results-empty">No results for this season.</p>
        ) : (
          Array.from(months.entries()).map(([month, results]) => (
            <div key={month} className="results-month">
              <h2 className="t-heading results-month-heading">{month}</h2>
              <ul className="results-month-list">
                {results.map((result) => (
                  <ResultRow key={`${result.date}-${result.opponentTeam}`} result={result} playerMap={playerMap} />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
