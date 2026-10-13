<?php
declare(strict_types=1);

// Generează assets/search.json, folosit de căutarea din browser.
// Folosire: php bin/build-search.php

require __DIR__ . '/../inc/data.php';

function fold_text(string $v): string
{
    $v = strtr(mb_strtolower($v), [
        'ă' => 'a', 'â' => 'a', 'î' => 'i', 'ș' => 's', 'ț' => 't', 'ş' => 's', 'ţ' => 't',
    ]);
    $v = preg_replace('/[^a-z0-9\s]/', ' ', $v);
    return trim(preg_replace('/\s+/', ' ', $v));
}

$nodes = [];
foreach (caen()['ordered'] as $slug) {
    $n = node($slug);
    $nodes[] = [$n['slug'], $n['code'], $n['name'], $n['level'][0], fold_text($n['name']), search_context($n)];
}
$old = [];
foreach (rev2()['classes'] as $c) {
    $old[] = [$c['code'], $c['name'], fold_text($c['name'])];
}

file_put_contents(
    __DIR__ . '/../assets/search.json',
    json_encode(['nodes' => $nodes, 'rev2' => $old], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);
echo 'search.json: ', count($nodes), " noduri, ", count($old), " coduri Rev. 2\n";
