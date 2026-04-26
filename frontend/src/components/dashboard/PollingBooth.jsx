import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';

/**
 * PollingBooth component displays the saved booth info or a call-to-action to find it.
 * @param {Object} props
 * @param {Object} props.savedBooth - The saved booth data from voterData.
 */
export default function PollingBooth({ savedBooth }) {
  return (
    <section className="saved-booth glass-card">
      <h3 className="section-title">
        <MapPin size={18} className="u-text-accent" />
        Your Polling Booth
      </h3>
      {savedBooth ? (
        <div className="booth-info">
          <p className="booth-name">{savedBooth.name}</p>
          <p className="booth-address">{savedBooth.address}</p>
          <button className="btn-text" aria-label="View polling booth on map">
            View on Map <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="booth-empty">
          <p>No booth saved yet.</p>
          <button 
            className="btn-outline-sm" 
            onClick={() => document.getElementById('poll-finder-trigger')?.click()}
            aria-label="Open poll finder"
          >
            Find My Booth
          </button>
        </div>
      )}
    </section>
  );
}
