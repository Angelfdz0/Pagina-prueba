/* ============================================================
   ADMIN AUTH — Login discreto en páginas públicas
   Inyecta modal de login + gestiona el enlace del footer
   ============================================================ */
(function() {
"use strict";
const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
if (typeof window.supabase === 'undefined') return;
const $ = s => document.querySelector(s);
const supabase = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));

// Estilos inyectados (modal + enlace discreto)
const style = document.createElement('style');
style.textContent = `
[data-admin-link]{display:flex;justify-content:center;align-items:center;gap:1.2rem;flex-wrap:wrap;}
.footer-admin-link{opacity:.45;font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--color-text-muted);transition:opacity .3s,color .3s;}
.footer-admin-link:hover{opacity:1;color:var(--color-accent);}
.auth-modal{position:fixed;inset:0;z-index:9000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}
.auth-modal.open{display:flex;}
.auth-card{width:min(92%,380px);background:var(--color-bg-alt);border:1px solid rgba(201,169,110,.3);border-radius:12px;padding:2.2rem;display:flex;flex-direction:column;gap:.9rem;position:relative;}
.auth-card h3{font-family:var(--font-display);color:var(--color-white);font-size:1.4rem;}
.auth-card p{color:var(--color-text-muted);font-size:.8rem;margin-top:-.4rem;}
.auth-card input{padding:.85rem 1rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:6px;color:var(--color-text);font-family:var(--font-body);}
.auth-card input:focus{outline:none;border-color:var(--color-accent);}
.auth-card button[type=submit]{padding:.9rem;background:var(--color-accent);border:none;border-radius:6px;color:var(--color-dark);font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-size:.72rem;cursor:pointer;font-family:var(--font-body);}
.auth-card button[type=submit]:disabled{opacity:.6;cursor:not-allowed;}
.auth-error{color:#ff4444;font-size:.78rem;min-height:1rem;}
.auth-close{position:absolute;top:.8rem;right:.8rem;background:transparent;border:none;color:var(--color-text-muted);font-size:1.1rem;cursor:pointer;}
`;
document.head.appendChild(style);

// Modal inyectado
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
    <div class="auth-error" id="authError"></div>
  </form>`;
document.body.appendChild(modal);

const openModal = () => modal.classList.add('open');
const closeModal = () => { modal.classList.remove('open'); $('#authError').textContent = ''; };

modal.querySelector('.auth-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

$('#authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Verificando...';
    const { error } = await supabase.auth.signInWithPassword({ email: $('#authEmail').value, password: $('#authPassword').value });
    btn.disabled = false; btn.textContent = 'Iniciar sesión';
    if (error) { $('#authError').textContent = 'Credenciales inválidas'; return; }
    location.reload();
});

// Pinta el enlace del footer según sesión
async function renderLinks() {
    const containers = document.querySelectorAll('[data-admin-link]');
    if (!containers.length) return;
    const { data: { session } } = await supabase.auth.getSession();
    containers.forEach(el => {
        el.innerHTML = '';
        if (session) {
            el.innerHTML = `
                <a href="admin.html" class="footer-admin-link">Panel admin</a>
                <a href="#" class="footer-admin-link" id="adminLogoutLink">Cerrar sesión</a>`;
            el.querySelector('#adminLogoutLink').addEventListener('click', async e => {
                e.preventDefault();
                await supabase.auth.signOut();
                location.reload();
            });
        } else {
            el.innerHTML = `<a href="#" class="footer-admin-link" id="adminLoginLink">Iniciar sesión (admin)</a>`;
            el.querySelector('#adminLoginLink').addEventListener('click', e => { e.preventDefault(); openModal(); });
        }
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderLinks);
else renderLinks();
})();