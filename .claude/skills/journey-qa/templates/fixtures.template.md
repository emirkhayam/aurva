# Fixture model

Blind journeys reference **abstract user archetypes** (not raw emails). You map each
archetype your journeys use to a real throwaway test account in
`journey-qa.config.json → fixtures`, and put the shared password in `.env` (`TEST_PASSWORD`).

> Use a **staging / test tenant** and **disposable** accounts only. Never wire real-user
> credentials into QA config.

## Recommended archetypes (use only what your app needs)

| Archetype | Represents |
|-----------|------------|
| `anonymous` | logged-out visitor (no account needed) |
| `basic_user` | registered user with minimal/no privileges |
| `verified_user` | fully onboarded user who can perform the core actions |
| `restricted_user` | user in a limited / pending / blocked state (for gating tests) |
| `staff_limited` | internal staff with a narrow permission set |
| `admin` | full app/tenant administration |
| `superadmin` | platform-level administration (optional) |

## How to provision

1. Create the accounts in your staging environment (signup, or a seed script/migration).
2. Give them all the **same** password → `.env` `TEST_PASSWORD`.
3. Put their emails under `fixtures.<archetype>.email` in `journey-qa.config.json`.
4. Set each account into the state its archetype implies (verified, restricted, role, …).

## Keeping QA data out of production reports

If your app aggregates user data into business/regulatory reports, make sure these test
accounts are **excluded** (e.g. filter out the QA email pattern). Keep all fixture emails
on a recognizable domain (e.g. `@example.test`) so they're easy to filter and clean up.
