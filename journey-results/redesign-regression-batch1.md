# Redesign Regression — Batch 1 Results

**Run date:** 2026-06-04  
**Base URL:** http://localhost:5000  
**Tester mode:** Blind QA (anonymous, no login required)  
**App language:** Russian  

---

## [J001] Главная загружается

**Status:** PASSED  
**Actor:** anonymous  
**Category:** Homepage  
**Started:** 2026-06-04T12:44:00Z  
**Duration:** ~0m 15s  

### Observations

- PASS — Page title: "AURVA — Ассоциация Участников Рынка Виртуальных Активов Кыргызстана". Contains "AURVA": yes. Contains "Ассоциация Участников Рынка Виртуальных Активов": yes.
- PASS — Logo: `img "Логотип AURVA"` present in the header navigation (`link "AURVA — на главную"`).
- PASS — H1: "Ассоциация Участников Рынка Виртуальных Активов" found at `heading [level=1]`.
- PASS — Sub-heading paragraph: "Объединяем лидеров индустрии Кыргызстана. Выстраиваем диалог между государством, бизнесом и пользователями цифровых активов."
- PASS — Link "Подать заявку" visible in hero section (`link [url=#contact]`).
- PASS — Link "Узнать больше" visible in hero section (`link [url=#about]`).
- PASS — "Основана в 2024 году" present in hero tag line paragraph: "Основана в 2024 году · Кыргызская Республика".

### Console / network errors

One Swiper loop warning (non-blocking). GA/GTM tracking blocked by CSP — known noise, ignored per brief.

### Screenshot

`journey-results/screenshots/J001-redesign.png`

---

## [J002] Десктоп-навигация

**Status:** PASSED  
**Actor:** anonymous  
**Category:** Navigation  
**Started:** 2026-06-04T12:44:13Z  
**Duration:** ~0m 20s  
**Viewport:** 1280x800  

### Observations

- PASS — Navbar link "О нас" present (`link [url=/about]`).
- PASS — Navbar link "Направления" present (`link [url=#directions]`).
- PASS — Navbar link "Преимущества" present (`link [url=#benefits]`).
- PASS — Navbar link "Новости" present (`link [url=/news]`).
- PASS — Navbar link "Кабинет" present (`link [url=/cabinet]` with visible text "Кабинет").
- PASS — Navbar link/button "Подать заявку" present (`link [url=#contact]`).
- PASS — Clicking "О нас" navigated to `/about`; page title is "О нас — AURVA".
- PASS — On /about page, same nav links (О нас, Направления, Преимущества, Новости, Кабинет, Подать заявку) confirmed in navigation snapshot.

### Console / network errors

None relevant (GA/GTM noise only).

### Screenshot

`journey-results/screenshots/J002-redesign.png`

---

## [J003] Мобильное меню

**Status:** PASSED  
**Actor:** anonymous  
**Category:** Navigation / Mobile  
**Started:** 2026-06-04T12:44:25Z  
**Duration:** ~0m 25s  
**Viewport:** 390x844  

### Observations

- PASS — At 390px viewport, desktop nav links are hidden; `button "Открыть меню"` is visible in the header.
- PASS — Clicking "Открыть меню" expands the menu (button shows `[expanded]` state); overlay panel appears with navigation links.
- PASS — Menu contains link "О нас".
- PASS — Menu contains link "Направления".
- PASS — Menu contains link "Преимущества".
- PASS — Menu contains link "Новости".
- PASS — Menu contains link "Личный кабинет" (text: "Личный кабинет", url: /cabinet).
- PASS — Menu contains link "Подать заявку".
- PASS — After clicking "О нас" from the menu, page navigated to /about and the menu closed (button reverted to non-expanded "Открыть меню" state, overlay absent from accessibility tree).

### Console / network errors

None relevant.

### Screenshot

`journey-results/screenshots/J003-redesign.png`  
(captured with menu open)

---

## [J004] Секции главной при прокрутке

**Status:** PASSED  
**Actor:** anonymous  
**Category:** Homepage / Sections  
**Started:** 2026-06-04T12:44:55Z  
**Duration:** ~0m 10s  

### Observations

- PASS — Section heading "Двигатель прогресса цифровой экономики" found (`heading [level=2]`).
- PASS — Description paragraph contains "независимая платформа": "AURVA — это независимая платформа, созданная для выстраивания конструктивного диалога…"
- PASS — Description paragraph contains "Кыргызской Республики": "…экономику Кыргызской Республики…"
- PASS — Section heading "Направления работы" found (`heading [level=2]`).
- PASS — Card "Развитие и поддержка" found (`heading [level=3]` inside article).
- PASS — Card "Регулирование" found (`heading [level=3]` inside article).
- PASS — Card "Образование" found (`heading [level=3]` inside article).
- PASS — Card "Инновации" found (`heading [level=3]` inside article).
- PASS — Section heading "Почему стоит вступить" found (`heading [level=2]`).
- PASS — Block "Нетворкинг с лидерами" found (`heading [level=3]`).
- PASS — Block "Влияние на законы" found (`heading [level=3]`).
- PASS — Block "Образование" found (`heading [level=3]`).
- PASS — Block "Продвижение" found (`heading [level=3]`).
- PASS — Section heading "Участники ассоциации" found (`heading [level=2]`); carousel with 15 slides present.

### Console / network errors

Swiper loop warning (cosmetic). GA/GTM noise ignored.

### Screenshot

`journey-results/screenshots/J004-redesign.png`  
(full-page screenshot)

---

## [J005] Участники и новости

**Status:** PASSED  
**Actor:** anonymous  
**Category:** Homepage / Members & News  
**Started:** 2026-06-04T12:44:55Z  
**Duration:** ~0m 10s  

### Observations

- PASS — Section "Участники ассоциации" present; carousel contains 15 slide groups (5 unique members × 3 repetitions for loop fill):
  - BitHub (link to bithub.kg, img alt="BitHub")
  - Envoys (link to envoys.vision, img alt="Envoys")
  - KLN (link to kln.kg, img alt="KLN")
  - Royal Inc. (link to www.royal.inc, img alt="Royal Inc.")
  - WeChange (link to www.wechange.kg, img alt="WeChange")
- PASS — Section "Последние события" present (`heading [level=2]`).
- PASS — At least three news cards with titles and dates confirmed:
  1. "Избран новый состав Наблюдательного Совета АУРВА" — 24 февр. 2026 г.
  2. "Бизнес Форум B5+1" — 9 февр. 2026 г.
  3. "Первое собрание Экспертного совета АУРВА в 2026 году" — 21 янв. 2026 г.
- PASS — Link "Все новости" present (`link [url=/news]`).

### Noted issue (non-blocking, cosmetic)

The Swiper carousel for "Участники ассоциации" generates a console warning:  
`Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled or not function properly.`  
This means the infinite-loop setting is effectively disabled because only 5 members are registered (Swiper requires more slides than the visible count for seamless looping). The workaround of tripling the items (15 total) is already in place but Swiper still flags it. The carousel is functional (all members visible, dot navigation works); only the smooth auto-loop may skip or stutter. Suggested fix: increase `slidesPerGroup` / reduce `slidesPerView` on mobile, or disable `loop` and use `autoplay` without loop.

### Console / network errors

`[WARNING] Swiper Loop Warning: The number of slides is not enough for loop mode...` — functional impact low; carousel still navigable.  
GA/GTM CSP errors — known noise, ignored.

### Screenshot

`journey-results/screenshots/J005-redesign.png`  
(full-page screenshot)

---

## Result Summary

| Journey | Title                              | Status | Viewport  | Failed Observations |
|---------|------------------------------------|--------|-----------|---------------------|
| J001    | Главная загружается                | PASSED | 1280x800  | none                |
| J002    | Десктоп-навигация                  | PASSED | 1280x800  | none                |
| J003    | Мобильное меню                     | PASSED | 390x844   | none                |
| J004    | Секции главной при прокрутке       | PASSED | 1280x800  | none                |
| J005    | Участники и новости                | PASSED | 1280x800  | none                |

**All 5 journeys passed.** No regressions detected after the visual redesign.  
One non-blocking Swiper loop warning noted in J004/J005 (pre-existing; carousel is usable).
