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
    const rosterButton = screen.getAllByText('Roster');
    const scheduleButton = screen.getAllByText('Schedule');
    const newsButton = screen.getAllByText('News');
    const ticketsButton = screen.getAllByText('Tickets');

    expect(homeButton).toHaveLength(2)
    expect(rosterButton).toHaveLength(2)
    expect(scheduleButton).toHaveLength(2)
    expect(newsButton).toHaveLength(2)
    expect(ticketsButton).toHaveLength(2)

    homeButton.forEach(button => expect(button).toBeInTheDocument())
    rosterButton.forEach(button => expect(button).toBeInTheDocument())
    scheduleButton.forEach(button => expect(button).toBeInTheDocument())
    newsButton.forEach(button => expect(button).toBeInTheDocument())
    ticketsButton.forEach(button => expect(button).toBeInTheDocument())
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
    
    // Get all other links
    const rosterLinks = screen.getAllByRole('link', { name: 'Roster' })
    const scheduleLinks = screen.getAllByRole('link', { name: 'Schedule' })
    const newsLinks = screen.getAllByRole('link', { name: 'News' })
    const ticketLinks = screen.getAllByRole('link', { name: 'Tickets' })


    expect(homeLinks).toHaveLength(2)
    expect(rosterLinks).toHaveLength(2)
    expect(scheduleLinks).toHaveLength(2)
    expect(newsLinks).toHaveLength(2)
    expect(ticketLinks).toHaveLength(2)

    homeLinks.forEach(link => expect(link).toHaveAttribute('href', '/'))
    rosterLinks.forEach(link => expect(link).toHaveAttribute('href', '/roster'))
    scheduleLinks.forEach(link => expect(link).toHaveAttribute('href', '/schedule'))
    newsLinks.forEach(link => expect(link).toHaveAttribute('href', '/news'))
    ticketLinks.forEach(link => expect(link).toHaveAttribute('href', '/tickets'))

  })
})
