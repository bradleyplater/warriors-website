import { useState } from 'react';
import { Link } from 'react-router';
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <img
              src="images/warriors-logo-white.png"
              alt="Warriors Logo"
              className="h-16 md:h-20 w-auto mx-auto mb-6"
            />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Peterborough Warriors
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Recreational ice hockey team bringing together players of all skill levels
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                to="/player-stats" 
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View Player Stats
              </Link>
              <Link 
                to="/team-stats" 
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Team Performance
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Season Filter */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Season Highlights
            </h2>
            <SeasonFilter 
              selectedSeason={selectedSeason} 
              onSeasonChange={handleSeasonChange} 
            />
          </div>
        </div>
      </div>

      {/* Game Information Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          <SpotlightCard cardHeader="🏒 Next Game">
            <UpcomingGameSpotlight/>
          </SpotlightCard>
          <SpotlightCard cardHeader="📊 Latest Result">
            <LatestResultSpotlight/>
          </SpotlightCard>
        </div>

        {/* Team Performance Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              Team Performance
            </h3>
            <Link 
              to="/team-stats" 
              className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Stats →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <TeamStatsSpotlight selectedSeason={selectedSeason} />
          </div>
        </div>

        {/* Player Highlights */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
              Player Highlights
            </h3>
            <Link 
              to="/player-stats" 
              className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Players →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard cardHeader="🥅 Top Scorer">
              <GoalSpotlight selectedSeason={selectedSeason} />
            </SpotlightCard>
            <SpotlightCard cardHeader="🎯 Playmaker">
              <AssistSpotlight selectedSeason={selectedSeason} />
            </SpotlightCard>
            <SpotlightCard cardHeader="⭐ Points Leader">
              <PointsSpotlight selectedSeason={selectedSeason} />
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}
