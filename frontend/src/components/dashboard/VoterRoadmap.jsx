import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Download, FileText } from 'lucide-react';
import { getVoterGuideUrl, trackEvent } from '../../firebase';

/**
 * VoterRoadmap component displays the checklist of steps for the election process.
 * @param {Object} props
 * @param {Array} props.steps - The list of voter steps from voterData.
 */
const VoterRoadmap = ({ steps }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    trackEvent('download_voter_guide');
    const url = await getVoterGuideUrl();
    window.open(url, '_blank');
    setIsDownloading(false);
  };

  return (
    <div className="dashboard-card roadmap-card">
      <div className="card-header">
        <Clock size={20} className="text-primary" />
        <h3>Voter Roadmap</h3>
      </div>
      
      <div className="roadmap-steps">
        {steps.map((step) => (
          <div key={step.id} className={`roadmap-step ${step.completed ? 'completed' : ''}`}>
            <div className="step-icon">
              {step.completed ? (
                <CheckCircle2 size={24} className="text-success" />
              ) : (
                <Circle size={24} className="text-muted" />
              )}
            </div>
            <div className="step-content">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="roadmap-footer">
        <div className="resource-banner">
          <FileText size={16} />
          <span>Voter Resources</span>
        </div>
        <button 
          className="btn btn-outline btn-sm download-btn" 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          <Download size={16} />
          {isDownloading ? 'Fetching...' : 'Official Voter Guide'}
        </button>
      </div>
    </div>
  );
};

export default VoterRoadmap;
