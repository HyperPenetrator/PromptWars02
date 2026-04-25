export default function WelcomeCard({ setInput, handleSend }) {
  return (
    <div className="welcome-overlay">
      <section className="welcome-card u-glass" aria-labelledby="welcome-heading">
        <h2 id="welcome-heading">Civic Education Portal</h2>
        <p>Welcome to the official education assistant for the Assam Election process. Ask about voter registration, EPIC cards, or the ECI process.</p>
        <div className="suggestions" role="group" aria-label="Suggested education topics">
          <button className="suggestion-pill u-focus-ring" onClick={() => { setInput("How to register as a new voter in Assam?"); handleSend(); }}>Voter Registration</button>
          <button className="suggestion-pill u-focus-ring" onClick={() => { setInput("What is an EPIC card and how to get it?"); handleSend(); }}>EPIC Card Info</button>
          <button className="suggestion-pill u-focus-ring" onClick={() => { setInput("Check my name in electoral roll Assam"); handleSend(); }}>Check Roll</button>
        </div>
      </section>
    </div>
  )
}
