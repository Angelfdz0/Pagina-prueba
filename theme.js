/* ============================================================
THEME.JS — Aplica el tema de config.js en TODAS las páginas
+ carga Google Fonts y Font Awesome desde config.js
+ activa personalidad y hero layout por cliente
============================================================ */
(function () {
  "use strict";
  const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : null;
  if (!C || !C.theme) return;
  const root = document.documentElement;
  const r = root.style;
  const t = C.theme;
  r.setProperty("--color-bg", t.bg);
  r.setProperty("--color-bg-alt", t.bgAlt);
  r.setProperty("--color-text", t.text);
  r.setProperty("--color-text-muted", t.textMuted);
  r.setProperty("--color-accent", t.accent);
  r.setProperty("--accent-rgb", t.accentRGB || "201, 169, 110");
  r.setProperty("--color-accent-light", t.accentLight);
  r.setProperty("--color-white", t.white);
  r.setProperty("--color-dark", t.dark);
  if (t.fontDisplay) r.setProperty("--font-display", t.fontDisplay);
  if (t.fontBody) r.setProperty("--font-body", t.fontBody);

  // ✅ Personalidad visual y layout del hero (atributos data → CSS)
  root.setAttribute('data-personality', t.personality || 'editorial');
  root.setAttribute('data-hero-layout', t.heroLayout || 'center');

  // ✅ Carga de recursos externos definida en config.js
  function addLink(rel, href, cross) {
    const l = document.createElement('link');
    l.rel = rel; l.href = href;
    if (cross) l.crossOrigin = 'anonymous';
    document.head.appendChild(l);
  }
  if (t.googleFontsUrl) {
    addLink('preconnect', 'https://fonts.googleapis.com');
    addLink('preconnect', 'https://fonts.gstatic.com', true);
    addLink('stylesheet', t.googleFontsUrl);
  }
  if (t.fontAwesomeUrl) addLink('stylesheet', t.fontAwesomeUrl);
})();