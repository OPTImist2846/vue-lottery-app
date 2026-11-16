# vue-lottery-app

Застосунок-лотерея на Vue 3 (Composition API, TypeScript).

- Лабораторна робота №4 — компоненти, computed, watchers, форми, props та події (гілка `main`).
- Лабораторна робота №5 — маршрутизація з vue-router, патерн Repository, JWT-авторизація (гілка `feature/routing`).

Демо: https://optimist2846.github.io/vue-lottery-app/

Тестовий акаунт DummyJSON: `emilys` / `emilyspass`.

## Можливості

- сторінки Home, About author, Users, Login та 404 з лінивим завантаженням компонентів
- `AppHeader`, `AppNavigation` з виділенням активного розділу, `AppLogo`
- layouts через `meta.layout`: `DefaultLayout` та `AuthLayout` для сторінки логіну
- користувачі з DummyJSON: пагінація (`limit`/`skip`), пошук і сортування зберігаються в query-параметрах (`/users?page=2&q=john`)
- сторінка користувача `/users/:id` (`props: true`) та вкладений маршрут редагування `/users/:id/edit`
- створення, редагування та видалення користувачів; оскільки DummyJSON лише імітує POST/PUT/DELETE, зміни зберігаються в локальному стані Pinia
- випадковий вибір до трьох переможців
- авторизація через `POST /auth/login`, токени в Pinia та localStorage, `Authorization: Bearer` для запитів, дані поточного користувача з `/auth/me`
- автоматичне оновлення `accessToken` через `POST /auth/refresh` при відповіді 401
- navigation guard з `meta.requiresAuth`, редірект на `/login?redirect=…` та назад після входу
- заголовок вкладки з `meta.title` через `router.afterEach`
- валідація форм VeeValidate + Zod, стани завантаження та помилок

## Архітектура даних (Repository)

| Шар | Файли |
| --- | --- |
| Моделі | `src/types/user.ts`, `src/types/auth.ts` |
| Контракти | `src/services/interfaces.ts` — `Readable<T>`, `Searchable<T>`, `Creatable<T, TCreate>`, `Editable<T, TUpdate>`, `Deletable<T>` |
| HTTP-клієнт | `src/api/http-client.ts` — базова адреса з `VITE_API_URL`, Bearer-токен, interceptor для 401 |
| Репозиторії | `src/services/user.service.ts`, `src/services/auth.service.ts` |
| Фабрика | `src/services/service-provider.ts` — `ServiceProvider.users`, `ServiceProvider.auth` |
| Клієнтський код | Pinia-стори `src/stores/*` та сторінки `src/views/*` |

## Налаштування середовища

```sh
cp .env.example .env
```

| Змінна | Опис |
| --- | --- |
| `VITE_API_URL` | адреса REST API, наприклад `https://dummyjson.com` |
| `VITE_AUTH_EXPIRES_IN_MINS` | час життя access token у хвилинах |

## Запуск

```sh
npm install
npm run dev
```

## Скрипти

| Команда | Опис |
| --- | --- |
| `npm run dev` | dev-сервер |
| `npm run build` | перевірка типів і production-збірка |
| `npm run test:unit` | unit-тести (Vitest) |
| `npm run lint` | oxlint + ESLint |
| `npm run format` | Prettier |
| `npm run deploy` | збірка з base `/vue-lottery-app/` і публікація `dist` у гілку `gh-pages` |
