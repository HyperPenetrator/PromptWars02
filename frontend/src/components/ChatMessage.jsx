import ReactMarkdown from 'react-markdown'
import { User, Bot } from 'lucide-react'
import MapDisplay from './MapDisplay'

const ChatMessage = ({ msg, isLoading = false }) => {
  const isAssistant = msg.role === 'assistant';
  const isCivic = msg.type === 'civic';

  return (
    <article 
      className={`message-wrapper ${msg.role} ${isCivic ? 'civic' : ''}`}
      aria-label={`${isAssistant ? 'Election Assistant' : 'Voter'} message`}
    >
      <div 
        className={`avatar u-flex-center ${isLoading ? 'pulse' : ''}`}
        aria-hidden="true"
      >
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>
      
      <div 
        className={`message-bubble u-glass ${isLoading ? 'shimmer' : ''}`}
        role={isAssistant ? "status" : "none"}
        aria-live={isAssistant ? "polite" : "off"}
      >
        {isLoading ? (
          <span className="pulse">Verifying official election data...</span>
        ) : (
          <div className="message-content">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
            {msg.coords && (
              <section 
                className="map-section" 
                aria-label={`Polling location map for ${msg.locationName || 'selected area'}`}
              >
                <MapDisplay coords={msg.coords} locationName={msg.locationName} />
              </section>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ChatMessage;
