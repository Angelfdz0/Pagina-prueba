/* ============================================================
TIENDA ONLINE - CON MODAL DE FICHA TÉCNICA
============================================================ */

(function() {
    "use strict";
    
    const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : {};

    // Productos desde config
    const PRODUCTS = C.ecommerce.products || [];
    
    // Estado
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentFilter = "all";
    let searchQuery = "";
    let sortValue = "default";
    let currentProduct = null;
    let currentVariant = null;
    let currentImageIndex = 0;
    let appliedPromoCode = null;
    
    // Utilidades
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
    
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
        initShopStars();
        initPromoPopup();
    }

  // ─── CONSTRUIR HEADER DE LA TIENDA ─────────────────
function buildShopHeader() {
    const header = $("#shopHeader");
    if (!header) return;
    
    const h = C.header; // Reutilizamos el logo del config principal
    header.innerHTML = `
        <div class="shop-header-inner">
            <a href="index.html" class="shop-logo">${h.logo.text}<span>${h.logo.highlight}</span></a>
            <div class="shop-search-bar">
                <input type="text" id="searchInput" placeholder="Buscar productos...">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
            </div>
            <div class="shop-header-actions">
                <button class="cart-toggle" id="cartToggle" aria-label="Carrito">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 6h15l-1.5 9h-12z"></path>
                        <circle cx="9" cy="20" r="1"></circle>
                        <circle cx="18" cy="20" r="1"></circle>
                    </svg>
                    <span class="cart-count" id="cartCount">0</span>
                </button>
            </div>
        </div>
    `;
    // Re-asignar el elemento al DOM actualizado
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
    
    // Renderizar productos
    function renderProducts() {
        if (!elements.productsGrid) return;
        
        let filtered = filterProducts();
        filtered = sortProducts(filtered);
        
        if (filtered.length === 0) {
            elements.productsGrid.innerHTML = "";
            if (elements.noResults) {
                elements.noResults.style.display = "block";
            }
            return;
        }
        
        if (elements.noResults) {
            elements.noResults.style.display = "none";
        }
        
        const html = filtered.map((product, index) => createProductCard(product, index)).join("");
        elements.productsGrid.innerHTML = html;
        
        setTimeout(() => {
            $$(".product-view-more").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    const id = parseInt(btn.dataset.id);
                    openProductModal(id);
                });
            });
            
            $$(".product-add-to-cart").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    const id = parseInt(btn.dataset.id);
                    addToCart(id, null);
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
            case "price-asc":
                return sorted.sort((a, b) => a.price - b.price);
            case "price-desc":
                return sorted.sort((a, b) => b.price - a.price);
            case "name-asc":
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return sorted;
        }
    }
    
    function createProductCard(product, index) {
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;
        const firstImage = product.images && product.images.length > 0 ? product.images[0] : "";
        
        return `
            <article class="product-card" data-category="${product.category}">
                <div class="product-image-wrapper">
                    <img src="${firstImage}" alt="${product.name}" class="product-image" loading="lazy">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
                    <div class="product-actions">
                        <button class="action-btn product-add-to-cart" data-id="${product.id}" aria-label="Agregar al carrito">
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
                        $${product.price}
                        ${hasDiscount ? `<span class="original-price">$${product.originalPrice}</span>` : ""}
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
    
    function openProductModal(productId) {
        currentProduct = PRODUCTS.find(p => p.id === productId);
        if (!currentProduct) return;
        
        currentImageIndex = 0;
        currentVariant = currentProduct.variants && currentProduct.variants.length > 0 ? currentProduct.variants[0] : null;
        
        renderModalContent();
        elements.productModal.classList.add("open");
        document.body.style.overflow = "hidden";
        initModalParallax();
        initModalGallery();
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
        }
        
        if (elements.modalThumbnails && product.images && product.images.length > 0) {
            elements.modalThumbnails.innerHTML = product.images.map((img, i) => `
                <button class="modal-thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <img src="${img}" alt="${product.name} ${i + 1}" loading="lazy">
                </button>
            `).join("");
        }
        
        if (elements.modalCategory) elements.modalCategory.textContent = product.category;
        if (elements.modalTitle) elements.modalTitle.textContent = product.name;
        if (elements.modalPrice) elements.modalPrice.innerHTML = `$${variant.price}`;
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
            elements.modalVariants.innerHTML = `
                <h4 class="modal-variants-title">Variantes disponibles</h4>
                <div class="modal-variants-grid">
                    ${product.variants.map((v, i) => `
                        <button class="modal-variant ${i === 0 ? 'active' : ''} ${!v.inStock ? 'out-of-stock' : ''}" data-index="${i}">
                            <img src="${v.image}" alt="${v.name}" loading="lazy">
                            <div class="modal-variant-info">
                                <span class="modal-variant-name">${v.name}</span>
                                <span class="modal-variant-price">$${v.price}</span>
                                ${!v.inStock ? '<span class="modal-variant-stock">Agotado</span>' : ''}
                            </div>
                        </button>
                    `).join("")}
                </div>
            `;
            
            $$(".modal-variant").forEach(btn => {
                btn.addEventListener("click", () => {
                    if (btn.classList.contains("out-of-stock")) return;
                    $$(".modal-variant").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    const index = parseInt(btn.dataset.index);
                    currentVariant = product.variants[index];
                    if (elements.modalPrice) elements.modalPrice.innerHTML = `$${currentVariant.price}`;
                });
            });
        } else if (elements.modalVariants) {
            elements.modalVariants.innerHTML = "";
        }
        
        if (elements.modalAddToCart) {
            elements.modalAddToCart.onclick = () => {
                addToCart(product.id, currentVariant);
                closeProductModal();
            };
        }
    }
    
    function closeProductModal() {
        elements.productModal.classList.remove("open");
        document.body.style.overflow = "";
        if (window.modalParallaxHandler) {
            window.removeEventListener("scroll", window.modalParallaxHandler);
            window.modalParallaxHandler = null;
        }
    }
    
    function initModalParallax() {
        const gallerySlides = $$(".modal-gallery-slide");
        if (window.modalParallaxHandler) {
            window.removeEventListener("scroll", window.modalParallaxHandler);
        }
        
        window.modalParallaxHandler = () => {
            const scrollY = window.scrollY;
            const modalRect = elements.productModal.getBoundingClientRect();
            
            if (modalRect.top < window.innerHeight && modalRect.bottom > 0) {
                gallerySlides.forEach((slide, i) => {
                    const img = slide.querySelector(".modal-gallery-img");
                    if (img && slide.classList.contains("active")) {
                        const parallaxOffset = (scrollY * 0.1) * (i % 2 === 0 ? 1 : -1);
                        img.style.transform = `translateY(${parallaxOffset}px) scale(1.1)`;
                    }
                });
            }
        };
        
        window.addEventListener("scroll", window.modalParallaxHandler, { passive: true });
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
        
        document.addEventListener("keydown", (e) => {
            if (!elements.productModal.classList.contains("open")) return;
            if (e.key === "ArrowLeft" && currentImageIndex > 0) {
                const prevIndex = currentImageIndex - 1;
                const prevThumb = $(`.modal-thumbnail[data-index="${prevIndex}"]`);
                if (prevThumb) prevThumb.click();
            } else if (e.key === "ArrowRight" && currentImageIndex < slides.length - 1) {
                const nextIndex = currentImageIndex + 1;
                const nextThumb = $(`.modal-thumbnail[data-index="${nextIndex}"]`);
                if (nextThumb) nextThumb.click();
            } else if (e.key === "Escape") {
                closeProductModal();
            }
        });
    }
    
    function addToCart(productId, variant = null) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;
        
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
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...itemData, quantity: 1 });
        }
        
        saveCart();
        updateCart();
        openCart();
    }
    
    function updateCart() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    // Calcular descuento si hay uno aplicado
    if (appliedPromoCode) {
        if (appliedPromoCode.type === "percent") {
            discount = subtotal * (appliedPromoCode.value / 100);
        } else if (appliedPromoCode.type === "fixed") {
            discount = appliedPromoCode.value;
        }
        // El descuento no puede ser mayor que el subtotal
        discount = Math.min(discount, subtotal);
    }
    
    const total = subtotal - discount;
    
    if (elements.cartCount) elements.cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (elements.cartItems && elements.cartEmpty) {
        if (cart.length === 0) {
            elements.cartItems.innerHTML = "";
            elements.cartEmpty.style.display = "block";
            if (elements.cartSubtotal) elements.cartSubtotal.textContent = "$0";
            if (elements.cartDiscountRow) elements.cartDiscountRow.style.display = "none";
            if (elements.cartTotal) elements.cartTotal.textContent = "$0";
        } else {
            elements.cartEmpty.style.display = "none";
            elements.cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.variantImage || item.images[0]}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        ${item.variantName ? `<div class="cart-item-variant">${item.variantName}</div>` : ""}
                        <div class="cart-item-price">$${item.price}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" data-action="decrease" data-id="${item.id}" data-variant="${item.variantName || ''}">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" data-action="increase" data-id="${item.id}" data-variant="${item.variantName || ''}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}" data-variant="${item.variantName || ''}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `).join("");
            
            $$(".qty-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = parseInt(btn.dataset.id);
                    const variant = btn.dataset.variant || null;
                    const action = btn.dataset.action;
                    updateQuantity(id, action === "increase" ? 1 : -1, variant);
                });
            });
            
            $$(".cart-item-remove").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = parseInt(btn.dataset.id);
                    const variant = btn.dataset.variant || null;
                    removeFromCart(id, variant);
                });
            });
        }
    }
    
    // Actualizar UI de precios
    if (elements.cartSubtotal) elements.cartSubtotal.textContent = `$${subtotal}`;
    if (elements.cartTotal) elements.cartTotal.textContent = `$${total}`;
    
    if (elements.cartDiscountRow) {
        if (discount > 0) {
            elements.cartDiscountRow.style.display = "flex";
            if (elements.cartDiscountAmount) elements.cartDiscountAmount.textContent = `-$${discount}`;
        } else {
            elements.cartDiscountRow.style.display = "none";
        }
    }
}
    
    function updateQuantity(productId, change, variantName = null) {
        const item = cart.find(item => item.id === productId && item.variantName === variantName);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId, variantName);
            } else {
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
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    function openCart() {
        if (elements.cartSidebar) {
            elements.cartSidebar.classList.add("open");
            document.body.style.overflow = "hidden";
        }
    }
    
    function closeCart() {
        if (elements.cartSidebar) {
            elements.cartSidebar.classList.remove("open");
            document.body.style.overflow = "";
        }
    }

    function handleApplyPromo() {
    const input = $("#promoCodeInput");
    if (!input || appliedPromoCode) return; // ★ No permitir si ya hay código
    
    const code = input.value.trim().toUpperCase();
    const validCodes = C.ecommerce.promoCodes || {};
    
    if (validCodes[code]) {
        appliedPromoCode = { code: code, ...validCodes[code] };
        input.value = "";
        input.classList.remove("error");
        
        // Actualizar UI
        updatePromoUI();
        showToast(`¡Código "${code}" aplicado! ${appliedPromoCode.label}`);
        updateCart();
    } else {
        input.classList.add("error");
        showToast("Código no válido o expirado");
        setTimeout(() => input.classList.remove("error"), 2000);
    }
}

function updatePromoUI() {
    const inputContainer = $("#promoInputContainer");
    const promoApplied = $("#promoApplied");
    const promoCodeDisplay = $("#promoCodeDisplay");
    const input = $("#promoCodeInput");
    const applyBtn = $("#applyPromoBtn");
    
    if (!inputContainer || !promoApplied) return;
    
    if (appliedPromoCode) {
        // Ocultar input, mostrar código aplicado
        inputContainer.style.display = "none";
        promoApplied.style.display = "flex";
        
        if (promoCodeDisplay) {
            promoCodeDisplay.textContent = appliedPromoCode.code;
        }
        
        // Deshabilitar input y botón
        if (input) input.disabled = true;
        if (applyBtn) applyBtn.disabled = true;
    } else {
        // Mostrar input, ocultar código aplicado
        inputContainer.style.display = "flex";
        promoApplied.style.display = "none";
        
        // Habilitar input y botón
        if (input) {
            input.disabled = false;
            input.value = "";
        }
        if (applyBtn) applyBtn.disabled = false;
    }
}

function handleRemovePromo() {
    appliedPromoCode = null;
    updatePromoUI();
    showToast("Código de descuento eliminado");
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
                if (cart.length > 0) {
                    // 1. Recalcular el total de forma segura
                    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    // 2. Construir el mensaje con saltos de línea reales (\n)
                    let msg = "¡Hola! Me interesa hacer el siguiente pedido:\n\n";
                    cart.forEach(item => {
                        const itemTotal = item.price * item.quantity;
                        msg += `▪️ *${item.name}* (${item.variantName || 'Único'}) x${item.quantity} = $${itemTotal}\n`;
                    });
                    msg += `\n*💰 Total a pagar: $${subtotal}*`;
                    
                    // 3. Codificar para URL (esto convierte los \n en %0A y los acentos correctamente)
                    const encodedMsg = encodeURIComponent(msg);
                    
                    // 4. ★ TU NÚMERO DE TELÉFONO AQUÍ ★
                    // Formato: Código de país + número, TODO JUNTO, sin espacios, sin '+', sin paréntesis.
                    // Ejemplo México: 525512345678 (El '1' después del 52 ya no es necesario en WhatsApp, pero si tu región lo usa, déjalo).
                    const phoneNumber = (C.tienda && C.tienda.whatsapp) ? C.tienda.whatsapp : "521234567890"; 
 
                    
                    // 5. Abrir WhatsApp
                    window.open(`https://wa.me/${phoneNumber}?text=${encodedMsg}`, '_blank');
                    
                    // 6. Limpiar carrito después de enviar el pedido
                    cart = [];
                    saveCart();
                    updateCart();
                    closeCart();
                } else {
                    alert("Tu carrito está vacío. ¡Agrega algunos productos primero!");
                }
            });
        }

        // Agrega esto dentro de initEvents(), al final:
const applyPromoBtn = $("#applyPromoBtn");
if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", handleApplyPromo);
}

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
if (removePromoBtn) {
    removePromoBtn.addEventListener("click", handleRemovePromo);
}

    }
    
    function initScrollEffects() {
        const header = elements.shopHeader;
        window.addEventListener("scroll", () => {
            if (header) {
                header.classList.toggle("scrolled", window.scrollY > 100);
            }
        }, { passive: true });
    }
    
    function initShopStars() {
        const starsContainer = $("#shopStars");
        if (!starsContainer) return;
        
        for (let i = 0; i < 35; i++) {
            const star = document.createElement("div");
            star.className = "shop-star";
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 1.5 + 1;
            const duration = Math.random() * 4 + 3;
            const delay = Math.random() * 5;
            const minOpacity = Math.random() * 0.2 + 0.1;
            const maxOpacity = Math.random() * 0.4 + 0.4;
            const glowSize = size * 2.5;
            
            star.style.cssText = `left: ${x}%; top: ${y}%; width: ${size}px; height: ${size}px; --twinkle-duration: ${duration}s; --twinkle-delay: ${delay}s; --min-opacity: ${minOpacity}; --max-opacity: ${maxOpacity}; --glow-size: ${glowSize}px;`;
            starsContainer.appendChild(star);
        }
    }
    
    // ============================================
    // POPUP DE PROMOCIONES
    // ============================================
    function initPromoPopup() {
        const config = C.ecommerce.promotions;
        if (!config || !config.enabled) return;
        
        const promotions = config.items;
        if (!promotions || promotions.length === 0) return;
        
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
        let rotateTimer = null;
        let userInteracted = false;
        
        function renderPromotions() {
            slider.innerHTML = promotions.map((promo, i) => `
                <div class="promo-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
                    <span class="promo-badge ${promo.accent || 'gold'}">${promo.badge}</span>
                    <div class="promo-discount">${promo.discount}</div>
                    <h3 class="promo-title">${promo.title}</h3>
                    <p class="promo-subtitle">${promo.subtitle}</p>
                    <p class="promo-description">${promo.description}</p>
                    <div class="promo-code-wrapper" onclick="copyPromoCode('${promo.code}')">
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
                    <button class="promo-cta" onclick="handlePromoCTA('${promo.ctaHref}')">${promo.cta}</button>
                </div>
            `).join("");
            
            if (dots) {
                dots.innerHTML = promotions.map((_, i) => `<button class="promo-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`).join("");
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
        
        function nextPromo() {
            goToPromo((currentPromoIndex + 1) % promotions.length);
        }
        
        function prevPromo() {
            goToPromo((currentPromoIndex - 1 + promotions.length) % promotions.length);
        }
        
        function startRotation() {
            if (!config.autoRotate || promotions.length <= 1) return;
            const interval = userInteracted ? 12000 : (config.rotateInterval || 10000);
            rotateTimer = setInterval(nextPromo, interval);
        }
        
        function resetRotateTimer() {
            if (rotateTimer) clearInterval(rotateTimer);
            startRotation();
        }
        
        function closePopup() {
            popup.classList.remove("open");
            document.body.style.overflow = "";
            if (rotateTimer) clearInterval(rotateTimer);
            if (dontShowCheckbox && dontShowCheckbox.checked) {
                localStorage.setItem('promoDismissed', 'true');
                localStorage.setItem('promoDismissTime', Date.now().toString());
            }
        }
        
        setTimeout(() => {
            renderPromotions();
            popup.classList.add("open");
            document.body.style.overflow = "hidden";
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
    
    window.copyPromoCode = function(code) {
        navigator.clipboard.writeText(code).then(() => showToast(`Código "${code}" copiado`)).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            showToast(`Código "${code}" copiado`);
        });
    };
    
    function showToast(message) {
        let toast = $(".promo-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "promo-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2500);
    }
    
    window.handlePromoCTA = function(href) {
        const popup = $("#promoPopup");
        if (popup) {
            popup.classList.remove("open");
            document.body.style.overflow = "";
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
    };
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    // Iniciar
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
    
})();