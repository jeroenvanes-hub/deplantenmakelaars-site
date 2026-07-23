/* De Plantenmakelaars — cinematografische fullscreen interactie */
(function () {
  "use strict";

  var body = document.body;

  /* ---------- Contactgegevens veilig opbouwen (anti-crawler) ---------- */
  try {
    var dec = function (s) { try { return decodeURIComponent(escape(window.atob(s))); } catch (e) { return window.atob(s); } };
    document.querySelectorAll("a.cx-mail[data-e]").forEach(function (a) {
      var e = dec(a.getAttribute("data-e"));
      a.href = "mailto:" + e;
      a.textContent = e;
    });
    document.querySelectorAll("a.cx-tel[data-t]").forEach(function (a) {
      var t = dec(a.getAttribute("data-t"));
      var d = a.getAttribute("data-d") ? dec(a.getAttribute("data-d")) : t;
      a.href = "tel:" + t;
      a.textContent = d;
    });
  } catch (e) {}

  /* ---------- Quotes: sterren + live "typen" ---------- */
  var quotesWrap = document.querySelector(".quotes");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function startQuotes() {
    quotesWrap.classList.add("qshow");
    if (reduceMotion) return;
    document.querySelectorAll(".quote blockquote").forEach(function (bq) {
      bq.classList.add("tw-on");
      var maxLen = 0;
      bq.querySelectorAll("[data-lang-nl],[data-lang-en]").forEach(function (sp) {
        var full = sp.textContent;
        sp.textContent = "";
        maxLen = Math.max(maxLen, full.length);
        var i = 0;
        (function tick() {
          sp.textContent = full.slice(0, i);
          if (i < full.length) { i++; setTimeout(tick, 26); }
        })();
      });
      setTimeout(function () { bq.classList.remove("tw-on"); }, maxLen * 26 + 500);
    });
  }
  if (quotesWrap) {
    if ("IntersectionObserver" in window) {
      var started = false;
      var qobs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !started) { started = true; startQuotes(); }
        });
      }, { threshold: 0.4 });
      qobs.observe(quotesWrap);
    } else {
      startQuotes();
    }
  }

  /* ---------- Fullscreen menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".menu-overlay a").forEach(function (a) {
      a.addEventListener("click", function () { body.classList.remove("menu-open"); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") body.classList.remove("menu-open");
    });
  }

  /* ---------- Taalwissel NL / EN ---------- */
  var STORE = "dpm-lang";
  function store(l) { try { localStorage.setItem(STORE, l); } catch (e) {} }
  function read() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function setLang(l) {
    document.documentElement.setAttribute("lang", l);
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.lang === l);
    });
    store(l);
  }
  setLang(read() === "en" ? "en" : "nl");
  document.querySelectorAll(".lang-switch button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  /* ---------- Panels: reveal + active tracking ---------- */
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));

  // pager opbouwen
  var pager = document.querySelector(".pager");
  var dotsWrap = pager ? pager.querySelector(".dots") : null;
  var curEl = pager ? pager.querySelector(".cur") : null;
  var totEl = pager ? pager.querySelector(".tot") : null;
  var dots = [];
  if (dotsWrap) {
    panels.forEach(function (p, i) {
      var d = document.createElement("button");
      d.className = "dot";
      d.setAttribute("aria-label", "Sectie " + (i + 1));
      d.addEventListener("click", function () {
        p.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      dotsWrap.appendChild(d);
      dots.push(d);
    });
    if (totEl) totEl.textContent = String(panels.length).padStart(2, "0");
  }

  function setActive(i) {
    dots.forEach(function (d, j) { d.classList.toggle("active", j === i); });
    if (curEl) curEl.textContent = String(i + 1).padStart(2, "0");
  }

  if ("IntersectionObserver" in window && panels.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          if (en.intersectionRatio >= 0.5) setActive(panels.indexOf(en.target));
        }
      });
    }, { threshold: [0.15, 0.5, 0.75] });
    panels.forEach(function (p) { io.observe(p); });
  } else {
    panels.forEach(function (p) { p.classList.add("in"); });
  }

  /* ---------- Contactformulier (demo) ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector(".form-status");
      if (note) note.hidden = false;
      form.reset();
    });
  }

  /* ---------- Cijfers laten oplopen bij in beeld komen ---------- */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nums = document.querySelectorAll(".stats .num");
  function animateNum(el) {
    var txt = el.firstChild;
    var target = parseInt((el.textContent || "").replace(/\D/g, ""), 10);
    if (!target || !txt) return;
    function fmt(n) { return n.toLocaleString("nl-NL"); }
    if (reduce) { txt.nodeValue = fmt(target); return; }
    var dur = 1600, startTs = null;
    txt.nodeValue = "0";
    function step(ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min((ts - startTs) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      txt.nodeValue = fmt(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else txt.nodeValue = fmt(target);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && nums.length) {
    var nobs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateNum(en.target); nobs.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { nobs.observe(n); });
  }

  /* ---------- Logo wisselen op licht/donker onder de header ---------- */
  var hpanels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var topbarEl = document.querySelector(".topbar");
  var pagerEl = document.querySelector(".pager");
  // is het vlak op hoogte y (t.o.v. viewport) een licht vlak?
  function lightAt(y) {
    for (var i = 0; i < hpanels.length; i++) {
      var r = hpanels[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) {
        var cl = hpanels[i].classList;
        return cl.contains("panel--light") || cl.contains("panel--paper");
      }
    }
    return false;
  }
  function centerY(el, fallback) {
    if (!el) return fallback;
    var r = el.getBoundingClientRect();
    return (r.top + r.bottom) / 2;
  }
  function updateHeaderTheme() {
    // menu meet zijn eigen plek bovenaan, pager het midden van het scherm:
    // zo klopt de kleur van elk element altijd met de achtergrond eronder
    body.classList.toggle("header-light", lightAt(centerY(topbarEl, 56)));
    body.classList.toggle("pager-light", lightAt(centerY(pagerEl, window.innerHeight * 0.5)));
  }
  var themeTick = false;
  window.addEventListener("scroll", function () {
    if (themeTick) return;
    themeTick = true;
    requestAnimationFrame(function () { updateHeaderTheme(); themeTick = false; });
  }, { passive: true });
  window.addEventListener("resize", updateHeaderTheme);
  updateHeaderTheme();

  /* ---------- Logo linksboven alleen tonen op de hero, verdwijnen bij scrollen ---------- */
  var heroEl = document.querySelector(".panel.hero");
  function updateLogoVisibility() {
    var y = window.scrollY || window.pageYOffset || 0;
    var show = !!heroEl && y < 40;
    body.classList.toggle("logos-hidden", !show);
  }
  window.addEventListener("scroll", updateLogoVisibility, { passive: true });
  window.addEventListener("resize", updateLogoVisibility);
  updateLogoVisibility();

  /* ---------- Direct bij de juiste persoon openen en rustig infaden (geen scroll) ---------- */
  (function () {
    if (!location.hash) return;
    var target;
    try { target = document.querySelector(location.hash); } catch (e) { return; }
    if (!target) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    var docEl = document.documentElement;

    // overlay die de pagina bedekt terwijl we onzichtbaar naar de sectie springen
    var fade = document.createElement("div");
    fade.className = "page-fade";
    (document.body || docEl).appendChild(fade);

    function jump() {
      // geen enkele scroll-animatie: hard en direct naar de sectie
      var prevBeh = docEl.style.scrollBehavior, prevSnap = docEl.style.scrollSnapType;
      docEl.style.scrollBehavior = "auto";
      docEl.style.scrollSnapType = "none";
      target.scrollIntoView({ block: "start" });
      docEl.style.scrollBehavior = prevBeh;
      docEl.style.scrollSnapType = prevSnap;
      // rustig laten infaden
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { body.classList.add("page-ready"); });
      });
      setTimeout(function () { if (fade.parentNode) fade.parentNode.removeChild(fade); }, 1100);
    }

    docEl.style.scrollBehavior = "auto";
    if (document.readyState === "complete") jump();
    else window.addEventListener("load", jump);
  })();

  /* ---------- Jaartal ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
