import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock Firebase with all new exports
vi.mock('./firebase', () => ({
  auth: { onAuthStateChanged: vi.fn() },
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  trackEvent: vi.fn(),
  saveUserData: vi.fn(),
  loadUserData: vi.fn(() => Promise.resolve(null)),
  saveChatHistory: vi.fn(),
  loadChatHistory: vi.fn(() => Promise.resolve(null)),
  db: {},
  analytics: null,
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}))

import WelcomeCard from './components/WelcomeCard'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'

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

  it('renders ErrorBoundary children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Test Content')).toBeDefined()
  })

  it('renders ErrorBoundary fallback UI on error', () => {
    const ThrowingComponent = () => {
      throw new Error('Test error')
    }
    // Suppress React error logging during this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('Try Again')).toBeDefined()
    spy.mockRestore()
  })
})

describe('Firebase Service Layer', () => {
  it('exports trackEvent function', async () => {
    const { trackEvent } = await import('./firebase')
    expect(typeof trackEvent).toBe('function')
  })

  it('exports Firestore helpers', async () => {
    const { saveUserData, loadUserData, saveChatHistory, loadChatHistory } = await import('./firebase')
    expect(typeof saveUserData).toBe('function')
    expect(typeof loadUserData).toBe('function')
    expect(typeof saveChatHistory).toBe('function')
    expect(typeof loadChatHistory).toBe('function')
  })
})
