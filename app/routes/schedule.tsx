import type { Route } from "./+types/schedule";
import upcomingGames from "../../public/data/upcoming-games.json";
import { ScheduleGameCard } from "../components/ScheduleGameCard/ScheduleGameCard";
import { RouteLoadingFallback } from "~/components/RouteLoadingFallback/RouteLoadingFallback";
import { getResults } from "~/data/client";
import "./schedule.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Schedule — Peterborough Warriors" }];
}

export async function clientLoader() {
  const results = await getResults<unknown[]>();
  return { results };
}

export function HydrateFallback() {
  return <RouteLoadingFallback />;
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

export default function Schedule({ loaderData }: Route.ComponentProps) {
  const { results } = loaderData;
  const sorted = [...(upcomingGames as UpcomingGame[])].sort(
    (a, b) => parseGameDate(a.date).getTime() - parseGameDate(b.date).getTime()
  );

  return (
    <div className="schedule-page">
      <header className="schedule-hero">
        <div className="schedule-hero-inner">
          <span className="schedule-hero-kicker">2025 / 26 Season</span>
          <h1 className="schedule-hero-title">Schedule</h1>
          <p className="schedule-hero-subtitle">
            All upcoming fixtures for the Peterborough Warriors
          </p>
        </div>
      </header>

      <section className="schedule-body">
        {sorted.length === 0 ? (
          <p className="schedule-empty">No upcoming games scheduled.</p>
        ) : (
          <div className="schedule-list">
            {sorted.map((game, i) => (
              <ScheduleGameCard key={i} game={game} results={results} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
