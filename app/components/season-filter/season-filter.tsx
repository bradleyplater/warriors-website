import GenericFilter, { type FilterOption } from '../generic-filter/generic-filter';

export type Season = '22/23' | '23/24' | '24/25' | '25/26' | 'overall';

interface SeasonFilterProps {
  selectedSeason: Season;
  onSeasonChange: (season: Season) => void;
}

// Helper function to sort seasons by first number in descending order
const sortSeasons = (seasons: FilterOption<Season>[]) => {
  return seasons.sort((a, b) => {
    // Always keep 'overall' at the top
    if (a.value === 'overall') return -1;
    if (b.value === 'overall') return 1;
    
    // Extract first number from each season (e.g., '24' from '24/25')
    const firstNumberA = parseInt(a.value.split('/')[0], 10);
    const firstNumberB = parseInt(b.value.split('/')[0], 10);
    
    // Sort in descending order (highest first)
    return firstNumberB - firstNumberA;
  });
};

// Define seasons and sort them
const seasonOptions: FilterOption<Season>[] = [
  { value: 'overall', label: 'Overall' },
  { value: '25/26', label: '25/26' },
  { value: '24/25', label: '24/25' },
  { value: '23/24', label: '23/24' },
  { value: '22/23', label: '22/23' },
];

const seasons = sortSeasons(seasonOptions);

export default function SeasonFilter({ selectedSeason, onSeasonChange }: SeasonFilterProps) {
  return (
    <GenericFilter<Season>
      label="Filter by Season"
      selectedValue={selectedSeason}
      onValueChange={onSeasonChange}
      options={seasons}
      placeholder="Overall"
    />
  );
}
