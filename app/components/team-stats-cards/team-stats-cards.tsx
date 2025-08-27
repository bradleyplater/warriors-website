import { useData, type DataContextType, type Result, type TeamStat } from "../../contexts/DataContext";
import type { Season } from "../season-filter/season-filter";
import TeamRecords from "../team-records/team-records";

interface TeamStatsCardsProps {
  selectedSeason: Season;
}

interface TeamStatsData {
  title: string;
  value: number | string;
  category: "general" | "positive" | "negative" | "neutral";
  description?: string;
  supplementaryText?: string;
}

function getLast5(results: Result[], selectedSeason: Season) {
  const isOverall = selectedSeason === 'overall'

  const filteredResults = results.filter((result) => result.seasonId === selectedSeason || isOverall)
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const wins = filteredResults.filter((result) => result.score.warriorsScore > result.score.opponentScore).length
  const losses = filteredResults.filter((result) => result.score.warriorsScore < result.score.opponentScore).length
  const draws = filteredResults.filter((result) => result.score.warriorsScore === result.score.opponentScore).length

  return `${wins}-${losses}-${draws}`
}

function getResultType(result: Result): 'W' | 'D' | 'L' {
  const { warriorsScore, opponentScore } = result.score
  
  if (warriorsScore > opponentScore) return 'W'
  if (warriorsScore === opponentScore) return 'D'
  return 'L'
}

function getForm(results: Result[], selectedSeason: Season): string {
  const isOverall = selectedSeason === 'overall'

  const filteredResults = results
    .filter((result) => result.seasonId === selectedSeason || isOverall)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  if (filteredResults.length === 0) return 'N/A'
  
  const latestResultType = getResultType(filteredResults[0])
  
  // Count consecutive results of the same type
  let streak = 1
  for (let i = 1; i < filteredResults.length; i++) {
    if (getResultType(filteredResults[i]) === latestResultType) {
      streak++
    } else {
      break
    }
  }
  
  return `${latestResultType}${streak}`
} 

function getTeamStats(teamStats: TeamStat[], results: Result[], selectedSeason: Season): TeamStatsData[] {
  const isOverall = selectedSeason === 'overall'

  const filteredStats = teamStats.filter((stats) => stats.season === selectedSeason || isOverall)
  const filteredResults = results.filter((result) => result.seasonId === selectedSeason || isOverall)

  if(filteredStats.length === 0) {
    return [
      { title: "Games Played", value: "N/A", category: "general", description: "Total number of games played" },
      { title: "Goals For", value: "N/A", category: "general", description: "Total goals scored by the team" },
      { title: "Goals Against", value: "N/A", category: "general", description: "Total goals conceded by the team" },
      { title: "Goal Difference", value: "N/A", category: "general", description: "Goals for minus goals against" },
      { title: "Wins", value: "N/A", category: "general", description: "Total number of wins" },
      { title: "Draws", value: "N/A", category: "general", description: "Total number of draws" },
      { title: "Losses", value: "N/A", category: "general", description: "Total number of losses" },
      { title: "Win Percentage", value: "N/A", category: "general", description: "Percentage of games won" },
      { title: "Current Form", value: "N/A", category: "general", description: "Current winning/losing streak" },
      { title: "Last 5 Games", value: "N/A", category: "general", description: "Record in the last 5 games" },
      { title: "Goals Per Game", value: "N/A", category: "general", description: "Average goals scored per game" },
      { title: "Goals Conceded Per Game", value: "N/A", category: "general", description: "Average goals conceded per game" },
      { title: "Power Play %", value: "N/A", category: "general", description: "Power play success rate" },
      { title: "Penalty Kill %", value: "N/A", category: "general", description: "Penalty kill success rate" },
      { title: "Most Frequent Penalty", value: "N/A", category: "general", description: "Most common penalty type taken by the team" }
    ]
  }

  const gamesPlayed = isOverall ? filteredStats.reduce((total, stats) => total + stats.games, 0) : filteredStats[0].games ?? 0
  const goalsFor = isOverall ? filteredStats.reduce((total, stats) => total + stats.goalsFor, 0) : filteredStats[0].goalsFor ?? 0
  const goalsAgainst = isOverall ? filteredStats.reduce((total, stats) => total + stats.goalsAgainst, 0) : filteredStats[0].goalsAgainst ?? 0
  const wins = isOverall ? filteredStats.reduce((total, stats) => total + stats.wins, 0) : filteredStats[0].wins ?? 0
  const draws = isOverall ? filteredStats.reduce((total, stats) => total + stats.draws, 0) : filteredStats[0].draws ?? 0
  const losses = isOverall ? filteredStats.reduce((total, stats) => total + stats.losses, 0) : filteredStats[0].losses ?? 0
  
  const goalDifference = goalsFor - goalsAgainst
  const winPercentage = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0
  const goalsPerGame = gamesPlayed > 0 ? goalsFor / gamesPlayed : 0
  const goalsConcededPerGame = gamesPlayed > 0 ? goalsAgainst / gamesPlayed : 0

  const last5 = getLast5(results, selectedSeason)
  const form = getForm(results, selectedSeason)

  // Calculate penalty statistics
  let powerPlayGoals = 0
  let powerPlayGoalsAgainst = 0
  let totalOpponentPenalties = 0
  let totalWarriorsPenalties = 0
  const penaltyTypes: { [key: string]: number } = {}

  filteredResults.forEach(result => {
    const periods = [result.score.period.one, result.score.period.two, result.score.period.three]
    
    periods.forEach(period => {
      // Count our power play goals (PP type goals)
      powerPlayGoals += period.goals.filter(goal => goal.type === 'PP').length
      
      // Count opponent power play goals against us
      powerPlayGoalsAgainst += period.opponentGoals.filter(goal => goal.type === 'PP').length
      
      // Count opponent penalties (our power play opportunities)
      totalOpponentPenalties += period.opponentPenalties.length
      
      // Count our penalties (opponent power play opportunities)
      totalWarriorsPenalties += period.penalties.length
      
      // Track penalty types for most frequent penalty
      period.penalties.forEach(penalty => {
        const penaltyType = penalty.type
        penaltyTypes[penaltyType] = (penaltyTypes[penaltyType] || 0) + 1
      })
    })
  })

  // Calculate percentages
  const powerPlayPercentage = totalOpponentPenalties > 0 ? (powerPlayGoals / totalOpponentPenalties) * 100 : 0
  const penaltyKillPercentage = totalWarriorsPenalties > 0 ? ((totalWarriorsPenalties - powerPlayGoalsAgainst) / totalWarriorsPenalties) * 100 : 0
  
  // Find most frequent penalty
  let mostFrequentPenalty = 'N/A'
  let mostFrequentCount = 0
  
  Object.entries(penaltyTypes).forEach(([type, count]) => {
    if (count > mostFrequentCount) {
      mostFrequentCount = count
      mostFrequentPenalty = type
    }
  })

  return [
    { title: "Games Played", value: gamesPlayed, category: "general", description: "Total number of games played" },
    { title: "Goals For", value: goalsFor, category: "positive", description: "Total goals scored by the team" },
    { title: "Goals Against", value: goalsAgainst, category: "negative", description: "Total goals conceded by the team" },
    { title: "Goal Difference", value: goalDifference > 0 ? `+${goalDifference}` : goalDifference.toString(), category: goalDifference > 0 ? "positive" : goalDifference < 0 ? "negative" : "neutral", description: "Goals for minus goals against" },
    { title: "Wins", value: wins, category: "positive", description: "Total number of wins" },
    { title: "Draws", value: draws, category: "neutral", description: "Total number of draws" },
    { title: "Losses", value: losses, category: "negative", description: "Total number of losses" },
    { title: "Win Percentage", value: `${winPercentage.toFixed(1)}%`, category: winPercentage >= 50 ? 'positive' : 'negative', description: "Percentage of games won" },
    { title: "Current Form", value: form, category: form.includes('W') ? 'positive' : form.includes('L') ? 'negative' : 'neutral', description: "Current winning/losing streak" },
    { title: "Last 5 Games", value: last5, category: "general", description: "Record in the last 5 games (W-L-D)" },
    { title: "Goals Per Game", value: goalsPerGame.toFixed(1), category: goalsPerGame >= 3 ? "positive" : goalsPerGame >= 2 ? "neutral" : "negative", description: "Average goals scored per game" },
    { title: "Goals Conceded Per Game", value: goalsConcededPerGame.toFixed(1), category: goalsConcededPerGame <= 2 ? "positive" : goalsConcededPerGame <= 3 ? "neutral" : "negative", description: "Average goals conceded per game" },
    { title: "Power Play %", value: `${powerPlayPercentage.toFixed(1)}%`, category: powerPlayPercentage >= 20 ? "positive" : powerPlayPercentage >= 15 ? "neutral" : "negative", description: `Power play success rate (${powerPlayGoals}/${totalOpponentPenalties})`, supplementaryText: totalOpponentPenalties > 0 ? `${powerPlayGoals} Power Play goals in ${totalOpponentPenalties} opportunities` : "No power play opportunities" },
    { title: "Penalty Kill %", value: `${penaltyKillPercentage.toFixed(1)}%`, category: penaltyKillPercentage >= 80 ? "positive" : penaltyKillPercentage >= 70 ? "neutral" : "negative", description: `Penalty kill success rate (${totalWarriorsPenalties - powerPlayGoalsAgainst}/${totalWarriorsPenalties})`, supplementaryText: totalWarriorsPenalties > 0 ? `${totalWarriorsPenalties - powerPlayGoalsAgainst} penalties killed in ${totalWarriorsPenalties} penalties` : "No penalties taken" },
    { title: "Most Frequent Penalty", value: mostFrequentPenalty, category: "neutral", description: "Most common penalty type taken by the team", supplementaryText: mostFrequentCount > 0 ? `${mostFrequentCount} ${mostFrequentPenalty} penalties taken` : "No penalties taken" }
  ]
}

// Color scheme based on category
const getCardColors = (category: string) => {
  switch (category) {
    case 'positive':
      return 'bg-white border-green-200 hover:border-green-300';
    case 'negative':
      return 'bg-white border-red-200 hover:border-red-300';
    case 'neutral':
      return 'bg-white border-blue-200 hover:border-blue-300';
    default:
      return 'bg-white border-gray-200 hover:border-gray-300';
  }
};

const getTextColors = (category: string) => {
  switch (category) {
    case 'positive':
      return { value: 'text-green-700', title: 'text-green-600', description: 'text-green-500' };
    case 'negative':
      return { value: 'text-red-700', title: 'text-red-600', description: 'text-red-500' };
    case 'neutral':
      return { value: 'text-blue-700', title: 'text-blue-600', description: 'text-blue-500' };
    default:
      return { value: 'text-gray-700', title: 'text-gray-600', description: 'text-gray-500' };
  }
};

export default function TeamStatsCards({ selectedSeason }: TeamStatsCardsProps) {
  const { data }: DataContextType = useData();

  const teamStats = data.team.stats;
  const results = data.results;

  if (!teamStats || teamStats.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No team statistics available</div>
        <div className="text-gray-400 text-sm mt-2">Check back later for updated stats</div>
      </div>
    );
  }

  const statsData = getTeamStats(teamStats, results, selectedSeason);

  return (
    <div className="space-y-8">
      {/* Main Stats Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          Team Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {statsData.map((stat, index) => {
            const cardColors = getCardColors(stat.category);
            const textColors = getTextColors(stat.category);
            
            return (
              <div 
                key={index} 
                className={`${cardColors} border rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <div className="text-center">
                  <div className={`text-2xl md:text-3xl font-bold ${textColors.value} mb-2`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm md:text-base font-semibold ${textColors.title} mb-1`}>
                    {stat.title}
                  </div>
                  {stat.supplementaryText && (
                    <div className={`text-xs ${textColors.description} leading-tight`}>
                      {stat.supplementaryText}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Records Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          Team Records
        </h2>
        <TeamRecords selectedSeason={selectedSeason} />
      </div>

      {/* Another Placeholder Section */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          Historical Comparisons
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">Coming Soon</div>
          <div className="text-gray-500 text-sm">
            Season-over-season comparisons and historical performance data
          </div>
        </div>
      </div>
    </div>
  );
}
