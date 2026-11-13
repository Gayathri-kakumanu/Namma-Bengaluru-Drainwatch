
DrainWatch AI — Namma Bengaluru

An end-to-end prototype for drainage reporting, transparent risk scoring, agent-style triage, and civic response tracking. Built for the IBM Bobathon.

🔗 Live demo: namma-bengaluru-drainwatch.onrender.com 📖 API docs: /docs

Note: If the demo is hosted on a free Render tier, the first request after a period of inactivity may take up to a minute while the service wakes up. Data submitted to the public demo may be reset on redeploy, so please don't enter personal or sensitive information.

Table of contents
What it does
Important prototype boundaries
Tech stack
Requirements
Run locally
Demo flow
Risk score
Data model
Suggested next steps
IBM Bob story
Image attribution
What it does
Lets residents and officers report blocked or overflowing drains with a location, severity inputs, and an optional photo.
Produces a transparent, explainable risk score and band for each report.
Runs deterministic workflow agents that explain their findings and suggest a recommended action.
Provides a dashboard and map for human officers to review reports and track status through to resolution.
Important prototype boundaries
The included agents are deterministic, explainable workflow agents. They are not presented as a trained flood-prediction model.
Uploaded photos are stored as evidence. This starter does not claim computer-vision detection from photos.
Rainfall, blockage, site vulnerability, and historical-waterlogging inputs are supplied by the reporter/officer or seeded demo data.
The score is a prioritisation heuristic, not a probability of flooding or an official warning.
Alerts are drafts for human review. The app does not contact emergency services or dispatch crews.
Tech stack
Backend: Python, FastAPI (served with Uvicorn)
Database: SQLite
Frontend: HTML/CSS/JavaScript with Leaflet and OpenStreetMap tiles
Hosting (demo): Render
Requirements
Python 3.10+
A modern browser
Internet connection for Leaflet/OpenStreetMap map tiles (optional; the app still works without the map tiles)
Run locally
Windows
Clone the repo or extract the ZIP.
Open the DrainWatch_AI folder in IBM Bob or VS Code.
Open a terminal in this folder.
Create and activate a virtual environment:
powershell
py -m venv .venv
.venv\Scripts\activate
Install dependencies and start the API:
powershell
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
Open http://127.0.0.1:8000 in your browser.
API documentation: http://127.0.0.1:8000/docs
macOS / Linux
bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload

Then open http://127.0.0.1:8000.

Demo flow
Open the dashboard (locally, or the live demo) and review the seeded sample reports.
Submit a new report with a location, blockage severity, rainfall level, site vulnerability, and optional photo.
Review the generated risk score, risk band, agent findings, and recommended action.
Change a report status from the dashboard to demonstrate human-in-the-loop tracking.
Risk score

risk = 0.35 * blockage + 0.35 * rainfall + 0.20 * site_vulnerability + 0.10 * historical_waterlogging

Each input is 0–100. The result is clamped to 0–100.

Score	Band
0–29	Low
30–49	Moderate
50–74	High
75–100	Critical

These are initial demo weights and thresholds. Validate them against verified historical incident data before operational use.

Data model

The SQLite reports table stores:

id, title, description, area, latitude, longitude
blockage_severity, rainfall_score, site_vulnerability, historical_waterlogging
risk_score, risk_level, priority, recommended_action
status, evidence_filename, created_at, updated_at
Suggested next steps
Add a verified image classifier and evaluate it on a labelled dataset.
Integrate an authorised rainfall/nowcast source; show source and timestamp beside each value.
Add duplicate-report clustering by distance and time.
Add role-based officer login and an audit log.
Add notification delivery only after a human approves an alert.
Validate risk weights with historical Bengaluru waterlogging and drainage data.
IBM Bob story

Use the prompts in docs/IBM_BOB_PROMPTS.md. Capture screenshots of Bob's Plan, Agent, test-generation, debugging, and documentation work for the submission.

Image attribution

The Vidhana Soudha background image (frontend/vidhana_soudha.jpg) is by Rameshng at Malayalam Wikipedia, sourced from Wikimedia Commons.

Source: Vidhan Soudha Bangalore Front view.JPG
Licence: Creative Commons Attribution-ShareAlike 3.0
If the image has been resized, cropped, or otherwise modified for this project, that counts as an adaptation and remains under the same licence.
