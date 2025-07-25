import GenericFilter, { type FilterOption } from '../generic-filter/generic-filter';

export type Season = '22/23' | '23/24' | '24/25' | '25/26' | 'overall';

interface SeasonFilterProps {
  selectedSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const seasons: FilterOption<Season>[] = [
  { value: 'overall', label: 'Overall' },
  { value: '25/26', label: '25/26' },
  { value: '24/25', label: '24/25' },
  { value: '23/24', label: '23/24' },
  { value: '22/23', label: '22/23' },
];

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
