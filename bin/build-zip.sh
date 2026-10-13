#!/bin/sh
# Creează site.zip cu tot ce trebuie încărcat în document root.
# Folosire: sh bin/build-zip.sh
set -e
cd "$(dirname "$0")/.."
php bin/build-search.php
rm -f site.zip
zip -qr site.zip .htaccess index.php favicon.ico inc data assets -x "*.DS_Store"
ls -lh site.zip
