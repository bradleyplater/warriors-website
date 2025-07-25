import { useState } from 'react';

export type Season = '22/23' | '23/24' | '24/25' | '25/26' | 'overall';

interface SeasonFilterProps {
  selectedSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const seasons: { value: Season; label: string }[] = [
  { value: 'overall', label: 'Overall' },
  { value: '25/26', label: '25/26' },
  { value: '24/25', label: '24/25' },
  { value: '23/24', label: '23/24' },
  { value: '22/23', label: '22/23' },
];

export default function SeasonFilter({ selectedSeason, onSeasonChange }: SeasonFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedSeasonLabel = seasons.find(season => season.value === selectedSeason)?.label || 'Overall';

  return (
    <div className="w-full px-4 mb-6">
      <div className="flex justify-center">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Filter by Season
          </label>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="
              flex items-center justify-between
              px-4 py-2 md:px-6 md:py-3
              bg-white border-2 border-gray-300
              rounded-lg shadow-sm
              text-sm md:text-base font-medium text-gray-700
              hover:border-gray-400 hover:shadow-md hover:cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500
              transition-all duration-200 ease-in-out
              min-w-[120px] md:min-w-[140px]
            "
          >
            <span>{selectedSeasonLabel}</span>
            <svg
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="
              absolute top-full left-0 mt-1 w-full
              bg-white border border-gray-300 rounded-lg shadow-lg
              z-10
            ">
              {seasons.map((season) => (
                <button
                  key={season.value}
                  onClick={() => {
                    onSeasonChange(season.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm md:text-base
                    hover:bg-gray-50 transition-colors duration-150
                    first:rounded-t-lg last:rounded-b-lg
                    ${
                      selectedSeason === season.value
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-700'
                    }
                  `}
                >
                  {season.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
