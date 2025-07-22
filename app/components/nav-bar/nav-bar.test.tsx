import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import NavBar from './nav-bar'

// Wrapper component to provide router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('NavBar', () => {
  it('renders all navigation links', () => {
    render(<NavBar />, { wrapper: RouterWrapper })
    
    const homeButton = screen.getAllByText('Home');

    expect(homeButton).toHaveLength(2)
    homeButton.forEach(button => expect(button).toBeInTheDocument())
  })

  it('shows mobile menu when hamburger button is clicked', () => {
    render(<NavBar />, { wrapper: RouterWrapper })
    
    const hamburgerButton = screen.getByRole('button', { name: /open main menu/i })
    const mobileMenu = screen.getByRole('navigation').querySelector('#mobile-menu')
    
    // Initially hidden
    expect(mobileMenu).toHaveClass('md:hidden')
    
    // Click to show
    fireEvent.click(hamburgerButton)
    expect(mobileMenu).toHaveClass('opacity-100')
    
    // Click again to hide
    fireEvent.click(hamburgerButton)
    expect(mobileMenu).toHaveClass('opacity-0')
  })

  it('has correct navigation link hrefs', () => {
    render(<NavBar />, { wrapper: RouterWrapper })
    
    // Get all Home links (desktop + mobile)
    const homeLinks = screen.getAllByRole('link', { name: 'Home' })

    expect(homeLinks).toHaveLength(2)

    homeLinks.forEach(link => expect(link).toHaveAttribute('href', '/'))
  })
})
