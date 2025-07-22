import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LeaderboardCard from './leaderboard-card'

// Mock data
const mockTextColors = {
  number: 'text-blue-600',
  name: 'text-gray-800',
  position: 'text-gray-500',
  statToTrack: 'text-green-600'
}

const mockPlayer = {
  name: 'John Smith',
  number: '10',
  position: 'C',
  statToTrack: 25
}

const defaultProps = {
  className: 'bg-white',
  textColors: mockTextColors,
  player: mockPlayer
}

describe('LeaderboardCard', () => {
  it('renders with all player information', () => {
    render(<LeaderboardCard {...defaultProps} />)
    
    // Check player name
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    
    // Check player number with # prefix
    expect(screen.getByText('#10')).toBeInTheDocument()
    
    // Check position
    expect(screen.getByText('C')).toBeInTheDocument()
    
    // Check stat to track
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('applies the correct CSS classes', () => {
    const { container } = render(<LeaderboardCard {...defaultProps} />)
    
    // Check main container classes
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('bg-white')
    expect(mainDiv).toHaveClass('border')
    expect(mainDiv).toHaveClass('rounded-md')
    expect(mainDiv).toHaveClass('sm:rounded-lg')
    expect(mainDiv).toHaveClass('transition-all')
    expect(mainDiv).toHaveClass('duration-200')
    expect(mainDiv).toHaveClass('hover:shadow-md')
    expect(mainDiv).toHaveClass('hover:scale-[1.01]')
  })

  it('applies correct text colors to each element', () => {
    render(<LeaderboardCard {...defaultProps} />)
    
    // Check number color
    const numberElement = screen.getByText('#10')
    expect(numberElement).toHaveClass('text-blue-600')
    
    // Check name color
    const nameElement = screen.getByText('John Smith')
    expect(nameElement).toHaveClass('text-gray-800')
    
    // Check position color
    const positionElement = screen.getByText('C')
    expect(positionElement).toHaveClass('text-gray-500')
    
    // Check stat color
    const statElement = screen.getByText('25')
    expect(statElement).toHaveClass('text-green-600')
  })

  it('handles long player names with truncation', () => {
    const longNamePlayer = {
      ...mockPlayer,
      name: 'Very Long Player Name That Should Be Truncated'
    }
    
    render(
      <LeaderboardCard 
        {...defaultProps} 
        player={longNamePlayer}
      />
    )
    
    const nameElement = screen.getByText('Very Long Player Name That Should Be Truncated')
    expect(nameElement).toHaveClass('truncate')
    expect(nameElement).toHaveClass('flex-1')
  })

  it('handles different stat values correctly', () => {
    const highStatPlayer = {
      ...mockPlayer,
      statToTrack: 999
    }
    
    render(
      <LeaderboardCard 
        {...defaultProps} 
        player={highStatPlayer}
      />
    )
    
    expect(screen.getByText('999')).toBeInTheDocument()
  })

  it('handles zero stat values', () => {
    const zeroStatPlayer = {
      ...mockPlayer,
      statToTrack: 0
    }
    
    render(
      <LeaderboardCard 
        {...defaultProps} 
        player={zeroStatPlayer}
      />
    )
    
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('handles single character positions', () => {
    const singleCharPositionPlayer = {
      ...mockPlayer,
      position: 'G'
    }
    
    render(
      <LeaderboardCard 
        {...defaultProps} 
        player={singleCharPositionPlayer}
      />
    )
    
    const positionElement = screen.getByText('G')
    expect(positionElement).toHaveClass('w-4')
    expect(positionElement).toHaveClass('text-center')
  })

  it('handles different player numbers', () => {
    const differentNumberPlayer = {
      ...mockPlayer,
      number: '99'
    }
    
    render(
      <LeaderboardCard 
        {...defaultProps} 
        player={differentNumberPlayer}
      />
    )
    
    expect(screen.getByText('#99')).toBeInTheDocument()
  })

  it('maintains proper layout structure', () => {
    const { container } = render(<LeaderboardCard {...defaultProps} />)
    
    // Check main container structure
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv.children).toHaveLength(1)
    
    // Check inner flex container
    const innerDiv = mainDiv.firstElementChild as HTMLElement
    expect(innerDiv).toHaveClass('flex')
    expect(innerDiv).toHaveClass('flex-row')
    expect(innerDiv).toHaveClass('items-center')
    expect(innerDiv).toHaveClass('justify-between')
    
    // Should have two main sections: player info and stat
    expect(innerDiv.children).toHaveLength(2)
  })

  it('renders with custom className', () => {
    const customClassName = 'bg-red-500 custom-class'
    
    const { container } = render(
      <LeaderboardCard 
        {...defaultProps} 
        className={customClassName}
      />
    )
    
    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('bg-red-500')
    expect(mainDiv).toHaveClass('custom-class')
  })
})
