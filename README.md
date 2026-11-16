# vue-lottery-app

Лабораторна робота №4: застосунок-лотерея на Vue 3 (Composition API, TypeScript).

## Можливості

- реєстрація учасників з валідацією (обов'язкові поля, e-mail і телефон за regexp, дата народження не в майбутньому, унікальний e-mail)
- випадковий вибір до трьох переможців і видалення переможців
- таблиця учасників з редагуванням і видаленням через модальні вікна
- сортування за іменем і датою народження, пошук за іменем
- збереження учасників у localStorage

## Стек

Vue 3, TypeScript, Vite, Bootstrap 5 (SCSS, лише потрібні модулі), Bootstrap Icons, ESLint, Prettier, Vitest.

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
| `npm run test:unit` | unit-тести |
| `npm run lint` | oxlint + ESLint |
| `npm run format` | Prettier |
