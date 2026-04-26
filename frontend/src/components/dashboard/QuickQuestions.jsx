import React from 'react';
import { Bookmark } from 'lucide-react';

/**
 * QuickQuestions component provides a list of common questions as actionable chips.
 * @param {Object} props
 * @param {Function} props.setInput - Function to set the chat input.
 * @param {Function} props.handleSend - Function to trigger the message send.
 */
export default function QuickQuestions({ setInput, handleSend }) {
  const quickActions = [
    "How do I check my name in the voter list?",
    "Where is my polling booth?",
    "What documents are needed for voting?",
    "Who are the candidates in my area?"
  ];

  return (
    <section className="quick-actions glass-card">
      <h3 className="section-title">
        <Bookmark size={18} className="u-text-accent" />
        Quick Questions
      </h3>
      <div className="action-chips">
        {quickActions.map((action, i) => (
          <button 
            key={i} 
            className="chip u-focus-ring"
            onClick={() => {
              setInput(action);
              handleSend();
            }}
            aria-label={`Ask: ${action}`}
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}
