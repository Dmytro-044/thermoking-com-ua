# thermoking.com.ua — сайт на Hugo

Новий сайт «Термо Кінг Україна», зібраний за затвердженим дизайном (див. `DESIGN.md`).

## Структура

- `hugo.toml` — налаштування сайту
- `data/site.yaml` — **увесь контент**: контакти, меню, послуги, обладнання, станції, FAQ. Тексти редагуються тут, без правки шаблонів.
- `layouts/` — шаблони (`baseof.html`, `home.html`, `404.html`, розділи в `_partials/sections/`)
- `assets/css/styles.css`, `assets/js/main.js` — стилі та скрипти (Hugo мінімізує їх і додає хеш у назву)
- `assets/img/hero-frost.jpg` — головне фото. Hugo сам робить версії 1920 px, 900 px і картинку для соцмереж. Щоб замінити фото, покладіть новий файл під тією ж назвою.
- `static/_headers` — заголовки кешування та безпеки для Cloudflare Pages

## Локально

```bash
hugo server
```

## Збірка й розміщення на Cloudflare Pages

```bash
npm install
```

```bash
npm run deploy:test
```

Тестова збірка (`build:test`) додає `noindex`, щоб пошуковики не індексували тестову адресу. Для продакшену використовуйте `npm run build` і `wrangler pages deploy public --project-name thermoking-com-ua --branch main`.

Потрібні Hugo 0.146+ і змінна `CLOUDFLARE_API_TOKEN` з правом Cloudflare Pages: Edit.

## Що ще не підключено

Форми зараз лише показують повідомлення «Дякуємо». Перед запуском їх треба підключити до пошти, CRM або Telegram, наприклад через Cloudflare Pages Functions.
