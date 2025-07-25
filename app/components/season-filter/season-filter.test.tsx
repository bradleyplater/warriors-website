// season-filter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, beforeEach, it, expect, vi } from 'vitest'; // or jest
import SeasonFilter, { type Season } from './season-filter';

describe('SeasonFilter', () => {
  const mockOnSeasonChange = vi.fn();
  
  beforeEach(() => {
    mockOnSeasonChange.mockClear();
  });

  it('renders the filter label and dropdown button', () => {
    render(
      <SeasonFilter 
        selectedSeason="overall" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    expect(screen.getByText('Filter by Season')).toBeInTheDocument();
    expect(screen.getByText('Overall')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the selected season in the dropdown button', () => {
    render(
      <SeasonFilter 
        selectedSeason="24/25" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    expect(screen.getByText('24/25')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(
      <SeasonFilter 
        selectedSeason="overall" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    
    // All season options should now be visible
    expect(screen.getAllByText('Overall')).toHaveLength(2); // One in button, one in dropdown
    expect(screen.getByText('25/26')).toBeInTheDocument();
    expect(screen.getByText('24/25')).toBeInTheDocument();
    expect(screen.getByText('23/24')).toBeInTheDocument();
    expect(screen.getByText('22/23')).toBeInTheDocument();
  });

  it('closes dropdown and calls onSeasonChange when option is selected', () => {
    render(
      <SeasonFilter 
        selectedSeason="overall" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    // Open dropdown
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    
    // Verify dropdown is open (should have multiple instances of 'Overall')
    expect(screen.getAllByText('Overall')).toHaveLength(2);
    
    // Click on a season option
    const seasonOption = screen.getByText('23/24');
    fireEvent.click(seasonOption);
    
    expect(mockOnSeasonChange).toHaveBeenCalledWith('23/24');
    
    // Dropdown should be closed (23/24 should not be visible since dropdown is closed)
    expect(screen.queryByText('23/24')).not.toBeInTheDocument();
    // Only one instance of 'Overall' should remain (in the button)
    expect(screen.getAllByText('Overall')).toHaveLength(1);
  });

  it('highlights the selected season in the dropdown', () => {
    render(
      <SeasonFilter 
        selectedSeason="24/25" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    // Open dropdown
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    
    // Find the selected option in the dropdown (not the button)
    const dropdownOptions = screen.getAllByText('24/25');
    const selectedOption = dropdownOptions.find(option => 
      option.closest('button')?.classList.contains('bg-gray-100')
    );
    
    expect(selectedOption?.closest('button')).toHaveClass('bg-gray-100', 'text-gray-900', 'font-medium');
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <SeasonFilter 
        selectedSeason="overall" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    // Open dropdown
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    
    // Verify dropdown is open
    expect(screen.getAllByText('Overall')).toHaveLength(2);
    
    // Click on the overlay (outside the dropdown)
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
    }
    
    // Dropdown should be closed
    expect(screen.getAllByText('Overall')).toHaveLength(1);
  });

  it('toggles dropdown when button is clicked multiple times', () => {
    render(
      <SeasonFilter 
        selectedSeason="overall" 
        onSeasonChange={mockOnSeasonChange} 
      />
    );
    
    const dropdownButton = screen.getByRole('button');
    
    // Initially closed
    expect(screen.getAllByText('Overall')).toHaveLength(1);
    
    // Click to open
    fireEvent.click(dropdownButton);
    expect(screen.getAllByText('Overall')).toHaveLength(2);
    
    // Click to close
    fireEvent.click(dropdownButton);
    expect(screen.getAllByText('Overall')).toHaveLength(1);
  });
});