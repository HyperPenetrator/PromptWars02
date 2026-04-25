import { useState, useEffect, useRef } from 'react'
import { Send, AlertCircle, CheckCircle2, MapPin } from 'lucide-react'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import ChatMessage from './components/ChatMessage'
import AddressModal from './components/AddressModal'
import Header from './components/Header'
import ChatInput from './components/ChatInput'
import WelcomeCard from './components/WelcomeCard'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

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
  
  const [voterData, setVoterData] = useState(() => {
    const saved = localStorage.getItem('voter_data_global')
    return saved ? JSON.parse(saved) : {
      steps: [
        { id: 1, title: 'Register to Vote', completed: true, description: 'Ensure your name is in the electoral roll.' },
        { id: 2, title: 'Find Polling Booth', completed: false, description: 'Locate your assigned voting station.' },
        { id: 3, title: 'Verify Identity', completed: false, description: 'Check if you have a valid EPIC card.' },
        { id: 4, title: 'Cast Your Vote', completed: false, description: 'Visit your booth on election day.' }
      ],
      savedBooth: null
    }
  })

  useEffect(() => {
    localStorage.setItem('voter_data_global', JSON.stringify(voterData))
  }, [voterData])
  
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
          
          // Auto-update Dashboard
          setVoterData(prev => ({
            ...prev,
            savedBooth: {
              name: polls.address.locationName,
              address: fullAddr
            },
            steps: prev.steps.map(s => s.id === 2 ? { ...s, completed: true } : s)
          }))

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
      <Header 
        health={health} 
        setIsModalOpen={setIsModalOpen} 
        clearHistory={clearHistory} 
      />

      <main className="chat-interface" role="main">
        <div 
          className="messages-container u-hide-scrollbar" 
          role="log" 
          aria-live="polite" 
          aria-relevant="additions"
          aria-label="Conversation history with the Election Assistant"
        >
          {messages.length === 0 ? (
            user ? (
              <Dashboard 
                user={user} 
                voterData={voterData}
                setInput={setInput} 
                handleSend={handleSend} 
              />
            ) : (
              <WelcomeCard 
                setInput={setInput} 
                handleSend={() => setTimeout(() => document.getElementById('send-query-btn')?.click(), 50)} 
              />
            )
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

        <ChatInput 
          input={input} 
          setInput={setInput} 
          handleSend={handleSend} 
          isLoading={isLoading} 
        />
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
