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
      {/* Page Title */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Player Stats
          </h1>
        </div>
      </div>

      {/* Collapsible Filters Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filters</span>
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
          
          {/* Filters Content */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } md:max-h-none md:opacity-100`}>
            <div className="pb-6 md:py-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                {/* Season Filter */}
                <div className="w-full md:w-auto">
                  <SeasonFilter 
                    selectedSeason={selectedSeason}
                    onSeasonChange={setSelectedSeason}
                  />
                </div>
                
                {/* Position Filter */}
                <div className="w-full md:w-auto">
                  <GenericFilter<Position>
                    label="Filter by Position"
                    selectedValue={selectedPosition}
                    onValueChange={setSelectedPosition}
                    options={positionOptions}
                    placeholder="All Positions"
                    className="mb-0"
                  />
                </div>
                
                {/* Sort Filter */}
                <div className="w-full md:w-auto">
                  <GenericFilter<SortBy>
                    label="Sort by"
                    selectedValue={sortBy}
                    onValueChange={setSortBy}
                    options={sortOptions}
                    placeholder="Points"
                    className="mb-0"
                  />
                </div>
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
