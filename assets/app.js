// Căutare, copiere cod și consimțământ cookie. Fără dependențe.
(function () {
  "use strict";

  var CONSENT_KEY = "listacaen-cookie-consent";
  var GA_ID = "G-X3YVX1G101";

  // ---------- consimțământ + Google Analytics ----------
  function readConsent() {
    try {
      var v = localStorage.getItem(CONSENT_KEY);
      return v === "granted" || v === "denied" ? v : "unset";
    } catch (e) {
      return "unset";
    }
  }
  function writeConsent(v) {
    try {
      if (v) localStorage.setItem(CONSENT_KEY, v);
      else localStorage.removeItem(CONSENT_KEY);
    } catch (e) {}
  }
  var gaLoaded = false;
  function loadGa() {
    if (gaLoaded || !/(^|\.)listacaen\.ro$/.test(location.hostname)) return;
    gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("consent", "default", {
      ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted"
    });
    gtag("js", new Date());
    gtag("config", GA_ID);
  }
  function clearGaCookies() {
    document.cookie.split(";").forEach(function (c) {
      var k = c.split("=")[0].trim();
      if (k === "_ga" || k.indexOf("_ga_") === 0) document.cookie = k + "=; Max-Age=0; path=/";
    });
  }
  function renderConsent() {
    var root = document.getElementById("consent-root");
    if (!root) return;
    var state = readConsent();
    root.innerHTML = "";
    if (state === "granted") loadGa();
    if (state !== "unset") return;
    root.innerHTML =
      '<div role="dialog" aria-label="Cookie-uri" class="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[44rem] rounded-2xl bg-card p-4 text-[14px] leading-relaxed text-ink shadow-[0_12px_32px_rgba(18,56,36,0.18),0_0_0_1px_rgba(18,56,36,0.1)]">' +
      "<p>Folosim Google Analytics pentru statistici anonime de vizitare, doar dacă ești de acord. Poți schimba alegerea oricând din „Setări cookie” din subsol.</p>" +
      '<div class="mt-3 flex flex-wrap gap-2">' +
      '<button type="button" data-consent="granted" class="rounded-full bg-ink px-4 py-2 font-medium text-paper hover:opacity-90">Accept</button>' +
      '<button type="button" data-consent="denied" class="rounded-full px-4 py-2 font-medium text-ink shadow-[0_0_0_1px_rgba(18,56,36,0.2)] hover:bg-hover">Refuz</button>' +
      "</div></div>";
    root.querySelectorAll("[data-consent]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-consent");
        if (v === "denied") {
          if (window.gtag) gtag("consent", "update", { analytics_storage: "denied" });
          clearGaCookies();
        }
        writeConsent(v);
        renderConsent();
      });
    });
  }
  document.querySelectorAll("[data-cookie-settings]").forEach(function (b) {
    b.addEventListener("click", function () { writeConsent(null); renderConsent(); });
  });
  renderConsent();

  // ---------- copiere cod ----------
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function (t) {
        b.textContent = t;
        setTimeout(function () { b.textContent = "Copiază codul"; }, 1600);
      };
      if (!navigator.clipboard) return done("Nu s-a putut copia");
      navigator.clipboard.writeText(b.getAttribute("data-copy")).then(
        function () { done("Copiat"); },
        function () { done("Nu s-a putut copia"); }
      );
    });
  });

  // ---------- căutare ----------
  var BOOST = { c: 8, d: 5, g: 2, s: 0 };
  var data = null;
  var loading = null;

  function fold(v) {
    return v.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function stripKeywords(q) {
    return fold(q).replace(/\b(caen|rev\s?2)\b/g, " ").replace(/\s+/g, " ").trim();
  }
  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) {
      loading = fetch("/assets/search.json").then(function (r) { return r.json(); }).then(function (d) {
        data = d;
        return d;
      });
    }
    return loading;
  }

  function searchCaen(raw, limit) {
    var folded = stripKeywords(raw);
    var compact = folded.replace(/\s/g, "");
    if (!folded) return { hits: [], total: 0 };

    var nodes = data.nodes;
    if (compact.length === 1 && !/^\d$/.test(compact)) {
      var sec = nodes.filter(function (n) { return n[0] === compact; });
      return { hits: sec, total: sec.length };
    }
    var tokens = folded.split(" ").filter(Boolean);
    var numeric = /^\d+$/.test(compact);
    var scored = [];
    nodes.forEach(function (n) {
      var slug = n[0], f = n[4], score = 0;
      if (slug === compact || f === folded) score = 1000;
      else if (numeric && slug.indexOf(compact) === 0) score = 860 - slug.length;
      else if (f.indexOf(folded) === 0) score = 720;
      else if (tokens.every(function (t) { return f.indexOf(t) !== -1 || slug.indexOf(t) === 0; })) {
        var words = f.split(" ");
        var wordStart = tokens.every(function (t) {
          return words.some(function (w) { return w.indexOf(t) === 0; });
        });
        score = wordStart ? 640 : 430;
      }
      if (score > 0) scored.push({ n: n, score: score + (BOOST[n[3]] || 0) });
    });
    scored.sort(function (a, b) {
      return b.score - a.score || a.n[1].localeCompare(b.n[1], "ro", { numeric: true });
    });
    return { hits: scored.slice(0, limit).map(function (s) { return s.n; }), total: scored.length };
  }

  function searchRev2(raw, limit) {
    var folded = stripKeywords(raw);
    var compact = folded.replace(/\s/g, "");
    if (!compact) return [];
    var numeric = /^\d{3,4}$/.test(compact);
    var tokens = folded.split(" ").filter(Boolean);
    return data.rev2.filter(function (c) {
      return numeric ? c[0].indexOf(compact) === 0
        : tokens.every(function (t) { return c[2].indexOf(t) !== -1; });
    }).slice(0, limit);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function initSearch(box) {
    var variant = box.getAttribute("data-search");
    var input = box.querySelector("input");
    var live = box.querySelector("[aria-live]");
    var out = box.querySelector("[data-results]");
    var limit = variant === "hero" ? 12 : 8;
    var hits = [], active = 0, total = 0, open = false;

    function go(h) { location.href = h.href; }

    function compute() {
      var q = input.value;
      var r = searchCaen(q, limit);
      hits = r.hits.map(function (n) {
        return { key: n[0], code: n[1], name: n[2], ctx: n[5], href: "/caen/" + n[0] + "/" };
      });
      var codeQuery = /^\d{3,4}$/.test(stripKeywords(q).replace(/\s/g, ""));
      var old = codeQuery || r.total === 0 ? searchRev2(q, 5) : [];
      old.forEach(function (c) {
        hits.push({ key: "rev2-" + c[0], code: c[0], name: c[1], ctx: "Cod vechi, CAEN Rev. 2 · vezi echivalentul în Rev. 3", href: "/caen-rev2/" + c[0] + "/" });
      });
      total = r.total + old.length;
    }

    function render() {
      var q = input.value.trim();
      var show = open && q.length > 0;
      input.setAttribute("aria-expanded", show ? "true" : "false");
      live.textContent = q ? total + " rezultate" : "";
      if (!show) { out.innerHTML = ""; return; }
      var html = '<div class="lc-results' + (variant === "compact" ? " lc-abs" : "") + '">';
      if (!hits.length) {
        html += '<p class="lc-empty">Niciun cod pentru „' + esc(q) + "”. Încearcă alt cuvânt sau doar cifrele codului.</p>";
      } else {
        html += '<ul id="' + input.id + '-results" role="listbox" class="py-1">';
        hits.forEach(function (h, i) {
          var old = h.key.indexOf("rev2-") === 0;
          html += '<li role="presentation"><button id="' + input.id + "-" + esc(h.key) + '" type="button" role="option" data-i="' + i + '" aria-selected="' + (i === active) + '" class="lc-hit">' +
            '<span class="lc-hit-code">' + esc(h.code) + "</span>" +
            '<span class="min-w-0"><span class="lc-hit-name">' + esc(h.name) + "</span>" +
            '<span class="lc-hit-ctx">' + (old ? '<span class="lc-badge">Rev. 2</span>' : "") + esc(old ? "Cod vechi · vezi echivalentul în Rev. 3" : h.ctx) + "</span></span></button></li>";
        });
        html += "</ul>";
      }
      if (total > hits.length) {
        html += '<p class="lc-note">' + hits.length + " din " + total + " rezultate. Îngustează căutarea.</p>";
      }
      out.innerHTML = html + "</div>";
      out.querySelectorAll("[data-i]").forEach(function (b) {
        // Nu rescriem lista la hover: butonul s-ar schimba între apăsare și eliberare
        // și browserul nu ar mai trimite click-ul.
        b.addEventListener("mouseenter", function () { setActive(+b.getAttribute("data-i"), false); });
        b.addEventListener("click", function () { go(hits[+b.getAttribute("data-i")]); });
      });
    }

    function setActive(i, scroll) {
      active = i;
      var opts = out.querySelectorAll("[data-i]");
      opts.forEach(function (b) {
        b.setAttribute("aria-selected", +b.getAttribute("data-i") === i ? "true" : "false");
      });
      if (scroll && opts[i]) opts[i].scrollIntoView({ block: "nearest" });
    }

    function update() {
      load().then(function () { active = 0; compute(); render(); });
    }

    input.addEventListener("input", function () { open = true; update(); });
    input.addEventListener("focus", function () { open = true; load().then(function () { compute(); render(); }); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (!open) { open = true; render(); } setActive(Math.min(active + 1, Math.max(hits.length - 1, 0)), true); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(active - 1, 0), true); }
      else if (e.key === "Escape") { open = false; render(); }
      else if (e.key === "Enter" && hits[active]) { e.preventDefault(); go(hits[active]); }
    });
    box.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (hits[active]) go(hits[active]);
    });
    document.addEventListener("mousedown", function (e) {
      if (!box.contains(e.target)) { open = false; render(); }
    });

    if (variant === "hero") {
      var q = new URLSearchParams(location.search).get("q");
      if (q) { input.value = q; open = true; update(); }
    }
  }

  document.querySelectorAll("[data-search]").forEach(initSearch);

  // scurtătură: "/" mută cursorul în căutare
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = document.activeElement && document.activeElement.tagName;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(t)) return;
    var box = document.querySelector('[data-search="hero"] input') || document.querySelector("[data-search] input");
    if (box) { e.preventDefault(); box.focus(); }
  });
})();
