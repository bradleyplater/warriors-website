import { useData, type DataContextType } from "../../contexts/DataContext";

interface LatestResultSpotlightProps {
    cardHeader: string;
    children: React.ReactNode;
  }
  
  export default function LatestResultSpotlight() {
    // const { data }: DataContextType = useData();

    // const latestResults = data.latestResults;

    // if (!latestResults || latestResults.length === 0) {
    //     return (
    //       <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-3 md:py-5 flex flex-col justify-center items-center overflow-hidden">
    //         <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 text-center">
    //           No upcoming games
    //         </div>
    //       </div>
    //     );
    //   }

    return (
      <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-2 md:py-3 flex flex-col justify-center items-center overflow-hidden">
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
              src="/images/team-logos/leeds-warriors.jpg" 
              alt="Leeds Warriors Logo" 
              className="hidden md:hidden lg:block h-10 w-10 lg:h-20 lg:w-20 object-contain mb-1"
            />
            <span className="text-xs md:text-sm font-medium text-gray-700 text-center">Leeds Warriors</span>
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
          {/* Home Team Score */}
          <div className="flex flex-col items-center flex-1 space-y-6">
            <span className="text-base md:text-sm lg:text-base font-semibold text-gray-800">4</span>
            <span className="text-xs md:text-sm lg:text-base font-medium text-gray-700">1 - 1</span>
          </div>
          
          {/* Separator */}
          <div className="flex-shrink-0 px-2 md:px-4 text-center flex flex-col space-y-6">
            <span className="text-base md:text-sm lg:text-base font-semibold text-gray-800">-</span>
            <div className="text-xs md:text-sm lg:text-base font-medium text-gray-700">2 - 2</div>
          </div>
          
          {/* Away Team Score */}
          <div className="flex flex-col items-center flex-1 space-y-6">
            <span className="text-base md:text-sm lg:text-base font-semibold text-gray-800">4</span>
            <span className="text-xs md:text-sm lg:text-base font-medium text-gray-700">1 - 1</span>
          </div>
        </div>
      </div>
    );
  }