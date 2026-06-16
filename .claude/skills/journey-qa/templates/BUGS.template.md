# Customer Journey Test Results — BUGS

> Append-only log. One block per journey. The `journey-tester` agent writes these via
> `cat >> BUGS.md` (never overwrite).

**Run date:** YYYY-MM-DD
**Method:** blind `journey-tester` (Playwright MCP)  ·  or headless runner
**Target:** $JOURNEY_BASE

## Status legend
- ✅ **PASSED** — all `expected_observations` confirmed.
- ❌ **FAILED** — feature is reachable, but one or more observations don't match (UI bug, wrong text, broken behaviour).
- ⛔ **BLOCKED** — couldn't even reach the feature (not discoverable from this entry point, or a precondition fails).

---

<!-- ===== copy one block per journey below ===== -->

## [J0XX] <journey title>

**Status:** ❌ FAILED   <!-- ✅ PASSED / ⛔ BLOCKED -->
**Severity:** MAJOR     <!-- MINOR / MAJOR / CRITICAL — for FAILED only -->
**Actor:** <fixture archetype, e.g. verified_user>
**Category:** <e.g. B_user>
**Started:** YYYY-MM-DD HH:MM:SS UTC
**Duration:** Xm Ys

### Observations
- ✅ <observation that held>
- ❌ <observation that failed — what was expected vs what was seen>

### Repro
1. <step the user took, by visible label>
2. ...
3. Expected: <...>
4. Actual: <...>

### Screenshot
`journey-results/screenshots/J0XX.png`

### Console / network errors
<none, or quoted errors>

### Suggested fix
<best-guess pointer for the developer — page/component/behaviour. Optional; this is QA, not dev.>

---
