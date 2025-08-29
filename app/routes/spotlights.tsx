import { Link } from 'react-router';
import AssistSpotlight from "~/components/assist-spotlight/assist-spotlight";
import GoalSpotlight from "~/components/goals-spotlight/goals-spotlight";
import LatestResultSpotlight from "~/components/last-result-spotlight/last-result-spotlight";
import PointsSpotlight from "~/components/points-spotlight/points-spotlight";
import { type Season } from "~/components/season-filter/season-filter";
import SpotlightCard from "~/components/spotlight-card/spotlight-card";
import TeamStatsSpotlight from "~/components/team-stats-spotlight/team-stats-spotlight";
import UpcomingGameSpotlight from "~/components/upcoming-game-spotlight/upcoming-game-spotlight";

export default function Spotlights() {
  // Always show current season data
  const currentSeason: Season = '24/25';

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Team Spotlights
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Current season highlights and key statistics
          </p>
        </div>

        {/* Game Information Section */}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                Team Performance
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Current season (2024/25) statistics
              </p>
            </div>
            <Link 
              to="/team-stats" 
              className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
            >
              View All Stats →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <TeamStatsSpotlight selectedSeason={currentSeason} />
          </div>
        </div>

        {/* Player Highlights */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                Player Highlights
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Current season (2024/25) leaders
              </p>
            </div>
            <Link 
              to="/player-stats" 
              className="text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
            >
              View All Players →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard cardHeader="🥅 Top Scorer">
              <GoalSpotlight selectedSeason={currentSeason} />
            </SpotlightCard>
            <SpotlightCard cardHeader="🎯 Playmaker">
              <AssistSpotlight selectedSeason={currentSeason} />
            </SpotlightCard>
            <SpotlightCard cardHeader="⭐ Points Leader">
              <PointsSpotlight selectedSeason={currentSeason} />
            </SpotlightCard>
          </div>
        </div>
      </div>
    </div>
  );
}
