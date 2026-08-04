/* ============================================================
   BLOG ONLINE - CON SUPABASE + LOGIN + IMÁGENES
   Versión robusta, segura y optimizada
   ============================================================ */
(function() {
    "use strict";

    // ============================================
    // UTILIDADES
    // ============================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // ✅ NUEVO: Escapar HTML para prevenir XSS
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ✅ NUEVO: Generar slug a partir del título
    function generateSlug(title) {
        return title
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/[^a-z0-9\s-]/g, '')    // Solo alfanuméricos
            .replace(/\s+/g, '-')             // Espacios por guiones
            .replace(/-+/g, '-')              // Guiones duplicados
            .trim();
    }

    // ============================================
    // CONFIGURACIÓN
    // ============================================
    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
    const STORAGE_BUCKET = C.supabase?.storageBucket || 'blog-images';
    const POSTS_PER_PAGE = 12; // ✅ NUEVO: Paginación

    // ============================================
    // ESTADO (sin globals en window)
    // ============================================
    const state = {
        posts: [],
        categories: C.blogConfig?.categories || ['historias', 'recetas', 'opiniones'],
        currentFilter: 'all',
        searchQuery: '',
        sortValue: 'default',
        currentPost: null,
        isAdmin: false,
        currentPage: 1,
        pendingImagesUrls: [],  // ✅ Movido de window a state
        pendingImagePreviews: new Map(), // ✅ NUEVO: Map para trackear previews
        isLoading: false
    };

    // ============================================
    // ELEMENTOS DOM (capturados en init)
    // ============================================
    let elements = {};

    function captureElements() {
        elements = {
            postsGrid: $('#postsGrid'),
            searchInput: $('#searchInput'),
            sortSelect: $('#sortSelect'),
            blogFilters: $('#blogFilters'),
            noResults: $('#noResults'),
            blogHeader: $('#blogHeader'),
            loadMoreBtn: $('#loadMoreBtn'),
            
            postModal: $('#postModal'),
            modalOverlay: $('#modalOverlay'),
            modalClose: $('#modalClose'),
            modalGallery: $('#modalGallery'),
            modalThumbnails: $('#modalThumbnails'),
            modalCategory: $('#modalCategory'),
            modalTitle: $('#modalTitle'),
            modalAuthor: $('#modalAuthor'),
            modalDate: $('#modalDate'),
            modalDescription: $('#modalDescription'),
            
            newPostModal: $('#newPostModal'),
            newPostOverlay: $('#newPostOverlay'),
            newPostBtn: $('#newPostBtn'),
            newPostClose: $('#newPostClose'),
            newPostForm: $('#newPostForm'),
            
            loginModal: $('#loginModal'),
            loginOverlay: $('#loginOverlay'),
            loginClose: $('#loginClose'),
            loginForm: $('#loginForm'),
            loginEmail: $('#loginEmail'),
            loginPassword: $('#loginPassword'),
            loginError: $('#loginError'),
            loginSubmit: $('#loginSubmit'),
            
            categoryList: $('#categoryList'),
            postCategory: $('#postCategory'),
            newCategoryInput: $('#newCategoryInput'),
            addCategoryBtn: $('#addCategoryBtn'),
            
            imageUploadArea: $('#imageUploadArea'),
            imageInput: $('#imageInput'),
            uploadPlaceholder: $('#uploadPlaceholder'),
            imagePreviewGrid: $('#imagePreviewGrid'),
            
            blogToast: $('#blogToast'),
            blogStars: $('#blogStars')
        };
    }

    // ============================================
    // SUPABASE CLIENT
    // ============================================
    let supabase = null;

    function initSupabase() {
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase no está cargado');
            showToast('Error de conexión con la base de datos');
            return false;
        }
        
        const url = C.supabase?.url;
        const key = C.supabase?.key;
        
        if (!url || !key) {
            console.error('❌ Configuración de Supabase incompleta');
            return false;
        }
        
        try {
            supabase = window.supabase.createClient(url, key);
            return true;
        } catch (error) {
            console.error('❌ Error creando cliente Supabase:', error);
            return false;
        }
    }

    // ============================================
    // PERSISTENCIA DE CATEGORÍAS
    // ============================================
    function saveCategories() {
        try {
            localStorage.setItem('blog_categories', JSON.stringify(state.categories));
        } catch (e) {
            console.warn('No se pudieron guardar las categorías');
        }
    }

    function loadCategories() {
        try {
            const saved = localStorage.getItem('blog_categories');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    state.categories = parsed;
                }
            }
        } catch (e) {
            console.warn('Error cargando categorías guardadas');
        }
    }

    // ============================================
    // FOCUS TRAP (Accesibilidad)
    // ============================================
    function trapFocus(modalElement) {
        const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(modalElement.querySelectorAll(focusableSelectors));
        
        if (focusableElements.length === 0) return null;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        function handleKeyDown(e) {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
        
        modalElement.addEventListener('keydown', handleKeyDown);
        firstFocusable.focus();
        
        return () => modalElement.removeEventListener('keydown', handleKeyDown);
    }

    let currentFocusTrapCleanup = null;

    // ============================================
    // TOAST
    // ============================================
    function showToast(message) {
        if (!elements.blogToast) return;
        elements.blogToast.textContent = message;
        elements.blogToast.classList.add('show');
        setTimeout(() => elements.blogToast.classList.remove('show'), 2500);
    }

    // ============================================
    // FECHA
    // ============================================
    function formatDate(dateString) {
        if (!dateString) return '';
        // ✅ CORREGIDO: es-MX en lugar de es-ES
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    // ============================================
    // AUTH
    // ============================================
    async function checkAuth() {
        if (!supabase) return;
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            state.isAdmin = !!session;
            
            if (elements.newPostBtn) {
                elements.newPostBtn.style.display = 'flex';
            }
            
            let logoutBtn = $('#logoutBtn');
            
            if (state.isAdmin) {
                if (!logoutBtn) {
                    logoutBtn = document.createElement('button');
                    logoutBtn.id = 'logoutBtn';
                    logoutBtn.className = 'blog-logout';
                    logoutBtn.setAttribute('aria-label', 'Cerrar sesión');
                    logoutBtn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    `;
                    logoutBtn.addEventListener('click', handleLogout);
                    if (elements.newPostBtn) {
                        elements.newPostBtn.parentNode.insertBefore(logoutBtn, elements.newPostBtn.nextSibling);
                    }
                }
                logoutBtn.style.display = 'flex';
            } else {
                if (logoutBtn) logoutBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
        }
    }

    function showLogin() {
        if (elements.loginModal) {
            elements.loginModal.classList.add('open');
            if (currentFocusTrapCleanup) currentFocusTrapCleanup();
            currentFocusTrapCleanup = trapFocus(elements.loginModal);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        if (!supabase) return;
        
        const email = elements.loginEmail.value;
        const password = elements.loginPassword.value;
        
        // ✅ Estado de carga
        if (elements.loginSubmit) {
            elements.loginSubmit.disabled = true;
            elements.loginSubmit.innerHTML = '<span>Verificando...</span>';
        }
        if (elements.loginError) elements.loginError.textContent = '';
        
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) {
                if (elements.loginError) {
                    elements.loginError.textContent = 'Credenciales inválidas. Verifica tu email y contraseña.';
                }
                return;
            }
            
            state.isAdmin = true;
            if (elements.loginModal) elements.loginModal.classList.remove('open');
            if (currentFocusTrapCleanup) {
                currentFocusTrapCleanup();
                currentFocusTrapCleanup = null;
            }
            if (elements.loginError) elements.loginError.textContent = '';
            showToast(C.blogConfig?.messages?.loginWelcome || '¡Bienvenido!');
            await checkAuth();
        } catch (error) {
            console.error('Error en login:', error);
            if (elements.loginError) {
                elements.loginError.textContent = 'Error de conexión. Intenta de nuevo.';
            }
        } finally {
            if (elements.loginSubmit) {
                elements.loginSubmit.disabled = false;
                elements.loginSubmit.innerHTML = '<span>Iniciar Sesión</span>';
            }
        }
    }

    async function handleLogout() {
        if (!supabase) return;
        
        try {
            await supabase.auth.signOut();
            state.isAdmin = false;
            
            const logoutBtn = $('#logoutBtn');
            if (logoutBtn) logoutBtn.style.display = 'none';
            
            showToast(C.blogConfig?.messages?.sessionClosed || 'Sesión cerrada');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            showToast(C.blogConfig?.messages?.logoutError || 'Error al cerrar sesión');
        }
    }

    // ============================================
    // CARGAR POSTS (con paginación)
    // ============================================
    async function loadPosts() {
        if (!supabase || !elements.postsGrid) return;
        
        // ✅ Estado de carga
        state.isLoading = true;
        elements.postsGrid.innerHTML = `
            <div class="blog-loading" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-text-muted);">
                <p>Cargando artículos...</p>
            </div>
        `;
        
        try {
            let query = supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(POSTS_PER_PAGE * state.currentPage);
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error cargando posts:', error);
                showToast(C.blogConfig?.messages?.dbError || 'Error al cargar artículos');
                elements.postsGrid.innerHTML = '';
                return;
            }
            
            state.posts = data || [];
            renderPosts();
        } catch (error) {
            console.error('Error inesperado:', error);
            showToast('Error al cargar artículos');
        } finally {
            state.isLoading = false;
        }
    }

    // ============================================
    // RENDERIZADO
    // ============================================
    function renderCategories() {
        if (!elements.blogFilters) return;
        
        const allBtn = `<button class="filter-btn ${state.currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>`;
        const categoryBtns = state.categories.map(cat => 
            `<button class="filter-btn ${state.currentFilter === cat ? 'active' : ''}" data-filter="${escapeHtml(cat)}">${escapeHtml(capitalize(cat))}</button>`
        ).join('');
        
        elements.blogFilters.innerHTML = allBtn + categoryBtns;
        
        if (elements.postCategory) {
            elements.postCategory.innerHTML = state.categories.map(cat => 
                `<option value="${escapeHtml(cat)}">${escapeHtml(capitalize(cat))}</option>`
            ).join('');
        }
        
        // ✅ CORREGIDO: Sin onclick inline
        if (elements.categoryList) {
            elements.categoryList.innerHTML = '';
            state.categories.forEach(cat => {
                const tag = document.createElement('span');
                tag.className = 'category-tag';
                tag.innerHTML = `
                    ${escapeHtml(capitalize(cat))}
                    <span class="remove-category" data-category="${escapeHtml(cat)}" role="button" aria-label="Eliminar categoría ${escapeHtml(cat)}" tabindex="0">×</span>
                `;
                
                const removeBtn = tag.querySelector('.remove-category');
                removeBtn.addEventListener('click', () => removeCategory(cat));
                removeBtn.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        removeCategory(cat);
                    }
                });
                
                elements.categoryList.appendChild(tag);
            });
        }
    }

    function addCategory() {
        const input = elements.newCategoryInput;
        if (!input) return;
        
        const newCat = input.value.trim().toLowerCase();
        
        if (!newCat || state.categories.includes(newCat)) {
            showToast(C.blogConfig?.messages?.categoryExists || 'Categoría inválida o ya existe');
            return;
        }
        
        state.categories.push(newCat);
        saveCategories(); // ✅ Persistir
        input.value = '';
        renderCategories();
        showToast(C.blogConfig?.messages?.categoryAdded || 'Categoría agregada');
    }

    function removeCategory(cat) {
        if (state.categories.length <= 1) {
            showToast(C.blogConfig?.messages?.invalidCategory || 'Debe haber al menos una categoría');
            return;
        }
        state.categories = state.categories.filter(c => c !== cat);
        saveCategories(); // ✅ Persistir
        renderCategories();
        showToast(C.blogConfig?.messages?.categoryRemoved || 'Categoría eliminada');
    }

    function renderPosts() {
        if (!elements.postsGrid) return;
        
        let filtered = state.posts.filter(p => {
            const matchesFilter = state.currentFilter === 'all' || p.category === state.currentFilter;
            const matchesSearch = !state.searchQuery || 
                (p.title && p.title.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
                (p.content && p.content.toLowerCase().includes(state.searchQuery.toLowerCase()));
            return matchesFilter && matchesSearch;
        });

        if (state.sortValue === 'recent') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        
        if (filtered.length === 0) {
            elements.postsGrid.innerHTML = '';
            if (elements.noResults) elements.noResults.style.display = 'block';
            return;
        }
        
        if (elements.noResults) elements.noResults.style.display = 'none';
        
        // ✅ SANITIZADO: escapeHtml en todos los datos dinámicos
        elements.postsGrid.innerHTML = filtered.map((post, index) => {
            const excerpt = post.content ? escapeHtml(post.content.substring(0, 120)) + '...' : '';
            const date = formatDate(post.created_at);
            const firstImage = post.images && post.images.length > 0 
                ? escapeHtml(post.images[0]) 
                : 'https://via.placeholder.com/400x300?text=Sin+Imagen';
            const title = escapeHtml(post.title || 'Sin título');
            const category = escapeHtml(post.category || '');
            const author = escapeHtml(post.author || '');
            
            return `
                <article class="post-card" data-id="${post.id}" style="animation: fadeInUp 0.6s var(--ease-out-expo) ${index * 0.1}s backwards;" tabindex="0" role="button" aria-label="Leer artículo: ${title}">
                    <div class="post-image-wrapper">
                        <img src="${firstImage}" alt="${title}" class="post-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'">
                        <span class="post-category-badge">${category}</span>
                    </div>
                    <div class="post-info">
                        <h3 class="post-title">${title}</h3>
                        <p class="post-excerpt">${excerpt}</p>
                        <div class="post-meta">
                            <span class="post-author">${author}</span>
                            <span class="post-date">${date}</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
        
        // Event listeners
        setTimeout(() => {
            $$('.post-card').forEach(card => {
                const openHandler = (e) => {
                    if (e.type === 'keypress' && e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    openPostModal(card.dataset.id);
                };
                card.addEventListener('click', openHandler);
                card.addEventListener('keypress', openHandler);
            });
        }, 100);
    }

    function openPostModal(postId) {
        state.currentPost = state.posts.find(p => p.id == postId);
        if (!state.currentPost) return;
        
        // ✅ SANITIZADO
        const title = state.currentPost.title || 'Sin título';
        
        if (elements.modalGallery && state.currentPost.images && state.currentPost.images.length > 0) {
            elements.modalGallery.innerHTML = state.currentPost.images.map((img, i) => `
                <div class="modal-gallery-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${escapeHtml(img)}" alt="${escapeHtml(title)}" class="modal-gallery-img" loading="lazy" onerror="this.src='https://via.placeholder.com/800x600?text=Imagen+no+disponible'">
                </div>
            `).join('');
            
            // ✅ CORREGIDO: Sin onclick inline
            elements.modalThumbnails.innerHTML = state.currentPost.images.map((img, i) => `
                <button class="modal-thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ver imagen ${i + 1}">
                    <img src="${escapeHtml(img)}" alt="${escapeHtml(title)} - imagen ${i + 1}" loading="lazy">
                </button>
            `).join('');
            
            // Event listeners para thumbnails
            $$('.modal-thumbnail').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const index = parseInt(thumb.dataset.index);
                    changeModalImage(index);
                });
            });
        }
        
        if (elements.modalCategory) elements.modalCategory.textContent = state.currentPost.category || '';
        if (elements.modalTitle) elements.modalTitle.textContent = title;
        if (elements.modalAuthor) elements.modalAuthor.textContent = state.currentPost.author || '';
        if (elements.modalDate) elements.modalDate.textContent = formatDate(state.currentPost.created_at);
        if (elements.modalDescription) elements.modalDescription.textContent = state.currentPost.content || 'Sin contenido';
        
        if (elements.postModal) {
            elements.postModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            // ✅ Focus trap
            if (currentFocusTrapCleanup) currentFocusTrapCleanup();
            currentFocusTrapCleanup = trapFocus(elements.postModal);
        }
    }

    function changeModalImage(index) {
        $$('.modal-gallery-slide').forEach(s => s.classList.remove('active'));
        $$('.modal-thumbnail').forEach(t => t.classList.remove('active'));
        const slide = $(`.modal-gallery-slide[data-index="${index}"]`);
        const thumb = $(`.modal-thumbnail[data-index="${index}"]`);
        if (slide) slide.classList.add('active');
        if (thumb) thumb.classList.add('active');
    }

    function closePostModal() {
        if (elements.postModal) {
            elements.postModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (currentFocusTrapCleanup) {
            currentFocusTrapCleanup();
            currentFocusTrapCleanup = null;
        }
        state.currentPost = null;
    }

    function openNewPostModal() {
        if (!state.isAdmin) {
            showLogin();
            return;
        }
        if (elements.newPostModal) {
            elements.newPostModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            if (currentFocusTrapCleanup) currentFocusTrapCleanup();
            currentFocusTrapCleanup = trapFocus(elements.newPostModal);
        }
    }

    function closeNewPostModal() {
        if (elements.newPostModal) {
            elements.newPostModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (currentFocusTrapCleanup) {
            currentFocusTrapCleanup();
            currentFocusTrapCleanup = null;
        }
        if (elements.newPostForm) elements.newPostForm.reset();
        
        // ✅ Limpiar estado de imágenes pendientes
        state.pendingImagesUrls = [];
        state.pendingImagePreviews.clear();
        if (elements.imagePreviewGrid) elements.imagePreviewGrid.innerHTML = '';
        if (elements.uploadPlaceholder) elements.uploadPlaceholder.style.display = 'block';
    }

    async function createNewPost(e) {
        e.preventDefault();
        if (!supabase) return;
        
        if (!state.isAdmin) {
            showToast(C.blogConfig?.messages?.needLogin || 'Debes iniciar sesión');
            showLogin();
            return;
        }
        
        const formData = new FormData(elements.newPostForm);
        
        if (state.pendingImagesUrls.length === 0) {
            showToast(C.blogConfig?.messages?.needImage || 'Sube al menos una imagen');
            return;
        }
        
        const title = formData.get('title');
        
        const newPost = {
            title: title,
            slug: generateSlug(title), // ✅ NUEVO
            category: formData.get('category'),
            author: formData.get('author'),
            content: formData.get('content'),
            images: state.pendingImagesUrls,
            created_at: new Date().toISOString()
        };
        
        // ✅ Estado de carga
        const submitBtn = elements.newPostForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Publicando...</span>';
        submitBtn.disabled = true;
        
        try {
            const { error } = await supabase.from('posts').insert([newPost]);
            
            if (error) {
                console.error('Error creando post:', error);
                showToast(C.blogConfig?.messages?.postError + ': ' + error.message);
                return;
            }
            
            showToast(C.blogConfig?.messages?.postSuccess || '¡Post publicado!');
            closeNewPostModal();
            state.currentPage = 1; // Reset paginación
            await loadPosts();
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al publicar el post');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // ============================================
    // SUBIDA DE IMÁGENES (corregida)
    // ============================================
    function initImageUpload() {
        const area = elements.imageUploadArea;
        const input = elements.imageInput;
        if (!area || !input) return;
        
        area.addEventListener('click', (e) => {
            if (e.target === area || e.target.closest('.upload-placeholder')) input.click();
        });
        
        area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('dragover'); });
        area.addEventListener('dragleave', () => { area.classList.remove('dragover'); });
        area.addEventListener('drop', async (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            await handleFiles(e.dataTransfer.files);
        });
        input.addEventListener('change', async (e) => { await handleFiles(e.target.files); });
    }

    async function handleFiles(files) {
        if (!supabase) return;
        
        const validFiles = Array.from(files).filter(file => {
            if (!file.type.startsWith('image/')) {
                showToast(`${file.name} ${C.blogConfig?.messages?.notImage || 'no es una imagen'}`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast(`${file.name} ${C.blogConfig?.messages?.exceedsSize || 'excede 5MB'}`);
                return false;
            }
            return true;
        });
        
        if (validFiles.length === 0) return;
        showToast(C.blogConfig?.messages?.imageUploading || 'Subiendo imágenes...');
        
        for (const file of validFiles) {
            // ✅ CORREGIDO: Crear ID único para el preview
            const previewId = `preview-${Date.now()}-${Math.random().toString(36).substring(2)}`;
            
            // Crear preview con ID único y mostrar indicador de "subiendo"
            const preview = document.createElement('div');
            preview.className = 'image-preview-item';
            preview.dataset.previewId = previewId;
            preview.style.opacity = '0.6';
            preview.style.position = 'relative';
            
            const tempUrl = URL.createObjectURL(file);
            preview.innerHTML = `
                <img src="${tempUrl}" alt="${escapeHtml(file.name)}">
                <div class="uploading-indicator" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:white;font-size:0.7rem;">
                    Subiendo...
                </div>
            `;
            elements.imagePreviewGrid.appendChild(preview);
            state.pendingImagePreviews.set(previewId, preview);
            
            if (elements.uploadPlaceholder) elements.uploadPlaceholder.style.display = 'none';
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            
            try {
                // ✅ CORREGIDO: Usar STORAGE_BUCKET desde config
                const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
                
                if (error) {
                    console.error('Error subiendo:', error);
                    showToast(`${C.blogConfig?.messages?.imageError || 'Error al subir'}: ${file.name}`);
                    
                    // ✅ CORREGIDO: Eliminar preview si falla la subida
                    const failedPreview = state.pendingImagePreviews.get(previewId);
                    if (failedPreview) {
                        failedPreview.remove();
                        state.pendingImagePreviews.delete(previewId);
                    }
                    URL.revokeObjectURL(tempUrl);
                    continue;
                }
                
                const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
                state.pendingImagesUrls.push(publicUrl);
                
                // ✅ Actualizar preview: quitar indicador y habilitar botón eliminar
                const successPreview = state.pendingImagePreviews.get(previewId);
                if (successPreview) {
                    successPreview.style.opacity = '1';
                    successPreview.innerHTML = `
                        <img src="${publicUrl}" alt="${escapeHtml(file.name)}">
                        <button type="button" class="image-preview-remove" aria-label="Eliminar imagen">×</button>
                    `;
                    
                    const removeBtn = successPreview.querySelector('.image-preview-remove');
                    removeBtn.addEventListener('click', () => {
                        // Eliminar del array de URLs
                        const urlIndex = state.pendingImagesUrls.indexOf(publicUrl);
                        if (urlIndex > -1) state.pendingImagesUrls.splice(urlIndex, 1);
                        
                        successPreview.remove();
                        state.pendingImagePreviews.delete(previewId);
                        
                        if (state.pendingImagesUrls.length === 0 && elements.uploadPlaceholder) {
                            elements.uploadPlaceholder.style.display = 'block';
                        }
                    });
                }
                
                URL.revokeObjectURL(tempUrl);
            } catch (error) {
                console.error('Error inesperado:', error);
                const failedPreview = state.pendingImagePreviews.get(previewId);
                if (failedPreview) {
                    failedPreview.remove();
                    state.pendingImagePreviews.delete(previewId);
                }
                URL.revokeObjectURL(tempUrl);
            }
        }
        
        showToast(C.blogConfig?.messages?.imageSuccess || 'Imágenes subidas');
    }

    // ============================================
    // ESTRELLAS DEL HERO
    // ============================================
    function initBlogStars() {
        const starsContainer = elements.blogStars;
        if (!starsContainer) return;

        const isMobile = window.innerWidth < 769;
        const starCount = isMobile ? 5 : 15;
        const minSize = isMobile ? 2 : 1;
        const maxSize = isMobile ? 4 : 2.5;

        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'blog-star';

            const size = Math.random() * (maxSize - minSize) + minSize;
            const glowSize = size * 3;
            const duration = Math.random() * 4 + 3;
            const delay = Math.random() * 5;
            const minOpacity = Math.random() * 0.3 + 0.2;
            const maxOpacity = Math.random() * 0.4 + 0.5;

            star.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${size}px;
                height: ${size}px;
                --twinkle-duration: ${duration}s;
                --twinkle-delay: ${delay}s;
                --min-opacity: ${minOpacity};
                --max-opacity: ${maxOpacity};
                --glow-size: ${glowSize}px;
            `;
            starsContainer.appendChild(star);
        }
    }

    // ============================================
    // CURSOR PERSONALIZADO
    // ============================================
    function initCursor() {
        if (window.innerWidth < 769) return;
        
        const cursor = $('#cursor');
        const follower = $('#cursorFollower');
        if (!cursor || !follower) return;
        
        let mx = 0, my = 0;
        let fx = 0, fy = 0;
        
        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            cursor.style.left = mx + 'px';
            cursor.style.top = my + 'px';
        });
        
        function animateFollower() {
            fx = fx + (mx - fx) * 0.12;
            fy = fy + (my - fy) * 0.12;
            follower.style.left = fx + 'px';
            follower.style.top = fy + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();
        
        const hoverTargets = 'a, button, .post-card, .filter-btn, .blog-toggle, .modal-thumbnail, .category-tag, .image-upload-area';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            }
        });
    }

    // ============================================
    // EVENTOS
    // ============================================
    function initEvents() {
        if (elements.loginClose) elements.loginClose.addEventListener('click', () => {
            elements.loginModal.classList.remove('open');
            if (currentFocusTrapCleanup) {
                currentFocusTrapCleanup();
                currentFocusTrapCleanup = null;
            }
        });
        if (elements.loginOverlay) elements.loginOverlay.addEventListener('click', () => {
            elements.loginModal.classList.remove('open');
            if (currentFocusTrapCleanup) {
                currentFocusTrapCleanup();
                currentFocusTrapCleanup = null;
            }
        });
        if (elements.loginForm) elements.loginForm.addEventListener('submit', handleLogin);
        
        if (elements.newPostBtn) {
            elements.newPostBtn.addEventListener('click', openNewPostModal);
        }
        
        if (elements.newPostClose) elements.newPostClose.addEventListener('click', closeNewPostModal);
        if (elements.newPostOverlay) elements.newPostOverlay.addEventListener('click', closeNewPostModal);
        if (elements.newPostForm) elements.newPostForm.addEventListener('submit', createNewPost);
        
        if (elements.modalClose) elements.modalClose.addEventListener('click', closePostModal);
        if (elements.modalOverlay) elements.modalOverlay.addEventListener('click', closePostModal);
        
        if (elements.searchInput) {
            let searchTimeout;
            elements.searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    state.searchQuery = e.target.value;
                    renderPosts();
                }, 300);
            });
        }
        
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener('change', (e) => {
                state.sortValue = e.target.value;
                renderPosts();
            });
        }
        
        if (elements.blogFilters) {
            elements.blogFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    $$('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    state.currentFilter = e.target.dataset.filter;
                    renderPosts();
                }
            });
        }
        
        if (elements.addCategoryBtn) elements.addCategoryBtn.addEventListener('click', addCategory);
        if (elements.newCategoryInput) {
            elements.newCategoryInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); addCategory(); }
            });
        }
        
        initImageUpload();
        
        // Escape para cerrar modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (elements.postModal?.classList.contains('open')) closePostModal();
                if (elements.newPostModal?.classList.contains('open')) closeNewPostModal();
                if (elements.loginModal?.classList.contains('open')) {
                    elements.loginModal.classList.remove('open');
                    if (currentFocusTrapCleanup) {
                        currentFocusTrapCleanup();
                        currentFocusTrapCleanup = null;
                    }
                }
            }
        });
        
        // Sincronización entre pestañas (categorías)
        window.addEventListener('storage', (e) => {
            if (e.key === 'blog_categories') {
                loadCategories();
                renderCategories();
            }
        });
    }

    function initScrollEffects() {
        window.addEventListener('scroll', () => {
            if (elements.blogHeader) {
                elements.blogHeader.classList.toggle('scrolled', window.scrollY > 100);
            }
        }, { passive: true });
    }

    // ============================================
    // INIT (único punto de entrada)
    // ============================================
    async function init() {
        captureElements(); // ✅ Capturar DOM DESPUÉS de que esté listo
        loadCategories();  // ✅ Cargar categorías persistidas
        
        if (!initSupabase()) {
            showToast('Error de conexión con la base de datos');
            return;
        }
        
        await checkAuth();
        await loadPosts();
        renderCategories();
        initEvents();
        initScrollEffects();
        initBlogStars();
        initCursor();
    }

    // ✅ ÚNICO punto de arranque
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();