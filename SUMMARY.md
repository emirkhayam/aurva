# Customer Journey Test Summary — 2026-06-16

Run with: blind journey navigation (Playwright MCP) · target: site `http://localhost:5000`
Scope: **anonymous, read-only** journeys only (live cloud Supabase behind the app — no logins, no form submits, no mutations).
Previous run archived in `journey-results/SUMMARY-archive-20260616-013711.md`.

## Tally
| Status | Count |
|--------|-------|
| ✅ PASS | 14 |
| ❌ FAIL | 0 |
| ⛔ BLOCKED | 0 |
| **Total** | **14** |

## By category
- **A_anonymous** (J001–J012): 12 / 12 PASS
- **D_edge** (J013 404, J014 admin gate): 2 / 2 PASS

## Coverage of today's changes (16.06)
- ✅ Тёмная тема — страницы рендерятся корректно во всех journeys (тема не ломает контент).
- ✅ Новости: список (43 карточки, J008) и детальная (J009) — **галерея-слайдер Swiper работает**.
- ✅ «О нас» (J007): новая **структура ассоциации** (4 руководства + 11 эксп. совета, 15/15 фото) и **партнёры** (4 карточки/логотипа) на месте.
- ✅ Участники на главной (J005): 11 логотипов в карусели.

## Findings (non-blocking) — see BUGS.md
| # | Severity | Summary |
|---|----------|---------|
| 1 | medium (pre-prod) | DEV «Быстрый вход» виден на /admin/login — пересобрать админку перед продом |
| 2 | low (info) | GTM → doubleclick.net блокируется CSP (шум в консоли, не влияет на UX) |
| 3 | low (UX) | На /news нет ссылки «На главную» (есть «Главная») — расхождение формулировки сценария |

## UX-discoverability
Слепой обход не «заблудился» нигде: вся навигация (десктоп + мобайл), новости, курсы, кабинет, футер, edge-кейсы (404, гейт админки) достижимы и ведут себя ожидаемо. Критичных проблем обнаруживаемости нет.

## Verdict
**Зелёный прогон.** Функциональных дефектов нет. Единственный значимый пункт — пересборка админки (Finding #1) перед деплоем; он уже в чеклисте перед продом.

## Not covered (by design — prod DB safety)
Авторизованные/мутационные пути (регистрация, вход в кабинет, отправка форм, админ-CRUD) — требуют staging-фикстур и тестовых аккаунтов. На боевом Supabase не прогонялись.
