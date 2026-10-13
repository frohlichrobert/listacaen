<?php
declare(strict_types=1);

// Nomenclator CAEN Rev. 3 (Ordinul INS nr. 377/2024), structura Rev. 2 și
// tabelul de corespondență Rev. 2 -> Rev. 3. Portat din src/lib/*.ts.

const SITE_URL = 'https://listacaen.ro';
const SITE_NAME = 'listacaen.ro';
const GA_ID = 'G-X3YVX1G101';
const LASTMOD = '2026-10-13';

const LEVEL_LABEL = [
    'section' => 'Secțiune',
    'division' => 'Diviziune',
    'group' => 'Grupă',
    'class' => 'Clasă',
];

function read_json(string $file): array
{
    $raw = file_get_contents(__DIR__ . '/../data/' . $file);
    return json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
}

/** @return array{by: array<string,array>, ordered: array, sections: array, counts: array} */
function caen(): array
{
    static $db = null;
    if ($db !== null) {
        return $db;
    }

    $by = [];
    $ordered = [];
    $sections = [];
    $blank = ['divisionCount' => 0, 'groupCount' => 0, 'classCount' => 0, 'childSlugs' => []];

    foreach (read_json('caen-rev3.json') as $section) {
        $sectionSlug = strtolower($section['code']);
        $divisionSlugs = [];
        $sectionGroups = 0;
        $sectionClasses = 0;

        foreach ($section['divisions'] as $division) {
            $groupSlugs = [];
            $divisionClasses = 0;

            foreach ($division['groups'] as $group) {
                $classSlugs = [];
                foreach ($group['codes'] as $item) {
                    $classSlugs[] = $item['code'];
                    $node = $blank + [
                        'slug' => $item['code'], 'code' => $item['code'], 'name' => $item['name'],
                        'level' => 'class', 'sectionSlug' => $sectionSlug,
                        'divisionSlug' => $division['code'], 'groupSlug' => $group['code'],
                        'parentSlug' => $group['code'],
                    ];
                    $by[$node['slug']] = $node;
                    $ordered[] = $node['slug'];
                }
                $divisionClasses += count($classSlugs);
                $groupSlugs[] = $group['code'];
                $node = [
                    'slug' => $group['code'], 'code' => $group['code'], 'name' => $group['name'],
                    'level' => 'group', 'sectionSlug' => $sectionSlug,
                    'divisionSlug' => $division['code'], 'groupSlug' => $group['code'],
                    'parentSlug' => $division['code'], 'childSlugs' => $classSlugs,
                    'divisionCount' => 0, 'groupCount' => 0, 'classCount' => count($classSlugs),
                ];
                $by[$node['slug']] = $node;
                $ordered[] = $node['slug'];
            }

            $sectionGroups += count($groupSlugs);
            $sectionClasses += $divisionClasses;
            $divisionSlugs[] = $division['code'];
            $node = [
                'slug' => $division['code'], 'code' => $division['code'], 'name' => $division['name'],
                'level' => 'division', 'sectionSlug' => $sectionSlug,
                'divisionSlug' => $division['code'], 'parentSlug' => $sectionSlug,
                'childSlugs' => $groupSlugs, 'divisionCount' => 0,
                'groupCount' => count($groupSlugs), 'classCount' => $divisionClasses,
            ];
            $by[$node['slug']] = $node;
            $ordered[] = $node['slug'];
        }

        $node = [
            'slug' => $sectionSlug, 'code' => strtoupper($section['code']), 'name' => $section['name'],
            'level' => 'section', 'sectionSlug' => $sectionSlug, 'parentSlug' => null,
            'childSlugs' => $divisionSlugs, 'divisionCount' => count($divisionSlugs),
            'groupCount' => $sectionGroups, 'classCount' => $sectionClasses,
        ];
        $by[$node['slug']] = $node;
        $ordered[] = $node['slug'];
        $sections[] = $node['slug'];
    }

    $counts = ['sections' => count($sections), 'divisions' => 0, 'groups' => 0, 'classes' => 0];
    foreach ($sections as $slug) {
        $counts['divisions'] += $by[$slug]['divisionCount'];
        $counts['groups'] += $by[$slug]['groupCount'];
        $counts['classes'] += $by[$slug]['classCount'];
    }

    return $db = ['by' => $by, 'ordered' => $ordered, 'sections' => $sections, 'counts' => $counts];
}

function node(string $slug): ?array
{
    return caen()['by'][strtolower(trim($slug))] ?? null;
}

function sections(): array
{
    return array_map('node', caen()['sections']);
}

function children_of(array $n): array
{
    return array_map('node', $n['childSlugs']);
}

function ancestors_of(array $n): array
{
    $trail = [];
    $slug = $n['parentSlug'];
    while ($slug !== null) {
        $parent = node($slug);
        if ($parent === null) {
            break;
        }
        $trail[] = $parent;
        $slug = $parent['parentSlug'];
    }
    return array_reverse($trail);
}

function neighbors_of(array $n): array
{
    $db = caen();
    $same = array_values(array_filter($db['ordered'], fn ($s) => $db['by'][$s]['level'] === $n['level']));
    $i = array_search($n['slug'], $same, true);
    if ($i === false) {
        return [null, null];
    }
    return [
        $i > 0 ? $db['by'][$same[$i - 1]] : null,
        $i < count($same) - 1 ? $db['by'][$same[$i + 1]] : null,
    ];
}

function plural(int $count, string $one, string $many): string
{
    return $count . ' ' . ($count === 1 ? $one : $many);
}

function clip(string $text, int $max): string
{
    if (mb_strlen($text) <= $max) {
        return $text;
    }
    $cut = mb_substr($text, 0, $max - 1);
    $space = mb_strrpos($cut, ' ');
    $base = ($space !== false && $space > $max * 0.6) ? mb_substr($cut, 0, $space) : $cut;
    return rtrim($base) . '…';
}

function describe(array $n): string
{
    $section = node($n['sectionSlug']);
    if ($section === null) {
        return $n['name'];
    }

    if ($n['level'] === 'section') {
        return "Lista codurilor CAEN din secțiunea {$n['code']} grupează activitățile „{$n['name']}”: "
            . plural($n['divisionCount'], 'diviziune', 'diviziuni') . ', '
            . plural($n['groupCount'], 'grupă', 'grupe') . ' și '
            . plural($n['classCount'], 'clasă', 'clase') . ' CAEN Rev. 3.';
    }

    $division = isset($n['divisionSlug']) ? node($n['divisionSlug']) : null;

    if ($n['level'] === 'division') {
        return "Coduri CAEN {$n['code']}: diviziunea „{$n['name']}”, în secțiunea {$section['code']} — {$section['name']}. Cuprinde "
            . plural($n['groupCount'], 'grupă', 'grupe') . ' și ' . plural($n['classCount'], 'clasă', 'clase') . '.';
    }

    if ($n['level'] === 'group' && $division) {
        return "Coduri CAEN {$n['code']}: grupa „{$n['name']}”, în diviziunea {$division['code']} — {$division['name']}, secțiunea {$section['code']}. Conține "
            . plural($n['classCount'], 'clasă', 'clase') . '.';
    }

    $group = isset($n['groupSlug']) ? node($n['groupSlug']) : null;
    if ($division && $group) {
        return "Codul CAEN {$n['code']} este clasa pentru „{$n['name']}”. Intră în grupa {$group['code']} {$group['name']}, "
            . "diviziunea {$division['code']} {$division['name']}, secțiunea {$section['code']} {$section['name']}.";
    }

    return $n['name'];
}

function search_context(array $n): string
{
    return match ($n['level']) {
        'section' => 'Secțiune',
        'division' => 'Diviziune · Secțiunea ' . (node($n['sectionSlug'])['code'] ?? ''),
        'group' => 'Grupă · Diviziunea ' . $n['divisionSlug'],
        default => 'Clasă · Diviziunea ' . $n['divisionSlug'],
    };
}

function caen_path(string $slug): string
{
    return "/caen/{$slug}/";
}

function abs_url(string $path): string
{
    return $path === '/' ? SITE_URL . '/' : SITE_URL . (str_starts_with($path, '/') ? $path : "/{$path}");
}

// ---- CAEN Rev. 2 și corespondența cu Rev. 3 ----

function rev2(): array
{
    static $r = null;
    if ($r !== null) {
        return $r;
    }
    $raw = read_json('caen-rev2.json');
    $classes = [];
    ksort($raw['classes'], SORT_STRING);
    foreach ($raw['classes'] as $code => $name) {
        $code = (string) $code;
        $classes[$code] = ['code' => $code, 'name' => $name, 'division' => substr($code, 0, 2)];
    }
    $divisions = [];
    ksort($raw['divisions'], SORT_STRING);
    foreach ($raw['divisions'] as $code => $name) {
        $divisions[(string) $code] = $name;
    }

    $byRev2 = [];
    $byRev3 = [];
    foreach (read_json('caen-corespondenta.json') as $row) {
        $byRev2[$row['rev2']][] = $row;
        $byRev3[$row['rev3']][] = $row;
    }

    return $r = ['classes' => $classes, 'divisions' => $divisions, 'byRev2' => $byRev2, 'byRev3' => $byRev3];
}

function rev2_class(string $code): ?array
{
    return rev2()['classes'][$code] ?? null;
}

function rev2_path(string $code): string
{
    return "/caen-rev2/{$code}/";
}

/** @return array<int,array{node:array,note:string}> */
function targets_of(string $code): array
{
    $out = [];
    foreach (rev2()['byRev2'][$code] ?? [] as $row) {
        if ($n = node($row['rev3'])) {
            $out[] = ['node' => $n, 'note' => $row['note']];
        }
    }
    return $out;
}

/** @return array<int,array{item:array,note:string}> */
function sources_of(string $rev3): array
{
    $out = [];
    foreach (rev2()['byRev3'][$rev3] ?? [] as $row) {
        if ($item = rev2_class($row['rev2'])) {
            $out[] = ['item' => $item, 'note' => $row['note']];
        }
    }
    return $out;
}

function target_summary(string $code): string
{
    $codes = array_values(array_unique(array_map(fn ($t) => $t['node']['code'], targets_of($code))));
    if (!$codes) {
        return 'fără corespondent';
    }
    return count($codes) > 3 ? implode(', ', array_slice($codes, 0, 3)) . '…' : implode(', ', $codes);
}
