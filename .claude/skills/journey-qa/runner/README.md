# Headless capture runner (MCP-free)

A deterministic, **read-only** Playwright runner. It logs in (optionally), loads each
journey's page and dumps the page **state** to JSON, plus a screenshot. An LLM (or you)
then judges each capture against its `expected_observations`.

Use this for fast, repeatable, CI-friendly capture across many journeys **without**
Playwright MCP. For true blind exploration and for negative/error-path journeys, use the
`journey-tester` agent (Playwright MCP) instead.

## Setup

```bash
cd runner
npm install            # installs playwright + chromium
cp ../env.example ../.env   # then fill TEST_PASSWORD
cp ../config/journey-qa.config.example.json ../journey-qa.config.json   # edit hosts/labels/fixtures
```

Put your `journeys.json` next to the config (or set `$JOURNEY_FILE`).

## Run

```bash
# from the directory that holds journeys.json + journey-qa.config.json
export JOURNEY_BASE="https://staging.your-app.com"
export TEST_PASSWORD="..."          # throwaway QA accounts only

node path/to/runner/capture.mjs                 # all journeys
node path/to/runner/capture.mjs J001 J009       # specific ids
node path/to/runner/capture.mjs --category C_admin

node path/to/runner/show.mjs --category A_anonymous   # pretty-print captures for judging
```

Outputs go to `./journey-results/` (`captures/*.json`, `screenshots/*.png`, `.states/`).

## Environment / config

| Var | Meaning |
|-----|---------|
| `JOURNEY_BASE` | public/app host (overrides `config.base_url`) |
| `JOURNEY_ADMIN_BASE` | admin host (overrides `config.admin_base_url`; defaults to base) |
| `TEST_PASSWORD` | shared password for fixture users (required for non-anonymous journeys) |
| `JOURNEY_FILE` | path to journeys.json (default `./journeys.json`) |
| `JOURNEY_CONFIG` | path to config (default `./journey-qa.config.json`) |

Login flow, button labels (any language), fixture emails and viewport all come from the
config file. Nothing about any specific app is hardcoded.

## Safety

- **Read-only**: only successful test logins are written; no create/update/delete is performed.
- Point it at **staging** with **throwaway** QA accounts. Never use real-user credentials.
