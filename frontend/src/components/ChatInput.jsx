import { Send } from 'lucide-react'

export default function ChatInput({ input, setInput, handleSend, isLoading }) {
  return (
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
  )
}
