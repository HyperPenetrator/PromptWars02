import { useState, useEffect, useRef } from 'react'
import { Send, AlertCircle, CheckCircle2, MapPin } from 'lucide-react'
import ChatMessage from './components/ChatMessage'
import AddressModal from './components/AddressModal'
import './App.css'

function App() {
  // State initialization with LocalStorage persistence
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('election_chat_history')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [health, setHealth] = useState('checking...')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addressInput, setAddressInput] = useState('')
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8001' : '');

  // Side Effects
  useEffect(() => {
    localStorage.setItem('election_chat_history', JSON.stringify(messages))
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/health`)
        if (res.ok) setHealth('Online')
        else setHealth('Error')
      } catch {
        setHealth('Offline')
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [API_BASE_URL])

  // API Handlers
  const handleSend = async (e) => {
    if (e) e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.slice(-5).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [m.content]
      }))

      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, history })
      })

      const data = await response.json()
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(),
        role: 'assistant', 
        content: "I'm sorry, I encountered an error connecting to the voting service. Please check your connection and try again." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressLookup = async () => {
    if (!addressInput.trim() || isSearchingAddress) return

    setIsSearchingAddress(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/civic-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressInput })
      })
      const data = await response.json()
      
      if (data.error) {
        alert(data.error)
      } else {
        const polls = data.pollingLocations?.[0]
        let message = `### Voting Info for ${addressInput}\n\n`
        let lat, lon;

        // Try to geocode the input address first to have a map center
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=1`)
          const geoData = await geoRes.json()
          if (geoData.length > 0) {
            lat = parseFloat(geoData[0].lat)
            lon = parseFloat(geoData[0].lon)
          }
        } catch (e) {
          console.error("Input geocoding failed", e)
        }

        if (polls) {
          const fullAddr = `${polls.address.line1}, ${polls.address.city}, ${polls.address.state}`
          message += `**Polling Location:** ${polls.address.locationName}\n`
          message += `**Address:** ${fullAddr} ${polls.address.zip}\n`
          message += `**Hours:** ${polls.pollingHours || 'Not listed'}\n`
          
          // If we have specific poll address, try to geocode that instead (more precise)
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddr)}&limit=1`)
            const geoData = await geoRes.json()
            if (geoData.length > 0) {
              lat = parseFloat(geoData[0].lat)
              lon = parseFloat(geoData[0].lon)
            }
          } catch (e) {
            console.error("Poll geocoding failed", e)
          }
        } else {
          message += "No specific polling locations found for this address. For official data, please check [CEO Assam](https://ceoassam.nic.in).\n\n"
          message += "*Note: The Civic API may not have live data for this specific locality right now.*"
        }
        
        setMessages(prev => [...prev, { 
          id: crypto.randomUUID(),
          role: 'assistant', 
          content: message,
          type: 'civic',
          coords: lat && lon ? [lat, lon] : null,
          locationName: polls?.address?.locationName || addressInput
        }])
        setIsModalOpen(false)
        setAddressInput('')
      }
    } catch {
      alert("Failed to fetch civic information. Please try again later.")
    } finally {
      setIsSearchingAddress(false)
    }
  }

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      setMessages([])
      localStorage.removeItem('election_chat_history')
    }
  }

  return (
    <div className="app-container" role="application" aria-label="Assam Election Process Assistant">
      <header className="glass-header" role="banner">
        <div className="header-content">
          <div className="logo-section">
            <CheckCircle2 className="logo-icon" size={28} aria-hidden="true" />
            <h1 className="gradient-title">Assam Election Assistant</h1>
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

      <main className="chat-interface" role="main">
        <div 
          className="messages-container u-hide-scrollbar" 
          role="log" 
          aria-live="polite" 
          aria-relevant="additions"
          aria-label="Conversation history with the Election Assistant"
        >
          {messages.length === 0 ? (
            <div className="welcome-overlay">
              <section className="welcome-card u-glass" aria-labelledby="welcome-heading">
                <h2 id="welcome-heading">Civic Education Portal</h2>
                <p>Welcome to the official education assistant for the Assam Election process. Ask about voter registration, EPIC cards, or the ECI process.</p>
                <div className="suggestions" role="group" aria-label="Suggested education topics">
                  <button className="suggestion-pill u-focus-ring" onClick={() => { setInput("How to register as a new voter in Assam?"); handleSend(); }}>Voter Registration</button>
                  <button className="suggestion-pill u-focus-ring" onClick={() => { setInput("What is an EPIC card and how to get it?"); handleSend(); }}>EPIC Card Info</button>
                  <button className="suggestion-pill u-focus-ring" onClick={() => { setInput("Check my name in electoral roll Assam"); handleSend(); }}>Check Roll</button>
                </div>
              </section>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage key={msg.id || idx} msg={msg} />
            ))
          )}
          {isLoading && (
            <div aria-busy="true" aria-label="Assistant is typing">
              <ChatMessage msg={{ role: 'assistant', content: '' }} isLoading={true} />
            </div>
          )}
          <div ref={messagesEndRef} tabIndex="-1" />
        </div>

        <section className="input-section">
          <form 
            className="input-container u-glass" 
            onSubmit={handleSend}
            role="search"
            aria-label="Query assistant"
          >
            <input
              id="query-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about NVSP, EPIC, or Assam voting..."
              aria-label="Type your question about elections here"
              disabled={isLoading}
              autoComplete="off"
            />
            <button 
              id="send-query-btn"
              type="submit" 
              className="send-btn u-flex-center u-focus-ring"
              disabled={isLoading || !input.trim()} 
              aria-label="Submit your question"
            >
              <Send size={24} />
            </button>
          </form>
        </section>
      </main>

      <AddressModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddressLookup}
        addressInput={addressInput}
        setAddressInput={setAddressInput}
        isSearching={isSearchingAddress}
      />

      <aside className="fab-links">
        <a 
          href="https://ceoassam.nic.in" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fab-btn u-flex-center u-focus-ring"
          aria-label="Open Official CEO Assam Portal in a new tab"
          title="Official CEO Assam Portal"
        >
          <AlertCircle size={28} />
        </a>
      </aside>
    </div>
  )
}

export default App
