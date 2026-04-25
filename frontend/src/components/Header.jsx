import { CheckCircle2, MapPin, AlertCircle } from 'lucide-react'

export default function Header({ health, setIsModalOpen, clearHistory }) {
  return (
    <header className="glass-header" role="banner">
      <div className="header-content">
        <div className="logo-section">
          <CheckCircle2 className="logo-icon" size={28} aria-hidden="true" />
          <h1 className="gradient-title">Election Process Assistant</h1>
        </div>
        <div className="header-actions">
          <button 
            id="poll-finder-trigger"
            className="btn-civic u-focus-ring" 
            onClick={() => setIsModalOpen(true)}
            aria-label="Find your polling station on the map"
          >
            <MapPin size={20} />
            <span>Poll Finder</span>
          </button>
          <button 
            id="clear-history-btn"
            className="btn-icon-only u-flex-center u-focus-ring" 
            onClick={clearHistory} 
            aria-label="Clear chat history and reset education session"
            title="Clear History"
          >
            <AlertCircle size={20} />
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
