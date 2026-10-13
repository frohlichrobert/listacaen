<?php
declare(strict_types=1);

// Layout și componente. Markup identic cu varianta Next; clasele sunt cele
// din assets/site.css.

function h(?string $s): string
{
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function json_ld(array $data): string
{
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return '<script type="application/ld+json">' . str_replace('<', '<', $json) . '</script>';
}

const CARD = 'lc-card';
const LINK = 'underline decoration-line underline-offset-2 hover:text-accent';

/**
 * @param array{title:string,description:string,canonical?:string,type?:string,noindex?:bool,ld?:array,home?:bool} $p
 */
function layout(array $p, string $body): string
{
    $title = $p['title'];
    $desc = $p['description'];
    $canon = $p['canonical'] ?? null;
    $type = $p['type'] ?? 'website';
    $noindex = $p['noindex'] ?? false;
    $home = $p['home'] ?? false;
    $img = SITE_URL . '/assets/og.png';

    ob_start(); ?>
<!DOCTYPE html>
<html lang="ro" class="h-full"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/assets/site.css?v=<?= h(ASSET_V) ?>"><link rel="stylesheet" href="/assets/extra.css?v=<?= h(ASSET_V) ?>">
<meta name="theme-color" content="#d7ebe0">
<title><?= h($title) ?></title>
<meta name="description" content="<?= h($desc) ?>">
<meta name="application-name" content="listacaen.ro">
<link rel="author" href="https://listacaen.ro"><meta name="author" content="listacaen.ro">
<meta name="keywords" content="cod caen,coduri caen,lista caen,caen,caen rev 3,lista coduri caen">
<?php if ($noindex): ?><meta name="robots" content="noindex, nofollow">
<?php else: ?><meta name="robots" content="index, follow"><meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1">
<?php endif; ?>
<?php if ($canon): ?><link rel="canonical" href="<?= h(abs_url($canon)) ?>"><meta property="og:url" content="<?= h(abs_url($canon)) ?>">
<?php endif; ?>
<meta property="og:title" content="<?= h($title) ?>"><meta property="og:description" content="<?= h($desc) ?>">
<meta property="og:site_name" content="listacaen.ro"><meta property="og:locale" content="ro_RO">
<meta property="og:image" content="<?= h($img) ?>"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:type" content="<?= h($type) ?>">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="<?= h($title) ?>"><meta name="twitter:description" content="<?= h($desc) ?>"><meta name="twitter:image" content="<?= h($img) ?>">
<link rel="icon" href="/favicon.ico?v=<?= h(LASTMOD) ?>" sizes="48x48" type="image/x-icon"><link rel="icon" href="/assets/icon.svg?v=<?= h(LASTMOD) ?>" sizes="any" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png?v=<?= h(LASTMOD) ?>">
<?php foreach ($p['ld'] ?? [] as $ld) { echo json_ld($ld), "\n"; } ?>
</head>
<body class="flex min-h-full flex-col font-sans">
<a href="#continut" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">Sari la conținut</a>
<?= site_header($home) ?>
<main id="continut" class="flex-1"><div class="mx-auto w-full max-w-[44rem] px-5 py-8 sm:py-14">
<?= $body ?>
</div></main>
<?= site_footer() ?>
<div id="consent-root"></div>
<script src="/assets/app.js?v=<?= h(ASSET_V) ?>" defer></script>
</body></html>
<?php
    return (string) ob_get_clean();
}

function search_box(string $variant): string
{
    $id = 'q-' . $variant;
    $placeholder = $variant === 'hero' ? 'Caută cod sau activitate' : 'Caută un cod CAEN';
    $icon = '<svg ' . ($variant === 'compact' ? 'class="lc-compact-icon" ' : '') . 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

    return '<div class="relative" data-search="' . h($variant) . '"><form role="search" class="lc-field">' . $icon
        . '<label for="' . $id . '" class="sr-only">Caută un cod CAEN sau o activitate</label>'
        . '<input id="' . $id . '" type="search" role="combobox" aria-expanded="false" aria-controls="' . $id . '-results" aria-autocomplete="list" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search" placeholder="' . h($placeholder) . '" class="lc-input lc-input-' . h($variant) . '" value="">'
        . '<kbd class="lc-kbd" aria-hidden="true">/</kbd>'
        . '</form><p class="sr-only" aria-live="polite"></p><div data-results></div></div>';
}

function brand_mark(): string
{
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#163028"/><path d="M8 16h8v24h11v8H8z" fill="#fffdf8"/><path d="M49.42 24.58A10.5 10.5 0 1 0 49.42 39.42" fill="none" stroke="#e7a07a" stroke-width="7"/></svg>';
}

function site_header(bool $home): string
{
    $s = '<header class="sticky top-0 z-30 border-b border-line/80 bg-card/85 backdrop-blur-xl"><div class="mx-auto flex max-w-[44rem] flex-wrap items-center gap-3 px-5 py-3">'
        . '<a class="lc-brand order-1 text-[1.0625rem] text-ink" href="/" aria-label="listacaen.ro, prima pagină">' . brand_mark() . '<span>listacaen<span class="text-muted">.ro</span></span></a>';
    if (!$home) {
        $s .= '<div class="order-3 w-full sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1">' . search_box('compact') . '</div>';
    }
    $s .= '<a class="order-2 text-sm text-muted hover:text-accent sm:order-3 ' . ($home ? 'ml-auto' : 'ml-auto sm:ml-0') . '" href="/despre/">Despre</a>'
        . '</div></header>';
    return $s;
}

function site_footer(): string
{
    $l = LINK;
    $s = '<footer class="mt-16"><div class="mx-auto max-w-[44rem] px-5 py-8 text-[13px] leading-relaxed text-muted">'
        . '<p>listacaen.ro · nomenclator CAEN Rev. 3, în vigoare din 1 ianuarie 2025.</p>'
        . '<p class="mt-2">Denumirile urmează clasificarea oficială, Ordinul Institutului Național de Statistică nr. 377/2024, aliniată la NACE Rev. 2.1.</p>'
        . '<nav aria-label="Secțiuni CAEN" class="mt-4"><p class="font-medium text-ink">Secțiuni CAEN</p><ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1">';
    foreach (sections() as $sec) {
        $s .= '<li><a href="' . h(caen_path($sec['slug'])) . '" title="' . h($sec['name']) . '" class="' . $l . '">' . h($sec['code']) . '</a></li>';
    }
    $s .= '</ul></nav><p class="mt-3">'
        . '<a href="/despre/" class="' . $l . '">Ce este codul CAEN</a> · '
        . '<a href="/ghid/cum-alegi-codul-caen/" class="' . $l . '">Cum alegi codul CAEN</a> · '
        . '<a href="/caen-rev2/" class="' . $l . '">Corespondență Rev. 2 – Rev. 3</a> · '
        . '<button type="button" data-cookie-settings class="' . $l . '">Setări cookie</button>'
        . '</p></div></footer>';
    return $s;
}

function code_list(string $items): string
{
    return '<ul class="mt-3 overflow-hidden rounded-2xl bg-card ' . CARD . '">' . $items . '</ul>';
}

function code_row(array $n, ?string $meta = null): string
{
    $s = '<li class="border-b border-line/80 last:border-b-0"><a href="' . h(caen_path($n['slug'])) . '" class="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3 px-4 py-3.5 hover:bg-hover focus-visible:bg-hover focus-visible:outline-none sm:grid-cols-[2.75rem_minmax(0,1fr)_auto]">'
        . '<span class="text-[15px] font-medium tabular-nums text-code">' . h($n['code']) . '</span>'
        . '<span class="min-w-0 leading-snug text-ink">' . h($n['name']) . '</span>';
    if ($meta) {
        $s .= '<span class="col-start-2 text-[13px] text-muted sm:col-start-auto sm:text-right">' . h($meta) . '</span>';
    }
    return $s . '</a></li>';
}

function note_row(string $href, string $code, string $name, string $note): string
{
    $s = '<li class="border-b border-line/80 last:border-b-0"><a href="' . h($href) . '" class="block px-4 py-3.5 hover:bg-hover focus-visible:bg-hover focus-visible:outline-none">'
        . '<span class="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3"><span class="text-[15px] font-medium tabular-nums text-code">' . h($code) . '</span><span class="leading-snug text-ink">' . h($name) . '</span></span>';
    if ($note !== '') {
        $s .= '<span class="mt-1 block pl-[3.5rem] text-[13px] leading-snug text-muted">Obs. INS: ' . h($note) . '</span>';
    }
    return $s . '</a></li>';
}

function h2(string $text, string $size = '1.25rem'): string
{
    return '<h2 class="text-[' . $size . '] font-semibold tracking-[-0.022em]">' . h($text) . '</h2>';
}
