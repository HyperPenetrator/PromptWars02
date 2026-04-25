import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WelcomeCard from './components/WelcomeCard'
import Header from './components/Header'

describe('Election Assistant Frontend', () => {
  it('renders Header with healthy status', () => {
    render(<Header health="Healthy" setIsModalOpen={() => {}} clearHistory={() => {}} />)
    expect(screen.getByText('Election Process Assistant')).toBeDefined()
    expect(screen.getByText('Healthy')).toBeDefined()
  })

  it('renders WelcomeCard with suggested topics', () => {
    render(<WelcomeCard setInput={() => {}} handleSend={() => {}} />)
    expect(screen.getByText('Civic Education Portal')).toBeDefined()
    expect(screen.getByText('Voter Registration')).toBeDefined()
    expect(screen.getByText('EPIC Card Info')).toBeDefined()
  })
})
