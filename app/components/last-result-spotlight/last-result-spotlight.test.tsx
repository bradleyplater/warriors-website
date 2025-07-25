import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TestWrapper } from '../../../src/test/test-helper'
import LastResultSpotlight from './last-result-spotlight'
import type { Season } from '../season-filter/season-filter'

// Mock data
const mockGameData = {
  data: {
    upcomingGames: [],
    results: [
      {
        opponentTeam: "Leeds Warriors",
        logoImage: "leeds-warriors.jpg",
        date: "2025-07-19",
        season: "24/25" as Season,
        score: {
          warriorsScore: 5,
          opponentScore: 4,
          period: {
            one: {
              warriorsScore: 1,
              opponentScore: 1
            },
            two: {
              warriorsScore: 1,
              opponentScore: 1
            },
            three: {
              warriorsScore: 1,
              opponentScore: 1
            }
          }
        }
      },
      {
        opponentTeam: "Leeds Warriors",
        logoImage: "leeds-warriors.jpg",
        date: "2025-07-19",
        season: "24/25" as Season,
        score: {
          warriorsScore: 5,
          opponentScore: 4,
          period: {
            one: {
              warriorsScore: 1,
              opponentScore: 1
            },
            two: {
              warriorsScore: 1,
              opponentScore: 1
            },
            three: {
              warriorsScore: 1,
              opponentScore: 1
            }
          }
        }
      }
    ],
    players: [],
    team: {
      stats: []
    }
  },
  loading: false,
  error: null
}

// Mock Provider component


describe('LastResultSpotlight', () => {
  it('renders the latest result by date', () => {
    const mockDataWithMultipleResults = {
      ...mockGameData,
      data: {
        upcomingGames: [],
        players: [],
        results: [
          {
            opponentTeam: "Older Team",
            logoImage: "older-team.jpg",
            date: "2025-01-15", // Older date
            season: "24/25" as Season,
            score: {
              warriorsScore: 2,
              opponentScore: 3,
              period: {
                one: { warriorsScore: 1, opponentScore: 1 },
                two: { warriorsScore: 1, opponentScore: 1 },
                three: { warriorsScore: 0, opponentScore: 1 }
              }
            }
          },
          {
            opponentTeam: "Latest Team",
            logoImage: "latest-team.jpg",
            date: "2025-07-18", // Most recent date
            season: "24/25" as Season,
            score: {
              warriorsScore: 5,
              opponentScore: 4,
              period: {
                one: { warriorsScore: 2, opponentScore: 1 },
                two: { warriorsScore: 2, opponentScore: 2 },
                three: { warriorsScore: 1, opponentScore: 1 }
              }
            }
          }
        ],
        team: {
          stats: []
        }
      }
    }

    render(<LastResultSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockDataWithMultipleResults}>{children}</TestWrapper> 
    })
    
    // Should show the latest team, not the older one
    expect(screen.getByText('Latest Team')).toBeInTheDocument()
    expect(screen.queryByText('Older Team')).not.toBeInTheDocument()
  })

  it('displays correct game data', () => {
    render(<LastResultSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockGameData}>{children}</TestWrapper> 
    })
    
    // Check team name
    expect(screen.getByText('Leeds Warriors')).toBeInTheDocument()
    expect(screen.getByText('Warriors')).toBeInTheDocument()
    
    // Check final scores
    expect(screen.getByText('5')).toBeInTheDocument() // Warriors score
    expect(screen.getByText('4')).toBeInTheDocument() // Opponent score
    
    // Check period scores (there are multiple, so use getAllByText)
    const periodScores = screen.getAllByText('1 - 1')
    expect(periodScores.length).toBeGreaterThan(0)
    
    // Check separators
    expect(screen.getByText('FINAL')).toBeInTheDocument()
    expect(screen.getByText('PERIOD SCORE')).toBeInTheDocument()
  })

  it('shows green background when Warriors win', () => {
    const mockWinData = {
      ...mockGameData,
      data: {
        upcomingGames: [],
        players: [],
        results: [
          {
            opponentTeam: "Test Team",
            logoImage: "test-team.jpg",
            date: "2025-07-18",
            season: "24/25" as Season,
            score: {
              warriorsScore: 6,
              opponentScore: 3,
              period: {
                one: { warriorsScore: 2, opponentScore: 1 },
                two: { warriorsScore: 2, opponentScore: 1 },
                three: { warriorsScore: 2, opponentScore: 1 }
              }
            }
          }
        ],
        team: {
          stats: []
        }
      }
    }

    render(<LastResultSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockWinData}>{children}</TestWrapper> 
    })
    
    // Find the main container div with the background color class
    const container = screen.getByText('Test Team').closest('[class*="bg-"]')
    expect(container).toHaveClass('bg-green-100')
  })

  it('shows red background when Warriors lose', () => {
    const mockLossData = {
      ...mockGameData,
      data: {
        upcomingGames: [],
        players: [],
        results: [
          {
            opponentTeam: "Test Team",
            logoImage: "test-team.jpg",
            date: "2025-07-18",
            season: "24/25" as Season,
            score: {
              warriorsScore: 2,
              opponentScore: 5,
              period: {
                one: { warriorsScore: 1, opponentScore: 2 },
                two: { warriorsScore: 1, opponentScore: 2 },
                three: { warriorsScore: 0, opponentScore: 1 }
              }
            }
          }
        ],
        team: {
          stats: []
        }
      }
    }

    render(<LastResultSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockLossData}>{children}</TestWrapper> 
    })
    
    // Find the main container div with the background color class
    const container = screen.getByText('Test Team').closest('[class*="bg-"]')
    expect(container).toHaveClass('bg-red-100')
  })

  it('shows gray background when game is tied', () => {
    const mockTieData = {
      ...mockGameData,
      data: {
        upcomingGames: [],
        players: [],
        results: [
          {
            opponentTeam: "Test Team",
            logoImage: "test-team.jpg",
            date: "2025-07-18",
            season: "24/25" as Season,
            score: {
              warriorsScore: 4,
              opponentScore: 4,
              period: {
                one: { warriorsScore: 1, opponentScore: 1 },
                two: { warriorsScore: 2, opponentScore: 2 },
                three: { warriorsScore: 1, opponentScore: 1 }
              }
            }
          }
        ],
        team: {
          stats: []
        }
      }
    }

    render(<LastResultSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockTieData}>{children}</TestWrapper> 
    })
    
    // Find the main container div with the background color class
    const container = screen.getByText('Test Team').closest('[class*="bg-"]')
    expect(container).toHaveClass('bg-gray-100')
  })

  it('shows no results message when results array is empty', () => {
    const emptyData = { 
      ...mockGameData, 
      data: { upcomingGames: [], results: [], players: [], team: { stats: [] } } 
    }
    
    render(<LastResultSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={emptyData}>{children}</TestWrapper> 
    })
    
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('displays period scores correctly', () => {
    const mockDetailedData = {
      ...mockGameData,
      data: {
        upcomingGames: [],
        players: [],
        results: [
          {
            opponentTeam: "Test Team",
            logoImage: "test-team.jpg",
            date: "2025-07-18",
            season: "24/25" as Season,
            score: {
              warriorsScore: 7,
              opponentScore: 5,
              period: {
                one: { warriorsScore: 3, opponentScore: 1 },
                two: { warriorsScore: 2, opponentScore: 3 },
                three: { warriorsScore: 2, opponentScore: 1 }
              }
            }
          }
        ],
        team: {
          stats: []
        }
      }
    }

    render(<LastResultSpotlight />, { 
      wrapper: ({ children }) => <TestWrapper mockData={mockDetailedData}>{children}</TestWrapper> 
    })
    
    // Check period 1 scores
    expect(screen.getByText('3 - 1')).toBeInTheDocument()
    // Check period 2 scores
    expect(screen.getByText('2 - 3')).toBeInTheDocument()
    // Check period 3 scores
    expect(screen.getByText('2 - 1')).toBeInTheDocument()
  })
})
