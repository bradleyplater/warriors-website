import { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import GenericLineChart from '../generic-line-chart/generic-line-chart';
import { getGoalsForOneGame, getAssistsForOneGame, getPimsForOneGame } from '~/helpers/game-helpers';

const PLAYER_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f43f5e'
];

export default function StatsCharts() {
  const { data } = useData();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [activeMetric, setActiveMetric] = useState<'points' | 'goals' | 'assists' | 'pims'>('points');
  const [viewMode, setViewMode] = useState<'season' | 'game'>('season');
  const [gameSeason, setGameSeason] = useState<string>('all');
  const [hoveredPlayerName, setHoveredPlayerName] = useState<string | null>(null);

  // 1. Get all unique seasons
  const seasons = useMemo(() => {
    const seasonSet = new Set<string>();
    data.team.stats.forEach(stat => seasonSet.add(stat.season));
    data.results.forEach(result => seasonSet.add(result.seasonId));
    seasonSet.delete('overall');
    return Array.from(seasonSet).sort();
  }, [data.team.stats, data.results]);

  // 2. Process player data for cumulative stats per season
  const playerStatsPerSeason = useMemo(() => {
    return data.players.map(player => {
      let cumulativeValue = 0;
      const seasonData = seasons.map(season => {
        const stat = player.stats.find(s => s.season === season);
        let value = 0;
        if (stat) {
          if (activeMetric === 'points') value = stat.points;
          else if (activeMetric === 'goals') value = stat.goals;
          else if (activeMetric === 'assists') value = stat.assists;
          else if (activeMetric === 'pims') value = stat.pims;
        }
        cumulativeValue += value;
        return {
          x: season,
          y: cumulativeValue
        };
      });

      return {
        id: player.id,
        name: player.name,
        data: seasonData,
        totalValue: cumulativeValue
      };
    })
    .filter(p => p.totalValue > 0)
    .sort((a, b) => b.totalValue - a.totalValue);
  }, [data.players, seasons, activeMetric]);

  // 3. Process player data for cumulative stats per game
  const playerStatsPerGame = useMemo(() => {
    // Sort all results by date
    const sortedResults = [...data.results].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const filteredResults = gameSeason === 'all' ? sortedResults : sortedResults.filter(r => r.seasonId === gameSeason);
    
    return data.players.map(player => {
      let cumulativeValue = 0;
      const gameData = filteredResults.map((result, index) => {
        const goals = getGoalsForOneGame(result, player.id);
        const assists = getAssistsForOneGame(result, player.id);
        const pims = getPimsForOneGame(result, player.id);
        
        let value = 0;
        if (activeMetric === 'points') value = goals + assists;
        else if (activeMetric === 'goals') value = goals;
        else if (activeMetric === 'assists') value = assists;
        else if (activeMetric === 'pims') value = pims;
        
        cumulativeValue += value;
        return {
          x: `G${index + 1}`,
          y: cumulativeValue,
          date: result.date,
          opponent: result.opponentTeam
        };
      });

      return {
        id: player.id,
        name: player.name,
        data: gameData,
        totalValue: cumulativeValue
      };
    })
    .filter(p => p.totalValue > 0)
    .sort((a, b) => b.totalValue - a.totalValue);
  }, [data.players, data.results, activeMetric, gameSeason]);

  const activeStatsData = viewMode === 'season' ? playerStatsPerSeason : playerStatsPerGame;

  // 4. Set initial selected players (all players)
  useMemo(() => {
    if (selectedPlayers.length === 0 && activeStatsData.length > 0) {
      setSelectedPlayers(activeStatsData.map(p => p.id));
    }
  }, [activeStatsData]);

  const chartLines = useMemo(() => {
    return activeStatsData
      .filter(p => selectedPlayers.includes(p.id))
      .map((p, index) => ({
        data: p.data,
        label: p.name,
        color: PLAYER_COLORS[index % PLAYER_COLORS.length],
        strokeWidth: viewMode === 'game' ? 2 : 3
      }));
  }, [activeStatsData, selectedPlayers, viewMode]);

  if (seasons.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 italic">
        No season data available to display charts.
      </div>
    );
  }

  const metricLabel = activeMetric === 'pims' ? 'PIMs' : activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1);

  return (
    <div className="space-y-8">
      {/* Controls Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        {/* Metric Switcher */}
        <div className="inline-flex p-1 bg-gray-100 rounded-2xl shadow-inner border border-gray-200">
          {(['points', 'goals', 'assists', 'pims'] as const).map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeMetric === metric
                  ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5 scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              {metric === 'pims' ? 'PIMs' : metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 bg-gray-100 rounded-2xl shadow-inner border border-gray-200">
          <button
            onClick={() => setViewMode('season')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              viewMode === 'season'
                ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5 scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
            }`}
          >
            By Season
          </button>
          <button
            onClick={() => setViewMode('game')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              viewMode === 'game'
                ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5 scale-[1.02]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
            }`}
          >
            By Game
          </button>
        </div>

        {/* Season Filter for Game View */}
        {viewMode === 'game' && (
          <div className="bg-gray-100 rounded-2xl shadow-inner border border-gray-200 px-3 py-2">
            <select
              value={gameSeason}
              onChange={(e) => setGameSeason(e.target.value)}
              className="bg-transparent text-xs font-bold text-gray-700 focus:outline-none"
            >
              <option value="all">All Seasons</option>
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Player Selection Sidebar */}
        <div className="w-full lg:w-1/5 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Players</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedPlayers([])}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setSelectedPlayers(activeStatsData.map(p => p.id))}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                >
                  All
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {activeStatsData.map((player, index) => {
                const isHovered = hoveredPlayerName === player.name;
                const isSelected = selectedPlayers.includes(player.id);
                
                return (
                  <button
                    key={player.id}
                    onMouseEnter={() => setHoveredPlayerName(player.name)}
                    onMouseLeave={() => setHoveredPlayerName(null)}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedPlayers(prev => prev.filter(id => id !== player.id));
                      } else {
                        setSelectedPlayers(prev => [...prev, player.id]);
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 group ${
                      isSelected
                        ? 'bg-white shadow-sm ring-1 ring-gray-200 translate-x-1'
                        : 'hover:bg-gray-100 opacity-40 grayscale'
                    } ${isHovered ? 'ring-2 ring-blue-500 ring-offset-1 scale-[1.02] z-10' : ''}`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ 
                        backgroundColor: isSelected 
                          ? PLAYER_COLORS[selectedPlayers.indexOf(player.id) % PLAYER_COLORS.length] 
                          : '#d1d5db' 
                      }}
                    ></div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className={`text-xs font-bold truncate w-full ${isHovered ? 'text-blue-600' : 'text-gray-900'}`}>
                        {player.name}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                        {player.totalValue} {activeMetric}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="w-full lg:w-4/5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  Cumulative {metricLabel} Progression
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {viewMode === 'season' 
                    ? `Visualizing career ${activeMetric} growth across seasons`
                    : `Visualizing career ${activeMetric} growth game-by-game`
                  }
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Data</span>
              </div>
            </div>
            
            {chartLines.length > 0 ? (
              <GenericLineChart
                data={[]}
                additionalLines={chartLines}
                xLabel={
                  viewMode === 'season'
                    ? 'Season'
                    : gameSeason === 'all'
                    ? 'Games Played'
                    : `Games Played (${gameSeason})`
                }
                yLabel={`Cumulative ${metricLabel}`}
                showLegend={true}
                showGrid={true}
                showPoints={viewMode === 'season'}
                showPointLabels={false}
                onHoverLine={setHoveredPlayerName}
                hoveredLineLabel={hoveredPlayerName}
                showEndLabels={true}
              />
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 gap-4">
                <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-bold text-lg">No players selected</p>
                <p className="text-sm opacity-60">Choose players from the list to see their stats</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
