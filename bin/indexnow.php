<?php
declare(strict_types=1);

// Anunță motoarele de căutare care folosesc IndexNow (Bing, Yandex, Seznam,
// Naver, Yep) despre adresele site-ului. Google nu folosește IndexNow.
//
// Folosire:
//   php bin/indexnow.php --dry-run        arată ce s-ar trimite, fără să trimită
//   php bin/indexnow.php                  trimite toate adresele din sitemap
//   php bin/indexnow.php /caen/6210/ ...  trimite doar adresele date
//   --force                               trimite chiar dacă serverul nu își poate citi singur cheia
//
// Prima rulare creează cheia în rădăcina proiectului (<cheie>.txt). Fișierul
// trebuie urcat pe server, la https://listacaen.ro/<cheie>.txt, ÎNAINTE de trimitere.

require __DIR__ . '/../inc/compat.php';
require __DIR__ . '/../inc/data.php';
require __DIR__ . '/../inc/pages.php';

const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const BATCH = 10000;

$root = dirname(__DIR__);
$args = array_slice($argv, 1);
$dry = in_array('--dry-run', $args, true);
$paths = array_values(array_filter($args, fn ($a) => str_starts_with($a, '/')));

// cheia: fișier <32 hex>.txt cu același conținut în rădăcină
$key = null;
foreach (glob($root . '/*.txt') ?: [] as $f) {
    if (preg_match('/^([a-f0-9]{32})\.txt$/', basename($f), $m) && trim((string) file_get_contents($f)) === $m[1]) {
        $key = $m[1];
        break;
    }
}
if ($key === null) {
    $key = bin2hex(random_bytes(16));
    file_put_contents("$root/$key.txt", $key);
    echo "Cheie nouă creată: $key.txt\n";
    echo "Urcă-l pe server în document root (https://listacaen.ro/$key.txt), apoi rulează din nou.\n";
    exit(0);
}

$urls = $paths
    ? array_map('abs_url', $paths)
    : array_map(fn ($u) => abs_url($u[0]), sitemap_urls());
$keyLocation = SITE_URL . "/$key.txt";

echo count($urls), " adrese, cheie: $key\n";
if ($dry) {
    echo "keyLocation: $keyLocation\nPrimele adrese:\n  " . implode("\n  ", array_slice($urls, 0, 5)) . "\n(dry-run: nu am trimis nimic)\n";
    exit(0);
}

/** Cerere HTTP cu curl dacă există, altfel cu fluxuri PHP. Returnează [status, corp, eroare]. */
function http(string $method, string $url, ?string $body = null): array
{
    $headers = $body !== null ? ['Content-Type: application/json; charset=utf-8'] : [];
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 30, CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CUSTOMREQUEST => $method, CURLOPT_HTTPHEADER => $headers,
        ]);
        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        $out = curl_exec($ch);
        $res = [(int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE), is_string($out) ? $out : '', $out === false ? curl_error($ch) : ''];
        curl_close($ch);
        return $res;
    }
    $ctx = stream_context_create(['http' => [
        'method' => $method, 'header' => implode("\r\n", $headers), 'content' => $body ?? '',
        'ignore_errors' => true, 'timeout' => 30,
    ]]);
    $out = @file_get_contents($url, false, $ctx);
    $status = isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m) ? (int) $m[1] : 0;
    $err = $out === false ? (error_get_last()['message'] ?? 'cerere eșuată (allow_url_fopen oprit sau fără OpenSSL?)') : '';
    return [$status, $out === false ? '' : $out, $err];
}

// cheia trebuie să fie vizibilă public, altfel cererea e respinsă (403)
[$st, $text, $err] = http('GET', $keyLocation);
if ($st !== 200 || trim($text) !== $key) {
    fwrite(STDERR, "Nu pot citi $keyLocation din acest mediu (HTTP $st" . ($err !== '' ? ", $err" : '') . ").\n");
    fwrite(STDERR, "Dacă fișierul se deschide în browser, rulează scriptul de pe alt calculator (de exemplu Mac-ul tău), sau cu --force.\n");
    if (!in_array('--force', $args, true)) {
        exit(1);
    }
}

foreach (array_chunk($urls, BATCH) as $i => $chunk) {
    $body = json_encode(['host' => 'listacaen.ro', 'key' => $key, 'keyLocation' => $keyLocation, 'urlList' => $chunk], JSON_UNESCAPED_SLASHES);
    [$status, $resp, $err] = http('POST', ENDPOINT, $body);
    echo 'Lot ' . ($i + 1) . ': ' . count($chunk) . " adrese -> HTTP $status" . ($err !== '' ? " ($err)" : '') . ($resp !== '' ? " $resp" : '') . "\n";
}
echo "200/202 = primit. 403 = cheie invalidă, 422 = adrese în afara domeniului, 429 = prea multe cereri.\n";
