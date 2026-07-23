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

/* ---------- Optie 6: groeiende data — planten + cijfers (achtergrond) ---------- */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  var STEM_COLS = ["#8f9e63", "#a9b487", "#7d8b57"];
  var NUM_COLS = ["#d98c5a", "#efe3d5", "#cfa06f", "#e5a877"];
  var PCT = [
    "↑ 4%", "↑ 5%", "↑ 6%", "↑ 7%", "↑ 8%", "↑ 9%", "↑ 10%", "↑ 11%", "↑ 12%",
    "↑ 13%", "↑ 14%", "↑ 15%", "↑ 16%", "↑ 18%", "↑ 19%", "↑ 21%", "↑ 22%",
    "↑ 24%", "↑ 26%", "↑ 28%", "↑ 30%", "↑ 31%", "↑ 33%", "↑ 34%", "↑ 35%"];
  var CC = [
    "1 CC", "2 CC", "3 CC", "4 CC", "5 CC", "6 CC", "7 CC", "8 CC", "10 CC",
    "12 CC", "14 CC", "15 CC", "16 CC", "18 CC", "20 CC", "24 CC", "25 CC",
    "28 CC", "30 CC", "32 CC", "35 CC", "40 CC", "44 CC", "46 CC", "48 CC"];

  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a.toFixed(3) + ")";
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function sample(arr, n) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = (Math.random() * (i + 1)) | 0; t = a[i]; a[i] = a[j]; a[j] = t; }
    return a.slice(0, n);
  }
  function bez(P, u) {
    var m = 1 - u;
    return {
      x: m * m * m * P[0].x + 3 * m * m * u * P[1].x + 3 * m * u * u * P[2].x + u * u * u * P[3].x,
      y: m * m * m * P[0].y + 3 * m * m * u * P[1].y + 3 * m * u * u * P[2].y + u * u * u * P[3].y
    };
  }

  function field(host, cls) {
    var canvas = document.createElement("canvas");
    canvas.className = cls;
    canvas.setAttribute("aria-hidden", "true");
    host.insertBefore(canvas, host.firstChild);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, fern = null, nums = [];

    function size() {
      if (host === document.body) { W = window.innerWidth; H = window.innerHeight; }
      else { var r = host.getBoundingClientRect(); W = r.width || window.innerWidth; H = r.height || window.innerHeight; }
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function newFern(now) {
      return {
        bx: rnd(0.10, 0.90), dir: 1, height: rnd(0.60, 0.72), spread: rnd(0.03, 0.07),
        col: pick(STEM_COLS), born: now, grow: 24000, pinnae: 13
      };
    }
    function newNum(fromBottom, text, small) {
      return {
        x: Math.random() * W, y: fromBottom ? H + 14 : Math.random() * H,
        text: text, small: small, size: small ? rnd(7.5, 10.5) : rnd(11, 19),
        vy: -rnd(0.05, 0.14), col: pick(NUM_COLS), a: rnd(0.10, 0.24),
        phase: rnd(0, Math.PI * 2), freq: rnd(0.0003, 0.0008), sway: rnd(6, 16)
      };
    }
    function build(now) {
      fern = null;
      nums = [];
      // telefoon: 16 klein (8 + 8) — desktop: alle 50 uniek (25 + 25)
      var mobile = W <= 600;
      var pcts = mobile ? sample(PCT, 8) : PCT;
      var ccs = mobile ? sample(CC, 8) : CC;
      for (var j = 0; j < pcts.length; j++) nums.push(newNum(false, pcts[j], mobile));
      for (var k = 0; k < ccs.length; k++) nums.push(newNum(false, ccs[k], mobile));
    }

    function leaflet(x, y, ang, len, a, col) {
      if (len < 1.5) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.5, -len * 0.42, len, 0);
      ctx.quadraticCurveTo(len * 0.5, len * 0.42, 0, 0);
      ctx.fillStyle = hexA(col, a);
      ctx.fill();
      ctx.restore();
    }
    function drawPinna(x, y, ang, len, a, col) {
      if (len < 2) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.strokeStyle = hexA(col, a * 0.9);
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.stroke();
      var nl = Math.max(3, Math.min(Math.round(len / 6), 5));
      for (var j = 1; j <= nl; j++) {
        var t = j / (nl + 1);
        var px = t * len;
        var ll = (1 - t * 0.8) * len * 0.34;
        leaflet(px, 0, -0.55, ll, a * 0.85, col);
        leaflet(px, 0, 0.55, ll, a * 0.85, col);
      }
      ctx.restore();
    }
    function drawFern(f, now) {
      var el = now - f.born;
      var g = el < f.grow ? el / f.grow : 1;
      g = 1 - Math.pow(1 - g, 2.2); // easeOut
      var appear = Math.min(1, el / 2200);
      var sway = Math.sin(now * 0.0003) * 0.02;
      var baseX = f.bx * W, baseY = H * 0.995;
      var hgt = f.height * H, spr = f.spread * W, dir = f.dir;
      var col = f.col, A = 0.5 * appear;

      var P = [
        { x: baseX, y: baseY },
        { x: baseX, y: baseY - hgt * 0.45 },
        { x: baseX + dir * spr * 0.5, y: baseY - hgt * 0.85 },
        { x: baseX + dir * spr, y: baseY - hgt }
      ];

      // hoofdnerf (rachis) tot aan g
      ctx.beginPath();
      var u, pt, first = true;
      for (u = 0; u <= g + 0.0001; u += 0.02) {
        pt = bez(P, u);
        if (first) { ctx.moveTo(pt.x, pt.y); first = false; } else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = hexA(col, A);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      // pinnae (zijblaadjes) die uitwaaieren
      var np = f.pinnae, i;
      for (i = 1; i <= np; i++) {
        var pu = 0.06 + (i / np) * 0.9;
        if (g < pu) continue;
        var unf = Math.min(1, (g - pu) / 0.10);
        var bp = bez(P, pu);
        var t2 = bez(P, Math.min(1, pu + 0.02));
        var tang = Math.atan2(t2.y - bp.y, t2.x - bp.x);
        var plen = (1 - pu * 0.72) * hgt * 0.2;
        var open = 0.4 + 0.6 * unf;
        drawPinna(bp.x, bp.y, tang - dir * 1.15 * open + sway, plen * unf, A, col);
        drawPinna(bp.x, bp.y, tang + dir * 1.15 * open + sway, plen * unf, A, col);
      }
    }

    function resize() { size(); build(performance.now()); }

    var last = performance.now();
    function frame(now) {
      var k = Math.min((now - last) / 16.67, 3); last = now;
      // menu-canvas alleen tekenen wanneer het menu open is (bespaart rekenkracht)
      if (host !== document.body && !document.body.classList.contains("menu-open")) {
        ctx.clearRect(0, 0, W, H);
        raf = window.requestAnimationFrame(frame);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      // cijfers
      ctx.textAlign = "center";
      for (var i = 0; i < nums.length; i++) {
        var p = nums[i];
        p.y += p.vy * k;
        if (p.y < -20) { nums[i] = newNum(true, p.text, p.small); continue; }
        var x = p.x + Math.sin(now * p.freq + p.phase) * p.sway;
        ctx.font = "500 " + p.size.toFixed(0) + "px 'Archivo', system-ui, sans-serif";
        ctx.fillStyle = hexA(p.col, p.a);
        ctx.fillText(p.text, x, p.y);
      }
      raf = window.requestAnimationFrame(frame);
    }
    var raf = 0;
    resize();
    window.addEventListener("resize", resize);
    raf = window.requestAnimationFrame(frame);
  }

  field(document.body, "grow-canvas");
  var mo = document.querySelector(".menu-overlay");
  if (mo) field(mo, "grow-canvas grow-canvas--menu");
})();
