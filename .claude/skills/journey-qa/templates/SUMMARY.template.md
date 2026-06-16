# Customer Journey Test Summary — YYYY-MM-DD

Run with: blind `journey-tester` (Playwright MCP)  ·  target $JOURNEY_BASE

## Tally

| Status | Count | Journeys |
|--------|-------|----------|
| ✅ PASS | 0 | |
| ❌ FAIL | 0 | |
| ⛔ BLOCKED | 0 | |

## By category

| Category | Pass | Fail | Blocked |
|----------|------|------|---------|
| A_anonymous | | | |
| B_user | | | |
| C_admin | | | |
| D_edge | | | |

## Defects by severity

### 🔴 Critical
1. <one-line finding> — `JXXX` — pointer

### 🟡 Major
1. ...

### ⚪ Minor / UX
1. ...

## Still blocked (preconditions unmet)
- `JXXX` — <missing fixture / disabled feature / seed data needed>

## UX-discoverability notes
> The highest-value signal from blind testing: where a real user got lost or
> couldn't find a feature even though it exists.
- <feature> — not discoverable from <entry point>; tester gave up after N steps.

## Recommended next steps
1. Fix the 🔴/🟡 defects (diagnose at the data/owner layer, not the symptom).
2. Re-run only the failed journeys (TDD loop).
3. Seed any missing fixtures and re-run BLOCKED journeys.
