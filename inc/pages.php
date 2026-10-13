<?php
declare(strict_types=1);

// Paginile site-ului. Fiecare funcție întoarce HTML complet.

const POPULAR = ['6210', '6220', '4711', '5630', '4941', '6820', '6920', '6910', '7311', '4399', '9313', '8559'];

function page_home(): string
{
    $c = caen()['counts'];
    $l = LINK;
    $secs = '';
    foreach (sections() as $s) {
        $secs .= code_row($s, plural($s['classCount'], 'clasă', 'clase'));
    }
    $pop = '';
    foreach (POPULAR as $slug) {
        if ($n = node($slug)) {
            $pop .= code_row($n);
        }
    }
    $stats = '';
    foreach ([[$c['sections'], 'secțiuni'], [$c['divisions'], 'diviziuni'], [$c['groups'], 'grupe'], [$c['classes'], 'clase']] as [$v, $label]) {
        $stats .= '<div class="lc-stat"><b>' . $v . '</b><span>' . $label . '</span></div>';
    }
    $chips = '';
    foreach ([['6210', 'Software'], ['5611', 'Restaurante'], ['4711', 'Magazin alimentar'], ['4941', 'Transport marfă'], ['6920', 'Contabilitate']] as [$code, $label]) {
        $chips .= '<a class="lc-chip" href="' . caen_path($code) . '"><b>' . $code . '</b>' . h($label) . '</a>';
    }

    $body = '<section class="lc-hero">'
        . '<p class="lc-eyebrow"><i></i>CAEN Rev. 3 · în vigoare din 2025</p>'
        . '<h1 class="lc-title">Coduri CAEN</h1>'
        . '<p class="lc-lead">Lista CAEN completă: toate codurile CAEN Rev. 3, pentru activitățile din economia națională. Caută un cod CAEN sau răsfoiește secțiunile.</p>'
        . '<div class="lc-search-wrap">' . search_box('hero') . '</div>'
        . '<div class="lc-chips"><span>Căutări rapide:</span>' . $chips . '</div>'
        . '</section>'
        . '<div class="lc-stats">' . $stats . '</div>'
        . '<h2 class="mt-12 text-[1.375rem] font-semibold tracking-[-0.022em]">Secțiuni</h2>' . code_list($secs)
        . '<section class="mt-14"><h2 class="text-[1.375rem] font-semibold tracking-[-0.022em]">Coduri CAEN căutate frecvent</h2>' . code_list($pop) . '</section>'
        . '<section class="mt-14 space-y-4 text-[1.0625rem] leading-relaxed text-pretty"><h2 class="text-[1.375rem] font-semibold tracking-[-0.022em]">Ce sunt codurile CAEN</h2>'
        . '<p>Codul CAEN (Clasificarea activităților din economia națională) identifică activitatea unei firme, PFA sau întreprinderi individuale. Lista CAEN de pe această pagină urmează versiunea Rev. 3, în vigoare din 1 ianuarie 2025, cu ' . $c['classes'] . ' de coduri CAEN la nivel de clasă (patru cifre).</p>'
        . '<p>Poți căuta un cod CAEN după număr sau după denumire, fără diacritice. Fiecare cod are pagina lui, cu locul în ierarhie și clasele vecine. Pentru explicații vezi <a href="/despre/" class="' . $l . '">ce este codul CAEN</a> sau <a href="/ghid/cum-alegi-codul-caen/" class="' . $l . '">cum alegi codul CAEN potrivit</a>. Dacă ai un cod vechi, găsești echivalentul în <a href="/caen-rev2/" class="' . $l . '">tabelul de corespondență CAEN Rev. 2 – Rev. 3</a>.</p></section>';

    return layout([
        'title' => home_title(), 'description' => home_description(), 'canonical' => '/', 'home' => true,
        'ld' => [website_ld(), ['@context' => 'https://schema.org'] + item_list_ld('Secțiuni CAEN Rev. 3', sections())],
    ], $body);
}

function hierarchy_row(array $item, bool $current): string
{
    $cls = 'grid grid-cols-[5.5rem_2.75rem_minmax(0,1fr)] items-baseline gap-x-3 px-4 py-3.5';
    $inner = '<span class="text-sm text-muted">' . h(LEVEL_LABEL[$item['level']]) . '</span>'
        . '<span class="text-[15px] font-medium tabular-nums text-code">' . h($item['code']) . '</span>'
        . '<span class="' . ($current ? 'font-medium ' : '') . 'text-ink">' . h($item['name']) . '</span>';
    return $current
        ? '<div class="' . $cls . ' bg-accent-soft" aria-current="page">' . $inner . '</div>'
        : '<a class="' . $cls . ' hover:bg-hover" href="' . h(caen_path($item['slug'])) . '">' . $inner . '</a>';
}

function prev_next(array $n): string
{
    [$prev, $next] = neighbors_of($n);
    if (!$prev && !$next) {
        return '';
    }
    $label = mb_strtolower(LEVEL_LABEL[$n['level']]);
    $box = 'rounded-2xl bg-card px-4 py-3 shadow-[0_0_0_1px_rgba(18,56,36,0.08)] hover:bg-hover';
    $s = '<nav aria-label="Navigare între ' . h($label) . '" class="mt-12 grid gap-3 text-sm sm:grid-cols-2">';
    $s .= $prev
        ? '<a href="' . h(caen_path($prev['slug'])) . '" rel="prev" class="' . $box . '"><span class="block text-muted">← CAEN anterior</span><span class="mt-1 block text-ink"><span class="tabular-nums text-code">' . h($prev['code']) . '</span> ' . h($prev['name']) . '</span></a>'
        : '<span></span>';
    if ($next) {
        $s .= '<a href="' . h(caen_path($next['slug'])) . '" rel="next" class="' . $box . ' sm:text-right"><span class="block text-muted">CAEN următor →</span><span class="mt-1 block text-ink"><span class="tabular-nums text-code">' . h($next['code']) . '</span> ' . h($next['name']) . '</span></a>';
    }
    return $s . '</nav>';
}

function page_code(array $n): string
{
    $anc = ancestors_of($n);
    $kids = children_of($n);
    $listed = $n['level'] === 'division' ? array_merge(...array_map('children_of', $kids)) : $kids;

    $crumbs = '<li><a class="hover:text-accent" href="/">Acasă</a></li>';
    foreach ($anc as $a) {
        $crumbs .= '<li class="flex items-center gap-2"><span aria-hidden="true">/</span><a title="' . h($a['name']) . '" class="hover:text-accent" href="' . h(caen_path($a['slug'])) . '"><span class="sr-only">' . h(LEVEL_LABEL[$a['level']]) . ' </span>' . h($a['code']) . '</a></li>';
    }
    $crumbs .= '<li class="flex items-center gap-2" aria-current="page"><span aria-hidden="true">/</span><span class="text-ink">' . h($n['code']) . '</span></li>';

    $b = '<nav aria-label="Traseu"><ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">' . $crumbs . '</ol></nav>'
        . '<p class="mt-8 text-[13px] font-medium text-accent">' . h(LEVEL_LABEL[$n['level']]) . ' · CAEN Rev. 3</p>'
        . '<h1 class="mt-2"><span class="block text-[2.75rem] leading-none font-semibold tracking-[-0.04em] tabular-nums text-code">' . h($n['code']) . '</span>'
        . '<span class="mt-3 block text-[1.65rem] leading-[1.15] font-semibold tracking-[-0.025em] text-balance sm:text-[1.85rem]">' . h($n['name']) . '</span></h1>'
        . '<p class="mt-4 max-w-xl text-[17px] leading-relaxed text-pretty text-muted">' . h(describe($n)) . '</p>';
    if ($n['level'] === 'class') {
        $b .= '<button type="button" data-copy="' . h($n['code']) . '" class="mt-5 inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Copiază codul</button>';
    }

    if ($anc) {
        $rows = '';
        foreach (array_merge($anc, [$n]) as $item) {
            $rows .= '<li class="border-b border-line/80 last:border-b-0">' . hierarchy_row($item, $item['slug'] === $n['slug']) . '</li>';
        }
        $b .= '<section class="mt-10">' . h2('Încadrare') . '<ol class="mt-3 overflow-hidden rounded-2xl bg-card ' . CARD . '">' . $rows . '</ol></section>';
    }

    if ($n['level'] === 'division') {
        $b .= '<div class="mt-12">';
        foreach ($kids as $g) {
            $rows = '';
            foreach (children_of($g) as $item) {
                $rows .= code_row($item);
            }
            $b .= '<section id="' . h($g['code']) . '" class="mt-10"><h2 class="text-[1.25rem] leading-snug font-semibold tracking-[-0.02em]"><a href="' . h(caen_path($g['slug'])) . '" class="hover:text-accent"><span class="mr-3 text-[15px] font-medium tabular-nums text-muted">' . h($g['code']) . '</span>' . h($g['name']) . '</a></h2>' . code_list($rows) . '</section>';
        }
        $b .= '</div>';
    } elseif ($n['level'] === 'section') {
        $rows = '';
        foreach ($kids as $d) {
            $rows .= code_row($d, plural($d['groupCount'], 'grupă', 'grupe') . ' · ' . plural($d['classCount'], 'clasă', 'clase'));
        }
        $b .= '<section class="mt-12">' . h2('Diviziuni') . code_list($rows) . '</section>';
    } elseif ($n['level'] === 'group') {
        $rows = '';
        foreach ($kids as $item) {
            $rows .= code_row($item);
        }
        $b .= '<section class="mt-12">' . h2('Clase') . code_list($rows) . '</section>';
    }

    if ($n['level'] === 'class') {
        $b .= rev2_sources_section($n) . sibling_classes($n);
    }
    $b .= prev_next($n);

    $graph = [defined_term_ld($n), breadcrumb_ld($n)];
    if ($listed) {
        $graph[] = item_list_ld("CAEN {$n['code']} — {$n['name']}", $listed);
    }
    $path = caen_path($n['slug']);

    return layout([
        'title' => title_for($n), 'description' => description_for($n), 'canonical' => $path,
        'ld' => [['@context' => 'https://schema.org', '@graph' => $graph]],
    ], $b);
}

function rev2_sources_section(array $n): string
{
    $src = sources_of($n['code']);
    if (!$src) {
        return '';
    }
    $rows = '';
    foreach ($src as ['item' => $i, 'note' => $note]) {
        $rows .= note_row(rev2_path($i['code']), $i['code'], $i['name'], $note);
    }
    return '<section class="mt-12">' . h2('Cod CAEN Rev. 2 corespondent')
        . '<p class="mt-2 text-[15px] leading-relaxed text-muted">Codul ' . h($n['code']) . ' din Rev. 3 preia activități din ' . (count($src) === 1 ? 'codul' : 'codurile') . ' CAEN Rev. 2 de mai jos, după tabelul INS.</p>'
        . '<ul class="mt-3 overflow-hidden rounded-2xl bg-card ' . CARD . '">' . $rows . '</ul></section>';
}

function sibling_classes(array $n): string
{
    $group = isset($n['groupSlug']) ? node($n['groupSlug']) : null;
    if (!$group) {
        return '';
    }
    $rows = '';
    foreach (children_of($group) as $item) {
        if ($item['slug'] !== $n['slug']) {
            $rows .= code_row($item);
        }
    }
    return $rows === '' ? '' : '<section class="mt-12">' . h2('Alte clase din grupa ' . $group['code']) . code_list($rows) . '</section>';
}

function page_despre(): string
{
    $c = caen()['counts'];
    $l = LINK;
    $h2 = 'class="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink"';
    $b = '<article><h1 class="text-[2rem] font-semibold leading-[1.1] tracking-[-0.028em] text-balance">Ce este codul CAEN</h1>'
        . '<div class="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-pretty">'
        . '<p>CAEN, Clasificarea activităților din economia națională, este nomenclatorul prin care activitățile economice din România primesc un cod. Codul folosit la înregistrarea unei firme este clasa: patru cifre.</p>'
        . "<h2 $h2>CAEN Rev. 3</h2>"
        . '<p>Versiunea în vigoare din 1 ianuarie 2025 este CAEN Rev. 3, aprobată prin Ordinul președintelui Institutului Național de Statistică nr. 377/2024. Este aliniată cu NACE Rev. 2.1, clasificarea folosită în Uniunea Europeană.</p>'
        . "<p>Nomenclatorul are patru niveluri: {$c['sections']} de secțiuni, {$c['divisions']} de diviziuni, {$c['groups']} de grupe și {$c['classes']} de clase.</p>"
        . '<ul class="space-y-2 pl-1">'
        . '<li><a href="' . caen_path('k') . '" class="' . $l . '">Secțiune</a> — o literă, de la A la V. Exemplu: K, telecomunicații și tehnologia informației.</li>'
        . '<li><a href="' . caen_path('62') . '" class="' . $l . '">Diviziune</a> — două cifre. Exemplu: 62, programare și consultanță IT.</li>'
        . '<li><a href="' . caen_path('621') . '" class="' . $l . '">Grupă</a> — trei cifre. Exemplu: 621, activități de programare.</li>'
        . '<li><a href="' . caen_path('6210') . '" class="' . $l . '">Clasă</a> — patru cifre. Exemplu: 6210, realizarea softului la comandă.</li></ul>'
        . "<h2 $h2>Cum cauți</h2>"
        . '<p>Poți căuta după cod, inclusiv un prefix cum este 62, sau după cuvinte din denumire: software, restaurant, construcții. Diacriticele nu sunt obligatorii. Fiecare secțiune, diviziune, grupă și clasă are pagină proprie, cu locul ei în ierarhie.</p>'
        . "<h2 $h2>Ce găsești aici</h2>"
        . '<p>listacaen.ro listează denumirile și ierarhia din nomenclator, ca să ajungi repede la un cod. Nu înlocuiește textul din Monitorul Oficial și nu alege codul pe care trebuie să îl declari pentru o firmă. Clasificarea oficială este publicată de <a href="https://insse.ro" class="' . $l . '" rel="noopener noreferrer">Institutul Național de Statistică</a>, iar înregistrarea firmelor se face la <a href="https://www.onrc.ro" class="' . $l . '" rel="noopener noreferrer">Oficiul Național al Registrului Comerțului</a>.</p>'
        . '</div></article>';

    return layout([
        'title' => 'Ce este codul CAEN | listacaen.ro',
        'description' => 'Ce este CAEN Rev. 3, cum sunt organizate secțiunile, diviziunile, grupele și clasele, și cum cauți un cod de activitate.',
        'canonical' => '/despre/', 'type' => 'article',
    ], $b);
}

function page_ghid(): string
{
    $l = LINK;
    $h2 = 'class="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink"';
    $title = 'Cum alegi codul CAEN pentru firma ta';
    $desc = 'Cum găsești codul CAEN potrivit pentru SRL, PFA sau II: activitate principală și secundare, căutare în lista CAEN Rev. 3 și ce verifici înainte să îl declari.';
    $b = '<article><h1 class="text-[2rem] font-semibold leading-[1.1] tracking-[-0.028em] text-balance">' . $title . '</h1>'
        . '<div class="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-pretty">'
        . '<p>Când înființezi o firmă, un PFA sau o întreprindere individuală, declari unul sau mai multe coduri CAEN. Un cod CAEN are patru cifre și descrie o activitate economică. Mai jos găsești pașii pentru a-l alege, folosind <a href="/" class="' . $l . '">lista codurilor CAEN Rev. 3</a>.</p>'
        . "<h2 $h2>1. Descrie activitatea în cuvinte simple</h2>"
        . '<p>Scrie ce vei face concret: „dezvolt aplicații la comandă”, „vând haine online”, „transport marfă”. Aceste cuvinte sunt punctul de plecare pentru căutare.</p>'
        . "<h2 $h2>2. Caută în lista CAEN</h2>"
        . '<p>Folosește căutarea de pe <a href="/" class="' . $l . '">prima pagină</a> după cuvinte din denumire, fără diacritice, sau după un prefix de cod. Dacă știi domeniul, intră pe diviziunea potrivită și citește toate grupele ei. Exemplu: <a href="' . caen_path('62') . '" class="' . $l . '">diviziunea 62</a> pentru programare și consultanță IT sau <a href="' . caen_path('56') . '" class="' . $l . '">diviziunea 56</a> pentru restaurante și servirea băuturilor.</p>'
        . "<h2 $h2>3. Alege clasa, nu grupa</h2>"
        . '<p>Codul declarat este clasa, cu patru cifre. Grupa (trei cifre) și diviziunea (două cifre) te ajută doar să navighezi. Citește și clasele vecine din aceeași grupă, pentru că denumirile apropiate se deosebesc prin detalii.</p>'
        . "<h2 $h2>4. Activitate principală și activități secundare</h2>"
        . '<p>Activitatea principală este cea care aduce cea mai mare parte din venituri. Pe lângă ea poți declara activități secundare, dacă le desfășori sau vrei să le poți desfășura. Unele activități cer autorizații sau avize speciale, deci verifică acest lucru înainte să declari codul.</p>'
        . "<h2 $h2>5. Atenție la versiune: Rev. 2 sau Rev. 3</h2>"
        . '<p>Din 1 ianuarie 2025 este în vigoare CAEN Rev. 3 (Ordinul INS nr. 377/2024), aliniat la NACE Rev. 2.1. Unele coduri din Rev. 2 au fost redenumite, împărțite sau unite, așa că un cod vechi nu mai are mereu aceeași denumire. Dacă firma ta are coduri din Rev. 2, verifică tabelul oficial de corespondență publicat de <a href="https://insse.ro" class="' . $l . '" rel="noopener noreferrer">Institutul Național de Statistică</a> și termenele comunicate de <a href="https://www.onrc.ro" class="' . $l . '" rel="noopener noreferrer">Oficiul Național al Registrului Comerțului</a>.</p>'
        . "<h2 $h2>6. Confirmă codul înainte să îl declari</h2>"
        . '<p>Site-ul listează denumirile din nomenclator, dar nu alege codul în locul tău. Pentru o decizie sigură, discută cu un contabil sau cu Registrul Comerțului, mai ales dacă activitatea e la limita dintre două coduri.</p>'
        . '</div></article>';

    return layout([
        'title' => $title . ' | listacaen.ro', 'description' => $desc, 'canonical' => '/ghid/cum-alegi-codul-caen/', 'type' => 'article',
        'ld' => [[
            '@context' => 'https://schema.org', '@type' => 'Article', 'headline' => $title, 'description' => $desc,
            'inLanguage' => 'ro-RO', 'mainEntityOfPage' => abs_url('/ghid/cum-alegi-codul-caen/'),
            'publisher' => ['@type' => 'Organization', 'name' => 'listacaen.ro'],
        ]],
    ], $b);
}

function page_rev2_index(): string
{
    $r = rev2();
    $l = LINK;
    $title = 'Corespondență CAEN Rev. 2 – Rev. 3: tabel complet';
    $desc = 'Tabelul complet de corespondență între codurile CAEN Rev. 2 și CAEN Rev. 3: caută codul vechi și vezi cu ce cod nou se echivalează.';
    $b = '<p class="text-[13px] font-medium text-accent">CAEN Rev. 2 → Rev. 3</p>'
        . '<h1 class="mt-2 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.032em] text-balance">Corespondență CAEN Rev. 2 – Rev. 3</h1>'
        . '<p class="mt-3 max-w-xl text-[17px] leading-relaxed text-pretty text-muted">Cauți un cod CAEN vechi? Mai jos sunt toate cele ' . count($r['classes']) . ' de clase din CAEN Rev. 2, cu codul sau codurile corespondente din <a href="/" class="' . $l . '">CAEN Rev. 3</a>, în vigoare din 1 ianuarie 2025. Corespondența urmează tabelul INS.</p>';
    $items = [];
    $i = 0;
    foreach ($r['divisions'] as $dcode => $dname) {
        $rows = '';
        foreach ($r['classes'] as $item) {
            if ($item['division'] !== (string) $dcode) {
                continue;
            }
            $items[] = ['@type' => 'ListItem', 'position' => ++$i, 'name' => "CAEN {$item['code']} — {$item['name']}", 'url' => abs_url(rev2_path($item['code']))];
            $rows .= '<li class="border-b border-line/80 last:border-b-0"><a href="' . h(rev2_path($item['code'])) . '" class="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3 px-4 py-3.5 hover:bg-hover focus-visible:bg-hover focus-visible:outline-none sm:grid-cols-[2.75rem_minmax(0,1fr)_auto]">'
                . '<span class="text-[15px] font-medium tabular-nums text-code">' . h($item['code']) . '</span>'
                . '<span class="min-w-0 leading-snug text-ink">' . h($item['name']) . '</span>'
                . '<span class="col-start-2 text-[13px] text-muted sm:col-start-auto sm:text-right">Rev. 3: ' . h(target_summary($item['code'])) . '</span></a></li>';
        }
        if ($rows === '') {
            continue;
        }
        $b .= '<section class="mt-10"><h2 class="text-[1.125rem] leading-snug font-semibold tracking-[-0.02em]"><span class="mr-3 text-[15px] font-medium tabular-nums text-muted">' . h((string) $dcode) . '</span>' . h($dname) . '</h2>' . code_list($rows) . '</section>';
    }

    return layout([
        'title' => "$title | listacaen.ro", 'description' => $desc, 'canonical' => '/caen-rev2/',
        'ld' => [['@context' => 'https://schema.org', '@type' => 'ItemList', 'name' => 'Coduri CAEN Rev. 2', 'numberOfItems' => count($r['classes']), 'itemListElement' => $items]],
    ], $b);
}

function page_rev2(array $item): string
{
    $code = $item['code'];
    $targets = targets_of($code);
    $summary = target_summary($code);
    $l = LINK;
    $unchanged = count($targets) === 1 && $targets[0]['node']['code'] === $code && $targets[0]['note'] === '';

    $title = $targets
        ? "Cod CAEN $code (Rev. 2) — corespondent Rev. 3: $summary"
        : "Cod CAEN $code (Rev. 2) — fără corespondent în Rev. 3";
    $desc = clip($targets
        ? "Codul CAEN $code din Rev. 2, „{$item['name']}”, devine în CAEN Rev. 3: $summary. Corespondența Rev. 2 – Rev. 3 după tabelul INS."
        : "Codul CAEN $code din Rev. 2, „{$item['name']}”, nu are corespondent direct în CAEN Rev. 3, conform tabelului de corespondență publicat de INS.", 158);

    $lead = !$targets
        ? "Codul $code din CAEN Rev. 2 nu are corespondent direct în CAEN Rev. 3, conform tabelului de corespondență al INS."
        : ($unchanged
            ? "Codul $code din CAEN Rev. 2 se păstrează neschimbat în CAEN Rev. 3."
            : "Codul $code din CAEN Rev. 2 corespunde în CAEN Rev. 3 cu " . (count($targets) === 1 ? 'codul' : 'codurile') . " $summary.");

    $b = '<nav aria-label="Traseu"><ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">'
        . '<li><a href="/" class="hover:text-accent">Acasă</a></li>'
        . '<li class="flex items-center gap-2"><span aria-hidden="true">/</span><a href="/caen-rev2/" class="hover:text-accent">Rev. 2</a></li>'
        . '<li class="flex items-center gap-2" aria-current="page"><span aria-hidden="true">/</span><span class="text-ink">' . h($code) . '</span></li></ol></nav>'
        . '<p class="mt-8 text-[13px] font-medium text-accent">Clasă · CAEN Rev. 2</p>'
        . '<h1 class="mt-2"><span class="block text-[2.75rem] leading-none font-semibold tracking-[-0.04em] tabular-nums text-code">' . h($code) . '</span>'
        . '<span class="mt-3 block text-[1.65rem] leading-[1.15] font-semibold tracking-[-0.025em] text-balance sm:text-[1.85rem]">' . h($item['name']) . '</span></h1>'
        . '<p class="mt-4 max-w-xl text-[17px] leading-relaxed text-pretty text-muted">' . h($lead) . '</p>';
    if ($targets) {
        $rows = '';
        foreach ($targets as ['node' => $n, 'note' => $note]) {
            $rows .= note_row(caen_path($n['slug']), $n['code'], $n['name'], $note);
        }
        $b .= '<section class="mt-10">' . h2('Echivalent în CAEN Rev. 3') . '<ul class="mt-3 overflow-hidden rounded-2xl bg-card ' . CARD . '">' . $rows . '</ul></section>';
    }
    $b .= '<p class="mt-10 text-[13px] leading-relaxed text-muted">Sursa: tabelul de corespondență CAEN Rev. 2 – CAEN Rev. 3 publicat de <a href="https://insse.ro" class="' . $l . '" rel="noopener noreferrer">Institutul Național de Statistică</a>. Verifică tabelul oficial și la ONRC înainte să modifici codurile firmei. Vezi toate <a href="/caen-rev2/" class="' . $l . '">codurile CAEN Rev. 2 și echivalentul lor în Rev. 3</a>.</p>';

    return layout([
        'title' => $title, 'description' => $desc, 'canonical' => rev2_path($code),
        'ld' => [['@context' => 'https://schema.org'] + breadcrumb_list([
            ['name' => 'Coduri CAEN', 'path' => '/'],
            ['name' => 'Corespondență Rev. 2 – Rev. 3', 'path' => '/caen-rev2/'],
            ['name' => "Cod CAEN $code (Rev. 2)", 'path' => rev2_path($code)],
        ])],
    ], $b);
}

function page_404(): string
{
    $b = '<h1 class="text-[2rem] font-semibold tracking-[-0.028em]">Pagina nu există</h1>'
        . '<p class="mt-3 text-lg text-muted">Codul nu este în CAEN Rev. 3, sau adresa este incompletă.</p>'
        . '<p class="mt-6"><a href="/" class="' . LINK . '">Înapoi la lista de coduri</a></p>';
    return layout(['title' => 'Pagina nu există | listacaen.ro', 'description' => 'Pagina nu există.', 'noindex' => true], $b);
}

/** @return array<int,array{0:string,1:float}> perechi [cale, prioritate] */
function sitemap_urls(): array
{
    $urls = [['/', 1], ['/despre/', 0.4], ['/ghid/cum-alegi-codul-caen/', 0.6], ['/caen-rev2/', 0.8]];
    foreach (rev2()['classes'] as $c) {
        $urls[] = [rev2_path($c['code']), 0.5];
    }
    $prio = ['section' => 0.8, 'division' => 0.7, 'class' => 0.6, 'group' => 0.5];
    foreach (caen()['ordered'] as $slug) {
        $urls[] = [caen_path($slug), $prio[node($slug)['level']]];
    }
    return $urls;
}

function sitemap_xml(): string
{
    $x = '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach (sitemap_urls() as [$path, $p]) {
        $x .= '<url><loc>' . h(abs_url($path)) . '</loc><lastmod>' . LASTMOD . '</lastmod><changefreq>yearly</changefreq><priority>' . $p . '</priority></url>' . "\n";
    }
    return $x . '</urlset>' . "\n";
}

function robots_txt(): string
{
    return "User-Agent: *\nAllow: /\n\nHost: " . SITE_URL . "\nSitemap: " . SITE_URL . "/sitemap.xml\n";
}
