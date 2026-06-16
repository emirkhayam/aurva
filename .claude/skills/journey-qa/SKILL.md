---
name: journey-qa
description: Blind, AI-driven customer-journey QA for any web app. Generates a tailored journey suite by studying the app (journey-architect), then runs each journey like a real user via Playwright MCP without knowing internal routes (journey-tester), and reports PASS/FAIL/BLOCKED with repro + suggested fixes. Use when the user says "test this app like a real user", "find UX/QA bugs", "generate user journeys", "regress critical paths after deploy", or "blind E2E test". Part of the max-ai-analyze-fix toolkit.
tools: Task, Read, Write, Edit, Bash, Glob, Grep
---

# Journey QA — blind, AI-driven customer-journey testing

Test a web app the way a **real user** experiences it: an AI tester with no knowledge of
your routes or selectors discovers and exercises features by clicking only what's visible,
then reports what's broken or confusing. Works on **any** app — the suite is generated from
your app, not hardcoded.

Two agents do the work; this skill orchestrates them:
- **`journey-architect`** — studies the target app (live UI + optionally its repo) and
  generates a tailored `journeys.json` + fixtures + config.
- **`journey-tester`** — runs ONE journey blind via Playwright MCP and reports a result block.

> Prerequisite: the **Playwright MCP** server must be connected
> (`claude mcp add playwright npx '@playwright/mcp@latest'`). The headless `runner/` is an
> MCP-free alternative for batch capture.

## Workflow

### 1. Setup
- Ensure config exists: copy `config/journey-qa.config.example.json` → `journey-qa.config.json`
  and fill `base_url` (+ `admin_base_url` if separate), `lang`, and the `labels` dictionary
  for the app's UI language.
- Ensure `.env` (from `env.example`) has `TEST_PASSWORD`, and `fixtures` in the config map
  each archetype to a **throwaway test account on a staging tenant** (see
  `templates/fixtures.template.md`). Never use real-user credentials.

### 2. Generate journeys (skip if you already have `journeys.json`)
Spawn **`journey-architect`** pointed at `$JOURNEY_BASE`. It explores the app (and repo,
if a path is given), then writes `journeys.json` (validates against
`schema/journey.schema.json`), updates `fixtures`/config, and reports coverage + which
fixtures you must provision. Review the generated suite before running.

### 3. Run the journeys (blind)
For each journey, spawn **`journey-tester`** with that ONE journey object.
- **Run sequentially** — Playwright MCP shares a single browser; parallel runs collide.
- If the shared browser is still logged in from a prior journey, the tester logs out first.
- Each tester appends a result block to `BUGS.md` and a screenshot to
  `journey-results/screenshots/`.

For large suites or CI, use the MCP-free `runner/` instead (`runner/README.md`): it captures
page state for an LLM judge. Negative/error-path journeys are best done by the blind tester.

### 4. Aggregate
Summarize `BUGS.md` into `SUMMARY.md` using `templates/SUMMARY.template.md`: a tally by
status, a breakdown by category, defects grouped by severity, and a **UX-discoverability**
section (where the blind tester got lost — the highest-value signal).

### 5. Fix loop (optional, user-driven)
Treat the journals as a spec (TDD loop): pick a defect, diagnose it at the data/owner layer
(not the symptom), fix it, then re-run **only that journey** to confirm green. The tester
suggests a fix *direction* but never edits code itself — fixing is a separate, explicit step
you drive with Claude.

## Principles (don't break these)

- **Blind navigation**: the tester may only `navigate()` to a journey's `starting_url`;
  everything else is reached by clicking visible UI. No `data-testid`/CSS selectors.
- **Observable assertions**: `expected_observations` are checked by what a user sees, not by
  internal data.
- **Read-only by default**: exploration and the headless runner never submit mutations. When
  full journeys do create data, use throwaway fixtures and clean up afterward.
- **No hardcoding**: hosts, credentials, fixtures and button labels live in config/env, so
  the same suite tooling works for any app and any UI language.

## Files

| Path | Purpose |
|------|---------|
| `agents/journey-architect.md` | generate a journey suite from the app |
| `agents/journey-tester.md` | run ONE journey blind (Playwright MCP) |
| `schema/journey.schema.json` | journey object schema |
| `examples/journeys.example.json` | generic SaaS example suite |
| `config/journey-qa.config.example.json` | URLs, labels, fixtures skeleton |
| `templates/` | BUGS / SUMMARY / fixtures templates |
| `runner/` | MCP-free headless capture runner |

---

## Кратко по-русски

Слепое QA пользовательских путей для любого веб-приложения. `journey-architect` изучает
приложение и генерирует набор сценариев под него; `journey-tester` проходит каждый сценарий
как живой пользователь через Playwright MCP, **не зная роутов** (только видимые элементы), и
пишет PASS/FAIL/BLOCKED с шагами и suggested fix. Запуск сценариев — строго по очереди
(браузер общий). Хосты, креды, фикстуры и лейблы кнопок — в config/env, ничего не зашито.
Полное руководство — `README.ru.md`.
