# Zypp Nexus AI — One-Page Summary

## What This System Does
Zypp Nexus AI is an AI-powered operating system for managing Zypp Electric's EV delivery hubs. It replaces reactive, spreadsheet-driven operations with a live command center that continuously monitors 750+ vehicles and 600+ riders across 5 Delhi NCR hubs. The system ingests real-time telemetry (battery, location, health), predicts failures before breakdowns, forecasts demand by zone and hour, optimizes charging schedules, and auto-generates a plain-language CEO briefing every morning. Eleven integrated modules give a Hub CEO full visibility: from a network-wide alert map down to a single vehicle's digital twin with failure-risk scoring. The Scenario Simulator lets the CEO test "what-if" decisions (add riders, increase maintenance budget, raise AI autonomy) and see projected revenue, margin, uptime, and CO₂ impact instantly. All AI scoring functions are architecturally real—weighted formulas for Vehicle Health, Hub Autonomy, City Expansion, and Demand Prediction—so they can be swapped for production models without rewiring the UI.

## The Single Metric It Moves First
**Vehicle Uptime** (target: +25% reduction in downtime over 90 days). Uptime is the lever that cascades into every other KPI: more available vehicles → higher rider utilization → more deliveries → higher revenue → better margin → lower per-unit maintenance cost. The Predictive Maintenance Engine flags critical-risk vehicles 48–72 hours before breakdown; the Charging Scheduler shifts load to off-peak hours; the Fleet Optimizer rebalances idle vehicles to high-demand zones. Together these agents aim to lift fleet uptime from ~78% to ~92%, which the simulator projects adds ₹18–22L/month in incremental margin per hub.

## Week 1 vs. Month 3

### Week 1 (Foundation & Trust)
- **Deploy** the 11-module dashboard on a staging URL with live mock data (already complete).
- **Instrument** the 5 Delhi NCR hubs: connect vehicle telemetry (battery %, GPS, odometer), charger status, rider app events, and service logs to the API layer (marked `// TODO: Replace with real API calls` in `src/lib/mock-data.ts`).
- **Calibrate** scoring weights: run historical breakdown data through the Vehicle Health formula; tune autonomy thresholds against the last 90 days of escalation tickets.
- **Validate** the CEO Briefing narrative against the outgoing Hub CEO's actual morning notes—ensure risks/opportunities match human judgment.
- **Train** the Hub CEO and 2 deputies on the Scenario Simulator; run 3 live "what-if" sessions (add 20 riders, shift 30% charging off-peak, raise autonomy to 80%).

### Month 3 (Autonomy & Expansion)
- **Automate** ≥70% of routine decisions: charging schedules, rider-vehicle assignment, preventive maintenance work orders, demand-based rebalancing—all executed by agents without human approval.
- **Launch** the Expansion Oracle's top-ranked city (Hyderabad, score 82/100): run feasibility study, secure 200-vehicle commitment, hire local ops lead.
- **Close the loop** on predictions: feed actual breakdown outcomes back into the Maintenance Predictor to improve precision/recall; target <15% false-positive rate on critical-risk flags.
- **Integrate** external signals: weather API (demand dampening), traffic API (route optimizer), grid API (dynamic charging rates).
- **Handoff** a documented, API-first system to the central tech team with OpenAPI specs, data contracts, and runbooks—ready for multi-hub rollout across 8 cities by Month 6.