# MindForge — GenAI Mind Map Generator

MindForge converts unstructured text into visual, exportable mind maps using a multi-agent GenAI pipeline.

## System Architecture

The system uses a sequential pipeline of specialized agents:
1. **Planner Agent**: Analyzes raw input and extracts key themes.
2. **Structurer Agent**: Converts themes into a hierarchical tree.
3. **Validator Agent**: Ensures the tree follows strict structural rules.
4. **Enhancer Agent**: Adds colors, icons, and tags for visual richness.
5. **Renderer Agent**: Computes layout and positions.
6. **Exporter Agent**: Prepares data for Miro/PNG/PDF export.
7. **Tester Agent**: Performs a final quality check and provides a score.

## Setup Instructions

### Backend (FastAPI)
1. Navigate to `mindforge/backend`.
2. Install dependencies: `pip install -r requirements.txt`
3. Create a `.env` file from `.env.example` and add your `GROK_API_KEY`.
4. Run the server: `uvicorn main:app --reload`

### Frontend (React + Vite)
1. Navigate to `mindforge/frontend`.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open your browser to the provided URL (usually `http://localhost:5173`).

## Testing
- Run backend tests: `PYTHONPATH=. pytest mindforge/backend/tests`

## Technologies Used
- **Backend**: Python, FastAPI, httpx, pydantic
- **Frontend**: React, Vite, Tailwind CSS, D3.js, Lucide React
- **GenAI**: xAI Grok-3-mini
