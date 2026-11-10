from dataclasses import dataclass

@dataclass
class RiskResult:
    score: int
    level: str
    priority: str

def calculate_risk(blockage: int, rainfall: int, vulnerability: int, history: int) -> RiskResult:
    """Transparent prototype prioritisation score, not a flood probability."""
    values = [blockage, rainfall, vulnerability, history]
    if any(v < 0 or v > 100 for v in values):
        raise ValueError("Risk inputs must be between 0 and 100")

    score = round(
        0.35 * blockage +
        0.35 * rainfall +
        0.20 * vulnerability +
        0.10 * history
    )

    if score >= 75:
        level, priority = "Critical", "P1 — Immediate inspection"
    elif score >= 50:
        level, priority = "High", "P2 — Urgent inspection"
    elif score >= 30:
        level, priority = "Moderate", "P3 — Schedule inspection"
    else:
        level, priority = "Low", "P4 — Routine monitoring"

    return RiskResult(score=score, level=level, priority=priority)
