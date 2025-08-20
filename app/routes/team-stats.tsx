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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Team Performance
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Comprehensive statistics, records, and team achievements
            </p>
          </div>
        </div>
      </div>

      {/* Season Filter Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <SeasonFilter 
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
            />
          </div>
        </div>
      </div>

      {/* Team Stats Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <TeamStatsCards selectedSeason={selectedSeason} />
      </div>
    </div>
  );
}
