# DrainWatch AI — IBM Bobathon Starter

An end-to-end prototype for drainage reporting, transparent risk scoring, agent-style triage, and civic response tracking.

## Important prototype boundaries
- The included agents are deterministic, explainable workflow agents. They are not presented as a trained flood-prediction model.
- Uploaded photos are stored as evidence. This starter does **not** claim computer-vision detection from photos.
- Rainfall, blockage, site vulnerability, and historical-waterlogging inputs are supplied by the reporter/officer or seeded demo data.
- The score is a prioritisation heuristic, not a probability of flooding or an official warning.
- Alerts are drafts for human review. The app does not contact emergency services or dispatch crews.

## Requirements
- Python 3.10+
- A modern browser
- Internet connection for Leaflet/OpenStreetMap map tiles (optional; the app still works without the map tiles)

## Run on Windows
1. Extract the ZIP.
2. Open the extracted `DrainWatch_AI` folder in IBM Bob or VS Code.
3. Open a terminal in this folder.
4. Create and activate a virtual environment:

```powershell
py -m venv .venv
.venv\Scripts\activate
```

5. Install dependencies and start the API:

```powershell
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

6. Open `http://127.0.0.1:8000` in your browser.
7. API documentation: `http://127.0.0.1:8000/docs`

## Demo flow
1. Open the dashboard and review the seeded sample reports.
2. Submit a new report with a location, blockage severity, rainfall level, site vulnerability, and optional photo.
3. Review the generated risk score, risk band, agent findings, and recommended action.
4. Change a report status from the dashboard to demonstrate human-in-the-loop tracking.

## Risk score
`risk = 0.35 * blockage + 0.35 * rainfall + 0.20 * site_vulnerability + 0.10 * historical_waterlogging`

Each input is 0–100. The result is clamped to 0–100.
- 0–29: Low
- 30–49: Moderate
- 50–74: High
- 75–100: Critical

These are initial demo weights and thresholds. Validate them against verified historical incident data before operational use.

## Data model
The SQLite `reports` table stores:
- id, title, description, area, latitude, longitude
- blockage_severity, rainfall_score, site_vulnerability, historical_waterlogging
- risk_score, risk_level, priority, recommended_action
- status, evidence_filename, created_at, updated_at

## Suggested next steps
- Add a verified image classifier and evaluate it on a labelled dataset.
- Integrate an authorised rainfall/nowcast source; show source and timestamp beside each value.
- Add duplicate-report clustering by distance and time.
- Add role-based officer login and an audit log.
- Add notification delivery only after a human approves an alert.
- Validate risk weights with historical Bengaluru waterlogging and drainage data.

## IBM Bob story
Use the prompts in `docs/IBM_BOB_PROMPTS.md`. Capture screenshots of Bob's Plan, Agent, test-generation, debugging, and documentation work for the submission.

## Image attribution

The Vidhana Soudha background image (rontend/vidhana_soudha.jpg) is by Rameshng at Malayalam Wikipedia, sourced from Wikimedia Commons.

- Source: https://commons.wikimedia.org/wiki/File:Vidhan_Soudha_Bangalore_Front_view.JPG
- Licence: [Creative Commons Attribution-ShareAlike 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
