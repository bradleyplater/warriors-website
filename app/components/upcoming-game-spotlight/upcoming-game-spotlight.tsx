import { useData, type DataContextType } from "../../contexts/DataContext";
import TeamPanelSection from "../team-section/team-panel-section";

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

    const nextGame = upcomingGames[0];

    return (
      <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-3 md:py-5 flex flex-col justify-center items-center overflow-hidden">
        {/* Game Type */}
        <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 text-center mb-2">
          {nextGame.gameType}
        </div>
        
        {/* Teams Section */}
        <TeamPanelSection 
          opponentTeam={nextGame.opponentTeam}
          opponentLogoImage={nextGame.logoImage}
          className="py-2 md:py-3"
        />
        
        {/* Game Details */}
        <div className="text-center space-y-1 mt-2">
          <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800">
            {nextGame.date}
          </div>
          <div className="text-xs md:text-sm lg:text-base font-medium text-gray-700">
            {nextGame.time}
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-600">
            @ {nextGame.location}
          </div>
        </div>
      </div>
    );
  }