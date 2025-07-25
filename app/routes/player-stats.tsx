import { useState } from 'react';
import type { Season } from '../components/season-filter/season-filter';
import SeasonFilter from '../components/season-filter/season-filter';
import PlayerStatsTable from '../components/player-stats-table/player-stats-table';

export default function PlayerStats() {
  const [selectedSeason, setSelectedSeason] = useState<Season>('overall');

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

      {/* Filters Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-4 py-4">
            <SeasonFilter 
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
            />
            {/* Additional filters can be added here later */}
          </div>
        </div>
      </div>

      {/* Player Stats Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PlayerStatsTable selectedSeason={selectedSeason} />
      </div>
    </div>
  );
}
