import { useEffect, useState } from "react";
import type { Route } from "./+types/schedule";
import upcomingGames from "../../public/data/upcoming-games.json";
import { ScheduleGameCard } from "../components/ScheduleGameCard/ScheduleGameCard";
import { SectionHead } from "../components/ds/SectionHead";
import { getResults } from "~/data/client";
import "./schedule.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Fixtures — Peterborough Warriors" }];
}

export async function clientLoader() {
  const results = await getResults<unknown[]>();
  return { results };
}

type UpcomingGame = {
  opponentTeam: string;
  logoImage: string;
  gameType: string;
  date: string;
  time: string;
  location: string;
};

function parseGameDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function parseGameDateTime(dateString: string, timeString: string): Date {
  const base = parseGameDate(dateString);
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(timeString);
  if (!match) return base;
  let hours = Number(match[1]) % 12;
  if (/PM/i.test(match[3])) hours += 12;
  base.setHours(hours, Number(match[2]), 0, 0);
  return base;
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

type Filter = "All" | "Home" | "Away";

export default function Schedule({ loaderData }: Route.ComponentProps) {
  const { results } = loaderData;
  const [filter, setFilter] = useState<Filter>("All");
  const [now, setNow] = useState(() => Date.now());

  const sorted = [...(upcomingGames as UpcomingGame[])].sort(
    (a, b) => parseGameDate(a.date).getTime() - parseGameDate(b.date).getTime()
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextGame = sorted.find((g) => parseGameDate(g.date).getTime() >= today.getTime());

  useEffect(() => {
    if (!nextGame) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [nextGame?.date, nextGame?.time]);

  const filtered = sorted.filter((g) => {
    const isHome = g.location === "Planet Ice Peterborough";
    return filter === "All" || (filter === "Home" && isHome) || (filter === "Away" && !isHome);
  });

  const months = new Map<string, UpcomingGame[]>();
  for (const game of filtered) {
    const key = parseGameDate(game.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    months.set(key, [...(months.get(key) ?? []), game]);
  }

  let countdown: { k: string; v: string }[] | null = null;
  if (nextGame) {
    const targetMs = parseGameDateTime(nextGame.date, nextGame.time).getTime();
    const remaining = Math.max(0, Math.floor((targetMs - now) / 1000));
    countdown = [
      { k: "Days", v: pad(Math.floor(remaining / 86400)) },
      { k: "Hrs", v: pad(Math.floor((remaining % 86400) / 3600)) },
      { k: "Min", v: pad(Math.floor((remaining % 3600) / 60)) },
      { k: "Sec", v: pad(remaining % 60) },
    ];
  }

  return (
    <div className="schedule-page">
      <div className="schedule-intro">
        <SectionHead eyebrow="2025/26 season" title="Fixtures">
          Face-off times are confirmed the week before each game. Home games are at Planet Ice Peterborough.
        </SectionHead>
      </div>

      {nextGame && countdown && (
        <section className="schedule-next" aria-label="Next game">
          <div className="schedule-next-inner">
            <div className="schedule-next-copy">
              <div className="schedule-next-heading">
                <span className="t-label muted">Next game</span>
              </div>
              <h2 className="schedule-next-title">{nextGame.opponentTeam}</h2>
              <span className="t-data schedule-next-meta">
                {parseGameDate(nextGame.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · face-off {nextGame.time} · {nextGame.location}
              </span>
            </div>
            <div className="schedule-next-countdown">
              {countdown.map((c) => (
                <div key={c.k} className="schedule-next-countdown-cell">
                  <div className="schedule-next-countdown-value">{c.v}</div>
                  <div className="t-label schedule-next-countdown-key">{c.k}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="schedule-body">
        <div className="schedule-filters" role="group" aria-label="Filter fixtures">
          {(["All", "Home", "Away"] as Filter[]).map((f) => (
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
          <span className="t-data schedule-filters-count">{filtered.length} games shown</span>
        </div>

        {filtered.length === 0 ? (
          <p className="schedule-empty">No upcoming games scheduled.</p>
        ) : (
          Array.from(months.entries()).map(([month, games]) => (
            <div key={month} className="schedule-month">
              <h3 className="t-heading schedule-month-heading">{month}</h3>
              <ul className="schedule-month-list">
                {games.map((game, i) => (
                  <ScheduleGameCard key={i} game={game} results={results} />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
