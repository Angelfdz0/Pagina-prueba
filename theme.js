/* ============================================================
   THEME.JS — MOTOR DE TEMAS Y RECURSOS GLOBALES (OPTIMIZADO)
   ============================================================
   Este archivo es el primero en ejecutarse en todas las páginas.
   Su trabajo es leer `config.js` y preparar el entorno visual:
   
   1. Inyecta variables CSS (colores, tipografías) en :root
   2. Configura atributos data-* para personalidades visuales
   3. Carga dinámicamente Google Fonts y Font Awesome
   4. Aplica el modo de tema (dark/light) inmediatamente
   
   ✅ Al estar en el <head> y ejecutarse síncronamente, evita 
      el "flash de contenido sin estilo" (FOUC) al cargar la página.
   ============================================================ */

(function () {
    "use strict";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚙️ 1. INICIALIZACIÓN Y VERIFICACIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : null;
    
    if (!C || !C.theme) return;

    const root = document.documentElement;
    const r = root.style;
    const t = C.theme;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 2. INYECCIÓN DE VARIABLES CSS (CUSTOM PROPERTIES)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Paleta de colores base
    r.setProperty("--color-bg", t.bg);
    r.setProperty("--color-bg-alt", t.bgAlt);
    r.setProperty("--color-text", t.text);
    r.setProperty("--color-text-muted", t.textMuted);
    r.setProperty("--color-white", t.white);
    r.setProperty("--color-dark", t.dark);

    // Colores de acento
    r.setProperty("--color-accent", t.accent);
    r.setProperty("--accent-rgb", t.accentRGB || "201, 169, 110");
    r.setProperty("--color-accent-light", t.accentLight);

    // Tipografías
    if (t.fontDisplay) r.setProperty("--font-display", t.fontDisplay);
    if (t.fontBody) r.setProperty("--font-body", t.fontBody);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧬 3. PERSONALIDAD VISUAL, LAYOUT Y MODO DE TEMA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    root.setAttribute('data-personality', t.personality || 'editorial');
    root.setAttribute('data-hero-layout', t.heroLayout || 'center');
    
    // ✅ MODO DE TEMA: "dark" (default) | "light" (clínicas/premium claro)
    // IMPORTANTE: debe aplicarse SIEMPRE, independiente de Font Awesome
    root.setAttribute('data-theme', t.mode || 'dark');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 4. CARGA DE RECURSOS EXTERNOS (Fuentes e Íconos)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    /**
     * Helper para crear e insertar etiquetas <link> (con protección contra duplicados)
     * @param {string} rel - Relación del recurso (stylesheet, preconnect)
     * @param {string} href - URL del recurso
     * @param {boolean} cross - Si requiere atributo crossOrigin (CORS)
     */
    function addLink(rel, href, cross) {
        // Evitar duplicados: si ya existe un link con este href, no lo agregamos
        if (document.querySelector(`link[href="${href}"]`)) return;
        
        const l = document.createElement('link');
        l.rel = rel; 
        l.href = href;
        if (cross) l.crossOrigin = 'anonymous';
        document.head.appendChild(l);
    }

    // Google Fonts: Preconnect acelera la resolución de DNS y el handshake TLS
    if (t.googleFontsUrl) {
        addLink('preconnect', 'https://fonts.googleapis.com');
        addLink('preconnect', 'https://fonts.gstatic.com', true);
        addLink('stylesheet', t.googleFontsUrl);
    }

    // Font Awesome: Librería de íconos vectoriales escalables
    if (t.fontAwesomeUrl) {
        addLink('stylesheet', t.fontAwesomeUrl);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏷️ 5. LOGO DINÁMICO (aplicado tras cargar el DOM)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function applyLogo() {
        const logo = C.header?.logo;
        if (!logo) return;
        document.querySelectorAll('[data-logo-text]').forEach(el => el.textContent = logo.text || '');
        document.querySelectorAll('[data-logo-highlight]').forEach(el => el.textContent = logo.highlight || '');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyLogo);
    } else {
        applyLogo();
    }

})();