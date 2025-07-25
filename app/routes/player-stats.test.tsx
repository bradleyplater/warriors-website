import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TestWrapper } from '../../src/test/test-helper'
import PlayerStats from './player-stats'
import type { DataContextType } from '../contexts/DataContext'

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
}

describe('PlayerStats Route', () => {
  it('renders the page title', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    expect(screen.getByText('Player Stats')).toBeInTheDocument()
  })

  it('renders all filter components on desktop', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    // Check for season filter
    expect(screen.getByText('Overall')).toBeInTheDocument()
    
    // Check for position filter
    expect(screen.getByText('All Positions')).toBeInTheDocument()
    
    // Check for sort filter
    expect(screen.getByText('Points')).toBeInTheDocument()
  })

  it('shows mobile filter toggle button on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Show')).toBeInTheDocument()
  })

  it('toggles filters visibility on mobile when button is clicked', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    const toggleButton = screen.getByText('Show')
    
    // Initially filters should be hidden (on mobile)
    expect(toggleButton).toBeInTheDocument()
    
    // Click to show filters
    fireEvent.click(toggleButton)
    expect(screen.getByText('Hide')).toBeInTheDocument()
    
    // Click to hide filters
    fireEvent.click(screen.getByText('Hide'))
    expect(screen.getByText('Show')).toBeInTheDocument()
  })

  it('renders the player stats table', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    // Check for table headers (mobile + desktop versions)
    expect(screen.getAllByText('Player')).toHaveLength(2)
    expect(screen.getAllByText('GP')).toHaveLength(2)
    expect(screen.getAllByText('G')).toHaveLength(2)
    expect(screen.getAllByText('A')).toHaveLength(2)
    expect(screen.getAllByText('PTS')).toHaveLength(2)
    expect(screen.getAllByText('PPG')).toHaveLength(2)
    expect(screen.getAllByText('POS')).toHaveLength(1) // Desktop only
  })

  it('updates season filter when changed', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    // Find the season filter dropdown and click it
    const seasonDropdown = screen.getByText('Overall')
    fireEvent.click(seasonDropdown)
    
    // Should show dropdown options
    expect(screen.getByText('24/25')).toBeInTheDocument()
    expect(screen.getByText('23/24')).toBeInTheDocument()
  })

  it('updates position filter when changed', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    // Find the position filter button
    const positionFilter = screen.getByText('All Positions')
    fireEvent.click(positionFilter)
    
    // Should show dropdown options
    expect(screen.getByText('Forward')).toBeInTheDocument()
    expect(screen.getByText('Defense')).toBeInTheDocument()
    expect(screen.getByText('Goalie')).toBeInTheDocument()
  })

  it('updates sort filter when changed', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    // Find the sort filter button
    const sortFilter = screen.getByText('Points')
    fireEvent.click(sortFilter)
    
    // Should show dropdown options
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Assists')).toBeInTheDocument()
    expect(screen.getByText('Points/Game')).toBeInTheDocument()
    expect(screen.getByText('Games Played')).toBeInTheDocument()
  })

  it('has proper responsive classes for mobile-first design', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    // Check that the main container has responsive classes
    const mainContainer = screen.getByText('Player Stats').closest('div')?.parentElement?.parentElement
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50')
  })

  it('shows chevron icon that rotates when filters are toggled', () => {
    render(<PlayerStats />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockData}>{children}</TestWrapper> 
    })
    
    const toggleButton = screen.getByText('Show').closest('button')
    const chevronIcon = toggleButton?.querySelector('svg')
    
    expect(chevronIcon).toBeInTheDocument()
    
    // Click to show filters
    fireEvent.click(toggleButton!)
    
    // Check if the chevron has the rotate class
    expect(chevronIcon).toHaveClass('rotate-180')
  })
})
