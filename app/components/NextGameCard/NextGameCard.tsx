import { useEffect, useState } from "react";
import { Link } from "react-router";
import upcomingGames from "../../../public/data/upcoming-games.json";
import { Badge } from "../ds/Badge";
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

/** Combines the "YYYY-MM-DD" date with a "7:00 PM"-style time into a Date. */
function parseGameDateTime(dateString: string, timeString: string): Date {
  const base = parseGameDate(dateString);
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(timeString);
  if (!match) return base;
  let hours = Number(match[1]) % 12;
  if (/PM/i.test(match[3])) hours += 12;
  base.setHours(hours, Number(match[2]), 0, 0);
  return base;
}

function getResultOutcome(warriorsScore: number, opponentScore: number): "W" | "L" | "D" {
  if (warriorsScore > opponentScore) return "W";
  if (warriorsScore < opponentScore) return "L";
  return "D";
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function NextGameCard({ results: rawResults }: { results: unknown[] }) {
  const results = rawResults as Result[];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextGame = [...(upcomingGames as UpcomingGame[])]
    .sort((a, b) => parseGameDate(a.date).getTime() - parseGameDate(b.date).getTime())
    .find((game) => parseGameDate(game.date).getTime() >= today.getTime());

  const recentResults = nextGame
    ? [...results]
        .filter(
          (r) => r.opponentTeam === nextGame.opponentTeam && new Date(r.date).getTime() < today.getTime()
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
    : [];

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!nextGame) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [nextGame?.date, nextGame?.time]);

  if (!nextGame) {
    return (
      <div className="next-game-shell">
        <div className="next-game-copy">
          <span className="t-label muted">Next game</span>
          <h2 className="t-heading next-game-title">More fixtures coming soon</h2>
          <p className="next-game-summary">
            The upcoming schedule will appear here once new matches are published.
          </p>
        </div>
      </div>
    );
  }

  const isHome = nextGame.location === "Planet Ice Peterborough";
  const targetMs = parseGameDateTime(nextGame.date, nextGame.time).getTime();
  const remaining = Math.max(0, Math.floor((targetMs - now) / 1000));
  const countdown = [
    { k: "Days", v: pad(Math.floor(remaining / 86400)) },
    { k: "Hrs", v: pad(Math.floor((remaining % 86400) / 3600)) },
    { k: "Min", v: pad(Math.floor((remaining % 3600) / 60)) },
    { k: "Sec", v: pad(remaining % 60) },
  ];

  return (
    <div className="next-game-shell">
      <div className="next-game-heading-row">
        <span className="t-label">Next game</span>
        <Badge tone={isHome ? "info" : "neutral"}>{isHome ? "Home" : "Away"}</Badge>
      </div>

      <div className="next-game-opponent-row">
        <span className="t-label muted">{isHome ? "vs" : "at"}</span>
        <h2 className="next-game-opponent-name">{nextGame.opponentTeam}</h2>
      </div>

      <dl className="next-game-meta">
        <div>
          <dt className="t-label">Date</dt>
          <dd className="t-data">{formatGameDate(nextGame.date)}</dd>
        </div>
        <div>
          <dt className="t-label">Face-off</dt>
          <dd className="t-data">{nextGame.time}</dd>
        </div>
        <div>
          <dt className="t-label">Venue</dt>
          <dd>{nextGame.location}</dd>
        </div>
        <div>
          <dt className="t-label">Competition</dt>
          <dd>{nextGame.gameType}</dd>
        </div>
      </dl>

      <div className="next-game-countdown-wrap">
        <span className="t-label next-game-countdown-label">Face-off in</span>
        <div className="next-game-countdown" aria-live="off">
          {countdown.map((c) => (
            <div key={c.k} className="next-game-countdown-cell">
              <div className="next-game-countdown-value">{c.v}</div>
              <div className="t-label next-game-countdown-key">{c.k}</div>
            </div>
          ))}
        </div>
        <p className="t-data next-game-countdown-text">
          {formatGameDate(nextGame.date)} · face-off {nextGame.time} · {nextGame.location}
        </p>
      </div>

      <div className="next-game-links">
        <Link to="/schedule" className="t-label">Full fixture list</Link>
      </div>

      {recentResults.length > 0 && (
        <div className="ng-recent-results">
          <span className="t-label ng-recent-results-label">Previous meetings</span>
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
                  <span className="t-data ng-result-score">
                    {result.score.warriorsScore}–{result.score.opponentScore}
                  </span>
                  <span className={`ng-result-badge ng-result-badge--${outcome.toLowerCase()}`}>{outcome}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
