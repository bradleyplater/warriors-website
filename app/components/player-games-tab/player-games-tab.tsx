import { useData, type Result } from "~/contexts/DataContext";
import ComingSoon from "../coming-soon/coming-soon";

interface RecentGame {
  date: string;
  opponent: string;
  result: string;
  goals: number;
  assists: number;
  points: number;
  teamPlusMinus: number;
  penaltyMinutes: number;
}

interface PlayerGamesTabProps {
  playerId: string;
}

const getRecentGames = (playerId: string, results: Result[]) => {
  return results.filter((game) => game.roster.includes(playerId))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);
}

function getRecentGoals(playerId: string, results: Result[]) {
  const periodOneGoals = results.reduce((total, result) => {
    const periodOneGoals = result.score.period.one.goals.filter(goal => goal.playerId === playerId);
    return total + periodOneGoals.length;
  }, 0);

  const periodTwoGoals = results.reduce((total, result) => {
    const periodTwoGoals = result.score.period.two.goals.filter(goal => goal.playerId === playerId);
    return total + periodTwoGoals.length;
  }, 0);

  const periodThreeGoals = results.reduce((total, result) => {
    const periodThreeGoals = result.score.period.three.goals.filter(goal => goal.playerId === playerId);
    return total + periodThreeGoals.length;
  }, 0);

  return periodOneGoals + periodTwoGoals + periodThreeGoals;
}

function getRecentAssists(playerId: string, results: Result[]) {
  const periodOneAssists = results.reduce((total, result) => {
    console.log('one goals', result.score.period.one.goals)

    const periodOneAssists = result.score.period.one.goals.filter(goal => goal.assists.includes(playerId));
    return total + periodOneAssists.length;
  }, 0);

  console.log('one: ', periodOneAssists)

  const periodTwoAssists = results.reduce((total, result) => {
    console.log('two goals', result.score.period.two.goals)

    const periodTwoAssists = result.score.period.two.goals.filter(goal => goal.assists.includes(playerId));
    return total + periodTwoAssists.length;
  }, 0);

  console.log('two', periodTwoAssists)

  const periodThreeAssists = results.reduce((total, result) => {
    console.log('three goals', result.score.period.three.goals)

    const periodThreeAssists = result.score.period.three.goals.filter(goal => goal.assists.includes(playerId));
    return total + periodThreeAssists.length;
  }, 0);

  console.log('three', periodThreeAssists)

  return periodOneAssists + periodTwoAssists + periodThreeAssists;
}

function getRecentPoints(recentGoals: number, recentAssists: number) {
  return recentGoals + recentAssists;
}

function getRecentPointPerGame(recentPoints: number, recentGames: Result[]) {
  return recentPoints / recentGames.length;
}

function getRecentWins(recentGames: Result[]) {
  return recentGames.filter((game) => game.score.warriorsScore > game.score.opponentScore).length;
}

function getRecentLosses(recentGames: Result[]) {
  return recentGames.filter((game) => game.score.warriorsScore < game.score.opponentScore).length;
}

function getGoalsForOneGame(game: Result, playerId: string) {

  const periodOneGoals = game.score.period.one.goals.filter(goal => goal.playerId === playerId).length;
  const periodTwoGoals = game.score.period.two.goals.filter(goal => goal.playerId === playerId).length;
  const periodThreeGoals = game.score.period.three.goals.filter(goal => goal.playerId === playerId).length;
  
  return periodOneGoals + periodTwoGoals + periodThreeGoals;
}

function getAssistsForOneGame(game: Result, playerId: string) {

  const periodOneAssists = game.score.period.one.goals.filter(goal => goal.assists.includes(playerId)).length;
  const periodTwoAssists = game.score.period.two.goals.filter(goal => goal.assists.includes(playerId)).length;
  const periodThreeAssists = game.score.period.three.goals.filter(goal => goal.assists.includes(playerId)).length;

  return periodOneAssists + periodTwoAssists + periodThreeAssists;
}

function getPimsForOneGame(game: Result, playerId: string) {
  const allPenalties = [
    ...game.score.period.one.penalties,
    ...game.score.period.two.penalties,
    ...game.score.period.three.penalties
  ];
  
  const playerPenalties = allPenalties.filter(penalty => penalty.offender === playerId);

  return playerPenalties.reduce((total, penalty) => total + penalty.duration, 0);
}

function mapRecentGames(recentGames: Result[], playerId: string) {

  recentGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return recentGames.map((game) => {
    
    const goals = getGoalsForOneGame(game, playerId);
    const assists = getAssistsForOneGame(game, playerId);
    const points = goals + assists;

    return {
      date: game.date,
      opponent: game.opponentTeam,
      result: game.score.warriorsScore > game.score.opponentScore ? 'W' : game.score.warriorsScore === game.score.opponentScore ? 'D' : 'L',
      goals: goals,
      assists: assists,
      points: points,
      teamPlusMinus: game.score.warriorsScore - game.score.opponentScore,
      penaltyMinutes: getPimsForOneGame(game, playerId),
    }
  });
}

export default function PlayerGamesTab({ playerId }: PlayerGamesTabProps) {
  const { data } = useData();

  const recentGames = getRecentGames(playerId, data.results);

  const recentGoals = getRecentGoals(playerId, recentGames);
  const recentAssists = getRecentAssists(playerId, recentGames);

  const recentPoints = getRecentPoints(recentGoals, recentAssists);
  const recentPPG = getRecentPointPerGame(recentPoints, recentGames);

    // Calculate recent performance stats
  const recentStats = {
    totalGoals: recentGoals,
    totalAssists: recentAssists,
    totalPoints: recentPoints,
    totalPointsPerGame: recentPPG,
    wins: getRecentWins(recentGames),
    losses: getRecentLosses(recentGames),
  };

  const mappedRecentGames = mapRecentGames(recentGames, playerId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getResultColor = (result: string) => {
    if (result.startsWith('W')) return 'text-green-700 bg-green-100';
    if (result.startsWith('L')) return 'text-red-700 bg-red-100';
    if (result.startsWith('D')) return 'text-gray-700 bg-gray-100';
    return 'text-yellow-700 bg-yellow-100';
  };


  return (
    <div className="space-y-6">
      {/* Recent Performance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-blue-700">
            {recentStats.totalPoints}
          </div>
          <div className="text-sm text-blue-600 font-medium">Points</div>
          <div className="text-xs text-blue-500">Last {recentGames.length} games</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-green-700">
            {recentStats.totalGoals}
          </div>
          <div className="text-sm text-green-600 font-medium">Goals</div>
          <div className="text-xs text-green-500">Last {recentGames.length} games</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-purple-700">
            {recentStats.totalAssists}
          </div>
          <div className="text-sm text-purple-600 font-medium">Assists</div>
          <div className="text-xs text-purple-500">Last {recentGames.length} games</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-orange-700">
            {recentStats.totalPointsPerGame.toFixed(2)}
          </div>
          <div className="text-sm text-orange-600 font-medium">Avg PPG</div>
          <div className="text-xs text-orange-500">Last {recentGames.length} games</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-green-700">
            {recentStats.wins}
          </div>
          <div className="text-sm text-green-600 font-medium">Wins</div>
          <div className="text-xs text-green-500">Team record</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-red-700">
            {recentStats.losses}
          </div>
          <div className="text-sm text-red-600 font-medium">Losses</div>
          <div className="text-xs text-red-500">Team record</div>
        </div>
      </div>

      {/* Recent Games Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Games</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opponent
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  G
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  A
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PTS
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team +/-
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mappedRecentGames.map((game, index) => (
                <tr 
                  key={`${game.date}-${game.opponent}`} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(game.date)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {game.opponent}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(game.result)}`}>
                      {game.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`font-medium ${game.goals > 0 ? 'text-green-700' : 'text-gray-600'}`}>
                      {game.goals}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`font-medium ${game.assists > 0 ? 'text-blue-700' : 'text-gray-600'}`}>
                      {game.assists}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`font-bold ${game.points > 0 ? 'text-purple-700' : 'text-gray-600'}`}>
                      {game.points}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`font-medium ${
                      game.teamPlusMinus > 0 
                        ? 'text-green-600' 
                        : game.teamPlusMinus < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                    }`}>
                      {game.teamPlusMinus > 0 ? '+' : ''}{game.teamPlusMinus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`${game.penaltyMinutes > 0 ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                      {game.penaltyMinutes}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
}
