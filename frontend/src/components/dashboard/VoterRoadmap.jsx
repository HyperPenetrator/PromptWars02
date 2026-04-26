import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * VoterRoadmap component displays the checklist of steps for the election process.
 * @param {Object} props
 * @param {Array} props.steps - The list of voter steps from voterData.
 */
export default function VoterRoadmap({ steps }) {
  return (
    <section className="voter-roadmap glass-card">
      <h3 className="section-title">
        <CheckCircle2 size={18} className="u-text-accent" />
        Your Voter Journey
      </h3>
      <div className="steps-list">
        {steps.map((step) => (
          <div key={step.id} className={`step-item ${step.completed ? 'completed' : ''}`}>
            <div className="step-icon">
              {step.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </div>
            <div className="step-content">
              <h4>{step.title}</h4>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
