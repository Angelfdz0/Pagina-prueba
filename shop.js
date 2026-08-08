/* ============================================================
   SHOP.JS — CEREBRO DE LA TIENDA ONLINE
   ============================================================
   Sistema completo de e-commerce con:
   - Catálogo de productos desde Supabase
   - Carrito de compras con localStorage
   - Modal de ficha técnica con galería y variantes
   - Códigos de descuento (anti-abuso: 1 por persona + límite global)
   - Checkout por WhatsApp + pagos con tarjeta (Mercado Pago/Stripe)
   - Popup de promociones con carrusel
   - Botón flotante de WhatsApp
   
   ✅ Iconos Font Awesome integrados
   ============================================================ */

(function() {
    "use strict";

    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};
    let PRODUCTS = C.ecommerce.products || []; // Respaldo si la BD está vacía

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔌 SUPABASE (cliente compartido para órdenes y cupones)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const supabaseOrders = window.__supabaseShared || 
        (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 CARGA DE PRODUCTOS DESDE BASE DE DATOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function loadProductsFromDB() {
        try {
            const { data, error } = await supabaseOrders.from('products').select('*')
                .eq('is_active', true).order('created_at', { ascending: false });
            if (error) throw error;
            if (data && data.length) {
                PRODUCTS = data.map(p => ({
                    id: p.id, name: p.name, category: p.category,
                    price: Number(p.price),
                    originalPrice: p.original_price ? Number(p.original_price) : null,
                    badge: p.badge || null, description: p.description || '',
                    features: p.features || [], images: p.images || [],
                    variants: (p.variants || []).map(v => ({ ...v, price: Number(v.price), inStock: !!v.inStock }))
                }));
            }
        } catch (e) { console.warn('Tienda: usando productos de config.js —', e.message); }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💾 GUARDAR ORDEN EN BASE DE DATOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function saveOrder(orderData) {
        try {
            const { error } = await supabaseOrders.from('orders').insert([orderData]);
            if (error) { console.error('Error guardando orden:', error); return false; }
            return true;
        } catch (e) { console.error(e); return false; }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💳 MÓDULO DE PAGOS CON TARJETA (Mercado Pago/Stripe)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const PAYMENTS_ENABLED = !!(C.payments && C.payments.enabled);

    async function checkoutWithCard() {
        if (!PAYMENTS_ENABLED) return;
        if (cart.length === 0) { showToast("Tu carrito está vacío.", "error"); return; }
        
        const { subtotal, discount, total } = getCartTotals();
        const btn = $("#payCardBtn");
        btn.disabled = true; btn.textContent = "Creando pago...";
        
        try {
            // Registrar cupón antes de redirigir a la pasarela de pago
            if (appliedPromoCode) {
                markCouponUsed(appliedPromoCode.code);
                bumpCouponUsage(appliedPromoCode.code);
            }
            
            const res = await fetch(`${C.supabase.url}/functions/v1/create-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${C.supabase.key}` },
                body: JSON.stringify({
                    items: cart.map(i => ({ id: i.id, name: i.name, variant: i.variantName, qty: i.quantity, price: i.price })),
                    subtotal, discount, total,
                    promo_code: appliedPromoCode ? appliedPromoCode.code : null,
                    customer_name: "Cliente Web",
                }),
            });
            
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error);
            
            cart = []; appliedPromoCode = null;
            saveCart(); updateCart(); updatePromoUI(); closeCart();
            window.location.href = data.init_point;
        } catch (e) {
            showToast("No se pudo crear el pago: " + e.message, "error");
            btn.disabled = false;
            btn.textContent = C.payments?.buttonLabel || "💳 Pagar con tarjeta";
        }
    }

    // Manejar retorno de pasarela de pago
    function handlePaymentReturn() {
        const params = new URLSearchParams(window.location.search);
        const payment = params.get("payment");
        if (!payment) return;
        
        if (payment === "success") showToast("✅ ¡Pago aprobado! Gracias por tu compra.", "success");
        else if (payment === "pending") showToast("⏳ Pago pendiente. Revisa tu correo.", "info");
        else showToast("❌ El pago no se completó.", "error");
        
        history.replaceState(null, "", window.location.pathname);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 FORMATEO DE MONEDA (MXN)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Imagen de respaldo cuando falla una imagen
    const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23111111'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%238a8578' text-anchor='middle' dy='.3em'%3EImagen no disponible%3C/text%3E%3C/svg%3E";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 ESTADO GLOBAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let cart = [];
    try {
        const stored = localStorage.getItem('cart');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) cart = parsed;
            else { console.warn("⚠️ Carrito corrupto. Reiniciando..."); localStorage.removeItem('cart'); }
        }
    } catch (err) {
        console.warn("⚠️ Error al leer carrito:", err);
        localStorage.removeItem('cart');
        cart = [];
    }

    let currentFilter = "all";
    let searchQuery = "";
    let sortValue = "default";
    let currentProduct = null;
    let currentVariant = null;
    let currentImageIndex = 0;
    let appliedPromoCode = null;
    let isProcessingCheckout = false;
    let isProcessingPromo = false;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 UTILIDADES DOM
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    function lockScroll() {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
    }

    function unlockScroll() {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    }

    // Cache de elementos DOM
    const elements = {
        productsGrid: $("#productsGrid"),
        searchInput: $("#searchInput"),
        sortSelect: $("#sortSelect"),
        filterBtns: $$(".filter-btn"),
        cartToggle: $("#cartToggle"),
        cartSidebar: $("#cartSidebar"),
        cartClose: $("#cartClose"),
        cartOverlay: $("#cartOverlay"),
        cartItems: $("#cartItems"),
        cartEmpty: $("#cartEmpty"),
        cartCount: $("#cartCount"),
        cartTotal: $("#cartTotal"),
        noResults: $("#noResults"),
        shopHeader: $("#shopHeader"),
        cartSubtotal: $("#cartSubtotal"),
        cartDiscountRow: $("#cartDiscountRow"),
        cartDiscountAmount: $("#cartDiscountAmount"),
        productModal: $("#productModal"),
        modalOverlay: $("#modalOverlay"),
        modalClose: $("#modalClose"),
        modalGallery: $("#modalGallery"),
        modalThumbnails: $("#modalThumbnails"),
        modalTitle: $("#modalTitle"),
        modalCategory: $("#modalCategory"),
        modalPrice: $("#modalPrice"),
        modalDescription: $("#modalDescription"),
        modalFeatures: $("#modalFeatures"),
        modalVariants: $("#modalVariants"),
        modalAddToCart: $("#modalAddToCart")
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔔 SISTEMA DE TOASTS (notificaciones)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function showToast(message, type = "info") {
        let toast = $(".promo-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "promo-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");
            toast.setAttribute("aria-atomic", "true");
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.dataset.type = type;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛡️ CONTROL DE CUPONES (anti-abuso: 1 por persona)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function getUsedCoupons() {
        try {
            const list = JSON.parse(localStorage.getItem('usedCoupons'));
            return Array.isArray(list) ? list : [];
        } catch (err) { return []; }
    }

    function markCouponUsed(code) {
        const used = getUsedCoupons();
        if (!used.includes(code)) {
            used.push(code);
            try { localStorage.setItem('usedCoupons', JSON.stringify(used)); } catch (err) {}
        }
    }

    // Verificar límite global de usos del cupón
    async function checkCouponGlobalLimit(code) {
        try {
            const { data } = await supabaseOrders
                .from('coupons').select('used_count, max_uses')
                .eq('code', code).single();
            if (!data) return true;
            if (!data.max_uses) return true;
            return (data.used_count || 0) < data.max_uses;
        } catch (err) {
            return true;
        }
    }

    // Incrementar contador de usos del cupón
    async function bumpCouponUsage(code) {
        try {
            const { data } = await supabaseOrders
                .from('coupons').select('id, used_count, max_uses')
                .eq('code', code).single();
            if (!data) return;
            if (data.max_uses && (data.used_count || 0) >= data.max_uses) return;
            await supabaseOrders.from('coupons')
                .update({ used_count: (data.used_count || 0) + 1 })
                .eq('id', data.id);
        } catch (err) { /* silencioso */ }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 INICIALIZACIÓN PRINCIPAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function init() {
        if (C.ecommerce && C.ecommerce.enabled === false) { 
            window.location.href = "index.html"; 
            return; 
        }
        
        buildShopHeader();
        buildShopHero();
        await loadProductsFromDB();
        renderProducts();
        updateCart();
        updatePromoUI();
        initEvents();
        initScrollEffects();
        initModalKeyboard();
        await initPromoPopup();
        initWhatsAppButton();
        initStorageSync();
        handlePaymentReturn();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏗️ CONSTRUCCIÓN DE HEADER Y HERO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function buildShopHeader() {
        const header = $("#shopHeader");
        if (!header) return;
        const h = C.header;
        header.innerHTML = `
            <div class="shop-header-inner">
                <a href="index.html" class="shop-logo">${h.logo.text}<span>${h.logo.highlight}</span></a>
                <div class="shop-search-bar">
                    <input type="text" id="searchInput" placeholder="Buscar productos..." aria-label="Buscar productos">
                    <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
                </div>
                <div class="shop-header-actions">
                    <button class="cart-toggle" id="cartToggle" aria-label="Carrito de compras">
                        <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
                        <span class="cart-count" id="cartCount" aria-live="polite" aria-atomic="true">0</span>
                    </button>
                </div>
            </div>
        `;
        elements.cartToggle = $("#cartToggle");
        elements.cartCount = $("#cartCount");
        elements.searchInput = $("#searchInput");
    }

    function buildShopHero() {
        const heroContent = $(".shop-hero-content");
        if (!heroContent || !C.tienda) return;
        const t = C.tienda.hero;
        heroContent.innerHTML = `
            <span class="shop-eyebrow">${t.eyebrow}</span>
            <h1 class="shop-title">
                <span class="line"><span class="line-inner">${t.titleLine1}</span></span>
                <span class="line"><span class="line-inner"><em>${t.titleLine2}</em></span></span>
            </h1>
            <p class="shop-subtitle">${t.subtitle}</p>
        `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🖼️ MANEJO DE IMÁGENES (fallback)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function attachImageFallback(imgElement) {
        if (!imgElement) return;
        imgElement.addEventListener('error', function() {
            if (this.src !== FALLBACK_IMAGE) this.src = FALLBACK_IMAGE;
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛍️ RENDERIZADO DE PRODUCTOS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function renderProducts() {
        if (!elements.productsGrid) return;
        let filtered = filterProducts();
        filtered = sortProducts(filtered);
        
        if (filtered.length === 0) {
            elements.productsGrid.innerHTML = "";
            if (elements.noResults) elements.noResults.style.display = "block";
            return;
        }
        
        if (elements.noResults) elements.noResults.style.display = "none";
        const html = filtered.map((product, index) => createProductCard(product, index)).join("");
        elements.productsGrid.innerHTML = html;
        $$(".product-image").forEach(attachImageFallback);
        
        setTimeout(() => {
            $$(".product-view-more").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    openProductModal(parseInt(btn.dataset.id));
                });
            });
            $$(".product-add-to-cart").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    addToCart(parseInt(btn.dataset.id), null);
                });
            });
        }, 100);
    }

    function filterProducts() {
        return PRODUCTS.filter(p => {
            const matchesFilter = currentFilter === "all" || p.category === currentFilter;
            const matchesSearch = !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }

    function sortProducts(products) {
        const sorted = [...products];
        switch(sortValue) {
            case "price-asc": return sorted.sort((a, b) => a.price - b.price);
            case "price-desc": return sorted.sort((a, b) => b.price - a.price);
            case "name-asc": return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default: return sorted;
        }
    }

    function createProductCard(product, index) {
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const firstImage = product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMAGE;
        const formattedPrice = formatCurrency(product.price);
        const formattedOriginal = product.originalPrice ? formatCurrency(product.originalPrice) : "";
        
        return `
            <article class="product-card" data-category="${product.category}">
                <div class="product-image-wrapper">
                    <img src="${firstImage}" alt="${product.name}" class="product-image" loading="lazy">
                    ${product.badge ? `<span class="product-badge"><i class="fa-solid fa-star" aria-hidden="true"></i>${product.badge}</span>` : ""}
                    <div class="product-actions">
                        <button class="action-btn product-add-to-cart" data-id="${product.id}" aria-label="Agregar ${product.name} al carrito">
                            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        ${formattedPrice}
                        ${hasDiscount ? `<span class="original-price">${formattedOriginal}</span>` : ""}
                    </div>
                    <button class="product-view-more" data-id="${product.id}">
                        Ver Más
                        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </button>
                </div>
            </article>
        `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📦 MODAL DE FICHA TÉCNICA (producto)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function getDefaultVariant(product) {
        if (!product || !Array.isArray(product.variants) || product.variants.length === 0) return null;
        const availableVariant = product.variants.find(variant => variant.inStock);
        return availableVariant || product.variants[0];
    }

    function getFirstAvailableVariant(product) {
        if (!product || !Array.isArray(product.variants) || product.variants.length === 0) return null;
        return product.variants.find(variant => variant.inStock === true) || null;
    }

    function isAddToCartAllowed(product, variant) {
        if (!product) return false;
        const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
        if (!hasVariants) return true;
        return !!variant && variant.inStock === true;
    }

    function openProductModal(productId) {
        currentProduct = PRODUCTS.find(p => p.id === productId);
        if (!currentProduct) return;
        currentImageIndex = 0;
        currentVariant = getDefaultVariant(currentProduct);
        renderModalContent();
        elements.productModal.classList.add("open");
        lockScroll();
        initModalGallery();
        syncGalleryWithVariant(currentProduct, currentVariant);
    }

    function updateModalAddButton() {
        if (!elements.modalAddToCart || !currentProduct) return;
        const hasVariants = Array.isArray(currentProduct.variants) && currentProduct.variants.length > 0;
        const available = !hasVariants || (currentVariant && currentVariant.inStock === true);
        elements.modalAddToCart.disabled = !available;
        elements.modalAddToCart.innerHTML = available 
            ? '<i class="fa-solid fa-cart-plus" aria-hidden="true"></i> Agregar al Carrito'
            : '<i class="fa-solid fa-ban" aria-hidden="true"></i> Agotado';
    }

    function renderModalContent() {
        if (!currentProduct) return;
        const product = currentProduct;
        const variant = currentVariant || product;
        
        // Botón de cerrar con Font Awesome
        if (elements.modalClose) {
            elements.modalClose.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        }
        
        // Galería de imágenes
        if (elements.modalGallery && product.images && product.images.length > 0) {
            elements.modalGallery.innerHTML = product.images.map((img, i) => `
                <div class="modal-gallery-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${img}" alt="${product.name}" class="modal-gallery-img" loading="lazy">
                </div>
            `).join("");
            $$(".modal-gallery-img").forEach(attachImageFallback);
        }
        
        // Miniaturas
        if (elements.modalThumbnails && product.images && product.images.length > 0) {
            elements.modalThumbnails.innerHTML = product.images.map((img, i) => `
                <button class="modal-thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ver imagen ${i + 1}">
                    <img src="${img}" alt="${product.name} ${i + 1}" loading="lazy">
                </button>
            `).join("");
            $$(".modal-thumbnail img").forEach(attachImageFallback);
        }
        
        // Información del producto
        if (elements.modalCategory) elements.modalCategory.textContent = product.category;
        if (elements.modalTitle) elements.modalTitle.textContent = product.name;
        if (elements.modalPrice) elements.modalPrice.innerHTML = formatCurrency(variant.price);
        if (elements.modalDescription) elements.modalDescription.textContent = product.description;
        
        // Características
        if (elements.modalFeatures && product.features) {
            elements.modalFeatures.innerHTML = product.features.map(f => `
                <li class="modal-feature-item">
                    <i class="fa-solid fa-check" aria-hidden="true"></i>
                    <span>${f}</span>
                </li>
            `).join("");
        }
        
        // Variantes
        if (elements.modalVariants && product.variants && product.variants.length > 0) {
            const activeIndex = currentVariant ? product.variants.findIndex(v => v === currentVariant) : -1;
            elements.modalVariants.innerHTML = `
                <h4 class="modal-variants-title">Variantes disponibles</h4>
                <div class="modal-variants-grid">
                    ${product.variants.map((v, i) => `
                        <button class="modal-variant ${i === activeIndex ? 'active' : ''} ${!v.inStock ? 'out-of-stock' : ''}" data-index="${i}" ${!v.inStock ? 'aria-disabled="true"' : ''} aria-label="${v.name} - ${v.inStock ? formatCurrency(v.price) : 'Agotado'}">
                            <img src="${v.image}" alt="${v.name}" loading="lazy">
                            <div class="modal-variant-info">
                                <span class="modal-variant-name">${v.name}</span>
                                <span class="modal-variant-price">${formatCurrency(v.price)}</span>
                                ${!v.inStock ? '<span class="modal-variant-stock">Agotado</span>' : ''}
                            </div>
                        </button>
                    `).join("")}
                </div>
            `;
            $$(".modal-variant img").forEach(attachImageFallback);
            $$(".modal-variant").forEach(btn => {
                btn.addEventListener("click", () => {
                    if (btn.classList.contains("out-of-stock")) return;
                    $$(".modal-variant").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    currentVariant = product.variants[parseInt(btn.dataset.index)];
                    if (elements.modalPrice) elements.modalPrice.innerHTML = formatCurrency(currentVariant.price);
                    updateModalAddButton();
                    syncGalleryWithVariant(product, currentVariant);
                });
            });
        } else if (elements.modalVariants) {
            elements.modalVariants.innerHTML = "";
        }
        
        // Botón agregar al carrito
        if (elements.modalAddToCart) {
            elements.modalAddToCart.onclick = () => {
                if (!isAddToCartAllowed(product, currentVariant)) {
                    showToast("No hay una variante disponible para este producto.", "error");
                    return;
                }
                addToCart(product.id, currentVariant);
                closeProductModal();
            };
        }
        updateModalAddButton();
    }

    function closeProductModal() {
        elements.productModal.classList.remove("open");
        unlockScroll();
    }

    function initModalGallery() {
        // Delegación de eventos para miniaturas
        if (!elements.modalThumbnails || elements.modalThumbnails.dataset.bound) return;
        elements.modalThumbnails.dataset.bound = "1";
        elements.modalThumbnails.addEventListener("click", (e) => {
            const thumb = e.target.closest(".modal-thumbnail");
            if (!thumb) return;
            activateSlide(parseInt(thumb.dataset.index));
        });
    }

    function activateSlide(i) {
        $$(".modal-gallery-slide").forEach(s => s.classList.remove("active"));
        $$(".modal-thumbnail").forEach(t => t.classList.remove("active"));
        const slide = $(`.modal-gallery-slide[data-index="${i}"]`);
        const thumb = $(`.modal-thumbnail[data-index="${i}"]`);
        if (slide) slide.classList.add("active");
        if (thumb) thumb.classList.add("active");
        currentImageIndex = i;
    }

    // Sincronizar galería con variante seleccionada
    function syncGalleryWithVariant(product, variant) {
        if (!variant || !variant.image || !elements.modalGallery) return;
        const slides = $$(".modal-gallery-slide");
        let idx = slides.findIndex(s => {
            const img = s.querySelector("img");
            return img && (img.getAttribute("src") === variant.image || img.src === variant.image);
        });
        
        // Si la imagen de la variante no está en la galería, agregarla
        if (idx === -1) {
            idx = slides.length;
            elements.modalGallery.insertAdjacentHTML("beforeend", `
                <div class="modal-gallery-slide" data-index="${idx}">
                    <img src="${variant.image}" alt="${product.name}" class="modal-gallery-img" loading="lazy">
                </div>`);
            if (elements.modalThumbnails) {
                elements.modalThumbnails.insertAdjacentHTML("beforeend", `
                    <button class="modal-thumbnail" data-index="${idx}" aria-label="Ver imagen ${idx + 1}">
                        <img src="${variant.image}" alt="${product.name} ${idx + 1}" loading="lazy">
                    </button>`);
                const newThumbImg = elements.modalThumbnails.querySelector(`.modal-thumbnail[data-index="${idx}"] img`);
                if (newThumbImg) attachImageFallback(newThumbImg);
            }
            const newSlideImg = elements.modalGallery.querySelector(`.modal-gallery-slide[data-index="${idx}"] img`);
            if (newSlideImg) attachImageFallback(newSlideImg);
        }
        activateSlide(idx);
    }

    // Navegación por teclado en el modal
    function initModalKeyboard() {
        document.addEventListener("keydown", (e) => {
            if (!elements.productModal || !elements.productModal.classList.contains("open")) return;
            const slides = $$(".modal-gallery-slide");
            if (e.key === "ArrowLeft" && currentImageIndex > 0) {
                const prevThumb = $(`.modal-thumbnail[data-index="${currentImageIndex - 1}"]`);
                if (prevThumb) prevThumb.click();
            } else if (e.key === "ArrowRight" && currentImageIndex < slides.length - 1) {
                const nextThumb = $(`.modal-thumbnail[data-index="${currentImageIndex + 1}"]`);
                if (nextThumb) nextThumb.click();
            } else if (e.key === "Escape") {
                closeProductModal();
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛒 CARRITO DE COMPRAS (CRUD completo)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function addToCart(productId, variant = null) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return false;
        
        const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
        if (hasVariants) {
            const selectedVariant = variant || getFirstAvailableVariant(product);
            if (!selectedVariant || selectedVariant.inStock === false) {
                showToast("No hay una variante disponible para este producto.", "error");
                return false;
            }
            variant = selectedVariant;
        }
        
        const itemData = variant ? {
            id: product.id, name: product.name, price: variant.price,
            variantName: variant.name, variantImage: variant.image, images: product.images
        } : {
            id: product.id, name: product.name, price: product.price,
            variantName: null, variantImage: product.images[0], images: product.images
        };
        
        const existingItem = cart.find(item => item.id === productId && item.variantName === itemData.variantName);
        const MAX_QUANTITY_PER_ITEM = 10;
        
        if (existingItem) {
            if (existingItem.quantity >= MAX_QUANTITY_PER_ITEM) {
                showToast(`No puedes agregar más de ${MAX_QUANTITY_PER_ITEM} unidades del mismo producto.`, "error");
                return false;
            }
            existingItem.quantity++;
        } else {
            cart.push({ ...itemData, quantity: 1 });
        }
        
        saveCart();
        updateCart();
        showToast(`${product.name} agregado al carrito`, "success");
        triggerCartBounce();
        return true;
    }

    // Animación bounce en el ícono del carrito
    function triggerCartBounce() {
        const cartToggle = $("#cartToggle");
        const cartCount = $("#cartCount");
        if (cartToggle) {
            cartToggle.classList.remove("bounce");
            void cartToggle.offsetWidth;
            cartToggle.classList.add("bounce");
            setTimeout(() => cartToggle.classList.remove("bounce"), 600);
        }
        if (cartCount) {
            cartCount.classList.remove("bounce");
            void cartCount.offsetWidth;
            cartCount.classList.add("bounce");
            setTimeout(() => cartCount.classList.remove("bounce"), 600);
        }
    }

    function getCartTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        if (appliedPromoCode) {
            if (appliedPromoCode.type === "percent") discount = subtotal * (appliedPromoCode.value / 100);
            else if (appliedPromoCode.type === "fixed") discount = appliedPromoCode.value;
            discount = Math.min(discount, subtotal);
        }
        const total = Math.max(0, subtotal - discount);
        return { subtotal, discount, total };
    }

    function updateCart() {
        const { subtotal, discount, total } = getCartTotals();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (elements.cartCount) elements.cartCount.textContent = totalItems;
        
        if (elements.cartItems && elements.cartEmpty) {
            if (cart.length === 0) {
                elements.cartItems.innerHTML = "";
                elements.cartEmpty.style.display = "block";
                if (elements.cartSubtotal) elements.cartSubtotal.textContent = formatCurrency(0);
                if (elements.cartDiscountRow) elements.cartDiscountRow.style.display = "none";
                if (elements.cartTotal) elements.cartTotal.textContent = formatCurrency(0);
                // Limpiar cupón si el carrito queda vacío
                if (appliedPromoCode) {
                    appliedPromoCode = null;
                    updatePromoUI();
                    showToast("Cupón retirado: el carrito quedó vacío", "info");
                }
            } else {
                elements.cartEmpty.style.display = "none";
                elements.cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.variantImage || item.images[0]}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            ${item.variantName ? `<div class="cart-item-variant">${item.variantName}</div>` : ""}
                            <div class="cart-item-price">${formatCurrency(item.price)}</div>
                            <div class="cart-item-quantity">
                                <button class="qty-btn" data-action="decrease" data-id="${item.id}" data-variant="${item.variantName || ''}" aria-label="Reducir cantidad">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" data-action="increase" data-id="${item.id}" data-variant="${item.variantName || ''}" aria-label="Aumentar cantidad">+</button>
                            </div>
                        </div>
                        <button class="cart-item-remove" data-id="${item.id}" data-variant="${item.variantName || ''}" aria-label="Eliminar ${item.name} del carrito">
                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </button>
                    </div>
                `).join("");
                $$(".cart-item-image").forEach(attachImageFallback);
                $$(".qty-btn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        updateQuantity(parseInt(btn.dataset.id), btn.dataset.action === "increase" ? 1 : -1, btn.dataset.variant || null);
                    });
                });
                $$(".cart-item-remove").forEach(btn => {
                    btn.addEventListener("click", () => {
                        removeFromCart(parseInt(btn.dataset.id), btn.dataset.variant || null);
                    });
                });
            }
        }
        
        if (elements.cartSubtotal) elements.cartSubtotal.textContent = formatCurrency(subtotal);
        if (elements.cartTotal) elements.cartTotal.textContent = formatCurrency(total);
        if (elements.cartDiscountRow) {
            if (discount > 0) {
                elements.cartDiscountRow.style.display = "flex";
                if (elements.cartDiscountAmount) elements.cartDiscountAmount.textContent = `-${formatCurrency(discount)}`;
            } else {
                elements.cartDiscountRow.style.display = "none";
            }
        }
    }

    function updateQuantity(productId, change, variantName = null) {
        const item = cart.find(item => item.id === productId && item.variantName === variantName);
        if (item) {
            const newQuantity = item.quantity + change;
            const MAX_QUANTITY_PER_ITEM = 10;
            if (newQuantity > MAX_QUANTITY_PER_ITEM) {
                showToast(`No puedes tener más de ${MAX_QUANTITY_PER_ITEM} unidades del mismo producto.`, "error");
                return;
            }
            if (newQuantity <= 0) removeFromCart(productId, variantName);
            else {
                item.quantity = newQuantity;
                saveCart();
                updateCart();
            }
        }
    }

    function removeFromCart(productId, variantName = null) {
        cart = cart.filter(item => !(item.id === productId && item.variantName === variantName));
        saveCart();
        updateCart();
    }

    function saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (err) {
            console.error("❌ Error al guardar carrito:", err);
            if (err.name === 'QuotaExceededError') {
                showToast("No hay suficiente espacio en tu navegador. Elimina algunos productos.", "error");
            }
        }
    }

    function openCart() {
        if (elements.cartSidebar) {
            elements.cartSidebar.classList.add("open");
            lockScroll();
        }
    }

    function closeCart() {
        if (elements.cartSidebar) {
            elements.cartSidebar.classList.remove("open");
            unlockScroll();
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎟️ CÓDIGOS DE DESCUENTO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function isPromoValid(promoData) {
        if (!promoData) return false;
        if (!promoData.validUntil) return true;
        const expiryDate = new Date(promoData.validUntil);
        const now = new Date();
        expiryDate.setHours(23, 59, 59, 999);
        return now <= expiryDate;
    }

    async function handleApplyPromo() {
        const input = $("#promoCodeInput");
        if (!input || appliedPromoCode) return;
        if (isProcessingPromo) return;
        
        const code = input.value.trim().toUpperCase();
        if (!code) { showToast("Por favor ingresa un código de descuento.", "error"); return; }
        
        // Consultar el cupón en la base de datos
        const { data: promoData, error } = await supabaseOrders
            .from('coupons')
            .select('*')
            .eq('code', code)
            .eq('is_active', true)
            .single();
        
        if (error || !promoData) {
            input.classList.add("error");
            showToast("Código no válido o inactivo.", "error");
            setTimeout(() => input.classList.remove("error"), 2000);
            return;
        }
        
        // Verificar si expiró
        if (promoData.valid_until) {
            const expiryDate = new Date(promoData.valid_until);
            expiryDate.setHours(23, 59, 59, 999);
            if (new Date() > expiryDate) {
                input.classList.add("error");
                showToast("Este código ha expirado.", "error");
                setTimeout(() => input.classList.remove("error"), 2000);
                return;
            }
        }
        
        // Bloquear si ya lo usó en una compra anterior
        if (getUsedCoupons().includes(code)) {
            input.classList.add("error");
            showToast("Ya usaste este código en una compra anterior.", "error");
            setTimeout(() => input.classList.remove("error"), 2000);
            return;
        }
        
        // Verificar límite global (max_uses)
        const dbLimitOk = await checkCouponGlobalLimit(code);
        if (!dbLimitOk) {
            input.classList.add("error");
            showToast("Este código ya alcanzó su límite de usos.", "error");
            setTimeout(() => input.classList.remove("error"), 2000);
            return;
        }
        
        isProcessingPromo = true;
        const applyBtn = $("#applyPromoBtn");
        const originalBtnText = applyBtn ? applyBtn.textContent : "";
        if (applyBtn) { applyBtn.disabled = true; applyBtn.textContent = "Aplicando..."; }
        
        setTimeout(() => {
            appliedPromoCode = { 
                code: code, 
                type: promoData.type, 
                value: promoData.value, 
                label: `${promoData.value}${promoData.type === 'percent' ? '%' : ' MXN'} de descuento`,
                validUntil: promoData.valid_until 
            };
            input.value = "";
            input.classList.remove("error");
            updatePromoUI();
            showToast(`¡Código "${code}" aplicado! ${appliedPromoCode.label}`, "success");
            updateCart();
            isProcessingPromo = false;
            if (applyBtn) { applyBtn.disabled = true; applyBtn.textContent = originalBtnText; }
        }, 400);
    }

    function updatePromoUI() {
        const inputContainer = $("#promoInputContainer");
        const promoApplied = $("#promoApplied");
        const promoCodeDisplay = $("#promoCodeDisplay");
        const input = $("#promoCodeInput");
        const applyBtn = $("#applyPromoBtn");
        if (!inputContainer || !promoApplied) return;
        
        if (appliedPromoCode) {
            inputContainer.style.display = "none";
            promoApplied.style.display = "flex";
            promoApplied.setAttribute("role", "status");
            promoApplied.setAttribute("aria-live", "polite");
            if (promoCodeDisplay) promoCodeDisplay.textContent = appliedPromoCode.code;
            if (input) input.disabled = true;
            if (applyBtn) applyBtn.disabled = true;
        } else {
            inputContainer.style.display = "flex";
            promoApplied.style.display = "none";
            if (input) { input.disabled = false; input.value = ""; }
            if (applyBtn) applyBtn.disabled = false;
        }
    }

    function handleRemovePromo() {
        appliedPromoCode = null;
        updatePromoUI();
        showToast("Código de descuento eliminado", "info");
        updateCart();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 EVENTOS Y LISTENERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function initEvents() {
        // Filtros de categoría
        elements.filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                elements.filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.dataset.filter;
                renderProducts();
            });
        });
        
        // Búsqueda en tiempo real
        if (elements.searchInput) {
            let searchTimeout;
            elements.searchInput.addEventListener("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => { searchQuery = e.target.value; renderProducts(); }, 300);
            });
        }
        
        // Ordenamiento
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener("change", (e) => { sortValue = e.target.value; renderProducts(); });
        }
        
        // Carrito
        if (elements.cartToggle) elements.cartToggle.addEventListener("click", openCart);
        if (elements.cartClose) elements.cartClose.addEventListener("click", closeCart);
        if (elements.cartOverlay) elements.cartOverlay.addEventListener("click", closeCart);
        
        // Modal de producto
        if (elements.modalClose) elements.modalClose.addEventListener("click", closeProductModal);
        if (elements.modalOverlay) elements.modalOverlay.addEventListener("click", closeProductModal);
        
        // CHECKOUT POR WHATSAPP
        const checkoutBtn = $("#cartCheckout");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", async () => {
                if (isProcessingCheckout) return;
                isProcessingCheckout = true;
                
                if (cart.length === 0) {
                    isProcessingCheckout = false;
                    showToast("Tu carrito está vacío. ¡Agrega algunos productos primero!");
                    return;
                }
                
                const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                let discount = 0;
                if (appliedPromoCode) {
                    if (appliedPromoCode.type === "percent") discount = subtotal * (appliedPromoCode.value / 100);
                    else if (appliedPromoCode.type === "fixed") discount = appliedPromoCode.value;
                    discount = Math.min(discount, subtotal);
                }
                const total = Math.max(0, subtotal - discount);
                
                if (!window.confirm(`¿Confirmas tu pedido por $${total}? Se abrirá WhatsApp para completarlo.`)) {
                    isProcessingCheckout = false;
                    return;
                }
                
                let msg = "¡Hola! Me interesa hacer el siguiente pedido:\n\n";
                cart.forEach(item => {
                    msg += `▪️ *${item.name}* (${item.variantName || 'Único'}) x${item.quantity} = $${item.price * item.quantity}\n`;
                });
                msg += `\n*Subtotal:* $${subtotal}`;
                if (appliedPromoCode && discount > 0) msg += `\n*Código:* ${appliedPromoCode.code} (-$${discount})`;
                msg += `\n*💰 Total a pagar: $${total}*`;
                
                // Registrar cupón como usado
                if (appliedPromoCode) {
                    markCouponUsed(appliedPromoCode.code);
                    bumpCouponUsage(appliedPromoCode.code);
                }
                
                const saved = await saveOrder({
                    customer_name: "Pedido WhatsApp",
                    customer_phone: null,
                    items: cart.map(i => ({ id: i.id, name: i.name, variant: i.variantName, qty: i.quantity, price: i.price })),
                    subtotal: subtotal,
                    discount: discount,
                    total: total,
                    promo_code: appliedPromoCode ? appliedPromoCode.code : null,
                    status: "pending"
                });
                
                if (!saved) showToast("⚠️ No se registró en el sistema, pero puedes enviarlo por WhatsApp.");
                
                const encodedMsg = encodeURIComponent(msg);
                const phoneNumber = (C.tienda && C.tienda.whatsapp) ? C.tienda.whatsapp : "521234567890";
                window.open(`https://wa.me/${phoneNumber}?text=${encodedMsg}`, '_blank');
                
                cart = [];
                appliedPromoCode = null;
                saveCart();
                updateCart();
                updatePromoUI();
                closeCart();
                showToast("Pedido enviado. Continuamos en WhatsApp.");
                isProcessingCheckout = false;
            });
        }
        
        // Botón de pago con tarjeta
        const payCardBtn = $("#payCardBtn");
        if (payCardBtn) {
            payCardBtn.style.display = PAYMENTS_ENABLED ? "block" : "none";
            if (C.payments?.buttonLabel) payCardBtn.textContent = C.payments.buttonLabel;
            payCardBtn.addEventListener("click", checkoutWithCard);
        }
        
        // Cupones de descuento
        const applyPromoBtn = $("#applyPromoBtn");
        if (applyPromoBtn) applyPromoBtn.addEventListener("click", handleApplyPromo);
        const promoInput = $("#promoCodeInput");
        if (promoInput) {
            promoInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") { e.preventDefault(); handleApplyPromo(); }
            });
        }
        const removePromoBtn = $("#removePromoBtn");
        if (removePromoBtn) removePromoBtn.addEventListener("click", handleRemovePromo);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📜 EFECTOS DE SCROLL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function initScrollEffects() {
        const header = elements.shopHeader;
        window.addEventListener("scroll", () => {
            if (header) header.classList.toggle("scrolled", window.scrollY > 100);
        }, { passive: true });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🔄 SINCRONIZACIÓN ENTRE PESTAÑAS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function initStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                try {
                    const newCart = e.newValue ? JSON.parse(e.newValue) : [];
                    if (Array.isArray(newCart)) {
                        cart = newCart;
                        updateCart();
                        showToast("Carrito actualizado desde otra pestaña", "info");
                    }
                } catch (err) { console.warn("Error al sincronizar carrito:", err); }
            }
            if (e.key === 'promoDismissed' || e.key === 'promoDismissTime') {
                const popup = $("#promoPopup");
                if (popup && popup.classList.contains("open")) {
                    popup.classList.remove("open");
                    unlockScroll();
                }
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎁 POPUP DE PROMOCIONES (carrusel)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    async function loadPromosFromDB() {
        try {
            const { data, error } = await supabaseOrders
                .from('coupons').select('*')
                .eq('is_active', true)
                .eq('show_in_popup', true)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data || []).map(c => ({
                id: c.id,
                badge: c.badge || '🔥 OFERTA',
                title: c.title || c.code,
                subtitle: c.subtitle || '',
                description: c.description || '',
                code: c.code,
                discount: c.type === 'percent' ? `${c.value}%` : formatCurrency(c.value),
                validUntil: c.valid_until,
                cta: 'Comprar Ahora', ctaHref: '#products',
                accent: c.accent || 'gold'
            })).filter(p => isPromoValid(p));
        } catch (e) {
            console.warn('Promos: usando config.js —', e.message);
            return (C.ecommerce.promotions?.items || []).filter(p => isPromoValid(p));
        }
    }

    async function initPromoPopup() {
        const config = C.ecommerce.promotions;
        if (!config || config.enabled === false) return;
        
        let promotions = await loadPromosFromDB();
        if (!promotions.length) promotions = (config.items || []).filter(p => isPromoValid(p));
        if (promotions.length === 0) return;
        
        // Verificar si el usuario cerró el popup recientemente
        if (config.rememberDismiss) {
            const dismissed = localStorage.getItem('promoDismissed');
            const dismissedTime = localStorage.getItem('promoDismissTime');
            if (dismissed === 'true' && dismissedTime) {
                const hoursPassed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
                if (hoursPassed < config.dismissDuration) return;
            }
        }
        
        const popup = $("#promoPopup");
        const slider = $("#promoSlider");
        const dots = $("#promoDots");
        const closeBtn = $("#promoClose");
        const overlay = $("#promoOverlay");
        const dontShowCheckbox = $("#promoDontShow");
        const prevBtn = $("#promoPrev");
        const nextBtn = $("#promoNext");
        if (!popup || !slider) return;
        
        let currentPromoIndex = 0;
        let userInteracted = false;
        
        function renderPromotions() {
            slider.innerHTML = promotions.map((promo, i) => `
                <div class="promo-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <span class="promo-badge ${promo.accent || 'gold'}">${promo.badge}</span>
                    <div class="promo-discount">${promo.discount}</div>
                    <h3 class="promo-title">${promo.title}</h3>
                    <p class="promo-subtitle">${promo.subtitle}</p>
                    <p class="promo-description">${promo.description}</p>
                    <div class="promo-code-wrapper" data-promo-code="${promo.code}" role="button" tabindex="0" aria-label="Copiar código ${promo.code}">
                        <span class="promo-code-label">Código:</span>
                        <span class="promo-code">${promo.code}</span>
                        <span class="promo-code-copy">📋 Copiar</span>
                    </div>
                    <div class="promo-validity">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                        Válido hasta ${formatDate(promo.validUntil)}
                    </div>
                    <button class="promo-cta" data-promo-href="${promo.ctaHref}" aria-label="${promo.cta}">${promo.cta}</button>
                </div>
            `).join("");
            
            $$(".promo-code-wrapper").forEach(wrapper => {
                const handler = () => {
                    const code = wrapper.dataset.promoCode;
                    if (code) copyPromoCode(code);
                };
                wrapper.addEventListener("click", handler);
                wrapper.addEventListener("keypress", (e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler(); }
                });
            });
            
            $$(".promo-cta").forEach(btn => {
                btn.addEventListener("click", () => {
                    const href = btn.dataset.promoHref;
                    if (href) handlePromoCTA(href);
                });
            });
            
            if (dots) {
                dots.innerHTML = promotions.map((_, i) => `<button class="promo-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ir a promoción ${i + 1}"></button>`).join("");
                $$(".promo-dot").forEach(dot => {
                    dot.addEventListener("click", () => {
                        goToPromo(parseInt(dot.dataset.index));
                        resetRotateTimer();
                        userInteracted = true;
                    });
                });
            }
        }
        
        function goToPromo(index) {
            const slides = $$(".promo-slide");
            const dotsEls = $$(".promo-dot");
            slides.forEach(s => s.classList.remove("active"));
            dotsEls.forEach(d => d.classList.remove("active"));
            slides[index].classList.add("active");
            if (dotsEls[index]) dotsEls[index].classList.add("active");
            currentPromoIndex = index;
        }
        
        function nextPromo() { goToPromo((currentPromoIndex + 1) % promotions.length); }
        function prevPromo() { goToPromo((currentPromoIndex - 1 + promotions.length) % promotions.length); }
        
        function startRotation() {
            if (!config.autoRotate || promotions.length <= 1) return;
            const interval = userInteracted ? 12000 : (config.rotateInterval || 10000);
            window.promoRotateTimer = setInterval(nextPromo, interval);
        }
        
        function resetRotateTimer() {
            if (window.promoRotateTimer) clearInterval(window.promoRotateTimer);
            startRotation();
        }
        
        function closePopup() {
            popup.classList.remove("open");
            setTimeout(() => { unlockScroll(); void document.body.offsetWidth; }, 100);
            if (window.promoRotateTimer) clearInterval(window.promoRotateTimer);
            if (dontShowCheckbox && dontShowCheckbox.checked) {
                localStorage.setItem('promoDismissed', 'true');
                localStorage.setItem('promoDismissTime', Date.now().toString());
            }
        }
        
        setTimeout(() => {
            renderPromotions();
            popup.classList.add("open");
            lockScroll();
            startRotation();
        }, config.delay);
        
        if (prevBtn) prevBtn.addEventListener("click", () => { prevPromo(); resetRotateTimer(); userInteracted = true; });
        if (nextBtn) nextBtn.addEventListener("click", () => { nextPromo(); resetRotateTimer(); userInteracted = true; });
        if (closeBtn) closeBtn.addEventListener("click", closePopup);
        if (overlay) overlay.addEventListener("click", closePopup);
        
        document.addEventListener("keydown", (e) => {
            if (!popup.classList.contains("open")) return;
            if (e.key === "ArrowLeft") { prevPromo(); resetRotateTimer(); userInteracted = true; }
            else if (e.key === "ArrowRight") { nextPromo(); resetRotateTimer(); userInteracted = true; }
            else if (e.key === "Escape") closePopup();
        });
    }

    function copyPromoCode(code) {
        navigator.clipboard.writeText(code).then(() => {
            showToast(`Código "${code}" copiado`, "success");
        }).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            showToast(`Código "${code}" copiado`, "success");
        });
    }

    function handlePromoCTA(href) {
        const popup = $("#promoPopup");
        if (popup) { popup.classList.remove("open"); unlockScroll(); }
        if (window.promoRotateTimer) clearInterval(window.promoRotateTimer);
        setTimeout(() => {
            if (href.startsWith('#')) {
                const target = $(href);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.location.href = href;
            }
        }, 300);
    }

    function formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💬 BOTÓN FLOTANTE DE WHATSAPP
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function initWhatsAppButton() {
        const whatsappBtn = document.getElementById("whatsappFloat");
        if (!whatsappBtn) return;
        
        const phoneNumber = C.tienda?.whatsapp || "521234567890";
        const defaultMessage = C.shopConfig?.whatsapp?.defaultMessage || "¡Hola! Me interesa conocer más sobre sus productos.";
        whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
        whatsappBtn.innerHTML = '<i class="fa-brands fa-whatsapp" aria-hidden="true"></i>';
        whatsappBtn.style.opacity = "0";
        whatsappBtn.style.transform = "scale(0)";
        whatsappBtn.style.pointerEvents = "none";

        let isVisible = false;
        let scrollTimeout;

        function checkScrollPosition() {
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? scrollY / maxScroll : 1;

            if (!isVisible && progress >= 0.85) {
                isVisible = true;
                whatsappBtn.style.transition = "all 0.6s var(--ease-out-expo)";
                whatsappBtn.style.opacity = "1";
                whatsappBtn.style.transform = "scale(1)";
                whatsappBtn.style.pointerEvents = "auto";
            } else if (isVisible && progress <= 0.70) {
                isVisible = false;
                whatsappBtn.style.transition = "all 0.6s var(--ease-out-expo)";
                whatsappBtn.style.opacity = "0";
                whatsappBtn.style.transform = "scale(0)";
                whatsappBtn.style.pointerEvents = "none";
            }
        }

        window.addEventListener("scroll", () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(checkScrollPosition, 50);
        }, { passive: true });
        window.addEventListener("resize", () => checkScrollPosition(), { passive: true });
        checkScrollPosition();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🖱️ CURSOR PERSONALIZADO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    function initCursor() {
        if (window.innerWidth < 769) return;
        const cursor = document.getElementById("cursor");
        const follower = document.getElementById("cursorFollower");
        if (!cursor || !follower) return;
        
        let mx = 0, my = 0;
        let fx = 0, fy = 0;
        
        document.addEventListener("mousemove", (e) => {
            mx = e.clientX; my = e.clientY;
            cursor.style.left = mx + "px"; cursor.style.top = my + "px";
        });
        
        function animateFollower() {
            fx = fx + (mx - fx) * 0.12;
            fy = fy + (my - fy) * 0.12;
            follower.style.left = fx + "px";
            follower.style.top = fy + "px";
            requestAnimationFrame(animateFollower);
        }
        animateFollower();
        
        const hoverTargets = "a, button, .product-card, .action-btn, .filter-btn, .cart-toggle, .promo-cta, .modal-variant";
        document.addEventListener("mouseover", (e) => {
            if (e.target.closest(hoverTargets)) { cursor.classList.add("hover"); follower.classList.add("hover"); }
        });
        document.addEventListener("mouseout", (e) => {
            if (e.target.closest(hoverTargets)) { cursor.classList.remove("hover"); follower.classList.remove("hover"); }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 INICIO DE LA APLICACIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => { init(); initCursor(); });
    } else {
        init();
        initCursor();
    }
})();