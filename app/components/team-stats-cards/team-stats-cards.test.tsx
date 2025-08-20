import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeamStatsCards from './team-stats-cards';
import { DataProvider } from '../../contexts/DataContext';

// Mock data for testing
const mockData = {
  team: {
    stats: [
      {
        season: '24/25',
        games: 10,
        wins: 6,
        draws: 2,
        losses: 2,
        goalsFor: 25,
        goalsAgainst: 18
      }
    ]
  },
  results: [
    {
      season: '24/25',
      date: '2024-01-15',
      score: { warriorsScore: 3, opponentScore: 2 },
      opponentTeam: 'Test Team'
    }
  ]
};

const MockDataProvider = ({ children }: { children: React.ReactNode }) => (
  <DataProvider>
    {children}
  </DataProvider>
);

// Mock the useData hook
vi.mock('../../contexts/DataContext', async () => {
  const actual = await vi.importActual('../../contexts/DataContext');
  return {
    ...actual,
    useData: () => ({ data: mockData })
  };
});

describe('TeamStatsCards', () => {
  it('renders team performance section', () => {
    render(
      <MockDataProvider>
        <TeamStatsCards selectedSeason="24/25" />
      </MockDataProvider>
    );

    expect(screen.getByText('Team Performance')).toBeInTheDocument();
  });

  it('renders placeholder sections for future features', () => {
    render(
      <MockDataProvider>
        <TeamStatsCards selectedSeason="24/25" />
      </MockDataProvider>
    );

    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    expect(screen.getByText('Historical Comparisons')).toBeInTheDocument();
    expect(screen.getAllByText('Coming Soon')).toHaveLength(2);
  });

  it('displays stats cards with proper values', () => {
    render(
      <MockDataProvider>
        <TeamStatsCards selectedSeason="24/25" />
      </MockDataProvider>
    );

    expect(screen.getByText('Games Played')).toBeInTheDocument();
    expect(screen.getByText('Goals For')).toBeInTheDocument();
    expect(screen.getByText('Goals Against')).toBeInTheDocument();
    expect(screen.getByText('Win Percentage')).toBeInTheDocument();
  });
});
