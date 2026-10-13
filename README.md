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

Aspectul folosește `assets/site.css`, un CSS Tailwind deja compilat. Clase noi în markup nu apar în el decât dacă sunt recompilate.
