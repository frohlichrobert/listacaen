<?php
// Server local, doar pentru dezvoltare: php -S localhost:8000 -t . bin/dev-router.php
// (în producție se ocupă Apache cu .htaccess)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/(inc|data|bin)(/|$)#', $uri)) {
    http_response_code(404);
    exit;
}
if (is_file(__DIR__ . '/..' . $uri)) {
    return false;
}
require __DIR__ . '/../index.php';
