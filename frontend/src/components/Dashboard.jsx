import { CheckCircle2, Circle, MapPin, ChevronRight, Bookmark } from 'lucide-react'

export default function Dashboard({ user, voterData, setInput, handleSend }) {
  const completionPercentage = Math.round(
    (voterData.steps.filter(s => s.completed).length / voterData.steps.length) * 100
  )

  const quickActions = [
    "How do I check my name in the voter list?",
    "Where is my polling booth?",
    "What documents are needed for voting?",
    "Who are the candidates in my area?"
  ]

  return (
    <div className="dashboard-container">
      <div className="dashboard-header glass-card">
        <div className="user-welcome">
          <div className="avatar-large">
            <img src={user?.photoURL} alt={user?.displayName} />
          </div>
          <div>
            <h2>Welcome back, {user?.displayName.split(' ')[0]}!</h2>
            <p className="u-text-muted">You are {completionPercentage}% ready for the election.</p>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="voter-roadmap glass-card">
          <h3 className="section-title">
            <CheckCircle2 size={18} className="u-text-accent" />
            Your Voter Journey
          </h3>
          <div className="steps-list">
            {voterData.steps.map((step) => (
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

        <div className="side-column">
          <section className="saved-booth glass-card">
            <h3 className="section-title">
              <MapPin size={18} className="u-text-accent" />
              Your Polling Booth
            </h3>
            {voterData.savedBooth ? (
              <div className="booth-info">
                <p className="booth-name">{voterData.savedBooth.name}</p>
                <p className="booth-address">{voterData.savedBooth.address}</p>
                <button className="btn-text">View on Map <ChevronRight size={14} /></button>
              </div>
            ) : (
              <div className="booth-empty">
                <p>No booth saved yet.</p>
                <button className="btn-outline-sm" onClick={() => document.getElementById('poll-finder-trigger').click()}>
                  Find My Booth
                </button>
              </div>
            )}
          </section>

          <section className="quick-actions glass-card">
            <h3 className="section-title">
              <Bookmark size={18} className="u-text-accent" />
              Quick Questions
            </h3>
            <div className="action-chips">
              {quickActions.map((action, i) => (
                <button 
                  key={i} 
                  className="chip"
                  onClick={() => {
                    setInput(action)
                    handleSend()
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
