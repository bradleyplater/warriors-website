import { useState } from 'react';
import type { Season } from '../components/season-filter/season-filter';
import SeasonFilter from '../components/season-filter/season-filter';
import GenericFilter, { type FilterOption } from '../components/generic-filter/generic-filter';
import PlayerStatsTable from '../components/player-stats-table/player-stats-table';
import type { Route } from '../+types/root';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Player Stats" },
  ];
}

export type Position = 'all' | 'forward' | 'defence' | 'goaltender';
export type SortBy = 'points' | 'goals' | 'assists' | 'games' | 'pointsPerGame';

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

export default function PlayerStats() {
  const [selectedSeason, setSelectedSeason] = useState<Season>('overall');
  const [selectedPosition, setSelectedPosition] = useState<Position>('all');
  const [sortBy, setSortBy] = useState<SortBy>('points');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Player Statistics
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Individual player performance across all seasons
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop: Always visible filters */}
          <div className="hidden md:block py-6">
            <div className="flex items-center justify-center gap-8">
              <SeasonFilter 
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
              />
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

          {/* Mobile: Collapsible filters */}
          <div className="md:hidden">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Filters & Sorting</span>
                <span className="text-xs text-gray-500">({selectedSeason}, {positionOptions.find(p => p.value === selectedPosition)?.label})</span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <span>{showFilters ? 'Hide' : 'Show'}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Filters Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="pb-6 space-y-4">
                <SeasonFilter 
                  selectedSeason={selectedSeason}
                  onSeasonChange={setSelectedSeason}
                />
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

      {/* Player Stats Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PlayerStatsTable 
          selectedSeason={selectedSeason}
          selectedPosition={selectedPosition}
          sortBy={sortBy}
        />
      </div>
    </div>
  );
}
