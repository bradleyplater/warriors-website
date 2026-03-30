import { useState } from 'react';
import type { Season } from '../components/season-filter/season-filter';
import SeasonFilter from '../components/season-filter/season-filter';
import TeamStatsCards from '../components/team-stats-cards/team-stats-cards';
import PlayerStatsTable from '../components/player-stats-table/player-stats-table';
import StatsCharts from '../components/stats-charts/stats-charts';
import GenericFilter, { type FilterOption } from '../components/generic-filter/generic-filter';
import type { Route } from '../+types/root';
// Local type definitions for player filters
export type Position = 'all' | 'forward' | 'defence' | 'goaltender';
export type Competition = 'all' | 'LLIHC' | 'BOTBC' | 'Challenge';
export type SortBy = 'points' | 'goals' | 'assists' | 'games' | 'pointsPerGame' | 'motm' | 'wotg' | 'gaa' | 'goalsAgainst';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Team Overview - Warriors' },
    { name: 'description', content: 'Comprehensive team performance metrics and individual player statistics' },
  ];
}

const positionOptions: FilterOption<Position>[] = [
  { value: 'all', label: 'All Positions' },
  { value: 'forward', label: 'Forward' },
  { value: 'defence', label: 'Defence' },
  { value: 'goaltender', label: 'Goaltender' },
];

const competitionOptions: FilterOption<Competition>[] = [
  { value: 'all', label: 'All Competitions' },
  { value: 'LLIHC', label: 'LLIHC' },
  { value: 'BOTBC', label: 'BOTBC' },
  { value: 'Challenge', label: 'Challenge' },
];

const sortOptions: FilterOption<SortBy>[] = [
  { value: 'points', label: 'Points' },
  { value: 'goals', label: 'Goals' },
  { value: 'assists', label: 'Assists' },
  { value: 'pointsPerGame', label: 'Points/Game' },
  { value: 'games', label: 'Games Played' },
  { value: 'motm', label: 'MOTM' },
  { value: 'wotg', label: 'WOTG' },
];

const goalieSortOptions: FilterOption<SortBy>[] = [
  { value: 'gaa', label: 'GAA' },
  { value: 'goalsAgainst', label: 'Goals Against' },
  { value: 'games', label: 'Games Played' },
];

export default function Team() {
  // Independent, contextual filters per section (preferred UX pattern in this project)
  const [teamSeason, setTeamSeason] = useState<Season>('24/25');

  const [playerSeason, setPlayerSeason] = useState<Season>('overall');
  const [selectedPosition, setSelectedPosition] = useState<Position>('all');
  const [selectedCompetition, setSelectedCompetition] = useState<Competition>('all');
  const [sortBy, setSortBy] = useState<SortBy>('points');
  const [showPlayerFilters, setShowPlayerFilters] = useState(false);

  const [goalieSeason, setGoalieSeason] = useState<Season>('overall');
  const [goalieCompetition, setGoalieCompetition] = useState<Competition>('all');
  const [goalieSortBy, setGoalieSortBy] = useState<SortBy>('gaa');
  const [showGoalieFilters, setShowGoalieFilters] = useState(false);

  const [activeSection, setActiveSection] = useState<'team' | 'players' | 'goalies' | 'charts'>('team');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Modern Hero Header */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                Team Overview
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Comprehensive performance analytics and individual player statistics
            </p>
          </div>
        </div>
      </div>

      {/* Modern Section Navigation */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
          <div className="p-2">
            <nav role="tablist" aria-label="Team sections" className="grid grid-cols-2 gap-2 md:flex md:gap-2">
              <button
                id="team-tab"
                role="tab"
                aria-selected={activeSection === 'team'}
                onClick={() => setActiveSection('team')}
                className={`w-full flex items-center justify-center px-4 py-3 text-sm md:px-6 md:py-4 md:text-base font-semibold rounded-xl transition-all duration-300 ${
                  activeSection === 'team'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100'
                }`}
              >
                <div className="text-center md:text-left">
                  <div className="font-bold">Team Analytics</div>
                  <div className="hidden sm:block text-xs opacity-80">Performance & Records</div>
                </div>
              </button>
              <button
                id="players-tab"
                role="tab"
                aria-selected={activeSection === 'players'}
                onClick={() => setActiveSection('players')}
                className={`w-full flex items-center justify-center px-4 py-3 text-sm md:px-6 md:py-4 md:text-base font-semibold rounded-xl transition-all duration-300 ${
                  activeSection === 'players'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100'
                }`}
              >
                <div className="text-center md:text-left">
                  <div className="font-bold">Player Statistics</div>
                  <div className="hidden sm:block text-xs opacity-80">Individual Performance</div>
                </div>
              </button>
              <button
                id="goalies-tab"
                role="tab"
                aria-selected={activeSection === 'goalies'}
                onClick={() => setActiveSection('goalies')}
                className={`w-full flex items-center justify-center px-4 py-3 text-sm md:px-6 md:py-4 md:text-base font-semibold rounded-xl transition-all duration-300 ${
                  activeSection === 'goalies'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100'
                }`}
              >
                <div className="text-center md:text-left">
                  <div className="font-bold">Goalie Statistics</div>
                  <div className="hidden sm:block text-xs opacity-80">Netminder Performance</div>
                </div>
              </button>
              <button
                id="charts-tab"
                role="tab"
                aria-selected={activeSection === 'charts'}
                onClick={() => setActiveSection('charts')}
                className={`w-full flex items-center justify-center px-4 py-3 text-sm md:px-6 md:py-4 md:text-base font-semibold rounded-xl transition-all duration-300 ${
                  activeSection === 'charts'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100'
                }`}
              >
                <div className="text-center md:text-left">
                  <div className="font-bold">Statistics Charts</div>
                  <div className="hidden sm:block text-xs opacity-80">Visual Performance Data</div>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>
      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Team Analytics Section */}
        {activeSection === 'team' && (
          <section role="tabpanel" aria-labelledby="team-tab" className="space-y-8">
            {/* Team Section Header */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    Team Analytics
                  </h2>
                  <p className="text-gray-600 mt-1">Performance metrics, special teams, and franchise records</p>
                </div>
              </div>
            </div>

            {/* Team Filters Panel */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 relative z-40">
              <div className="flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                  <SeasonFilter selectedSeason={teamSeason} onSeasonChange={setTeamSeason} />
                </div>
              </div>
            </div>
            
            {/* Team Stats Content */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <TeamStatsCards selectedSeason={teamSeason} />
            </div>
          </section>
        )}

        {/* Player Statistics Section */}
        {activeSection === 'players' && (
          <section role="tabpanel" aria-labelledby="players-tab" className="space-y-8">
            {/* Player Section Header */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-black">
                      Player Statistics
                    </h2>
                    <p className="text-gray-600 mt-1">Individual performance metrics and statistical analysis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 relative z-40">
              {/* Desktop filters */}
              <div className="hidden md:block">
                <div className="flex items-center justify-center gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                    <SeasonFilter selectedSeason={playerSeason} onSeasonChange={setPlayerSeason} />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                    <GenericFilter<Position>
                      label="Position"
                      selectedValue={selectedPosition}
                      onValueChange={setSelectedPosition}
                      options={positionOptions}
                      placeholder="All Positions"
                    />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                    <GenericFilter<Competition>
                      label="Competition"
                      selectedValue={selectedCompetition}
                      onValueChange={setSelectedCompetition}
                      options={competitionOptions}
                      placeholder="All Competitions"
                    />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
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

              {/* Mobile filters (collapsible) */}
              <div className="md:hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Filters</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {playerSeason}, {positionOptions.find(p => p.value === selectedPosition)?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPlayerFilters(!showPlayerFilters)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
                  >
                    <span>{showPlayerFilters ? 'Hide' : 'Show'}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showPlayerFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showPlayerFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                      <SeasonFilter selectedSeason={playerSeason} onSeasonChange={setPlayerSeason} />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                      <GenericFilter<Position>
                        label="Position"
                        selectedValue={selectedPosition}
                        onValueChange={setSelectedPosition}
                        options={positionOptions}
                        placeholder="All Positions"
                      />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                      <GenericFilter<Competition>
                        label="Competition"
                        selectedValue={selectedCompetition}
                        onValueChange={setSelectedCompetition}
                        options={competitionOptions}
                        placeholder="All Competitions"
                      />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
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

            {/* Player Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative z-10">
              <PlayerStatsTable selectedSeason={playerSeason} selectedPosition={selectedPosition} selectedCompetition={selectedCompetition} sortBy={sortBy} />
            </div>
          </section>
        )}

        {/* Goalie Statistics Section */}
        {activeSection === 'goalies' && (
          <section role="tabpanel" aria-labelledby="goalies-tab" className="space-y-8">
            {/* Goalie Section Header */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4 md:gap-0">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-black">
                      Goalie Statistics
                    </h2>
                    <p className="text-gray-600 mt-1">Netminder performance metrics and Goals Against Average analysis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 relative z-40">
              {/* Desktop filters */}
              <div className="hidden md:block">
                <div className="flex items-center justify-center gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                    <SeasonFilter selectedSeason={goalieSeason} onSeasonChange={setGoalieSeason} />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                    <GenericFilter<Competition>
                      label="Competition"
                      selectedValue={goalieCompetition}
                      onValueChange={setGoalieCompetition}
                      options={competitionOptions}
                      placeholder="All Competitions"
                    />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                    <GenericFilter<SortBy>
                      label="Sort By"
                      selectedValue={goalieSortBy}
                      onValueChange={setGoalieSortBy}
                      options={goalieSortOptions}
                      placeholder="Sort by GAA"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile filters (collapsible) */}
              <div className="md:hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Filters</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {goalieSeason}, {goalieCompetition}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGoalieFilters(!showGoalieFilters)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
                  >
                    <span>{showGoalieFilters ? 'Hide' : 'Show'}</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${showGoalieFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showGoalieFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                      <SeasonFilter selectedSeason={goalieSeason} onSeasonChange={setGoalieSeason} />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                      <GenericFilter<Competition>
                        label="Competition"
                        selectedValue={goalieCompetition}
                        onValueChange={setGoalieCompetition}
                        options={competitionOptions}
                        placeholder="All Competitions"
                      />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200 relative z-50">
                      <GenericFilter<SortBy>
                        label="Sort By"
                        selectedValue={goalieSortBy}
                        onValueChange={setGoalieSortBy}
                        options={goalieSortOptions}
                        placeholder="Sort by GAA"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Goalie Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative z-10">
              <PlayerStatsTable selectedSeason={goalieSeason} selectedPosition="goaltender" selectedCompetition={goalieCompetition} sortBy={goalieSortBy} />
            </div>
          </section>
        )}

        {/* Statistics Charts Section */}
        {activeSection === 'charts' && (
          <section role="tabpanel" aria-labelledby="charts-tab" className="space-y-8">
            {/* Charts Section Header */}
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black">
                    Statistics Charts
                  </h2>
                  <p className="text-gray-600 mt-1">Visual representation of player and team performance over time</p>
                </div>
              </div>
            </div>

            {/* Charts Content */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <StatsCharts />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
