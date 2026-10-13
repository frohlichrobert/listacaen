# listacaen.ro

Listă CAEN Rev. 3, cu căutare și o pagină pentru fiecare secțiune, diviziune, grupă și clasă, plus corespondența Rev. 2 – Rev. 3. Site PHP simplu, fără framework și fără dependențe.

## Structură

| Cale | Rol |
| --- | --- |
| `index.php` | front controller: orice URL care nu e fișier ajunge aici |
| `inc/data.php` | încarcă nomenclatorul și corespondența din `data/` |
| `inc/seo.php` | titluri, descrieri, JSON-LD |
| `inc/view.php` | layout și componente HTML |
| `inc/pages.php` | paginile, sitemap.xml, robots.txt |
| `assets/` | CSS, `app.js` (căutare, cookie-uri, copiere cod), imagini, `search.json` |
| `data/` | `caen-rev3.json`, `caen-rev2.json`, `caen-corespondenta.json` |
| `scripts/` | extragerea datelor Rev. 2 și a corespondenței din PDF-urile INS |
| `bin/` | scripturi de dezvoltare și de împachetare |

## Dezvoltare

```bash
php -S localhost:8000 -t . bin/dev-router.php
```

## Deploy

```bash
sh bin/build-zip.sh      # regenerează assets/search.json și creează site.zip
```

Încarcă `site.zip` în document root-ul domeniului (de exemplu `public_html`) și extrage-l acolo. `.htaccess` face redirectele http → https și www → fără www și trimite URL-urile către `index.php`. Necesită Apache cu `mod_rewrite` și PHP 8.1 sau mai nou.

## Date

După o modificare în `data/`, rulează `php bin/build-search.php`. Datele Rev. 2 și corespondența se regenerează din PDF-urile INS (în `data-src/`, ignorate de Git):

```bash
python3 scripts/rev2-from-pdf.py
python3 scripts/corespondenta-from-pdf.py
```

Aspectul vine din `assets/site.css` (Tailwind deja compilat, nu se mai modifică) și din `assets/extra.css` (design propriu: hero, căutare, carduri; prevalează asupra Tailwind). Clase Tailwind noi în markup nu au efect, deci stilurile noi se scriu în `extra.css`, cu prefixul `lc-`. După orice modificare de CSS/JS crește `ASSET_V` în `inc/data.php`, ca browserele să nu folosească fișierele vechi din cache.

## IndexNow

Anunță Bing, Yandex, Seznam, Naver și Yep despre adrese noi sau schimbate (Google nu folosește IndexNow, acolo rămâne Search Console).

```bash
php bin/indexnow.php --dry-run   # ce s-ar trimite
php bin/indexnow.php             # trimite toate adresele din sitemap
php bin/indexnow.php /caen/6210/ # doar anumite adrese
```

Cheia este fișierul `<cheie>.txt` din rădăcină (public, nu e secret) și trebuie urcat pe server la `https://listacaen.ro/<cheie>.txt` înainte de trimitere. `bin/build-zip.sh` îl include în `site.zip`.
