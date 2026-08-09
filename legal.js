/* ============================================================
   LEGAL.JS — Pestañas, cookies y datos dinámicos desde config.js
   ============================================================ */
(function() {
    "use strict";
    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : null;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏢 1. RELLENA DATOS DEL NEGOCIO DESDE config.js
    // Reemplaza los valores "de ejemplo" del HTML por los reales
    // de C.business (nombre, RFC, dirección, correos, teléfono).
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function applyBusinessData() {
        if (!C || !C.business) return;
        const b = C.business;

        // [texto del HTML] → [valor de config.js]
        // (el más largo primero para no pisar coincidencias)
        const map = [
            ['Studio Creativo S.A. de C.V.', b.legalName],
            ['STC200115AB1', b.taxId],
            ['Av. Paseo de la Reforma 250, Piso 12, Col. Juárez, C.P. 06600, Ciudad de México', b.address],
            ['privacidad@studio.com', b.email],
            ['devoluciones@studio.com', b.email],
            ['soporte@studio.com', b.email],
            ['quejas@studio.com', b.email],
            ['+52 55 1234 5678', b.phone],
            ['55 1234 5678', b.phone]
        ].filter(([old, nw]) => old && nw && old !== nw);

        if (!map.length) return;

        // Recorre solo nodos de texto (no rompe el HTML)
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach(node => {
            let text = node.nodeValue, changed = false;
            map.forEach(([old, nw]) => {
                if (text.includes(old)) { text = text.split(old).join(nw); changed = true; }
            });
            if (changed) node.nodeValue = text;
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 2. NAVEGACIÓN POR PESTAÑAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function initTabs() {
        const tabs = document.querySelectorAll('.legal-tab');
        const sections = document.querySelectorAll('.legal-section');
        if (!tabs.length || !sections.length) return;

        function activate(hash) {
            if (!hash || !document.getElementById(hash)) return;
            tabs.forEach(t => {
                const on = t.dataset.tab === hash;
                t.classList.toggle('active', on);
                t.setAttribute('aria-selected', on.toString());
            });
            sections.forEach(s => s.classList.toggle('active', s.id === hash));
        }

        tabs.forEach(tab => tab.addEventListener('click', () => {
            activate(tab.dataset.tab);
            history.replaceState(null, null, '#' + tab.dataset.tab);
        }));

        activate(window.location.hash.replace('#', ''));
        window.addEventListener('hashchange', () => activate(window.location.hash.replace('#', '')));

        // Links del footer
        document.querySelectorAll('.legal-footer a[href^="#"]').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                const id = a.getAttribute('href').replace('#', '');
                const target = document.getElementById(id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    activate(id);
                    history.replaceState(null, null, '#' + id);
                }
            });
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 INICIO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const boot = () => { applyBusinessData(); initTabs(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();