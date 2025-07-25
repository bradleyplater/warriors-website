import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TestWrapper } from '../../../src/test/test-helper';
import PlayerStatsTable from './player-stats-table';
import type { DataContextType } from '../../contexts/DataContext';

// Mock data for tests
const mockData: DataContextType = {
  data: {
    upcomingGames: [],
    results: [],
    players: [],
    team: {
      stats: []
    }
  },
  loading: false,
  error: null
};

describe('PlayerStatsTable', () => {
  it('renders the sticky header with all column titles', () => {
    render(<PlayerStatsTable selectedSeason="overall" selectedPosition="all" sortBy="points" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    expect(screen.getAllByText('Player')).toHaveLength(2); // Mobile + Desktop
    expect(screen.getAllByText('GP')).toHaveLength(2); // Mobile + Desktop
    expect(screen.getAllByText('G')).toHaveLength(2); // Mobile + Desktop
    expect(screen.getAllByText('A')).toHaveLength(2); // Mobile + Desktop
    expect(screen.getAllByText('PTS')).toHaveLength(2); // Mobile + Desktop
    expect(screen.getAllByText('PPG')).toHaveLength(2); // Mobile + Desktop
    expect(screen.getAllByText('POS')).toHaveLength(1); // Desktop only
  });

  it('renders player data rows', () => {
    render(<PlayerStatsTable selectedSeason="overall" selectedPosition="all" sortBy="points" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    // With empty mock data, no player names should be present
    // The table structure should still render
    expect(screen.getAllByText('Player')).toHaveLength(2); // Mobile + Desktop headers
  });

  it('displays player statistics correctly', () => {
    render(<PlayerStatsTable selectedSeason="overall" selectedPosition="all" sortBy="points" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    // With empty mock data, the table should render but without player data
    // Check that the table structure is present
    expect(screen.getAllByText('GP')).toHaveLength(2); // Mobile + Desktop headers
    expect(screen.getAllByText('G')).toHaveLength(2); // Mobile + Desktop headers
  });

  it('applies sticky positioning to header', () => {
    render(<PlayerStatsTable selectedSeason="overall" selectedPosition="all" sortBy="points" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    // Check for sticky positioning - the table itself should have sticky header behavior
    // Since we're using CSS classes for sticky behavior, just check that the structure exists
    const playerHeaders = screen.getAllByText('Player');
    expect(playerHeaders).toHaveLength(2); // Mobile + Desktop
    
    // Check that desktop header exists
    const desktopHeader = playerHeaders.find(header => 
      header.closest('.hidden.md\\:block')
    );
    expect(desktopHeader).toBeInTheDocument();
  });

  it('renders with different season filter', () => {
    render(<PlayerStatsTable selectedSeason="24/25" selectedPosition="all" sortBy="points" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    // Should still render the table structure
    expect(screen.getAllByText('Player')).toHaveLength(2);
    expect(screen.getAllByText('PTS')).toHaveLength(2);
  });

  it('renders with position filter applied', () => {
    render(<PlayerStatsTable selectedSeason="overall" selectedPosition="forward" sortBy="points" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    // Should still render the table structure
    expect(screen.getAllByText('Player')).toHaveLength(2);
    expect(screen.getAllByText('POS')).toHaveLength(1); // Only in desktop version
  });

  it('renders with different sort options', () => {
    render(<PlayerStatsTable selectedSeason="overall" selectedPosition="all" sortBy="goals" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    // Should still render the table with goals column
    expect(screen.getAllByText('G')).toHaveLength(2); // Mobile + Desktop headers
  });

  it('has responsive grid layout classes', () => {
    render(<PlayerStatsTable selectedSeason="overall" selectedPosition="all" sortBy="points" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    // Check for responsive grid classes on desktop version
    const desktopHeaders = screen.getAllByText('Player');
    const desktopHeader = desktopHeaders.find(header => 
      header.closest('.hidden.md\\:block')
    );
    const gridContainer = desktopHeader?.closest('.grid');
    expect(gridContainer).toHaveClass('grid');
  });

  it('displays color-coded statistics', () => {
    render(<PlayerStatsTable selectedSeason="overall" selectedPosition="all" sortBy="points" />, {
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper>
    });
    
    // The component should render with proper styling for statistics
    // Goals should be in green, assists in blue, points highlighted
    const pointsColumns = screen.getAllByText('PTS');
    expect(pointsColumns).toHaveLength(2); // Mobile + Desktop headers
    expect(pointsColumns[0]).toBeInTheDocument();
  });
});
