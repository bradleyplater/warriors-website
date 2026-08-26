import { Badge } from "../ds/Badge";
import "./ScheduleGameCard.css";

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

function formatGameDay(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getResultOutcome(warriorsScore: number, opponentScore: number): "W" | "L" | "D" {
  if (warriorsScore > opponentScore) return "W";
  if (warriorsScore < opponentScore) return "L";
  return "D";
}

export function ScheduleGameCard({ game, results: rawResults }: { game: UpcomingGame; results: unknown[] }) {
  const results = rawResults as Result[];
  const gameDate = new Date(game.date).getTime();
  const isHome = game.location === "Planet Ice Peterborough";

  const previousMeetings = [...results]
    .filter((r) => r.opponentTeam === game.opponentTeam && new Date(r.date).getTime() < gameDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <li className="fx-row">
      <div className="fx-row-date">
        <span className="t-data fx-row-date-day">{formatGameDay(game.date)}</span>
        <span className="t-data fx-row-date-time">{game.time}</span>
      </div>
      <div className="fx-row-opponent">
        <div className="fx-row-opponent-line">
          <Badge tone={isHome ? "info" : "neutral"}>{isHome ? "Home" : "Away"}</Badge>
          <span className="fx-row-opponent-name">{game.opponentTeam}</span>
        </div>
        <span className="t-label fx-row-opponent-meta">{game.gameType} · {game.location}</span>
      </div>
      <div className="fx-row-action">
        <a className="t-label" href="#calendar">Add to calendar</a>
      </div>

      {previousMeetings.length > 0 && (
        <div className="fx-row-prev">
          <span className="t-label fx-row-prev-label">Previous meetings</span>
          <ul className="fx-row-prev-list">
            {previousMeetings.map((result, i) => {
              const outcome = getResultOutcome(result.score.warriorsScore, result.score.opponentScore);
              const dateStr = new Date(result.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <li key={i} className="fx-row-prev-item">
                  <span className="t-data">{dateStr}</span>
                  <span className="t-data">{result.score.warriorsScore}–{result.score.opponentScore}</span>
                  <Badge tone={outcome === "W" ? "success" : outcome === "L" ? "danger" : "neutral"} glyph={null}>
                    {outcome}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
