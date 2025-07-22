import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PointsSpotlight from './points-spotlight';
import { TestWrapper } from '../../../src/test/test-helper';
import type { DataContextType, Player } from '../../contexts/DataContext';

// Mock the LeaderboardCard component
vi.mock('../leaderboard-card/leaderboard-card', () => ({
  default: ({ className, textColors, player }: any) => (
    <div data-testid="leaderboard-card" className={className}>
      <span data-testid="player-number">#{player.number}</span>
      <span data-testid="player-name">{player.name}</span>
      <span data-testid="player-position">{player.position}</span>
      <span data-testid="player-points">{player.statToTrack}</span>
    </div>
  ),
}));



const mockPlayers: Player[] = [
  {
    name: 'Paul',
    number: 88,
    position: 'Forward',
    stats: [{
      season: '24/25',
      games: 10,
      goals: 22,
      assists: 3,
      pims: 3,
      points: 25
    }]
  },
  {
    name: 'Jonny Adams',
    number: 2,
    position: 'Forward',
    stats: [{
      season: '24/25',
      games: 10,
      goals: 16,
      assists: 5,
      pims: 2,
      points: 21
    }]
  },
  {
    name: 'Ben Smitty',
    number: 53,
    position: 'Defense',
    stats: [{
      season: '24/25',
      games: 8,
      goals: 12,
      assists: 8,
      pims: 4,
      points: 20
    }]
  },
  {
    name: 'Mike Johnson',
    number: 15,
    position: 'Forward',
    stats: [{
      season: '24/25',
      games: 9,
      goals: 8,
      assists: 4,
      pims: 1,
      points: 12
    }]
  },
  {
    name: 'Tom Wilson',
    number: 7,
    position: 'Defense',
    stats: [{
      season: '24/25',
      games: 10,
      goals: 5,
      assists: 10,
      pims: 6,
      points: 15
    }]
  },
  {
    name: 'Jake Smith',
    number: 21,
    position: 'Forward',
    stats: [{
      season: '24/25',
      games: 7,
      goals: 3,
      assists: 2,
      pims: 0,
      points: 5
    }]
  }
];

describe('GoalSpotlight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays top 5 goal scorers in descending order', () => {
    const mockData: DataContextType = {
      data: { 
        players: mockPlayers,
        upcomingGames: [],
        results: []
      },
      loading: false,
      error: null
    };

    render(
      <TestWrapper mockData={mockData}>
        <PointsSpotlight />
      </TestWrapper>
    );
    
    const leaderboardCards = screen.getAllByTestId('leaderboard-card');
    expect(leaderboardCards).toHaveLength(5);

    // Check that goals are in descending order
    const pointsElements = screen.getAllByTestId('player-points');
    expect(pointsElements[0]).toHaveTextContent('25'); 
    expect(pointsElements[1]).toHaveTextContent('21'); 
    expect(pointsElements[2]).toHaveTextContent('20'); 
    expect(pointsElements[3]).toHaveTextContent('15');  
    expect(pointsElements[4]).toHaveTextContent('12');  
  });

  it('displays correct player information', () => {
    const mockData: DataContextType = {
      data: { 
        players: mockPlayers,
        upcomingGames: [],
        results: []
      },
      loading: false,
      error: null
    };

    render(
      <TestWrapper mockData={mockData}>
        <PointsSpotlight />
      </TestWrapper>
    );
    
    // Check first player (Paul - highest scorer)
    expect(screen.getByText('#88')).toBeInTheDocument();
    expect(screen.getByText('Paul')).toBeInTheDocument();
    expect(screen.getAllByText('F')).toHaveLength(3); // Position truncated to first character
    expect(screen.getByText('12')).toBeInTheDocument(); // Goals
  });

  it('truncates position to first character', () => {
    const mockData: DataContextType = {
      data: { 
        players: mockPlayers,
        upcomingGames: [],
        results: []
      },
      loading: false,
      error: null
    };

    render(
      <TestWrapper mockData={mockData}>
        <PointsSpotlight />
      </TestWrapper>
    );
    
    const positionElements = screen.getAllByTestId('player-position');
    expect(positionElements[0]).toHaveTextContent('F'); 
    expect(positionElements[2]).toHaveTextContent('D'); 
  });

  it('converts player numbers to strings', () => {
    const mockData: DataContextType = {
      data: { 
        players: mockPlayers,
        upcomingGames: [],
        results: []
      },
      loading: false,
      error: null
    };

    render(
      <TestWrapper mockData={mockData}>
        <PointsSpotlight />
      </TestWrapper>
    );
    
    const numberElements = screen.getAllByTestId('player-number');
    expect(numberElements[0]).toHaveTextContent('#88');
    expect(numberElements[1]).toHaveTextContent('#2');
  });

  it('handles empty players array', () => {
    const mockData: DataContextType = {
      data: { 
        players: [],
        upcomingGames: [],
        results: []
      },
      loading: false,
      error: null
    };

    render(
      <TestWrapper mockData={mockData}>
        <PointsSpotlight />
      </TestWrapper>
    );
    
    const leaderboardCards = screen.queryAllByTestId('leaderboard-card');
    expect(leaderboardCards).toHaveLength(0);
  });

  it('handles fewer than 5 players', () => {
    const fewPlayers = mockPlayers.slice(0, 3);
    const mockData: DataContextType = {
      data: { 
        players: fewPlayers,
        upcomingGames: [],
        results: []
      },
      loading: false,
      error: null
    };

    render(
      <TestWrapper mockData={mockData}>
        <PointsSpotlight />
      </TestWrapper>
    );
    
    const leaderboardCards = screen.getAllByTestId('leaderboard-card');
    expect(leaderboardCards).toHaveLength(3);
  });

  it('uses first season stats when player has multiple seasons', () => {
    const playerWithMultipleSeasons: Player[] = [{
      name: 'Multi Season Player',
      number: 99,
      position: 'Forward',
      stats: [
        {
          season: '24/25',
          games: 10,
          goals: 15,
          assists: 5,
          pims: 2,
          points: 20
        },
        {
          season: '23/24',
          games: 20,
          goals: 25,
          assists: 10,
          pims: 4,
          points: 35
        }
      ]
    }];

    const mockData: DataContextType = {
      data: { 
        players: playerWithMultipleSeasons,
        upcomingGames: [],
        results: []
      },
      loading: false,
      error: null
    };

    render(
      <TestWrapper mockData={mockData}>
        <PointsSpotlight />
      </TestWrapper>
    );
    
    // Should use first season (24/25) goals: 15, not second season goals: 25
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.queryByText('35')).not.toBeInTheDocument();
  });
});