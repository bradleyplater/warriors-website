import type { Route } from "./+types/home";
import { HeroBanner } from "../components/HeroBanner";
import { NextGameCard } from "../components/NextGameCard/NextGameCard";
import { LatestResultCard } from "~/components/LatestResultCard/LatestResultCard";
import { SeasonLeaders } from "~/components/SeasonLeaders/SeasonLeaders";
import { RouteLoadingFallback } from "~/components/RouteLoadingFallback/RouteLoadingFallback";
import { getPlayers, getResults } from "~/data/client";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Peterborough Warriors" }];
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

export default function Home({ loaderData }: Route.ComponentProps) {
  const { players, results } = loaderData;

  return (
    <section className="home-shell">
      <HeroBanner />
      <NextGameCard results={results} />
      <LatestResultCard results={results} players={players} />
      <SeasonLeaders players={players} />
    </section>
  );
}