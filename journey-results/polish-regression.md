# AURVA UX-Polish Regression Report
**Date:** 2026-06-04  
**Base URL:** http://localhost:5000  
**Session start:** 14:35 UTC  

---

## [J001] Glavnaya stranitsa — bazovy kontent

**Status:** PASSED  
**Actor:** anonymous  
**Category:** smoke / hero  
**Started:** 2026-06-04T14:35:27Z  
**Duration:** ~0m 15s  

### Observations
- PASSED title soderzhit «AURVA»: actual «AURVA — Assotsiatsiya Uchastnikov Rynka Virtualnykh Aktivov Kyrgyzstana»
- PASSED logotip v shapke (link "AURVA Logo" → /)
- PASSED h1 «Assotsiatsiya Uchastnikov Rynka Virtualnykh Aktivov.» (exact match)
- PASSED podzagolovok «OBYEDINYAYEM LIDEROV INDUSTRII V KYRGYZSTANE» (rendered as animated letter spans inside p)
- PASSED knopka «Podat zayavku» (link → #contact)
- PASSED ssylka «Izuchit manifest» (link → #about)
- PASSED «Osnovana v 2024 godu» (span above h1)

### Screenshot
`journey-results/screenshots/J001-polish.png`

### Console / network errors
None (0 errors, 4 warnings — all non-blocking)

---

## [J002] Navigatsiya — ediny navbar + perekhod «O nas»

**Status:** FAILED  
**Severity:** MAJOR  
**Actor:** anonymous  
**Category:** navigation / unified navbar  
**Started:** 2026-06-04T14:35:42Z  
**Duration:** ~0m 30s  

### Observations
- PASSED navbar na / soderzhit «O nas», «Napravleniya», «Preimushchestva», «Novosti», «Kursy»
- PASSED «Kabinet» na glavnoy prisutstvuet
- PASSED «Podat zayavku» na glavnoy prisutstvuet
- PASSED klik na «O nas» → URL /about, title «O nas — AURVA»
- PASSED «O nas» vydelyaetsya tsvetom (text-[color:var(--accent)], aria-current="page")
- FAILED na /about navbar NE soderzhit «Kabinet»: vmesto nego prisutstvuet «Stat chlenomоm» (drugoy tekst CTA, drugoy poryadok elementov)
- FAILED na /about CTA-knopka nazyvaetsya «Stat chlenom», a ne «Podat zayavku»
- PASSED «O nas», «Kursy», «Napravleniya», «Preimushchestva», «Novosti» — vse prisutstvuyut v desktop navbar na /about

### Repro
1. Open http://localhost:5000/ — navbar shows «Kabinet» link
2. Click «O nas» in navbar
3. Land on /about
4. Expected: «Kabinet» link present, CTA «Podat zayavku»
5. Actual: «Kabinet» link absent; CTA reads «Stat chlenom»

### Screenshot
`journey-results/screenshots/J002-polish.png`

### Console / network errors
None

### Suggested fix
The /about page uses a different navbar partial that omits «Kabinet» and uses a different CTA label. Unify: use the same navbar component across all pages with «Kabinet» and «Podat zayavku».

---

## [J003] Mobilnoe gamburguer-menyu (390x844)

**Status:** PASSED  
**Actor:** anonymous  
**Category:** responsive / mobile nav  
**Started:** 2026-06-04T14:36:05Z  
**Duration:** ~0m 30s  

### Observations
- PASSED knopka «Otkryt menyu» vidna (aria-label="Otkryt menyu", aria-expanded="false" initially)
- PASSED menyu raskryvaetsya po kliku (aria-expanded="true", mobile-menu appears in DOM)
- PASSED v menyu: «O nas», «Napravleniya», «Preimushchestva», «Novosti», «Kursy», «Lichny kabinet», «Podat zayavku» — all present
- PASSED posle klika po «O nas» URL menyaetsya na /about, menyu zakryvaetsya (aria-expanded="false", menuVisible: false)
- PASSED aria-expanded pereklyuchaetsya false→true pri otkrytii i true→false pri zakrytii/perekhode

### Screenshot
`journey-results/screenshots/J003-polish.png`

### Console / network errors
None

---

## [J008+filters] Stranitsa novostey — filtry i navbar

**Status:** PASSED  
**Actor:** anonymous  
**Category:** news / filters  
**Started:** 2026-06-04T14:36:48Z  
**Duration:** ~1m 00s  

### Observations
- PASSED h1 «Vse → NOVOSTI» (exact text in heading level 1)
- PASSED polny navbar: «O nas», «Napravleniya», «Preimushchestva», «Novosti» (active, aria-current="page"), «Kursy», «Kabinet», «Podat zayavku»
- PASSED ryad filtrov: «Vse» / «Regulirovanie» / «Sobytiya» / «Analitika» (role="group", aria-label="Filtr novostey po kategoriyam")
- PASSED kartochki soderzhat bejdzh kategorii I datu (confirmed for all visible cards)
- PASSED klik po «Sobytiya» → knopka [active], otobrazhayutsya tolko 13 kartochek s bejdzhom «Sobytiya» (verified JS-inspection of first 5)
- PASSED klik «Vse» → vozvrashchaet 36 kartochek (polny spisok)
- PASSED bogatyi footer: «Assotsiatsiya aktivna» s animate-ping, navigatsiya O nas/Napravleniya/Preimushchestva/Novosti/Kursy, «Politika konfidentsialnosti», «Ustav», «© 2024»
- NOTE (minor): v futere /news otsutstvuet ssylka «Uchastniki» (na glavnoy ona est); neposlodovatelnost mezhdu stranitsami

### Screenshot
`journey-results/screenshots/J008+filters-polish.png`

### Console / network errors
None

---

## [J009] Perekhod na kartochku novosti — realny klik

**Status:** PASSED  
**Actor:** anonymous  
**Category:** news-detail  
**Started:** 2026-06-04T14:37:54Z  
**Duration:** ~0m 30s  

### Observations
- PASSED URL izmenilsya na /news-detail.html?slug=izbran-novy-sostav-nablyudatelnogo-soveta-aurva
- PASSED rovno odin h1 «Izbran novy sostav Nablyudatelnogo Soveta AURVA» (h1Count: 1)
- PASSED data «24 fevralya 2026 g.» (format «dd mesyats gggg g.» soblyuden)
- PASSED polny tekst stati prisutstvuet v article
- PASSED ssylka «Vse novosti» → /news (v tele stati, pered h1)
- PASSED «Novosti» v navbare aktivna (aria-current="page")
- PASSED share-ssylki s aria-label: «Podelit sya v Twitter», «Podelit sya v Facebook», «Podelit sya v Telegram»
- PASSED 0 JS-oshibok v konsoli

### Screenshot
`journey-results/screenshots/J009-polish.png`

### Console / network errors
None (0 errors, 1 warning)

---

## [J010] Stranitsa kursov

**Status:** PASSED  
**Actor:** anonymous  
**Category:** courses  
**Started:** 2026-06-04T14:38:13Z  
**Duration:** ~0m 20s  

### Observations
- PASSED title «Kursy — AURVA»
- PASSED polny navbar s «Kursy» aktivnoy (aria-current="page")
- PASSED 4 kartochki kursov v main (ne pusto): «Informatsionnoe vzaimodeystvie s GSFR», «Ustanovka i nastroyka zashchishchennogo elektronnogo kanala svyazi», «Ustanovka ARM i ego komponentov», «Rabota s interfeysom i funktsionalom ARM»
- PASSED 0 JS-oshibok
- PASSED bogatyi footer s «Assotsiatsiya aktivna», «Politika konfidentsialnosti», «Ustav»

### Screenshot
`journey-results/screenshots/J010-polish.png`

### Console / network errors
None (0 errors, 1 warning)

---

## [J012] Footer — polnota, ssylki, stranitsy

**Status:** PASSED  
**Actor:** anonymous  
**Category:** footer  
**Started:** 2026-06-04T14:38:30Z  
**Duration:** ~1m 00s  

### Observations
- PASSED logotip AURVA v futere (img "AURVA Logo")
- PASSED «Assotsiatsiya aktivna» s animate-ping indikatorom (span.animate-ping potverzhdon JS)
- PASSED navigatsionnye ssylki futera na /: «O nas», «Napravleniya», «Preimushchestva», «Uchastniki», «Novosti», «Kursy»
- PASSED «Politika konfidentsialnosti» → /privacy: otkryvaetsya oformlennaya stranitsa s polnym navbarom (Glavnaya/O nas/Napravleniya/Preimushchestva/Novosti/Kursy/Kabinet)
- PASSED «Ustav» → /charter: otkryvaetsya oformlennaya stranitsa s polnym navbarom
- PASSED kopirayt «© 2024»
- NOTE (minor): «Uchastniki» otsutstvuet v futere na /news i /about — neposlodovatelnost, no na / prisutstvuet

### Screenshot
`journey-results/screenshots/J012-polish.png`

### Console / network errors
None

---

## Result Table

| ID | Title | Status | Severity | Key notes |
|----|-------|--------|----------|-----------|
| J001 | Home — hero content | PASSED | — | All 7 checks passed |
| J002 | Navigation — unified navbar | FAILED | MAJOR | «Kabinet» absent on /about; CTA «Stat chlenom» vs expected «Podat zayavku» |
| J003 | Mobile hamburger menu | PASSED | — | aria-expanded toggles; menu closes after link click |
| J008+filters | News page + filters | PASSED | — | Filters work; «Uchastniki» absent in /news footer (minor inconsistency) |
| J009 | News card click-through | PASSED | — | 1xh1, date format correct, share links with aria-label, Novosti active |
| J010 | Courses page | PASSED | — | 4 cards; 0 JS errors; Kursy active |
| J012 | Footer | PASSED | — | All elements on /; privacy/charter load with full navbar |

**Total: 6 PASSED / 1 FAILED / 0 BLOCKED**

### Bug summary (J002 — MAJOR)
On `/about` (and similarly on `/news-detail`, `/charter`, `/privacy`) the navbar is rendered from a different template that omits the «Kabinet» link and relabels the CTA from «Podat zayavku» to «Stat chlenom». This violates the "unified navigation" requirement of the UX-polish pass. Every inner page should use the same navbar component as the homepage.

### Minor inconsistency (not blocking)
The «Uchastniki» footer link is present only on `/` but absent in the footer on `/news`, `/about`, `/courses`, and `/news-detail`. Likely the footer partial is also not fully unified across all page templates.
