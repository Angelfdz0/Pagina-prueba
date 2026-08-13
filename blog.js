/* ============================================================
   BLOG.JS — CEREBRO DEL BLOG (OPTIMIZADO)
   ============================================================ */

(function() {
    "use strict";

    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
    const STORAGE_BUCKET = C.supabase?.storageBucket || 'blog-images';
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔌 SUPABASE (lazy initialization)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let supabaseClient = null;
    function getSupabase() {
        if (!supabaseClient) {
            supabaseClient = window.__supabaseShared || 
                (window.__supabaseShared = window.supabase.createClient(C.supabase?.url, C.supabase?.key));
        }
        return supabaseClient;
    }

    let posts = [];
    let categories = C.blogConfig?.categories || ['historias', 'recetas', 'opiniones'];
    let currentFilter = "all";
    let searchQuery = "";
    let sortValue = "default";
    let currentPost = null;
    let isAdmin = false;
    let pendingImagesUrls = [];
    let filteredPostsCache = null; // Cache de posts filtrados

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

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

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function capitalize(str) { 
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : ""; 
    }

    function formatDate(d) {
        if (!d) return "";
        return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function initials(name) {
        return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    }

    function readingTime(text) {
        const words = (text || '').trim().split(/\s+/).length;
        return Math.max(1, Math.round(words / 200));
    }

    function showToast(message) {
        if (!elements.blogToast) return;
        elements.blogToast.textContent = message;
        elements.blogToast.classList.add("show");
        setTimeout(() => elements.blogToast.classList.remove("show"), 2500);
    }

    function lockScroll() {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
    }

    function unlockScroll() {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    }

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

    async function checkAuth() {
        try {
            const { data: { session } } = await getSupabase().auth.getSession();
            isAdmin = !!session;
            if (elements.newPostBtn) elements.newPostBtn.style.display = isAdmin ? "flex" : "none";
        } catch (e) { console.error('Error de sesión:', e); }
    }

    async function loadPosts() {
        try {
            const { data, error } = await getSupabase().from('posts')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false });
            if (error) { showToast(C.blogConfig.messages.dbError); return; }
            posts = data || [];
        } catch (e) { console.error(e); }
    }

    async function loadCategoriesFromDB() {
        try {
            const { data } = await getSupabase().from('categories').select('slug').order('name');
            if (data && data.length) categories = data.map(c => c.slug);
        } catch (e) { /* mantiene las de config.js si falla */ }
    }

    function renderCategories() {
        if (!elements.blogFilters) return;
        const allBtn = `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>`;
        elements.blogFilters.innerHTML = allBtn + categories.map(cat =>
            `<button class="filter-btn ${currentFilter === cat ? 'active' : ''}" data-filter="${escapeHtml(cat)}">${escapeHtml(capitalize(cat))}</button>`
        ).join('');

        if (elements.postCategory) {
            elements.postCategory.innerHTML = categories.map(cat =>
                `<option value="${escapeHtml(cat)}">${escapeHtml(capitalize(cat))}</option>`).join('');
        }
        
        if (elements.categoryList) {
            elements.categoryList.innerHTML = categories.map(cat => `
                <span class="category-tag">${escapeHtml(capitalize(cat))}
                    <span class="remove-category" data-category="${escapeHtml(cat)}" role="button" tabindex="0" aria-label="Eliminar categoría">×</span>
                </span>`).join('');
                
            // Event delegation para remove-category
            elements.categoryList.addEventListener('click', e => {
                const btn = e.target.closest('.remove-category');
                if (btn) removeCategory(btn.dataset.category);
            });
        }
    }

    function addCategory() {
        const input = elements.newCategoryInput;
        const newCat = input.value.trim().toLowerCase();
        if (!newCat || categories.includes(newCat)) { showToast(C.blogConfig.messages.categoryExists); return; }
        categories.push(newCat);
        input.value = '';
        filteredPostsCache = null; // Invalidar cache
        renderCategories();
        showToast(C.blogConfig.messages.categoryAdded);
    }

    function removeCategory(cat) {
        if (categories.length <= 1) { showToast(C.blogConfig.messages.invalidCategory); return; }
        categories = categories.filter(c => c !== cat);
        filteredPostsCache = null; // Invalidar cache
        renderCategories();
        showToast(C.blogConfig.messages.categoryRemoved);
    }

    function renderPosts() {
        if (!elements.postsGrid) return;
        
        // Usar cache si no cambió el filtro/búsqueda/orden
        if (!filteredPostsCache) {
            let filtered = posts.filter(p => {
                const clean = (p.content || '').replace(/\{\{img:[^}]+\}\}/g, ' ');
                const matchesFilter = currentFilter === "all" || p.category === currentFilter;
                const matchesSearch = !searchQuery ||
                    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    clean.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesFilter && matchesSearch;
            });
            
            if (sortValue === "recent") filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            filteredPostsCache = filtered;
        }

        if (filteredPostsCache.length === 0) {
            elements.postsGrid.innerHTML = "";
            if (elements.noResults) elements.noResults.style.display = "block";
            return;
        }
        if (elements.noResults) elements.noResults.style.display = "none";

        // Usar DocumentFragment para mejor rendimiento
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = filteredPostsCache.map((post, index) => {
            const clean = (post.content || '').replace(/\{\{img:[^}]+\}\}/g, ' ');
            const excerpt = post.excerpt ? escapeHtml(post.excerpt) : (clean ? escapeHtml(clean.substring(0, 110)) + "…" : "");
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
        
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        
        elements.postsGrid.innerHTML = '';
        elements.postsGrid.appendChild(fragment);
    }

    function inlineFormat(text) {
        let s = escapeHtml(text);
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
        s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
        return s;
    }

    function renderPostContent(content, container) {
        container.innerHTML = '';
        if (!content) return;
        
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
                flush();
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
        flush();
    }

    async function updateLikeUI(postId) {
        if (!elements.likeBtn) return;
        const { count } = await getSupabase().from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
        elements.likeBtn.querySelector('.like-count').textContent = count || 0;
        
        const isLiked = localStorage.getItem('liked_' + postId) === '1';
        elements.likeBtn.classList.toggle('liked', isLiked);
        const icon = elements.likeBtn.querySelector('i');
        if (icon) icon.className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }

    async function toggleLike(postId) {
        const key = 'liked_' + postId;
        if (localStorage.getItem(key) === '1') {
            const { data } = await getSupabase().from('post_likes').select('id').eq('post_id', postId).limit(1);
            if (data && data[0]) await getSupabase().from('post_likes').delete().eq('id', data[0].id);
            localStorage.removeItem(key);
            showToast(C.blogConfig.messages.likeRemoved);
        } else {
            await getSupabase().from('post_likes').insert({ post_id: postId });
            localStorage.setItem(key, '1');
            showToast(C.blogConfig.messages.likeAdded);
        }
        updateLikeUI(postId);
    }

    async function loadComments(postId) {
        if (!elements.commentsList) return;
        const { data } = await getSupabase().from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
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

    async function handleCommentSubmit(e) {
        e.preventDefault();
        if (!currentPost) return;
        const name = elements.commentName.value.trim();
        const text = elements.commentText.value.trim();
        if (!name || !text) return;
        
        elements.commentSubmit.disabled = true;
        const { error } = await getSupabase().from('post_comments').insert({ post_id: currentPost.id, author: name, content: text });
        elements.commentSubmit.disabled = false;
        
        if (error) { showToast('Error al comentar'); return; }
        elements.commentText.value = '';
        showToast(C.blogConfig.messages.commentAdded);
        loadComments(currentPost.id);
    }

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
        if (navigator.share) {
            navigator.share({ title: text, url: url });
        } else {
            navigator.clipboard.writeText(url).then(() => showToast('Enlace copiado'));
        }
    }

    function openPostModal(postId) {
        currentPost = posts.find(p => p.id == postId);
        if (!currentPost) return;

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

            // Event delegation para miniaturas (previene memory leaks)
            if (!elements.modalThumbnails.dataset.bound) {
                elements.modalThumbnails.dataset.bound = "1";
                elements.modalThumbnails.addEventListener('click', (e) => {
                    const thumb = e.target.closest('.modal-thumbnail');
                    if (!thumb) return;
                    const i = parseInt(thumb.dataset.index);
                    $$('.modal-thumbnail').forEach(t => t.classList.remove('active'));
                    $$('.modal-gallery-slide').forEach(s => s.classList.remove('active'));
                    thumb.classList.add('active');
                    const slide = $(`.modal-gallery-slide[data-index="${i}"]`);
                    if (slide) slide.classList.add('active');
                });
            }
        }

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

        renderPostContent(currentPost.content || '', elements.modalDescription);
        updateLikeUI(currentPost.id);
        loadComments(currentPost.id);

        if (elements.postModal) {
            elements.postModal.classList.add('open');
            lockScroll();
        }
        
        if (window.history && window.history.replaceState) {
            history.replaceState(null, '', '#post-' + currentPost.id);
        }
    }

    function closePostModal() {
        if (elements.postModal) {
            elements.postModal.classList.remove('open');
            unlockScroll();
        }
        if (window.history && window.history.replaceState) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        currentPost = null;
    }

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

        const { error } = await getSupabase().from('posts').insert([newPost]);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        if (error) { showToast(C.blogConfig.messages.postError + ': ' + error.message); return; }
        
        showToast(C.blogConfig.messages.postSuccess);
        closeNewPostModal();
        await loadPosts();
        filteredPostsCache = null; // Invalidar cache
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

    // Subida paralela de imágenes con Promise.all
    async function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) { showToast(`${file.name} ${C.blogConfig.messages.notImage}`); return false; }
            if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} ${C.blogConfig.messages.exceedsSize}`); return false; }
            return true;
        });
        if (validFiles.length === 0) return;

        showToast(C.blogConfig.messages.imageUploading);

        // Crear previews temporales
        const previews = validFiles.map(file => {
            const preview = document.createElement('div');
            preview.className = 'image-preview-item';
            preview.style.opacity = '0.6';
            const tempUrl = URL.createObjectURL(file);
            preview.innerHTML = `<img src="${tempUrl}" alt=""><div style="position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;">Subiendo...</div>`;
            preview.dataset.tempUrl = tempUrl;
            elements.imagePreviewGrid.appendChild(preview);
            if (elements.uploadPlaceholder) elements.uploadPlaceholder.style.display = 'none';
            return { file, preview };
        });

        // Subir todas las imágenes en paralelo
        const uploadPromises = previews.map(async ({ file, preview }) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error } = await getSupabase().storage.from(STORAGE_BUCKET).upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (error) {
                showToast(`${C.blogConfig.messages.imageError}: ${file.name}`);
                preview.remove();
                URL.revokeObjectURL(preview.dataset.tempUrl);
                return null;
            }

            const { data: { publicUrl } } = getSupabase().storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
            pendingImagesUrls.push(publicUrl);
            preview.style.opacity = '1';
            preview.innerHTML = `<img src="${publicUrl}" alt=""><button type="button" class="image-preview-remove" aria-label="Quitar imagen">×</button>`;
            URL.revokeObjectURL(preview.dataset.tempUrl);
            
            preview.querySelector('.image-preview-remove').addEventListener('click', () => {
                const idx = pendingImagesUrls.indexOf(publicUrl);
                if (idx > -1) pendingImagesUrls.splice(idx, 1);
                preview.remove();
                if (pendingImagesUrls.length === 0 && elements.uploadPlaceholder) elements.uploadPlaceholder.style.display = 'block';
            });
            
            return publicUrl;
        });

        await Promise.all(uploadPromises);
        showToast(C.blogConfig.messages.imageSuccess);
    }

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
            const { error } = await getSupabase().storage.from(STORAGE_BUCKET).upload(fileName, file);
            if (error) { showToast(C.blogConfig.messages.imageError); return; }
            
            const { data: { publicUrl } } = getSupabase().storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
            const ta = elements.newPostForm.querySelector('textarea[name="content"]');
            const token = `\n\n{{img:${publicUrl}}}\n\n`;
            const pos = ta.selectionStart || ta.value.length;
            ta.value = ta.value.slice(0, pos) + token + ta.value.slice(pos);
            showToast('Imagen insertada en el contenido');
            contentImageInput.value = '';
        });
    }

    function initEvents() {
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
        
        if (elements.modalClose) elements.modalClose.addEventListener("click", closePostModal);
        if (elements.modalOverlay) elements.modalOverlay.addEventListener("click", closePostModal);
        
        if (elements.likeBtn) elements.likeBtn.addEventListener("click", () => currentPost && toggleLike(currentPost.id));
        if (elements.shareBtn) elements.shareBtn.addEventListener("click", () => sharePost('native'));
        if (elements.shareWhatsappBtn) elements.shareWhatsappBtn.addEventListener("click", () => sharePost('whatsapp'));
        if (elements.commentForm) elements.commentForm.addEventListener("submit", handleCommentSubmit);

        if (elements.searchInput) {
            let t;
            elements.searchInput.addEventListener("input", (e) => {
                clearTimeout(t);
                t = setTimeout(() => { 
                    searchQuery = e.target.value; 
                    filteredPostsCache = null; // Invalidar cache
                    renderPosts(); 
                }, 300);
            });
        }
        if (elements.sortSelect) elements.sortSelect.addEventListener("change", (e) => { 
            sortValue = e.target.value; 
            filteredPostsCache = null; // Invalidar cache
            renderPosts(); 
        });
        
        // Event delegation en grid de posts
        if (elements.postsGrid) {
            elements.postsGrid.addEventListener("click", (e) => {
                const card = e.target.closest(".post-card");
                if (card) openPostModal(card.dataset.id);
            });
        }
        
        if (elements.blogFilters) {
            elements.blogFilters.addEventListener("click", (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    $$(".filter-btn").forEach(b => b.classList.remove("active"));
                    e.target.classList.add("active");
                    currentFilter = e.target.dataset.filter;
                    filteredPostsCache = null; // Invalidar cache
                    renderPosts();
                }
            });
        }
        
        if (elements.addCategoryBtn) elements.addCategoryBtn.addEventListener("click", addCategory);
        if (elements.newCategoryInput) elements.newCategoryInput.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } });

        const contentTa = elements.newPostForm ? elements.newPostForm.querySelector('textarea[name="content"]') : null;
        if (contentTa) {
            contentTa.insertAdjacentHTML('beforebegin', MD_TOOLBAR_HTML);
            attachMdToolbar(contentTa);
        }

        initImageUpload();
        initInlineImageUpload();

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (elements.postModal?.classList.contains("open")) closePostModal();
                if (elements.newPostModal?.classList.contains("open")) closeNewPostModal();
            }
        });
    }

    // Throttle con rAF para scroll del header
    function initScrollEffects() {
        let ticking = false;
        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (elements.blogHeader) elements.blogHeader.classList.toggle("scrolled", window.scrollY > 100);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

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

    // Cursor optimizado: se detiene cuando el mouse está quieto
    function initCursor() {
        if (window.innerWidth < 769) return;
        const cursor = document.getElementById("cursor");
        const follower = document.getElementById("cursorFollower");
        if (!cursor || !follower) return;

        let mx = 0, my = 0, fx = 0, fy = 0;
        let isMouseMoving = false;
        let rafId = null;
        
        document.addEventListener("mousemove", (e) => {
            mx = e.clientX; my = e.clientY;
            cursor.style.left = mx + "px"; cursor.style.top = my + "px";
            
            if (!isMouseMoving) {
                isMouseMoving = true;
                animateFollower();
            }
        });
        
        document.addEventListener("mouseleave", () => {
            isMouseMoving = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });
        
        function animateFollower() {
            if (!isMouseMoving) return;
            
            fx += (mx - fx) * 0.12;
            fy += (my - fy) * 0.12;
            follower.style.left = fx + "px";
            follower.style.top = fy + "px";
            
            if (Math.abs(mx - fx) < 0.5 && Math.abs(my - fy) < 0.5) {
                isMouseMoving = false;
                return;
            }
            
            rafId = requestAnimationFrame(animateFollower);
        }

        const targets = "a, button, .post-card, .filter-btn, .blog-toggle, .modal-thumbnail, .category-tag, .image-upload-area";
        document.addEventListener("mouseover", (e) => { if (e.target.closest(targets)) { cursor.classList.add("hover"); follower.classList.add("hover"); } });
        document.addEventListener("mouseout", (e) => { if (e.target.closest(targets)) { cursor.classList.remove("hover"); follower.classList.remove("hover"); } });
    }

    function openPostFromUrl() {
        const hash = window.location.hash;
        if (!hash.startsWith('#post-')) return;
        const postId = hash.replace('#post-', '');
        const post = posts.find(p => String(p.id) === String(postId));
        if (post) {
            setTimeout(() => openPostModal(post.id), 300);
        }
    }

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

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();