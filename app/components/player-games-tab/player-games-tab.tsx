interface RecentGame {
  date: string;
  opponent: string;
  result: string;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  shots: number;
  timeOnIce: string;
}

interface PlayerGamesTabProps {
  recentGames: RecentGame[];
}

export default function PlayerGamesTab({ recentGames }: PlayerGamesTabProps) {
  // Calculate recent performance stats
  const recentStats = recentGames.reduce((stats, game) => ({
    totalGoals: stats.totalGoals + game.goals,
    totalAssists: stats.totalAssists + game.assists,
    totalPoints: stats.totalPoints + game.points,
    totalShots: stats.totalShots + game.shots,
    wins: stats.wins + (game.result.startsWith('W') ? 1 : 0),
    losses: stats.losses + (game.result.startsWith('L') ? 1 : 0),
  }), {
    totalGoals: 0,
    totalAssists: 0,
    totalPoints: 0,
    totalShots: 0,
    wins: 0,
    losses: 0,
  });

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
            {recentStats.totalShots}
          </div>
          <div className="text-sm text-orange-600 font-medium">Shots</div>
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
                  +/-
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SOG
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TOI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentGames.map((game, index) => (
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(game.result)}`}>
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
                      game.plusMinus > 0 
                        ? 'text-green-600' 
                        : game.plusMinus < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                    }`}>
                      {game.plusMinus > 0 ? '+' : ''}{game.plusMinus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {game.shots}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center font-mono">
                    {game.timeOnIce}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shooting Efficiency</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Shots:</span>
              <span className="font-semibold text-gray-900">{recentStats.totalShots}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Goals:</span>
              <span className="font-semibold text-green-700">{recentStats.totalGoals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shooting %:</span>
              <span className="font-bold text-blue-700">
                {recentStats.totalShots > 0 
                  ? ((recentStats.totalGoals / recentStats.totalShots) * 100).toFixed(1)
                  : '0.0'
                }%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Form</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Points per Game:</span>
              <span className="font-bold text-purple-700">
                {recentGames.length > 0 
                  ? (recentStats.totalPoints / recentGames.length).toFixed(2)
                  : '0.00'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Goals per Game:</span>
              <span className="font-semibold text-green-700">
                {recentGames.length > 0 
                  ? (recentStats.totalGoals / recentGames.length).toFixed(2)
                  : '0.00'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assists per Game:</span>
              <span className="font-semibold text-blue-700">
                {recentGames.length > 0 
                  ? (recentStats.totalAssists / recentGames.length).toFixed(2)
                  : '0.00'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
