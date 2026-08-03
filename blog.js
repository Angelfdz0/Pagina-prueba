/* ============================================================
BLOG ONLINE - CON SUPABASE + LOGIN + IMÁGENES (Versión Robusta)
============================================================ */
(function() {
"use strict";
console.log("🚀 Blog.js iniciado");

// ★ DEFINIR C (SITE_CONFIG) - ESTA LÍNEA FALTABA ★
const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};

// ★ CONFIGURACIÓN DE SUPABASE ★
const SUPABASE_URL = C.supabase?.url || 'https://ouxfmeugibrpjysjfqso.supabase.co';
const SUPABASE_KEY = C.supabase?.key || 'sb_publishable_jAgXqz1iqlEyveCIFy4eOw_idYvxmoQ';

if (typeof window.supabase === 'undefined') {
    console.error("❌ Supabase no está cargado. Revisa tu conexión a internet.");
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Estado
let posts = [];
let categories = C.blogConfig?.categories || ['historias', 'recetas', 'opiniones'];
let currentFilter = "all";
let searchQuery = "";
let sortValue = "default";
let currentPost = null;
let isAdmin = false;

// Elementos DOM (usando getElementById para mayor velocidad y seguridad)
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
    modalAuthor: document.getElementById("modalAuthor"),
    modalDate: document.getElementById("modalDate"),
    modalDescription: document.getElementById("modalDescription"),
    
    newPostModal: document.getElementById("newPostModal"),
    newPostOverlay: document.getElementById("newPostOverlay"),
    newPostBtn: document.getElementById("newPostBtn"),
    newPostClose: document.getElementById("newPostClose"),
    newPostForm: document.getElementById("newPostForm"),
    
    loginModal: document.getElementById("loginModal"),
    loginOverlay: document.getElementById("loginOverlay"),
    loginClose: document.getElementById("loginClose"),
    loginForm: document.getElementById("loginForm"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    loginError: document.getElementById("loginError"),
    
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

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Inicialización
async function init() {
    console.log("🔄 Iniciando Blog...");
    await checkAuth();
    await loadPosts();
    renderCategories();
    renderPosts();
    initEvents();
    initScrollEffects();
    initBlogStars();
    console.log("✅ Blog iniciado correctamente");
}

// Verificar autenticación
async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        isAdmin = !!session;
        console.log("🔑 Estado de sesión:", isAdmin ? "Logueado" : "No logueado");
        
        // ★ El botón "+" SIEMPRE visible
        if (elements.newPostBtn) {
            elements.newPostBtn.style.display = "flex";
        }
        
        // ★ CREAR BOTÓN DE LOGOUT DINÁMICAMENTE
        let logoutBtn = document.getElementById("logoutBtn");
        
        if (isAdmin) {
            // Si no existe el botón, crearlo
            if (!logoutBtn) {
                logoutBtn = document.createElement("button");
                logoutBtn.id = "logoutBtn";
                logoutBtn.className = "blog-logout";
                logoutBtn.setAttribute("aria-label", "Cerrar sesión");
                logoutBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                `;
                logoutBtn.addEventListener("click", handleLogout);
                
                // Insertar después del botón "+"
                elements.newPostBtn.parentNode.insertBefore(logoutBtn, elements.newPostBtn.nextSibling);
            }
            logoutBtn.style.display = "flex";
        } else {
            // Ocultar botón si no está logueado
            if (logoutBtn) logoutBtn.style.display = "none";
        }
    } catch (error) {
        console.error("❌ Error al verificar sesión:", error);
    }
}

function showLogin() {
    if (elements.loginModal) {
        elements.loginModal.classList.add("open");
    }
}

// Cargar posts desde Supabase
async function loadPosts() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error cargando posts:', error);
            showToast(C.blogConfig.messages.dbError);
            return;
        }
        
        posts = data || [];
        console.log(`📥 ${posts.length} posts cargados`);
    } catch (error) {
        console.error("❌ Error inesperado:", error);
    }
}

function renderCategories() {
    if (!elements.blogFilters) return;
    
    const allBtn = `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>`;
    const categoryBtns = categories.map(cat => 
        `<button class="filter-btn ${currentFilter === cat ? 'active' : ''}" data-filter="${cat}">${capitalize(cat)}</button>`
    ).join('');
    
    elements.blogFilters.innerHTML = allBtn + categoryBtns;
    
    if (elements.postCategory) {
        elements.postCategory.innerHTML = categories.map(cat => 
            `<option value="${cat}">${capitalize(cat)}</option>`
        ).join('');
    }
    
    if (elements.categoryList) {
        elements.categoryList.innerHTML = categories.map(cat => `
            <span class="category-tag">
                ${capitalize(cat)}
                <span class="remove-category" data-category="${cat}" onclick="window.removeCategory('${cat}')">×</span>
            </span>
        `).join('');
    }
}

function addCategory() {
    const input = elements.newCategoryInput;
    const newCat = input.value.trim().toLowerCase();
    
    if (!newCat || categories.includes(newCat)) {
        showToast(C.blogConfig.messages.categoryExists);
        return;
    }
    
    categories.push(newCat);
    input.value = '';
    renderCategories();
    showToast(C.blogConfig.messages.categoryAdded);
}

window.removeCategory = function(cat) {
    if (categories.length <= 1) {
        showToast(C.blogConfig.messages.invalidCategory);
        return;
    }
    categories = categories.filter(c => c !== cat);
    renderCategories();
    showToast(C.blogConfig.messages.categoryRemoved);
};

function renderPosts() {
    if (!elements.postsGrid) return;
    
    let filtered = posts.filter(p => {
        const matchesFilter = currentFilter === "all" || p.category === currentFilter;
        const matchesSearch = !searchQuery || 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.content && p.content.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    if (sortValue === "recent") {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    if (filtered.length === 0) {
        elements.postsGrid.innerHTML = "";
        if (elements.noResults) elements.noResults.style.display = "block";
        return;
    }
    
    if (elements.noResults) elements.noResults.style.display = "none";
    
    elements.postsGrid.innerHTML = filtered.map((post, index) => {
        const excerpt = post.content ? post.content.substring(0, 120) + "..." : "";
        const date = formatDate(post.created_at);
        const firstImage = post.images && post.images.length > 0 ? post.images[0] : 'https://via.placeholder.com/400x300?text=Sin+Imagen';
        
        return `
            <article class="post-card" data-id="${post.id}" style="animation: fadeInUp 0.6s var(--ease-out-expo) ${index * 0.1}s backwards;">
                <div class="post-image-wrapper">
                    <img src="${firstImage}" alt="${post.title}" class="post-image" loading="lazy">
                    <span class="post-category-badge">${post.category}</span>
                </div>
                <div class="post-info">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${excerpt}</p>
                    <div class="post-meta">
                        <span class="post-author">${post.author}</span>
                        <span class="post-date">${date}</span>
                    </div>
                </div>
            </article>
        `;
    }).join("");
    
    setTimeout(() => {
        $$(".post-card").forEach(card => {
            card.addEventListener("click", (e) => {
                e.preventDefault();
                openPostModal(card.dataset.id);
            });
        });
    }, 100);
}

function openPostModal(postId) {
    currentPost = posts.find(p => p.id === postId);
    if (!currentPost) return;
    
    if (elements.modalGallery && currentPost.images && currentPost.images.length > 0) {
        elements.modalGallery.innerHTML = currentPost.images.map((img, i) => `
            <div class="modal-gallery-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                <img src="${img}" alt="${currentPost.title}" class="modal-gallery-img" loading="lazy">
            </div>
        `).join('');
        
        elements.modalThumbnails.innerHTML = currentPost.images.map((img, i) => `
            <button class="modal-thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="window.changeModalImage(${i})">
                <img src="${img}" alt="${currentPost.title}" loading="lazy">
            </button>
        `).join('');
    }
    
    if (elements.modalCategory) elements.modalCategory.textContent = currentPost.category;
    if (elements.modalTitle) elements.modalTitle.textContent = currentPost.title;
    if (elements.modalAuthor) elements.modalAuthor.textContent = currentPost.author;
    if (elements.modalDate) elements.modalDate.textContent = formatDate(currentPost.created_at);
    if (elements.modalDescription) elements.modalDescription.textContent = currentPost.content || "Sin contenido";
    
    if (elements.postModal) {
        elements.postModal.classList.add("open");
        document.body.style.overflow = "hidden";
    }
}

window.changeModalImage = function(index) {
    $$(".modal-gallery-slide").forEach(s => s.classList.remove("active"));
    $$(".modal-thumbnail").forEach(t => t.classList.remove("active"));
    const slide = $(`.modal-gallery-slide[data-index="${index}"]`);
    const thumb = $(`.modal-thumbnail[data-index="${index}"]`);
    if (slide) slide.classList.add("active");
    if (thumb) thumb.classList.add("active");
};

function closePostModal() {
    if (elements.postModal) {
        elements.postModal.classList.remove("open");
        document.body.style.overflow = "";
    }
    currentPost = null;
}

async function handleLogin(e) {
    e.preventDefault();
    const email = elements.loginEmail.value;
    const password = elements.loginPassword.value;
    
    if (elements.loginError) elements.loginError.textContent = "Verificando...";
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        console.error("Error de login:", error);
        if (elements.loginError) elements.loginError.textContent = "Credenciales inválidas. Verifica tu email y contraseña.";
        return;
    }
    
    isAdmin = true;
    if (elements.loginModal) elements.loginModal.classList.remove("open");
    if (elements.newPostBtn) elements.newPostBtn.style.display = "flex";
    if (elements.loginError) elements.loginError.textContent = "";
    showToast(C.blogConfig.messages.loginWelcome);
}

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        isAdmin = false;
        
        // Ocultar botón de logout
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) logoutBtn.style.display = "none";
        
        showToast(C.blogConfig.messages.sessionClosed);
        console.log("✅ Sesión cerrada");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        showToast(C.blogConfig.messages.logoutError || "Error al cerrar sesión");
    }
}

async function createNewPost(e) {
    e.preventDefault();
    
    if (!isAdmin) {
        showToast(C.blogConfig.messages.needLogin);
        showLogin();
        return;
    }
    
    const formData = new FormData(elements.newPostForm);
    const uploadedUrls = window.pendingImagesUrls || [];
    
    if (uploadedUrls.length === 0) {
        showToast(C.blogConfig.messages.needImage);
        return;
    }
    
    const newPost = {
        title: formData.get('title'),
        category: formData.get('category'),
        author: formData.get('author'),
        content: formData.get('content'),
        images: uploadedUrls,
        created_at: new Date().toISOString()
    };
    
    const submitBtn = elements.newPostForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "<span>Publicando...</span>";
    submitBtn.disabled = true;
    
    const { error } = await supabase.from('posts').insert([newPost]);
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    
    if (error) {
        console.error('Error creando post:', error);
        showToast(C.blogConfig.messages.postError + ': ' + error.message);
        return;
    }
    
    showToast(C.blogConfig.messages.postSuccess);
    closeNewPostModal();
    await loadPosts();
    renderPosts();
}

function closeNewPostModal() {
    if (elements.newPostModal) {
        elements.newPostModal.classList.remove("open");
        document.body.style.overflow = "";
    }
    if (elements.newPostForm) elements.newPostForm.reset();
    window.pendingImagesUrls = [];
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
    area.addEventListener('dragleave', () => { area.classList.remove('dragover'); });
    area.addEventListener('drop', async (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        await handleFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', async (e) => { await handleFiles(e.target.files); });
}

async function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) { showToast(`${file.name} ${C.blogConfig.messages.notImage}`); return false; }
        if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} ${C.blogConfig.messages.exceedsSize}`); return false; }
        return true;
    });
    
    if (validFiles.length === 0) return;
    showToast(C.blogConfig.messages.imageUploading);
    if (!window.pendingImagesUrls) window.pendingImagesUrls = [];
    
    for (const file of validFiles) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview-item';
            preview.innerHTML = `<img src="${e.target.result}" alt="${file.name}"><button type="button" class="image-preview-remove" onclick="this.parentElement.remove()">×</button>`;
            elements.imagePreviewGrid.appendChild(preview);
            if (elements.uploadPlaceholder) elements.uploadPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error } = await supabase.storage.from('blog-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (error) {
            console.error('Error subiendo:', error);
            showToast(`${C.blogConfig.messages.imageError}: ${file.name}`);
            continue;
        }
        
        const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(fileName);
        window.pendingImagesUrls.push(publicUrl);
    }
    showToast(C.blogConfig.messages.imageSuccess);
}

function initEvents() {
    console.log("⚙️ Inicializando eventos...");
    
    if (elements.loginClose) elements.loginClose.addEventListener("click", () => elements.loginModal.classList.remove("open"));
    if (elements.loginOverlay) elements.loginOverlay.addEventListener("click", () => elements.loginModal.classList.remove("open"));
    if (elements.loginForm) elements.loginForm.addEventListener("submit", handleLogin);
    
    // ★ AQUÍ ESTÁ LA MAGIA DEL BOTÓN "+" ★
    if (elements.newPostBtn) {
        elements.newPostBtn.addEventListener("click", () => {
            console.log("🖱️ Botón Nuevo Post clickeado. isAdmin:", isAdmin);
            if (!isAdmin) {
                showLogin();
            } else {
                if (elements.newPostModal) {
                    elements.newPostModal.classList.add("open");
                    document.body.style.overflow = "hidden";
                }
            }
        });
    } else {
        console.warn("⚠️ No se encontró el botón newPostBtn en el HTML");
    }
    
    if (elements.newPostClose) elements.newPostClose.addEventListener("click", closeNewPostModal);
    if (elements.newPostOverlay) elements.newPostOverlay.addEventListener("click", closeNewPostModal);
    if (elements.newPostForm) elements.newPostForm.addEventListener("submit", createNewPost);
    
    if (elements.modalClose) elements.modalClose.addEventListener("click", closePostModal);
    if (elements.modalOverlay) elements.modalOverlay.addEventListener("click", closePostModal);
    
    if (elements.searchInput) {
        let searchTimeout;
        elements.searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => { searchQuery = e.target.value; renderPosts(); }, 300);
        });
    }
    
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener("change", (e) => { sortValue = e.target.value; renderPosts(); });
    }
    
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
    
    if (elements.addCategoryBtn) elements.addCategoryBtn.addEventListener("click", addCategory);
    if (elements.newCategoryInput) {
        elements.newCategoryInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") { e.preventDefault(); addCategory(); }
        });
    }
    
    initImageUpload();
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (elements.postModal?.classList.contains("open")) closePostModal();
            if (elements.newPostModal?.classList.contains("open")) closeNewPostModal();
            if (elements.loginModal?.classList.contains("open")) elements.loginModal.classList.remove("open");
        }
    });
}

function initScrollEffects() {
    window.addEventListener("scroll", () => {
        if (elements.blogHeader) elements.blogHeader.classList.toggle("scrolled", window.scrollY > 100);
    }, { passive: true });
}

function initBlogStars() {
    const starsContainer = document.getElementById("blogStars");
    if (!starsContainer) return;
    for (let i = 0; i < 35; i++) {
        const star = document.createElement("div");
        star.className = "blog-star";
        star.style.cssText = `left: ${Math.random()*100}%; top: ${Math.random()*100}%; width: ${Math.random()*1.5+1}px; height: ${Math.random()*1.5+1}px; --twinkle-duration: ${Math.random()*4+3}s; --twinkle-delay: ${Math.random()*5}s; --min-opacity: ${Math.random()*0.2+0.1}; --max-opacity: ${Math.random()*0.4+0.4}; --glow-size: ${(Math.random()*1.5+1)*2.5}px;`;
        starsContainer.appendChild(star);
    }
}

function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function showToast(message) {
    if (!elements.blogToast) return;
    elements.blogToast.textContent = message;
    elements.blogToast.classList.add("show");
    setTimeout(() => elements.blogToast.classList.remove("show"), 2500);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// ============================================
// CURSOR PERSONALIZADO
// ============================================
function initCursor() {
    if (window.innerWidth < 769) return;
    
    const cursor = document.getElementById("cursor");
    const follower = document.getElementById("cursorFollower");
    if (!cursor || !follower) return;
    
    let mx = 0, my = 0;
    let fx = 0, fy = 0;
    
    document.addEventListener("mousemove", (e) => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = mx + "px";
        cursor.style.top = my + "px";
    });
    
    function animateFollower() {
        fx = fx + (mx - fx) * 0.12;
        fy = fy + (my - fy) * 0.12;
        follower.style.left = fx + "px";
        follower.style.top = fy + "px";
        requestAnimationFrame(animateFollower);
    }
    animateFollower();
    
    // Hover effect en elementos interactivos
    const hoverTargets = "a, button, .post-card, .filter-btn, .blog-toggle, .modal-thumbnail, .category-tag, .image-upload-area";
    document.addEventListener("mouseover", (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.add("hover");
            follower.classList.add("hover");
        }
    });
    document.addEventListener("mouseout", (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.remove("hover");
            follower.classList.remove("hover");
        }
    });
}

// Llamar al iniciar
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        init();
        initCursor();
    });
} else {
    init();
    initCursor();
}
})();