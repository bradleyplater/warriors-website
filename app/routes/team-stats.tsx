import { useState } from 'react';
import type { Season } from '../components/season-filter/season-filter';
import SeasonFilter from '../components/season-filter/season-filter';
import TeamStatsCards from '../components/team-stats-cards/team-stats-cards';
import type { Route } from '../+types/root';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Team Stats - Warriors" },
    { name: 'description', content: 'View comprehensive team statistics for the Warriors hockey team' },
  ];
}

export default function TeamStats() {
  const [selectedSeason, setSelectedSeason] = useState<Season>('overall');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Title */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Team Statistics
          </h1>
          <p className="text-sm md:text-base text-gray-600 text-center mt-2">
            Comprehensive team performance metrics and analytics
          </p>
        </div>
      </div>

      {/* Collapsible Filters Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Filters</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Stats Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TeamStatsCards selectedSeason={selectedSeason} />
      </div>
    </div>
  );
}
