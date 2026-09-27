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
  location?: string;
  score: {
    warriorsScore: number;
    opponentScore: number;
  };
};

export type PreviousMeeting = {
  outcome: "W" | "L" | "D";
  score: string;
  date: string;
  where: string | null;
};

function formatGameDay(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).replace(",", "");
}

function getResultOutcome(warriorsScore: number, opponentScore: number): "W" | "L" | "D" {
  if (warriorsScore > opponentScore) return "W";
  if (warriorsScore < opponentScore) return "L";
  return "D";
}

/** The last three results against an opponent before a given date, newest first. */
export function getPreviousMeetings(rawResults: unknown[], opponent: string, before: Date): PreviousMeeting[] {
  return (rawResults as Result[])
    .filter((r) => r.opponentTeam === opponent && new Date(r.date).getTime() < before.getTime())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map((r) => ({
      outcome: getResultOutcome(r.score.warriorsScore, r.score.opponentScore),
      score: `${r.score.warriorsScore}–${r.score.opponentScore}`,
      date: new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      where: r.location === "HOME" ? "Home" : r.location === "AWAY" ? "Away" : null,
    }));
}

/** Result letter in the W/L/D colours used on the Results page. */
export function OutcomeMark({ outcome, className }: { outcome: "W" | "L" | "D"; className?: string }) {
  return <span className={`t-data fx-outcome fx-outcome--${outcome.toLowerCase()} ${className ?? ""}`}>{outcome}</span>;
}

export function ScheduleGameCard({ game, results }: { game: UpcomingGame; results: unknown[] }) {
  const isHome = game.location === "Planet Ice Peterborough";
  const [y, m, d] = game.date.split("-").map(Number);
  const previousMeetings = getPreviousMeetings(results, game.opponentTeam, new Date(y, m - 1, d));

  return (
    <li className="fx-row">
      <div className="fx-row-date">
        <span className="t-data fx-row-date-day">{formatGameDay(game.date)}</span>
        <span className="t-data fx-row-date-time">{game.time}</span>
      </div>
      <div className="fx-row-opponent">
        <div className="fx-row-opponent-line">
          <span className="t-label fx-row-opponent-ha" title={isHome ? "Home" : "Away"}>{isHome ? "H" : "A"}</span>
          <span className="fx-row-opponent-name">{game.opponentTeam}</span>
        </div>
        <span className="t-label fx-row-opponent-meta">{game.gameType} · {game.location}</span>
      </div>

      {previousMeetings.length > 0 && (
        <div className="fx-row-prev">
          <span className="t-label fx-row-prev-label">Previous results</span>
          <ol className="fx-row-prev-list">
            {previousMeetings.map((p, i) => (
              <li key={i} className="fx-row-prev-item" title={[p.date, p.where].filter(Boolean).join(" · ")}>
                <OutcomeMark outcome={p.outcome} />
                <span className="t-data fx-row-prev-score">{p.score}</span>
                <span className="t-label fx-row-prev-date">{p.date}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </li>
  );
}
