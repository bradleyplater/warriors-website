import { useState } from 'react';

export type Season = '22/23' | '23/24' | '24/25' | 'overall';

interface SeasonFilterProps {
  selectedSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const seasons: { value: Season; label: string }[] = [
  { value: 'overall', label: 'Overall' },
  { value: '24/25', label: '24/25' },
  { value: '23/24', label: '23/24' },
  { value: '22/23', label: '22/23' },
];

export default function SeasonFilter({ selectedSeason, onSeasonChange }: SeasonFilterProps) {
  return (
    <div className="w-full px-4 mb-6">
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {seasons.map((season) => {
          const isSelected = selectedSeason === season.value;
          return (
            <button
              key={season.value}
              onClick={() => onSeasonChange(season.value)}
              className={`
                px-3 py-2 md:px-4 md:py-2.5 rounded-full text-sm md:text-base font-medium
                transition-all duration-200 ease-in-out
                border-2 min-w-[80px] md:min-w-[90px]
                ${
                  isSelected
                    ? 'bg-gray-600 text-white border-gray-600 shadow-md transform scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:text-gray-600 hover:shadow-sm hover:cursor-pointer'
                }
              `}
            >
              {season.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
