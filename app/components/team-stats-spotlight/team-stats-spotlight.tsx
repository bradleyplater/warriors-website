import { useData, type DataContextType } from "../../contexts/DataContext";
import TeamPanelSection from "../team-section/team-panel-section";
  
  export default function TeamStatsSpotlight() {
    // const { data }: DataContextType = useData();

    // const results = data.results;

    // const latestResult = results.length > 0 
    //   ? results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    //   : null;

    

    // if (!latestResult) {
    //     return (
    //       <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-3 md:py-5 flex flex-col justify-center items-center overflow-hidden">
    //         <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 text-center">
    //           No results
    //         </div>
    //       </div>
    //     );
    //   }


      // const warriorsWon = latestResult.score.warriorsScore > latestResult.score.opponentScore;
      // const isTie = latestResult.score.warriorsScore === latestResult.score.opponentScore;
      // const baseBackgroundColor = isTie ? 'bg-gray-100' : warriorsWon ? 'bg-green-100' : 'bg-red-100';

    // Sample data with color categories - replace with actual data from context
    const statsData = [
      { title: "Games Played", value: 45, category: "general" },
      { title: "Goals For", value: 32, category: "positive" },
      { title: "Goals Against", value: 77, category: "negative" },
      { title: "Wins", value: 18, category: "positive" },
      { title: "Draws", value: 7, category: "neutral" },
      { title: "Losses", value: 3, category: "negative" },
      { title: "Form", value: "W2", category: "positive" },
      { title: "Win %", value: "40%", category: "neutral" },
      { title: "Last 5", value: "1-2-4", category: "general" }
    ];

    // Color scheme based on category
    const getCardColors = (category: string) => {
      switch (category) {
        case 'positive':
          return 'bg-gradient-to-br from-green-50 to-green-100 border-green-200';
        case 'negative':
          return 'bg-gradient-to-br from-red-50 to-red-100 border-red-200';
        case 'neutral':
          return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200';
        default:
          return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200';
      }
    };

    const getTextColors = (category: string) => {
      switch (category) {
        case 'positive':
          return { value: 'text-green-700', title: 'text-green-600' };
        case 'negative':
          return { value: 'text-red-700', title: 'text-red-600' };
        case 'neutral':
          return { value: 'text-blue-700', title: 'text-blue-600' };
        default:
          return { value: 'text-gray-700', title: 'text-gray-600' };
      }
    };

    return (
      <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-3 md:py-4 flex flex-col justify-center items-center">
        <div className="grid grid-cols-3 gap-2 md:gap-6 w-full max-w-sm md:max-w-md lg:max-w-lg px-3 md:px-4">
          {statsData.map((stat, index) => {
            const cardColors = getCardColors(stat.category);
            const textColors = getTextColors(stat.category);
            
            return (
              <div key={index} className={`${cardColors} border rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 shadow-md flex flex-col justify-center items-center min-h-[60px] md:min-h-[80px] lg:min-h-[90px] transition-all duration-200 hover:shadow-lg hover:scale-105`}>
                <span className={`text-lg sm:text-base md:text-xl lg:text-2xl font-bold ${textColors.value} text-center leading-tight`}>{stat.value}</span>
                <span className={`text-xs sm:text-[11px] md:text-sm font-medium ${textColors.title} text-center mt-1`}>{stat.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }