/* ============================================================
   PANEL DE ADMINISTRACIÓN — SUPABASE
   Con editor completo de posts
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

let DATA = { posts: [], comments: [], orders: [], coupons: [], categories: [], likes: [], testimonials: [] };
let editImagesArr = [];

// ─── ICONOS SVG (se ven premium en cualquier dispositivo) ───
const ICONS = {
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    ban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
};

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
    await loadAll();
    renderAll();
}

// ─── CARGA DE DATOS ───
async function loadAll() {
    const [posts, comments, orders, coupons, categories, likes, testimonials] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('post_comments').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('post_likes').select('post_id'),
        supabase.from('testimonials').select('*').order('created_at', { ascending: false })
    ]);
    DATA.posts = posts.data || [];
    DATA.comments = comments.data || [];
    DATA.orders = orders.data || [];
    DATA.coupons = coupons.data || [];
    DATA.categories = categories.data || [];
    DATA.likes = likes.data || [];
    DATA.testimonials = testimonials.data || [];
}

function renderAll() {
    renderDashboard();
    renderPosts();
    renderComments();
    renderOrders();
    renderCoupons();
    renderCategories();
    renderTestimonials();
}

// ─── NAVEGACIÓN ───
$$('.admin-sidebar nav button').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.admin-sidebar nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.admin-view').forEach(v => v.classList.remove('active'));
        $('#view-' + btn.dataset.view).classList.add('active');
    });
});

// ─── DASHBOARD ───
function renderDashboard() {
    const pending = DATA.orders.filter(o => o.status === 'pending').length;
    const revenue = DATA.orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total || 0), 0);
    $('#adminStats').innerHTML = `
        <div class="admin-stat"><div class="num">${DATA.posts.length}</div><div class="lbl">Posts</div></div>
        <div class="admin-stat"><div class="num">${DATA.posts.filter(p => p.status === 'published').length}</div><div class="lbl">Publicados</div></div>
        <div class="admin-stat"><div class="num">${DATA.comments.length}</div><div class="lbl">Comentarios</div></div>
        <div class="admin-stat"><div class="num">${DATA.likes.length}</div><div class="lbl">Likes</div></div>
        <div class="admin-stat"><div class="num">${DATA.orders.length}</div><div class="lbl">Órdenes</div></div>
        <div class="admin-stat"><div class="num">${pending}</div><div class="lbl">Pendientes</div></div>
        <div class="admin-stat"><div class="num">${money(revenue)}</div><div class="lbl">Ventas</div></div>
    `;
}

// ─── POSTS ───
function renderPosts() {
    const el = $('#postsTable');
    if (!DATA.posts.length) { el.innerHTML = '<p class="admin-empty">Sin posts todavía</p>'; return; }
    const likes = {}, coms = {};
    DATA.likes.forEach(l => likes[l.post_id] = (likes[l.post_id] || 0) + 1);
    DATA.comments.forEach(c => coms[c.post_id] = (coms[c.post_id] || 0) + 1);

    el.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Título</th><th>Categoría</th><th>Estado</th><th>Interacción</th><th>Fecha</th><th>Acciones</th>
    </tr></thead><tbody>` + DATA.posts.map(p => `<tr>
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
    </tr>`).join('') + `</tbody></table>`;

    el.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openPostEditor(btn.dataset.edit)));
    el.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', async () => {
        const post = DATA.posts.find(p => p.id === btn.dataset.toggle);
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        const { error } = await supabase.from('posts').update({ status: newStatus }).eq('id', post.id);
        toast(error ? 'Error al actualizar' : (newStatus === 'published' ? 'Post publicado' : 'Post ocultado'));
        if (!error) { await loadAll(); renderAll(); }
    }));
    el.querySelectorAll('[data-delpost]').forEach(btn => btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este post? También se borran sus comentarios y likes.')) return;
        const { error } = await supabase.from('posts').delete().eq('id', btn.dataset.delpost);
        toast(error ? 'Error al eliminar' : 'Post eliminado');
        if (!error) { await loadAll(); renderAll(); }
    }));
}

// ─── COMENTARIOS ───
function renderComments() {
    const el = $('#commentsTable');
    if (!DATA.comments.length) { el.innerHTML = '<p class="admin-empty">Sin comentarios</p>'; return; }
    el.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Autor</th><th>Comentario</th><th>Post</th><th>Fecha</th><th>Acciones</th>
    </tr></thead><tbody>` + DATA.comments.map(c => {
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
    }).join('') + `</tbody></table>`;

    el.querySelectorAll('[data-delcom]').forEach(btn => btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este comentario?')) return;
        const { error } = await supabase.from('post_comments').delete().eq('id', btn.dataset.delcom);
        toast(error ? 'Error al eliminar' : 'Comentario eliminado');
        if (!error) { await loadAll(); renderAll(); }
    }));
}

// ─── ÓRDENES ───
function renderOrders() {
    const el = $('#ordersTable');
    if (!DATA.orders.length) { el.innerHTML = '<p class="admin-empty">Sin órdenes todavía</p>'; return; }
    el.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Items</th>
    </tr></thead><tbody>` + DATA.orders.map(o => `<tr>
        <td>${fmtDate(o.created_at)}</td>
        <td>${escapeHtml(o.customer_name || '—')}</td>
        <td>${money(o.total)}</td>
        <td><select class="admin-select" data-order="${o.id}">
            ${['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s =>
                `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select></td>
        <td><div class="admin-items">${(o.items || []).map(i =>
            `${escapeHtml(i.name)}${i.variant ? ' (' + escapeHtml(i.variant) + ')' : ''} ×${i.qty}`).join('<br>')}</div></td>
    </tr>`).join('') + `</tbody></table>`;

    el.querySelectorAll('select[data-order]').forEach(sel => sel.addEventListener('change', async () => {
        const { error } = await supabase.from('orders').update({ status: sel.value }).eq('id', sel.dataset.order);
        toast(error ? 'Error al actualizar' : 'Estado actualizado');
        if (!error) { await loadAll(); renderDashboard(); }
    }));
}

// ─── CUPONES ───
function renderCoupons() {
    const el = $('#couponsTable');
    if (!DATA.coupons.length) { el.innerHTML = '<p class="admin-empty">Sin cupones</p>'; return; }
    el.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Código</th><th>Tipo</th><th>Valor</th><th>Vence</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>` + DATA.coupons.map(c => `<tr>
        <td><span class="coupon-code">${escapeHtml(c.code)}</span></td>
        <td class="cell-muted">${c.type === 'percent' ? 'Porcentaje' : 'Fijo'}</td>
        <td class="cell-value">${c.type === 'percent' ? c.value + '%' : money(c.value)}</td>
        <td class="cell-date">${c.valid_until ? fmtDate(c.valid_until) : 'Sin límite'}</td>
        <td><span class="badge ${c.is_active ? 'published' : 'draft'}">${c.is_active ? 'Activo' : 'Inactivo'}</span></td>
        <td class="cell-actions">
            <button class="admin-btn" data-togcoupon="${c.id}" title="${c.is_active ? 'Desactivar' : 'Activar'}">${c.is_active ? ICONS.ban : ICONS.check}</button>
            <button class="admin-btn danger" data-delcoupon="${c.id}" title="Eliminar">${ICONS.trash}</button>
        </td>
    </tr>`).join('') + `</tbody></table>`;

    el.querySelectorAll('[data-togcoupon]').forEach(btn => btn.addEventListener('click', async () => {
        const cup = DATA.coupons.find(c => c.id === btn.dataset.togcoupon);
        await supabase.from('coupons').update({ is_active: !cup.is_active }).eq('id', cup.id);
        await loadAll(); renderCoupons(); toast('Cupón actualizado');
    }));
    el.querySelectorAll('[data-delcoupon]').forEach(btn => btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este cupón?')) return;
        await supabase.from('coupons').delete().eq('id', btn.dataset.delcoupon);
        await loadAll(); renderCoupons(); toast('Cupón eliminado');
    }));
}

$('#couponForm').addEventListener('submit', async e => {
    e.preventDefault();
    const code = $('#couponCode').value.trim().toUpperCase();
    const until = $('#couponUntil').value ? new Date($('#couponUntil').value).toISOString() : null;
    const { error } = await supabase.from('coupons').insert([{
        code, type: $('#couponType').value, value: Number($('#couponValue').value), valid_until: until
    }]);
    toast(error ? 'Error: ' + error.message : 'Cupón creado');
    if (!error) { e.target.reset(); await loadAll(); renderCoupons(); }
});

// ─── CATEGORÍAS ───
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
        if (!confirm('¿Eliminar esta categoría?')) return;
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
// EDITOR DE POSTS (nuevo)
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
    const p = DATA.posts.find(x => x.id === id);
    if (!p) return;
    $('#editPostId').value = p.id;
    $('#editTitle').value = p.title || '';
    $('#editSubtitle').value = p.subtitle || '';
    $('#editAuthor').value = p.author || '';
    $('#editExcerpt').value = p.excerpt || '';
    $('#editContent').value = p.content || '';
    $('#editStatus').value = p.status || 'published';

    // Poblar select de categorías
    const cats = DATA.categories.length ? DATA.categories : [{ name: p.category, slug: p.category }];
    $('#editCategory').innerHTML = cats.map(c =>
        `<option value="${escapeHtml(c.slug)}" ${c.slug === p.category ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

    editImagesArr = [...(p.images || [])];
    renderEditImages();
    $('#postEditor').classList.add('open');
}

// Cerrar editor
$('#postEditorClose').addEventListener('click', () => $('#postEditor').classList.remove('open'));

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

// Guardar cambios del post
$('#postEditorForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = $('#editPostId').value;
    const btn = $('#postEditorForm .admin-editor-save');
    const originalText = btn.textContent;
    btn.disabled = true; btn.textContent = 'Guardando...';

    const { error } = await supabase.from('posts').update({
        title: $('#editTitle').value.trim(),
        subtitle: $('#editSubtitle').value.trim() || null,
        category: $('#editCategory').value,
        author: $('#editAuthor').value.trim(),
        excerpt: $('#editExcerpt').value.trim() || null,
        content: $('#editContent').value,
        status: $('#editStatus').value,
        images: editImagesArr,
        updated_at: new Date().toISOString()
    }).eq('id', id);

    btn.disabled = false; btn.textContent = originalText;

    if (error) {
        toast('Error: ' + error.message);
        return;
    }

    toast('Post actualizado');
    $('#postEditor').classList.remove('open');
    await loadAll();
    renderAll();
});

// ─── TESTIMONIOS ───
let tPhotosArr = [];

function renderTestimonials() {
    const el = $('#testimonialsTable');
    if (!el) return;
    if (!DATA.testimonials.length) { el.innerHTML = '<p class="admin-empty">Sin testimonios todavía</p>'; return; }
    el.innerHTML = `<table class="admin-table"><thead><tr>
        <th>Cliente</th><th>Comentario</th><th>Fuente</th><th>Estado</th><th>Acciones</th>
    </tr></thead><tbody>` + DATA.testimonials.map(t => `<tr>
        <td><span class="cell-author">${escapeHtml(t.author)}</span></td>
        <td><span class="cell-clamp">${escapeHtml(t.comment)}</span></td>
        <td class="cell-muted">${escapeHtml(t.source || 'instagram')}</td>
        <td><span class="badge ${t.is_active ? 'published' : 'draft'}">${t.is_active ? 'Visible' : 'Oculto'}</span></td>
        <td class="cell-actions">
            <button class="admin-btn" data-togtest="${t.id}" title="${t.is_active ? 'Ocultar' : 'Mostrar'}">${t.is_active ? ICONS.eyeOff : ICONS.eye}</button>
            <button class="admin-btn danger" data-deltest="${t.id}" title="Eliminar">${ICONS.trash}</button>
        </td>
    </tr>`).join('') + `</tbody></table>`;

    el.querySelectorAll('[data-togtest]').forEach(btn => btn.addEventListener('click', async () => {
        const t = DATA.testimonials.find(x => x.id === btn.dataset.togtest);
        await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
        await loadAll(); renderTestimonials(); toast('Testimonio actualizado');
    }));
    el.querySelectorAll('[data-deltest]').forEach(btn => btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar este testimonio?')) return;
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

// ─── INIT ───
initAuth();
})();