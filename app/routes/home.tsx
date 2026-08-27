import type { Route } from "./+types/home";
import { HeroBanner } from "../components/HeroBanner";
import { NextGameCard } from "../components/NextGameCard/NextGameCard";
import { LatestResultCard } from "~/components/LatestResultCard/LatestResultCard";
import { SeasonLeaders } from "~/components/SeasonLeaders/SeasonLeaders";
import { SectionHead } from "~/components/ds/SectionHead";
import { Stripe } from "~/components/ds/Stripe";
import { getPlayers, getResults } from "~/data/client";
import "./home.css";

/**
 * Club partners. The artwork has baked-in backgrounds of differing colours
 * (see .home-partner-slot), so each logo sits on a constant dark tile rather
 * than a theme-dependent one.
 */
const partners = [
  { name: "Ask 2 Build", image: "/images/sponsor-logos/ask-to-build.png" },
  { name: "Hockaine", image: "/images/sponsor-logos/hockaine.jpg" },
  { name: "Hockey Jam", image: "/images/sponsor-logos/hockey-jam.jpg" },
  { name: "J70 Photography", image: "/images/sponsor-logos/j70.jpg" },
];

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

export default function Home({ loaderData }: Route.ComponentProps) {
  const { players, results } = loaderData;

  return (
    <>
      <HeroBanner />

      <section id="results" aria-label="Matchday" className="home-matchday">
        <div className="home-matchday-inner">
          <LatestResultCard results={results} players={players} />
          <NextGameCard results={results} />
        </div>
      </section>

      <Stripe />

      <section id="team" className="home-leaders">
        <SectionHead eyebrow="2025/26 season" title="Season leaders">
          Skater scoring this season. Goaltending statistics are listed separately on the stats page.
        </SectionHead>
        <SeasonLeaders players={players} />
      </section>

      <section aria-label="Club partners" className="home-partners">
        <span className="t-label home-partners-label">Club partners</span>
        <div className="home-partners-grid">
          {partners.map((partner) => (
            <div key={partner.name} className="home-partner-slot">
              <img src={partner.image} alt={partner.name} className="home-partner-logo" loading="lazy" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
