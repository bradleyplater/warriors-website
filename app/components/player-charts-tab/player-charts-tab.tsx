import GenericLineChart from '../generic-line-chart/generic-line-chart';

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

interface PlayerChartsTabProps {
  seasonStats: SeasonStats[];
  playerId: string;
}

export default function PlayerChartsTab({ seasonStats, playerId }: PlayerChartsTabProps) {
  // Prepare data for the line chart
  const chartData = seasonStats.map(season => ({
    x: season.season,
    y: season.points
  }));

  // Find max values for other charts
  const maxGoals = Math.max(...seasonStats.map(s => s.goals));
  const maxAssists = Math.max(...seasonStats.map(s => s.assists));

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Points Progression Chart */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Points Progression</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">Season-by-season point totals</p>
        </div>
        <div className="p-4 md:p-6">
          <GenericLineChart 
            data={chartData} 
            xLabel="Season" 
            yLabel="Points" 
            lineColor="#8b5cf6" 
            showAverage={true}
            averageColor="#ef4444"
            mainLineLabel="Season Points"
            averageLineLabel="Career Average"
            showLegend={true}
          />
        </div>
      </div>

      {/* Goals vs Assists Comparison */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Goals vs Assists by Season</h3>
        <div className="space-y-4">
          {seasonStats.map((season) => (
            <div key={season.season} className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-1">
                {season.season}
              </div>
              
              {/* Goals Bar */}
              <div className="flex items-center gap-4">
                <div className="w-12 text-xs text-gray-600">Goals</div>
                <div className="flex-1 relative">
                  <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                      style={{ width: `${(season.goals / maxGoals) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {season.goals}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Assists Bar */}
              <div className="flex items-center gap-4">
                <div className="w-12 text-xs text-gray-600">Assists</div>
                <div className="flex-1 relative">
                  <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out"
                      style={{ width: `${(season.assists / maxAssists) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {season.assists}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Penalty Minutes Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Penalty Minutes by Season</h3>
          <div className="space-y-3">
            {seasonStats.map((season) => (
              <div key={season.season} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {season.season}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-orange-100 text-orange-800">
                    {season.pim}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Teams Production */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Power Play Production</h3>
          <div className="space-y-3">
            {seasonStats.map((season) => (
              <div key={season.season} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {season.season}
                </span>
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    {season.powerPlayGoals} PP Goals
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Winning Goals & Short Handed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Winning Goals</h3>
          <div className="space-y-3">
            {seasonStats.map((season) => (
              <div key={season.season} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {season.season}
                </span>
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
                  {season.gameWinningGoals}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Short Handed Goals</h3>
          <div className="space-y-3">
            {seasonStats.map((season) => (
              <div key={season.season} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {season.season}
                </span>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                  {season.shortHandedGoals}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Note about future enhancements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Future Enhancements</h4>
            <p className="text-sm text-blue-700 mt-1">
              Interactive line charts, heat maps, and advanced analytics will be added to provide deeper insights into player performance trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
