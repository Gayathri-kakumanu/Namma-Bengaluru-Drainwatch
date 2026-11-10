from pathlib import Path
from datetime import datetime, timezone
import json
import sqlite3
import uuid

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .agents import run_agent_workflow
from .risk_engine import calculate_risk

BASE = Path(__file__).resolve().parent.parent
DB_PATH = BASE / "drainwatch.db"
UPLOAD_DIR = BASE / "uploads"
FRONTEND_DIR = BASE / "frontend"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="DrainWatch AI", version="1.0.0",
              description="Prototype for explainable drainage-risk triage and civic response tracking.")

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            area TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            blockage_severity INTEGER NOT NULL,
            rainfall_score INTEGER NOT NULL,
            site_vulnerability INTEGER NOT NULL,
            historical_waterlogging INTEGER NOT NULL,
            risk_score INTEGER NOT NULL,
            risk_level TEXT NOT NULL,
            priority TEXT NOT NULL,
            recommended_action TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Submitted',
            evidence_filename TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)
        count = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
        if count == 0:
            seed_reports()

def seed_reports():
    samples = [
        ("Water accumulation near underpass", "Demo report: visible standing water after rainfall.", "Bellandur", 12.9250, 77.6760, 70, 80, 85, 70),
        ("Possible drain blockage", "Demo report: waste observed near a roadside drain.", "Koramangala", 12.9352, 77.6245, 85, 55, 60, 50),
        ("Routine drainage inspection", "Demo report: minor debris near drain inlet.", "Jayanagar", 12.9250, 77.5838, 25, 20, 30, 20),
    ]
    now = datetime.now(timezone.utc).isoformat()
    with connect() as conn:
        for title, desc, area, lat, lon, b, r, v, h in samples:
            result = calculate_risk(b, r, v, h)
            action = run_agent_workflow({
                "blockage_severity": b, "rainfall_score": r,
                "site_vulnerability": v, "historical_waterlogging": h,
                "evidence_filename": None, "latitude": lat, "longitude": lon
            })["recommended_action"]
            conn.execute("""
                INSERT INTO reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4())[:8], title, desc, area, lat, lon, b, r, v, h,
                  result.score, result.level, result.priority, action, "Submitted", None, now, now))

@app.on_event("startup")
def startup():
    init_db()

def row_to_dict(row):
    return dict(row)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "DrainWatch AI"}

@app.get("/api/reports")
def get_reports():
    with connect() as conn:
        rows = conn.execute("SELECT * FROM reports ORDER BY risk_score DESC, created_at DESC").fetchall()
    return [row_to_dict(r) for r in rows]

@app.get("/api/dashboard")
def dashboard():
    reports = get_reports()
    counts = {"total": len(reports), "critical": 0, "high": 0, "moderate": 0, "low": 0, "open": 0}
    for r in reports:
        counts[r["risk_level"].lower()] += 1
        if r["status"] not in ("Resolved", "Closed"):
            counts["open"] += 1
    return counts

@app.post("/api/reports")
async def create_report(
    title: str = Form(...),
    description: str = Form(...),
    area: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    blockage_severity: int = Form(...),
    rainfall_score: int = Form(...),
    site_vulnerability: int = Form(...),
    historical_waterlogging: int = Form(...),
    evidence: UploadFile | None = File(default=None)
):
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise HTTPException(400, "Invalid coordinates")
    for value in (blockage_severity, rainfall_score, site_vulnerability, historical_waterlogging):
        if not 0 <= value <= 100:
            raise HTTPException(400, "All risk inputs must be between 0 and 100")

    evidence_name = None
    if evidence and evidence.filename:
        suffix = Path(evidence.filename).suffix.lower()
        if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
            raise HTTPException(400, "Evidence must be JPG, PNG or WEBP")
        evidence_name = f"{uuid.uuid4().hex}{suffix}"
        data = await evidence.read()
        if len(data) > 5 * 1024 * 1024:
            raise HTTPException(400, "Image must be 5 MB or smaller")
        (UPLOAD_DIR / evidence_name).write_bytes(data)

    risk = calculate_risk(blockage_severity, rainfall_score, site_vulnerability, historical_waterlogging)
    report = {
        "blockage_severity": blockage_severity,
        "rainfall_score": rainfall_score,
        "site_vulnerability": site_vulnerability,
        "historical_waterlogging": historical_waterlogging,
        "evidence_filename": evidence_name,
        "latitude": latitude, "longitude": longitude
    }
    workflow = run_agent_workflow(report)
    now = datetime.now(timezone.utc).isoformat()
    report_id = str(uuid.uuid4())[:8]
    with connect() as conn:
        conn.execute("""
            INSERT INTO reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (report_id, title, description, area, latitude, longitude,
              blockage_severity, rainfall_score, site_vulnerability, historical_waterlogging,
              risk.score, risk.level, risk.priority, workflow["recommended_action"],
              "Submitted", evidence_name, now, now))
    return {"id": report_id, "risk": workflow["risk"], "workflow": workflow}

@app.get("/api/reports/{report_id}/analysis")
def report_analysis(report_id: str):
    with connect() as conn:
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Report not found")
    report = row_to_dict(row)
    return run_agent_workflow(report)

@app.patch("/api/reports/{report_id}/status")
def update_status(report_id: str, payload: dict):
    allowed = {"Submitted", "Under Review", "Inspection Scheduled", "In Progress", "Resolved", "Closed"}
    status = payload.get("status")
    if status not in allowed:
        raise HTTPException(400, f"Status must be one of: {', '.join(sorted(allowed))}")
    now = datetime.now(timezone.utc).isoformat()
    with connect() as conn:
        cur = conn.execute("UPDATE reports SET status = ?, updated_at = ? WHERE id = ?", (status, now, report_id))
        if cur.rowcount == 0:
            raise HTTPException(404, "Report not found")
    return {"id": report_id, "status": status, "updated_at": now}

@app.get("/uploads/{filename}")
def get_upload(filename: str):
    path = UPLOAD_DIR / Path(filename).name
    if not path.exists():
        raise HTTPException(404, "File not found")
    return FileResponse(path)

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
def home():
    return FileResponse(FRONTEND_DIR / "index.html")
