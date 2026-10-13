<?php
declare(strict_types=1);

// Front controller: .htaccess trimite aici orice URL care nu e fișier real.

require __DIR__ . '/inc/data.php';
require __DIR__ . '/inc/seo.php';
require __DIR__ . '/inc/view.php';
require __DIR__ . '/inc/pages.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = rawurldecode($path);

function send(string $html, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: public, max-age=300');
    echo $html;
    exit;
}

function redirect(string $to): never
{
    header('Location: ' . $to, true, 301);
    exit;
}

if ($path === '/sitemap.xml') {
    header('Content-Type: application/xml; charset=utf-8');
    echo sitemap_xml();
    exit;
}
if ($path === '/robots.txt') {
    header('Content-Type: text/plain; charset=utf-8');
    echo robots_txt();
    exit;
}

// Adresele canonice se termină cu «/».
if ($path !== '/' && !str_ends_with($path, '/')) {
    redirect($path . '/' . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : ''));
}

if ($path === '/') {
    send(page_home());
}
if ($path === '/despre/') {
    send(page_despre());
}
if ($path === '/ghid/cum-alegi-codul-caen/') {
    send(page_ghid());
}
if ($path === '/caen-rev2/') {
    send(page_rev2_index());
}
if (preg_match('#^/caen-rev2/(\d{4})/$#', $path, $m) && ($item = rev2_class($m[1]))) {
    send(page_rev2($item));
}
if (preg_match('#^/caen/([A-Za-z0-9]+)/$#', $path, $m) && ($n = node($m[1]))) {
    if ($m[1] !== $n['slug']) {
        redirect(caen_path($n['slug']));
    }
    send(page_code($n));
}

send(page_404(), 404);
