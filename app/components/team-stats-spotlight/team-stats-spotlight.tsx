import { useData, type DataContextType, type TeamStat } from "../../contexts/DataContext";
import type { IStatSpotlightProps } from "../goals-spotlight/goals-spotlight";
import type { Season } from "../season-filter/season-filter";
  
interface TeamStatsData {
  title: string;
  value: number | string;
  category: "general" | "positive" | "negative" | "neutral";
}

function getLast5() {

}

function getForm() {

}

function getTeamStats(teamStats: TeamStat[], selectedSeason: Season): TeamStatsData[] {
  const isOverall = selectedSeason === 'overall'

  const filteredStats = teamStats.filter((stats) => stats.season === selectedSeason || isOverall)

  if(filteredStats.length === 0) {
    return [
      { title: "Games Played", value: "N/A", category: "general" },
      { title: "Goals For", value: "N/A", category: "general" },
      { title: "Goals Against", value: "N/A", category: "general" },
      { title: "Wins", value: "N/A", category: "general" },
      { title: "Draws", value: "N/A", category: "general" },
      { title: "Losses", value: "N/A", category: "general" },
      { title: "Form", value: "N/A", category: "general" },
      { title: "Win %", value: "N/A", category: "general" },
      { title: "Last 5", value: "N/A", category: "general" }]
  }

  const gamePlayed = isOverall ? filteredStats.reduce((total, stats) => total + stats.games, 0) : filteredStats[0].games ?? 0
  const goalsFor = isOverall ? filteredStats.reduce((total, stats) => total + stats.goalsFor, 0) : filteredStats[0].goalsFor ?? 0
  const goalsAgainst = isOverall ? filteredStats.reduce((total, stats) => total + stats.goalsAgainst, 0) : filteredStats[0].goalsAgainst ?? 0
  const wins = isOverall ? filteredStats.reduce((total, stats) => total + stats.wins, 0) : filteredStats[0].wins ?? 0
  const draws = isOverall ? filteredStats.reduce((total, stats) => total + stats.draws, 0) : filteredStats[0].draws ?? 0
  const losses = isOverall ? filteredStats.reduce((total, stats) => total + stats.losses, 0) : filteredStats[0].losses ?? 0
  const winPercentage = isOverall ? (wins / gamePlayed) * 100 : (filteredStats[0].wins / filteredStats[0].games) * 100

  return [
    { title: "Games Played", value: gamePlayed, category: "general" },
    { title: "Goals For", value: goalsFor, category: "positive" },
    { title: "Goals Against", value: goalsAgainst, category: "negative" },
    { title: "Wins", value: wins, category: "positive" },
    { title: "Draws", value: draws, category: "neutral" },
    { title: "Losses", value: losses, category: "negative" },
    { title: "Form", value: "W2", category: "positive" },
    { title: "Win %", value: `${winPercentage.toFixed(1)}%`, category: "neutral" },
    { title: "Last 5", value: "1-1-1", category: "general" }
  ]
}

export default function TeamStatsSpotlight({selectedSeason}: IStatSpotlightProps) {
    const { data }: DataContextType = useData();

    const teamStats = data.team.stats;

    if (!teamStats || teamStats.length === 0) {
      return (
        <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-3 md:py-5 flex flex-col justify-center items-center overflow-hidden">
          <div className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 text-center">
            No team stats
          </div>
        </div>
      );
    }



    // Sample data with color categories - replace with actual data from context
    const statsData = getTeamStats(teamStats, selectedSeason);

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