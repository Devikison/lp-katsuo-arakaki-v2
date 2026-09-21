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
