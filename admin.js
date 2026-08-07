/* ============================================================
   PANEL DE ADMINISTRACIÓN — SUPABASE
   Con editor completo de posts
   ✅ MEJORAS INTEGRADAS:
   1) Productos en BD (CRUD completo con variantes e imágenes)
   2) Paginación en todas las tablas (10 registros por página)
   3) Barra de formato (negrita/cursiva/H2/listas/citas) en el editor
   4) Modal de confirmación robusto para acciones destructivas
   ============================================================ */
(function() {
"use strict";
const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
const supabase = window.supabase.createClient(C.supabase.url, C.supabase.key);
const STORAGE_BUCKET = C.supabase?.storageBucket || 'blog-images';

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function escapeHtml(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function money(n) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n || 0); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : ''; }
function toast(msg) { const t = $('#adminToast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); }

let DATA = { posts: [], comments: [], orders: [], coupons: [], categories: [], likes: [], testimonials: [], products: [], appointments: [], services: [] };
let editImagesArr = [];

// ─── ICONOS SVG (se ven premium en cualquier dispositivo) ───
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

// ✅ Iconos Font Awesome (activa con USE_FONTAWESOME = true)
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
const USE_FONTAWESOME = true; // ← ponlo en true para usar FA
const ICONS = USE_FONTAWESOME ? ICONS_FA : ICONS_SVG;

// ─── ✅ PAGINACIÓN (10 registros por página) ───
const PAGE_SIZE = 10;
const pageState = { posts: 1, comments: 1, orders: 1, coupons: 1, testimonials: 1, products: 1, appointments: 1, services: 1 };
function slicePage(arr, key) {
    const pages = Math.max(1, Math.ceil(arr.length / PAGE_SIZE));
    if (pageState[key] > pages) pageState[key] = pages;
    const start = (pageState[key] - 1) * PAGE_SIZE;
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
document.addEventListener('click', e => {
    const btn = e.target.closest('[data-page-key]');
    if (!btn || btn.disabled) return;
    pageState[btn.dataset.pageKey] = Number(btn.dataset.page);
    renderAll();
});

// ─── ✅ MODAL DE CONFIRMACIÓN (acciones destructivas) ───
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
                </div></div>`;
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

// ─── ✅ BARRA DE FORMATO (markdown ligero y seguro) ───
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
    const scope = textarea.closest('form, .admin-editor-card, .new-post-inner');
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

// ─── AUTH ──
async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) showApp();
    else $('#adminLogin').style.display = 'flex';
}

$('#adminLoginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true; btn.textContent = 'Verificando...';
    const { error } = await supabase.auth.signInWithPassword({ email: $('#adminEmail').value, password: $('#adminPassword').value });
    btn.disabled = false; btn.textContent = 'Entrar';
    if (error) { $('#adminLoginError').textContent = 'Credenciales inválidas'; return; }
    showApp();
});

$('#adminLogout').addEventListener('click', async () => { await supabase.auth.signOut(); location.reload(); });

async function showApp() {
$('#adminLogin').style.display = 'none';
$('#adminApp').hidden = false;
applyAdminTabsVisibility();   // ✅ oculta pestañas de módulos apagados
await loadAll();
renderAll();
}

// ─── CARGA DE DATOS ───
async function loadAll() {
  const [posts, comments, orders, coupons, categories, likes, testimonials, appointments] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.from('post_comments').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('coupons').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
    supabase.from('post_likes').select('post_id'),
    supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
    supabase.from('appointments').select('*').order('created_at', { ascending: false })
  ]);
  DATA.posts = posts.data || [];
  DATA.comments = comments.data || [];
  DATA.orders = orders.data || [];
  DATA.coupons = coupons.data || [];
  DATA.categories = categories.data || [];
  DATA.likes = likes.data || [];
  DATA.testimonials = testimonials.data || [];
  DATA.appointments = appointments.data || [];
  try {
    const prod = await supabase.from('products').select('*').order('created_at', { ascending: false });
    DATA.products = prod.data || [];
  } catch (e) { DATA.products = []; console.warn('Tabla products no disponible'); }

  try {
  const srv = await supabase.from('services').select('*').order('sort', { ascending: true }).order('created_at', { ascending: true });
  DATA.services = srv.data || [];
} catch (e) { DATA.services = []; console.warn('Tabla services no disponible'); }
}

function renderAll() {
    renderDashboard();
    renderPosts();
    renderProductsAdmin();
    renderComments();
    renderOrders();
    renderCoupons();
    renderCategories();
    renderTestimonials();
    renderAppointments();
    renderServicesAdmin();
}

// ─── CITAS (✅ paginado + estado + confirmación) ───
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
    <td class="cell-muted">${escapeHtml(a.date)} · ${escapeHtml(a.slot)}</td>
    <td><span class="cell-clamp">${escapeHtml(a.reason || '—')}</span></td>
    <td><select class="admin-select" data-appt="${a.id}">
      ${['pending', 'confirmed', 'cancelled'].map(s => `<option value="${s}" ${a.status === s ? 'selected' : ''}>${s === 'pending' ? 'Pendiente' : s === 'confirmed' ? 'Confirmada' : 'Cancelada'}</option>`).join('')}
    </select></td>
    <td class="cell-actions">
      <button class="admin-btn danger" data-delappt="${a.id}" title="Eliminar">${ICONS.trash}</button>
    </td>
  </tr>`).join('') + `</tbody></table>` + pagerHTML('appointments', DATA.appointments.length);

  el.querySelectorAll('select[data-appt]').forEach(sel => sel.addEventListener('change', async () => {
    const { error } = await supabase.from('appointments').update({ status: sel.value }).eq('id', sel.dataset.appt);
    toast(error ? 'Error al actualizar' : 'Cita actualizada');
    if (!error) { await loadAll(); renderDashboard(); renderAppointments(); }
  }));
  el.querySelectorAll('[data-delappt]').forEach(btn => btn.addEventListener('click', async () => {
    if (!await askConfirm({ title: 'Eliminar cita', message: 'Esta acción no se puede deshacer.' })) return;
    const { error } = await supabase.from('appointments').delete().eq('id', btn.dataset.delappt);
    toast(error ? 'Error al eliminar' : 'Cita eliminada');
    if (!error) { await loadAll(); renderAppointments(); }
  }));
}

// Oculta el tab 📅 Citas si el cliente no usa el bloque
if (C.appointments?.enabled !== true) {
  const b = document.querySelector('[data-view="appointments"]');
  if (b) b.style.display = 'none';
}

// ─── NAVEGACIÓN + ACCESO DIRECTO CONTEXTUAL ───
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
        viewShortcut.hidden = true; // en las demás pestañas no aparece
    }
}
$$('.admin-sidebar nav button').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.admin-sidebar nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.admin-view').forEach(v => v.classList.remove('active'));
        $('#view-' + btn.dataset.view).classList.add('active');
        updateViewShortcut(btn.dataset.view);
    });
});
updateViewShortcut('dashboard'); // estado inicial: oculto

// ─── DASHBOARD (✅ solo muestra tarjetas de módulos activos) ───
function renderDashboard() {
  const stats = [];

  // 📝 Blog
  if (C.blog?.enabled !== false) {
    stats.push(
      { n: DATA.posts.length, l: 'Posts' },
      { n: DATA.posts.filter(p => p.status === 'published').length, l: 'Publicados' },
      { n: DATA.comments.length, l: 'Comentarios' },
      { n: DATA.likes.length, l: 'Likes' }
    );
  }

  // 🛒 Ecommerce (productos + órdenes + cupones + ventas)
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

  // 🌟 Testimonios
  if (C.testimonials?.enabled !== false) {
    stats.push({ n: DATA.testimonials.length, l: 'Testimonios' });
  }

  // 📅 Citas (solo si el módulo está activo)
  if (C.appointments?.enabled === true) {
    stats.push({ n: (DATA.appointments || []).filter(a => a.status === 'pending').length, l: 'Citas pend.' });
  }

  $('#adminStats').innerHTML = stats.map(s =>
    `<div class="admin-stat"><div class="num">${s.n}</div><div class="lbl">${s.l}</div></div>`
  ).join('') || '<p class="admin-empty">Sin módulos activos</p>';
}

// ─── POSTS (✅ paginado + confirmación) ───
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

    el.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openPostEditor(btn.dataset.edit)));
    el.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', async () => {
        const post = DATA.posts.find(p => String(p.id) === String(btn.dataset.toggle));
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        const { error } = await supabase.from('posts').update({ status: newStatus }).eq('id', post.id);
        toast(error ? 'Error al actualizar' : (newStatus === 'published' ? 'Post publicado' : 'Post ocultado'));
        if (!error) { await loadAll(); renderAll(); }
    }));
    el.querySelectorAll('[data-delpost]').forEach(btn => btn.addEventListener('click', async () => {
        const postDel = DATA.posts.find(x => String(x.id) === String(btn.dataset.delpost));
        if (!await askConfirm({ title: 'Eliminar post', message: `Se eliminará "${postDel ? postDel.title : ''}" junto con sus comentarios y likes.` })) return;
        const { error } = await supabase.from('posts').delete().eq('id', btn.dataset.delpost);
        toast(error ? 'Error al eliminar' : 'Post eliminado');
        if (!error) { await loadAll(); renderAll(); }
    }));
}

// ─── COMENTARIOS (✅ paginado + confirmación) ───
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

    el.querySelectorAll('[data-delcom]').forEach(btn => btn.addEventListener('click', async () => {
        if (!await askConfirm({ title: 'Eliminar comentario', message: 'Esta acción no se puede deshacer.' })) return;
        const { error } = await supabase.from('post_comments').delete().eq('id', btn.dataset.delcom);
        toast(error ? 'Error al eliminar' : 'Comentario eliminado');
        if (!error) { await loadAll(); renderAll(); }
    }));
}

// ─── ÓRDENES (✅ paginado) ───
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

    el.querySelectorAll('select[data-order]').forEach(sel => sel.addEventListener('change', async () => {
        const { error } = await supabase.from('orders').update({ status: sel.value }).eq('id', sel.dataset.order);
        toast(error ? 'Error al actualizar' : 'Estado actualizado');
        if (!error) { await loadAll(); renderDashboard(); }
    }));
}

// ─── CUPONES (✅ paginado + confirmación) ───
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
  el.querySelectorAll('[data-togcoupon]').forEach(btn => btn.addEventListener('click', async () => {
    const cup = DATA.coupons.find(c => String(c.id) === String(btn.dataset.togcoupon));
    await supabase.from('coupons').update({ is_active: !cup.is_active }).eq('id', cup.id);
    await loadAll(); renderCoupons(); toast('Cupón actualizado');
  }));
  el.querySelectorAll('[data-delcoupon]').forEach(btn => btn.addEventListener('click', async () => {
    if (!await askConfirm({ title: 'Eliminar cupón', message: 'El código dejará de funcionar y desaparecerá del popup inmediatamente.' })) return;
    await supabase.from('coupons').delete().eq('id', btn.dataset.delcoupon);
    await loadAll(); renderCoupons(); toast('Cupón eliminado');
  }));
}

$('#couponForm').addEventListener('submit', async e => {
  e.preventDefault();
  const code = $('#couponCode').value.trim().toUpperCase();
  const until = $('#couponUntil').value ? new Date($('#couponUntil').value).toISOString() : null;
  const { error } = await supabase.from('coupons').insert([{
    code, type: $('#couponType').value, value: Number($('#couponValue').value), valid_until: until,
    // ✅ Datos del popup visual
    title: $('#couponTitle').value.trim() || null,
    subtitle: $('#couponSubtitle').value.trim() || null,
    description: $('#couponDesc').value.trim() || null,
    badge: $('#couponBadge').value.trim() || '🔥 OFERTA',
    accent: $('#couponAccent').value,
    show_in_popup: $('#couponPopup').checked
  }]);
  toast(error ? 'Error: ' + error.message : 'Cupón creado');
  if (!error) { e.target.reset(); $('#couponBadge').value = '🔥 OFERTA'; await loadAll(); renderCoupons(); }
});

// ─── CATEGORÍAS (✅ confirmación) ───
function renderCategories() {
    const el = $('#categoriesTable');
    if (!DATA.categories.length) { el.innerHTML = '<p class="admin-empty">Sin categorías</p>'; return; }
    el.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Nombre</th><th>Slug</th><th>Acciones</th>
    </tr></thead><tbody>` +
        DATA.categories.map(c => `<tr>
            <td><span class="cell-author">${escapeHtml(c.name)}</span></td>
            <td><span class="cell-muted">/${escapeHtml(c.slug)}</span></td>
            <td class="cell-actions">
                <button class="admin-btn danger" data-delcat="${c.id}" title="Eliminar">${ICONS.trash}</button>
            </td>
        </tr>`).join('') + `</tbody></table>`;

    el.querySelectorAll('[data-delcat]').forEach(btn => btn.addEventListener('click', async () => {
        if (!await askConfirm({ title: 'Eliminar categoría', message: 'Los posts existentes conservarán su categoría actual.' })) return;
        await supabase.from('categories').delete().eq('id', btn.dataset.delcat);
        await loadAll(); renderCategories(); toast('Categoría eliminada');
    }));
}

$('#categoryForm').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#categoryName').value.trim();
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('categories').insert([{ name, slug }]);
    toast(error ? 'Error: ' + error.message : 'Categoría agregada');
    if (!error) { e.target.reset(); await loadAll(); renderCategories(); }
});

// ════════════════════════════════════════════════════════════
// EDITOR DE POSTS
// ════════════════════════════════════════════════════════════

// Subida genérica a Supabase Storage
async function uploadFile(file, prefix) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file);
    if (error) { toast('Error al subir imagen: ' + error.message); return null; }
    return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName).data.publicUrl;
}

// Renderizar miniaturas de imágenes de portada en el editor
function renderEditImages() {
    const el = $('#editImages');
    el.innerHTML = editImagesArr.map((url, i) => `
        <div class="admin-editor-img">
            <img src="${url}" alt="Portada ${i + 1}">
            <button type="button" data-rmimg="${i}" aria-label="Quitar imagen">✕</button>
        </div>`).join('');
    el.querySelectorAll('[data-rmimg]').forEach(b => b.addEventListener('click', () => {
        editImagesArr.splice(+b.dataset.rmimg, 1);
        renderEditImages();
    }));
}

// Abrir editor con datos del post
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

// Cerrar editor
$('#postEditorClose').addEventListener('click', () => $('#postEditor').classList.remove('open'));
$('#newPostAdminBtn').addEventListener('click', () => openPostEditor(null));

// Agregar imagen de portada
$('#editAddCover').addEventListener('click', () => $('#editCoverInput').click());
$('#editCoverInput').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    toast('Subiendo imagen...');
    const url = await uploadFile(file, 'cover');
    if (url) { editImagesArr.push(url); renderEditImages(); toast('Imagen agregada'); }
    e.target.value = '';
});

// Insertar imagen inline en el contenido
$('#editInsertImage').addEventListener('click', () => $('#editImageInput').click());
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

// ✅ Barra de formato en el editor de posts
const editTa = $('#editContent');
if (editTa) { editTa.insertAdjacentHTML('beforebegin', MD_TOOLBAR_HTML); attachMdToolbar(editTa); }

// Guardar cambios del post
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
        ? await supabase.from('posts').update(payload).eq('id', id)
        : await supabase.from('posts').insert([{ ...payload, created_at: new Date().toISOString() }]);

    btn.disabled = false; btn.textContent = originalText;
    if (error) { toast('Error: ' + error.message); return; }
    toast(id ? 'Post actualizado' : '✅ Post creado y publicado');
    $('#postEditor').classList.remove('open');
    await loadAll();
    renderAll();
});

// ─── TESTIMONIOS (✅ paginado + confirmación) ───
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
            <button class="admin-btn" data-togtest="${t.id}" title="${t.is_active ? 'Ocultar' : 'Mostrar'}">${t.is_active ? ICONS.eyeOff : ICONS.eye}</button>
            <button class="admin-btn danger" data-deltest="${t.id}" title="Eliminar">${ICONS.trash}</button>
        </td>
    </tr>`).join('') + `</tbody></table>` + pagerHTML('testimonials', DATA.testimonials.length);

    el.querySelectorAll('[data-togtest]').forEach(btn => btn.addEventListener('click', async () => {
        const t = DATA.testimonials.find(x => String(x.id) === String(btn.dataset.togtest));
        await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
        await loadAll(); renderTestimonials(); toast('Testimonio actualizado');
    }));
    el.querySelectorAll('[data-deltest]').forEach(btn => btn.addEventListener('click', async () => {
        if (!await askConfirm({ title: 'Eliminar testimonio', message: 'Se quitará definitivamente del sitio.' })) return;
        await supabase.from('testimonials').delete().eq('id', btn.dataset.deltest);
        await loadAll(); renderTestimonials(); toast('Testimonio eliminado');
    }));
}

function renderTestimonialPhotos() {
    const el = $('#tPhotos');
    if (!el) return;
    el.innerHTML = tPhotosArr.map((url, i) => `
        <div class="admin-editor-img"><img src="${url}" alt=""><button type="button" data-rmt="${i}">✕</button></div>`).join('');
    el.querySelectorAll('[data-rmt]').forEach(b => b.addEventListener('click', () => {
        tPhotosArr.splice(+b.dataset.rmt, 1); renderTestimonialPhotos();
    }));
}

const tAddPhoto = $('#tAddPhoto');
if (tAddPhoto) {
    tAddPhoto.addEventListener('click', () => $('#tPhotoInput').click());
    $('#tPhotoInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        toast('Subiendo foto...');
        const url = await uploadFile(file, 'testimonio');
        if (url) { tPhotosArr.push(url); renderTestimonialPhotos(); }
        e.target.value = '';
    });
}

const testimonialForm = $('#testimonialForm');
if (testimonialForm) testimonialForm.addEventListener('submit', async e => {
    e.preventDefault();
    const author = $('#tAuthor').value.trim();
    const comment = $('#tComment').value.trim();
    if (!author || !comment) return;
    const { error } = await supabase.from('testimonials').insert([{
        author,
        comment,
        location: $('#tLocation').value.trim() || null,
        source: $('#tSource').value,
        rating: Number($('#tRating').value),
        images: tPhotosArr,
        is_active: true,
    }]);
    toast(error ? 'Error: ' + error.message : 'Testimonio publicado');
    if (!error) {
        e.target.reset(); tPhotosArr = []; renderTestimonialPhotos();
        await loadAll(); renderTestimonials();
    }
});

// ════════════════════════════════════════════════════════════
// PRODUCTOS (CRUD completo en BD)
// ════════════════════════════════════════════════════════════
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
    el.querySelectorAll('[data-prodedit]').forEach(b => b.addEventListener('click', () => openProductEditor(+b.dataset.prodedit)));
    el.querySelectorAll('[data-prodtoggle]').forEach(b => b.addEventListener('click', async () => {
        const p = DATA.products.find(x => String(x.id) === String(b.dataset.prodtoggle));
        await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
        toast('Producto actualizado'); await loadAll(); renderProductsAdmin();
    }));
    el.querySelectorAll('[data-proddel]').forEach(b => b.addEventListener('click', async () => {
        const p = DATA.products.find(x => String(x.id) === String(b.dataset.proddel));
        if (!await askConfirm({ title: 'Eliminar producto', message: `Se eliminará "${p.name}" de la tienda de forma permanente.` })) return;
        const { error } = await supabase.from('products').delete().eq('id', p.id);
        toast(error ? 'Error al eliminar' : 'Producto eliminado');
        if (!error) { await loadAll(); renderAll(); }
    }));
}
function renderProdImages() {
    const el = $('#prodImages');
    el.innerHTML = prodImagesArr.map((url, i) => `
        <div class="admin-editor-img">
            <img src="${url}" alt="Portada ${i + 1}">
            <span class="img-number">${i + 1}</span>
            <button type="button" data-rm="${i}" aria-label="Quitar imagen">✕</button>
        </div>`).join('');
    el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
        prodImagesArr.splice(+b.dataset.rm, 1);
        // Si una variante usaba esa imagen, reasignar a la primera disponible
        prodVariantsArr.forEach(v => {
            if (v.image && !prodImagesArr.includes(v.image)) v.image = prodImagesArr[0] || '';
        });
        renderProdImages(); renderProdVariants();
    }));
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

    wrap.querySelectorAll('.v-name').forEach((inp, i) => inp.addEventListener('input', () => prodVariantsArr[i].name = inp.value));
    wrap.querySelectorAll('.v-price').forEach((inp, i) => inp.addEventListener('input', () => prodVariantsArr[i].price = Number(inp.value) || 0));
    wrap.querySelectorAll('.v-stock').forEach((inp, i) => inp.addEventListener('change', () => prodVariantsArr[i].inStock = inp.checked));
    wrap.querySelectorAll('.v-del').forEach((b, i) => b.addEventListener('click', () => { prodVariantsArr.splice(i, 1); renderProdVariants(); }));
    wrap.querySelectorAll('.v-imgsel').forEach((sel, i) => sel.addEventListener('change', () => {
        const idx = Number(sel.value);
        if (idx >= 0) prodVariantsArr[i].image = prodImagesArr[idx];
    }));
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
$('#prodAddImg').addEventListener('click', () => $('#prodImgInput').click());
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
        ? await supabase.from('products').update(payload).eq('id', id)
        : await supabase.from('products').insert([payload]);
    toast(error ? 'Error: ' + error.message : 'Producto guardado');
    if (!error) { $('#productEditor').classList.remove('open'); await loadAll(); renderAll(); }
});

// ─── ✅ CATEGORÍA AL VUELO DESDE EL EDITOR DE POSTS ───
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
        const { error } = await supabase.from('categories').insert([{ name, slug }]);
        if (error) { toast('Error: ' + error.message); return; }
        await loadAll();               // refresca DATA.categories
        refreshCategorySelect(slug);   // repinta el select y la deja seleccionada
        catQuickName.value = '';
        catQuickForm.hidden = true;
        toast('Categoría creada y seleccionada ✅');
    });
    catQuickName.addEventListener('keypress', e => {
        if (e.key === 'Enter') { e.preventDefault(); catQuickSave.click(); }
    });
}

// ─── ✅ OCULTAR PESTAÑAS DE MÓDULOS DESACTIVADOS ───
function applyAdminTabsVisibility() {
  const rules = {
    posts:        C.blog?.enabled !== false,
    categories:   C.blog?.enabled !== false,
    comments:     C.blog?.enabled !== false,
    products:     C.ecommerce?.enabled !== false,
    orders:       C.ecommerce?.enabled !== false,
    coupons:      C.ecommerce?.enabled !== false,
    testimonials: C.testimonials?.enabled !== false,
    appointments: C.appointments?.enabled === true,
  };
  Object.entries(rules).forEach(([view, visible]) => {
    const btn = document.querySelector(`.admin-sidebar nav button[data-view="${view}"]`);
    if (btn) btn.style.display = visible ? '' : 'none';
  });
  // Si la pestaña activa quedó oculta, regresa al Dashboard
  const activeBtn = document.querySelector('.admin-sidebar nav button.active');
  if (activeBtn && activeBtn.style.display === 'none') {
    document.querySelector('.admin-sidebar nav button[data-view="dashboard"]')?.click();
  }
}

// ─── ✅ SERVICIOS (CRUD + formato markdown) ───
let editingServiceId = null;

(function attachServiceToolbar() {
  const ta = $('#serviceContent');
  const toolbar = $('#serviceMdToolbar');
  if (!ta || !toolbar) return;
  const actions = {
    bold:   { before: '**', after: '**', ph: 'texto en negrita' },
    italic: { before: '*',  after: '*',  ph: 'texto en cursiva' },
    h2:     { line: '## ' },
    list:   { line: '- ' },
    quote:  { line: '> ' }
  };
  toolbar.addEventListener('click', e => {
    const btn = e.target.closest('[data-md]');
    if (!btn) return;
    e.preventDefault();
    const a = actions[btn.dataset.md];
    const s = ta.selectionStart, en = ta.selectionEnd;
    const sel = ta.value.slice(s, en) || (a.ph || 'texto');
    const insert = a.line ? ('\n' + a.line + sel) : (a.before + sel + a.after);
    ta.setRangeText(insert, s, en, 'end');
    ta.focus();
  });
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
  el.querySelectorAll('[data-editservice]').forEach(b => b.addEventListener('click', () => openServiceEditor(b.dataset.editservice)));
  el.querySelectorAll('[data-delservice]').forEach(b => b.addEventListener('click', async () => {
    if (!await askConfirm({ title: 'Eliminar servicio', message: 'Se quitará del sitio inmediatamente.' })) return;
    const { error } = await supabase.from('services').delete().eq('id', b.dataset.delservice);
    toast(error ? 'Error al eliminar' : 'Servicio eliminado');
    if (!error) { await loadAll(); renderServicesAdmin(); }
  }));
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
    ? await supabase.from('services').update(payload).eq('id', editingServiceId)
    : await supabase.from('services').insert([payload]);
  toast(error ? 'Error: ' + error.message : 'Servicio guardado ✅');
  if (!error) { closeServiceEditor(); await loadAll(); renderServicesAdmin(); }
});
$('#serviceImgBtn').addEventListener('click', () => $('#serviceImgInput').click());
$('#serviceImgInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  toast('Subiendo imagen...');
  try {
    const ext = file.name.split('.').pop();
    const name = `servicio-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('blog-images').upload(name, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('blog-images').getPublicUrl(name);
    $('#serviceImage').value = data.publicUrl;
    toast('Imagen lista ✅');
  } catch (err) { toast('Error al subir: ' + err.message); }
  e.target.value = '';
});

// ─── INIT ───
initAuth();
})();