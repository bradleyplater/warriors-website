import { useData, type DataContextType } from "../../contexts/DataContext";

interface UpcomingGameSpotlightProps {
    cardHeader: string;
    children: React.ReactNode;
  }
  
  export default function UpcomingGameSpotlight() {
    const { data }: DataContextType = useData();

    const upcomingGames = data.upcomingGames;

    if (!upcomingGames || upcomingGames.length === 0) {
        return (
          <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-3 md:py-5 flex flex-col justify-center items-center overflow-hidden">
            <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 text-center">
              No upcoming games
            </div>
          </div>
        );
      }

    return (
      <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-3 md:py-5 flex flex-col justify-center items-center overflow-hidden">
        {/* Game Type */}
        <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 text-center mb-2">
          {upcomingGames[0].gameType}
        </div>
        
        {/* Teams Section */}
        <div className="w-full flex flex-row justify-around items-center py-2 md:py-3">
          {/* Home Team */}
          <div className="flex flex-col items-center flex-1">
            <img 
              src="/images/warriors-logo-black.png" 
              alt="Warriors Logo" 
              className="hidden md:hidden lg:block h-10 w-10 lg:h-20 lg:w-20 object-contain mb-1"
            />
            <span className="text-xs md:text-sm font-medium text-gray-700 text-center">Warriors</span>
          </div>
          
          {/* VS */}
          <div className="flex-shrink-0 px-2 md:px-4">
            <span className="text-xs md:text-sm lg:text-base font-bold text-gray-600">VS</span>
          </div>
          
          {/* Away Team */}
          <div className="flex flex-col items-center flex-1">
            <img 
              src={`/images/team-logos/${upcomingGames[0].logoImage}`} 
              alt="Leeds Warriors Logo" 
              className="hidden md:hidden lg:block h-10 w-10 lg:h-20 lg:w-20 object-contain mb-1"
            />
            <span className="text-xs md:text-sm font-medium text-gray-700 text-center">{upcomingGames[0].opponentTeam}</span>
          </div>
        </div>
        
        {/* Game Details */}
        <div className="text-center space-y-1 mt-2">
          <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800">
            {upcomingGames[0].date}
          </div>
          <div className="text-xs md:text-sm lg:text-base font-medium text-gray-700">
            {upcomingGames[0].time}
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-600">
            @ {upcomingGames[0].location}
          </div>
        </div>
      </div>
    );
  }