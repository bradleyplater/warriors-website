import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TeamStatsSpotlight from './team-stats-spotlight'
import type { Season } from '../season-filter/season-filter'
import { TestWrapper } from '../../../src/test/test-helper'
import type { DataContextType, TeamStat, Result } from '../../contexts/DataContext'

// Mock data for testing
const mockTeamStats: TeamStat[] = [
  {
    season: '24/25',
    games: 10,
    goalsFor: 25,
    goalsAgainst: 15,
    wins: 7,
    losses: 2,
    draws: 1
  },
  {
    season: '23/24',
    games: 8,
    goalsFor: 20,
    goalsAgainst: 12,
    wins: 5,
    losses: 2,
    draws: 1
  }
]

const mockResults: Result[] = [
  {
    season: '24/25',
    opponentTeam: 'Team A',
    logoImage: 'team-a.jpg',
    date: '2024-12-01',
    score: {
      warriorsScore: 3,
      opponentScore: 1,
      period: {
        one: { warriorsScore: 1, opponentScore: 0 },
        two: { warriorsScore: 1, opponentScore: 1 },
        three: { warriorsScore: 1, opponentScore: 0 }
      }
    }
  },
  {
    season: '24/25',
    opponentTeam: 'Team B',
    logoImage: 'team-b.jpg',
    date: '2024-11-15',
    score: {
      warriorsScore: 2,
      opponentScore: 4,
      period: {
        one: { warriorsScore: 1, opponentScore: 2 },
        two: { warriorsScore: 0, opponentScore: 1 },
        three: { warriorsScore: 1, opponentScore: 1 }
      }
    }
  },
  {
    season: '24/25',
    opponentTeam: 'Team C',
    logoImage: 'team-c.jpg',
    date: '2024-11-01',
    score: {
      warriorsScore: 1,
      opponentScore: 1,
      period: {
        one: { warriorsScore: 0, opponentScore: 1 },
        two: { warriorsScore: 1, opponentScore: 0 },
        three: { warriorsScore: 0, opponentScore: 0 }
      }
    }
  }
]

const mockData: DataContextType = {
  data: {
    upcomingGames: [],
    results: mockResults,
    players: [],
    team: { stats: mockTeamStats }
  },
  loading: false,
  error: null
}

describe('TeamStatsSpotlight', () => {
  const defaultSeason: Season = '24/25'

  it('renders all team statistics', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check that all expected stats are rendered
    expect(screen.getByText('Games Played')).toBeInTheDocument()
    expect(screen.getByText('Goals For')).toBeInTheDocument()
    expect(screen.getByText('Goals Against')).toBeInTheDocument()
    expect(screen.getByText('Wins')).toBeInTheDocument()
    expect(screen.getByText('Draws')).toBeInTheDocument()
    expect(screen.getByText('Losses')).toBeInTheDocument()
    expect(screen.getByText('Form')).toBeInTheDocument()
    expect(screen.getByText('Win %')).toBeInTheDocument()
    expect(screen.getByText('Last 5')).toBeInTheDocument()
  })

  it('renders stat values correctly with mock data', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check that values from mock data are rendered
    expect(screen.getByText('10')).toBeInTheDocument() // Games Played
    expect(screen.getByText('25')).toBeInTheDocument() // Goals For
    expect(screen.getByText('15')).toBeInTheDocument() // Goals Against
    expect(screen.getByText('7')).toBeInTheDocument() // Wins
    expect(screen.getByText('1')).toBeInTheDocument() // Draws
    expect(screen.getByText('2')).toBeInTheDocument() // Losses
    expect(screen.getByText('W1')).toBeInTheDocument() // Form (latest result is win)
    expect(screen.getByText('70.0%')).toBeInTheDocument() // Win % (7/10 = 70%)
    expect(screen.getByText('1-1-1')).toBeInTheDocument() // Last 5 (1 win, 1 loss, 1 draw)
  })

  it('renders exactly 9 stat cards', () => {
    const { container } = render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Count the number of stat cards
    const statCards = container.querySelectorAll('.grid > div')
    expect(statCards).toHaveLength(9)
  })

  it('applies positive category colors correctly', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Goals For should have positive (green) styling
    const goalsForCard = screen.getByText('Goals For').closest('div')
    expect(goalsForCard).toHaveClass('bg-gradient-to-br')
    expect(goalsForCard).toHaveClass('from-green-50')
    expect(goalsForCard).toHaveClass('to-green-100')
    expect(goalsForCard).toHaveClass('border-green-200')
    
    // Wins should have positive (green) styling
    const winsCard = screen.getByText('Wins').closest('div')
    expect(winsCard).toHaveClass('from-green-50')
    expect(winsCard).toHaveClass('to-green-100')
    expect(winsCard).toHaveClass('border-green-200')
  })

  it('applies negative category colors correctly', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Goals Against should have negative (red) styling
    const goalsAgainstCard = screen.getByText('Goals Against').closest('div')
    expect(goalsAgainstCard).toHaveClass('bg-gradient-to-br')
    expect(goalsAgainstCard).toHaveClass('from-red-50')
    expect(goalsAgainstCard).toHaveClass('to-red-100')
    expect(goalsAgainstCard).toHaveClass('border-red-200')
    
    // Losses should have negative (red) styling
    const lossesCard = screen.getByText('Losses').closest('div')
    expect(lossesCard).toHaveClass('from-red-50')
    expect(lossesCard).toHaveClass('to-red-100')
    expect(lossesCard).toHaveClass('border-red-200')
  })

  it('applies neutral category colors correctly', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Draws should have neutral (blue) styling
    const drawsCard = screen.getByText('Draws').closest('div')
    expect(drawsCard).toHaveClass('bg-gradient-to-br')
    expect(drawsCard).toHaveClass('from-blue-50')
    expect(drawsCard).toHaveClass('to-blue-100')
    expect(drawsCard).toHaveClass('border-blue-200')
  })

  it('applies general category colors correctly', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Games Played should have general (gray) styling
    const gamesPlayedCard = screen.getByText('Games Played').closest('div')
    expect(gamesPlayedCard).toHaveClass('bg-gradient-to-br')
    expect(gamesPlayedCard).toHaveClass('from-gray-50')
    expect(gamesPlayedCard).toHaveClass('to-gray-100')
    expect(gamesPlayedCard).toHaveClass('border-gray-200')
    
    // Last 5 should have general (gray) styling
    const lastFiveCard = screen.getByText('Last 5').closest('div')
    expect(lastFiveCard).toHaveClass('from-gray-50')
    expect(lastFiveCard).toHaveClass('to-gray-100')
    expect(lastFiveCard).toHaveClass('border-gray-200')
  })

  it('applies dynamic form category colors correctly', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Form should have dynamic styling based on W/L/D
    // With mock data (latest result is W1), should be positive (green)
    const formCard = screen.getByText('Form').closest('div')
    expect(formCard).toHaveClass('bg-gradient-to-br')
    expect(formCard).toHaveClass('from-green-50')
    expect(formCard).toHaveClass('to-green-100')
    expect(formCard).toHaveClass('border-green-200')
  })

  it('applies dynamic win percentage category colors correctly', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Win % should have dynamic styling based on >= 50% threshold
    // With mock data (70.0% win rate), should be positive (green)
    const winPercentCard = screen.getByText('Win %').closest('div')
    expect(winPercentCard).toHaveClass('bg-gradient-to-br')
    expect(winPercentCard).toHaveClass('from-green-50')
    expect(winPercentCard).toHaveClass('to-green-100')
    expect(winPercentCard).toHaveClass('border-green-200')
  })

  it('applies correct text colors for positive stats', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check Goals For value text color (mock data: 25)
    const goalsForValue = screen.getByText('25')
    expect(goalsForValue).toHaveClass('text-green-700')
    
    // Check Goals For title text color
    const goalsForTitle = screen.getByText('Goals For')
    expect(goalsForTitle).toHaveClass('text-green-600')
  })

  it('applies correct text colors for negative stats', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check Goals Against value text color (mock data: 15)
    const goalsAgainstValue = screen.getByText('15')
    expect(goalsAgainstValue).toHaveClass('text-red-700')
    
    // Check Goals Against title text color
    const goalsAgainstTitle = screen.getByText('Goals Against')
    expect(goalsAgainstTitle).toHaveClass('text-red-600')
  })

  it('applies correct text colors for neutral stats', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check Draws value text color (mock data: 1)
    const drawsValue = screen.getByText('1')
    expect(drawsValue).toHaveClass('text-blue-700')
    
    // Check Draws title text color
    const drawsTitle = screen.getByText('Draws')
    expect(drawsTitle).toHaveClass('text-blue-600')
  })

  it('applies correct text colors for general stats', () => {
    render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check Games Played value text color (mock data: 10)
    const gamesPlayedValue = screen.getByText('10')
    expect(gamesPlayedValue).toHaveClass('text-gray-700')
    
    // Check Games Played title text color
    const gamesPlayedTitle = screen.getByText('Games Played')
    expect(gamesPlayedTitle).toHaveClass('text-gray-600')
  })

  it('applies hover effects to stat cards', () => {
    const { container } = render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check that all stat cards have hover effects
    const statCards = container.querySelectorAll('.grid > div')
    statCards.forEach(card => {
      expect(card).toHaveClass('transition-all')
      expect(card).toHaveClass('duration-200')
      expect(card).toHaveClass('hover:shadow-lg')
      expect(card).toHaveClass('hover:scale-105')
    })
  })

  it('applies responsive classes correctly', () => {
    const { container } = render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check responsive padding on main container
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('py-3')
    expect(mainContainer).toHaveClass('md:py-4')
    
    // Check responsive gap on grid
    const gridContainer = mainContainer.querySelector('.grid')
    expect(gridContainer).toHaveClass('gap-2')
    expect(gridContainer).toHaveClass('md:gap-6')
    
    // Check responsive padding on stat cards
    const statCards = container.querySelectorAll('.grid > div')
    statCards.forEach(card => {
      expect(card).toHaveClass('p-2')
      expect(card).toHaveClass('md:p-3')
      expect(card).toHaveClass('lg:p-4')
    })
  })

  it('applies correct minimum heights to stat cards', () => {
    const { container } = render(
      <TestWrapper mockData={mockData}>
        <TeamStatsSpotlight selectedSeason={defaultSeason} />
      </TestWrapper>
    )
    
    // Check that all stat cards have responsive minimum heights
    const statCards = container.querySelectorAll('.grid > div')
    statCards.forEach(card => {
      expect(card).toHaveClass('min-h-[60px]')
      expect(card).toHaveClass('md:min-h-[80px]')
      expect(card).toHaveClass('lg:min-h-[90px]')
    })
  })
})
