import { useState } from 'react';
import AssistSpotlight from "~/components/assist-spotlight/assist-spotlight";
import GoalSpotlight from "~/components/goals-spotlight/goals-spotlight";
import LatestResultSpotlight from "~/components/last-result-spotlight/last-result-spotlight";
import PointsSpotlight from "~/components/points-spotlight/points-spotlight";
import SeasonFilter, { type Season } from "~/components/season-filter/season-filter";
import SpotlightCard from "~/components/spotlight-card/spotlight-card";
import TeamStatsSpotlight from "~/components/team-stats-spotlight/team-stats-spotlight";
import UpcomingGameSpotlight from "~/components/upcoming-game-spotlight/upcoming-game-spotlight";

export function Welcome() {
  const [selectedSeason, setSelectedSeason] = useState<Season>('24/25');

  const handleSeasonChange = (season: Season) => {
    setSelectedSeason(season);
  };

  return (
    <main className="flex items-center justify-center pb-4">
      <div className="flex-1 flex flex-col items-center min-h-0">
        <header className="flex flex-col items-center">
          <img
            src="images/warriors-logo-black.png"
            alt="Logo"
            className="max-h-full md:max-w-1/9 max-w-1/2"
          ></img>
        </header>
        
        <SeasonFilter 
          selectedSeason={selectedSeason} 
          onSeasonChange={handleSeasonChange} 
        />
        
        <div className="px-4 w-full grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr place-items-center">
          <SpotlightCard cardHeader="Next Game">
          <UpcomingGameSpotlight/>
          </SpotlightCard>
          <SpotlightCard cardHeader="Last Result">
            <LatestResultSpotlight/>
          </SpotlightCard>
          <SpotlightCard cardHeader="Team Stats">
            <TeamStatsSpotlight selectedSeason={selectedSeason} />
          </SpotlightCard>

          <SpotlightCard cardHeader="Goals">
            <GoalSpotlight selectedSeason={selectedSeason} />
          </SpotlightCard>
          <SpotlightCard cardHeader="Assists">
            <AssistSpotlight selectedSeason={selectedSeason} />
          </SpotlightCard>
          <SpotlightCard cardHeader="Points">
            <PointsSpotlight selectedSeason={selectedSeason} />
          </SpotlightCard>
        </div>
      </div>
    </main>
  );
}
