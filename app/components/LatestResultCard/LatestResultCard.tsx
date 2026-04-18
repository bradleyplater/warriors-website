import { Text } from "@wonderflow/react-components";
import results from "../../../public/data/results.json";
import players from "../../../public/data/players.json";
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

function getTopPerformers(result: Result): PlayerStat[] {
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

export function LatestResultCard() {
  const today = new Date();

  const latestResult = [...(results as Result[])]
    .filter((r) => new Date(r.date).getTime() < today.getTime())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const topPerformers = latestResult ? getTopPerformers(latestResult) : [];

  return (
    <div className="lr-shell">
      <section className="lr-card" aria-labelledby="lr-heading">
        {latestResult ? (
          <>
            <div className="lr-left-col">
              <span className="lr-kicker">Latest Result</span>

              <div className="lr-header-centered">
                <div className="lr-logo-wrap">
                  <img
                    src={`/images/team-logos/${latestResult.logoImage}`}
                    alt={`${latestResult.opponentTeam} logo`}
                    className="lr-logo"
                  />
                </div>

                <Text
                  as="h2"
                  variant="heading-2"
                  className="lr-opponent-name"
                  id="lr-heading"
                >
                  {latestResult.opponentTeam}
                </Text>
              </div>

              <div className="lr-score-block">
                <span
                  className={`lr-outcome lr-outcome--${getOutcome(latestResult.score.warriorsScore, latestResult.score.opponentScore).toLowerCase()}`}
                >
                  {getOutcome(latestResult.score.warriorsScore, latestResult.score.opponentScore)}
                </span>
                <span className="lr-score">
                  {latestResult.score.warriorsScore} – {latestResult.score.opponentScore}
                </span>
              </div>
            </div>

            <dl className="lr-meta">
              <div className="lr-meta-row">
                <dt>Date</dt>
                <dd>{formatResultDate(latestResult.date)}</dd>
              </div>

              <div className="lr-meta-row">
                <dt>Venue</dt>
                <dd>{latestResult.location}</dd>
              </div>

              <div className="lr-meta-row">
                <dt>Competition</dt>
                <dd>{latestResult.competition}</dd>
              </div>
            </dl>

            {topPerformers.length > 0 && (
              <div className="lr-performers">
                <span className="lr-performers-heading">Top Performers</span>
                <div className="lr-performers-grid">
                  {topPerformers.map((p, i) => (
                    <div key={p.id} className="lr-performer-card">
                      <div className="lr-performer-avatar-wrap">
                        <img
                          src={`/images/players/${p.id}.jpg`}
                          alt={p.name}
                          className="lr-performer-avatar"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <span className="lr-performer-name">{p.name}</span>
                      <div className="lr-performer-stats">
                        <div className="lr-performer-stat">
                          <span className="lr-performer-stat-value">{p.goals}</span>
                          <span className="lr-performer-stat-label">Goals</span>
                        </div>
                        <div className="lr-performer-stat">
                          <span className="lr-performer-stat-value">{p.assists}</span>
                          <span className="lr-performer-stat-label">Assists</span>
                        </div>
                        <div className="lr-performer-stat">
                          <span className="lr-performer-stat-value">{p.points}</span>
                          <span className="lr-performer-stat-label">Points</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="lr-copy">
            <span className="lr-kicker">Latest Result</span>
            <Text
              as="h2"
              variant="heading-3"
              className="lr-title"
              id="lr-heading"
            >
              No results yet
            </Text>
            <Text variant="body-1" className="lr-summary">
              Match results will appear here once games have been played.
            </Text>
          </div>
        )}
      </section>
    </div>
  );
}
