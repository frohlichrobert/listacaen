<?php
declare(strict_types=1);

// Titluri, descrieri și JSON-LD. Portat din src/lib/seo.ts.

function home_title(): string
{
    return 'Coduri CAEN — Lista CAEN completă (Rev. 3) | listacaen.ro';
}

function home_description(): string
{
    $c = caen()['counts'];
    return "Lista CAEN completă: caută orice cod CAEN după cifre sau denumire. {$c['classes']} de coduri CAEN Rev. 3 (clase), în {$c['groups']} de grupe și {$c['divisions']} de diviziuni.";
}

function title_name(string $name, int $max): string
{
    $plain = trim(preg_replace('/\s+/u', ' ', preg_replace('/\s*\([^)]*\)/u', '', $name)));
    return clip($plain, $max);
}

function title_for(array $n): string
{
    if ($n['level'] === 'section') {
        $prefix = "Coduri CAEN secțiunea {$n['code']} — ";
        return $prefix . title_name($n['name'], 72 - mb_strlen($prefix));
    }
    $prefix = $n['level'] === 'division' ? "Coduri CAEN {$n['code']} — " : "Cod CAEN {$n['code']} — ";
    return $prefix . title_name($n['name'], 70 - mb_strlen($prefix));
}

function description_for(array $n): string
{
    return clip(describe($n), 158);
}

function defined_term_ld(array $n): array
{
    return [
        '@type' => 'DefinedTerm',
        '@id' => abs_url(caen_path($n['slug'])) . '#term',
        'name' => $n['name'],
        'termCode' => $n['code'],
        'description' => describe($n),
        'inDefinedTermSet' => [
            '@type' => 'DefinedTermSet',
            'name' => 'CAEN Rev. 3',
            'description' => 'Clasificarea activităților din economia națională, Rev. 3',
            'url' => SITE_URL . '/',
        ],
    ];
}

function breadcrumb_ld(array $n): array
{
    $crumbs = [['name' => 'Coduri CAEN', 'path' => '/']];
    foreach (ancestors_of($n) as $a) {
        $crumbs[] = ['name' => LEVEL_LABEL[$a['level']] . " {$a['code']} — {$a['name']}", 'path' => caen_path($a['slug'])];
    }
    $crumbs[] = ['name' => LEVEL_LABEL[$n['level']] . " {$n['code']} — {$n['name']}", 'path' => caen_path($n['slug'])];

    return breadcrumb_list($crumbs);
}

function breadcrumb_list(array $crumbs): array
{
    $items = [];
    foreach ($crumbs as $i => $c) {
        $items[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $c['name'], 'item' => abs_url($c['path'])];
    }
    return ['@type' => 'BreadcrumbList', 'itemListElement' => $items];
}

function item_list_ld(string $name, array $nodes): array
{
    $items = [];
    foreach (array_values($nodes) as $i => $n) {
        $items[] = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => "CAEN {$n['code']} — {$n['name']}", 'url' => abs_url(caen_path($n['slug']))];
    }
    return ['@type' => 'ItemList', 'name' => $name, 'numberOfItems' => count($nodes), 'itemListElement' => $items];
}

function website_ld(): array
{
    return [
        '@context' => 'https://schema.org',
        '@type' => 'WebSite',
        'name' => SITE_NAME,
        'url' => SITE_URL . '/',
        'inLanguage' => 'ro-RO',
        'description' => home_description(),
    ];
}
