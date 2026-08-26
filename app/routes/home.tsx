import type { Route } from "./+types/home";
import { HeroBanner } from "../components/HeroBanner";
import { NextGameCard } from "../components/NextGameCard/NextGameCard";
import { LatestResultCard } from "~/components/LatestResultCard/LatestResultCard";
import { SeasonLeaders } from "~/components/SeasonLeaders/SeasonLeaders";
import { SectionHead } from "~/components/ds/SectionHead";
import { Stripe } from "~/components/ds/Stripe";
import { Button } from "~/components/ds/Button";
import { getPlayers, getResults } from "~/data/client";
import "./home.css";

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

      <section id="club" className="home-club">
        <div className="home-club-inner">
          <div className="home-club-copy">
            <h2 className="t-heading home-club-title">New players welcome</h2>
            <p className="home-club-text">
              The club takes players returning to the game and those coming to it for the first time.
              Skate sessions run weekly at Planet Ice Peterborough. Kit hire is available for a first
              block of six weeks.
            </p>
          </div>
          <div className="home-club-actions">
            <Button size="lg">Register interest</Button>
            <Button variant="secondary" size="lg">Membership fees</Button>
          </div>
        </div>
      </section>

      <section aria-label="Club partners" className="home-partners">
        <span className="t-label home-partners-label">Club partners</span>
        <div className="home-partners-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="home-partner-slot">
              <span className="t-label">Sponsor logo</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
