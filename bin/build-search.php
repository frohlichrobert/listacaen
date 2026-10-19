<?php
declare(strict_types=1);

// Generează assets/search.json, folosit de căutarea din browser.
// Folosire: php bin/build-search.php

require __DIR__ . '/../inc/compat.php';
require __DIR__ . '/../inc/data.php';

function fold_text(string $v): string
{
    $v = strtr(mb_strtolower($v), [
        'ă' => 'a', 'â' => 'a', 'î' => 'i', 'ș' => 's', 'ț' => 't', 'ş' => 's', 'ţ' => 't',
    ]);
    $v = preg_replace('/[^a-z0-9\s]/', ' ', $v);
    return trim(preg_replace('/\s+/', ' ', $v));
}

function note_bits(array $nodes): array
{
    $bits = [];
    foreach ($nodes as $node) {
        $bits[] = (string) ($node['t'] ?? '');
        if (!empty($node['k'])) {
            $bits = array_merge($bits, note_bits($node['k']));
        }
    }
    return $bits;
}

function fold_note(string $slug): string
{
    $note = caen_note($slug);
    if ($note === null) {
        return '';
    }
    $bits = [];
    foreach (['includes', 'also', 'excludes'] as $key) {
        $bits = array_merge($bits, note_bits($note[$key] ?? []));
    }
    $folded = fold_text(implode(' ', $bits));
    $stop = array_flip(explode(' ', 'aceasta acest aceste clasa include inclusiv inclus activitati activitatea activitate alte altor pentru care sunt este din sau prin mai'));
    $words = array_filter(explode(' ', $folded), fn ($w) => strlen($w) > 2 && !isset($stop[$w]));
    return implode(' ', $words);
}

$nodes = [];
foreach (caen()['ordered'] as $slug) {
    $n = node($slug);
    $nodes[] = [$n['slug'], $n['code'], $n['name'], $n['level'][0], fold_text($n['name']), search_context($n), fold_note($slug)];
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
