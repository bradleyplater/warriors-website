import type { Route } from "./+types/home";
import { HeroBanner } from "../components/HeroBanner";
import { NextGameCard } from "../components/NextGameCard/NextGameCard";
import { LatestResultCard } from "~/components/LatestResultCard/LatestResultCard";
import { SeasonLeaders } from "~/components/SeasonLeaders/SeasonLeaders";
import { SectionHead } from "~/components/ds/SectionHead";
import { Stripe } from "~/components/ds/Stripe";
import { getPlayers, getResults, getSeasons, getUpcomingGames } from "~/data/client";
import type { Player, UpcomingGame } from "~/data/types";
import { currentSeason, seasonHeading } from "~/helpers/seasons";
import { clubStructuredData, seoMeta } from "~/helpers/seo";
import { RouteLoadingFallback } from "~/components/RouteLoadingFallback/RouteLoadingFallback";
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
  return [
    ...seoMeta({
      path: "/",
      title: "Peterborough Warriors Ice Hockey Club",
      description:
        "Peterborough Warriors are a recreational ice hockey club playing at Planet Ice Peterborough. Fixtures, results, player stats and club records.",
    }),
    { "script:ld+json": clubStructuredData },
  ];
}

/** The page's heading, for search engines and screen readers; the hero photo
 *  carries the club name visually. */
function HomeHeading() {
  return <h1 className="visually-hidden">Peterborough Warriors Ice Hockey Club</h1>;
}

/**
 * Shown while the stats load, and pre-rendered into the static HTML, so the
 * page a search engine first fetches has the heading and hero rather than a
 * bare spinner.
 */
export function HydrateFallback() {
  return (
    <>
      <HomeHeading />
      <HeroBanner />
      <RouteLoadingFallback />
    </>
  );
}

export async function clientLoader() {
  const [players, results, upcomingGames, seasons] = await Promise.all([
    getPlayers<unknown[]>(),
    getResults<unknown[]>(),
    getUpcomingGames<UpcomingGame[]>(),
    getSeasons(),
  ]);
  return { players, results, upcomingGames, seasons };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { players, results, upcomingGames, seasons } = loaderData;
  const season = currentSeason(
    seasons,
    (players as Player[]).flatMap((player) => player.stats.map((line) => line.season))
  );

  return (
    <>
      <HomeHeading />
      <HeroBanner />

      <section id="results" aria-label="Matchday" className="home-matchday">
        <div className="home-matchday-inner">
          <LatestResultCard results={results} players={players} />
          <NextGameCard results={results} upcomingGames={upcomingGames} />
        </div>
      </section>

      <Stripe />

      <section id="team" className="home-leaders">
        <SectionHead eyebrow={season ? seasonHeading(season) : undefined} title="Season leaders">
          Skater scoring this season. Goaltending statistics are listed separately on the stats page.
        </SectionHead>
        <SeasonLeaders players={players} season={season} />
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
