# 🌧️ DrainWatch AI — Namma Bengaluru

### AI-Powered Drainage Reporting, Risk Assessment & Civic Response Tracking

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-SQLite-blue.svg)](https://www.sqlite.org/)
[![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-orange.svg)]()
[![Hosting](https://img.shields.io/badge/Hosted%20on-Render-purple.svg)](https://render.com/)

**DrainWatch AI** is an end-to-end civic technology prototype designed to improve drainage monitoring and waterlogging response in Bengaluru.

The platform enables residents to report blocked or overflowing drains, evaluates reports using a transparent risk-scoring system, uses explainable workflow agents for intelligent triage, and helps civic officers monitor reports through a centralized dashboard.

🚀 **Built for the IBM Bobathon.**

---

## 🔗 Live Demo & Documentation

- 🌐 **Live Demo:** https://namma-bengaluru-drainwatch.onrender.com
- 📖 **API Documentation:** https://namma-bengaluru-drainwatch.onrender.com/docs

> **Note:** The demo is hosted on Render's free tier. The first request after inactivity may take up to a minute while the service wakes up. Data submitted to the public demo may be reset during redeployment. Please do not enter personal or sensitive information.

---

## 📌 Table of Contents

- [What It Does](#-what-it-does)
- [Key Features](#-key-features)
- [Important Prototype Boundaries](#-important-prototype-boundaries)
- [Technology Stack](#-technology-stack)
- [Requirements](#-requirements)
- [Installation & Local Setup](#-installation--local-setup)
- [Demo Workflow](#-demo-workflow)
- [Risk Scoring System](#-risk-scoring-system)
- [Database Structure](#-database-structure)
- [Future Enhancements](#-future-enhancements)
- [IBM Bobathon Integration](#-ibm-bobathon-integration)
- [Image Attribution](#-image-attribution)

---

## 🌟 What It Does

DrainWatch AI provides a centralized platform for drainage issue reporting, risk assessment, and civic response management.

1. **Drainage Reporting:** Residents and officers can report blocked or overflowing drains with location details, severity information, and optional photographs.
2. **Risk Assessment:** Each report receives an explainable risk score based on drainage blockage, rainfall, site vulnerability, and historical waterlogging.
3. **AI-Style Agent Triage:** Deterministic workflow agents analyze reports, explain their findings, and recommend appropriate actions.
4. **Interactive Dashboard:** Officers can view reported incidents and monitor their priority and current status.
5. **Map-Based Monitoring:** Reports can be reviewed geographically using an interactive map.
6. **Response Tracking:** Officers can update report statuses and track incidents toward resolution.

## ✨ Key Features

- Resident-friendly drainage complaint submission.
- Location-based incident reporting.
- Optional photographic evidence uploads.
- Transparent risk scoring and classification.
- Explainable agent-based report analysis.
- Recommended actions for different risk levels.
- Interactive dashboard for civic officers.
- Map visualization using Leaflet and OpenStreetMap.
- Human-in-the-loop complaint management.
- REST API with FastAPI documentation.

---

## ⚠️ Important Prototype Boundaries

This project is currently an experimental prototype.

- The included agents are deterministic, explainable workflow agents, not a trained flood-prediction model.
- Uploaded photographs are stored as supporting evidence. Automated computer-vision detection is not currently implemented.
- Rainfall, blockage, site vulnerability, and historical waterlogging inputs are provided by users, officers, or seeded demo data.
- Risk scores are prioritization heuristics, not probabilities of flooding or official warnings.
- Alerts are generated as drafts for human review.
- The application does not automatically contact emergency services or dispatch response teams.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Backend | Python |
| API Framework | FastAPI |
| Server | Uvicorn |
| Database | SQLite |
| Frontend | HTML, CSS, JavaScript |
| Interactive Maps | Leaflet |
| Map Data | OpenStreetMap |
| Hosting | Render |
| API Documentation | Swagger UI |

---

## 💻 Requirements

Before running the project locally, ensure you have:

- Python 3.10 or later.
- A modern web browser.
- Git (optional, for cloning the repository).
- VS Code or IBM Bob.
- Internet connection for loading map tiles.

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project directory:

```bash
cd DrainWatch_AI
```

### 2. Create a Virtual Environment

**Windows:**

```powershell
py -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Start the Application

```bash
uvicorn backend.main:app --reload
```

### 5. Open the Application

Once the server starts, open:

- **Application:** http://127.0.0.1:8000
- **API Documentation:** http://127.0.0.1:8000/docs

Your local DrainWatch AI application is now ready!

---

## 🔄 Demo Workflow

Follow these steps to explore the prototype:

1. Open the dashboard and review the sample drainage reports.
2. Submit a new drainage complaint.
3. Enter the location and relevant severity information.
4. Add rainfall level, site vulnerability, and optional photographic evidence.
5. Review the generated risk score and risk classification.
6. Examine the workflow agents' findings and recommended actions.
7. Update the report status through the officer dashboard.
8. Monitor the report until it reaches the resolution stage.

---

## 📊 Risk Scoring System

DrainWatch AI uses a weighted scoring model to prioritize drainage incidents.

### Risk Formula

```text
Risk Score =
    (0.35 × Blockage Severity) +
    (0.35 × Rainfall Score) +
    (0.20 × Site Vulnerability) +
    (0.10 × Historical Waterlogging)
```

Each input value ranges from **0 to 100**.

The final score is clamped between 0 and 100.

### Risk Classification

| Risk Score | Risk Level |
|---|---|
| 0–29 | 🟢 Low |
| 30–49 | 🟡 Moderate |
| 50–74 | 🟠 High |
| 75–100 | 🔴 Critical |

> These weights and thresholds are initial prototype settings. They should be validated against verified historical Bengaluru drainage and waterlogging incident data before operational deployment.

---

## 🗄️ Database Structure

The application uses SQLite to store drainage reports.

### Reports Table

| Field | Description |
|---|---|
| id | Unique report identifier |
| title | Report title |
| description | Incident description |
| area | Reported location |
| latitude | Geographic latitude |
| longitude | Geographic longitude |
| blockage_severity | Drainage blockage score |
| rainfall_score | Rainfall severity score |
| site_vulnerability | Location vulnerability score |
| historical_waterlogging | Historical waterlogging score |
| risk_score | Calculated risk score |
| risk_level | Risk classification |
| priority | Incident priority |
| recommended_action | Suggested response |
| status | Current report status |
| evidence_filename | Uploaded evidence filename |
| created_at | Report creation timestamp |
| updated_at | Last update timestamp |

---

## 🔮 Future Enhancements

Potential improvements for the next development phase:

- [ ] Integrate a verified AI-based drainage image classifier.
- [ ] Connect real-time rainfall and weather APIs.
- [ ] Implement duplicate complaint detection.
- [ ] Add distance-based incident clustering.
- [ ] Introduce secure role-based officer authentication.
- [ ] Implement an audit log for report updates.
- [ ] Add notification delivery after officer approval.
- [ ] Validate risk-scoring weights using historical Bengaluru data.
- [ ] Improve geographical visualization and incident analytics.
- [ ] Explore predictive waterlogging risk assessment using verified datasets.

---

## 🤖 IBM Bobathon Integration

DrainWatch AI was developed as part of the **IBM Bobathon**, exploring AI-assisted software development and agent-based workflows.

The project uses IBM Bob to support the development process.

For development prompts and workflow documentation, refer to:

[`docs/IBM_BOB_PROMPTS.md`](docs/IBM_BOB_PROMPTS.md)

Recommended submission evidence includes:

- IBM Bob Plan workflow screenshots.
- Agent execution screenshots.
- Test generation results.
- Debugging workflow screenshots.
- Documentation generation evidence.

---

## 🖼️ Image Attribution

The Vidhana Soudha background image used in the frontend (`frontend/vidhana_soudha.jpg`) is credited to **Rameshng**, sourced from Wikimedia Commons.

- **Source:** Vidhan Soudha Bangalore Front view.JPG
- **License:** Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0).

If the image has been resized, cropped, or otherwise modified, the adaptation must comply with the same license requirements.

---

## 👨‍💻 Project Information

**Project:** DrainWatch AI — Namma Bengaluru  
**Category:** AI-Powered Civic Technology  
**Purpose:** Drainage Reporting, Risk Assessment & Civic Response Tracking  
**Event:** IBM Bobathon

---

<p align="center">
  <b>🌧️ Building a Smarter, Safer & More Responsive Namma Bengaluru 🌆</b>
</p>

<p align="center">
  Made with ❤️ for a better Bengaluru.
</p>
