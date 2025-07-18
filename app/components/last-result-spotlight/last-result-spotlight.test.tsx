import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import UpcomingGameSpotlight from './last-result-spotlight'
import { TestWrapper } from '../../../src/test/test-helper'

// Mock data
const mockGameData = {
  data: {
    upcomingGames: [
      {
        opponentTeam: "Leeds Warriors",
        logoImage: "leeds-warriors.jpg",
        gameType: "Challenge",
        date: "19th July 2025",
        time: "7:30 PM",
        location: "Planet Ice Leeds"
      },
      {
        opponentTeam: "Leeds Warriors 2",
        logoImage: "leeds-warriors2.jpg",
        gameType: "Challenge 2",
        date: "19th July 2026",
        time: "9:30 PM",
        location: "Planet Ice Leeds 2"
      }
    ]
  },
  loading: false,
  error: null
}

// Mock Provider component


describe('UpcomingGameSpotlight', () => {
  it('Renders the correct content based on content', () => {
    render(<UpcomingGameSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockGameData}>{children}</TestWrapper> 
    })
    
    expect(screen.getByText('Challenge')).toBeInTheDocument()
  })

  it('renders upcoming game data correctly', () => {
    render(<UpcomingGameSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockGameData}>{children}</TestWrapper> 
    })
    
    expect(screen.getByText('Challenge')).toBeInTheDocument()
    expect(screen.getByText('Leeds Warriors')).toBeInTheDocument()
    expect(screen.getByText('19th July 2025')).toBeInTheDocument()
    expect(screen.getByText('7:30 PM')).toBeInTheDocument()
    expect(screen.getByText('@ Planet Ice Leeds')).toBeInTheDocument()
  })

  it('shows no games message when array is empty', () => {
    const emptyData = { ...mockGameData, data: { upcomingGames: [] } }
    render(<UpcomingGameSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={emptyData}>{children}</TestWrapper> 
    })
    
    expect(screen.getByText('No upcoming games')).toBeInTheDocument()
  })
})
