# Redesign Regression — Batch 2 (J006–J010)

**Run date:** 2026-06-04 UTC
**Base URL:** http://localhost:5000
**Viewport:** 1280 x 800
**Tester:** Blind QA (Playwright MCP)
**Build note:** Full visual redesign regression pass

---

## [J006] Контакты на главной

**Status:** PASSED
**Actor:** anonymous
**Category:** contact / home
**Started:** 2026-06-04T12:46:43Z
**Duration:** ~0m 20s

### Observations
- PASSED секция «Свяжитесь с нами» — heading level=2 «Свяжитесь с нами» present in `<main>` contact section
- PASSED адрес «Кыргызская Республика, г. Бишкек» — visible in listitem under «Офис»
- PASSED телефон «+996 550 99 90 10» — link `tel:+996550999010` with visible text matches exactly
- PASSED email «aurva.kg@gmail.com» — link `mailto:aurva.kg@gmail.com` with visible text
- PASSED форма с полем «Название компании / Имя» — textbox found, placeholder «ОсОО «Компания»»
- PASSED форма с полем «Контактный телефон» — textbox found, placeholder «+996 ___ ___ ___»
- PASSED кнопка «Оставить заявку» — button present, form NOT submitted

### Console / network errors
None (0 errors, 1 unrelated warning)

### Screenshot
`journey-results/screenshots/J006-redesign.png`

---

## [J007] Страница «О нас»

**Status:** PASSED
**Actor:** anonymous
**Category:** about
**Started:** 2026-06-04T12:47:01Z
**Duration:** ~0m 15s

### Observations
- PASSED title содержит «О нас — AURVA» — page title exact match
- PASSED главный заголовок «Формируем будущее цифровой экономики» — h1 in `<main>` hero
- PASSED секция миссии с подзаголовком «Миссия» — h3 level=3 present
- PASSED секция миссии с подзаголовком «Видение» — h3 level=3 present
- PASSED секция «Цели и приоритеты» — h2 present with that text
- PASSED карточка «Совершенствование законодательства» — article with h3
- PASSED карточка «Защита интересов участников» — article with h3
- PASSED секция «Наши ценности» — h2 present
- PASSED блок «Прозрачность» — h3 under values section
- PASSED блок «Безопасность» — h3 under values section
- PASSED блок «Инновационность» — h3 under values section
- PASSED блок «Сотрудничество» — h3 under values section
- PASSED секция «Структура управления» — h2 present
- PASSED имя «Темир Казыбай» — h4 under «Структура ассоциации», role «Председатель Ассоциации»
- PASSED секция «Наши партнёры» — h2 present with partner cards (Match Systems, CII, MyDataCoin, ОсОО Рост ФМ)

### Console / network errors
None (0 errors, 0 warnings)

### Screenshot
`journey-results/screenshots/J007-redesign.png`

---

## [J008] Список новостей

**Status:** PASSED
**Actor:** anonymous
**Category:** news / list
**Started:** 2026-06-04T12:47:14Z
**Duration:** ~0m 10s

### Observations
- PASSED title содержит «Новости — AURVA» — exact page title
- PASSED главный заголовок «Все новости» — h1 level=1 in `<main>`
- PASSED карточки новостей с заголовками — 30+ news card headings (h2 level) visible
- PASSED карточки содержат даты — e.g. «24 февр. 2026 г.», «9 февр. 2026 г.»
- PASSED карточки содержат фрагменты текста — summary paragraphs present on every card
- PASSED шапка содержит логотип AURVA со ссылкой на «/» — link «AURVA — на главную» href «/» with img «Логотип AURVA»
- PASSED каждая карточка содержит слово «Читать» — confirmed across all visible cards

### Console / network errors
None (0 errors, 0 warnings)

### Screenshot
`journey-results/screenshots/J008-redesign.png`

---

## [J009] Детальная новость через реальный клик

**Status:** FAILED
**Severity:** MINOR
**Actor:** anonymous
**Category:** news / detail
**Started:** 2026-06-04T12:47:30Z
**Duration:** ~0m 35s

### Observations
- PASSED после клика URL меняется на детальную страницу — URL became `/news-detail.html?slug=избран-новый-состав-...`
- FAILED заголовок статьи виден как h1 (ровно ОДИН h1 на странице) — DOM contains TWO `<h1>` elements:
  1. «Избран новый состав Наблюдательного Совета АУРВА» (layout-visible, offsetParent != null)
  2. «Новость не найдена» (layout-invisible: offsetParent === null, but NOT display:none or visibility:hidden — hidden only via ancestor wrapper)
  Requirement states exactly one h1; actual DOM count is 2.
- PASSED дата публикации в формате «дд месяц гггг г.» — «24 февраля 2026 г.» present
- PASSED полный текст статьи — article body with multiple named sections rendered
- PASSED ссылка «Все новости» для возврата — link «Все новости» pointing to `/news` present
- PASSED aria-label «Поделиться в Twitter» — link accessible name «Поделиться в Twitter» confirmed
- PASSED aria-label «Поделиться в Facebook» — link accessible name «Поделиться в Facebook» confirmed
- PASSED aria-label «Поделиться в Telegram» — link accessible name «Поделиться в Telegram» confirmed

### Repro
1. Navigate to http://localhost:5000/news
2. Click first news card «Читать новость: Избран новый состав Наблюдательного Совета АУРВА» (real browser_click)
3. Page loads detail at `/news-detail.html?slug=...`
4. Expected: `document.querySelectorAll('h1').length === 1`
5. Actual: `document.querySelectorAll('h1').length === 2`
   - h1[0]: «Избран новый состав Наблюдательного Совета АУРВА» (visible)
   - h1[1]: «Новость не найдена» (in DOM, inside hidden ancestor, not display:none itself)

### Console / network errors
2 errors — both are `doubleclick.net` CSP blocks from Google Analytics; excluded per test instructions as known GA noise.

### Suggested fix
The error-state component «Новость не найдена» is mounted in the DOM alongside the found article and concealed only by its parent container. Fix options: (a) conditionally render the fallback component only when no article exists (never mount both simultaneously), or (b) demote the fallback heading from `<h1>` to `<p>` or `<h2>` since h1 must be unique per page.

### Screenshot
`journey-results/screenshots/J009-redesign.png`

---

## [J010] Курсы

**Status:** PASSED
**Actor:** anonymous
**Category:** courses
**Started:** 2026-06-04T12:48:04Z
**Duration:** ~0m 10s

### Observations
- PASSED title содержит «Курсы — AURVA» — exact page title
- PASSED навигационная шапка с логотипом AURVA (ведёт на «/») — link «AURVA — на главную» href «/» confirmed
- PASSED nav ссылка «О нас» present and links to /about
- PASSED nav ссылка «Новости» present and links to /news
- PASSED nav ссылка «Курсы» present and links to /courses
- PASSED nav ссылка «Кабинет» present and links to /cabinet
- PASSED страница не показывает ошибку сервера — page renders with content, no 5xx
- PASSED `<main>` содержит карточки курсов (не пустой) — 4 course cards rendered:
  1. «Информационное взаимодействие с ГСФР (Предоставление информации в ГСФР)»
  2. «Установка и настройка защищённого электронного канала связи»
  3. «Установка АРМ и его компонентов»
  4. «Работа с интерфейсом и функционалом АРМ»
- PASSED ноль JS-ошибок типа EvalError в консоли — console: 0 errors, 0 warnings

### Console / network errors
None (0 errors, 0 warnings)

### Screenshot
`journey-results/screenshots/J010-redesign.png`

---

## Result Table

| Journey | Title                             | Status | Severity | Failed obs |
|---------|-----------------------------------|--------|----------|------------|
| J006    | Контакты на главной               | PASSED | —        | 0 / 7      |
| J007    | Страница «О нас»                  | PASSED | —        | 0 / 15     |
| J008    | Список новостей                   | PASSED | —        | 0 / 7      |
| J009    | Детальная новость (реальный клик) | FAILED | MINOR    | 1 / 8      |
| J010    | Курсы                             | PASSED | —        | 0 / 8      |

**Summary:** 4 PASSED · 1 FAILED · 0 BLOCKED

**Single defect found:** J009 — two `<h1>` elements in the DOM on the news detail page. The second h1 «Новость не найдена» belongs to the error-state fallback component that is layout-hidden (inside a hidden ancestor) but not conditionally unmounted. This violates the «exactly one h1» structural requirement and may confuse screen readers depending on how the ancestor is hidden.
