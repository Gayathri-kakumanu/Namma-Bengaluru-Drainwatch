# Data dictionary

| Field | Type | Meaning |
|---|---|---|
| id | string | Generated report identifier |
| title | text | Short issue title |
| description | text | Citizen's observation |
| area | text | Area or landmark |
| latitude / longitude | decimal | Reported map coordinates |
| blockage_severity | integer 0–100 | Assessed blockage indicator |
| rainfall_score | integer 0–100 | Supplied rainfall-risk indicator |
| site_vulnerability | integer 0–100 | Site vulnerability indicator |
| historical_waterlogging | integer 0–100 | Historical indicator |
| risk_score | integer 0–100 | Weighted triage score |
| risk_level | enum | Low, Moderate, High, Critical |
| priority | text | Suggested inspection priority |
| recommended_action | text | Agent-generated recommendation |
| status | enum | Submitted, Under Review, Inspection Scheduled, In Progress, Resolved, Closed |
| evidence_filename | text nullable | Stored photo evidence filename |
| created_at / updated_at | ISO timestamp | Audit timestamps |

The four input indicators are prototype inputs, not verified measurements unless a source and timestamp are attached.
