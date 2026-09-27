import { useState, useMemo } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/results";
import { getPlayers, getResults } from "~/data/client";
import { SectionHead } from "~/components/ds/SectionHead";
import { Stripe } from "~/components/ds/Stripe";
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

const BASE_FILTERS = ["All", "Home", "Away", "Wins"];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).replace(",", ""); // "Sat 18 Jul 2026", not "Sat, 18 Jul 2026"
}

/** "Jamie Marsh" -> "J. Marsh", so three performers fit on one line. */
function shortName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}. ${parts[parts.length - 1]}` : name;
}

function ResultRow({ result, playerMap }: { result: Result; playerMap: Map<string, string> }) {
  const outcome = getOutcome(result.score.warriorsScore, result.score.opponentScore);
  const award = (id: string) => (id && id !== "MISSING" && playerMap.has(id) ? { id, name: playerMap.get(id)! } : null);
  const awards = [
    { code: "POTG", title: "Player of the game", player: award(result.manOfTheMatchPlayerId) },
    { code: "WOTG", title: "Warrior of the game", player: award(result.warriorOfTheGamePlayerId) },
  ].filter((a) => a.player);
  const topPerformers = getTopPerformers(result, playerMap);
  const location =
    result.location === "HOME" ? "Home" : result.location === "AWAY" ? "Away" : null;
  const date = formatDate(result.date);
  const gameHref = `/results/${encodeURIComponent(result.date)}`;

  return (
    <li className="rs-row">
      <div className="rs-row-head">
        <div className="rs-row-date-col">
          <span className="t-data rs-row-outcome" style={OUTCOME_STYLE[outcome]}>{outcome}</span>
          <div className="rs-row-date-copy">
            <span className="t-data rs-row-date-day">{date}</span>
            <span className="t-label rs-row-date-meta">
              {[location, result.competition].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>
        <Link
          to={gameHref}
          className="ds-btn ds-btn-secondary ds-btn-sm rs-row-report"
          aria-label={`Match report: ${result.opponentTeam}, ${date}`}
        >
          Match report →
        </Link>
      </div>

      <div className="rs-row-opponent-col">
        <span className="rs-row-opponent-name">{result.opponentTeam}</span>
        <span className="rs-row-score">{result.score.warriorsScore} — {result.score.opponentScore}</span>
      </div>

      {awards.length > 0 && (
        <div className="rs-row-line">
          <span className="t-label rs-row-line-label">Awards</span>
          <div className="rs-row-line-items">
            {awards.map((a) => (
              <span key={a.code} className="rs-award">
                <abbr title={a.title} className={`t-label rs-award-tag rs-award-tag--${a.code.toLowerCase()}`}>
                  {a.code}
                </abbr>
                <Link to={`/roster/${a.player!.id}`} className="rs-player-link">{a.player!.name}</Link>
              </span>
            ))}
          </div>
        </div>
      )}

      {topPerformers.length > 0 && (
        <div className="rs-row-line">
          <span className="t-label rs-row-line-label">Top performers</span>
          <ol className="rs-row-line-items rs-performers">
            {topPerformers.map((p, i) => (
              <li key={p.id} className="rs-performer">
                <span className="t-data rs-performer-rank">{i + 1}</span>
                <Link to={`/roster/${p.id}`} className="rs-player-link" title={p.name}>{shortName(p.name)}</Link>
                <span className="t-data rs-performer-line">{p.goals}G · {p.assists}A</span>
              </li>
            ))}
          </ol>
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
  const [filter, setFilter] = useState<string>("All");

  const bySeason = activeSeason === "All" ? allResults : allResults.filter((r) => r.season === activeSeason);

  // The feed has no "Cup" competition, so the spec's Cup chip becomes a chip per
  // competition actually played in the selected season.
  const competitions = useMemo(
    () => Array.from(new Set(bySeason.map((r) => r.competition).filter(Boolean))).sort(),
    [bySeason]
  );
  const filters = useMemo(() => [...BASE_FILTERS, ...competitions], [competitions]);
  // Changing season can retire the active chip; fall back rather than show nothing.
  const activeFilter = filters.includes(filter) ? filter : "All";

  const filtered = bySeason.filter((r) => {
    const outcome = getOutcome(r.score.warriorsScore, r.score.opponentScore);
    if (activeFilter === "Home") return r.location === "HOME";
    if (activeFilter === "Away") return r.location === "AWAY";
    if (activeFilter === "Wins") return outcome === "W";
    if (activeFilter === "All") return true;
    return r.competition === activeFilter;
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
        <SectionHead title="Results">
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
          <div className="results-record-stats">
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

      <Stripe />

      <section className="results-body">
        <div className="results-filters" role="group" aria-label="Filter results">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              className="ds-chip t-label"
              aria-pressed={activeFilter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <span className="t-data results-filters-count">
            {filtered.length} {filtered.length === 1 ? "game" : "games"} shown
          </span>
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

        <div className="results-note">
          <p className="results-note-text">
            Game sheets from previous seasons are held by the club secretary. Individual scoring is
            listed on the stats page.
          </p>
        </div>
      </section>
    </div>
  );
}
