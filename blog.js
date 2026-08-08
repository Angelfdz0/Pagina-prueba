/* ============================================================
   BLOG.JS — CEREBRO DEL BLOG
   ============================================================
   Sistema completo de blog con:
   - Catálogo de posts desde Supabase
   - Modal de lectura pantalla completa (sin doble scroll)
   - Sistema de likes, comentarios y compartir
   - Creación de posts (solo administradores)
   - Subida de imágenes (portada + inline en contenido)
   - Barra de formato Markdown seguro
   - Deep linking (URLs directas a posts)
   
   ✅ Iconos Font Awesome integrados
   ============================================================ */

(function() {
    "use strict";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚙️ CONFIGURACIÓN Y ESTADO GLOBAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
    const STORAGE_BUCKET = C.supabase?.storageBucket || 'blog-images';
    
    // Cliente compartido de Supabase (reutiliza la conexión si ya existe)
    const supabase = window.__supabaseShared || 
        (window.__supabaseShared = window.supabase.createClient(C.supabase?.url, C.supabase?.key));

    // Estado de la aplicación
    let posts = [];
    let categories = C.blogConfig?.categories || ['historias', 'recetas', 'opiniones'];
    let currentFilter = "all";
    let searchQuery = "";
    let sortValue = "default";
    let currentPost = null;
    let isAdmin = false;
    let pendingImagesUrls = []; // URLs de imágenes de portada pendientes de guardar

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 UTILIDADES DOM
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // Cache de elementos DOM para evitar búsquedas repetidas
    const elements = {
        postsGrid: document.getElementById("postsGrid"),
        searchInput: document.getElementById("searchInput"),
        sortSelect: document.getElementById("sortSelect"),
        blogFilters: document.getElementById("blogFilters"),
        noResults: document.getElementById("noResults"),
        blogHeader: document.getElementById("blogHeader"),
        postModal: document.getElementById("postModal"),
        modalOverlay: document.getElementById("modalOverlay"),
        modalClose: document.getElementById("modalClose"),
        modalGallery: document.getElementById("modalGallery"),
        modalThumbnails: document.getElementById("modalThumbnails"),
        modalCategory: document.getElementById("modalCategory"),
        modalTitle: document.getElementById("modalTitle"),
        modalSubtitle: document.getElementById("modalSubtitle"),
        modalAuthor: document.getElementById("modalAuthor"),
        modalDate: document.getElementById("modalDate"),
        modalDescription: document.getElementById("modalDescription"),
        likeBtn: document.getElementById("likeBtn"),
        shareBtn: document.getElementById("shareBtn"),
        shareWhatsappBtn: document.getElementById("shareWhatsappBtn"),
        commentsList: document.getElementById("commentsList"),
        commentsCount: document.getElementById("commentsCount"),
        commentForm: document.getElementById("commentForm"),
        commentName: document.getElementById("commentName"),
        commentText: document.getElementById("commentText"),
        commentSubmit: document.getElementById("commentSubmit"),
        newPostModal: document.getElementById("newPostModal"),
        newPostOverlay: document.getElementById("newPostOverlay"),
        newPostBtn: document.getElementById("newPostBtn"),
        newPostClose: document.getElementById("newPostClose"),
        newPostForm: document.getElementById("newPostForm"),
        categoryList: document.getElementById("categoryList"),
        postCategory: document.getElementById("postCategory"),
        newCategoryInput: document.getElementById("newCategoryInput"),
        addCategoryBtn: document.getElementById("addCategoryBtn"),
        imageUploadArea: document.getElementById("imageUploadArea"),
        imageInput: document.getElementById("imageInput"),
        uploadPlaceholder: document.getElementById("uploadPlaceholder"),
        imagePreviewGrid: document.getElementById("imagePreviewGrid"),
        blogToast: document.getElementById("blogToast")
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛠️ UTILIDADES DE FORMATO Y TEXTO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Previene ataques XSS escapando caracteres HTML
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Capitaliza la primera letra de una cadena
    function capitalize(str) { 
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : ""; 
    }

    // Formatea fecha a formato largo en español (México)
    function formatDate(d) {
        if (!d) return "";
        return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Genera iniciales para avatares (máximo 2 letras)
    function initials(name) {
        return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }

    // Calcula tiempo de lectura basado en ~200 palabras por minuto
    function readingTime(text) {
        const words = (text || '').trim().split(/\s+/).length;
        return Math.max(1, Math.round(words / 200));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔔 TOASTS Y BLOQUEO DE SCROLL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Muestra notificación temporal en la parte inferior
    function showToast(message) {
        if (!elements.blogToast) return;
        elements.blogToast.textContent = message;
        elements.blogToast.classList.add("show");
        setTimeout(() => elements.blogToast.classList.remove("show"), 2500);
    }

    // Bloquea el scroll del body y html (elimina doble barra de scroll en modales)
    function lockScroll() {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
    }

    // Restaura el scroll
    function unlockScroll() {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📝 BARRA DE FORMATO MARKDOWN (seguro)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const MD_TOOLBAR_HTML = `<div class="md-toolbar">
        <button type="button" data-md="bold" title="Negrita"><b>N</b></button>
        <button type="button" data-md="italic" title="Cursiva"><i>C</i></button>
        <button type="button" data-md="h2" title="Subtítulo">H2</button>
        <button type="button" data-md="list" title="Lista">• Lista</button>
        <button type="button" data-md="quote" title="Cita">❝ Cita</button>
    </div>`;

    // Vincula los botones de la barra de formato al textarea
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔐 AUTENTICACIÓN (solo estado)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function checkAuth() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            isAdmin = !!session;
            // Mostrar/ocultar botón de nuevo post según sesión
            if (elements.newPostBtn) elements.newPostBtn.style.display = isAdmin ? "flex" : "none";
        } catch (e) { console.error('Error de sesión:', e); }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📥 CARGA DE DATOS (Posts y Categorías)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Carga solo posts publicados desde Supabase
    async function loadPosts() {
        try {
            const { data, error } = await supabase.from('posts')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            if (error) { showToast(C.blogConfig.messages.dbError); return; }
            posts = data || [];
        } catch (e) { console.error(e); }
    }

    // Carga categorías desde la BD (si existen)
    async function loadCategoriesFromDB() {
        try {
            const { data } = await supabase.from('categories').select('slug').order('name');
            if (data && data.length) categories = data.map(c => c.slug);
        } catch (e) { /* mantiene las de config.js si falla */ }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏷️ GESTIÓN DE CATEGORÍAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Renderiza botones de filtro y selectores de categoría
    function renderCategories() {
        if (!elements.blogFilters) return;
        const allBtn = `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>`;
        elements.blogFilters.innerHTML = allBtn + categories.map(cat =>
            `<button class="filter-btn ${currentFilter === cat ? 'active' : ''}" data-filter="${escapeHtml(cat)}">${escapeHtml(capitalize(cat))}</button>`
        ).join('');

        // Actualizar select en el formulario de nuevo post
        if (elements.postCategory) {
            elements.postCategory.innerHTML = categories.map(cat =>
                `<option value="${escapeHtml(cat)}">${escapeHtml(capitalize(cat))}</option>`).join('');
        }
        
        // Actualizar lista de tags en el gestor de categorías
        if (elements.categoryList) {
            elements.categoryList.innerHTML = categories.map(cat => `
                <span class="category-tag">${escapeHtml(capitalize(cat))}
                    <span class="remove-category" data-category="${escapeHtml(cat)}" role="button" tabindex="0" aria-label="Eliminar categoría">×</span>
                </span>`).join('');
                
            $$('.remove-category').forEach(btn => {
                const handler = () => removeCategory(btn.dataset.category);
                btn.addEventListener('click', handler);
                btn.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
            });
        }
    }

    // Agregar nueva categoría (local por ahora, se guarda al crear post)
    function addCategory() {
        const input = elements.newCategoryInput;
        const newCat = input.value.trim().toLowerCase();
        if (!newCat || categories.includes(newCat)) { showToast(C.blogConfig.messages.categoryExists); return; }
        categories.push(newCat);
        input.value = '';
        renderCategories();
        showToast(C.blogConfig.messages.categoryAdded);
    }

    // Eliminar categoría (impide dejar la lista vacía)
    function removeCategory(cat) {
        if (categories.length <= 1) { showToast(C.blogConfig.messages.invalidCategory); return; }
        categories = categories.filter(c => c !== cat);
        renderCategories();
        showToast(C.blogConfig.messages.categoryRemoved);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📰 RENDERIZADO DE TARJETAS DE POSTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function renderPosts() {
        if (!elements.postsGrid) return;
        
        // Filtrado y búsqueda
        let filtered = posts.filter(p => {
            const clean = (p.content || '').replace(/\{\{img:[^}]+\}\}/g, ' '); // Limpiar tokens de imagen
            const matchesFilter = currentFilter === "all" || p.category === currentFilter;
            const matchesSearch = !searchQuery ||
                (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                clean.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
        
        // Ordenamiento
        if (sortValue === "recent") filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Estado vacío
        if (filtered.length === 0) {
            elements.postsGrid.innerHTML = "";
            if (elements.noResults) elements.noResults.style.display = "block";
            return;
        }
        if (elements.noResults) elements.noResults.style.display = "none";

        // Generar HTML de las tarjetas
        elements.postsGrid.innerHTML = filtered.map((post, index) => {
            const clean = (post.content || '').replace(/\{\{img:[^}]+\}\}/g, ' ');
            const excerpt = clean ? escapeHtml(clean.substring(0, 110)) + "…" : "";
            const firstImage = post.images && post.images.length > 0 ? escapeHtml(post.images[0]) : 'https://via.placeholder.com/400x300?text=Sin+Imagen';
            const mins = readingTime(clean);
            
            return `
            <article class="post-card" data-id="${post.id}" style="animation: fadeInUp 0.6s var(--ease-out-expo) ${index * 0.08}s backwards;" tabindex="0" role="button">
                <div class="post-image-wrapper">
                    <img src="${firstImage}" alt="${escapeHtml(post.title)}" class="post-image" loading="lazy">
                    <div class="post-image-overlay" aria-hidden="true"></div>
                    <span class="post-category-badge">${escapeHtml(capitalize(post.category))}</span>
                    <span class="post-read-time"><i class="fa-regular fa-clock" aria-hidden="true"></i>${mins} min</span>
                </div>
                <div class="post-info">
                    <h3 class="post-title">${escapeHtml(post.title)}</h3>
                    <p class="post-excerpt">${excerpt}</p>
                    <div class="post-meta">
                        <span class="post-author-chip">
                            <span class="post-avatar" aria-hidden="true">${initials(post.author)}</span>
                            <span class="post-author">${escapeHtml(post.author)}</span>
                        </span>
                        <span class="post-date">${formatDate(post.created_at)}</span>
                    </div>
                    <span class="post-cta">Leer artículo<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
                </div>
            </article>`;
        }).join("");

        // Asignar eventos de clic a las tarjetas
        setTimeout(() => {
            $$(".post-card").forEach(card => {
                card.addEventListener("click", () => openPostModal(card.dataset.id));
            });
        }, 100);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📖 RENDERIZADO DE CONTENIDO (Markdown seguro)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Convierte markdown inline a HTML (negrita, cursiva)
    function inlineFormat(text) {
        let s = escapeHtml(text);
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
        s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
        return s;
    }

    // Parsea bloques de markdown (H2, listas, citas, párrafos, imágenes inline)
    function renderPostContent(content, container) {
        container.innerHTML = '';
        if (!content) return;
        
        // Separar tokens de imagen del texto
        const parts = content.split(/(\{\{img:[^}]+\}\})/g);
        let buffer = '';
        
        const flush = () => {
            if (buffer.trim()) {
                buffer.split(/\n\n+/).forEach(par => {
                    const t = par.trim();
                    if (!t) return;
                    let el;
                    if (/^##\s/.test(t)) {
                        el = document.createElement('h3');
                        el.innerHTML = inlineFormat(t.replace(/^##\s+/, ''));
                    } else if (/^>\s?/.test(t)) {
                        el = document.createElement('blockquote');
                        el.className = 'content-quote';
                        el.innerHTML = inlineFormat(t.replace(/^>\s?/gm, ''));
                    } else if (/^[-•]\s/.test(t)) {
                        el = document.createElement('ul');
                        t.split('\n').forEach(line => {
                            const m = line.trim();
                            if (/^[-•]\s/.test(m)) {
                                const li = document.createElement('li');
                                li.innerHTML = inlineFormat(m.replace(/^[-•]\s+/, ''));
                                el.appendChild(li);
                            }
                        });
                    } else {
                        el = document.createElement('p');
                        el.innerHTML = inlineFormat(t).replace(/\n/g, '<br>');
                    }
                    el.style.marginBottom = '1.2rem';
                    container.appendChild(el);
                });
            }
            buffer = '';
        };
        
        parts.forEach(part => {
            const m = part.match(/^\{\{img:([^}]+)\}\}$/);
            if (m) {
                flush(); // Renderizar texto acumulado antes de la imagen
                const url = m[1].trim();
                if (url.startsWith('https://')) {
                    const fig = document.createElement('div');
                    fig.className = 'content-inline-image';
                    const img = document.createElement('img');
                    img.src = url;
                    img.loading = 'lazy';
                    img.alt = 'Imagen del artículo';
                    fig.appendChild(img);
                    container.appendChild(fig);
                }
            } else { 
                buffer += part; 
            }
        });
        flush(); // Renderizar texto restante
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ❤️ SISTEMA DE LIKES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Actualiza la UI del botón de like (contador y estado visual)
    async function updateLikeUI(postId) {
        if (!elements.likeBtn) return;
        const { count } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
        elements.likeBtn.querySelector('.like-count').textContent = count || 0;
        
        const isLiked = localStorage.getItem('liked_' + postId) === '1';
        elements.likeBtn.classList.toggle('liked', isLiked);
        const icon = elements.likeBtn.querySelector('i');
        if (icon) icon.className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }

    // Alterna el estado de like (agregar/quitar)
    async function toggleLike(postId) {
        const key = 'liked_' + postId;
        if (localStorage.getItem(key) === '1') {
            // Quitar like
            const { data } = await supabase.from('post_likes').select('id').eq('post_id', postId).limit(1);
            if (data && data[0]) await supabase.from('post_likes').delete().eq('id', data[0].id);
            localStorage.removeItem(key);
            showToast(C.blogConfig.messages.likeRemoved);
        } else {
            // Agregar like
            await supabase.from('post_likes').insert({ post_id: postId });
            localStorage.setItem(key, '1');
            showToast(C.blogConfig.messages.likeAdded);
        }
        updateLikeUI(postId);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 SISTEMA DE COMENTARIOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Carga y renderiza comentarios del post actual
    async function loadComments(postId) {
        if (!elements.commentsList) return;
        const { data } = await supabase.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
        elements.commentsList.innerHTML = '';
        
        if (!data || data.length === 0) {
            elements.commentsList.innerHTML = '<p class="comments-empty">Sé el primero en comentar</p>';
        } else {
            data.forEach(c => {
                const item = document.createElement('div');
                item.className = 'comment-item';
                item.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(c.author)}</span>
                        <span class="comment-date">${formatDate(c.created_at)}</span>
                    </div>
                    <p class="comment-text">${escapeHtml(c.content)}</p>
                `;
                elements.commentsList.appendChild(item);
            });
        }
        if (elements.commentsCount) elements.commentsCount.textContent = data ? data.length : 0;
    }

    // Maneja el envío del formulario de comentarios
    async function handleCommentSubmit(e) {
        e.preventDefault();
        if (!currentPost) return;
        const name = elements.commentName.value.trim();
        const text = elements.commentText.value.trim();
        if (!name || !text) return;
        
        elements.commentSubmit.disabled = true;
        const { error } = await supabase.from('post_comments').insert({ post_id: currentPost.id, author: name, content: text });
        elements.commentSubmit.disabled = false;
        
        if (error) { showToast('Error al comentar'); return; }
        elements.commentText.value = '';
        showToast(C.blogConfig.messages.commentAdded);
        loadComments(currentPost.id);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📤 COMPARTIR (Nativo, Copiar, WhatsApp)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Genera URL única con hash para deep linking
    function getShareUrl() {
        return window.location.href.split('#')[0] + '#post-' + (currentPost ? currentPost.id : '');
    }

    function sharePost(type) {
        if (!currentPost) return;
        const url = getShareUrl();
        const text = currentPost.title;
        
        if (type === 'copy') {
            navigator.clipboard.writeText(url).then(() => showToast('Enlace copiado'));
            return;
        }
        if (type === 'whatsapp') {
            window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank');
            return;
        }
        // Compartir nativo (móviles) o fallback a copiar
        if (navigator.share) {
            navigator.share({ title: text, url: url });
        } else {
            navigator.clipboard.writeText(url).then(() => showToast('Enlace copiado'));
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📖 MODAL DE LECTURA (Artículo completo)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function openPostModal(postId) {
        currentPost = posts.find(p => p.id == postId);
        if (!currentPost) return;

        // Galería de imágenes
        if (elements.modalGallery && currentPost.images && currentPost.images.length > 0) {
            elements.modalGallery.innerHTML = currentPost.images.map((img, i) => `
                <div class="modal-gallery-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${escapeHtml(img)}" alt="${escapeHtml(currentPost.title)}" class="modal-gallery-img" loading="lazy">
                </div>`).join('');
                
            elements.modalThumbnails.innerHTML = currentPost.images.map((img, i) => `
                <button class="modal-thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ver imagen ${i + 1}">
                    <img src="${escapeHtml(img)}" alt="" loading="lazy">
                </button>`).join('');
                
            elements.modalThumbnails.style.display = currentPost.images.length > 1 ? 'flex' : 'none';

            // Eventos de miniaturas
            $$('.modal-thumbnail').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const i = parseInt(thumb.dataset.index);
                    $$('.modal-thumbnail').forEach(t => t.classList.remove('active'));
                    $$('.modal-gallery-slide').forEach(s => s.classList.remove('active'));
                    thumb.classList.add('active');
                    const slide = $(`.modal-gallery-slide[data-index="${i}"]`);
                    if (slide) slide.classList.add('active');
                });
            });
        }

        // Información del post
        if (elements.modalCategory) elements.modalCategory.textContent = capitalize(currentPost.category || '');
        if (elements.modalTitle) elements.modalTitle.textContent = currentPost.title || '';
        if (elements.modalSubtitle) {
            elements.modalSubtitle.textContent = currentPost.subtitle || '';
            elements.modalSubtitle.style.display = currentPost.subtitle ? 'block' : 'none';
        }
        if (elements.modalAuthor) {
            elements.modalAuthor.innerHTML = `<span class="modal-author-avatar" aria-hidden="true">${initials(currentPost.author)}</span>${escapeHtml(currentPost.author)}`;
        }
        if (elements.modalDate) elements.modalDate.textContent = formatDate(currentPost.created_at);

        // Renderizar contenido, likes y comentarios
        renderPostContent(currentPost.content || '', elements.modalDescription);
        updateLikeUI(currentPost.id);
        loadComments(currentPost.id);

        // Abrir modal y bloquear scroll
        if (elements.postModal) {
            elements.postModal.classList.add('open');
            lockScroll();
        }
        
        // Deep linking: actualizar URL sin recargar
        if (window.history && window.history.replaceState) {
            history.replaceState(null, '', '#post-' + currentPost.id);
        }
    }

    function closePostModal() {
        if (elements.postModal) {
            elements.postModal.classList.remove('open');
            unlockScroll();
        }
        // Limpiar hash de la URL
        if (window.history && window.history.replaceState) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        currentPost = null;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✍️ MODAL DE NUEVO POST (Admin)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function createNewPost(e) {
        e.preventDefault();
        if (!isAdmin) { showToast('Debes iniciar sesión desde el enlace del footer.'); return; }

        const formData = new FormData(elements.newPostForm);
        if (pendingImagesUrls.length === 0) { showToast(C.blogConfig.messages.needImage); return; }

        const newPost = {
            title: formData.get('title'),
            subtitle: formData.get('subtitle') || null,
            category: formData.get('category'),
            author: formData.get('author'),
            content: formData.get('content'),
            images: pendingImagesUrls,
            status: 'published',
            created_at: new Date().toISOString()
        };

        const submitBtn = elements.newPostForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<span>Publicando...</span>";
        submitBtn.disabled = true;

        const { error } = await supabase.from('posts').insert([newPost]);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (error) { showToast(C.blogConfig.messages.postError + ': ' + error.message); return; }
        
        showToast(C.blogConfig.messages.postSuccess);
        closeNewPostModal();
        await loadPosts();
        renderPosts();
    }

    function closeNewPostModal() {
        if (elements.newPostModal) {
            elements.newPostModal.classList.remove('open');
            unlockScroll();
        }
        if (elements.newPostForm) elements.newPostForm.reset();
        pendingImagesUrls = [];
        if (elements.imagePreviewGrid) elements.imagePreviewGrid.innerHTML = '';
        if (elements.uploadPlaceholder) elements.uploadPlaceholder.style.display = 'block';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🖼️ SUBIDA DE IMÁGENES (Portada e Inline)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Inicializa el área de drag & drop para imágenes de portada
    function initImageUpload() {
        const area = elements.imageUploadArea;
        const input = elements.imageInput;
        if (!area || !input) return;

        area.addEventListener('click', (e) => {
            if (e.target === area || e.target.closest('.upload-placeholder')) input.click();
        });
        area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('dragover'); });
        area.addEventListener('dragleave', () => area.classList.remove('dragover'));
        area.addEventListener('drop', async (e) => { e.preventDefault(); area.classList.remove('dragover'); await handleFiles(e.dataTransfer.files); });
        input.addEventListener('change', async (e) => { await handleFiles(e.target.files); });
    }

    // Procesa y sube archivos de imagen a Supabase Storage
    async function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) { showToast(`${file.name} ${C.blogConfig.messages.notImage}`); return false; }
            if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} ${C.blogConfig.messages.exceedsSize}`); return false; }
            return true;
        });
        if (validFiles.length === 0) return;

        showToast(C.blogConfig.messages.imageUploading);

        for (const file of validFiles) {
            // Crear preview temporal
            const preview = document.createElement('div');
            preview.className = 'image-preview-item';
            preview.style.opacity = '0.6';
            const tempUrl = URL.createObjectURL(file);
            preview.innerHTML = `<img src="${tempUrl}" alt=""><div style="position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;">Subiendo...</div>`;
            elements.imagePreviewGrid.appendChild(preview);
            if (elements.uploadPlaceholder) elements.uploadPlaceholder.style.display = 'none';

            // Subir a Supabase
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (error) {
                showToast(`${C.blogConfig.messages.imageError}: ${file.name}`);
                preview.remove();
                URL.revokeObjectURL(tempUrl);
                continue;
            }

            // Obtener URL pública y actualizar preview
            const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
            pendingImagesUrls.push(publicUrl);
            preview.style.opacity = '1';
            preview.innerHTML = `<img src="${publicUrl}" alt=""><button type="button" class="image-preview-remove" aria-label="Quitar imagen">×</button>`;
            
            // Evento para quitar imagen del array
            preview.querySelector('.image-preview-remove').addEventListener('click', () => {
                const idx = pendingImagesUrls.indexOf(publicUrl);
                if (idx > -1) pendingImagesUrls.splice(idx, 1);
                preview.remove();
                if (pendingImagesUrls.length === 0 && elements.uploadPlaceholder) elements.uploadPlaceholder.style.display = 'block';
            });
            URL.revokeObjectURL(tempUrl);
        }
        showToast(C.blogConfig.messages.imageSuccess);
    }

    // Inicializa la subida de imágenes inline (dentro del contenido)
    function initInlineImageUpload() {
        const contentImageInput = document.getElementById('contentImageInput');
        const insertImageBtn = document.getElementById('insertImageBtn');
        if (!insertImageBtn || !contentImageInput) return;
        
        insertImageBtn.addEventListener('click', () => contentImageInput.click());
        contentImageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) { showToast(C.blogConfig.messages.notImage); return; }
            if (file.size > 5 * 1024 * 1024) { showToast(C.blogConfig.messages.exceedsSize); return; }
            
            showToast(C.blogConfig.messages.imageUploading);
            const fileExt = file.name.split('.').pop();
            const fileName = `content-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file);
            if (error) { showToast(C.blogConfig.messages.imageError); return; }
            
            const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
            const ta = elements.newPostForm.querySelector('textarea[name="content"]');
            const token = `\n\n{{img:${publicUrl}}}\n\n`;
            const pos = ta.selectionStart || ta.value.length;
            ta.value = ta.value.slice(0, pos) + token + ta.value.slice(pos);
            showToast('Imagen insertada en el contenido');
            contentImageInput.value = '';
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 EVENT LISTENERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function initEvents() {
        // Modal Nuevo Post
        if (elements.newPostBtn) {
            elements.newPostBtn.addEventListener("click", () => {
                if (!isAdmin) { showToast('Debes iniciar sesión desde el enlace del footer.'); return; }
                elements.newPostModal.classList.add("open");
                lockScroll();
            });
        }
        if (elements.newPostClose) elements.newPostClose.addEventListener("click", closeNewPostModal);
        if (elements.newPostOverlay) elements.newPostOverlay.addEventListener("click", closeNewPostModal);
        if (elements.newPostForm) elements.newPostForm.addEventListener("submit", createNewPost);
        
        // Modal de Lectura
        if (elements.modalClose) elements.modalClose.addEventListener("click", closePostModal);
        if (elements.modalOverlay) elements.modalOverlay.addEventListener("click", closePostModal);
        
        // Interacciones (Likes, Compartir, Comentarios)
        if (elements.likeBtn) elements.likeBtn.addEventListener("click", () => currentPost && toggleLike(currentPost.id));
        if (elements.shareBtn) elements.shareBtn.addEventListener("click", () => sharePost('native'));
        if (elements.shareWhatsappBtn) elements.shareWhatsappBtn.addEventListener("click", () => sharePost('whatsapp'));
        if (elements.commentForm) elements.commentForm.addEventListener("submit", handleCommentSubmit);

        // Búsqueda y Filtros
        if (elements.searchInput) {
            let t;
            elements.searchInput.addEventListener("input", (e) => {
                clearTimeout(t);
                t = setTimeout(() => { searchQuery = e.target.value; renderPosts(); }, 300); // Debounce 300ms
            });
        }
        if (elements.sortSelect) elements.sortSelect.addEventListener("change", (e) => { sortValue = e.target.value; renderPosts(); });
        if (elements.blogFilters) {
            elements.blogFilters.addEventListener("click", (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    $$(".filter-btn").forEach(b => b.classList.remove("active"));
                    e.target.classList.add("active");
                    currentFilter = e.target.dataset.filter;
                    renderPosts();
                }
            });
        }
        
        // Gestión de Categorías
        if (elements.addCategoryBtn) elements.addCategoryBtn.addEventListener("click", addCategory);
        if (elements.newCategoryInput) elements.newCategoryInput.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } });

        // Barra de formato Markdown
        const contentTa = elements.newPostForm ? elements.newPostForm.querySelector('textarea[name="content"]') : null;
        if (contentTa) {
            contentTa.insertAdjacentHTML('beforebegin', MD_TOOLBAR_HTML);
            attachMdToolbar(contentTa);
        }

        // Inicializar subidas de imágenes
        initImageUpload();
        initInlineImageUpload();

        // Cerrar modales con tecla Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (elements.postModal?.classList.contains("open")) closePostModal();
                if (elements.newPostModal?.classList.contains("open")) closeNewPostModal();
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✨ EFECTOS VISUALES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Header sticky con efecto scroll
    function initScrollEffects() {
        window.addEventListener("scroll", () => {
            if (elements.blogHeader) elements.blogHeader.classList.toggle("scrolled", window.scrollY > 100);
        }, { passive: true });
    }

    // Genera estrellas parpadeantes en el hero
    function initBlogStars() {
        const starsContainer = document.getElementById("blogStars");
        if (!starsContainer) return;
        const isMobile = window.innerWidth < 769;
        const starCount = isMobile ? 5 : 15;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement("div");
            star.className = "blog-star";
            const size = Math.random() * ((isMobile ? 4 : 2.5) - (isMobile ? 2 : 1)) + (isMobile ? 2 : 1);
            star.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;width:${size}px;height:${size}px;--twinkle-duration:${Math.random()*4+3}s;--twinkle-delay:${Math.random()*5}s;--min-opacity:${Math.random()*0.3+0.2};--max-opacity:${Math.random()*0.4+0.5};--glow-size:${size*3}px;`;
            starsContainer.appendChild(star);
        }
    }

    // Cursor personalizado (solo desktop)
    function initCursor() {
        if (window.innerWidth < 769) return;
        const cursor = document.getElementById("cursor");
        const follower = document.getElementById("cursorFollower");
        if (!cursor || !follower) return;

        let mx = 0, my = 0, fx = 0, fy = 0;
        document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; cursor.style.left = mx + "px"; cursor.style.top = my + "px"; });
        
        (function animate() {
            fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12;
            follower.style.left = fx + "px"; follower.style.top = fy + "px";
            requestAnimationFrame(animate);
        })();

        const targets = "a, button, .post-card, .filter-btn, .blog-toggle, .modal-thumbnail, .category-tag, .image-upload-area";
        document.addEventListener("mouseover", (e) => { if (e.target.closest(targets)) { cursor.classList.add("hover"); follower.classList.add("hover"); } });
        document.addEventListener("mouseout", (e) => { if (e.target.closest(targets)) { cursor.classList.remove("hover"); follower.classList.remove("hover"); } });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔗 DEEP LINKING (Abrir post desde URL)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function openPostFromUrl() {
        const hash = window.location.hash;
        if (!hash.startsWith('#post-')) return;
        const postId = hash.replace('#post-', '');
        const post = posts.find(p => String(p.id) === String(postId));
        if (post) {
            setTimeout(() => openPostModal(post.id), 300); // Delay para asegurar que el DOM esté listo
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 INICIALIZACIÓN PRINCIPAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function init() {
        await checkAuth();
        await loadPosts();
        await loadCategoriesFromDB();
        renderCategories();
        renderPosts();
        initEvents();
        initScrollEffects();
        initBlogStars();
        initCursor();
        openPostFromUrl();
        window.addEventListener('hashchange', openPostFromUrl);
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();