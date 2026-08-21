# Перенос hero-картинок на Cloudinary

Задача для Cursor: у Claude в облачной сессии нет ключей Cloudinary, поэтому заливку делает Cursor локально.

## Что не так сейчас

139 hero-картинок подтягиваются напрямую с Wikimedia (75 с `upload.wikimedia.org`, 64 с `commons.wikimedia.org`):

- **Могут исчезнуть.** Апстрим переименовал или удалил файл — на странице пустое место, и мы узнаём об этом от посетителя.
- **Тормозят LCP.** Главная картинка страницы грузится с чужого домена, у `Special:FilePath/` ещё и редирект сверху.
- **Не работают на нас.** В поиске по картинкам они не наши, ими нельзя управлять (кроп, WebP, размеры).
- **Против правил Wikimedia**, которые просят не хотлинкать в продакшене.

## Как перенести

```bash
# 1. Собрать манифест (что и откуда тянем)
npm run images:manifest

# 2. Посмотреть, что будет сделано, без загрузки
npm run images:mirror:dry

# 3. Ключи Cloudinary
export CLOUDINARY_CLOUD_NAME=...
export CLOUDINARY_API_KEY=...
export CLOUDINARY_API_SECRET=...

# 4. Прогон на одной коллекции, чтобы убедиться
python3 scripts/upload-heroes-cloudinary.py --collection areas --limit 3

# 5. Всё остальное
npm run images:mirror

# 6. Проверки
npm run images:manifest      # external должно стать 0
npm run validate:content -- --all
npm run build && npm run audit:rendered:fail
```

Скрипт скачивает файл, кладёт его в `more-group/capetown/{коллекция}/{slug}` и сразу переписывает `heroImage` в MDX на постоянный Cloudinary URL. Ошибку по одной картинке он логирует и идёт дальше, так что прогон можно повторять — уже перенесённые пропускаются (`overwrite=false`, а `external: false` выводит их из очереди).

## После переноса

`src/lib/cardImage.ts` уже умеет Cloudinary: для карточек подставляет `w_640,h_360,c_fill,q_auto,f_auto`, для hero `w_1400,h_560`. То есть автосжатие и WebP включатся сами, без правок кода.

## Атрибуция

Файлы с Wikimedia остаются под своими лицензиями (обычно CC BY-SA). Перенос на свой CDN этого не отменяет. Если для конкретной картинки лицензия требует указания автора, добавьте строку атрибуции в подпись или в `/methodology/`. Ссылку на исходник каждого файла манифест сохраняет в `scripts/capetown-hero-images.json` (поле `source`), так что источник всегда можно поднять.
