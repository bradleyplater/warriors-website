import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import SpotlightCard from './spotlight-card'

// Wrapper component to provide router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('NavBar', () => {
  it('Renders the correct title for the card', () => {
    render(<SpotlightCard cardHeader="Goals" children="This will contain goals cards" />, { wrapper: RouterWrapper })
    
    const cardHeader = screen.getByText('Goals');

    expect(cardHeader).toBeInTheDocument()
  })

  it('Displays children correctly', () => {
    render(<SpotlightCard cardHeader="Goals" children="This will contain goals cards" />, { wrapper: RouterWrapper })
    
    const children = screen.getByText('This will contain goals cards')
    
    expect(children).toBeInTheDocument()
  })
})
