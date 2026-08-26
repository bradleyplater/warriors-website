import { Link } from "react-router";
import { Badge } from "../ds/Badge";
import "./LatestResultCard.css";

type Goal = {
  playerId: string;
  assists: string[];
};

type Period = {
  goals?: Goal[];
};

type Result = {
  opponentTeam: string;
  logoImage: string;
  date: string;
  competition: string;
  location: string;
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

type PlayerName = {
  id: string;
  name: string;
};

function formatResultDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getOutcome(warriorsScore: number, opponentScore: number) {
  if (warriorsScore > opponentScore) return "W";
  if (warriorsScore < opponentScore) return "L";
  return "D";
}

function getTopPerformers(result: Result, players: PlayerName[]): PlayerStat[] {
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

  const playerMap = new Map(players.map((p) => [p.id, p.name]));

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

export function LatestResultCard({
  results: rawResults,
  players: rawPlayers,
}: {
  results: unknown[];
  players: unknown[];
}) {
  const results = rawResults as Result[];
  const players = rawPlayers as PlayerName[];
  const today = new Date();

  const latestResult = [...results]
    .filter((r) => new Date(r.date).getTime() < today.getTime())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const topPerformers = latestResult ? getTopPerformers(latestResult, players) : [];

  if (!latestResult) {
    return (
      <div className="lr-shell">
        <div className="lr-copy">
          <span className="t-label muted">Last result</span>
          <h2 className="t-heading lr-title">No results yet</h2>
          <p className="lr-summary">Match results will appear here once games have been played.</p>
        </div>
      </div>
    );
  }

  const outcome = getOutcome(latestResult.score.warriorsScore, latestResult.score.opponentScore);
  const reportHref = `/results/${encodeURIComponent(latestResult.date)}`;

  return (
    <div className="lr-shell">
      <div className="lr-heading-row">
        <span className="t-label">Last result</span>
        <Badge tone={outcome === "W" ? "success" : outcome === "L" ? "danger" : "neutral"}>
          {outcome === "W" ? "Won" : outcome === "L" ? "Lost" : "Drew"}
        </Badge>
      </div>

      <div className="lr-scoreline">
        <div className="lr-team-row">
          <span className="lr-team-mark" aria-hidden="true">PW</span>
          <span className="lr-team-name">Peterborough Warriors</span>
          <span className="lr-team-score">{latestResult.score.warriorsScore}</span>
        </div>
        <div className="lr-team-row">
          <span className="lr-team-mark lr-team-mark--opponent" aria-hidden="true">
            {latestResult.opponentTeam.slice(0, 2).toUpperCase()}
          </span>
          <span className="lr-team-name lr-team-name--opponent">{latestResult.opponentTeam}</span>
          <span className="lr-team-score lr-team-score--opponent">{latestResult.score.opponentScore}</span>
        </div>
      </div>

      <dl className="lr-meta">
        <div>
          <dt className="t-label">Competition</dt>
          <dd>{latestResult.competition}</dd>
        </div>
        <div>
          <dt className="t-label">Date</dt>
          <dd className="t-data">{formatResultDate(latestResult.date)}</dd>
        </div>
        <div>
          <dt className="t-label">Venue</dt>
          <dd>{latestResult.location === "HOME" ? "Home" : "Away"}</dd>
        </div>
      </dl>

      {topPerformers.length > 0 && (
        <div className="lr-performers">
          <span className="t-label lr-performers-heading">Top performers</span>
          <div className="lr-performers-list">
            {topPerformers.map((p) => (
              <div key={p.id} className="lr-performer">
                <span className="lr-performer-name">{p.name}</span>
                <span className="t-data">
                  <span className="lr-performer-stat-value">{p.goals}</span>{" "}
                  <span className="lr-performer-stat-label">G</span>{" · "}
                  <span className="lr-performer-stat-value">{p.assists}</span>{" "}
                  <span className="lr-performer-stat-label">A</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="lr-links">
        <Link to={reportHref} className="t-label">Match report</Link>
        <Link to="/results" className="t-label">All results</Link>
      </div>
    </div>
  );
}
