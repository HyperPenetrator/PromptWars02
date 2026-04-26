import React from 'react';
import DashboardHeader from './dashboard/DashboardHeader';
import VoterRoadmap from './dashboard/VoterRoadmap';
import PollingBooth from './dashboard/PollingBooth';
import QuickQuestions from './dashboard/QuickQuestions';

/**
 * Dashboard component serves as the main overview for authenticated users.
 * Orchestrates sub-modules for a clean, maintainable enterprise structure.
 * 
 * @param {Object} props
 * @param {Object} props.user - Current authenticated Firebase user.
 * @param {Object} props.voterData - Current voter progress and saved info.
 * @param {Function} props.setInput - State setter for the main chat input.
 * @param {Function} props.handleSend - Handler for submitting chat messages.
 */
export default function Dashboard({ user, voterData, setInput, handleSend }) {
  // Logic: Calculate readiness based on completed steps
  const completionPercentage = Math.round(
    (voterData.steps.filter(s => s.completed).length / voterData.steps.length) * 100
  );

  return (
    <div className="dashboard-container" id="dashboard-section">
      {/* 1. Welcome & Progress Header */}
      <DashboardHeader 
        user={user} 
        completionPercentage={completionPercentage} 
      />

      <div className="dashboard-grid">
        {/* 2. Primary Content: Step-by-Step Roadmap */}
        <VoterRoadmap steps={voterData.steps} />

        <div className="side-column">
          {/* 3. Secondary Content: Contextual Polling Info */}
          <PollingBooth savedBooth={voterData.savedBooth} />

          {/* 4. Utility: Quick Interaction Chips */}
          <QuickQuestions setInput={setInput} handleSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
