/* ============================================================
   TIENDA ONLINE - CON MODAL DE FICHA TÉCNICA
   Versión corregida y optimizada
   ============================================================ */
(function() {
    "use strict";

    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};

    // Productos desde config
    const PRODUCTS = C.ecommerce.products || [];

    // ============================================
    // ✅ NUEVO: Formateador de moneda MXN
    // ============================================
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // ============================================
    // ✅ NUEVO: Imagen fallback
    // ============================================
    const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23111111'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%238a8578' text-anchor='middle' dy='.3em'%3EImagen no disponible%3C/text%3E%3C/svg%3E";

    // Estado
    let cart = [];
    try {
        const stored = localStorage.getItem('cart');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                cart = parsed;
            } else {
                console.warn("⚠️ Carrito corrupto (no es un array). Reiniciando...");
                localStorage.removeItem('cart');
            }
        }
    } catch (err) {
        console.warn("⚠️ Error al leer el carrito desde localStorage. Reiniciando...", err);
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
    let isProcessingCheckout = false; // ✅ NUEVO: Estado de carga checkout
    let isProcessingPromo = false;    // ✅ NUEVO: Estado de carga promo

    // Utilidades
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // ============================================
    // BLOQUEO DE SCROLL (body + html)
    // ============================================
    function lockScroll() {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
    }
    function unlockScroll() {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
    }

    // Elementos DOM
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

    // ============================================
    // ✅ NUEVO: Toast con aria-live para accesibilidad
    // ============================================
    function showToast(message, type = "info") {
        let toast = $(".promo-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "promo-toast";
            toast.setAttribute("role", "status");        // ✅ aria-live implícito
            toast.setAttribute("aria-live", "polite");   // ✅ Anuncia cambios
            toast.setAttribute("aria-atomic", "true");
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.dataset.type = type;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

    // Inicialización
    function init() {
        if (C.ecommerce && C.ecommerce.enabled === false) {
            window.location.href = "index.html";
            return;
        }
        buildShopHeader();
        buildShopHero();
        renderProducts();
        updateCart();
        updatePromoUI();
        initEvents();
        initScrollEffects();
        initModalKeyboard();
        initPromoPopup();
        initWhatsAppButton();
        initStorageSync(); // ✅ NUEVO: Sincronizar entre pestañas
    }

    // ─── CONSTRUIR HEADER DE LA TIENDA ─────────────────
    function buildShopHeader() {
        const header = $("#shopHeader");
        if (!header) return;

        const h = C.header;
        header.innerHTML = `
            <div class="shop-header-inner">
                <a href="index.html" class="shop-logo">${h.logo.text}<span>${h.logo.highlight}</span></a>
                <div class="shop-search-bar">
                    <input type="text" id="searchInput" placeholder="Buscar productos..." aria-label="Buscar productos">
                    <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                </div>
                <div class="shop-header-actions">
                    <button class="cart-toggle" id="cartToggle" aria-label="Carrito de compras">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 6h15l-1.5 9h-12z"></path>
                            <circle cx="9" cy="20" r="1"></circle>
                            <circle cx="18" cy="20" r="1"></circle>
                        </svg>
                        <span class="cart-count" id="cartCount" aria-live="polite" aria-atomic="true">0</span>
                    </button>
                </div>
            </div>
        `;
        elements.cartToggle = $("#cartToggle");
        elements.cartCount = $("#cartCount");
        elements.searchInput = $("#searchInput");
    }

    // ─── CONSTRUIR HERO DE LA TIENDA ─────────────────
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

    // ============================================
    // ✅ NUEVO: Función para agregar fallback a imágenes
    // ============================================
    function attachImageFallback(imgElement) {
        if (!imgElement) return;
        imgElement.addEventListener('error', function() {
            if (this.src !== FALLBACK_IMAGE) {
                this.src = FALLBACK_IMAGE;
            }
        });
    }

    // Renderizar productos
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

        // ✅ NUEVO: Adjuntar fallback a todas las imágenes
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

        // ✅ NUEVO: Formatear precios como MXN
        const formattedPrice = formatCurrency(product.price);
        const formattedOriginal = product.originalPrice ? formatCurrency(product.originalPrice) : "";

        return `
            <article class="product-card" data-category="${product.category}">
                <div class="product-image-wrapper">
                    <img src="${firstImage}" alt="${product.name}" class="product-image" loading="lazy">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
                    <div class="product-actions">
                        <button class="action-btn product-add-to-cart" data-id="${product.id}" aria-label="Agregar ${product.name} al carrito">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 6h15l-1.5 9h-12z"></path>
                                <circle cx="9" cy="20" r="1"></circle>
                                <circle cx="18" cy="20" r="1"></circle>
                            </svg>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </article>
        `;
    }

    // ============================================
    // Helpers de variantes
    // ============================================
    function getDefaultVariant(product) {
        if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
            return null;
        }
        const availableVariant = product.variants.find(variant => variant.inStock);
        return availableVariant || product.variants[0];
    }

    function getFirstAvailableVariant(product) {
        if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
            return null;
        }
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
    }

    function updateModalAddButton() {
        if (!elements.modalAddToCart || !currentProduct) return;

        const hasVariants = Array.isArray(currentProduct.variants) && currentProduct.variants.length > 0;
        const available = !hasVariants || (currentVariant && currentVariant.inStock === true);

        elements.modalAddToCart.disabled = !available;
        elements.modalAddToCart.textContent = available
            ? "Agregar al Carrito"
            : "Agotado";
    }

    function renderModalContent() {
        if (!currentProduct) return;
        const product = currentProduct;
        const variant = currentVariant || product;

        if (elements.modalGallery && product.images && product.images.length > 0) {
            elements.modalGallery.innerHTML = product.images.map((img, i) => `
                <div class="modal-gallery-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${img}" alt="${product.name}" class="modal-gallery-img" loading="lazy">
                </div>
            `).join("");

            // ✅ Adjuntar fallback
            $$(".modal-gallery-img").forEach(attachImageFallback);
        }

        if (elements.modalThumbnails && product.images && product.images.length > 0) {
            elements.modalThumbnails.innerHTML = product.images.map((img, i) => `
                <button class="modal-thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Ver imagen ${i + 1}">
                    <img src="${img}" alt="${product.name} ${i + 1}" loading="lazy">
                </button>
            `).join("");

            $$(".modal-thumbnail img").forEach(attachImageFallback);
        }

        if (elements.modalCategory) elements.modalCategory.textContent = product.category;
        if (elements.modalTitle) elements.modalTitle.textContent = product.name;
        // ✅ Formatear precio
        if (elements.modalPrice) elements.modalPrice.innerHTML = formatCurrency(variant.price);
        if (elements.modalDescription) elements.modalDescription.textContent = product.description;

        if (elements.modalFeatures && product.features) {
            elements.modalFeatures.innerHTML = product.features.map(f => `
                <li class="modal-feature-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    <span>${f}</span>
                </li>
            `).join("");
        }

        if (elements.modalVariants && product.variants && product.variants.length > 0) {
            const activeIndex = currentVariant
                ? product.variants.findIndex(v => v === currentVariant)
                : -1;

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

                    if (elements.modalPrice) {
                        elements.modalPrice.innerHTML = formatCurrency(currentVariant.price);
                    }

                    updateModalAddButton();
                });
            });
        } else if (elements.modalVariants) {
            elements.modalVariants.innerHTML = "";
        }

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
        const thumbnails = $$(".modal-thumbnail");
        const slides = $$(".modal-gallery-slide");

        thumbnails.forEach(thumb => {
            thumb.addEventListener("click", () => {
                const index = parseInt(thumb.dataset.index);
                thumbnails.forEach(t => t.classList.remove("active"));
                thumb.classList.add("active");
                slides.forEach(s => s.classList.remove("active"));
                slides[index].classList.add("active");
                currentImageIndex = index;
            });
        });
    }

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
            id: product.id,
            name: product.name,
            price: variant.price,
            variantName: variant.name,
            variantImage: variant.image,
            images: product.images
        } : {
            id: product.id,
            name: product.name,
            price: product.price,
            variantName: null,
            variantImage: product.images[0],
            images: product.images
        };

        const existingItem = cart.find(item =>
            item.id === productId && item.variantName === itemData.variantName
        );

        // ✅ NUEVO: Validar límite de cantidad si hay stock definido
        const MAX_QUANTITY_PER_ITEM = 10; // Límite razonable por variante
        
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
    // ✅ NO abrir el carrito automáticamente, solo mostrar toast
    showToast(`${product.name} agregado al carrito`, "success");
    
    // ✅ Efecto bounce en el botón del carrito (feedback visual premium)
    triggerCartBounce();

    return true;
}

// ============================================
// ✅ NUEVO: Efecto bounce en el botón del carrito
// ============================================
function triggerCartBounce() {
    const cartToggle = $("#cartToggle");
    const cartCount = $("#cartCount");
    
    if (cartToggle) {
        cartToggle.classList.remove("bounce");
        // Forzar reflow para reiniciar la animación
        void cartToggle.offsetWidth;
        cartToggle.classList.add("bounce");
        
        // Limpiar clase después de la animación
        setTimeout(() => {
            cartToggle.classList.remove("bounce");
        }, 600);
    }
    
    if (cartCount) {
        cartCount.classList.remove("bounce");
        void cartCount.offsetWidth;
        cartCount.classList.add("bounce");
        
        setTimeout(() => {
            cartCount.classList.remove("bounce");
        }, 600);
    }
}
  
    function getCartTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let discount = 0;

        if (appliedPromoCode) {
            if (appliedPromoCode.type === "percent") {
                discount = subtotal * (appliedPromoCode.value / 100);
            } else if (appliedPromoCode.type === "fixed") {
                discount = appliedPromoCode.value;
            }

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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                `).join("");

                // ✅ Adjuntar fallback a imágenes del carrito
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

        // ✅ Precios formateados como MXN
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
            
            // ✅ Validar límite máximo
            if (newQuantity > MAX_QUANTITY_PER_ITEM) {
                showToast(`No puedes tener más de ${MAX_QUANTITY_PER_ITEM} unidades del mismo producto.`, "error");
                return;
            }
            
            if (newQuantity <= 0) {
                removeFromCart(productId, variantName);
            } else {
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
            console.error("❌ Error al guardar el carrito:", err);
            if (err.name === 'QuotaExceededError') {
                // ✅ Reemplazado alert() por toast
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

    // ============================================
    // ✅ NUEVO: Validar vigencia de promociones
    // ============================================
    function isPromoValid(promoData) {
        if (!promoData) return false;
        
        // Si no tiene fecha de expiración, considerarla válida
        if (!promoData.validUntil) return true;
        
        const expiryDate = new Date(promoData.validUntil);
        const now = new Date();
        
        // Añadir un día extra para incluir el día completo de expiración
        expiryDate.setHours(23, 59, 59, 999);
        
        return now <= expiryDate;
    }

    function handleApplyPromo() {
        const input = $("#promoCodeInput");
        if (!input || appliedPromoCode) return;
        if (isProcessingPromo) return; // ✅ Prevenir doble click

        const code = input.value.trim().toUpperCase();
        
        if (!code) {
            showToast("Por favor ingresa un código de descuento.", "error");
            return;
        }

        const validCodes = C.ecommerce.promoCodes || {};
        const promoData = validCodes[code];

        if (!promoData) {
            input.classList.add("error");
            showToast("Código no válido.", "error");
            setTimeout(() => input.classList.remove("error"), 2000);
            return;
        }

        // ✅ NUEVO: Validar vigencia
        // Buscar los datos completos de la promo (incluyendo validUntil)
        const promoConfig = (C.ecommerce.promotions?.items || []).find(p => p.code === code);
        if (promoConfig && !isPromoValid(promoConfig)) {
            input.classList.add("error");
            showToast("Este código ha expirado.", "error");
            setTimeout(() => input.classList.remove("error"), 2000);
            return;
        }

        // ✅ Estado de carga visual
        isProcessingPromo = true;
        const applyBtn = $("#applyPromoBtn");
        const originalBtnText = applyBtn ? applyBtn.textContent : "";
        if (applyBtn) {
            applyBtn.disabled = true;
            applyBtn.textContent = "Aplicando...";
        }

        // Simular pequeño delay para feedback visual
        setTimeout(() => {
            appliedPromoCode = { code: code, ...promoData };
            // Añadir validUntil para futura referencia
            if (promoConfig) {
                appliedPromoCode.validUntil = promoConfig.validUntil;
            }
            
            input.value = "";
            input.classList.remove("error");
            updatePromoUI();
            showToast(`¡Código "${code}" aplicado! ${appliedPromoCode.label}`, "success");
            updateCart();

            isProcessingPromo = false;
            if (applyBtn) {
                applyBtn.disabled = true; // Se desactiva porque ya hay uno aplicado
                applyBtn.textContent = originalBtnText;
            }
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
            promoApplied.setAttribute("role", "status");       // ✅ aria-live
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

    function initEvents() {
        elements.filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                elements.filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.dataset.filter;
                renderProducts();
            });
        });

        if (elements.searchInput) {
            let searchTimeout;
            elements.searchInput.addEventListener("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    searchQuery = e.target.value;
                    renderProducts();
                }, 300);
            });
        }

        if (elements.sortSelect) {
            elements.sortSelect.addEventListener("change", (e) => {
                sortValue = e.target.value;
                renderProducts();
            });
        }

        if (elements.cartToggle) elements.cartToggle.addEventListener("click", openCart);
        if (elements.cartClose) elements.cartClose.addEventListener("click", closeCart);
        if (elements.cartOverlay) elements.cartOverlay.addEventListener("click", closeCart);
        if (elements.modalClose) elements.modalClose.addEventListener("click", closeProductModal);
        if (elements.modalOverlay) elements.modalOverlay.addEventListener("click", closeProductModal);

        const checkoutBtn = $("#cartCheckout");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                if (cart.length === 0) {
                    const emptyAlert = C.shopConfig?.whatsapp?.emptyCartAlert ||
                        "Tu carrito está vacío. ¡Agrega algunos productos primero!";
                    showToast(emptyAlert, "error"); // ✅ Reemplazado alert() por toast
                    return;
                }

                // ✅ NUEVO: Prevenir doble click
                if (isProcessingCheckout) return;
                isProcessingCheckout = true;

                const { subtotal, discount, total } = getCartTotals();

                // ✅ NUEVO: Confirmación antes de vaciar el carrito
                const confirmMsg = `¿Confirmas tu pedido por ${formatCurrency(total)}? Se abrirá WhatsApp para completar la compra.`;
                const confirmed = window.confirm(confirmMsg);

                if (!confirmed) {
                    isProcessingCheckout = false;
                    return;
                }

                // ✅ Estado de carga visual
                const originalText = checkoutBtn.textContent;
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = "Abriendo WhatsApp...";

                let msg = "¡Hola! Me interesa hacer el siguiente pedido:\n\n";

                cart.forEach(item => {
                    msg += `▪️ *${item.name}* (${item.variantName || 'Único'}) x${item.quantity} = ${formatCurrency(item.price * item.quantity)}\n`;
                });

                msg += `\n*Subtotal:* ${formatCurrency(subtotal)}`;

                if (appliedPromoCode && discount > 0) {
                    msg += `\n*Código:* ${appliedPromoCode.code} (-${formatCurrency(discount)})`;
                }

                msg += `\n*💰 Total a pagar: ${formatCurrency(total)}*`;

                const encodedMsg = encodeURIComponent(msg);
                const phoneNumber = (C.tienda && C.tienda.whatsapp)
                    ? C.tienda.whatsapp
                    : "521234567890";

                // ✅ Guardar el pedido antes de vaciar (por si el usuario vuelve)
                const orderSnapshot = {
                    items: [...cart],
                    subtotal,
                    discount,
                    total,
                    promoCode: appliedPromoCode ? appliedPromoCode.code : null,
                    timestamp: Date.now()
                };
                
                try {
                    sessionStorage.setItem('lastOrder', JSON.stringify(orderSnapshot));
                } catch (e) {
                    console.warn("No se pudo guardar snapshot del pedido");
                }

                // Abrir WhatsApp
                window.open(`https://wa.me/${phoneNumber}?text=${encodedMsg}`, '_blank');

                // ✅ Vaciar carrito DESPUÉS de la confirmación
                cart = [];
                appliedPromoCode = null;

                saveCart();
                updateCart();
                updatePromoUI();
                closeCart();

                showToast("Pedido enviado. Continuamos en WhatsApp.", "success");

                // Restaurar botón
                setTimeout(() => {
                    checkoutBtn.disabled = false;
                    checkoutBtn.textContent = originalText;
                    isProcessingCheckout = false;
                }, 1000);
            });
        }

        const applyPromoBtn = $("#applyPromoBtn");
        if (applyPromoBtn) applyPromoBtn.addEventListener("click", handleApplyPromo);

        const promoInput = $("#promoCodeInput");
        if (promoInput) {
            promoInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyPromo();
                }
            });
        }

        const removePromoBtn = $("#removePromoBtn");
        if (removePromoBtn) removePromoBtn.addEventListener("click", handleRemovePromo);
    }

    function initScrollEffects() {
        const header = elements.shopHeader;
        window.addEventListener("scroll", () => {
            if (header) header.classList.toggle("scrolled", window.scrollY > 100);
        }, { passive: true });
    }

    // ============================================
    // ✅ NUEVO: Sincronizar carrito entre pestañas
    // ============================================
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
                } catch (err) {
                    console.warn("Error al sincronizar carrito:", err);
                }
            }
            
            if (e.key === 'promoDismissed' || e.key === 'promoDismissTime') {
                // Si se descarta el popup en otra pestaña, no volver a mostrarlo
                const popup = $("#promoPopup");
                if (popup && popup.classList.contains("open")) {
                    popup.classList.remove("open");
                    unlockScroll();
                }
            }
        });
    }

    // ============================================
    // POPUP DE PROMOCIONES
    // ============================================
    function initPromoPopup() {
        const config = C.ecommerce.promotions;
        if (!config || !config.enabled) return;
        
        // ✅ NUEVO: Filtrar solo promociones vigentes
        const allPromotions = config.items || [];
        const promotions = allPromotions.filter(promo => isPromoValid(promo));
        
        if (promotions.length === 0) return;

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
            // ✅ CORREGIDO: Sin onclick inline, usando data-attributes
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

            // ✅ CORREGIDO: Event listeners en lugar de onclick
            $$(".promo-code-wrapper").forEach(wrapper => {
                const handler = () => {
                    const code = wrapper.dataset.promoCode;
                    if (code) copyPromoCode(code);
                };
                wrapper.addEventListener("click", handler);
                wrapper.addEventListener("keypress", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handler();
                    }
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
            const dots = $$(".promo-dot");
            slides.forEach(s => s.classList.remove("active"));
            dots.forEach(d => d.classList.remove("active"));
            slides[index].classList.add("active");
            if (dots[index]) dots[index].classList.add("active");
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

            setTimeout(() => {
                unlockScroll();
                void document.body.offsetWidth;
            }, 100);

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
        if (popup) {
            popup.classList.remove("open");
            unlockScroll();
        }
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

    // ============================================
    // BOTÓN DE WHATSAPP
    // ============================================
    function initWhatsAppButton() {
        const whatsappBtn = document.getElementById("whatsappFloat");
        if (!whatsappBtn) return;

        const phoneNumber = C.tienda?.whatsapp || "521234567890";
        const defaultMessage = C.shopConfig?.whatsapp?.defaultMessage || "¡Hola! Me interesa conocer más sobre sus productos.";
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

        whatsappBtn.href = whatsappUrl;

        whatsappBtn.style.opacity = "0";
        whatsappBtn.style.transform = "scale(0)";
        whatsappBtn.style.pointerEvents = "none";

        const SHOW_THRESHOLD = C.shopConfig?.whatsappButton?.showThreshold || 0.80;
        const HIDE_THRESHOLD = C.shopConfig?.whatsappButton?.hideThreshold || 0.75;

        let isVisible = false;
        let scrollTimeout;

        function checkScrollPosition() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            const scrollPercentage = (scrollY + windowHeight) / documentHeight;

            if (!isVisible && scrollPercentage >= SHOW_THRESHOLD) {
                isVisible = true;
                whatsappBtn.style.transition = "all 0.6s var(--ease-out-expo)";
                whatsappBtn.style.opacity = "1";
                whatsappBtn.style.transform = "scale(1)";
                whatsappBtn.style.pointerEvents = "auto";
            } else if (isVisible && scrollPercentage < HIDE_THRESHOLD) {
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

        checkScrollPosition();
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

        const hoverTargets = "a, button, .product-card, .action-btn, .filter-btn, .cart-toggle, .promo-cta, .modal-variant";
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