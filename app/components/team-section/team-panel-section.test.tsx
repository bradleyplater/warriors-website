import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import TeamSection from './team-panel-section'

// Wrapper component to provide router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('TeamSection', () => {
  const mockProps = {
    opponentTeam: "Leeds Warriors",
    opponentLogoImage: "leeds-warriors.jpg"
  }

  it('renders Warriors team correctly', () => {
    render(<TeamSection {...mockProps} />, { wrapper: RouterWrapper })
    
    expect(screen.getByText('Warriors')).toBeInTheDocument()
    expect(screen.getByAltText('Warriors Logo')).toBeInTheDocument()
    expect(screen.getByAltText('Warriors Logo')).toHaveAttribute('src', '/images/warriors-logo-black.png')
  })

  it('renders opponent team correctly', () => {
    render(<TeamSection {...mockProps} />, { wrapper: RouterWrapper })
    
    expect(screen.getByText('Leeds Warriors')).toBeInTheDocument()
    expect(screen.getByAltText('Leeds Warriors Logo')).toBeInTheDocument()
    expect(screen.getByAltText('Leeds Warriors Logo')).toHaveAttribute('src', '/images/team-logos/leeds-warriors.jpg')
  })

  it('renders VS separator', () => {
    render(<TeamSection {...mockProps} />, { wrapper: RouterWrapper })
    
    expect(screen.getByText('VS')).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const customClass = 'py-2 md:py-3'
    render(<TeamSection {...mockProps} className={customClass} />, { wrapper: RouterWrapper })
    
    const container = screen.getByText('VS').closest('div')?.parentElement
    expect(container).toHaveClass(customClass)
  })

  it('handles different opponent teams', () => {
    const differentProps = {
      opponentTeam: "Manchester Storm",
      opponentLogoImage: "manchester-storm.jpg"
    }
    
    render(<TeamSection {...differentProps} />, { wrapper: RouterWrapper })
    
    expect(screen.getByText('Manchester Storm')).toBeInTheDocument()
    expect(screen.getByAltText('Manchester Storm Logo')).toHaveAttribute('src', '/images/team-logos/manchester-storm.jpg')
  })
})
