## [J010] Страница курсов загружается и отображает навигацию (RE-RUN)

**Status:** PASSED
**Severity:** N/A
**Actor:** anonymous
**Category:** A_anonymous
**Started:** 2026-06-04T11:48:16Z
**Duration:** ~0m 30s

### Observations

- PASS  Page title is "Курсы — AURVA" — confirmed.
- PASS  Navigation header is present with AURVA logo link and nav links: "Главная", "О нас", "Новости", "Курсы", "Кабинет" — all confirmed in the accessibility tree (refs e6–e12).
- PASS  No server error displayed on page.
- PASS  `<main>` is NOT blank. It renders a heading "Курсы" (h1) and four course cards, each with a title, description, estimated duration, and a "Доступен" status label. This is a meaningful course list, fully visible to an anonymous visitor.
- PASS  No Uncaught EvalError (or any other JS error) in the browser console. The only console entry is a Tailwind CDN production warning (non-functional, pre-existing).
- PASS  `/api/courses` API endpoint returned HTTP 200 OK.

### Additional notes on the fix

The previous run failed with a blank `<main>` due to a Vue CSP EvalError. In this re-run the main content area renders four complete course cards without any JavaScript errors, confirming the CSP/eval issue has been resolved.

### Non-blocking issues

- Google Fonts CSS requests fail with `net::ERR_ABORTED` (two requests for the Oswald/Inter font stack). This is a cosmetic network issue — the page falls back to system fonts — but it may indicate a missing CSP `font-src` directive or a blocked external resource. No functional impact.
- Tailwind CDN warning: cdn.tailwindcss.com should not be used in production. Pre-existing, non-blocking.

### Repro (what was tested)

1. Navigate to http://localhost:5000/courses as anonymous user.
2. Observe page title in browser tab.
3. Inspect navigation header for logo and links.
4. Inspect `<main>` for visible content.
5. Check browser console for JS errors.
6. Check network tab for API status.

**Expected:** Title "Курсы — AURVA", nav with five links, non-blank main, no EvalError.
**Actual:** All conditions met.

### Screenshot

`C:\Users\alanb\OneDrive\Рабочий стол\aurva-main\journey-results\screenshots\J010-rerun.png`

### Console / network errors

```
[WARNING] cdn.tailwindcss.com should not be used in production. (non-blocking)
[NETWORK FAIL] GET https://fonts.googleapis.com/css2?family=Oswald... => net::ERR_ABORTED (cosmetic, non-blocking)
[NETWORK FAIL] GET https://fonts.googleapis.com/css2?family=Oswald... => net::ERR_ABORTED (cosmetic, non-blocking)
[200 OK] GET http://localhost:5000/api/courses
```

No JS errors. No EvalError. No 4xx/5xx from the application server.

### Suggested fix

For the font loading failures: add `https://fonts.googleapis.com` and `https://fonts.gstatic.com` to the `font-src` and `style-src` CSP directives, or switch to self-hosted fonts to avoid the external dependency.

---
