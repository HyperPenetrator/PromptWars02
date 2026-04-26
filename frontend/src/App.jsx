import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { auth, trackEvent, loadUserData, saveChatHistory, loadChatHistory } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Components
import ChatMessage from './components/ChatMessage'
import AddressModal from './components/AddressModal'
import Header from './components/Header'
import ChatInput from './components/ChatInput'
import WelcomeCard from './components/WelcomeCard'
import Dashboard from './components/Dashboard'

// Hooks & Services
import { useVoterData } from './hooks/useVoterData'
import { checkApiHealth, sendChatMessage, lookupCivicInfo, geocodeAddress } from './services/api'

import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const { voterData, setVoterData, updateBooth } = useVoterData(user)
  
  // ── User Session & Cloud Sync ──────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        trackEvent('user_session_start', { uid: currentUser.uid })
        
        const cloudVoterData = await loadUserData(currentUser.uid)
        if (cloudVoterData) setVoterData(cloudVoterData)
        
        const cloudChat = await loadChatHistory(currentUser.uid)
        if (cloudChat?.length > 0) setMessages(cloudChat)
      }
    })
    return () => unsubscribe()
  }, [setVoterData])

  // ── State Management ───────────────────────────────────────────
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

  // ── Side Effects ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('election_chat_history', JSON.stringify(messages))
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    
    if (user?.uid && messages.length > 0) {
      saveChatHistory(user.uid, messages)
    }
  }, [messages, user])

  useEffect(() => {
    const updateHealth = async () => setHealth(await checkApiHealth())
    updateHealth()
    const interval = setInterval(updateHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── Chat Logic ────────────────────────────────────────────────
  const handleSend = async (e) => {
    if (e) e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    trackEvent('chat_message_sent', { length: text.length })
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.slice(-5).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [m.content]
      }))

      const data = await sendChatMessage(text, history)
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(),
        role: 'assistant', 
        content: "I encountered an error connecting to the voting service. Please try again." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // ── Civic Lookup Logic ────────────────────────────────────────
  const handleAddressLookup = async () => {
    if (!addressInput.trim() || isSearchingAddress) return
    trackEvent('booth_lookup', { address: addressInput })
    setIsSearchingAddress(true)
    
    try {
      const data = await lookupCivicInfo(addressInput)
      
      if (data.error || !data.pollingLocations?.length) {
        setMessages(prev => [...prev, { 
          id: crypto.randomUUID(),
          role: 'assistant', 
          content: `### 🔍 Lookup Info\n\n${data.error || "I couldn't find live data for that address."}\n\n**Tip:** Use **'Try Demo Data'** to see the full dashboard features!`,
          type: 'civic'
        }])
        setIsModalOpen(false)
        return
      }

      const polls = data.pollingLocations[0]
      const fullAddr = `${polls.address.line1}, ${polls.address.city}, ${polls.address.state}`
      
      updateBooth(polls.address.locationName, fullAddr)

      const coords = await geocodeAddress(fullAddr) || await geocodeAddress(addressInput)
      
      setMessages(prev => [...prev, { 
        id: crypto.randomUUID(),
        role: 'assistant', 
        content: `### Voting Info for ${addressInput}\n\n**Location:** ${polls.address.locationName}\n**Address:** ${fullAddr} ${polls.address.zip}`,
        type: 'civic',
        coords: coords ? [coords.lat, coords.lon] : null,
        locationName: polls.address.locationName
      }])
      setIsModalOpen(false)
      setAddressInput('')
    } catch {
      alert("Failed to fetch civic information. Please try again later.")
    } finally {
      setIsSearchingAddress(false)
    }
  }

  const handleDemoBooth = () => {
    const sample = { name: "Dispur Govt. School", addr: "Dispur, Guwahati, Assam 781006" }
    trackEvent('demo_mode_activated')
    updateBooth(sample.name, sample.addr)
    setMessages(prev => [...prev, { 
      id: crypto.randomUUID(),
      role: 'assistant', 
      content: `### 🎯 Demo Activated\n\nI've populated your dashboard with a **Sample Polling Booth** in Dispur.`,
      type: 'civic'
    }])
    setIsModalOpen(false)
  }

  const clearHistory = () => {
    if (window.confirm("Clear your chat history?")) {
      setMessages([])
      localStorage.removeItem('election_chat_history')
      trackEvent('chat_history_cleared')
    }
  }

  return (
    <div className="app-container" role="application" aria-label="Assam Election Assistant">
      <Header health={health} setIsModalOpen={setIsModalOpen} clearHistory={clearHistory} />

      <main className="chat-interface" role="main">
        <div className="messages-container u-hide-scrollbar" role="log" aria-live="polite">
          {messages.length === 0 ? (
            !user && <WelcomeCard setInput={setInput} handleSend={() => setTimeout(() => document.getElementById('send-query-btn')?.click(), 50)} />
          ) : (
            messages.map((msg, idx) => <ChatMessage key={msg.id || idx} msg={msg} />)
          )}
          
          {user && (
            <div id="dashboard-section" className="persistent-dashboard">
              <Dashboard user={user} voterData={voterData} setInput={setInput} handleSend={handleSend} />
            </div>
          )}
          {isLoading && <ChatMessage msg={{ role: 'assistant', content: '' }} isLoading={true} />}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput input={input} setInput={setInput} handleSend={handleSend} isLoading={isLoading} />
      </main>

      <AddressModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddressLookup} onDemo={handleDemoBooth}
        addressInput={addressInput} setAddressInput={setAddressInput}
        isSearching={isSearchingAddress}
      />

      <aside className="fab-links">
        <a href="https://ceoassam.nic.in" target="_blank" rel="noopener noreferrer" className="fab-btn u-flex-center" title="CEO Assam Portal">
          <AlertCircle size={28} />
        </a>
      </aside>
    </div>
  )
}

export default App
