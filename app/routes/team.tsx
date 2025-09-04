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
    { title: 'Team - Warriors' },
    { name: 'description', content: 'Combined team performance and player statistics' },
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
  const [activeTab, setActiveTab] = useState<'overview' | 'players'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Team</h1>
            <p className="text-sm md:text-base text-gray-600">Combined team performance and player statistics</p>
          </div>
        </div>
      </div>

      {/* Tabs (player-style) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav role="tablist" aria-label="Team sections" className="flex overflow-x-auto">
              <button
                id="overview-tab"
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 text-sm md:text-base font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>Team Performance</span>
              </button>
              <button
                id="players-tab"
                role="tab"
                aria-selected={activeTab === 'players'}
                onClick={() => setActiveTab('players')}
                className={`flex items-center gap-2 px-4 py-3 md:px-6 md:py-4 text-sm md:text-base font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                  activeTab === 'players'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>Player Stats</span>
              </button>
            </nav>
          </div>
          {/* Tab Panels Container Padding */}
          <div className="p-4 md:p-6">
            {/* Overview Tab Panel */}
            {activeTab === 'overview' && (
              <section role="tabpanel" aria-labelledby="overview-tab">
                <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-3 md:gap-0 mb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Team Overview</h2>
                    <p className="text-sm text-gray-600 mt-1">Key team metrics, special teams performance, and records</p>
                  </div>
                  <SeasonFilter selectedSeason={teamSeason} onSeasonChange={setTeamSeason} />
                </div>
                <TeamStatsCards selectedSeason={teamSeason} />
              </section>
            )}

            {/* Player Stats Tab Panel */}
            {activeTab === 'players' && (
              <section role="tabpanel" aria-labelledby="players-tab">
                {/* Filters Bar */}
                <div className="-mx-4 md:-mx-6 mb-4">
                  <div className="bg-white border-b shadow-sm">
                    <div className="px-4 md:px-6">
                      {/* Desktop filters */}
                      <div className="hidden md:block py-6">
                        <div className="flex items-center justify-center gap-8">
                          <SeasonFilter selectedSeason={playerSeason} onSeasonChange={setPlayerSeason} />
                          <GenericFilter<Position>
                            label="Position"
                            selectedValue={selectedPosition}
                            onValueChange={setSelectedPosition}
                            options={positionOptions}
                            placeholder="All Positions"
                          />
                          <GenericFilter<SortBy>
                            label="Sort By"
                            selectedValue={sortBy}
                            onValueChange={setSortBy}
                            options={sortOptions}
                            placeholder="Sort by Points"
                          />
                        </div>
                      </div>

                      {/* Mobile filters (collapsible) */}
                      <div className="md:hidden">
                        <div className="py-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">Player Stats</span>
                            <span className="text-xs text-gray-500">({playerSeason}, {positionOptions.find(p => p.value === selectedPosition)?.label})</span>
                          </div>
                          <button
                            onClick={() => setShowPlayerFilters(!showPlayerFilters)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                          >
                            <span>{showPlayerFilters ? 'Hide' : 'Show'}</span>
                            <svg className={`w-4 h-4 transition-transform duration-200 ${showPlayerFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        <div className={`transition-all duration-300 ease-in-out ${showPlayerFilters ? 'block opacity-100' : 'hidden opacity-0'}`}>
                          <div className="pb-6 space-y-4">
                            <SeasonFilter selectedSeason={playerSeason} onSeasonChange={setPlayerSeason} />
                            <GenericFilter<Position>
                              label="Position"
                              selectedValue={selectedPosition}
                              onValueChange={setSelectedPosition}
                              options={positionOptions}
                              placeholder="All Positions"
                            />
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
                </div>

                {/* Table */}
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Player Stats</h2>
                    <p className="text-sm text-gray-600 mt-1">Sort and filter individual player performance</p>
                  </div>
                  <PlayerStatsTable selectedSeason={playerSeason} selectedPosition={selectedPosition} sortBy={sortBy} />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* (Old panels removed in favor of card-contained panels above) */}
    </div>
  );
}
