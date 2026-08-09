/* ============================================================
   ADMIN-AUTH.JS — AUTENTICACIÓN DISCRETA EN PÁGINAS PÚBLICAS (OPTIMIZADO)
   ============================================================
   Este archivo permite a los administradores iniciar sesión desde
   cualquier página pública (index, blog, tienda) sin necesidad de
   navegar a `admin.html` primero.
   
   Optimizaciones:
   ✅ Lazy initialization de Supabase (solo cuando se necesita)
   ✅ Lazy injection de CSS/HTML (solo al abrir el modal)
   ✅ Protección contra múltiples inyecciones
   ============================================================ */

(function() {
    "use strict";

    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
    
    // Sale silenciosamente si Supabase no está cargado
    if (typeof window.supabase === 'undefined') return;

    const $ = s => document.querySelector(s);
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚙️ LAZY SUPABASE CLIENT
    // Solo se crea cuando realmente se necesita (optimización)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let supabaseClient = null;
    function getSupabase() {
        if (!supabaseClient) {
            supabaseClient = window.__supabaseShared || 
                (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        }
        return supabaseClient;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 LAZY CSS INJECTION
    // Los estilos se inyectan solo cuando se abre el modal por primera vez
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let cssInjected = false;
    function injectStyles() {
        if (cssInjected) return;
        
        const style = document.createElement('style');
        style.textContent = `
            [data-admin-link] {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 1.2rem;
                flex-wrap: wrap;
            }

            .footer-admin-link {
                opacity: 0.45;
                font-size: 0.68rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: var(--color-text-muted);
                transition: opacity 0.3s, color 0.3s;
            }
            .footer-admin-link:hover {
                opacity: 1;
                color: var(--color-accent);
            }

            .auth-modal {
                position: fixed;
                inset: 0;
                z-index: 9000;
                display: none;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
            }
            .auth-modal.open { display: flex; }

            .auth-card {
                width: min(92%, 380px);
                background: var(--color-bg-alt);
                border: 1px solid rgba(201, 169, 110, 0.3);
                border-radius: 12px;
                padding: 2.2rem;
                display: flex;
                flex-direction: column;
                gap: 0.9rem;
                position: relative;
                animation: authFadeIn 0.3s ease-out;
            }
            
            @keyframes authFadeIn {
                from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .auth-card h3 {
                font-family: var(--font-display);
                color: var(--color-white);
                font-size: 1.4rem;
            }
            .auth-card p {
                color: var(--color-text-muted);
                font-size: 0.8rem;
                margin-top: -0.4rem;
            }
            
            .auth-card input {
                padding: 0.85rem 1rem;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 6px;
                color: var(--color-text);
                font-family: var(--font-body);
                transition: border-color 0.3s;
            }
            .auth-card input:focus {
                outline: none;
                border-color: var(--color-accent);
            }
            
            .auth-card button[type=submit] {
                padding: 0.9rem;
                background: var(--color-accent);
                border: none;
                border-radius: 6px;
                color: var(--color-dark);
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-size: 0.72rem;
                cursor: pointer;
                font-family: var(--font-body);
                transition: background 0.3s, transform 0.2s;
            }
            .auth-card button[type=submit]:hover:not(:disabled) {
                background: var(--color-accent-light);
                transform: translateY(-1px);
            }
            .auth-card button[type=submit]:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .auth-error {
                color: #ff4444;
                font-size: 0.78rem;
                min-height: 1rem;
            }

            .auth-close {
                position: absolute;
                top: 0.8rem;
                right: 0.8rem;
                background: transparent;
                border: none;
                color: var(--color-text-muted);
                font-size: 1.1rem;
                cursor: pointer;
                transition: color 0.3s, transform 0.3s;
            }
            .auth-close:hover {
                color: var(--color-accent);
                transform: rotate(90deg);
            }
        `;
        document.head.appendChild(style);
        cssInjected = true;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏗️ LAZY MODAL INJECTION
    // El modal se crea solo cuando se abre por primera vez
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let modal = null;
    function getModal() {
        if (modal) return modal;
        
        injectStyles(); // Asegurar que los estilos estén inyectados
        
        modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <form class="auth-card" id="authForm">
                <button type="button" class="auth-close" aria-label="Cerrar">✕</button>
                <h3>Acceso Administrador</h3>
                <p>Ingresa tus credenciales para gestionar el contenido</p>
                <input type="email" id="authEmail" placeholder="Correo" required autocomplete="email">
                <input type="password" id="authPassword" placeholder="Contraseña" required autocomplete="current-password">
                <button type="submit">Iniciar sesión</button>
                <div class="auth-error" id="authError" role="alert"></div>
            </form>
        `;
        document.body.appendChild(modal);
        
        // Configurar eventos del modal
        const openModal = () => modal.classList.add('open');
        const closeModal = () => { 
            modal.classList.remove('open'); 
            $('#authError').textContent = ''; 
        };

        modal.querySelector('.auth-close').addEventListener('click', closeModal);
        modal.addEventListener('click', e => { 
            if (e.target === modal) closeModal(); 
        });

        // Manejo del envío del formulario
        $('#authForm').addEventListener('submit', async e => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type=submit]');
            
            btn.disabled = true; 
            btn.textContent = 'Verificando...';
            
            try {
                const { error } = await getSupabase().auth.signInWithPassword({ 
                    email: $('#authEmail').value, 
                    password: $('#authPassword').value 
                });
                
                btn.disabled = false; 
                btn.textContent = 'Iniciar sesión';
                
                if (error) { 
                    $('#authError').textContent = 'Credenciales inválidas'; 
                    return; 
                }
                
                location.reload();
            } catch (err) {
                btn.disabled = false; 
                btn.textContent = 'Iniciar sesión';
                $('#authError').textContent = 'Error de conexión. Intenta de nuevo.';
            }
        });
        
        return modal;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 RENDERIZADO DINÁMICO DE ENLACES (FOOTER)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function renderLinks() {
        const containers = document.querySelectorAll('[data-admin-link]');
        if (!containers.length) return;
        
        // Verificar sesión actual
        try {
            const { data: { session } } = await getSupabase().auth.getSession();
            
            containers.forEach(el => {
                el.innerHTML = '';
                
                if (session) {
                    el.innerHTML = `
                        <a href="admin.html" class="footer-admin-link">Panel admin</a>
                        <a href="#" class="footer-admin-link" id="adminLogoutLink">Cerrar sesión</a>
                    `;
                    
                    el.querySelector('#adminLogoutLink').addEventListener('click', async e => {
                        e.preventDefault();
                        try {
                            await getSupabase().auth.signOut();
                            location.reload();
                        } catch (err) {
                            console.error('Error al cerrar sesión:', err);
                        }
                    });
                } else {
                    el.innerHTML = `
                        <a href="#" class="footer-admin-link" id="adminLoginLink">Iniciar sesión (admin)</a>
                    `;
                    
                    el.querySelector('#adminLoginLink').addEventListener('click', e => { 
                        e.preventDefault(); 
                        getModal().classList.add('open'); 
                    });
                }
            });
        } catch (err) {
            console.error('Error al verificar sesión:', err);
            // Si falla Supabase, no mostrar enlaces de admin
            containers.forEach(el => {
                el.innerHTML = '';
            });
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 INICIALIZACIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderLinks);
    } else {
        renderLinks();
    }

})();