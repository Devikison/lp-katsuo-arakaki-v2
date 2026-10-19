(function () {
  "use strict";

  var cfg = window.LP_CONFIG || {};

  /* ---------- WhatsApp: monta o link em todos os botões ---------- */
  var number = String(cfg.whatsappNumber || "").replace(/\D/g, "");
  var text = encodeURIComponent(cfg.whatsappMessage || "");
  var waUrl = number ? "https://wa.me/" + number + (text ? "?text=" + text : "") : "#";

  document.querySelectorAll(".js-wa").forEach(function (a) {
    a.setAttribute("href", waUrl);
    if (waUrl === "#") a.setAttribute("aria-disabled", "true");
  });

  /* ---------- Vídeos: capa leve, iframe só quando clicar ---------- */
  var urls = { vsl: cfg.vslUrl || "", depo: cfg.depoUrl || "" };

  function embedUrl(u) {
    var m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
    if (m) return "https://www.youtube.com/embed/" + m[1];
    var v = u.match(/vimeo\.com\/(\d+)/);
    if (v && u.indexOf("player.vimeo.com") === -1) return "https://player.vimeo.com/video/" + v[1];
    return u;
  }

  document.querySelectorAll(".video[data-video-target]").forEach(function (btn) {
    var key = btn.getAttribute("data-video-target");
    var url = urls[key];
    if (!url) {
      btn.classList.add("video--pending");
      btn.setAttribute("title", "Vídeo em breve");
      return;
    }
    btn.addEventListener("click", function () {
      /* arquivo de vídeo próprio (.mp4): player nativo, só baixa ao clicar */
      if (/\.mp4(\?|$)/i.test(url)) {
        var img = btn.querySelector("img");
        var vid = document.createElement("video");
        vid.src = url;
        vid.controls = true;
        vid.autoplay = true;
        vid.playsInline = true;
        vid.preload = "auto";
        if (img) vid.poster = img.currentSrc || img.src;
        vid.className = "video__player";
        vid.setAttribute("aria-label", btn.getAttribute("aria-label") || "Vídeo");
        btn.replaceWith(vid);
        var p = vid.play();
        if (p && p.catch) p.catch(function () {});
        return;
      }
      var src = embedUrl(url);
      var sep = src.indexOf("?") === -1 ? "?" : "&";
      var frame = document.createElement("iframe");
      frame.src = src + sep + "autoplay=1&rel=0";
      frame.title = btn.getAttribute("aria-label") || "Vídeo";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
      frame.setAttribute("allowfullscreen", "");
      frame.className = "video__frame";
      btn.replaceWith(frame);
    });
  });

  /* ---------- Depoimentos em vídeo: YouTube só carrega ao clicar ---------- */
  document.querySelectorAll("[data-yt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-yt");
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      frame.title = btn.getAttribute("aria-label") || "Depoimento em vídeo";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
      frame.setAttribute("allowfullscreen", "");
      frame.className = "vcard__player";
      btn.replaceWith(frame);
    });
  });

  /* ---------- Carrossel de depoimentos (mesmo da versão A) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector("[data-track]");
    var prev = root.querySelector("[data-prev]");
    var next = root.querySelector("[data-next]");
    var dotsBox = root.querySelector("[data-dots]");
    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return;

    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Ir para o depoimento " + (i + 1));
      b.addEventListener("click", function () { go(i); });
      dotsBox.appendChild(b);
      return b;
    });

    function gap() { var g = parseFloat(getComputedStyle(track).columnGap); return isNaN(g) ? 16 : g; }
    function step() { return slides[0].getBoundingClientRect().width + gap(); }
    function index() { return Math.round(track.scrollLeft / step()); }
    function maxIndex() { return Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / step())); }
    function go(i) {
      i = Math.max(0, Math.min(i, maxIndex()));
      track.scrollTo({ left: i * step(), behavior: reduceMotion ? "auto" : "smooth" });
    }
    function paint() {
      var i = index(), m = maxIndex();
      dots.forEach(function (d, k) {
        d.hidden = k > m;
        d.classList.toggle("is-on", k === Math.min(i, m));
      });
      prev.disabled = i <= 0; next.disabled = i >= m;
    }
    prev.addEventListener("click", function () { go(index() - 1); });
    next.addEventListener("click", function () { go(index() + 1); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(paint); }, { passive: true });
    window.addEventListener("resize", paint);
    paint();

    /* arrastar com o mouse no desktop */
    var down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
      track.classList.add("is-dragging"); track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX; if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startL - dx;
    });
    function up() {
      if (!down) return; down = false; track.classList.remove("is-dragging");
      go(index());
    }
    track.addEventListener("pointerup", up); track.addEventListener("pointercancel", up); track.addEventListener("mouseleave", up);
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    /* passa sozinho, devagar; para enquanto a pessoa interage */
    var hold = false;
    if (!reduceMotion && root.getAttribute("data-autoplay") !== "off") {
      setInterval(function () {
        if (hold || document.hidden) return;
        var i = index(); go(i >= maxIndex() ? 0 : i + 1);
      }, 5200);
    }
    ["pointerenter", "focusin", "touchstart"].forEach(function (ev) { root.addEventListener(ev, function () { hold = true; }, { passive: true }); });
    ["pointerleave", "focusout", "touchend"].forEach(function (ev) { root.addEventListener(ev, function () { hold = false; }, { passive: true }); });
  });

  /* ---------- FAQ: acordeão com abertura/fechamento suave ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".faq-card").forEach(function (card) {
    var btn = card.querySelector(".faq-card__q");
    var body = card.querySelector(".faq-card__a");

    function open() {
      card.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      if (reduce) { body.style.height = "auto"; return; }
      body.style.height = "0px";
      body.getBoundingClientRect();
      body.style.height = body.scrollHeight + "px";
      var done = function (e) {
        if (e && e.propertyName !== "height") return;
        body.removeEventListener("transitionend", done);
        if (card.classList.contains("is-open")) body.style.height = "auto";
      };
      body.addEventListener("transitionend", done);
      setTimeout(done, 600);
    }
    function close() {
      if (reduce) { card.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); body.style.height = ""; return; }
      body.style.height = body.getBoundingClientRect().height + "px";
      body.getBoundingClientRect();
      body.style.height = "0px";
      card.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
    btn.addEventListener("click", function () {
      if (card.classList.contains("is-open")) close(); else open();
    });
  });

  /* ---------- Cookies: aceitar ou recusar, lembrado no navegador ---------- */
  var cookie = document.querySelector("[data-cookie]");
  if (cookie) {
    var choice = null;
    try { choice = localStorage.getItem("lp-cookie-consent"); } catch (e) {}
    window.LP_CONSENT = choice;
    if (!choice) {
      setTimeout(function () {
        cookie.hidden = false;
        document.body.classList.add("cookie-open");
        window.requestAnimationFrame(function () { cookie.classList.add("cookie--on"); });
      }, 1500);
    }
    function decide(v) {
      try { localStorage.setItem("lp-cookie-consent", v); } catch (e) {}
      window.LP_CONSENT = v;
      document.dispatchEvent(new CustomEvent("lp:consent", { detail: v }));
      cookie.classList.remove("cookie--on");
      document.body.classList.remove("cookie-open");
      setTimeout(function () { cookie.hidden = true; }, 600);
    }
    cookie.querySelector("[data-cookie-accept]").addEventListener("click", function () { decide("accepted"); });
    cookie.querySelector("[data-cookie-deny]").addEventListener("click", function () { decide("denied"); });
  }

  /* ---------- Ano ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = "© " + new Date().getFullYear();
})();
