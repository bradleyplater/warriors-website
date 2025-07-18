import { useData, type DataContextType } from "../../contexts/DataContext";

interface LatestResultSpotlightProps {
    cardHeader: string;
    children: React.ReactNode;
  }
  
  export default function LatestResultSpotlight() {
    const { data }: DataContextType = useData();

    const results = data.results;

    const latestResult = results.length > 0 
      ? results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null;

    

    if (!latestResult) {
        return (
          <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-3 md:py-5 flex flex-col justify-center items-center overflow-hidden">
            <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 text-center">
              No results
            </div>
          </div>
        );
      }

      const calculatedResult = latestResult.score.warriorsScore - latestResult.score.opponentScore;

      const warriorsWon = latestResult.score.warriorsScore > latestResult.score.opponentScore;
      const opponentWon = latestResult.score.opponentScore > latestResult.score.warriorsScore;
      const isTie = latestResult.score.warriorsScore === latestResult.score.opponentScore;
      const baseBackgroundColor = isTie ? 'bg-gray-100' : warriorsWon ? 'bg-green-100' : 'bg-red-100';

    return (
      <div className={`${baseBackgroundColor} rounded-2xl h-full w-full shadow-inner py-2 md:py-3 flex flex-col justify-center items-center overflow-hidden`}>
        {/* Teams Section */}
        <div className="w-full flex flex-row justify-around items-center">
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
              src={`/images/team-logos/${latestResult.logoImage}`} 
              alt="Leeds Warriors Logo" 
              className="hidden md:hidden lg:block h-10 w-10 lg:h-20 lg:w-20 object-contain mb-1"
            />
            <span className="text-xs md:text-sm font-medium text-gray-700 text-center">{latestResult.opponentTeam}</span>
          </div>
        </div>
        
        {/* Separator Line */}
        <div className="w-full flex items-center my-3">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-xs text-gray-500 font-medium">FINAL</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        {/* Game Details - Aligned with teams */}
        <div className="w-full flex flex-row justify-around items-center">
          {/* Home Team Final Score */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-base md:text-sm lg:text-base font-semibold text-gray-800">{latestResult.score.warriorsScore}</span>
          </div>
          
          {/* Final Score Separator */}
          <div className="flex-shrink-0 px-2 md:px-4 text-center">
            <span className="text-base md:text-sm lg:text-base font-semibold text-gray-800">-</span>
          </div>
          
          {/* Away Team Final Score */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-base md:text-sm lg:text-base font-semibold text-gray-800">{latestResult.score.opponentScore}</span>
          </div>
        </div>

        {/* Period Separator */}
        <div className="w-full flex items-center my-2">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3 text-xs text-gray-500 font-medium">PERIOD SCORE</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Period Scores */}
        <div className="w-full flex flex-row justify-around items-center">
          {/* Home Team Period Score */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-xs md:text-sm lg:text-base font-medium text-gray-700">{latestResult.score.period.one.warriorsScore} - {latestResult.score.period.one.opponentScore}</span>
          </div>
          
          {/* Period Score Separator */}
          <div className="flex-shrink-0 px-2 md:px-4 text-center">
            <div className="text-xs md:text-sm lg:text-base font-medium text-gray-700">{latestResult.score.period.two.warriorsScore} - {latestResult.score.period.two.opponentScore}</div>
          </div>
          
          {/* Away Team Period Score */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-xs md:text-sm lg:text-base font-medium text-gray-700">{latestResult.score.period.three.warriorsScore} - {latestResult.score.period.three.opponentScore}</span>
          </div>
        </div>
      </div>
    );
  }