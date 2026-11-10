from datetime import datetime, timezone
from .risk_engine import calculate_risk

def evidence_agent(report: dict) -> dict:
    """Checks report completeness; photo is evidence, not automatically classified."""
    checks = []
    if report.get("evidence_filename"):
        checks.append("Photo evidence attached for human inspection.")
    else:
        checks.append("No photo attached; request a field inspection if needed.")
    if report.get("latitude") is None or report.get("longitude") is None:
        checks.append("Location coordinates are missing or approximate.")
    return {
        "agent": "Evidence Agent",
        "status": "review_required" if not report.get("evidence_filename") else "evidence_attached",
        "findings": checks
    }

def weather_agent(report: dict) -> dict:
    """Uses the rainfall score entered for this prototype; does not imply live weather."""
    rain = int(report["rainfall_score"])
    if rain >= 75:
        finding = "High rainfall-risk input. Verify against an official nowcast."
    elif rain >= 40:
        finding = "Moderate rainfall-risk input. Continue monitoring."
    else:
        finding = "Low rainfall-risk input. Recheck if conditions change."
    return {
        "agent": "Weather Agent",
        "status": "demo_input",
        "rainfall_score": rain,
        "findings": [finding, "Rainfall value is a supplied demo input, not a live observation."]
    }

def risk_agent(report: dict) -> dict:
    result = calculate_risk(
        int(report["blockage_severity"]),
        int(report["rainfall_score"]),
        int(report["site_vulnerability"]),
        int(report["historical_waterlogging"])
    )
    return {
        "agent": "Risk Agent",
        "score": result.score,
        "level": result.level,
        "priority": result.priority,
        "findings": [
            f"Blockage contribution: {round(0.35 * int(report['blockage_severity']))} / 35",
            f"Rainfall contribution: {round(0.35 * int(report['rainfall_score']))} / 35",
            f"Site vulnerability contribution: {round(0.20 * int(report['site_vulnerability']))} / 20",
            f"Historical indicator contribution: {round(0.10 * int(report['historical_waterlogging']))} / 10"
        ]
    }

def action_agent(risk: dict) -> dict:
    level = risk["level"]
    actions = {
        "Critical": "Escalate for immediate human review; verify site conditions and consider a temporary public caution.",
        "High": "Prioritise an on-site inspection and check drain inlet/outlet obstruction.",
        "Moderate": "Schedule inspection and monitor rainfall and repeat reports.",
        "Low": "Keep under routine monitoring; reassess if new evidence arrives."
    }
    return {
        "agent": "Action Agent",
        "recommended_action": actions[level],
        "requires_human_approval": True
    }

def run_agent_workflow(report: dict) -> dict:
    evidence = evidence_agent(report)
    weather = weather_agent(report)
    risk = risk_agent(report)
    action = action_agent(risk)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "agents": [evidence, weather, risk, action],
        "risk": risk,
        "recommended_action": action["recommended_action"],
        "human_approval_required": True
    }
