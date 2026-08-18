/* ============================================================
   ADMIN.JS — CEREBRO DEL PANEL DE ADMINISTRACIÓN (OPTIMIZADO)
   ============================================================ */

(function() {
    "use strict";

    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
    const STORAGE_BUCKET = C.supabase?.storageBucket || 'blog-images';

    // Lazy init de Supabase
    let supabaseClient = null;
    function getSupabase() {
        if (!supabaseClient) {
            supabaseClient = window.__supabaseShared || 
                (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        }
        return supabaseClient;
    }

    const $ = s => document.querySelector(s);
    const $$ = s => Array.from(document.querySelectorAll(s));

    // escapeHtml optimizado (sin crear div DOM)
    const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => escapeMap[m]);
    }
    
    function money(n) { 
        return new Intl.NumberFormat('es-MX', { 
            style: 'currency', currency: 'MXN', minimumFractionDigits: 0 
        }).format(n || 0); 
    }
    
    function fmtDate(d) { 
        return d ? new Date(d).toLocaleDateString('es-MX', { 
            day: '2-digit', month: 'short', year: 'numeric' 
        }) : ''; 
    }
    
    function toast(msg) { 
        const t = $('#adminToast'); 
        if (!t) return;
        t.textContent = msg; 
        t.classList.add('show'); 
        setTimeout(() => t.classList.remove('show'), 2500); 
    }

    let DATA = { 
        posts: [], comments: [], orders: [], coupons: [], 
        categories: [], likes: [], testimonials: [], 
        products: [], appointments: [], services: [], menuItems: [], ba: [], plans: [], classes: [], team: [], gallery: [] 
    };
    
    let editImagesArr = [];
    let ADMIN_ROLE = 'owner';

    const ICONS_SVG = {
        trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
        eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
        eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
        heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
        ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
    };

    const ICONS_FA = {
        trash: '<i class="fa-solid fa-trash-can"></i>',
        edit: '<i class="fa-solid fa-pen"></i>',
        eye: '<i class="fa-solid fa-eye"></i>',
        eyeOff: '<i class="fa-solid fa-eye-slash"></i>',
        heart: '<i class="fa-solid fa-heart"></i>',
        chat: '<i class="fa-solid fa-comment"></i>',
        check: '<i class="fa-solid fa-check"></i>',
        ban: '<i class="fa-solid fa-ban"></i>'
    };
    
    const USE_FONTAWESOME = true; 
    const ICONS = USE_FONTAWESOME ? ICONS_FA : ICONS_SVG;

    const PAGE_SIZE = 5;
    const pageState = { 
        posts: 1, comments: 1, orders: 1, coupons: 1, 
        testimonials: 1, products: 1, appointments: 1, services: 1, menuItems: 1, ba: 1, plans: 1, classes: 1, team: 1, gallery: 1 
    };

     function slicePage(arr, key) {
     const pages = Math.max(1, Math.ceil(arr.length / PAGE_SIZE));
     const cur = Math.min(Math.max(1, pageState[key] || 1), pages);
     pageState[key] = cur;
     const start = (cur - 1) * PAGE_SIZE;
     return arr.slice(start, start + PAGE_SIZE);
 }

    function pagerHTML(key, total) {
        const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const cur = pageState[key];
        if (pages <= 1) return '';
        return `<div class="admin-pager">
            <button class="admin-btn txt" data-page-key="${key}" data-page="${cur - 1}" ${cur === 1 ? 'disabled' : ''}>← Anterior</button>
            <span>Página ${cur} de ${pages} (${total} registros)</span>
            <button class="admin-btn txt" data-page-key="${key}" data-page="${cur + 1}" ${cur === pages ? 'disabled' : ''}>Siguiente →</button>
        </div>`;
    }

    // Event delegation para paginación
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-page-key]');
        if (!btn || btn.disabled) return;
        pageState[btn.dataset.pageKey] = Number(btn.dataset.page);
                if (btn.dataset.pageKey === 'menuItems' && typeof refreshMenuAdmin === 'function') {
            refreshMenuAdmin();
            return;
        }
        if (btn.dataset.pageKey === 'ba' && typeof refreshBAAdmin === 'function') {
            refreshBAAdmin();
            return;
        }
        if (btn.dataset.pageKey === 'plans' && typeof refreshPlansAdmin === 'function') {
            refreshPlansAdmin();
            return;
        }
        if (btn.dataset.pageKey === 'classes' && typeof refreshClassesAdmin === 'function') {
            refreshClassesAdmin();
            return;
        }
        if (btn.dataset.pageKey === 'team' && typeof refreshTeamAdmin === 'function') {
            refreshTeamAdmin();
            return;
        }
        if (btn.dataset.pageKey === 'gallery' && typeof refreshGalleryAdmin === 'function') {
            refreshGalleryAdmin();
            return;
        }
        renderAll();
    });

    function askConfirm({ title = '¿Estás seguro?', message = '', confirmText = 'Eliminar' } = {}) {
        return new Promise(resolve => {
            let modal = document.getElementById('adminConfirm');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'adminConfirm';
                modal.className = 'admin-confirm';
                modal.innerHTML = `<div class="admin-confirm-card">
                    <div class="admin-confirm-icon">⚠️</div>
                    <h3 id="adminConfirmTitle"></h3>
                    <p id="adminConfirmMsg"></p>
                    <div class="admin-confirm-actions">
                        <button class="admin-btn txt" id="adminConfirmCancel">Cancelar</button>
                        <button class="admin-btn txt danger-solid" id="adminConfirmOk"></button>
                    </div>
                </div>`;
                document.body.appendChild(modal);
                modal.querySelector('#adminConfirmCancel').addEventListener('click', () => close(false));
                modal.addEventListener('click', e => { if (e.target === modal) close(false); });
            }
            function close(val) { modal.classList.remove('open'); resolve(val); }
            
            modal.querySelector('#adminConfirmTitle').textContent = title;
            modal.querySelector('#adminConfirmMsg').textContent = message;
            const ok = modal.querySelector('#adminConfirmOk');
            ok.textContent = confirmText;
            ok.onclick = () => close(true);
            modal.classList.add('open');
        });
    }

    // Toolbar MD consolidada (una sola implementación)
    const MD_TOOLBAR_HTML = `<div class="md-toolbar">
        <button type="button" data-md="bold" title="Negrita"><b>N</b></button>
        <button type="button" data-md="italic" title="Cursiva"><i>C</i></button>
        <button type="button" data-md="h2" title="Subtítulo">H2</button>
        <button type="button" data-md="list" title="Lista">• Lista</button>
        <button type="button" data-md="quote" title="Cita">❝ Cita</button>
    </div>`;

    function attachMdToolbar(textarea) {
        const actions = {
            bold:   { before: '**', after: '**', ph: 'texto en negrita' },
            italic: { before: '*',  after: '*',  ph: 'texto en cursiva' },
            h2:     { line: '## ' },
            list:   { line: '- ' },
            quote:  { line: '> ' }
        };
        const scope = textarea.closest('form, .admin-editor-card, .new-post-inner, #serviceEditor');
        const toolbar = scope && scope.querySelector('.md-toolbar');
        if (!toolbar) return;
        
        toolbar.addEventListener('click', e => {
            const btn = e.target.closest('[data-md]');
            if (!btn) return;
            e.preventDefault();
            const a = actions[btn.dataset.md];
            const s = textarea.selectionStart, en = textarea.selectionEnd;
            const sel = textarea.value.slice(s, en) || (a.ph || 'texto');
            const insert = a.line ? ('\n' + a.line + sel) : (a.before + sel + a.after);
            textarea.setRangeText(insert, s, en, 'end');
            textarea.focus();
        });
    }

        async function initAuth() {
        try {
            const { data: { session } } = await getSupabase().auth.getSession();
            if (session) {
                try {
                    const { data: prof } = await getSupabase().from('profiles').select('role').eq('id', session.user.id).maybeSingle();
                    ADMIN_ROLE = prof?.role || 'owner';
                } catch (e) { ADMIN_ROLE = 'owner'; }
                showApp();
            }
            else $('#adminLogin').style.display = 'flex';
        } catch (e) {
            console.error('Error de autenticación:', e);
            toast('Error de conexión. Recarga la página.');
        }
    }

    $('#adminLoginForm').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true; btn.textContent = 'Verificando...';
        try {
            const { error } = await getSupabase().auth.signInWithPassword({ 
                email: $('#adminEmail').value, 
                password: $('#adminPassword').value 
            });
            btn.disabled = false; btn.textContent = 'Entrar';
            if (error) { $('#adminLoginError').textContent = 'Credenciales inválidas'; return; }
            try {
                const { data: { session } } = await getSupabase().auth.getSession();
                const { data: prof } = await getSupabase().from('profiles').select('role').eq('id', session.user.id).maybeSingle();
                ADMIN_ROLE = prof?.role || 'owner';
            } catch (e) { ADMIN_ROLE = 'owner'; }
            showApp();
        } catch (e) {
            btn.disabled = false; btn.textContent = 'Entrar';
            $('#adminLoginError').textContent = 'Error de conexión';
        }
    });

    $('#adminLogout').addEventListener('click', async () => { 
        try {
            await getSupabase().auth.signOut(); 
            location.reload(); 
        } catch (e) {
            toast('Error al cerrar sesión');
        }
    });

    async function showApp() {
    $('#adminLogin').style.display = 'none';
    $('#adminApp').hidden = false;
    mergeCotSettings(await loadCotSettings());
    applyAdminTabsVisibility();
    await loadAll();
    if (typeof refreshMenuAdmin === 'function') await refreshMenuAdmin();
    if (typeof refreshBAAdmin === 'function') await refreshBAAdmin();
    if (typeof refreshPlansAdmin === 'function') await refreshPlansAdmin();
    if (typeof refreshClassesAdmin === 'function') await refreshClassesAdmin();
    if (typeof refreshTeamAdmin === 'function') await refreshTeamAdmin();
    if (typeof refreshGalleryAdmin === 'function') await refreshGalleryAdmin();
    if (typeof refreshStoryAdmin === 'function') await refreshStoryAdmin();
    if (typeof refreshPhilosophyAdmin === 'function') await refreshPhilosophyAdmin();
    if (typeof refreshLocationAdmin === 'function') await refreshLocationAdmin();
    if (typeof refreshHeroAdmin === 'function') await refreshHeroAdmin();
    if (typeof refreshCollabAdmin === 'function') await refreshCollabAdmin();
    if (typeof refreshBusinessAdmin === 'function') await refreshBusinessAdmin();
    renderAll();
    fillCotForm();
    refreshCotBookings();
}

    // Carga selectiva: solo módulos activos
    async function loadAll() {
    const sb = getSupabase();
    const safe = (p) => p.then(r => r.data || []).catch(() => []);

    if (C.blog?.enabled !== false) {
        [DATA.posts, DATA.comments, DATA.categories, DATA.likes] = await Promise.all([
            safe(sb.from('posts').select('*').order('created_at', { ascending: false })),
            safe(sb.from('post_comments').select('*').order('created_at', { ascending: false })),
            safe(sb.from('categories').select('*').order('name')),
            safe(sb.from('post_likes').select('post_id'))
        ]);
    }
    if (C.ecommerce?.enabled !== false) {
        [DATA.orders, DATA.coupons, DATA.products] = await Promise.all([
            safe(sb.from('orders').select('*').order('created_at', { ascending: false })),
            safe(sb.from('coupons').select('*').order('created_at', { ascending: false })),
            safe(sb.from('products').select('*').order('created_at', { ascending: false }))
        ]);
    }
    if (C.testimonials?.enabled !== false) {
        DATA.testimonials = await safe(sb.from('testimonials').select('*').order('created_at', { ascending: false }));
    }
    if (C.appointments?.enabled === true) {
        DATA.appointments = await safe(sb.from('appointments').select('*').order('created_at', { ascending: false }));
    }
    if (C.services?.enabled !== false || C.services?.items?.length) {
        DATA.services = await safe(sb.from('services').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true }));
    }
}

    function renderAll() {
        renderDashboard();
        if (C.blog?.enabled !== false) {
            renderPosts();
            renderComments();
            renderCategories();
        }
        if (C.ecommerce?.enabled !== false) {
            renderOrders();
            renderCoupons();
            renderProductsAdmin();
        }
        if (C.testimonials?.enabled !== false) renderTestimonials();
        if (C.appointments?.enabled === true) renderAppointments();
        if (DATA.services.length || C.services?.enabled !== false) renderServicesAdmin();
    }

    const viewShortcut = $('#adminShortcut');
    
    function updateViewShortcut(view) {
        if (!viewShortcut) return;
        if (view === 'posts') {
            viewShortcut.href = 'blog.html';
            viewShortcut.textContent = 'Ver blog ↗';
            viewShortcut.hidden = false;
        } else if (view === 'products') {
            viewShortcut.href = 'tienda.html';
            viewShortcut.textContent = 'Ver tienda ↗';
            viewShortcut.hidden = false;
        } else {
            viewShortcut.hidden = true;
        }
    }

     $$('.admin-sidebar nav button').forEach(btn => {
     btn.addEventListener('click', () => {
         $$('.admin-sidebar nav button').forEach(b => b.classList.remove('active'));
         btn.classList.add('active');
         $$('.admin-view').forEach(v => v.classList.remove('active'));
         $('#view-' + btn.dataset.view).classList.add('active');
         updateViewShortcut(btn.dataset.view);
         if (btn.dataset.view === 'menu' && typeof refreshMenuAdmin === 'function') refreshMenuAdmin();
         if (btn.dataset.view === 'beforeafter' && typeof refreshBAAdmin === 'function') refreshBAAdmin();
         if (btn.dataset.view === 'plans' && typeof refreshPlansAdmin === 'function') refreshPlansAdmin();
         if (btn.dataset.view === 'classes' && typeof refreshClassesAdmin === 'function') refreshClassesAdmin();
         if (btn.dataset.view === 'team' && typeof refreshTeamAdmin === 'function') refreshTeamAdmin();
         if (btn.dataset.view === 'gallery' && typeof refreshGalleryAdmin === 'function') refreshGalleryAdmin();
         if (btn.dataset.view === 'story' && typeof refreshStoryAdmin === 'function') refreshStoryAdmin();
         if (btn.dataset.view === 'philosophy' && typeof refreshPhilosophyAdmin === 'function') refreshPhilosophyAdmin();
         if (btn.dataset.view === 'location' && typeof refreshLocationAdmin === 'function') refreshLocationAdmin();
         if (btn.dataset.view === 'hero' && typeof refreshHeroAdmin === 'function') refreshHeroAdmin();
         if (btn.dataset.view === 'collab' && typeof refreshCollabAdmin === 'function') refreshCollabAdmin();
         if (btn.dataset.view === 'business' && typeof refreshBusinessAdmin === 'function') refreshBusinessAdmin();
     });
 });
    updateViewShortcut('dashboard');

    function applyAdminTabsVisibility() {
    const rules = {
        posts:        !!C.blog         && (C.blog.adminTab         ?? C.blog.enabled)         !== false,
        categories:   !!C.blog         && (C.blog.adminTab         ?? C.blog.enabled)         !== false,
        comments:     !!C.blog         && (C.blog.adminTab         ?? C.blog.enabled)         !== false,
        products:     !!C.ecommerce    && (C.ecommerce.adminTab    ?? C.ecommerce.enabled)    !== false,
        orders:       !!C.ecommerce    && (C.ecommerce.adminTab    ?? C.ecommerce.enabled)    !== false,
        coupons:      !!C.ecommerce    && (C.ecommerce.adminTab    ?? C.ecommerce.enabled)    !== false,
        testimonials: !!C.testimonials && (C.testimonials.adminTab ?? C.testimonials.enabled) !== false,
        appointments: !!C.appointments && (C.appointments.adminTab ?? C.appointments.enabled) !== false,
        cotizador:    !!C.cotizador    && (C.cotizador.adminTab    ?? C.cotizador.enabled)    !== false,
        menu:         !!C.menu         && (C.menu.adminTab         ?? C.menu.enabled)         !== false,
        beforeafter:  !!C.beforeafter  && (C.beforeafter.adminTab  ?? C.beforeafter.enabled)  !== false,
        plans:        !!C.plans        && (C.plans.adminTab        ?? C.plans.enabled)        !== false,
        classes:      !!C.classes      && (C.classes.adminTab      ?? C.classes.enabled)      !== false,
        team:         !!C.team         && (C.team.adminTab         ?? C.team.enabled)         !== false,
        gallery:      !!C.gallery      && (C.gallery.adminTab      ?? C.gallery.enabled)      !== false,
        story:        !!C.story        && (C.story.adminTab        ?? C.story.enabled)        !== false,
        philosophy:   !!C.philosophy   && (C.philosophy.adminTab   ?? C.philosophy.enabled)   !== false,
        location:     !!C.location     && (C.location.adminTab     ?? C.location.enabled)     !== false,
        hero:         !!C.hero         && (C.hero.adminTab         ?? C.hero.enabled)         !== false,
        collab:       !!C.collab       && (C.collab.adminTab       ?? C.collab.enabled)       !== false,
        business:     !!C.business     && (C.business.adminTab     ?? true)                   !== false,
        season:       !!C.season       && (C.season.adminTab       ?? C.season.enabled)       !== false,
    };
    
    Object.entries(rules).forEach(([view, visible]) => {
        const btn = document.querySelector(`.admin-sidebar nav button[data-view="${view}"]`);
        if (btn) btn.style.display = visible ? '' : 'none';
        // Si el módulo está apagado, también apaga su vista por seguridad
        const vista = document.getElementById('view-' + view);
        if (vista && !visible) vista.classList.remove('active');
    });
    // Si la pestaña activa quedó oculta, regresa al Dashboard
    const activeBtn = document.querySelector('.admin-sidebar nav button.active');
    if (activeBtn && activeBtn.style.display === 'none') {
        document.querySelector('.admin-sidebar nav button[data-view="dashboard"]')?.click();
    }
    if (typeof applyRoleRestrictions === 'function') applyRoleRestrictions();
}


    function renderDashboard() {
        const stats = [];

        if (C.blog?.enabled !== false) {
            stats.push(
                { n: DATA.posts.length, l: 'Posts' },
                { n: DATA.posts.filter(p => p.status === 'published').length, l: 'Publicados' },
                { n: DATA.comments.length, l: 'Comentarios' },
                { n: DATA.likes.length, l: 'Likes' }
            );
        }

        if (C.ecommerce?.enabled !== false) {
            const pending = DATA.orders.filter(o => o.status === 'pending').length;
            const revenue = DATA.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total || 0), 0);
            stats.push(
                { n: DATA.products.length, l: 'Productos' },
                { n: DATA.orders.length, l: 'Órdenes' },
                { n: pending, l: 'Pendientes' },
                { n: money(revenue), l: 'Ventas' },
                { n: DATA.coupons.length, l: 'Cupones' }
            );
        }

        if (C.testimonials?.enabled !== false) {
            stats.push({ n: DATA.testimonials.length, l: 'Testimonios' });
        }

        if (!!C.menu && C.menu.enabled !== false) {
            stats.push({ n: (DATA.menuItems || []).filter(m => m.is_active).length, l: 'Platillos' });
        }

        if (!!C.beforeafter && C.beforeafter.enabled !== false) {
            stats.push({ n: (DATA.ba || []).filter(x => x.is_active).length, l: 'Resultados' });
        }

        if (!!C.plans && C.plans.enabled !== false) {
            stats.push({ n: (DATA.plans || []).filter(p => p.is_active).length, l: 'Planes' });
        }

        if (!!C.classes && C.classes.enabled !== false) {
            stats.push({ n: (DATA.classes || []).filter(c => c.is_active).length, l: 'Clases' });
        }

        if (!!C.team && C.team.enabled !== false) {
            stats.push({ n: (DATA.team || []).filter(x => x.is_active).length, l: 'Equipo' });
        }

        if (!!C.gallery && C.gallery.enabled !== false) {
            stats.push({ n: (DATA.gallery || []).filter(g => g.is_active).length, l: 'Galería' });
        }

        if (C.appointments?.enabled === true) {
            stats.push({ n: (DATA.appointments || []).filter(a => a.status === 'pending').length, l: 'Citas pend.' });
        }

        $('#adminStats').innerHTML = stats.map(s =>
            `<div class="admin-stat"><div class="num">${s.n}</div><div class="lbl">${s.l}</div></div>`
        ).join('') || '<p class="admin-empty">Sin módulos activos</p>';
        renderDashboardMetrics();
    }

    function renderAppointments() {
        const el = $('#appointmentsTable');
        if (!el) return;
        if (!DATA.appointments.length) { el.innerHTML = '<p class="admin-empty">Sin solicitudes de cita</p>'; return; }
        
        el.innerHTML = `<table class="admin-table"><thead><tr>
            <th>Recibida</th><th>Nombre</th><th>WhatsApp</th><th>Cita</th><th>Motivo</th><th>Estado</th><th>Acciones</th>
        </tr></thead><tbody>` + slicePage(DATA.appointments, 'appointments').map(a => `<tr>
            <td class="cell-date">${fmtDate(a.created_at)}</td>
            <td><span class="cell-author">${escapeHtml(a.name)}</span></td>
            <td><a href="https://wa.me/${escapeHtml((a.phone || '').replace(/\D/g, ''))}" target="_blank" rel="noopener" style="color:var(--color-accent)">${escapeHtml(a.phone)}</a></td>
            <td class="cell-muted"><span class="appt-date">${escapeHtml(a.date)}</span><span class="appt-slot">${escapeHtml(a.slot)}</span></td>
            <td><span class="cell-clamp">${escapeHtml(a.reason || '—')}</span></td>
            <td><select class="admin-select" data-appt="${a.id}">
                ${['pending', 'confirmed', 'cancelled'].map(s => `<option value="${s}" ${a.status === s ? 'selected' : ''}>${s === 'pending' ? 'Pendiente' : s === 'confirmed' ? 'Confirmada' : 'Cancelada'}</option>`).join('')}
            </select></td>
            <td class="cell-actions">
                <button class="admin-btn danger" data-delappt="${a.id}" title="Eliminar">${ICONS.trash}</button>
            </td>
        </tr>`).join('') + `</tbody></table>` + pagerHTML('appointments', DATA.appointments.length);

        // Event delegation
        el.addEventListener('change', async e => {
            const sel = e.target.closest('select[data-appt]');
            if (!sel) return;
            const { error } = await getSupabase().from('appointments').update({ status: sel.value }).eq('id', sel.dataset.appt);
            toast(error ? 'Error al actualizar' : 'Cita actualizada');
            if (!error) { await loadAll(); renderDashboard(); renderAppointments(); }
        });
        
        el.addEventListener('click', async e => {
            const btn = e.target.closest('[data-delappt]');
            if (!btn) return;
            if (!await askConfirm({ title: 'Eliminar cita', message: 'Esta acción no se puede deshacer.' })) return;
            const { error } = await getSupabase().from('appointments').delete().eq('id', btn.dataset.delappt);
            toast(error ? 'Error al eliminar' : 'Cita eliminada');
            if (!error) { await loadAll(); renderAppointments(); }
        });
    }

    function renderPosts() {
        const el = $('#postsTable');
        if (!DATA.posts.length) { el.innerHTML = '<p class="admin-empty">Sin posts todavía</p>'; return; }
        const likes = {}, coms = {};
        DATA.likes.forEach(l => likes[l.post_id] = (likes[l.post_id] || 0) + 1);
        DATA.comments.forEach(c => coms[c.post_id] = (coms[c.post_id] || 0) + 1);

        el.innerHTML = `<table class="admin-table"><thead><tr>
            <th>Título</th><th>Categoría</th><th>Estado</th><th>Interacción</th><th>Fecha</th><th>Acciones</th>
        </tr></thead><tbody>` + slicePage(DATA.posts, 'posts').map(p => `<tr>
            <td class="cell-title"><span class="t">${escapeHtml(p.title)}</span></td>
            <td>${escapeHtml(p.category)}</td>
            <td><span class="badge ${p.status === 'published' ? 'published' : 'draft'}">${p.status === 'published' ? 'Publicado' : 'Borrador'}</span></td>
            <td>
                <span class="interact">${ICONS.heart}${likes[p.id] || 0}</span>
                <span class="interact">${ICONS.chat}${coms[p.id] || 0}</span>
            </td>
            <td class="cell-date">${fmtDate(p.created_at)}</td>
            <td class="cell-actions">
                <button class="admin-btn" data-edit="${p.id}" title="Editar">${ICONS.edit}</button>
                <button class="admin-btn" data-toggle="${p.id}" title="${p.status === 'published' ? 'Ocultar' : 'Publicar'}">${p.status === 'published' ? ICONS.eyeOff : ICONS.eye}</button>
                <button class="admin-btn danger" data-delpost="${p.id}" title="Eliminar">${ICONS.trash}</button>
            </td>
        </tr>`).join('') + `</tbody></table>` + pagerHTML('posts', DATA.posts.length);

        // Event delegation
        el.addEventListener('click', async e => {
            const editBtn = e.target.closest('[data-edit]');
            const toggleBtn = e.target.closest('[data-toggle]');
            const delBtn = e.target.closest('[data-delpost]');
            
            if (editBtn) {
                openPostEditor(editBtn.dataset.edit);
            } else if (toggleBtn) {
                const post = DATA.posts.find(p => String(p.id) === String(toggleBtn.dataset.toggle));
                const newStatus = post.status === 'published' ? 'draft' : 'published';
                const { error } = await getSupabase().from('posts').update({ status: newStatus }).eq('id', post.id);
                toast(error ? 'Error al actualizar' : (newStatus === 'published' ? 'Post publicado' : 'Post ocultado'));
                if (!error) { await loadAll(); renderAll(); }
            } else if (delBtn) {
                const postDel = DATA.posts.find(x => String(x.id) === String(delBtn.dataset.delpost));
                if (!await askConfirm({ title: 'Eliminar post', message: `Se eliminará "${postDel ? postDel.title : ''}" junto con sus comentarios y likes.` })) return;
                const { error } = await getSupabase().from('posts').delete().eq('id', delBtn.dataset.delpost);
                toast(error ? 'Error al eliminar' : 'Post eliminado');
                if (!error) { await loadAll(); renderAll(); }
            }
        });
    }

    function renderComments() {
        const el = $('#commentsTable');
        if (!DATA.comments.length) { el.innerHTML = '<p class="admin-empty">Sin comentarios</p>'; return; }
        el.innerHTML = `<table class="admin-table"><thead><tr>
            <th>Autor</th><th>Comentario</th><th>Post</th><th>Fecha</th><th>Acciones</th>
        </tr></thead><tbody>` + slicePage(DATA.comments, 'comments').map(c => {
            const post = DATA.posts.find(p => p.id === c.post_id);
            return `<tr>
                <td><span class="cell-author">${escapeHtml(c.author)}</span></td>
                <td><span class="cell-clamp">${escapeHtml(c.content)}</span></td>
                <td><span class="cell-muted">${escapeHtml(post ? post.title : '—')}</span></td>
                <td class="cell-date">${fmtDate(c.created_at)}</td>
                <td class="cell-actions">
                    <button class="admin-btn danger" data-delcom="${c.id}" title="Eliminar">${ICONS.trash}</button>
                </td>
            </tr>`;
        }).join('') + `</tbody></table>` + pagerHTML('comments', DATA.comments.length);

        el.addEventListener('click', async e => {
            const btn = e.target.closest('[data-delcom]');
            if (!btn) return;
            if (!await askConfirm({ title: 'Eliminar comentario', message: 'Esta acción no se puede deshacer.' })) return;
            const { error } = await getSupabase().from('post_comments').delete().eq('id', btn.dataset.delcom);
            toast(error ? 'Error al eliminar' : 'Comentario eliminado');
            if (!error) { await loadAll(); renderAll(); }
        });
    }

    function renderCategories() {
        const el = $('#categoriesTable');
        if (!DATA.categories.length) { el.innerHTML = '<p class="admin-empty">Sin categorías</p>'; return; }
        el.innerHTML = `<table class="admin-table"><thead><tr>
            <th>Nombre</th><th>Slug</th><th>Acciones</th>
        </tr></thead><tbody>` + DATA.categories.map(c => `<tr>
            <td><span class="cell-author">${escapeHtml(c.name)}</span></td>
            <td><span class="cell-muted">/${escapeHtml(c.slug)}</span></td>
            <td class="cell-actions">
                <button class="admin-btn danger" data-delcat="${c.id}" title="Eliminar">${ICONS.trash}</button>
            </td>
        </tr>`).join('') + `</tbody></table>`;

        el.addEventListener('click', async e => {
            const btn = e.target.closest('[data-delcat]');
            if (!btn) return;
            if (!await askConfirm({ title: 'Eliminar categoría', message: 'Los posts existentes conservarán su categoría actual.' })) return;
            await getSupabase().from('categories').delete().eq('id', btn.dataset.delcat);
            await loadAll(); renderCategories(); toast('Categoría eliminada');
        });
    }

    $('#categoryForm').addEventListener('submit', async e => {
        e.preventDefault();
        const name = $('#categoryName').value.trim();
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        const { error } = await getSupabase().from('categories').insert([{ name, slug }]);
        toast(error ? 'Error: ' + error.message : 'Categoría agregada');
        if (!error) { e.target.reset(); await loadAll(); renderCategories(); }
    });

    // Upload con timeout
    async function uploadFile(file, prefix, timeoutMs = 30000) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const uploadPromise = getSupabase().storage.from(STORAGE_BUCKET).upload(fileName, file);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout: la subida tardó demasiado')), timeoutMs)
        );
        
        try {
            const { error } = await Promise.race([uploadPromise, timeoutPromise]);
            if (error) { toast('Error al subir imagen: ' + error.message); return null; }
            return getSupabase().storage.from(STORAGE_BUCKET).getPublicUrl(fileName).data.publicUrl;
        } catch (e) {
            toast('Error: ' + e.message);
            return null;
        }
    }

    // Renderizado de imágenes consolidado
    function renderImageList(containerId, imagesArr, removeHandler) {
        const el = $(`#${containerId}`);
        if (!el) return;
        el.innerHTML = imagesArr.map((url, i) => `
            <div class="admin-editor-img">
                <img src="${url}" alt="Imagen ${i + 1}">
                <button type="button" data-rmimg="${i}" aria-label="Quitar imagen">✕</button>
            </div>`).join('');
        el.addEventListener('click', e => {
            const btn = e.target.closest('[data-rmimg]');
            if (btn) removeHandler(+btn.dataset.rmimg);
        });
    }

    function renderEditImages() {
        renderImageList('editImages', editImagesArr, idx => {
            editImagesArr.splice(idx, 1);
            renderEditImages();
        });
    }

    function openPostEditor(id) {
        const p = id ? DATA.posts.find(x => String(x.id) === String(id)) : null;
        $('#postEditor .admin-editor-head h3').textContent = p ? 'Editar Post' : 'Nuevo Post';
        $('#editPostId').value = p ? p.id : '';
        $('#editTitle').value = p?.title || '';
        $('#editSubtitle').value = p?.subtitle || '';
        $('#editAuthor').value = p?.author || '';
        $('#editExcerpt').value = p?.excerpt || '';
        $('#editContent').value = p?.content || '';
        $('#editStatus').value = p?.status || 'published';

        const cats = DATA.categories.length ? DATA.categories : [{ name: 'historias', slug: 'historias' }];
        $('#editCategory').innerHTML = cats.map(c =>
            `<option value="${escapeHtml(c.slug)}" ${p && c.slug === p.category ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

        editImagesArr = [...(p?.images || [])];
        renderEditImages();
        $('#postEditor').classList.add('open');
    }

    $('#postEditorClose').addEventListener('click', () => $('#postEditor').classList.remove('open'));
    $('#newPostAdminBtn').addEventListener('click', () => openPostEditor(null));

    $('#editAddCover').addEventListener('click', async () => {
     const choice = await askImageSource();
     if (!choice) return;
     if (choice === 'file') { $('#editCoverInput').click(); return; }
     if (choice.url) { editImagesArr.push(choice.url); renderEditImages(); toast('Portada agregada ✅'); }
 });
    $('#editCoverInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'cover');
        if (url) { editImagesArr.push(url); renderEditImages(); toast('Imagen agregada'); }
        e.target.value = '';
    });

    $('#editInsertImage').addEventListener('click', async () => {
     const choice = await askImageSource();
     if (!choice) return;
     if (choice === 'file') { $('#editImageInput').click(); return; }
     if (choice.url) {
         const ta = $('#editContent');
         const token = `\n\n{{img:${choice.url}}}\n\n`;
         const pos = ta.selectionStart || ta.value.length;
         ta.value = ta.value.slice(0, pos) + token + ta.value.slice(pos);
         toast('Imagen insertada en el contenido ✅');
     }
 });
    $('#editImageInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'content');
        if (url) {
            const ta = $('#editContent');
            const token = `\n\n{{img:${url}}}\n\n`;
            const pos = ta.selectionStart || ta.value.length;
            ta.value = ta.value.slice(0, pos) + token + ta.value.slice(pos);
            toast('Imagen insertada en el contenido');
        }
        e.target.value = '';
    });

    const editTa = $('#editContent');
    if (editTa) { editTa.insertAdjacentHTML('beforebegin', MD_TOOLBAR_HTML); attachMdToolbar(editTa); }

    $('#postEditorForm').addEventListener('submit', async e => {
        e.preventDefault();
        const id = $('#editPostId').value;
        if (!editImagesArr.length) { toast('Sube al menos una imagen de portada'); return; }

        const btn = $('#postEditorForm .admin-editor-save');
        const originalText = btn.textContent;
        btn.disabled = true; btn.textContent = 'Guardando...';

        const payload = {
            title: $('#editTitle').value.trim(),
            subtitle: $('#editSubtitle').value.trim() || null,
            category: $('#editCategory').value,
            author: $('#editAuthor').value.trim(),
            excerpt: $('#editExcerpt').value.trim() || null,
            content: $('#editContent').value,
            status: $('#editStatus').value,
            images: editImagesArr,
            updated_at: new Date().toISOString()
        };

        const { error } = id
            ? await getSupabase().from('posts').update(payload).eq('id', id)
            : await getSupabase().from('posts').insert([{ ...payload, created_at: new Date().toISOString() }]);

        btn.disabled = false; btn.textContent = originalText;
        if (error) { toast('Error: ' + error.message); return; }
        toast(id ? 'Post actualizado' : '✅ Post creado y publicado');
        $('#postEditor').classList.remove('open');
        await loadAll();
        renderAll();
    });

    const catQuickToggle = $('#catQuickToggle');
    const catQuickForm = $('#catQuickForm');
    const catQuickName = $('#catQuickName');
    const catQuickSave = $('#catQuickSave');

    function refreshCategorySelect(selectSlug) {
        $('#editCategory').innerHTML = DATA.categories.map(c =>
            `<option value="${escapeHtml(c.slug)}" ${c.slug === selectSlug ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
        ).join('');
    }

    if (catQuickToggle && catQuickForm) {
        catQuickToggle.addEventListener('click', () => {
            catQuickForm.hidden = !catQuickForm.hidden;
            if (!catQuickForm.hidden) catQuickName.focus();
        });
        catQuickSave.addEventListener('click', async () => {
            const name = catQuickName.value.trim().toLowerCase();
            if (!name) { toast('Escribe un nombre de categoría'); return; }
            const slug = name.replace(/\s+/g, '-');
            if (DATA.categories.some(c => c.slug === slug)) { toast('Esa categoría ya existe'); return; }
            const { error } = await getSupabase().from('categories').insert([{ name, slug }]);
            if (error) { toast('Error: ' + error.message); return; }
            await loadAll();               
            refreshCategorySelect(slug);   
            catQuickName.value = '';
            catQuickForm.hidden = true;
            toast('Categoría creada y seleccionada ✅');
        });
        catQuickName.addEventListener('keypress', e => {
            if (e.key === 'Enter') { e.preventDefault(); catQuickSave.click(); }
        });
    }

    function renderOrders() {
        const el = $('#ordersTable');
        if (!DATA.orders.length) { el.innerHTML = '<p class="admin-empty">Sin órdenes todavía</p>'; return; }
        el.innerHTML = `<table class="admin-table"><thead><tr>
            <th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Items</th>
        </tr></thead><tbody>` + slicePage(DATA.orders, 'orders').map(o => `<tr>
            <td>${fmtDate(o.created_at)}</td>
            <td>${escapeHtml(o.customer_name || '—')}</td>
            <td>${money(o.total)}</td>
            <td><select class="admin-select" data-order="${o.id}">
                ${['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s =>
                    `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select></td>
            <td><div class="admin-items">${(o.items || []).map(i =>
                `${escapeHtml(i.name)}${i.variant ? ' (' + escapeHtml(i.variant) + ')' : ''} ×${i.qty}`).join('<br>')}</div></td>
        </tr>`).join('') + `</tbody></table>` + pagerHTML('orders', DATA.orders.length);

        el.addEventListener('change', async e => {
            const sel = e.target.closest('select[data-order]');
            if (!sel) return;
            const { error } = await getSupabase().from('orders').update({ status: sel.value }).eq('id', sel.dataset.order);
            toast(error ? 'Error al actualizar' : 'Estado actualizado');
            if (!error) { await loadAll(); renderDashboard(); }
        });
    }

    function renderCoupons() {
        const el = $('#couponsTable');
        if (!DATA.coupons.length) { el.innerHTML = '<p class="admin-empty">Sin cupones</p>'; return; }
        el.innerHTML = `<table class="admin-table"><thead><tr>
            <th>Código</th><th>Tipo</th><th>Valor</th><th>Vence</th><th>Popup</th><th>Estado</th><th>Acciones</th>
        </tr></thead><tbody>` + slicePage(DATA.coupons, 'coupons').map(c => `<tr>
            <td><span class="coupon-code">${escapeHtml(c.code)}</span></td>
            <td class="cell-muted">${c.type === 'percent' ? 'Porcentaje' : 'Fijo'}</td>
            <td class="cell-value">${c.type === 'percent' ? c.value + '%' : money(c.value)}</td>
            <td class="cell-date">${c.valid_until ? fmtDate(c.valid_until) : 'Sin límite'}</td>
            <td>${c.show_in_popup ? '<span class="badge confirmed">📣 Sí</span>' : '<span class="badge draft">No</span>'}</td>
            <td><span class="badge ${c.is_active ? 'published' : 'draft'}">${c.is_active ? 'Activo' : 'Inactivo'}</span></td>
            <td class="cell-actions">
                <button class="admin-btn" data-togcoupon="${c.id}" title="${c.is_active ? 'Desactivar' : 'Activar'}">${c.is_active ? ICONS.ban : ICONS.check}</button>
                <button class="admin-btn danger" data-delcoupon="${c.id}" title="Eliminar">${ICONS.trash}</button>
            </td>
        </tr>`).join('') + `</tbody></table>` + pagerHTML('coupons', DATA.coupons.length);
        
        el.addEventListener('click', async e => {
            const toggleBtn = e.target.closest('[data-togcoupon]');
            const delBtn = e.target.closest('[data-delcoupon]');
            
            if (toggleBtn) {
                const cup = DATA.coupons.find(c => String(c.id) === String(toggleBtn.dataset.togcoupon));
                await getSupabase().from('coupons').update({ is_active: !cup.is_active }).eq('id', cup.id);
                await loadAll(); renderCoupons(); toast('Cupón actualizado');
            } else if (delBtn) {
                if (!await askConfirm({ title: 'Eliminar cupón', message: 'El código dejará de funcionar y desaparecerá del popup inmediatamente.' })) return;
                await getSupabase().from('coupons').delete().eq('id', delBtn.dataset.delcoupon);
                await loadAll(); renderCoupons(); toast('Cupón eliminado');
            }
        });
    }

    $('#couponForm').addEventListener('submit', async e => {
        e.preventDefault();
        const code = $('#couponCode').value.trim().toUpperCase();
        const until = $('#couponUntil').value ? new Date($('#couponUntil').value).toISOString() : null;
        const { error } = await getSupabase().from('coupons').insert([{
            code, type: $('#couponType').value, value: Number($('#couponValue').value), valid_until: until,
            title: $('#couponTitle').value.trim() || null,
            subtitle: $('#couponSubtitle').value.trim() || null,
            description: $('#couponDesc').value.trim() || null,
            badge: $('#couponBadge').value.trim() || '🔥 OFERTA',
            accent: $('#couponAccent').value,
            show_in_popup: $('#couponPopup').checked
        }]);
        toast(error ? 'Error: ' + error.message : 'Cupón creado');
        if (!error) { e.target.reset(); $('#couponBadge').value = '🔥 OFERTA'; await loadAll(); renderCoupons(); if (couponEditorCtl) couponEditorCtl.close(); }
    });

    let prodImagesArr = [];
    let prodVariantsArr = [];
    let currentVariantIdx = -1;
    function escAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }

    function renderProductsAdmin() {
        const el = $('#productsTable');
        if (!el) return;
        if (!DATA.products.length) { el.innerHTML = '<p class="admin-empty">Sin productos en la BD. Crea el primero con "＋ Nuevo producto".</p>'; return; }
        const rows = slicePage(DATA.products, 'products');
        el.innerHTML = `<table class="admin-table"><thead><tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>` +
            rows.map(p => `<tr>
                <td class="cell-title"><span class="t">${escapeHtml(p.name)}</span></td>
                <td>${escapeHtml(p.category)}</td>
                <td class="cell-value">${money(p.price)}</td>
                <td><span class="badge ${p.is_active ? 'published' : 'draft'}">${p.is_active ? 'Activo' : 'Oculto'}</span></td>
                <td class="cell-actions">
                    <button class="admin-btn" data-prodedit="${p.id}" title="Editar">${ICONS.edit}</button>
                    <button class="admin-btn" data-prodtoggle="${p.id}" title="${p.is_active ? 'Ocultar' : 'Activar'}">${p.is_active ? ICONS.eyeOff : ICONS.eye}</button>
                    <button class="admin-btn danger" data-proddel="${p.id}" title="Eliminar">${ICONS.trash}</button>
                </td></tr>`).join('') + `</tbody></table>` + pagerHTML('products', DATA.products.length);
        
        el.addEventListener('click', async e => {
            const editBtn = e.target.closest('[data-prodedit]');
            const toggleBtn = e.target.closest('[data-prodtoggle]');
            const delBtn = e.target.closest('[data-proddel]');
            
            if (editBtn) {
                openProductEditor(+editBtn.dataset.prodedit);
            } else if (toggleBtn) {
                const p = DATA.products.find(x => String(x.id) === String(toggleBtn.dataset.prodtoggle));
                await getSupabase().from('products').update({ is_active: !p.is_active }).eq('id', p.id);
                toast('Producto actualizado'); await loadAll(); renderProductsAdmin();
            } else if (delBtn) {
                const p = DATA.products.find(x => String(x.id) === String(delBtn.dataset.proddel));
                if (!await askConfirm({ title: 'Eliminar producto', message: `Se eliminará "${p.name}" de la tienda de forma permanente.` })) return;
                const { error } = await getSupabase().from('products').delete().eq('id', p.id);
                toast(error ? 'Error al eliminar' : 'Producto eliminado');
                if (!error) { await loadAll(); renderAll(); }
            }
        });
    }

    function renderProdImages() {
        const el = $('#prodImages');
        el.innerHTML = prodImagesArr.map((url, i) => `
            <div class="admin-editor-img">
                <img src="${url}" alt="Portada ${i + 1}">
                <span class="img-number">${i + 1}</span>
                <button type="button" data-rm="${i}" aria-label="Quitar imagen">✕</button>
            </div>`).join('');
        el.addEventListener('click', e => {
            const btn = e.target.closest('[data-rm]');
            if (!btn) return;
            prodImagesArr.splice(+btn.dataset.rm, 1);
            prodVariantsArr.forEach(v => {
                if (v.image && !prodImagesArr.includes(v.image)) v.image = prodImagesArr[0] || '';
            });
            renderProdImages(); renderProdVariants();
        });
    }

    function renderProdVariants() {
        const wrap = $('#prodVariants');
        if (!prodImagesArr.length) {
            wrap.innerHTML = '<p class="admin-empty">Primero sube al menos una imagen de portada para asignarla a las variantes.</p>';
            return;
        }
        wrap.innerHTML = prodVariantsArr.map((v, i) => {
            const coverIndex = prodImagesArr.indexOf(v.image);
            return `
            <div class="admin-variant-row">
                <input class="v-name" value="${escAttr(v.name || '')}" placeholder="Nombre variante">
                <input class="v-price" type="number" min="0" value="${Number(v.price) || 0}">
                <select class="v-imgsel" title="Foto de esta variante">
                    ${coverIndex === -1 ? '<option value="-1" selected>— Elige portada —</option>' : ''}
                    ${prodImagesArr.map((url, ci) => `<option value="${ci}" ${coverIndex === ci ? 'selected' : ''}>🖼️ Portada ${ci + 1}</option>`).join('')}
                </select>
                <label class="admin-check"><input type="checkbox" class="v-stock" ${v.inStock ? 'checked' : ''}> Stock</label>
                <button type="button" class="admin-btn danger v-del" title="Quitar">${ICONS.trash}</button>
            </div>`;
        }).join('') || '<p class="admin-empty">Sin variantes (se usará precio único).</p>';

        // Event delegation para variantes
        wrap.addEventListener('input', e => {
            const idx = [...wrap.querySelectorAll('.admin-variant-row')].indexOf(e.target.closest('.admin-variant-row'));
            if (idx === -1) return;
            if (e.target.classList.contains('v-name')) prodVariantsArr[idx].name = e.target.value;
            else if (e.target.classList.contains('v-price')) prodVariantsArr[idx].price = Number(e.target.value) || 0;
        });
        wrap.addEventListener('change', e => {
            const idx = [...wrap.querySelectorAll('.admin-variant-row')].indexOf(e.target.closest('.admin-variant-row'));
            if (idx === -1) return;
            if (e.target.classList.contains('v-stock')) prodVariantsArr[idx].inStock = e.target.checked;
            else if (e.target.classList.contains('v-imgsel')) {
                const imgIdx = Number(e.target.value);
                if (imgIdx >= 0) prodVariantsArr[idx].image = prodImagesArr[imgIdx];
            }
        });
        wrap.addEventListener('click', e => {
            const btn = e.target.closest('.v-del');
            if (!btn) return;
            const idx = [...wrap.querySelectorAll('.admin-variant-row')].indexOf(btn.closest('.admin-variant-row'));
            if (idx !== -1) { prodVariantsArr.splice(idx, 1); renderProdVariants(); }
        });
    }

    function openProductEditor(id) {
        const p = id ? DATA.products.find(x => String(x.id) === String(id)) : null;
        $('#productEditorTitle').textContent = p ? 'Editar producto' : 'Nuevo producto';
        $('#prodId').value = p ? p.id : '';
        $('#prodName').value = p?.name || '';
        $('#prodCategory').value = p?.category || 'destacado';
        $('#prodBadge').value = p?.badge || '';
        $('#prodPrice').value = p?.price ?? '';
        $('#prodPriceOrig').value = p?.original_price ?? '';
        $('#prodDesc').value = p?.description || '';
        $('#prodFeatures').value = (p?.features || []).join('\n');
        $('#prodActive').checked = p ? p.is_active : true;
        prodImagesArr = [...(p?.images || [])];
        prodVariantsArr = (p?.variants || []).map(v => ({ ...v }));
        renderProdImages(); renderProdVariants();
        $('#productEditor').classList.add('open');
    }

    $('#productEditorClose').addEventListener('click', () => $('#productEditor').classList.remove('open'));
    $('#newProductBtn').addEventListener('click', () => openProductEditor(null));
    
    $('#prodAddImg').addEventListener('click', async () => {
     const choice = await askImageSource();
     if (!choice) return;
     if (choice === 'file') { $('#prodImgInput').click(); return; }
     if (choice.url) { prodImagesArr.push(choice.url); renderProdImages(); toast('Imagen agregada ✅'); }
 });
    $('#prodImgInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'producto');
        if (url) { prodImagesArr.push(url); renderProdImages(); }
    });
    
    $('#prodAddVariant').addEventListener('click', () => {
        if (!prodImagesArr.length) { toast('Primero sube una imagen de portada'); return; }
        const auto = prodImagesArr[prodVariantsArr.length % prodImagesArr.length];
        prodVariantsArr.push({ name: '', price: 0, image: auto, inStock: true });
        renderProdVariants();
    });
    
    $('#prodVarImgInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file || currentVariantIdx < 0) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'variante');
        if (url) { prodVariantsArr[currentVariantIdx].image = url; renderProdVariants(); toast('Imagen agregada'); }
    });
    
    $('#productEditorForm').addEventListener('submit', async e => {
        e.preventDefault();
        const id = $('#prodId').value;
        const payload = {
            name: $('#prodName').value.trim(),
            category: $('#prodCategory').value.trim() || 'destacado',
            badge: $('#prodBadge').value.trim() || null,
            price: Number($('#prodPrice').value) || 0,
            original_price: Number($('#prodPriceOrig').value) || null,
            description: $('#prodDesc').value.trim(),
            features: $('#prodFeatures').value.split('\n').map(s => s.trim()).filter(Boolean),
            images: prodImagesArr,
            variants: prodVariantsArr.filter(v => v.name).map(v => ({ ...v, image: v.image || prodImagesArr[0] || '' })),
            is_active: $('#prodActive').checked
        };
        const { error } = id
            ? await getSupabase().from('products').update(payload).eq('id', id)
            : await getSupabase().from('products').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Producto guardado');
        if (!error) { $('#productEditor').classList.remove('open'); await loadAll(); renderAll(); }
    });

    let tPhotosArr = [];

    function renderTestimonials() {
        const el = $('#testimonialsTable');
        if (!el) return;
        if (!DATA.testimonials.length) { el.innerHTML = '<p class="admin-empty">Sin testimonios todavía</p>'; return; }
        el.innerHTML = `<table class="admin-table"><thead><tr>
            <th>Cliente</th><th>Comentario</th><th>Fuente</th><th>Estado</th><th>Acciones</th>
        </tr></thead><tbody>` + slicePage(DATA.testimonials, 'testimonials').map(t => `<tr>
            <td><span class="cell-author">${escapeHtml(t.author)}</span></td>
            <td><span class="cell-clamp">${escapeHtml(t.comment)}</span></td>
            <td class="cell-muted">${escapeHtml(t.source || 'instagram')}</td>
            <td><span class="badge ${t.is_active ? 'published' : 'draft'}">${t.is_active ? 'Visible' : 'Oculto'}</span></td>
            <td class="cell-actions">
             <button class="admin-btn" data-edittest="${t.id}" title="Editar">${ICONS.edit}</button>
             <button class="admin-btn" data-togtest="${t.id}" title="${t.is_active ? 'Ocultar' : 'Mostrar'}">${t.is_active ? ICONS.eyeOff : ICONS.eye}</button>
             <button class="admin-btn danger" data-deltest="${t.id}" title="Eliminar">${ICONS.trash}</button>
         </td>
        </tr>`).join('') + `</tbody></table>` + pagerHTML('testimonials', DATA.testimonials.length);

             el.addEventListener('click', async e => {
         const editBtn = e.target.closest('[data-edittest]');
         const toggleBtn = e.target.closest('[data-togtest]');
         const delBtn = e.target.closest('[data-deltest]');
         if (editBtn) {
             openTestimonialEditor(editBtn.dataset.edittest);
         } else if (toggleBtn) {
                const t = DATA.testimonials.find(x => String(x.id) === String(toggleBtn.dataset.togtest));
                await getSupabase().from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
                await loadAll(); renderTestimonials(); toast('Testimonio actualizado');
            } else if (delBtn) {
                if (!await askConfirm({ title: 'Eliminar testimonio', message: 'Se quitará definitivamente del sitio.' })) return;
                await getSupabase().from('testimonials').delete().eq('id', delBtn.dataset.deltest);
                await loadAll(); renderTestimonials(); toast('Testimonio eliminado');
            }
        });
    }

    function renderTestimonialPhotos() {
        renderImageList('tPhotos', tPhotosArr, idx => {
            tPhotosArr.splice(idx, 1);
            renderTestimonialPhotos();
        });
    }

    const tAddPhoto = $('#tAddPhoto');
    if (tAddPhoto) {
             tAddPhoto.addEventListener('click', async () => {
         const choice = await askImageSource();
         if (!choice) return;
         if (choice === 'file') { $('#tPhotoInput').click(); return; }
         if (choice.url) { tPhotosArr.push(choice.url); renderTestimonialPhotos(); toast('Foto agregada desde enlace ✅'); }
     });
     
        $('#tPhotoInput').addEventListener('change', async e => {
            const file = e.target.files[0];
            if (!file) return;
            toast('Subiendo foto...');
            const url = await uploadFile(file, 'testimonio');
            if (url) { tPhotosArr.push(url); renderTestimonialPhotos(); }
            e.target.value = '';
        });
    }

     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 // ✏️ EDITAR TESTIMONIOS (crear vs actualizar)
 // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 let editingTestimonialId = null;

 function getTestimonialSubmitBtn() {
     return document.querySelector('#testimonialForm button[type="submit"]') ||
            document.querySelector('#testimonialForm button:not(#tAddPhoto)');
 }
 function openTestimonialEditor(id) {
     const t = DATA.testimonials.find(x => String(x.id) === String(id));
     if (!t) return;
     editingTestimonialId = t.id;
     $('#tAuthor').value = t.author || '';
     $('#tLocation').value = t.location || '';
     $('#tSource').value = t.source || 'instagram';
     $('#tRating').value = String(t.rating || 5);
     $('#tComment').value = t.comment || '';
     tPhotosArr = [...(t.images || [])];
     renderTestimonialPhotos();
     const btn = getTestimonialSubmitBtn();
     if (btn) btn.textContent = 'Guardar cambios';
     if (testimonialEditorCtl) testimonialEditorCtl.open();
 }
 function resetTestimonialEditor() {
     editingTestimonialId = null;
     const form = $('#testimonialForm');
     if (form) form.reset();
     tPhotosArr = []; renderTestimonialPhotos();
     const btn = getTestimonialSubmitBtn();
     if (btn) btn.textContent = 'Publicar testimonio';
 }
 // "＋ Nuevo testimonio" siempre entra en modo crear (limpia edición previa)
 document.getElementById('newTestimonialBtn')?.addEventListener('click', () => {
     if (editingTestimonialId) resetTestimonialEditor();
 });

 const testimonialForm = $('#testimonialForm');
 if (testimonialForm) testimonialForm.addEventListener('submit', async e => {
     e.preventDefault();
     const author = $('#tAuthor').value.trim();
     const comment = $('#tComment').value.trim();
     if (!author || !comment) { toast('Nombre y comentario son obligatorios'); return; }
     const payload = {
         author,
         comment,
         location: $('#tLocation').value.trim() || null,
         source: $('#tSource').value,
         rating: Number($('#tRating').value),
         images: tPhotosArr,
     };
     let error = null;
     if (editingTestimonialId) {
         const res = await getSupabase().from('testimonials').update(payload).eq('id', editingTestimonialId);
         error = res.error;
     } else {
         const res = await getSupabase().from('testimonials').insert([{ ...payload, is_active: true }]);
         error = res.error;
     }
     toast(error ? 'Error: ' + error.message : (editingTestimonialId ? 'Testimonio actualizado ✅' : 'Testimonio publicado ✅'));
     if (!error) {
         resetTestimonialEditor();
         await loadAll(); renderTestimonials();
         if (testimonialEditorCtl) testimonialEditorCtl.close();
     }
 });

    let editingServiceId = null;

    (function attachServiceToolbar() {
    const ta = $('#serviceContent');
    if (!ta) return;
    // Elimina la toolbar estática duplicada del HTML (si existe)
    const staticTb = document.getElementById('serviceMdToolbar');
    if (staticTb) staticTb.remove();
    // Inyecta UNA sola toolbar y la deja conectada
    ta.insertAdjacentHTML('beforebegin', MD_TOOLBAR_HTML);
    attachMdToolbar(ta);
})();

    function renderServicesAdmin() {
        const el = $('#servicesTable');
        if (!el) return;
        if (!DATA.services.length) { el.innerHTML = '<p class="admin-empty">Sin servicios en BD — se muestran los de config.js</p>'; return; }
        el.innerHTML = `<table class="admin-table"><thead><tr>
            <th>#</th><th>Título</th><th>Estado</th><th>Acciones</th>
        </tr></thead><tbody>` + slicePage(DATA.services, 'services').map(sv => `<tr>
            <td class="cell-muted">${escapeHtml(sv.number || '')}</td>
            <td><span class="cell-author">${escapeHtml(sv.title)}</span></td>
            <td><span class="badge ${sv.is_active ? 'published' : 'draft'}">${sv.is_active ? 'Activo' : 'Oculto'}</span></td>
            <td class="cell-actions">
                <button class="admin-btn" data-editservice="${sv.id}" title="Editar">${ICONS.edit}</button>
                <button class="admin-btn danger" data-delservice="${sv.id}" title="Eliminar">${ICONS.trash}</button>
            </td>
        </tr>`).join('') + `</tbody></table>` + pagerHTML('services', DATA.services.length);
        
        el.addEventListener('click', async e => {
            const editBtn = e.target.closest('[data-editservice]');
            const delBtn = e.target.closest('[data-delservice]');
            
            if (editBtn) {
                openServiceEditor(editBtn.dataset.editservice);
            } else if (delBtn) {
                if (!await askConfirm({ title: 'Eliminar servicio', message: 'Se quitará del sitio inmediatamente.' })) return;
                const { error } = await getSupabase().from('services').delete().eq('id', delBtn.dataset.delservice);
                toast(error ? 'Error al eliminar' : 'Servicio eliminado');
                if (!error) { await loadAll(); renderServicesAdmin(); }
            }
        });
    }

    function openServiceEditor(id) {
        editingServiceId = id || null;
        const sv = DATA.services.find(x => String(x.id) === String(id)) || null;
        $('#serviceEditorTitle').textContent = sv ? 'Editar Servicio' : 'Nuevo Servicio';
        $('#serviceNumber').value = sv?.number || String(DATA.services.length + 1).padStart(2, '0');
        $('#serviceTitle').value = sv?.title || '';
        $('#serviceIntro').value = sv?.intro || '';
        $('#serviceContent').value = sv?.content || '';
        $('#serviceImage').value = sv?.image || '';
        $('#serviceActive').checked = sv ? sv.is_active : true;
        $('#serviceEditor').hidden = false;
        $('#serviceEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function closeServiceEditor() { $('#serviceEditor').hidden = true; editingServiceId = null; }

    $('#newServiceBtn').addEventListener('click', () => openServiceEditor(null));
    $('#serviceCancel').addEventListener('click', closeServiceEditor);
    
    $('#serviceSave').addEventListener('click', async () => {
        const title = $('#serviceTitle').value.trim();
        if (!title) { toast('El título es obligatorio'); return; }
        const payload = {
            number: $('#serviceNumber').value.trim() || '01',
            title,
            intro: $('#serviceIntro').value.trim() || null,
            content: $('#serviceContent').value,
            image: $('#serviceImage').value.trim() || null,
            is_active: $('#serviceActive').checked,
            sort: DATA.services.length
        };
        const { error } = editingServiceId
            ? await getSupabase().from('services').update(payload).eq('id', editingServiceId)
            : await getSupabase().from('services').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Servicio guardado ✅');
        if (!error) { closeServiceEditor(); await loadAll(); renderServicesAdmin(); }
    });
    
     $('#serviceImgBtn').addEventListener('click', async () => {
     const choice = await askImageSource();
     if (!choice) return;
     if (choice === 'file') { $('#serviceImgInput').click(); return; }
     if (choice.url) { $('#serviceImage').value = choice.url; toast('Imagen aplicada desde enlace ✅'); }
 });

    $('#serviceImgInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'servicio');
        if (url) {
            $('#serviceImage').value = url;
            toast('Imagen lista ✅');
        }
        e.target.value = '';
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧩 FORMS COLAPSABLES: Cupones y Testimonios
// (igual que Servicios: botón "+ Nuevo" y form oculto por defecto)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function setupCollapsibleForm(formId, viewId, editorId, btnId, label) {
    const form = document.getElementById(formId);
    const view = document.getElementById(viewId);
    if (!form || !view) return null;

    // 1) Contenedor colapsable alrededor del formulario
    const wrap = document.createElement('div');
    wrap.id = editorId;
    wrap.className = 'admin-collapsible';
    form.parentNode.insertBefore(wrap, form);
    wrap.appendChild(form);

    // 2) Botón "+ Nuevo ..." después del título de la vista
    const btn = document.createElement('button');
    btn.id = btnId;
    btn.type = 'button';
    btn.className = 'admin-btn action solid';
    btn.textContent = label;
    const h2 = view.querySelector('h2');
    if (h2) h2.insertAdjacentElement('afterend', btn);
    else view.prepend(btn);

    const ctl = {
        form, wrap, btn,
        open() {
            wrap.hidden = false;
            btn.classList.add('active');
            wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const first = form.querySelector('input, select, textarea');
            if (first) setTimeout(() => first.focus({ preventScroll: true }), 400);
        },
        close() {
            wrap.hidden = true;
            btn.classList.remove('active');
        },
        toggle() { wrap.hidden ? this.open() : this.close(); }
    };
    btn.addEventListener('click', () => ctl.toggle());
    ctl.close(); // arranca oculto
    return ctl;
}

const couponEditorCtl = setupCollapsibleForm(
    'couponForm', 'view-coupons', 'couponEditor', 'newCouponBtn', '＋ Nuevo cupón'
);
const testimonialEditorCtl = setupCollapsibleForm(
    'testimonialForm', 'view-testimonials', 'testimonialEditor', 'newTestimonialBtn', '＋ Nuevo testimonio'
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 LECTOR SIMPLE DE CELDAS (estilos en línea: no depende de admin.css)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function marcarCeldasCortadas() {
    document.querySelectorAll('.cell-clamp, .cell-author, .cell-title .t, .cell-muted').forEach(function (el) {
        if (el.scrollHeight > el.clientHeight + 1) {
            el.style.cursor = 'pointer';
            el.setAttribute('title', 'Toca para ver el texto completo');
        }
    });
}

// Re-marca cada vez que una tabla se repinta
new MutationObserver(function () {
    requestAnimationFrame(marcarCeldasCortadas);
}).observe(document.body, { childList: true, subtree: true });

// Al tocar una celda cortada → se abre el lector
document.addEventListener('click', function (e) {
    var cell = e.target.closest('.cell-clamp, .cell-author, .cell-title .t, .cell-muted');
    if (!cell) return;
    if (cell.scrollHeight <= cell.clientHeight + 1) return;

    var td = cell.closest('td');
    var tabla = td ? td.closest('table') : null;
    var th = tabla ? tabla.querySelectorAll('th')[td.cellIndex] : null;

    var fondo = document.createElement('div');
    fondo.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;padding:1rem;';

    var tarjeta = document.createElement('div');
    tarjeta.style.cssText = 'max-width:480px;width:100%;max-height:70vh;overflow:auto;background:#ffffff;border-radius:12px;padding:1.4rem;box-shadow:0 20px 50px rgba(0,0,0,.4);';

    var titulo = document.createElement('h3');
    titulo.style.cssText = 'margin:0 0 .8rem;font-size:1rem;color:#2E8B7F;';
    titulo.textContent = th ? th.textContent.trim() : 'Detalle';

    var texto = document.createElement('p');
    texto.style.cssText = 'margin:0;line-height:1.7;white-space:pre-wrap;word-break:break-word;font-size:.9rem;color:#0F2A3F;';
    texto.textContent = cell.textContent.trim();

    var boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = 'Cerrar ✕';
    boton.style.cssText = 'margin-top:1rem;padding:.6rem 1.2rem;background:#2E8B7F;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:600;';

    tarjeta.appendChild(titulo);
    tarjeta.appendChild(texto);
    tarjeta.appendChild(boton);
    fondo.appendChild(tarjeta);
    document.body.appendChild(fondo);

    function cerrar() { fondo.remove(); }
    boton.addEventListener('click', cerrar);
    fondo.addEventListener('click', function (ev) { if (ev.target === fondo) cerrar(); });
}, true);

setTimeout(marcarCeldasCortadas, 600);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🖼️ SELECTOR DE IMAGEN: subir archivo o pegar enlace
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let imgSourceModal = null;
let imgSourceResolve = null;
function closeImgSource(val) {
    if (imgSourceModal) imgSourceModal.classList.remove('open');
    if (imgSourceResolve) { imgSourceResolve(val); imgSourceResolve = null; }
}
function askImageSource() {
    return new Promise(resolve => {
        imgSourceResolve = resolve;
        if (!imgSourceModal) {
            imgSourceModal = document.createElement('div');
            imgSourceModal.className = 'admin-confirm';
            imgSourceModal.innerHTML = `<div class="admin-confirm-card">
                <div class="admin-confirm-icon">🖼️</div>
                <h3>Agregar imagen</h3>
                <p>Elige cómo quieres agregarla:</p>
                <div class="img-source-options">
                    <button class="admin-btn txt" id="imgSrcFile" type="button">📁 Subir archivo</button>
                    <button class="admin-btn txt" id="imgSrcUrlToggle" type="button">🔗 Pegar enlace</button>
                </div>
                <div class="img-source-url" id="imgSrcUrlWrap">
                    <input type="url" id="imgSrcUrlInput" placeholder="https://.../imagen.jpg" autocomplete="off">
                    <button class="admin-btn txt" id="imgSrcUrlOk" type="button" style="width:100%;">Usar enlace</button>
                </div>
                <div class="admin-confirm-actions">
                    <button class="admin-btn txt" id="imgSrcCancel" type="button">Cancelar</button>
                </div>
            </div>`;
            document.body.appendChild(imgSourceModal);
            imgSourceModal.querySelector('#imgSrcFile').addEventListener('click', () => closeImgSource('file'));
            imgSourceModal.querySelector('#imgSrcUrlToggle').addEventListener('click', () => {
                const w = imgSourceModal.querySelector('#imgSrcUrlWrap');
                w.classList.toggle('open');
                if (w.classList.contains('open')) imgSourceModal.querySelector('#imgSrcUrlInput').focus();
            });
            imgSourceModal.querySelector('#imgSrcUrlOk').addEventListener('click', () => {
                const url = imgSourceModal.querySelector('#imgSrcUrlInput').value.trim();
                if (!url) { toast('Pega un enlace de imagen válido'); return; }
                imgSourceModal.querySelector('#imgSrcUrlInput').value = '';
                closeImgSource({ url });
            });
            imgSourceModal.querySelector('#imgSrcUrlInput').addEventListener('keypress', e => {
                if (e.key === 'Enter') { e.preventDefault(); imgSourceModal.querySelector('#imgSrcUrlOk').click(); }
            });
            imgSourceModal.querySelector('#imgSrcCancel').addEventListener('click', () => closeImgSource(null));
            imgSourceModal.addEventListener('click', e => { if (e.target === imgSourceModal) closeImgSource(null); });
        }
        imgSourceModal.querySelector('#imgSrcUrlWrap').classList.remove('open');
        imgSourceModal.querySelector('#imgSrcUrlInput').value = '';
        imgSourceModal.classList.add('open');
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🍓 TEMPORADA — gestión completa desde el panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadSeasonSettings() {
    try {
        const { data } = await getSupabase().from('site_settings')
            .select('value, updated_at').eq('key', 'season').maybeSingle();
        return data || null;
    } catch (e) { console.warn('Temporada: tabla site_settings no disponible —', e.message); return null; }
}
function toLocalInput(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fillSeasonForm(row) {
    const s = row?.value || null;
    const K = Object.assign({}, C.season || {}, s || {});
    const P = Object.assign({}, (C.season || {}).product || {}, (s || {}).product || {});
    $('#seasonEnabled').checked = K.enabled !== false;
    $('#seasonLabel').value = K.label || '';
    $('#seasonHeading').value = K.heading || '';
    $('#seasonSubtitle').value = K.subtitle || '';
    $('#seasonBadge').value = P.badge || '';
    $('#seasonName').value = P.name || '';
    $('#seasonDesc').value = P.desc || '';
    $('#seasonPrice').value = P.price ?? '';
    $('#seasonPriceOrig').value = P.originalPrice ?? '';
    $('#seasonImage').value = P.image || '';
    $('#seasonEnd').value = K.endDate ? toLocalInput(K.endDate) : '';
    $('#seasonCta').value = K.cta || '';
    $('#seasonWhatsapp').value = K.whatsapp || '';
    $('#seasonWaMsg').value = K.waMessage || '';
    $('#seasonMarquee').value = (K.marquee || []).join('\n');
    const at = $('#seasonSavedAt');
    if (at) at.textContent = row?.updated_at ? 'Último guardado: ' + fmtDate(row.updated_at) : 'Usando valores de config.js';
}
$('#seasonImgBtn').addEventListener('click', async () => {
    const choice = await askImageSource();
    if (!choice) return;
    if (choice === 'file') { $('#seasonImgInput').click(); return; }
    if (choice.url) { $('#seasonImage').value = choice.url; toast('Imagen aplicada ✅'); }
});
$('#seasonImgInput').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    toast('Subiendo imagen...');
    const url = await uploadFile(file, 'temporada');
    if (url) { $('#seasonImage').value = url; toast('Imagen lista ✅'); }
    e.target.value = '';
});
$('#seasonSave').addEventListener('click', async () => {
    const payload = {
        enabled: $('#seasonEnabled').checked,
        label: $('#seasonLabel').value.trim(),
        heading: $('#seasonHeading').value.trim(),
        subtitle: $('#seasonSubtitle').value.trim(),
        cta: $('#seasonCta').value.trim(),
        whatsapp: $('#seasonWhatsapp').value.trim(),
        waMessage: $('#seasonWaMsg').value.trim(),
        endDate: $('#seasonEnd').value ? new Date($('#seasonEnd').value).toISOString() : null,
        marquee: $('#seasonMarquee').value.split('\n').map(x => x.trim()).filter(Boolean),
        product: {
            badge: $('#seasonBadge').value.trim(),
            name: $('#seasonName').value.trim(),
            desc: $('#seasonDesc').value.trim(),
            price: Number($('#seasonPrice').value) || 0,
            originalPrice: Number($('#seasonPriceOrig').value) || null,
            image: $('#seasonImage').value.trim(),
        }
    };
    const btn = $('#seasonSave');
    btn.disabled = true; btn.textContent = 'Guardando...';
    const { error } = await getSupabase().from('site_settings')
        .upsert({ key: 'season', value: payload, updated_at: new Date().toISOString() });
    btn.disabled = false; btn.textContent = 'Guardar cambios';
    toast(error ? 'Error: ' + error.message : 'Temporada guardada ✅');
    if (!error) fillSeasonForm({ value: payload, updated_at: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎂 COTIZADOR — gestión completa desde el panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function loadCotSettings() {
    try {
        const { data } = await getSupabase().from('site_settings')
            .select('value').eq('key', 'cotizador').maybeSingle();
        return data?.value || null;
    } catch (e) { return null; }
}
function mergeCotSettings(s) {
    if (!s) return;
    const base = C.cotizador || {};
    C.cotizador = Object.assign({}, base, s);
    C.cotizador.delivery = Object.assign({}, base.delivery || {}, s.delivery || {});
}
function cotLines(items, key) {
    return (items || []).map(i => `${i.label} | ${i[key] ?? 0}`).join('\n');
}
function cotParse(txt) {
    return (txt || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
        const [label, num] = l.split('|').map(x => x.trim());
        return { label: label || '', price: Number(num) || 0, add: Number(num) || 0 };
    }).filter(x => x.label);
}
function fillCotForm() {
    const K = C.cotizador || {};
    const D = K.delivery || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const chk = document.getElementById('cotEnabled');
    if (chk) chk.checked = K.enabled !== false;
    set('cotMinDays', K.minDaysAhead ?? 3);
    set('cotMaxDay', K.maxPerDay ?? 1);
    set('cotWhatsapp', K.whatsapp || '');
    set('cotSizes', cotLines(K.sizes, 'price'));
    set('cotFillings', cotLines(K.fillings, 'add'));
    set('cotDecos', cotLines(K.decorations, 'add'));
    set('cotExtras', cotLines(K.extras, 'add'));
    set('cotPickupLabel', D.pickupLabel || '');
    set('cotPickupNote', D.pickupNote || '');
    set('cotDeliveryLabel', D.deliveryLabel || '');
    set('cotDeliveryNote', D.deliveryNote || '');
}

$('#cotSave')?.addEventListener('click', async () => {
    const payload = {
        enabled: document.getElementById('cotEnabled')?.checked !== false,
        minDaysAhead: Number(document.getElementById('cotMinDays')?.value) || 0,
        maxPerDay: Number(document.getElementById('cotMaxDay')?.value) || 1,
        whatsapp: document.getElementById('cotWhatsapp')?.value.trim() || '',
        sizes: cotParse(document.getElementById('cotSizes')?.value || ''),
        fillings: cotParse(document.getElementById('cotFillings')?.value || ''),
        decorations: cotParse(document.getElementById('cotDecos')?.value || ''),
        extras: cotParse(document.getElementById('cotExtras')?.value || ''),
        delivery: {
            pickupLabel: document.getElementById('cotPickupLabel')?.value.trim() || '',
            pickupNote: document.getElementById('cotPickupNote')?.value.trim() || '',
            deliveryLabel: document.getElementById('cotDeliveryLabel')?.value.trim() || '',
            deliveryNote: document.getElementById('cotDeliveryNote')?.value.trim() || '',
        }
    };
    const btn = document.getElementById('cotSave');
    btn.disabled = true; btn.textContent = 'Guardando...';
    const { error } = await getSupabase().from('site_settings')
        .upsert({ key: 'cotizador', value: payload, updated_at: new Date().toISOString() });
    btn.disabled = false; btn.textContent = 'Guardar cambios';
    toast(error ? 'Error: ' + error.message : 'Cotizador guardado ✅');
    if (!error) {
        mergeCotSettings(payload);
        fillCotForm();
        applyAdminTabsVisibility();
        const at = document.getElementById('cotSavedAt');
        if (at) at.textContent = 'Último guardado: ' + new Date().toLocaleString('es-MX');
    }
});

async function refreshCotBookings() {
    const el = $('#cotBookingsTable');
    if (!el) return;
    let rows = [];
    try {
        const { data } = await getSupabase().from('cake_bookings')
            .select('*').order('order_date', { ascending: true });
        rows = data || [];
    } catch (e) { rows = []; }
    if (!rows.length) { el.innerHTML = '<p class="admin-empty">Sin pedidos registrados</p>'; return; }
    el.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Entrega</th><th>Pedido</th><th>Modalidad</th><th>Total</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>` + rows.map(b => {
        const d = b.details || {};
        const resumen = [d.size, d.filling, d.deco].filter(Boolean).join(' · ') +
            ((d.extras || []).length ? ' + ' + d.extras.join(', ') : '') +
            (d.qty > 1 ? ` (×${d.qty})` : '');
        return `<tr>
            <td class="cell-date">${escapeHtml(b.order_date)}</td>
            <td><span class="cell-clamp">${escapeHtml(resumen || '—')}</span></td>
            <td class="cell-muted">${b.delivery === 'delivery' ? '🚗 Domicilio' : '🏪 Recoger'}</td>
            <td class="cell-value">${money(d.total || 0)}</td>
            <td><span class="badge ${b.status === 'cancelled' ? 'cancelled' : 'pending'}">${b.status === 'cancelled' ? 'Cancelado' : 'Activo'}</span></td>
            <td class="cell-actions">
                ${b.status === 'cancelled'
                    ? `<button class="admin-btn" data-cotreact="${b.id}" title="Reactivar (vuelve a bloquear la fecha)">${ICONS.check}</button>`
                    : `<button class="admin-btn" data-cotcancel="${b.id}" title="Cancelar pedido (libera la fecha)">${ICONS.ban}</button>`}
                <button class="admin-btn danger" data-cotdel="${b.id}" title="Eliminar">${ICONS.trash}</button>
            </td>
        </tr>`;
    }).join('') + '</tbody></table>';
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', async e => {
        const cancelBtn = e.target.closest('[data-cotcancel]');
        const reactBtn = e.target.closest('[data-cotreact]');
        const delBtn = e.target.closest('[data-cotdel]');
        if (cancelBtn) {
            if (!await askConfirm({ title: 'Cancelar pedido', message: 'La fecha quedará LIBRE para nuevos pedidos.' })) return;
            const { error } = await getSupabase().from('cake_bookings').update({ status: 'cancelled' }).eq('id', cancelBtn.dataset.cotcancel);
            toast(error ? 'Error al cancelar' : 'Pedido cancelado — fecha liberada ✅');
            if (!error) refreshCotBookings();
        } else if (reactBtn) {
            const { error } = await getSupabase().from('cake_bookings').update({ status: 'pending' }).eq('id', reactBtn.dataset.cotreact);
            toast(error ? 'Error al reactivar' : 'Pedido reactivado — fecha bloqueada de nuevo');
            if (!error) refreshCotBookings();
        } else if (delBtn) {
            if (!await askConfirm({ title: 'Eliminar pedido', message: 'Se elimina el registro y la fecha queda libre.' })) return;
            const { error } = await getSupabase().from('cake_bookings').delete().eq('id', delBtn.dataset.cotdel);
            toast(error ? 'Error al eliminar' : 'Pedido eliminado');
            if (!error) refreshCotBookings();
        }
    });
}

// ━━━ 🍽️ MENÚ v2 (panel) ━━━
let editingMenuItemId = null;

async function refreshMenuAdmin() {
    let rows = [];
    try {
        const r = await getSupabase().from('menu_items').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true });
        rows = r.data || [];
    } catch (e) { rows = []; }
    DATA.menuItems = rows;
    renderMenuAdmin();
}

function renderMenuAdmin() {
    const el = $('#menuItemsTable');
    if (!el) return;
    if (!DATA.menuItems.length) { el.innerHTML = '<p class="admin-empty">Sin platillos todavía. Crea el primero con "＋ Nuevo platillo".</p>'; return; }
    el.innerHTML = `<div class="mat">
        <div class="mat-row mat-head">
            <span>Categoría</span><span>Platillo</span><span>Precio</span><span>Estado</span><span>Acciones</span>
        </div>` +
        slicePage(DATA.menuItems, 'menuItems').map(mi => `<div class="mat-row">
            <span class="cell-muted">${escapeHtml(mi.category || 'General')}</span>
            <span><span class="cell-author">${escapeHtml(mi.name)}</span>${mi.description ? `<span class="menu-desc">${escapeHtml(mi.description)}</span>` : ''}</span>
            <span class="cell-value">${money(mi.price)}</span>
            <span><span class="badge ${mi.is_active ? 'published' : 'draft'}">${mi.is_active ? 'Activo' : 'Oculto'}</span></span>
            <span class="cell-actions">
                <button class="admin-btn" data-editmenu="${mi.id}" title="Editar">${ICONS.edit}</button>
                <button class="admin-btn danger" data-delmenu="${mi.id}" title="Eliminar">${ICONS.trash}</button>
            </span>
        </div>`).join('') +
    `</div>` + pagerHTML('menuItems', DATA.menuItems.length);
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', async e => {
        const editBtn = e.target.closest('[data-editmenu]');
        const delBtn = e.target.closest('[data-delmenu]');
        if (editBtn) openMenuEditor(editBtn.dataset.editmenu);
        else if (delBtn) {
            if (!await askConfirm({ title: 'Eliminar platillo', message: 'Se quitará del menú del sitio inmediatamente.' })) return;
            const { error } = await getSupabase().from('menu_items').delete().eq('id', delBtn.dataset.delmenu);
            toast(error ? 'Error al eliminar' : 'Platillo eliminado');
            if (!error) await refreshMenuAdmin();
        }
    });
}

function menuCategories() {
    const cats = [];
    (C.menu?.categories || []).forEach(c => {
        if (!cats.some(x => x.toLowerCase() === c.name.toLowerCase())) cats.push(c.name);
    });
    (DATA.menuItems || []).forEach(mi => {
        const n = (mi.category || 'General').trim();
        if (!cats.some(x => x.toLowerCase() === n.toLowerCase())) cats.push(n);
    });
    if (!cats.length) cats.push('General');
    return cats;
}
function renderMenuCatSelect(selected) {
    const sel = $('#menuItemCategory');
    if (!sel) return;
    const cats = menuCategories();
    sel.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    const match = cats.find(c => c.toLowerCase() === String(selected || '').toLowerCase());
    sel.value = match || cats[0];
}

function openMenuEditor(id) {
    editingMenuItemId = id || null;
    const mi = (DATA.menuItems || []).find(x => String(x.id) === String(id)) || null;
    $('#menuEditorTitle').textContent = mi ? 'Editar platillo' : 'Nuevo platillo';
    renderMenuCatSelect(mi?.category || '');
    $('#menuItemName').value = mi?.name || '';
    $('#menuItemDesc').value = mi?.description || '';
    $('#menuItemPrice').value = mi?.price ?? '';
    $('#menuItemActive').checked = mi ? mi.is_active : true;
    $('#menuEditor').hidden = false;
    $('#menuEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeMenuEditor() { $('#menuEditor').hidden = true; editingMenuItemId = null; }

if ($('#newMenuItemBtn') && !$('#newMenuItemBtn').dataset.bound) {
    $('#newMenuItemBtn').dataset.bound = '1';
    $('#newMenuItemBtn').addEventListener('click', () => openMenuEditor(null));
    $('#menuItemCancel').addEventListener('click', closeMenuEditor);
    $('#menuCatToggle').addEventListener('click', () => {
        const q = $('#menuCatQuick');
        q.hidden = !q.hidden;
        if (!q.hidden) $('#menuCatName').focus();
    });
    $('#menuCatSave').addEventListener('click', () => {
        const name = $('#menuCatName').value.trim();
        if (!name) { toast('Escribe un nombre de categoría'); return; }
        const sel = $('#menuItemCategory');
        const exists = Array.from(sel.options).some(o => o.value.toLowerCase() === name.toLowerCase());
        if (exists) { toast('Esa categoría ya existe'); return; }
        sel.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`);
        sel.value = name;
        $('#menuCatName').value = '';
        $('#menuCatQuick').hidden = true;
        toast('Categoría lista ✅ (se guardará con el platillo)');
    });
    $('#menuItemSave').addEventListener('click', async () => {
        const name = $('#menuItemName').value.trim();
        if (!name) { toast('El nombre del platillo es obligatorio'); return; }
        const payload = {
            category: $('#menuItemCategory').value.trim() || 'General',
            name,
            description: $('#menuItemDesc').value.trim() || null,
            price: Number($('#menuItemPrice').value) || 0,
            tag: null,
            is_active: $('#menuItemActive').checked,
            sort: (DATA.menuItems || []).length
        };
        const { error } = editingMenuItemId
            ? await getSupabase().from('menu_items').update(payload).eq('id', editingMenuItemId)
            : await getSupabase().from('menu_items').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Platillo guardado ✅');
        if (!error) { closeMenuEditor(); await refreshMenuAdmin(); }
    });
}

// ━━━ 🔁 ANTES/DESPUÉS (panel) ━━━
let editingBAId = null;

async function refreshBAAdmin() {
    let rows = [];
    try {
        const r = await getSupabase().from('before_after').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true });
        rows = r.data || [];
    } catch (e) { rows = []; }
    DATA.ba = rows;
    renderBAAdmin();
}

function renderBAAdmin() {
    const el = $('#baTable');
    if (!el) return;
    if (!DATA.ba.length) { el.innerHTML = '<p class="admin-empty">Sin casos todavía. Crea el primero con "＋ Nuevo caso".</p>'; return; }
    el.innerHTML = `<div class="mat">
        <div class="mat-row mat-head"><span>Título</span><span>Vista previa</span><span>Estado</span><span>Acciones</span></div>` +
        slicePage(DATA.ba, 'ba').map(b => `<div class="mat-row">
            <span><span class="cell-author">${escapeHtml(b.title)}</span>${b.tag ? `<span class="menu-desc">${escapeHtml(b.tag)}</span>` : ''}</span>
            <span class="ba-prev"><img src="${b.before_img}" alt="Antes"><img src="${b.after_img}" alt="Después"></span>
            <span><span class="badge ${b.is_active ? 'published' : 'draft'}">${b.is_active ? 'Activo' : 'Oculto'}</span></span>
            <span class="cell-actions">
                <button class="admin-btn" data-editba="${b.id}" title="Editar">${ICONS.edit}</button>
                <button class="admin-btn danger" data-delba="${b.id}" title="Eliminar">${ICONS.trash}</button>
            </span>
        </div>`).join('') + `</div>` + pagerHTML('ba', DATA.ba.length);
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', async e => {
        const editBtn = e.target.closest('[data-editba]');
        const delBtn = e.target.closest('[data-delba]');
        if (editBtn) openBAEditor(editBtn.dataset.editba);
        else if (delBtn) {
            if (!await askConfirm({ title: 'Eliminar caso', message: 'Se quitará del sitio inmediatamente.' })) return;
            const { error } = await getSupabase().from('before_after').delete().eq('id', delBtn.dataset.delba);
            toast(error ? 'Error al eliminar' : 'Caso eliminado');
            if (!error) await refreshBAAdmin();
        }
    });
}

function openBAEditor(id) {
    editingBAId = id || null;
    const b = (DATA.ba || []).find(x => String(x.id) === String(id)) || null;
    $('#baEditorTitle').textContent = b ? 'Editar caso' : 'Nuevo caso';
    $('#baTitle').value = b?.title || '';
    $('#baTag').value = b?.tag || '';
    $('#baBefore').value = b?.before_img || '';
    $('#baAfter').value = b?.after_img || '';
    $('#baActive').checked = b ? b.is_active : true;
    $('#baEditor').hidden = false;
    $('#baEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeBAEditor() { $('#baEditor').hidden = true; editingBAId = null; }

if ($('#newBABtn') && !$('#newBABtn').dataset.bound) {
    $('#newBABtn').dataset.bound = '1';
    $('#newBABtn').addEventListener('click', () => openBAEditor(null));
    $('#baCancel').addEventListener('click', closeBAEditor);
    $('#baBeforeBtn').addEventListener('click', async () => {
        const choice = await askImageSource();
        if (!choice) return;
        if (choice === 'file') { $('#baBeforeInput').click(); return; }
        if (choice.url) { $('#baBefore').value = choice.url; toast('Imagen "antes" aplicada ✅'); }
    });
    $('#baAfterBtn').addEventListener('click', async () => {
        const choice = await askImageSource();
        if (!choice) return;
        if (choice === 'file') { $('#baAfterInput').click(); return; }
        if (choice.url) { $('#baAfter').value = choice.url; toast('Imagen "después" aplicada ✅'); }
    });
    $('#baBeforeInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'antes');
        if (url) { $('#baBefore').value = url; toast('Imagen "antes" lista ✅'); }
    });
    $('#baAfterInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'despues');
        if (url) { $('#baAfter').value = url; toast('Imagen "después" lista ✅'); }
    });
    $('#baSave').addEventListener('click', async () => {
        const title = $('#baTitle').value.trim();
        const before = $('#baBefore').value.trim();
        const after = $('#baAfter').value.trim();
        if (!title || !before || !after) { toast('Título y ambas imágenes son obligatorios'); return; }
        const payload = {
            title,
            tag: $('#baTag').value.trim() || null,
            before_img: before,
            after_img: after,
            is_active: $('#baActive').checked,
            sort: (DATA.ba || []).length
        };
        const { error } = editingBAId
            ? await getSupabase().from('before_after').update(payload).eq('id', editingBAId)
            : await getSupabase().from('before_after').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Caso guardado ✅');
        if (!error) { closeBAEditor(); await refreshBAAdmin(); }
    });
}

// ━━━ ⭐ PLANES/MEMBRESÍAS (panel) ━━━
let editingPlanId = null;

async function refreshPlansAdmin() {
    let rows = [];
    try {
        const r = await getSupabase().from('plans').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true });
        rows = r.data || [];
    } catch (e) { rows = []; }
    DATA.plans = rows;
    renderPlansAdmin();
}

function renderPlansAdmin() {
    const el = $('#plansTable');
    if (!el) return;
    if (!DATA.plans.length) { el.innerHTML = '<p class="admin-empty">Sin planes todavía. Crea el primero con "＋ Nuevo plan".</p>'; return; }
    el.innerHTML = `<div class="mat">
        <div class="mat-row mat-head"><span>Plan</span><span>Precio</span><span>Estado</span><span>Acciones</span></div>` +
        slicePage(DATA.plans, 'plans').map(p => `<div class="mat-row">
            <span><span class="cell-author">${escapeHtml(p.name)}</span>${p.highlighted ? '<span class="menu-desc">⭐ Más popular</span>' : ''}</span>
            <span class="cell-value">${money(p.price)} / ${escapeHtml(p.period || 'mes')}</span>
            <span><span class="badge ${p.is_active ? 'published' : 'draft'}">${p.is_active ? 'Activo' : 'Oculto'}</span></span>
            <span class="cell-actions">
                <button class="admin-btn" data-editplan="${p.id}" title="Editar">${ICONS.edit}</button>
                <button class="admin-btn danger" data-delplan="${p.id}" title="Eliminar">${ICONS.trash}</button>
            </span>
        </div>`).join('') + `</div>` + pagerHTML('plans', DATA.plans.length);
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', async e => {
        const editBtn = e.target.closest('[data-editplan]');
        const delBtn = e.target.closest('[data-delplan]');
        if (editBtn) openPlanEditor(editBtn.dataset.editplan);
        else if (delBtn) {
            if (!await askConfirm({ title: 'Eliminar plan', message: 'Se quitará del sitio inmediatamente.' })) return;
            const { error } = await getSupabase().from('plans').delete().eq('id', delBtn.dataset.delplan);
            toast(error ? 'Error al eliminar' : 'Plan eliminado');
            if (!error) await refreshPlansAdmin();
        }
    });
}

function openPlanEditor(id) {
    editingPlanId = id || null;
    const p = (DATA.plans || []).find(x => String(x.id) === String(id)) || null;
    $('#planEditorTitle').textContent = p ? 'Editar plan' : 'Nuevo plan';
    $('#planName').value = p?.name || '';
    $('#planPrice').value = p?.price ?? '';
    $('#planPeriod').value = p?.period || 'mes';
    $('#planDesc').value = p?.description || '';
    $('#planFeatures').value = (p?.features || []).join('\n');
    $('#planCta').value = p?.cta || '';
    $('#planFeatured').checked = !!p?.highlighted;
    $('#planActive').checked = p ? p.is_active : true;
    $('#planEditor').hidden = false;
    $('#planEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closePlanEditor() { $('#planEditor').hidden = true; editingPlanId = null; }

if ($('#newPlanBtn') && !$('#newPlanBtn').dataset.bound) {
    $('#newPlanBtn').dataset.bound = '1';
    $('#newPlanBtn').addEventListener('click', () => openPlanEditor(null));
    $('#planCancel').addEventListener('click', closePlanEditor);
    $('#planSave').addEventListener('click', async () => {
        const name = $('#planName').value.trim();
        const price = Number($('#planPrice').value);
        if (!name || isNaN(price)) { toast('Nombre y precio son obligatorios'); return; }
        const payload = {
            name,
            price,
            period: $('#planPeriod').value.trim() || 'mes',
            description: $('#planDesc').value.trim() || null,
            features: $('#planFeatures').value.split('\n').map(s => s.trim()).filter(Boolean),
            cta: $('#planCta').value.trim() || null,
            highlighted: $('#planFeatured').checked,
            is_active: $('#planActive').checked,
            sort: (DATA.plans || []).length
        };
        const { error } = editingPlanId
            ? await getSupabase().from('plans').update(payload).eq('id', editingPlanId)
            : await getSupabase().from('plans').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Plan guardado ✅');
        if (!error) { closePlanEditor(); await refreshPlansAdmin(); }
    });
}

// ━━━ ️ AGENDA DE CLASES (panel) ━━━
let editingClassId = null;

async function refreshClassesAdmin() {
    let rows = [];
    try {
        const r = await getSupabase().from('classes').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true });
        rows = r.data || [];
    } catch (e) { rows = []; }
    DATA.classes = rows;
    renderClassesAdmin();
}

function renderClassesAdmin() {
    const el = $('#classesTable');
    if (!el) return;
    if (!DATA.classes.length) { el.innerHTML = '<p class="admin-empty">Sin clases todavía. Crea la primera con "＋ Nueva clase".</p>'; return; }
    el.innerHTML = `<div class="mat">
        <div class="mat-row mat-head"><span>Día / Hora</span><span>Clase</span><span>Estado</span><span>Acciones</span></div>` +
        slicePage(DATA.classes, 'classes').map(c => `<div class="mat-row">
            <span><span class="cell-author">${escapeHtml(c.day)}</span><span class="menu-desc">${escapeHtml(c.time)} hrs</span></span>
            <span><span class="cell-author">${escapeHtml(c.name)}</span>${c.coach ? `<span class="menu-desc">con ${escapeHtml(c.coach)}</span>` : ''}</span>
            <span><span class="badge ${c.is_active ? 'published' : 'draft'}">${c.is_active ? 'Activa' : 'Oculta'}</span></span>
            <span class="cell-actions">
                <button class="admin-btn" data-editclass="${c.id}" title="Editar">${ICONS.edit}</button>
                <button class="admin-btn danger" data-delclass="${c.id}" title="Eliminar">${ICONS.trash}</button>
            </span>
        </div>`).join('') + `</div>` + pagerHTML('classes', DATA.classes.length);
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', async e => {
        const editBtn = e.target.closest('[data-editclass]');
        const delBtn = e.target.closest('[data-delclass]');
        if (editBtn) openClassEditor(editBtn.dataset.editclass);
        else if (delBtn) {
            if (!await askConfirm({ title: 'Eliminar clase', message: 'Se quitará de la agenda del sitio inmediatamente.' })) return;
            const { error } = await getSupabase().from('classes').delete().eq('id', delBtn.dataset.delclass);
            toast(error ? 'Error al eliminar' : 'Clase eliminada');
            if (!error) await refreshClassesAdmin();
        }
    });
}

function openClassEditor(id) {
    editingClassId = id || null;
    const c = (DATA.classes || []).find(x => String(x.id) === String(id)) || null;
    $('#classEditorTitle').textContent = c ? 'Editar clase' : 'Nueva clase';
    $('#classDay').value = c?.day || 'Lunes';
    $('#classTime').value = c?.time || '';
    $('#className').value = c?.name || '';
    $('#classCoach').value = c?.coach || '';
    $('#classLevel').value = c?.level || '';
    $('#classActive').checked = c ? c.is_active : true;
    $('#classEditor').hidden = false;
    $('#classEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeClassEditor() { $('#classEditor').hidden = true; editingClassId = null; }

if ($('#newClassBtn') && !$('#newClassBtn').dataset.bound) {
    $('#newClassBtn').dataset.bound = '1';
    $('#newClassBtn').addEventListener('click', () => openClassEditor(null));
    $('#classCancel').addEventListener('click', closeClassEditor);
    $('#classSave').addEventListener('click', async () => {
        const name = $('#className').value.trim();
        const time = $('#classTime').value.trim();
        if (!name || !time) { toast('Clase y hora son obligatorios'); return; }
        const payload = {
            day: $('#classDay').value,
            time,
            name,
            coach: $('#classCoach').value.trim() || null,
            level: $('#classLevel').value.trim() || null,
            is_active: $('#classActive').checked,
            sort: (DATA.classes || []).length
        };
        const { error } = editingClassId
            ? await getSupabase().from('classes').update(payload).eq('id', editingClassId)
            : await getSupabase().from('classes').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Clase guardada ✅');
        if (!error) { closeClassEditor(); await refreshClassesAdmin(); }
    });
}

// ━━━ 📈 MÉTRICAS DEL DASHBOARD ━━━
function renderDashboardMetrics() {
    const wrap = $('#adminMetrics');
    if (!wrap) return;
    const hasShop = C.ecommerce?.enabled !== false && (DATA.orders || []).length;
    const hasAppt = C.appointments?.enabled === true && (DATA.appointments || []).length;
    if (!hasShop && !hasAppt) { wrap.innerHTML = ''; return; }

    const dayMs = 86400000;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const sales7 = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getTime() - i * dayMs);
        const key = d.toDateString();
        const total = (DATA.orders || [])
            .filter(o => o.status !== 'cancelled' && new Date(o.created_at).toDateString() === key)
            .reduce((s, o) => s + Number(o.total || 0), 0);
        sales7.push({ label: d.toLocaleDateString('es-MX', { weekday: 'short' }), value: total });
    }

    const top = {};
    (DATA.orders || []).filter(o => o.status !== 'cancelled').forEach(o => (o.items || []).forEach(i => {
        top[i.name] = (top[i.name] || 0) + (i.qty || 1);
    }));
    const topList = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const apptDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const apptCount = [0, 0, 0, 0, 0, 0, 0];
    (DATA.appointments || []).forEach(a => {
        const d = new Date(a.date + 'T12:00:00');
        if (!isNaN(d)) apptCount[d.getDay()]++;
    });

    const since30 = today.getTime() - 29 * dayMs;
    const orders30 = (DATA.orders || []).filter(o => o.status !== 'cancelled' && new Date(o.created_at).getTime() >= since30);
    const revenue30 = orders30.reduce((s, o) => s + Number(o.total || 0), 0);
    const ticket = orders30.length ? revenue30 / orders30.length : 0;

    const barChart = (data, fmt) => {
        const max = Math.max(...data.map(d => d.value), 1);
        return `<div class="m-chart">${data.map(d => `
            <div class="m-col" title="${d.label}: ${fmt(d.value)}">
                <div class="m-bar" style="height:${Math.max(3, Math.round((d.value / max) * 100))}%"></div>
                <span>${d.label}</span>
            </div>`).join("")}</div>`;
    };

    wrap.innerHTML = `
        <div class="m-kpis">
            <div class="m-kpi"><div class="n">${money(revenue30)}</div><div class="l">Ventas (30 días)</div></div>
            <div class="m-kpi"><div class="n">${orders30.length}</div><div class="l">Pedidos (30 días)</div></div>
            <div class="m-kpi"><div class="n">${money(ticket)}</div><div class="l">Ticket promedio</div></div>
        </div>
        <div class="m-grid">
            ${hasShop ? `
            <div class="m-card">
                <h4>💵 Ventas últimos 7 días</h4>
                ${barChart(sales7, v => money(v))}
            </div>
            <div class="m-card">
                <h4>🏆 Más vendidos</h4>
                ${topList.length ? `<ul class="m-top">${topList.map(([name, qty], i) => `
                    <li><span class="pos">${i + 1}</span><span class="nm">${escapeHtml(name)}</span><span class="qt">${qty} vend.</span></li>`).join("")}</ul>`
                : '<p class="admin-empty">Sin ventas aún</p>'}
            </div>` : ""}
            ${hasAppt ? `
            <div class="m-card">
                <h4>📅 Citas por día de semana</h4>
                ${barChart(apptCount.map((v, i) => ({ label: apptDays[i], value: v })), v => v + ' citas')}
            </div>` : ""}
        </div>
    `;
}

// ━━━ 👥 ROLES: DUEÑO vs STAFF ━━━
// 'all' → staff ve TODAS las pestañas (sigue sin poder eliminar)
// [...] → lista blanca si algún día quieres restringir de nuevo
const STAFF_TABS = 'all';

function applyRoleRestrictions() {
    const badge = $('#adminRoleBadge');
    if (badge) {
        badge.textContent = ADMIN_ROLE === 'owner' ? '👑 Dueño' : '🧑🍳 Staff';
        badge.className = 'admin-role-badge ' + ADMIN_ROLE;
    }
    document.body.classList.toggle('role-staff', ADMIN_ROLE === 'staff');
    if (ADMIN_ROLE === 'staff' && Array.isArray(STAFF_TABS)) {
        $$('.admin-sidebar nav button').forEach(b => {
            if (!STAFF_TABS.includes(b.dataset.view)) b.style.display = 'none';
        });
        const active = document.querySelector('.admin-sidebar nav button.active');
        if (active && active.style.display === 'none') {
            document.querySelector('.admin-sidebar nav button[data-view="dashboard"]')?.click();
        }
    }
}

// Candado global: staff no puede eliminar NADA (aunque inspeccione el DOM)
document.addEventListener('click', e => {
    if (ADMIN_ROLE === 'staff' && e.target.closest('.admin-btn.danger')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toast('🔒 Solo el dueño puede eliminar');
    }
}, true);

// ━━━ 👥 EQUIPO (panel) ━━━
let editingTeamId = null;

async function refreshTeamAdmin() {
    let rows = [];
    try {
        const r = await getSupabase().from('team').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true });
        rows = r.data || [];
    } catch (e) { rows = []; }
    DATA.team = rows;
    renderTeamAdmin();
}

function renderTeamAdmin() {
    const el = $('#teamTable');
    if (!el) return;
    if (!DATA.team.length) { el.innerHTML = '<p class="admin-empty">Sin miembros todavía. Crea el primero con "＋ Nuevo miembro".</p>'; return; }
    el.innerHTML = `<div class="mat">
        <div class="mat-row mat-head"><span>Miembro</span><span>Contacto</span><span>Estado</span><span>Acciones</span></div>` +
        slicePage(DATA.team, 'team').map(d => `<div class="mat-row">
            <span style="display:flex;align-items:center;gap:.7rem;">
                ${d.photo ? `<img src="${d.photo}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid var(--A-line, rgba(255,255,255,.12));">` : `<span class="testimonial-avatar">${(d.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</span>`}
                <span><span class="cell-author">${escapeHtml(d.name)}</span>${d.specialty ? `<span class="menu-desc">${escapeHtml(d.specialty)}</span>` : ''}</span>
            </span>
            <span class="cell-muted">${escapeHtml(d.phone || d.email || '—')}</span>
            <span><span class="badge ${d.is_active ? 'published' : 'draft'}">${d.is_active ? 'Activo' : 'Oculto'}</span></span>
            <span class="cell-actions">
                <button class="admin-btn" data-editeam="${d.id}" title="Editar">${ICONS.edit}</button>
                <button class="admin-btn danger" data-delteam="${d.id}" title="Eliminar">${ICONS.trash}</button>
            </span>
        </div>`).join('') + `</div>` + pagerHTML('team', DATA.team.length);
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', async e => {
        const editBtn = e.target.closest('[data-editeam]');
        const delBtn = e.target.closest('[data-delteam]');
        if (editBtn) openTeamEditor(editBtn.dataset.editeam);
        else if (delBtn) {
            if (!await askConfirm({ title: 'Eliminar miembro', message: 'Se quitará del sitio inmediatamente.' })) return;
            const { error } = await getSupabase().from('team').delete().eq('id', delBtn.dataset.delteam);
            toast(error ? 'Error al eliminar' : 'Miembro eliminado');
            if (!error) await refreshTeamAdmin();
        }
    });
}

function openTeamEditor(id) {
    editingTeamId = id || null;
    const d = (DATA.team || []).find(x => String(x.id) === String(id)) || null;
    $('#teamEditorTitle').textContent = d ? 'Editar miembro' : 'Nuevo miembro';
    $('#teamName').value = d?.name || '';
    $('#teamSpecialty').value = d?.specialty || '';
    $('#teamCedula').value = d?.cedula || '';
    $('#teamSchedule').value = d?.schedule || '';
    $('#teamBio').value = d?.bio || '';
    $('#teamPhone').value = d?.phone || '';
    $('#teamWhatsapp').value = d?.whatsapp || '';
    $('#teamEmail').value = d?.email || '';
    $('#teamPhoto').value = d?.photo || '';
    $('#teamActive').checked = d ? d.is_active : true;
    $('#teamEditor').hidden = false;
    $('#teamEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeTeamEditor() { $('#teamEditor').hidden = true; editingTeamId = null; }

if ($('#newTeamBtn') && !$('#newTeamBtn').dataset.bound) {
    $('#newTeamBtn').dataset.bound = '1';
    $('#newTeamBtn').addEventListener('click', () => openTeamEditor(null));
    $('#teamCancel').addEventListener('click', closeTeamEditor);
    $('#teamPhotoBtn').addEventListener('click', async () => {
        const choice = await askImageSource();
        if (!choice) return;
        if (choice === 'file') { $('#teamPhotoInput').click(); return; }
        if (choice.url) { $('#teamPhoto').value = choice.url; toast('Foto aplicada ✅'); }
    });
    $('#teamPhotoInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo foto...');
        const url = await uploadFile(file, 'team');
        if (url) { $('#teamPhoto').value = url; toast('Foto lista ✅'); }
    });
    $('#teamSave').addEventListener('click', async () => {
        const name = $('#teamName').value.trim();
        if (!name) { toast('El nombre es obligatorio'); return; }
        const payload = {
            name,
            specialty: $('#teamSpecialty').value.trim() || null,
            cedula: $('#teamCedula').value.trim() || null,
            schedule: $('#teamSchedule').value.trim() || null,
            bio: $('#teamBio').value.trim() || null,
            phone: $('#teamPhone').value.trim() || null,
            whatsapp: $('#teamWhatsapp').value.replace(/\D/g, '') || null,
            email: $('#teamEmail').value.trim() || null,
            photo: $('#teamPhoto').value.trim() || null,
            is_active: $('#teamActive').checked,
            sort: (DATA.team || []).length
        };
        const { error } = editingTeamId
            ? await getSupabase().from('team').update(payload).eq('id', editingTeamId)
            : await getSupabase().from('team').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Miembro guardado ✅');
        if (!error) { closeTeamEditor(); await refreshTeamAdmin(); }
    });
}

// ━━━ 🖼️ GALERÍA (panel) ━━━
let editingGalleryId = null;

async function refreshGalleryAdmin() {
    let rows = [];
    try {
        const r = await getSupabase().from('gallery').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true });
        rows = r.data || [];
    } catch (e) { rows = []; }
    DATA.gallery = rows;
    renderGalleryAdmin();
}

function renderGalleryAdmin() {
    const el = $('#galleryTable');
    if (!el) return;
    if (!DATA.gallery.length) { el.innerHTML = '<p class="admin-empty">Sin imágenes todavía. Agrega la primera con "＋ Nueva imagen".</p>'; return; }
    el.innerHTML = `<div class="mat">
        <div class="mat-row mat-head"><span>Imagen</span><span>Leyenda</span><span>Estado</span><span>Acciones</span></div>` +
        slicePage(DATA.gallery, 'gallery').map(g => `<div class="mat-row">
            <span><img src="${g.image}" alt="" style="width:64px;height:48px;object-fit:cover;border-radius:8px;border:1px solid var(--A-line, rgba(255,255,255,.12));"></span>
            <span class="cell-muted">${escapeHtml(g.caption || '—')}</span>
            <span><span class="badge ${g.is_active ? 'published' : 'draft'}">${g.is_active ? 'Activa' : 'Oculta'}</span></span>
            <span class="cell-actions">
                <button class="admin-btn" data-editgallery="${g.id}" title="Editar">${ICONS.edit}</button>
                <button class="admin-btn danger" data-delgallery="${g.id}" title="Eliminar">${ICONS.trash}</button>
            </span>
        </div>`).join('') + `</div>` + pagerHTML('gallery', DATA.gallery.length);
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', async e => {
        const editBtn = e.target.closest('[data-editgallery]');
        const delBtn = e.target.closest('[data-delgallery]');
        if (editBtn) openGalleryEditor(editBtn.dataset.editgallery);
        else if (delBtn) {
            if (!await askConfirm({ title: 'Eliminar imagen', message: 'Se quitará de la galería inmediatamente.' })) return;
            const { error } = await getSupabase().from('gallery').delete().eq('id', delBtn.dataset.delgallery);
            toast(error ? 'Error al eliminar' : 'Imagen eliminada');
            if (!error) await refreshGalleryAdmin();
        }
    });
}

function openGalleryEditor(id) {
    editingGalleryId = id || null;
    const g = (DATA.gallery || []).find(x => String(x.id) === String(id)) || null;
    $('#galleryEditorTitle').textContent = g ? 'Editar imagen' : 'Nueva imagen';
    $('#galleryImage').value = g?.image || '';
    $('#galleryCaption').value = g?.caption || '';
    $('#galleryActive').checked = g ? g.is_active : true;
    $('#galleryEditor').hidden = false;
    $('#galleryEditor').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeGalleryEditor() { $('#galleryEditor').hidden = true; editingGalleryId = null; }

if ($('#newGalleryBtn') && !$('#newGalleryBtn').dataset.bound) {
    $('#newGalleryBtn').dataset.bound = '1';
    $('#newGalleryBtn').addEventListener('click', () => openGalleryEditor(null));
    $('#galleryCancel').addEventListener('click', closeGalleryEditor);
    $('#galleryImageBtn').addEventListener('click', async () => {
        const choice = await askImageSource();
        if (!choice) return;
        if (choice === 'file') { $('#galleryImageInput').click(); return; }
        if (choice.url) { $('#galleryImage').value = choice.url; toast('Imagen aplicada ✅'); }
    });
    $('#galleryImageInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'gallery');
        if (url) { $('#galleryImage').value = url; toast('Imagen lista ✅'); }
    });
    $('#gallerySave').addEventListener('click', async () => {
        const image = $('#galleryImage').value.trim();
        if (!image) { toast('La imagen es obligatoria'); return; }
        const payload = {
            image,
            caption: $('#galleryCaption').value.trim() || null,
            is_active: $('#galleryActive').checked,
            sort: (DATA.gallery || []).length
        };
        const { error } = editingGalleryId
            ? await getSupabase().from('gallery').update(payload).eq('id', editingGalleryId)
            : await getSupabase().from('gallery').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Imagen guardada ✅');
        if (!error) { closeGalleryEditor(); await refreshGalleryAdmin(); }
    });
}

// ━━━ 📖 HISTORIA (panel) ━━━
async function refreshStoryAdmin() {
    let row = null;
    try {
        const r = await getSupabase().from('story').select('*').order('id', { ascending: true }).limit(1);
        row = (r.data && r.data[0]) || null;
    } catch (e) { row = null; }
    DATA.storyRow = row;
    fillStoryForm(row);
}

function fillStoryForm(r) {
    $('#storyLabel').value = r?.label || '';
    $('#storyHeading').value = r?.heading || '';
    $('#storyImage').value = r?.image || '';
    $('#storyParagraphs').value = (r?.paragraphs || []).join('\n');
    $('#storyStats').value = (r?.stats || []).map(s => `${s.number} | ${s.label}`).join('\n');
    $('#storyPartnersOn').checked = !!r?.partners_enabled;
    $('#storyPartnersTitle').value = r?.partners_title || '';
    $('#storyPartners').value = (r?.partners || []).map(p => p.img ? `${p.name} | ${p.img}` : p.name).join('\n');
    $('#storyActive').checked = r ? r.is_active : true;
}

if ($('#storySave') && !$('#storySave').dataset.bound) {
    $('#storySave').dataset.bound = '1';
    $('#storyImageBtn').addEventListener('click', async () => {
        const choice = await askImageSource();
        if (!choice) return;
        if (choice === 'file') { $('#storyImageInput').click(); return; }
        if (choice.url) { $('#storyImage').value = choice.url; toast('Imagen aplicada ✅'); }
    });
    $('#storyImageInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'story');
        if (url) { $('#storyImage').value = url; toast('Imagen lista ✅'); }
    });
    $('#storySave').addEventListener('click', async () => {
        const payload = {
            label: $('#storyLabel').value.trim() || null,
            heading: $('#storyHeading').value.trim() || null,
            image: $('#storyImage').value.trim() || null,
            paragraphs: $('#storyParagraphs').value.split('\n').map(s => s.trim()).filter(Boolean),
            stats: $('#storyStats').value.split('\n').map(l => {
                const [n, ...rest] = l.split('|');
                return (n || '').trim() ? { number: n.trim(), label: (rest.join('|') || '').trim() } : null;
            }).filter(Boolean),
            partners_enabled: $('#storyPartnersOn').checked,
            partners_title: $('#storyPartnersTitle').value.trim() || null,
            partners: $('#storyPartners').value.split('\n').map(l => {
                const [name, ...rest] = l.split('|');
                return (name || '').trim() ? { name: name.trim(), img: (rest.join('|') || '').trim() || null } : null;
            }).filter(Boolean),
            is_active: $('#storyActive').checked
        };
        const existing = DATA.storyRow;
        const { error } = existing
            ? await getSupabase().from('story').update(payload).eq('id', existing.id)
            : await getSupabase().from('story').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Historia guardada ✅');
        if (!error) await refreshStoryAdmin();
    });
}

// ━━━ 💬 FILOSOFÍA (panel) ━━━
async function refreshPhilosophyAdmin() {
    let row = null;
    try {
        const r = await getSupabase().from('philosophy').select('*').order('id', { ascending: true }).limit(1);
        row = (r.data && r.data[0]) || null;
    } catch (e) { row = null; }
    DATA.philosophyRow = row;
    fillPhilosophyForm(row);
}

function fillPhilosophyForm(r) {
    $('#philoLabel').value = r?.label || '';
    $('#philoQuote').value = r?.quote || '';
    $('#philoAuthor').value = r?.author || '';
    $('#philoCta').value = r?.cta_label || '';
    $('#philoHref').value = r?.cta_href || '';
    $('#philoActive').checked = r ? r.is_active : true;
}

if ($('#philoSave') && !$('#philoSave').dataset.bound) {
    $('#philoSave').dataset.bound = '1';
    $('#philoSave').addEventListener('click', async () => {
        const payload = {
            label: $('#philoLabel').value.trim() || null,
            quote: $('#philoQuote').value.trim() || null,
            author: $('#philoAuthor').value.trim() || null,
            cta_label: $('#philoCta').value.trim() || null,
            cta_href: $('#philoHref').value.trim() || null,
            is_active: $('#philoActive').checked
        };
        const existing = DATA.philosophyRow;
        const { error } = existing
            ? await getSupabase().from('philosophy').update(payload).eq('id', existing.id)
            : await getSupabase().from('philosophy').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Filosofía guardada ✅');
        if (!error) await refreshPhilosophyAdmin();
    });
}

// ━━━  UBICACIÓN (panel) ━━━
async function refreshLocationAdmin() {
    let row = null;
    try {
        const r = await getSupabase().from('location').select('*').order('id', { ascending: true }).limit(1);
        row = (r.data && r.data[0]) || null;
    } catch (e) { row = null; }
    DATA.locationRow = row;
    fillLocationForm(row);
}

function fillLocationForm(r) {
    $('#locLabel').value = r?.label || '';
    $('#locHeading').value = r?.heading || '';
    $('#locSubtitle').value = r?.subtitle || '';
    $('#locAddress').value = r?.address || '';
    $('#locPhone').value = r?.phone || '';
    $('#locPhoneHref').value = r?.phone_href || '';
    $('#locHours').value = (r?.hours || []).map(h => `${h.d} | ${h.h}`).join('\n');
    $('#locImage').value = r?.image || '';
    $('#locQuery').value = r?.maps_query || '';
    $('#locActive').checked = r ? r.is_active : true;
}

if ($('#locSave') && !$('#locSave').dataset.bound) {
    $('#locSave').dataset.bound = '1';
    $('#locImageBtn').addEventListener('click', async () => {
        const choice = await askImageSource();
        if (!choice) return;
        if (choice === 'file') { $('#locImageInput').click(); return; }
        if (choice.url) { $('#locImage').value = choice.url; toast('Imagen aplicada ✅'); }
    });
    $('#locImageInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo imagen...');
        const url = await uploadFile(file, 'location');
        if (url) { $('#locImage').value = url; toast('Imagen lista ✅'); }
    });
    $('#locSave').addEventListener('click', async () => {
        const payload = {
            label: $('#locLabel').value.trim() || null,
            heading: $('#locHeading').value.trim() || null,
            subtitle: $('#locSubtitle').value.trim() || null,
            address: $('#locAddress').value.trim() || null,
            phone: $('#locPhone').value.trim() || null,
            phone_href: $('#locPhoneHref').value.trim() || null,
            hours: $('#locHours').value.split('\n').map(l => {
                const [d, ...rest] = l.split('|');
                return (d || '').trim() ? { d: d.trim(), h: (rest.join('|') || '').trim() } : null;
            }).filter(Boolean),
            image: $('#locImage').value.trim() || null,
            maps_query: $('#locQuery').value.trim() || null,
            is_active: $('#locActive').checked
        };
        const existing = DATA.locationRow;
        const { error } = existing
            ? await getSupabase().from('location').update(payload).eq('id', existing.id)
            : await getSupabase().from('location').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Ubicación guardada ✅');
        if (!error) await refreshLocationAdmin();
    });
}

// ━━━ 🏠 HERO (panel) ━━━
async function refreshHeroAdmin() {
    let row = null;
    try {
        const r = await getSupabase().from('hero').select('*').order('id', { ascending: true }).limit(1);
        row = (r.data && r.data[0]) || null;
    } catch (e) { row = null; }
    DATA.heroRow = row;
    fillHeroForm(row);
}

function fillHeroForm(r) {
    $('#heroEyebrow').value = r?.eyebrow || '';
    $('#heroLine1').value = r?.title_line1 || '';
    $('#heroLine2').value = r?.title_line2 || '';
    $('#heroWords').value = (r?.typewriter_words || []).join('\n');
    $('#heroSubtitle').value = r?.subtitle || '';
    $('#heroCta').value = r?.cta_label || '';
    $('#heroHref').value = r?.cta_href || '';
    $('#heroBg').value = r?.background_image || '';
    $('#heroSeal').value = r?.seal_image || '';
    $('#heroActive').checked = r ? r.is_active : true;
}

if ($('#heroSave') && !$('#heroSave').dataset.bound) {
    $('#heroSave').dataset.bound = '1';
    $('#heroBgBtn').addEventListener('click', async () => {
        const choice = await askImageSource();
        if (!choice) return;
        if (choice === 'file') { $('#heroBgInput').click(); return; }
        if (choice.url) { $('#heroBg').value = choice.url; toast('Fondo aplicado ✅'); }
    });
    $('#heroBgInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo fondo...');
        const url = await uploadFile(file, 'hero');
        if (url) { $('#heroBg').value = url; toast('Fondo listo ✅'); }
    });
    $('#heroSealBtn').addEventListener('click', async () => {
        const choice = await askImageSource();
        if (!choice) return;
        if (choice === 'file') { $('#heroSealInput').click(); return; }
        if (choice.url) { $('#heroSeal').value = choice.url; toast('Sello aplicado ✅'); }
    });
    $('#heroSealInput').addEventListener('change', async e => {
        const file = e.target.files[0]; e.target.value = '';
        if (!file) return;
        toast('Subiendo sello...');
        const url = await uploadFile(file, 'hero');
        if (url) { $('#heroSeal').value = url; toast('Sello listo ✅'); }
    });
    $('#heroSave').addEventListener('click', async () => {
        const payload = {
            eyebrow: $('#heroEyebrow').value.trim() || null,
            title_line1: $('#heroLine1').value.trim() || null,
            title_line2: $('#heroLine2').value.trim() || null,
            typewriter_words: $('#heroWords').value.split('\n').map(s => s.trim()).filter(Boolean),
            subtitle: $('#heroSubtitle').value.trim() || null,
            cta_label: $('#heroCta').value.trim() || null,
            cta_href: $('#heroHref').value.trim() || null,
            background_image: $('#heroBg').value.trim() || null,
            seal_image: $('#heroSeal').value.trim() || null,
            is_active: $('#heroActive').checked
        };
        const existing = DATA.heroRow;
        const { error } = existing
            ? await getSupabase().from('hero').update(payload).eq('id', existing.id)
            : await getSupabase().from('hero').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Hero guardado ✅');
        if (!error) await refreshHeroAdmin();
    });
}

// ━━━ 🤝 COLABORA B2B (panel) ━━━
async function refreshCollabAdmin() {
    let row = null;
    try {
        const r = await getSupabase().from('collab').select('*').order('id', { ascending: true }).limit(1);
        row = (r.data && r.data[0]) || null;
    } catch (e) { row = null; }
    DATA.collabRow = row;
    fillCollabForm(row);
}

function fillCollabForm(r) {
    $('#collabLabel').value = r?.label || '';
    $('#collabHeading').value = r?.heading || '';
    $('#collabSubtitle').value = r?.subtitle || '';
    $('#collabMarquee').value = (r?.marquee || []).join('\n');
    $('#collabPoints').value = (r?.points || []).map(p => `${p.icon || 'fa-handshake'} | ${p.title} | ${p.desc}`).join('\n');
    $('#collabCta').value = r?.cta || '';
    $('#collabBrochure').value = r?.brochure_url || '';
    $('#collabCta2').value = r?.cta_secondary || '';
    $('#collabWa').value = r?.whatsapp || '';
    $('#collabActive').checked = r ? r.is_active : true;
}

if ($('#collabSave') && !$('#collabSave').dataset.bound) {
    $('#collabSave').dataset.bound = '1';
    $('#collabSave').addEventListener('click', async () => {
        const payload = {
            label: $('#collabLabel').value.trim() || null,
            heading: $('#collabHeading').value.trim() || null,
            subtitle: $('#collabSubtitle').value.trim() || null,
            marquee: $('#collabMarquee').value.split('\n').map(s => s.trim()).filter(Boolean),
            points: $('#collabPoints').value.split('\n').map(l => {
                const parts = l.split('|').map(s => s.trim());
                if (parts.length >= 3) return { icon: parts[0] || 'fa-handshake', title: parts[1], desc: parts.slice(2).join(' | ') };
                if (parts.length === 2 && parts[0]) return { icon: 'fa-handshake', title: parts[0], desc: parts[1] };
                return null;
            }).filter(Boolean),
            cta: $('#collabCta').value.trim() || null,
            brochure_url: $('#collabBrochure').value.trim() || null,
            cta_secondary: $('#collabCta2').value.trim() || null,
            whatsapp: $('#collabWa').value.replace(/\D/g, '') || null,
            is_active: $('#collabActive').checked
        };
        const existing = DATA.collabRow;
        const { error } = existing
            ? await getSupabase().from('collab').update(payload).eq('id', existing.id)
            : await getSupabase().from('collab').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Colabora guardado ✅');
        if (!error) await refreshCollabAdmin();
    });
}

// ━━━ 🔍 NEGOCIO / SEO (panel) ━━━
async function refreshBusinessAdmin() {
    let row = null;
    try {
        const r = await getSupabase().from('business').select('*').order('id', { ascending: true }).limit(1);
        row = (r.data && r.data[0]) || null;
    } catch (e) { row = null; }
    DATA.businessRow = row;
    fillBusinessForm(row);
}

function fillBusinessForm(r) {
    const a = r?.address || {};
    $('#bizType').value = r?.type || 'LocalBusiness';
    $('#bizName').value = r?.name || '';
    $('#bizLegal').value = r?.legal_name || '';
    $('#bizTax').value = r?.tax_id || '';
    $('#bizDesc').value = r?.description || '';
    $('#bizUrl').value = r?.url || '';
    $('#bizLogo').value = r?.logo || '';
    $('#bizImage').value = r?.image || '';
    $('#bizPhone').value = r?.phone || '';
    $('#bizEmail').value = r?.email || '';
    $('#bizPrice').value = r?.price_range || '';
    $('#bizStreet').value = a.street || '';
    $('#bizCity').value = a.city || '';
    $('#bizState').value = a.state || '';
    $('#bizZip').value = a.zip || '';
    $('#bizCountry').value = a.country || 'MX';
    $('#bizLat').value = r?.geo_lat ?? '';
    $('#bizLng').value = r?.geo_lng ?? '';
    $('#bizHours').value = r?.hours || '';
    $('#bizSocial').value = (r?.social || []).join('\n');
    $('#bizRegistry').value = r?.registry_data || '';
    $('#bizFaqLabel').value = r?.faq_label || '';
    $('#bizFaqHeading').value = r?.faq_heading || '';
    $('#bizFaq').value = (r?.faq || []).map(f => `${f.q} | ${f.a}`).join('\n');
    $('#bizActive').checked = r ? r.is_active : true;
}

if ($('#bizSave') && !$('#bizSave').dataset.bound) {
    $('#bizSave').dataset.bound = '1';
    $('#bizSave').addEventListener('click', async () => {
        const payload = {
            type: $('#bizType').value || 'LocalBusiness',
            name: $('#bizName').value.trim() || null,
            legal_name: $('#bizLegal').value.trim() || null,
            tax_id: $('#bizTax').value.trim() || null,
            description: $('#bizDesc').value.trim() || null,
            url: $('#bizUrl').value.trim() || null,
            logo: $('#bizLogo').value.trim() || null,
            image: $('#bizImage').value.trim() || null,
            phone: $('#bizPhone').value.trim() || null,
            email: $('#bizEmail').value.trim() || null,
            price_range: $('#bizPrice').value.trim() || null,
            address: {
                street: $('#bizStreet').value.trim(),
                city: $('#bizCity').value.trim(),
                state: $('#bizState').value.trim(),
                zip: $('#bizZip').value.trim(),
                country: $('#bizCountry').value.trim() || 'MX'
            },
            geo_lat: $('#bizLat').value !== '' ? Number($('#bizLat').value) : null,
            geo_lng: $('#bizLng').value !== '' ? Number($('#bizLng').value) : null,
            hours: $('#bizHours').value.trim() || null,
            social: $('#bizSocial').value.split('\n').map(s => s.trim()).filter(Boolean),
            registry_data: $('#bizRegistry').value.trim() || null,
            faq_label: $('#bizFaqLabel').value.trim() || null,
            faq_heading: $('#bizFaqHeading').value.trim() || null,
            faq: $('#bizFaq').value.split('\n').map(l => {
                const [q, ...rest] = l.split('|');
                return (q || '').trim() ? { q: q.trim(), a: (rest.join('|') || '').trim() } : null;
            }).filter(Boolean),
            is_active: $('#bizActive').checked
        };
        const existing = DATA.businessRow;
        const { error } = existing
            ? await getSupabase().from('business').update(payload).eq('id', existing.id)
            : await getSupabase().from('business').insert([payload]);
        toast(error ? 'Error: ' + error.message : 'Datos del negocio guardados ✅');
        if (!error) await refreshBusinessAdmin();
    });
}

    initAuth();

})();