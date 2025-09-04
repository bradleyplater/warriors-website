import { useState } from 'react';
import type { Season } from '../components/season-filter/season-filter';
import SeasonFilter from '../components/season-filter/season-filter';
import TeamStatsCards from '../components/team-stats-cards/team-stats-cards';
import PlayerStatsTable from '../components/player-stats-table/player-stats-table';
import GenericFilter, { type FilterOption } from '../components/generic-filter/generic-filter';
import type { Route } from '../+types/root';
// Local type definitions for player filters
export type Position = 'all' | 'forward' | 'defence' | 'goaltender';
export type SortBy = 'points' | 'goals' | 'assists' | 'games' | 'pointsPerGame';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Team Overview - Warriors' },
    { name: 'description', content: 'Comprehensive team performance metrics and individual player statistics' },
  ];
}

const positionOptions: FilterOption<Position>[] = [
  { value: 'all', label: 'All Positions' },
  { value: 'forward', label: 'Forward' },
  { value: 'defence', label: 'Defence' },
  { value: 'goaltender', label: 'Goaltender' },
];

const sortOptions: FilterOption<SortBy>[] = [
  { value: 'points', label: 'Points' },
  { value: 'goals', label: 'Goals' },
  { value: 'assists', label: 'Assists' },
  { value: 'pointsPerGame', label: 'Points/Game' },
  { value: 'games', label: 'Games Played' },
];

export default function Team() {
  // Independent, contextual filters per section (preferred UX pattern in this project)
  const [teamSeason, setTeamSeason] = useState<Season>('24/25');

  const [playerSeason, setPlayerSeason] = useState<Season>('overall');
  const [selectedPosition, setSelectedPosition] = useState<Position>('all');
  const [sortBy, setSortBy] = useState<SortBy>('points');
  const [showPlayerFilters, setShowPlayerFilters] = useState(false);
  const [activeSection, setActiveSection] = useState<'team' | 'players'>('team');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Modern Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🏒</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                Team Overview
              </h1>
            </div>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Comprehensive performance analytics and individual player statistics
            </p>
          </div>
        </div>
      </div>

      {/* Modern Section Navigation */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="p-2">
            <nav role="tablist" aria-label="Team sections" className="flex gap-2">
              <button
                id="team-tab"
                role="tab"
                aria-selected={activeSection === 'team'}
                onClick={() => setActiveSection('team')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm md:text-base font-semibold rounded-xl transition-all duration-300 ${
                  activeSection === 'team'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <div className="text-left">
                  <div className="font-bold">Team Analytics</div>
                  <div className="text-xs opacity-80">Performance & Records</div>
                </div>
              </button>
              <button
                id="players-tab"
                role="tab"
                aria-selected={activeSection === 'players'}
                onClick={() => setActiveSection('players')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm md:text-base font-semibold rounded-xl transition-all duration-300 ${
                  activeSection === 'players'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div className="text-left">
                  <div className="font-bold">Player Statistics</div>
                  <div className="text-xs opacity-80">Individual Performance</div>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>
      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Team Analytics Section */}
        {activeSection === 'team' && (
          <section role="tabpanel" aria-labelledby="team-tab" className="space-y-8">
            {/* Team Section Header */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 md:p-8">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">🏒</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Team Analytics
                    </h2>
                    <p className="text-gray-600 mt-1">Performance metrics, special teams, and franchise records</p>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                  <SeasonFilter selectedSeason={teamSeason} onSeasonChange={setTeamSeason} />
                </div>
              </div>
            </div>
            
            {/* Team Stats Content */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 md:p-8">
              <TeamStatsCards selectedSeason={teamSeason} />
            </div>
          </section>
        )}

        {/* Player Statistics Section */}
        {activeSection === 'players' && (
          <section role="tabpanel" aria-labelledby="players-tab" className="space-y-8">
            {/* Player Section Header */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 md:p-8">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">👥</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Player Statistics
                    </h2>
                    <p className="text-gray-600 mt-1">Individual performance metrics and statistical analysis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
              {/* Desktop filters */}
              <div className="hidden md:block">
                <div className="flex items-center justify-center gap-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                    <SeasonFilter selectedSeason={playerSeason} onSeasonChange={setPlayerSeason} />
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                    <GenericFilter<Position>
                      label="Position"
                      selectedValue={selectedPosition}
                      onValueChange={setSelectedPosition}
                      options={positionOptions}
                      placeholder="All Positions"
                    />
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                    <GenericFilter<SortBy>
                      label="Sort By"
                      selectedValue={sortBy}
                      onValueChange={setSortBy}
                      options={sortOptions}
                      placeholder="Sort by Points"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile filters (collapsible) */}
              <div className="md:hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Filters</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {playerSeason}, {positionOptions.find(p => p.value === selectedPosition)?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPlayerFilters(!showPlayerFilters)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
                  >
                    <span>{showPlayerFilters ? 'Hide' : 'Show'}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showPlayerFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showPlayerFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                      <SeasonFilter selectedSeason={playerSeason} onSeasonChange={setPlayerSeason} />
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                      <GenericFilter<Position>
                        label="Position"
                        selectedValue={selectedPosition}
                        onValueChange={setSelectedPosition}
                        options={positionOptions}
                        placeholder="All Positions"
                      />
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                      <GenericFilter<SortBy>
                        label="Sort By"
                        selectedValue={sortBy}
                        onValueChange={setSortBy}
                        options={sortOptions}
                        placeholder="Sort by Points"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Player Table */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <PlayerStatsTable selectedSeason={playerSeason} selectedPosition={selectedPosition} sortBy={sortBy} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
