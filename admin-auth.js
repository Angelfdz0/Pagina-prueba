/* ============================================================
   ADMIN-AUTH.JS — AUTENTICACIÓN DISCRETA EN PÁGINAS PÚBLICAS
   ============================================================
   Este archivo permite a los administradores iniciar sesión desde
   cualquier página pública (index, blog, tienda) sin necesidad de
   navegar a `admin.html` primero.
   
   Funcionamiento:
   1. Inyecta CSS y HTML del modal de login dinámicamente (no ensucia 
      el HTML base ni requiere archivos externos adicionales).
   2. Busca contenedores con el atributo `data-admin-link` (inyectados 
      por app.js en el footer) para mostrar enlaces contextuales.
   3. Si NO hay sesión: muestra "Iniciar sesión (admin)".
   4. Si HAY sesión: muestra "Panel admin" + "Cerrar sesión".
   
   ✅ Usa el cliente compartido de Supabase (`window.__supabaseShared`)
      para evitar crear múltiples conexiones simultáneas.
   ============================================================ */

(function() {
    "use strict";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚙️ 1. CONFIGURACIÓN E INICIALIZACIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
    
    // Sale silenciosamente si Supabase no está cargado (ej. error de red)
    if (typeof window.supabase === 'undefined') return;

    const $ = s => document.querySelector(s);
    
    // Reutiliza la conexión global de Supabase si ya existe (optimización)
    const supabase = window.__supabaseShared || 
        (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 2. INYECCIÓN DE ESTILOS CSS
    // Se inyectan vía JS para mantener la discreción y evitar 
    // cargar un archivo CSS separado solo para el modal de login.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const style = document.createElement('style');
    style.textContent = `
        /* Contenedor de enlaces del footer (centrado y flexible) */
        [data-admin-link] {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1.2rem;
            flex-wrap: wrap;
        }

        /* Enlaces discretos (baja opacidad hasta el hover) */
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

        /* Modal de autenticación (overlay oscuro con blur) */
        .auth-modal {
            position: fixed;
            inset: 0;
            z-index: 9000; /* Por encima de todo el contenido público */
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
        }
        .auth-modal.open { display: flex; }

        /* Tarjeta del formulario de login */
        .auth-card {
            width: min(92%, 380px);
            background: var(--color-bg-alt);
            border: 1px solid rgba(201, 169, 110, 0.3); /* Borde dorado sutil */
            border-radius: 12px;
            padding: 2.2rem;
            display: flex;
            flex-direction: column;
            gap: 0.9rem;
            position: relative;
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
        
        /* Inputs del formulario */
        .auth-card input {
            padding: 0.85rem 1rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 6px;
            color: var(--color-text);
            font-family: var(--font-body);
        }
        .auth-card input:focus {
            outline: none;
            border-color: var(--color-accent);
        }
        
        /* Botón de envío */
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
        }
        .auth-card button[type=submit]:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* Mensaje de error */
        .auth-error {
            color: #ff4444;
            font-size: 0.78rem;
            min-height: 1rem;
        }

        /* Botón de cerrar (X) */
        .auth-close {
            position: absolute;
            top: 0.8rem;
            right: 0.8rem;
            background: transparent;
            border: none;
            color: var(--color-text-muted);
            font-size: 1.1rem;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏗️ 3. INYECCIÓN DEL MODAL DE LOGIN (HTML)
    // Se crea una sola vez y se añade al final del <body>.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const modal = document.createElement('div');
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 4. GESTIÓN DE EVENTOS DEL MODAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const openModal = () => modal.classList.add('open');
    
    const closeModal = () => { 
        modal.classList.remove('open'); 
        // Limpiar mensaje de error al cerrar
        $('#authError').textContent = ''; 
    };

    // Cerrar con el botón X
    modal.querySelector('.auth-close').addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera de la tarjeta (en el overlay)
    modal.addEventListener('click', e => { 
        if (e.target === modal) closeModal(); 
    });

    // Manejo del envío del formulario (Login)
    $('#authForm').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type=submit]');
        
        // Estado de carga
        btn.disabled = true; 
        btn.textContent = 'Verificando...';
        
        // Autenticación contra Supabase
        const { error } = await supabase.auth.signInWithPassword({ 
            email: $('#authEmail').value, 
            password: $('#authPassword').value 
        });
        
        // Restaurar botón
        btn.disabled = false; 
        btn.textContent = 'Iniciar sesión';
        
        if (error) { 
            $('#authError').textContent = 'Credenciales inválidas'; 
            return; 
        }
        
        // Éxito: recargar la página para actualizar el estado global
        // (esto hace que app.js y admin-auth.js detecten la nueva sesión)
        location.reload();
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 5. RENDERIZADO DINÁMICO DE ENLACES (FOOTER)
    // Busca cualquier elemento con `data-admin-link` y lo pobla
    // según el estado actual de la sesión del usuario.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function renderLinks() {
        const containers = document.querySelectorAll('[data-admin-link]');
        if (!containers.length) return;
        
        // Verificar sesión actual
        const { data: { session } } = await supabase.auth.getSession();
        
        containers.forEach(el => {
            el.innerHTML = ''; // Limpiar contenido previo
            
            if (session) {
                // 🔓 USUARIO AUTENTICADO
                el.innerHTML = `
                    <a href="admin.html" class="footer-admin-link">Panel admin</a>
                    <a href="#" class="footer-admin-link" id="adminLogoutLink">Cerrar sesión</a>
                `;
                
                // Evento de Logout
                el.querySelector('#adminLogoutLink').addEventListener('click', async e => {
                    e.preventDefault();
                    await supabase.auth.signOut();
                    location.reload(); // Recargar para limpiar estado y UI
                });
                
            } else {
                // 🔒 USUARIO NO AUTENTICADO
                el.innerHTML = `
                    <a href="#" class="footer-admin-link" id="adminLoginLink">Iniciar sesión (admin)</a>
                `;
                
                // Evento de Login (abre el modal inyectado)
                el.querySelector('#adminLoginLink').addEventListener('click', e => { 
                    e.preventDefault(); 
                    openModal(); 
                });
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 6. INICIALIZACIÓN
    // Ejecuta el renderizado cuando el DOM está listo.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderLinks);
    } else {
        renderLinks();
    }

})();