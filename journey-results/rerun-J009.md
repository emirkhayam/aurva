## [J009] Детальная страница новости — открывается из списка и отображает полный текст (RE-RUN)

**Status:** PASSED
**Actor:** anonymous
**Category:** A_anonymous
**Started:** 2026-06-04T11:49:29Z
**Duration:** ~1m 30s

### Re-run context
Previous run FAILED because:
1. A decorative overlay intercepted real pointer clicks on news cards — navigation only worked via synthetic `element.click()`.
2. Two `<h1>` elements were found on the detail page.
3. Share links were icon-only with no `aria-label` attributes.

This re-run uses a real `browser_click` (no JS evaluate navigation) and explicitly verifies all three regressions.

### Click navigation verification
- URL before click: `http://localhost:5000/news`
- Clicked element: link ref `e25` — "Читать новость: Избран новый состав Наблюдательного Совета АУРВА" (real browser click, no JS inject)
- URL after click: `http://localhost:5000/news-detail.html?slug=избран-новый-состав-наблюдательного-совета-аурва`
- Navigation occurred: YES — URL changed as expected.

### Observations
- PASSED — After clicking the news card the detail page opens; URL changed to `/news-detail.html?slug=...`
- PASSED — Article title "Избран новый состав Наблюдательного Совета АУРВА" is visible as `<h1>` (exactly ONE h1 found — previous dual-h1 bug is fixed)
- PASSED — Publication date "24 февраля 2026 г." is visible in the required format «дд месяц гггг г.»
- PASSED — Full article text is present (3 574 characters in the `<article>` element)
- PASSED — Link "Все новости" is present in the navigation bar, pointing to `/news.html`
- PASSED — Three share links are present (Twitter, Facebook, Telegram) with accessible names via `aria-label`: "Поделиться в Twitter", "Поделиться в Facebook", "Поделиться в Telegram" — previous icon-only / no-label bug is fixed

### Regression checks (from previous FAILED run)
| Regression | Previous result | This run |
|---|---|---|
| Real pointer click navigates | FAIL — overlay intercepted click | PASS — URL changed on real click |
| Exactly one `<h1>` on detail page | FAIL — 2 h1 elements found | PASS — 1 h1 found |
| Share links have `aria-label` | FAIL — icon-only, no labels | PASS — all 3 links have aria-label |

### Console / network errors
- WARNING (non-blocking): `cdn.tailwindcss.com should not be used in production` — pre-existing dev configuration issue, not related to this journey.
- No 4xx/5xx network errors.

### Screenshot
`C:\Users\alanb\OneDrive\Рабочий стол\aurva-main\journey-results\screenshots\J009-rerun.png`

---
