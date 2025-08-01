interface SeasonStats {
  season: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  pim: number;
  powerPlayGoals: number;
  shortHandedGoals: number;
  gameWinningGoals: number;
}

interface PlayerStatsTabProps {
  seasonStats: SeasonStats[];
}

export default function PlayerStatsTab({ seasonStats }: PlayerStatsTabProps) {
  // Calculate career totals
  const careerTotals = seasonStats.reduce((totals, season) => ({
    gamesPlayed: totals.gamesPlayed + season.gamesPlayed,
    goals: totals.goals + season.goals,
    assists: totals.assists + season.assists,
    points: totals.points + season.points,
    pim: totals.pim + season.pim,
    powerPlayGoals: totals.powerPlayGoals + season.powerPlayGoals,
    shortHandedGoals: totals.shortHandedGoals + season.shortHandedGoals,
    gameWinningGoals: totals.gameWinningGoals + season.gameWinningGoals,
  }), {
    gamesPlayed: 0,
    goals: 0,
    assists: 0,
    points: 0,
    pim: 0,
    powerPlayGoals: 0,
    shortHandedGoals: 0,
    gameWinningGoals: 0,
  });

  // Removed plus/minus calculation as it's not trackable

  return (
    <div className="space-y-6">
      {/* Career Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-blue-700">
            {careerTotals.points}
          </div>
          <div className="text-sm text-blue-600 font-medium">Career Points</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-green-700">
            {careerTotals.goals}
          </div>
          <div className="text-sm text-green-600 font-medium">Career Goals</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-purple-700">
            {careerTotals.assists}
          </div>
          <div className="text-sm text-purple-600 font-medium">Career Assists</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-orange-700">
            {careerTotals.gamesPlayed}
          </div>
          <div className="text-sm text-orange-600 font-medium">Games Played</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-red-700">
            {careerTotals.powerPlayGoals}
          </div>
          <div className="text-sm text-red-600 font-medium">PP Goals</div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-indigo-700">
            {careerTotals.pim}
          </div>
          <div className="text-sm text-indigo-600 font-medium">Total PIM</div>
        </div>
      </div>

      {/* Season by Season Stats Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Season by Season Stats</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Season
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GP
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
                  PPG
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIM
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PP Goals
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SHG
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GWG
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {seasonStats.map((season, index) => (
                <tr key={season.season} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {season.season}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {season.gamesPlayed}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-green-700 font-medium">{season.goals}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-blue-700 font-medium">{season.assists}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-purple-700 font-bold">{season.points}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-blue-700 font-medium">
                      {season.gamesPlayed > 0 ? (season.points / season.gamesPlayed).toFixed(2) : '0.00'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-center">
                    {season.pim}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-red-700 font-medium">{season.powerPlayGoals}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-orange-700 font-medium">{season.shortHandedGoals}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className="text-indigo-700 font-medium">{season.gameWinningGoals}</span>
                  </td>
                </tr>
              ))}
              
              {/* Career Totals Row */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td className="px-4 py-3 text-sm font-bold text-blue-900">
                  CAREER
                </td>
                <td className="px-4 py-3 text-sm font-bold text-blue-900 text-center">
                  {careerTotals.gamesPlayed}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className="text-green-700 font-bold">{careerTotals.goals}</span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className="text-blue-700 font-bold">{careerTotals.assists}</span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className="text-purple-700 font-bold text-lg">{careerTotals.points}</span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className="text-blue-700 font-bold">
                    {careerTotals.gamesPlayed > 0 ? (careerTotals.points / careerTotals.gamesPlayed).toFixed(2) : '0.00'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-blue-900 text-center">
                  {careerTotals.pim}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className="text-red-700 font-bold">{careerTotals.powerPlayGoals}</span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className="text-orange-700 font-bold">{careerTotals.shortHandedGoals}</span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className="text-indigo-700 font-bold">{careerTotals.gameWinningGoals}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
