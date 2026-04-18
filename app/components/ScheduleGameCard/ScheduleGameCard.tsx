import { Text } from "@wonderflow/react-components";
import results from "../../../public/data/results.json";
import { TeamLogo } from "../TeamLogo/TeamLogo";
import "../NextGameCard/NextGameCard.css";

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

function formatGameDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1).toLocaleDateString("en-GB", {
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

export function ScheduleGameCard({ game }: { game: UpcomingGame }) {
  const gameDate = new Date(game.date).getTime();

  const previousMeetings = [...(results as Result[])]
    .filter(
      (r) =>
        r.opponentTeam === game.opponentTeam &&
        new Date(r.date).getTime() < gameDate
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="next-game-shell">
      <section className="next-game-card" aria-label={`Game vs ${game.opponentTeam}`}>
        <div className="next-game-left-col">
          <div className="next-game-header-centered">
            <TeamLogo
              src={`/images/team-logos/${game.logoImage}`}
              teamName={game.opponentTeam}
            />
            <Text
              as="h2"
              variant="heading-2"
              className="next-game-opponent-name"
            >
              {game.opponentTeam}
            </Text>
          </div>
        </div>

        <dl className="next-game-meta">
          <div className="next-game-meta-row">
            <dt>Date</dt>
            <dd>{formatGameDate(game.date)}</dd>
          </div>
          <div className="next-game-meta-row">
            <dt>Faceoff</dt>
            <dd>{game.time}</dd>
          </div>
          <div className="next-game-meta-row">
            <dt>Venue</dt>
            <dd>{game.location}</dd>
          </div>
          <div className="next-game-meta-row">
            <dt>Competition</dt>
            <dd>{game.gameType}</dd>
          </div>
        </dl>

        {previousMeetings.length > 0 && (
          <div className="ng-recent-results">
            <span className="ng-recent-results-label">Previous Meetings</span>
            <ul className="ng-recent-results-list">
              {previousMeetings.map((result, i) => {
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
