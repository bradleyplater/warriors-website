import { useData, type DataContextType } from "../contexts/DataContext";
import TeamPanelSection from "../components/team-section/team-panel-section";

export default function UpcomingGames() {
  const { data }: DataContextType = useData();
  
  // Format date for display (YYYY-MM-DD to readable format)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Sort games by date (closest first)
  const sortedUpcomingGames = data.upcomingGames?.slice().sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    return dateA.getTime() - dateB.getTime();
  }) || [];
  
  const upcomingGames = sortedUpcomingGames;

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Upcoming Games
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Our upcoming fixtures, times, and locations
          </p>
        </div>

        {/* Games List */}
        {!upcomingGames || upcomingGames.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 text-lg">
              No upcoming games scheduled
            </div>
            <div className="text-gray-400 text-sm mt-2">
              Check back later for fixture updates
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingGames.map((game, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
              >
                {/* Teams Section - Main Focus */}
                <div className="mb-8">
                  <TeamPanelSection 
                    opponentTeam={game.opponentTeam}
                    opponentLogoImage={game.logoImage}
                    className="py-6 md:py-8"
                  />
                </div>

                {/* Game Type Badge */}
                <div className="flex justify-center mb-6">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                    {game.gameType}
                  </span>
                </div>

                {/* Game Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  {/* Date */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-gray-500 text-sm font-medium mb-1">
                      Date
                    </div>
                    <div className="text-gray-900 text-lg font-semibold">
                      {formatDate(game.date)}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-gray-500 text-sm font-medium mb-1">
                      Time
                    </div>
                    <div className="text-gray-900 text-lg font-semibold">
                      {game.time}
                    </div>
                  </div>
                </div>

                {/* Venue Information */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">
                      Venue
                    </div>
                    <div className="text-base font-semibold text-gray-800">
                      {game.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}


      </div>
    </div>
  );
}
