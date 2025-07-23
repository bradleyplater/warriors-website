// season-filter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, beforeEach, it, expect, vi } from 'vitest'; // or jest
import SeasonFilter, { type Season } from './season-filter';

describe('SeasonFilter', () => {
  const mockOnSeasonChange = vi.fn();
  
  beforeEach(() => {
    mockOnSeasonChange.mockClear();
  });

  it('renders all season options', () => {
    render(
      <SeasonFilter 
        selectedSeason="overall" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    expect(screen.getByText('Overall')).toBeInTheDocument();
    expect(screen.getByText('24/25')).toBeInTheDocument();
    expect(screen.getByText('23/24')).toBeInTheDocument();
    expect(screen.getByText('22/23')).toBeInTheDocument();
  });

  it('highlights the selected season', () => {
    render(
      <SeasonFilter 
        selectedSeason="24/25" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    const selectedButton = screen.getByText('24/25');
    expect(selectedButton).toHaveClass('bg-gray-600', 'text-white');
  });

  it('calls onSeasonChange when a season is clicked', () => {
    render(
      <SeasonFilter 
        selectedSeason="overall" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    fireEvent.click(screen.getByText('23/24'));
    expect(mockOnSeasonChange).toHaveBeenCalledWith('23/24');
  });

  it('applies correct styling to unselected seasons', () => {
    render(
      <SeasonFilter 
        selectedSeason="24/25" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    const unselectedButton = screen.getByText('Overall');
    expect(unselectedButton).toHaveClass('bg-white', 'text-gray-700');
  });
});