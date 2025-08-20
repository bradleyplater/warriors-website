import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TeamRecords from './team-records';
import { DataProvider } from '../../contexts/DataContext';

// Mock data for testing
const mockData = {
  results: [
    {
      seasonId: '24/25',
      date: '2024-01-15',
      opponentTeam: 'Test Team',
      score: {
        warriorsScore: 3,
        opponentScore: 2,
        period: {
          one: {
            warriorsScore: 1,
            opponentScore: 0,
            goals: [
              { playerId: '1', minute: 5, second: 30, type: 'EVEN', assists: ['2'] }
            ],
            opponentGoals: []
          },
          two: {
            warriorsScore: 1,
            opponentScore: 1,
            goals: [
              { playerId: '1', minute: 8, second: 15, type: 'PP', assists: ['2', '3'] }
            ],
            opponentGoals: [
              { playerId: 'opp1', minute: 12, second: 0, type: 'EVEN', assists: [] }
            ]
          },
          three: {
            warriorsScore: 1,
            opponentScore: 1,
            goals: [
              { playerId: '2', minute: 18, second: 45, type: 'EVEN', assists: ['1'] }
            ],
            opponentGoals: [
              { playerId: 'opp2', minute: 19, second: 30, type: 'EVEN', assists: [] }
            ]
          }
        }
      }
    }
  ],
  players: [
    { id: '1', name: 'John Doe', number: 1, position: 'Forward', stats: [] },
    { id: '2', name: 'Jane Smith', number: 2, position: 'Defense', stats: [] },
    { id: '3', name: 'Bob Johnson', number: 3, position: 'Forward', stats: [] }
  ],
  team: { stats: [] },
  upcomingGames: []
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

describe('TeamRecords', () => {
  it('renders team records component', () => {
    const { container } = render(
      <MockDataProvider>
        <TeamRecords selectedSeason="24/25" />
      </MockDataProvider>
    );

    expect(container.firstChild).toBeTruthy();
  });

  it('renders with overall season filter', () => {
    const { container } = render(
      <MockDataProvider>
        <TeamRecords selectedSeason="overall" />
      </MockDataProvider>
    );

    expect(container.firstChild).toBeTruthy();
  });
});
