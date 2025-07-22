import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TeamStatsSpotlight from './team-stats-spotlight'

describe('TeamStatsSpotlight', () => {
  it('renders all team statistics', () => {
    render(<TeamStatsSpotlight />)
    
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

  it('renders all stat values correctly', () => {
    render(<TeamStatsSpotlight />)
    
    // Check that all expected values are rendered
    expect(screen.getByText('45')).toBeInTheDocument() // Games Played
    expect(screen.getByText('32')).toBeInTheDocument() // Goals For
    expect(screen.getByText('77')).toBeInTheDocument() // Goals Against
    expect(screen.getByText('18')).toBeInTheDocument() // Wins
    expect(screen.getByText('7')).toBeInTheDocument()  // Draws
    expect(screen.getByText('3')).toBeInTheDocument()  // Losses
    expect(screen.getByText('W2')).toBeInTheDocument() // Form
    expect(screen.getByText('40%')).toBeInTheDocument() // Win %
    expect(screen.getByText('1-2-4')).toBeInTheDocument() // Last 5
  })

  it('applies correct layout structure', () => {
    const { container } = render(<TeamStatsSpotlight />)
    
    // Check main container
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('bg-gray-100')
    expect(mainContainer).toHaveClass('rounded-2xl')
    expect(mainContainer).toHaveClass('h-full')
    expect(mainContainer).toHaveClass('w-full')
    expect(mainContainer).toHaveClass('shadow-inner')
    
    // Check grid container
    const gridContainer = mainContainer.querySelector('.grid')
    expect(gridContainer).toHaveClass('grid-cols-3')
    expect(gridContainer).toHaveClass('gap-2')
    expect(gridContainer).toHaveClass('md:gap-6')
  })

  it('renders exactly 9 stat cards', () => {
    const { container } = render(<TeamStatsSpotlight />)
    
    // Count the number of stat cards
    const statCards = container.querySelectorAll('.grid > div')
    expect(statCards).toHaveLength(9)
  })

  it('applies positive category colors correctly', () => {
    render(<TeamStatsSpotlight />)
    
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
    render(<TeamStatsSpotlight />)
    
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
    render(<TeamStatsSpotlight />)
    
    // Draws should have neutral (blue) styling
    const drawsCard = screen.getByText('Draws').closest('div')
    expect(drawsCard).toHaveClass('bg-gradient-to-br')
    expect(drawsCard).toHaveClass('from-blue-50')
    expect(drawsCard).toHaveClass('to-blue-100')
    expect(drawsCard).toHaveClass('border-blue-200')
    
    // Win % should have neutral (blue) styling
    const winPercentCard = screen.getByText('Win %').closest('div')
    expect(winPercentCard).toHaveClass('from-blue-50')
    expect(winPercentCard).toHaveClass('to-blue-100')
    expect(winPercentCard).toHaveClass('border-blue-200')
  })

  it('applies general category colors correctly', () => {
    render(<TeamStatsSpotlight />)
    
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

  it('applies correct text colors for positive stats', () => {
    render(<TeamStatsSpotlight />)
    
    // Check Goals For value text color
    const goalsForValue = screen.getByText('32')
    expect(goalsForValue).toHaveClass('text-green-700')
    
    // Check Goals For title text color
    const goalsForTitle = screen.getByText('Goals For')
    expect(goalsForTitle).toHaveClass('text-green-600')
  })

  it('applies correct text colors for negative stats', () => {
    render(<TeamStatsSpotlight />)
    
    // Check Goals Against value text color
    const goalsAgainstValue = screen.getByText('77')
    expect(goalsAgainstValue).toHaveClass('text-red-700')
    
    // Check Goals Against title text color
    const goalsAgainstTitle = screen.getByText('Goals Against')
    expect(goalsAgainstTitle).toHaveClass('text-red-600')
  })

  it('applies correct text colors for neutral stats', () => {
    render(<TeamStatsSpotlight />)
    
    // Check Draws value text color
    const drawsValue = screen.getByText('7')
    expect(drawsValue).toHaveClass('text-blue-700')
    
    // Check Draws title text color
    const drawsTitle = screen.getByText('Draws')
    expect(drawsTitle).toHaveClass('text-blue-600')
  })

  it('applies correct text colors for general stats', () => {
    render(<TeamStatsSpotlight />)
    
    // Check Games Played value text color
    const gamesPlayedValue = screen.getByText('45')
    expect(gamesPlayedValue).toHaveClass('text-gray-700')
    
    // Check Games Played title text color
    const gamesPlayedTitle = screen.getByText('Games Played')
    expect(gamesPlayedTitle).toHaveClass('text-gray-600')
  })

  it('applies hover effects to stat cards', () => {
    const { container } = render(<TeamStatsSpotlight />)
    
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
    const { container } = render(<TeamStatsSpotlight />)
    
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
    const { container } = render(<TeamStatsSpotlight />)
    
    // Check that all stat cards have responsive minimum heights
    const statCards = container.querySelectorAll('.grid > div')
    statCards.forEach(card => {
      expect(card).toHaveClass('min-h-[60px]')
      expect(card).toHaveClass('md:min-h-[80px]')
      expect(card).toHaveClass('lg:min-h-[90px]')
    })
  })
})
