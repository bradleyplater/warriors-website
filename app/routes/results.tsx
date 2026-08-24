import { useState, useMemo } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/results";
import { getPlayers, getResults } from "~/data/client";
import { RouteLoadingFallback } from "~/components/RouteLoadingFallback/RouteLoadingFallback";
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

export function HydrateFallback() {
  return <RouteLoadingFallback />;
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ResultLogo({ logoImage, opponentTeam }: { logoImage: string; opponentTeam: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="results-logo-wrap">
      <span className="results-logo-fallback" aria-hidden="true">
        {opponentTeam.charAt(0)}
      </span>
      {!failed && (
        <img
          src={`/images/team-logos/${logoImage}`}
          alt={opponentTeam}
          className="results-logo"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
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
  const hasAwards = motm || wotg;
  const topPerformers = getTopPerformers(result, playerMap);
  const location =
    result.location === "HOME" || result.location === "AWAY"
      ? result.location
      : null;
  const gameHref = `/results/${encodeURIComponent(result.date)}`;

  return (
    <div className="results-row">
      <Link to={gameHref} className="results-row-main results-row-link">
        <span className={`results-outcome results-outcome--${outcome.toLowerCase()}`}>
          {outcome}
        </span>

        <div className="results-opponent">
          <ResultLogo logoImage={result.logoImage} opponentTeam={result.opponentTeam} />
          <span className="results-opponent-name">{result.opponentTeam}</span>
        </div>

        <div className="results-right">
          <span className="results-score">
            {result.score.warriorsScore} – {result.score.opponentScore}
          </span>
          {location && (
            <span
              className={`results-location results-location--${location.toLowerCase()}`}
            >
              {location === "HOME" ? "Home" : "Away"}
            </span>
          )}
          <span className="results-competition">{result.competition}</span>
          <span className="results-date">{formatDate(result.date)}</span>
        </div>
      </Link>

      {hasAwards && (
        <div className="results-row-awards">
          {motm && (
            <span className="results-award">
              <span className="results-award-label">MOTM</span>
              <span className="results-award-name">{motm}</span>
            </span>
          )}
          {wotg && (
            <span className="results-award">
              <span className="results-award-label">WOTG</span>
              <span className="results-award-name">{wotg}</span>
            </span>
          )}
        </div>
      )}

      {topPerformers.length > 0 && (
        <div className="results-row-performers">
          <span className="results-performers-label">Top Performers</span>
          <div className="results-performers-list">
            {topPerformers.map((p) => (
              <div key={p.id} className="results-performer">
                <span className="results-performer-name">{p.name}</span>
                <div className="results-performer-stats">
                  <span className="results-performer-stat">
                    <span className="results-performer-stat-value">{p.goals}</span>
                    <span className="results-performer-stat-label">G</span>
                  </span>
                  <span className="results-performer-stat">
                    <span className="results-performer-stat-value">{p.assists}</span>
                    <span className="results-performer-stat-label">A</span>
                  </span>
                  <span className="results-performer-stat">
                    <span className="results-performer-stat-value">{p.points}</span>
                    <span className="results-performer-stat-label">PTS</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
  const uniqueSeasons = useMemo(
    () => Array.from(new Set(allResults.map((r) => r.season))),
    [allResults]
  );
  const seasons = useMemo(() => ["All", ...uniqueSeasons], [uniqueSeasons]);

  const [activeSeason, setActiveSeason] = useState(uniqueSeasons[0] ?? "All");

  const filtered =
    activeSeason === "All"
      ? allResults
      : allResults.filter((r) => r.season === activeSeason);

  const wins = filtered.filter(
    (r) => getOutcome(r.score.warriorsScore, r.score.opponentScore) === "W"
  ).length;
  const losses = filtered.filter(
    (r) => getOutcome(r.score.warriorsScore, r.score.opponentScore) === "L"
  ).length;
  const draws = filtered.filter(
    (r) => getOutcome(r.score.warriorsScore, r.score.opponentScore) === "D"
  ).length;

  return (
    <div className="results-page">
      <header className="results-hero">
        <div className="results-hero-inner">
          <span className="results-hero-kicker">Peterborough Warriors</span>
          <h1 className="results-hero-title">Results</h1>
          <p className="results-hero-subtitle">
            Full history of match results for the Warriors
          </p>
        </div>
      </header>

      <div className="results-body">
        <div className="results-controls">
          <div className="results-tabs">
            {seasons.map((s) => (
              <button
                key={s}
                type="button"
                className={
                  activeSeason === s
                    ? "results-tab results-tab-active"
                    : "results-tab"
                }
                onClick={() => setActiveSeason(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="results-record">
            <span className="results-record-item results-record-w">{wins}W</span>
            <span className="results-record-sep">·</span>
            <span className="results-record-item results-record-d">{draws}D</span>
            <span className="results-record-sep">·</span>
            <span className="results-record-item results-record-l">{losses}L</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="results-empty">No results for this season.</p>
        ) : (
          <div className="results-list">
            {filtered.map((result) => (
              <ResultRow
                key={`${result.date}-${result.opponentTeam}`}
                result={result}
                playerMap={playerMap}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
