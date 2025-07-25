import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayerStatsTable from './player-stats-table';

describe('PlayerStatsTable', () => {
  it('renders the sticky header with all column titles', () => {
    render(<PlayerStatsTable selectedSeason="overall" />);
    
    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('GP')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('PTS')).toBeInTheDocument();
    expect(screen.getByText('PPG')).toBeInTheDocument();
    expect(screen.getByText('POS')).toBeInTheDocument();
  });

  it('renders player data rows', () => {
    render(<PlayerStatsTable selectedSeason="overall" />);
    
    // Check for some mock player names
    expect(screen.getByText('Connor McDavid')).toBeInTheDocument();
    expect(screen.getByText('Leon Draisaitl')).toBeInTheDocument();
    expect(screen.getByText('David Pastrnak')).toBeInTheDocument();
  });

  it('displays player statistics correctly', () => {
    render(<PlayerStatsTable selectedSeason="overall" />);
    
    // Check for Connor McDavid's stats (first player in mock data)
    expect(screen.getByText('#97')).toBeInTheDocument();
    expect(screen.getByText('153')).toBeInTheDocument(); // Points
    expect(screen.getByText('1.87')).toBeInTheDocument(); // PPG
  });

  it('applies sticky positioning to header', () => {
    render(<PlayerStatsTable selectedSeason="overall" />);
    
    const header = screen.getByText('Player').closest('div');
    expect(header?.parentElement).toHaveClass('sticky', 'top-0');
  });
});
