import { Link } from 'react-router';
import AssistSpotlight from "~/components/assist-spotlight/assist-spotlight";
import GoalSpotlight from "~/components/goals-spotlight/goals-spotlight";
import LatestResultSpotlight from "~/components/last-result-spotlight/last-result-spotlight";
import PointsSpotlight from "~/components/points-spotlight/points-spotlight";
import { type Season } from "~/components/season-filter/season-filter";
import SpotlightCard from "~/components/spotlight-card/spotlight-card";
import TeamStatsSpotlight from "~/components/team-stats-spotlight/team-stats-spotlight";
import UpcomingGameSpotlight from "~/components/upcoming-game-spotlight/upcoming-game-spotlight";

export function Welcome() {
  // Always show current season data
  const currentSeason: Season = '24/25';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        {/* Background Image */}
        <img 
          src="/images/team/tournament-win.jpg"
          alt="Tournament Victory"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12 z-10">
          <div className="text-center">
            <img
              src="/images/warriors-logo-white.png"
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

      {/* Sponsors & Photographer Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              Our Partners
            </h2>
            <p className="text-sm text-gray-300">
              Proudly supported by our sponsors and photographer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Sponsors */}
            <div>
              <h3 className="text-base font-medium text-white mb-4 text-center">
                Sponsors
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-6">
                <img
                  src="/images/sponsor-logos/ask-to-build.png"
                  alt="Ask to Build"
                  className="h-12 md:h-16 w-auto object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/images/sponsor-logos/hockaine.jpg"
                  alt="Hockaine"
                  className="h-12 md:h-16 w-auto object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/images/sponsor-logos/hockey-jam.jpg"
                  alt="Hockey Jam"
                  className="h-12 md:h-16 w-auto object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
            
            {/* Photographer */}
            <div>
              <h3 className="text-base font-medium text-white mb-4 text-center">
                Official Photographer
              </h3>
              <div className="flex justify-center">
                <div className="text-center">
                  <img
                    src="/images/sponsor-logos/j70.jpg"
                    alt="J70 Photography"
                    className="h-16 md:h-20 w-auto object-contain mx-auto mb-2 hover:scale-105 transition-transform duration-200"
                  />
                  <p className="text-sm text-gray-300">
                    Capturing our best moments
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Down Prompt */}
          <div className="flex justify-center mt-6">
            <div className="flex flex-col items-center text-white animate-bounce">
              <p className="text-sm mb-2 font-medium">
                Scroll to see highlights
              </p>
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </div>
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
