import { CheckCircle2, MapPin, AlertCircle, LogIn, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { auth, loginWithGoogle, logout } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function Header({ health, setIsModalOpen, clearHistory }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  return (
    <header className="glass-header" role="banner">
      <div className="header-content">
        <div className="logo-section">
          <CheckCircle2 className="logo-icon" size={28} aria-hidden="true" />
          <h1 className="gradient-title">Election Process Assistant</h1>
        </div>

        <div className="header-actions">
          {user ? (
            <div className="user-profile">
              <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
              <span className="user-name">{user.displayName.split(' ')[0]}</span>
              <button onClick={logout} className="btn-icon-only u-focus-ring" aria-label="Sign Out" title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="btn-civic u-focus-ring" aria-label="Sign In">
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
          )}

          <button 
            id="poll-finder-trigger"
            className="btn-civic u-focus-ring" 
            onClick={() => setIsModalOpen(true)}
            aria-label="Find your polling station on the map"
          >
            <MapPin size={18} />
            <span>Poll Finder</span>
          </button>
          
          <button 
            id="clear-history-btn"
            className="btn-icon-only u-flex-center u-focus-ring" 
            onClick={clearHistory} 
            aria-label="Clear chat history"
            title="Clear History"
          >
            <AlertCircle size={18} />
          </button>

          <div 
            className={`status-pill ${health.toLowerCase()}`} 
            aria-live="polite"
            aria-label={`System Status: ${health}`}
          >
            <span className="u-sr-only">Status:</span>
            {health}
          </div>
        </div>
      </div>
    </header>
  )
}
