# Election Process Education Assistant

An impartial, AI-powered conversational guide designed to help citizens navigate the complexities of the election process. Built for the Promptwars challenge, this assistant leverages Google's state-of-the-art AI and Civic Data services to provide accurate, location-based voting information.

## 🗳️ Chosen Vertical: Election Process Education
Our solution focuses on empowering voters by providing clear, step-by-step guidance on registration, voting deadlines, polling locations, and identification requirements.

## 💡 Approach and Logic
- **Google Gemini API (`gemini-1.5-flash`)**: Acts as the core reasoning engine. It interprets natural language queries and generates accessible, impartial responses formatted in Markdown for readability.
- **Google Civic Information API**: Provides real-world grounding by fetching live election data, including voter registration status links, polling place addresses, and local representative information based on user-provided addresses.
- **Context Management**: The assistant maintains the last five messages of conversational history to ensure continuity and logical decision-making during the interaction.
- **Accessibility First**: Built with semantic HTML, ARIA labels, and high-contrast glassmorphism UI to ensure all citizens can access vital information.

## 🚀 How It Works

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google API Key (Gemini)
- Google Civic Information API Key

### Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repo-url>
   cd election-assistant
   ```

2. **Backend Setup**:
   Ensure you are in the project root directory, then run:
   ```bash
   pip install -r requirements.txt
   # Create a .env file based on .env.example
   python -m uvicorn backend.main:app --reload
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Running Locally
- The backend will run on `http://localhost:8000`.
- The frontend will run on `http://localhost:5173`.
- Access the chat interface to start asking voting-related questions.

## ⚠️ Assumptions & Constraints
- **Location Scope**: Currently optimized for US-based addresses for Google Civic API data.
- **API Keys**: Requires valid API keys for Google Gemini and Google Civic Information services.
- **Impartiality**: The assistant is programmed to remain strictly non-partisan and will direct users to official sources (e.g., Vote.gov) for critical legal advice.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Lucide Icons, React Markdown.
- **Backend**: FastAPI (Python), Google Generative AI SDK.
- **Testing**: Pytest for backend endpoint validation.
- **Styling**: Vanilla CSS (Glassmorphism + Modern Gradients).

---
*Built with ❤️ for a more informed democracy.*
