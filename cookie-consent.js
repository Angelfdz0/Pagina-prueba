/* ============================================================
   COOKIE-CONSENT.JS — Banner no invasivo + gate de Analytics
   ------------------------------------------------------------
   ✅ Fade-IN al scrollear (aparece suave cuando bajas ~250px)
   ✅ Fade-OUT al elegir (desaparece suave con cualquiera de los 2 botones)
   ✅ Solo carga Google Analytics si aceptas Y está activo en config.js
   ============================================================ */
(function () {
    "use strict";
    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : null;
    const KEY = 'cookieConsent';
    const SCROLL_THRESHOLD = 250; // px de scroll para mostrar el banner

    const analyticsOn = () => !!(C && C.analytics && C.analytics.enabled && C.analytics.measurementId);

    // ── Estilos: barra slim con fade in/out ──
    function injectCSS() {
        if (document.getElementById('ccStyle')) return;
        const s = document.createElement('style');
        s.id = 'ccStyle';
        s.textContent = `
            .cc-bar{position:fixed;left:0;right:0;bottom:0;z-index:8000;display:flex;align-items:center;
                justify-content:space-between;gap:1rem;flex-wrap:wrap;
                padding:.9rem clamp(1rem,4vw,2rem);
                background:color-mix(in srgb, var(--color-bg-alt) 96%, transparent);
                backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
                border-top:1px solid rgba(var(--accent-rgb),.2);
                opacity:0; transform:translateY(16px); pointer-events:none;
                transition:opacity .5s ease, transform .5s var(--ease-out-expo);}
            .cc-bar.visible{opacity:1;transform:translateY(0);pointer-events:auto;}
            .cc-text{flex:1;min-width:240px;font-size:.8rem;color:var(--color-text-muted);line-height:1.5;}
            .cc-text a{color:var(--color-accent);text-decoration:underline;}
            .cc-actions{display:flex;gap:.6rem;flex-shrink:0;}
            .cc-btn{padding:.55rem 1.1rem;font-size:.7rem;font-weight:600;letter-spacing:.08em;
                text-transform:uppercase;border-radius:6px;cursor:pointer;font-family:var(--font-body);
                border:none;transition:all .3s;}
            .cc-solid{background:var(--color-accent);color:var(--color-dark);}
            .cc-solid:hover{background:var(--color-accent-light);}
            .cc-ghost{background:transparent;color:var(--color-text-muted);
                border:1px solid var(--L-line-strong, rgba(255,255,255,.15));}
            .cc-ghost:hover{color:var(--color-text);border-color:var(--color-accent);}
            @media(max-width:600px){.cc-bar{flex-direction:column;text-align:center;}
                .cc-actions{width:100%;justify-content:center;}}
        `;
        document.head.appendChild(s);
    }

    // ── Inyecta la barra (entra con fade-in) ──
    function injectBar() {
        if (document.getElementById('cookieConsentBar')) return;
        injectCSS();
        const bar = document.createElement('div');
        bar.id = 'cookieConsentBar';
        bar.className = 'cc-bar';
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-label', 'Consentimiento de cookies');
        bar.innerHTML = `
            <div class="cc-text">
                Usamos cookies propias necesarias y de funcionalidad.${analyticsOn() ? ' Con tu permiso, también activaremos analítica para mejorar el sitio.' : ''}
                <a href="legal.html#cookies">Más información</a>.
            </div>
            <div class="cc-actions">
                <button id="ccReject" class="cc-btn cc-ghost">Solo necesarias</button>
                <button id="ccAccept" class="cc-btn cc-solid">Aceptar todas</button>
            </div>`;
        document.body.appendChild(bar);
        // Doble rAF para garantizar que la transición de fade-in se ejecute
        requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.add('visible')));

        bar.querySelector('#ccAccept').addEventListener('click', () => choose('accepted'));
        bar.querySelector('#ccReject').addEventListener('click', () => choose('rejected'));
    }

    // ── Al elegir: fade-out y retiro ──
    function choose(v) {
        localStorage.setItem(KEY, v);
        localStorage.setItem(KEY + 'Time', Date.now().toString());
        const bar = document.getElementById('cookieConsentBar');
        if (bar) {
            bar.classList.remove('visible');          // dispara el fade-out
            setTimeout(() => bar.remove(), 550);      // retira tras la transición
        }
        if (v === 'accepted') loadAnalytics();
    }

    // ── Carga Google Analytics SOLO con consentimiento + config activa ──
    function loadAnalytics() {
        if (!analyticsOn() || window.__ccGA) return;
        window.__ccGA = true;
        const id = C.analytics.measurementId;
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', id, { anonymize_ip: true });
    }

    // ── Disparador: aparece al scrollear ──
    function armScrollTrigger() {
        const onScroll = () => {
            if (window.scrollY > SCROLL_THRESHOLD) {
                window.removeEventListener('scroll', onScroll);
                injectBar();
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        // Si la página es corta y no se puede scrollear, mostrar igual
        if (document.documentElement.scrollHeight <= window.innerHeight) {
            setTimeout(injectBar, 1500);
        }
    }

    function boot() {
        const stored = localStorage.getItem(KEY);
        if (stored === 'accepted') { loadAnalytics(); return; }  // ya aceptó → sin banner
        if (stored === 'rejected') { return; }                  // ya rechazó → sin banner
        armScrollTrigger();                                     // sin decisión → espera scroll
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();