# Election Process Education Assistant - Project Plan

This document outlines the prerequisites, technology stack, Model Context Protocol (MCP) servers, and Antigravity IDE prompts to build the "Election Process Education" assistant, adhering to the specified challenge constraints.

## 1. Challenge Constraints & Requirements Checklist
Before starting, ensure all workspace and submission constraints are met:
- [ ] **Repository:** Public GitHub repository, size strictly **< 10 MB**.
- [ ] **Branching:** Work entirely on a **single branch** (no multiple branches).
- [ ] **Workflow:** Clone the empty repository directly inside **Google Antigravity**.
- [ ] **Submissions:** Maximum of 3 submission attempts.
- [ ] **Evaluation Criteria:** High code quality, secure implementations, efficient resource usage, proper testing, accessible design, and meaningful **Google Services** integration.

## 2. Prerequisites
- **GitHub Account:** To create the public repository.
- **Google Antigravity Access:** The designated IDE for building and pushing the code.
- **Google Cloud Console Project:** With billing enabled (if required) to generate API keys.
- **API Keys Needed:**
  - **Google Gemini API Key:** For the smart, dynamic conversational agent.
  - **Google Civic Information API Key:** To fetch real-world, location-based election data, polling places, and representative information.

## 3. Technology Stack
Given a strong background in rapid AI-driven prototyping and robust web technologies, the following stack is recommended:
* **Frontend:** React.js (or Next.js) for an interactive, accessible, and responsive chat interface.
* **Backend:** Python (FastAPI) or Node.js (Express) to handle API requests securely. 
* **AI Integration:** Google Gemini API (`gemini-1.5-flash` or `gemini-1.5-pro` for reasoning) to parse user questions and generate easy-to-follow election timelines.
* **Data & Services:** Google Civic Information API (for real election logic) and Google Maps API (to show polling locations).

## 4. MCP Servers to Utilize (Within Antigravity)
To give the assistant logical decision-making based on user context and real-time data, attach these MCP servers to your Antigravity environment:
1.  **`google-maps` / `location` MCP:** To understand the user's geographic context for specific local election timelines.
2.  **`google-search` / `brave-search` MCP:** To fetch the most up-to-date, real-world election news and official timeline announcements.
3.  **`memory` / `sqlite` MCP:** To retain conversational context across the session, fulfilling the "logical decision making based on user context" requirement.

## 5. Antigravity IDE Prompts (Meta-Prompts)

Use these sequential meta-prompts inside Google Antigravity to generate the application end-to-end while keeping the repository clean and under 10MB.

### Prompt 1: Project Initialization & Basic Server Setup
> "Initialize a new web application in this repository. Set up a Python FastAPI backend and a clean, lightweight React frontend. Ensure the total initial setup remains well under 10MB. Create a `.gitignore` to exclude `node_modules`, `.venv`, and any large binaries. Do not create any extra Git branches; keep everything on the `main` branch. Set up a basic health-check endpoint on the backend and display a simple 'Election Assistant Ready' screen on the frontend."

### Prompt 2: Integrating Google Services & AI Agent
> "Implement the core AI logic for the 'Election Process Education' assistant. Create a backend service that connects to the Google Gemini API. Give the Gemini model a system prompt instructing it to act as an impartial, accessible guide that explains election processes and timelines in simple terms. Additionally, integrate the Google Civic Information API so the assistant can pull real-world voter data based on a provided address. Ensure API keys are loaded securely via environment variables and never hardcoded."

### Prompt 3: Frontend Chat Interface & Accessibility
> "Build an interactive chat interface in the React frontend. The UI must be highly accessible (use proper ARIA labels, semantic HTML, and high contrast for visual clarity). The user should be able to type a question (e.g., 'How do I register to vote?' or 'When is the next local election?'). Send these queries to the FastAPI backend. Implement a loading state, and render the assistant's responses using Markdown so that steps and timelines are formatted as clean lists."

### Prompt 4: Context Management & Refinement
> "Update the chat application to maintain conversation history. Pass the last 5 messages along with the new user prompt to the backend to ensure the assistant demonstrates 'logical decision making based on user context'. Add error handling for network issues or invalid API keys. Write 3 simple unit tests for the backend endpoint using `pytest` to meet the 'Testing' evaluation criteria."

### Prompt 5: README Generation
> "Generate a comprehensive `README.md` file for this repository. It must explicitly include:
> 1. The chosen vertical: 'Election Process Education'.
> 2. The approach and logic (explaining how Gemini and Civic Information API are used together).
> 3. How the solution works (setup instructions, how to run locally).
> 4. Any assumptions made (e.g., requires US addresses for the Civic API, expects valid Google API keys).
> Ensure the README is formatted cleanly."

### Prompt 6: Final Audit & Git Push
> "Review the current workspace. Ensure the codebase is clean and maintainable. Confirm there are no large static assets that would push the repo size over 10MB. Once verified, stage all changes, write a descriptive commit message ('feat: implement complete election education assistant'), and push the changes directly to the remote repository on the single active branch."
