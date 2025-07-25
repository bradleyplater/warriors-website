import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayerStatsRow from './player-stats-row';

const mockPlayer = {
  id: 1,
  name: 'Connor McDavid',
  number: '97',
  position: 'C',
  games: 82,
  goals: 64,
  assists: 89,
  points: 153,
  pointsPerGame: 1.87
};

describe('PlayerStatsRow', () => {
  it('renders player information correctly', () => {
    render(<PlayerStatsRow player={mockPlayer} rank={1} isEven={true} />);
    
    expect(screen.getByText('Connor McDavid')).toBeInTheDocument();
    expect(screen.getByText('#97')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('displays all statistics correctly', () => {
    render(<PlayerStatsRow player={mockPlayer} rank={1} isEven={true} />);
    
    expect(screen.getByText('82')).toBeInTheDocument(); // Games
    expect(screen.getByText('64')).toBeInTheDocument(); // Goals
    expect(screen.getByText('89')).toBeInTheDocument(); // Assists
    expect(screen.getByText('153')).toBeInTheDocument(); // Points
    expect(screen.getByText('1.87')).toBeInTheDocument(); // PPG
  });

  it('applies even row styling correctly', () => {
    const { container } = render(<PlayerStatsRow player={mockPlayer} rank={1} isEven={true} />);
    
    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass('bg-white');
  });

  it('applies odd row styling correctly', () => {
    const { container } = render(<PlayerStatsRow player={mockPlayer} rank={1} isEven={false} />);
    
    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass('bg-gray-50/50');
  });

  it('formats points per game to 2 decimal places', () => {
    const playerWithLongPPG = {
      ...mockPlayer,
      pointsPerGame: 1.8765432
    };
    
    render(<PlayerStatsRow player={playerWithLongPPG} rank={1} isEven={true} />);
    
    expect(screen.getByText('1.88')).toBeInTheDocument();
  });
});
