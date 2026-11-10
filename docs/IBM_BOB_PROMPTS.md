# IBM Bob prompt pack — DrainWatch AI

Use IBM Bob's **Plan mode** for architecture and **Agent mode** for implementation. Review proposed changes before accepting them. Bob supports code generation, refactoring, debugging, documentation, Plan/Ask/Agent modes and subagents; see https://bob.ibm.com/docs/ide.

## Prompt 1 — Initialise project context
I am building DrainWatch AI for IBM Bobathon: an agent-assisted Bengaluru drainage reporting and risk-prioritisation prototype. Read the repository. Create/refresh AGENTS.md with the project goal, stack (FastAPI, SQLite, vanilla JS/Leaflet), API contracts, risk formula, privacy rules, test commands and strict prototype boundaries. Do not claim that photos are computer-vision classified or that risk scores are flood probabilities. Do not overwrite working code.

## Prompt 2 — Plan mode architecture review
Review the current architecture. Identify the smallest high-impact improvements possible before the hackathon deadline. Prioritise reliability, explainability, accessibility, privacy and a complete demo. Return a phased plan with files to change, acceptance criteria and risks. Do not implement yet.

## Prompt 3 — Agent mode implement evidence validation
Improve evidence upload security: validate MIME type and file signature, enforce file-size limits, generate safe filenames, reject unsupported formats, and avoid exposing raw user filenames. Add tests. Do not add face recognition or identify people in images.

## Prompt 4 — Agent mode add duplicate detection
Implement a transparent duplicate-report suggestion based on nearby coordinates and a configurable time window. It must suggest possible duplicates to an officer, never silently delete or merge citizen reports. Add tests for distance thresholds and false-positive handling.

## Prompt 5 — Agent mode add official weather adapter
Create a pluggable rainfall provider interface. Keep the demo provider as the default. Add an IMD adapter only after verifying current API access requirements and response schema from official documentation. Store source, observation time, location coverage and freshness. If unavailable or stale, label the data unavailable and do not silently substitute demo values.

## Prompt 6 — Agent mode explainability
For every risk score, show the four input values, weights, weighted contributions, score band and limitations. Add an "insufficient data" state. Never label the heuristic as a trained ML prediction or probability.

## Prompt 7 — Testing
Run the backend tests and inspect frontend flows. Test invalid coordinates, out-of-range risk values, unsupported image types, oversized images, status transitions, empty reports and risk-band boundaries. Fix failures and report exactly which tests ran and their results.

## Prompt 8 — Security and privacy review
Review upload handling, input validation, database queries, error messages, map data and privacy. Recommend minimal data collection, no unnecessary personal details, human approval for alerts and no automatic emergency dispatch. Fix high-risk issues and add tests.

## Prompt 9 — Submission documentation
Generate a concise architecture document, setup guide, API reference, test report, limitations, measurable-impact methodology and demo script. Distinguish implemented features from future work. Do not invent performance metrics or claim real civic integration.

## Prompt 10 — Final review
Act as a hackathon judge. Score completeness, innovation, usability and impact out of five each. Identify evidence required for every score. Run the application and tests, list known bugs, and propose only critical final fixes.
