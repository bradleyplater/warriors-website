import type { Route } from "./+types/home";
import { HeroBanner } from "../components/HeroBanner";
import { NextGameCard } from "../components/NextGameCard/NextGameCard";
import { LatestResultCard } from "~/components/LatestResultCard/LatestResultCard";
import { SeasonLeaders } from "~/components/SeasonLeaders/SeasonLeaders";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Peterborough Warriors" }];
}

export default function Home() {
  return (
    <section className="home-shell">
      <HeroBanner />
      <NextGameCard />
      <LatestResultCard />
      <SeasonLeaders />
    </section>
  );
}