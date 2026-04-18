import { Text } from "@wonderflow/react-components";
import upcomingGames from "../../../public/data/upcoming-games.json";
import results from "../../../public/data/results.json";
import { TeamLogo } from "../TeamLogo/TeamLogo";
import "./NextGameCard.css";



type UpcomingGame = {
  opponentTeam: string;
  logoImage: string;
  gameType: string;
  date: string;
  time: string;
  location: string;
};

type Result = {
  opponentTeam: string;
  logoImage: string;
  date: string;
  competition: string;
  score: {
    warriorsScore: number;
    opponentScore: number;
  };
};

function parseGameDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatGameDate(dateString: string) {
  return parseGameDate(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getResultOutcome(warriorsScore: number, opponentScore: number): "W" | "L" | "D" {
  if (warriorsScore > opponentScore) return "W";
  if (warriorsScore < opponentScore) return "L";
  return "D";
}

export function NextGameCard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextGame = [...(upcomingGames as UpcomingGame[])]
    .sort(
      (a, b) =>
        parseGameDate(a.date).getTime() - parseGameDate(b.date).getTime()
    )
    .find((game) => parseGameDate(game.date).getTime() >= today.getTime());

  const recentResults = nextGame
    ? [...(results as Result[])]
        .filter(
          (r) =>
            r.opponentTeam === nextGame.opponentTeam &&
            new Date(r.date).getTime() < today.getTime()
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
    : [];

  return (
    <div className="next-game-shell">
      <section className="next-game-card" aria-labelledby="next-game-heading">
        {nextGame ? (
          <>
            <div className="next-game-left-col">
            <span className="next-game-kicker">Next Game</span>

            <div className="next-game-header-centered">
              <TeamLogo
                src={`/images/team-logos/${nextGame.logoImage}`}
                teamName={nextGame.opponentTeam}
              />

              <Text
                as="h2"
                variant="heading-2"
                className="next-game-opponent-name"
                id="next-game-heading"
              >
                {nextGame.opponentTeam}
              </Text>
            </div>
            </div>

            <dl className="next-game-meta">
              <div className="next-game-meta-row">
                <dt>Date</dt>
                <dd>{formatGameDate(nextGame.date)}</dd>
              </div>

              <div className="next-game-meta-row">
                <dt>Faceoff</dt>
                <dd>{nextGame.time}</dd>
              </div>

              <div className="next-game-meta-row">
                <dt>Venue</dt>
                <dd>{nextGame.location}</dd>
              </div>

              <div className="next-game-meta-row">
                <dt>Competition</dt>
                <dd>{nextGame.gameType}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="next-game-copy">
            <span className="next-game-kicker">Next Game</span>
            <Text
              as="h2"
              variant="heading-3"
              className="next-game-title"
              id="next-game-heading"
            >
              More fixtures coming soon
            </Text>
            <Text variant="body-1" className="next-game-summary">
              The upcoming schedule will appear here once new matches are
              published.
            </Text>
          </div>
        )}

        {recentResults.length > 0 && (
          <div className="ng-recent-results">
            <span className="ng-recent-results-label">Previous Meetings</span>
            <ul className="ng-recent-results-list">
              {recentResults.map((result, i) => {
                const outcome = getResultOutcome(result.score.warriorsScore, result.score.opponentScore);
                const dateStr = new Date(result.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <li key={i} className="ng-result-row">
                    <span className="ng-result-date">{dateStr}</span>
                    <span className="ng-result-score">
                      {result.score.warriorsScore}–{result.score.opponentScore}
                    </span>
                    <span className={`ng-result-badge ng-result-badge--${outcome.toLowerCase()}`}>
                      {outcome}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}