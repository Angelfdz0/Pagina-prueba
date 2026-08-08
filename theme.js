/* ============================================================
   THEME.JS — MOTOR DE TEMAS Y RECURSOS GLOBALES
   ============================================================
   Este archivo es el primero en ejecutarse en todas las páginas.
   Su trabajo es leer `config.js` y preparar el entorno visual:
   
   1. Inyecta variables CSS (colores, tipografías) en :root
   2. Configura atributos data-* para personalidades visuales
   3. Carga dinámicamente Google Fonts y Font Awesome
   
   ✅ Al estar en el <head> y ejecutarse síncronamente, evita 
      el "flash de contenido sin estilo" (FOUC) al cargar la página.
   ============================================================ */

(function () {
    "use strict";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚙️ 1. INICIALIZACIÓN Y VERIFICACIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Verifica que el objeto global SITE_CONFIG (de config.js) exista
    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : null;
    
    // Sale silenciosamente si no hay configuración o falta la sección de tema
    if (!C || !C.theme) return; 

    const root = document.documentElement; // Etiqueta <html>
    const r = root.style;
    const t = C.theme;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 2. INYECCIÓN DE VARIABLES CSS (CUSTOM PROPERTIES)
    // Permite que todo el CSS (style.css, blog.css, admin.css) 
    // use estos colores dinámicos definidos por el cliente.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Paleta de colores base (Fondos y Textos)
    r.setProperty("--color-bg", t.bg);
    r.setProperty("--color-bg-alt", t.bgAlt);
    r.setProperty("--color-text", t.text);
    r.setProperty("--color-text-muted", t.textMuted);
    r.setProperty("--color-white", t.white);
    r.setProperty("--color-dark", t.dark);

    // Colores de acento (Identidad de marca del cliente)
    r.setProperty("--color-accent", t.accent);
    // Fallback a un dorado genérico (201, 169, 110) si el cliente no define el RGB.
    // El formato RGB es necesario para usar rgba(var(--accent-rgb), 0.5) en CSS.
    r.setProperty("--accent-rgb", t.accentRGB || "201, 169, 110");
    r.setProperty("--color-accent-light", t.accentLight);

    // Tipografías (Solo se inyectan si están definidas en el config)
    if (t.fontDisplay) r.setProperty("--font-display", t.fontDisplay);
    if (t.fontBody) r.setProperty("--font-body", t.fontBody);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧬 3. PERSONALIDAD VISUAL Y LAYOUT (Atributos Data)
    // Estos atributos en <html> permiten al CSS aplicar estilos 
    // condicionales de forma masiva (ej. botones redondeados en 
    // "bold", sin partículas ni ruido en "minimal").
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    root.setAttribute('data-personality', t.personality || 'editorial');
    root.setAttribute('data-hero-layout', t.heroLayout || 'center');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 4. CARGA DE RECURSOS EXTERNOS (Fuentes e Íconos)
    // Inyecta etiquetas <link> en el <head> de forma programática.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    /**
     * Helper para crear e insertar etiquetas <link>
     * @param {string} rel - Relación del recurso (stylesheet, preconnect)
     * @param {string} href - URL del recurso
     * @param {boolean} cross - Si requiere atributo crossOrigin (CORS)
     */
    function addLink(rel, href, cross) {
        const l = document.createElement('link');
        l.rel = rel; 
        l.href = href;
        // crossOrigin es obligatorio para descargar fuentes de dominios externos
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
          // ✅ MODO DE TEMA: "dark" (default) | "light" (clínicas/premium claro)
  root.setAttribute('data-theme', t.mode || 'dark');
    }

  // ✅ Logo dinámico en todas las páginas (blog / tienda / legal)
  function applyLogo() {
    const logo = C.header?.logo;
    if (!logo) return;
    document.querySelectorAll('[data-logo-text]').forEach(el => el.textContent = logo.text || '');
    document.querySelectorAll('[data-logo-highlight]').forEach(el => el.textContent = logo.highlight || '');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyLogo);
  else applyLogo();

})();