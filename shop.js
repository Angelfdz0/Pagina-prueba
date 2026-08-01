/* ============================================================
TIENDA ONLINE - FUNCIONALIDAD COMPLETA
============================================================ */

(function() {
    "use strict";
    
    // Productos de ejemplo (puedes moverlos a config.js)
    const PRODUCTS = [
        {
            id: 1,
            name: "Reloj Minimalista Premium",
            category: "destacado",
            price: 299,
            originalPrice: null,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
            description: "Diseño atemporal con materiales de la más alta calidad. Correa de cuero genuino y movimiento suizo.",
            badge: "Destacado"
        },
        {
            id: 2,
            name: "Auriculares Wireless Elite",
            category: "nuevo",
            price: 449,
            originalPrice: 549,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
            description: "Sonido de estudio con cancelación activa de ruido. 40 horas de batería.",
            badge: "Nuevo"
        },
        {
            id: 3,
            name: "Cámara Instantánea Vintage",
            category: "popular",
            price: 189,
            originalPrice: null,
            image: "https://images.unsplash.com/photo-1526178610171-1a44f12b0b8e?q=80&w=1000&auto=format&fit=crop",
            description: "Captura momentos únicos con estilo retro. Incluye 10 fotos instantáneas.",
            badge: "Popular"
        },
        {
            id: 4,
            name: "Lámpara de Diseño Escandinavo",
            category: "destacado",
            price: 159,
            originalPrice: 199,
            image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000&auto=format&fit=crop",
            description: "Iluminación cálida con diseño minimalista nórdico. LED incluido.",
            badge: "Oferta"
        },
        {
            id: 5,
            name: "Mochila Urban Tech",
            category: "nuevo",
            price: 129,
            originalPrice: null,
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
            description: "Impermeable con compartimento para laptop de 15 pulgadas. USB charging port.",
            badge: "Nuevo"
        },
        {
            id: 6,
            name: "Silla Ergonómica Executive",
            category: "popular",
            price: 599,
            originalPrice: null,
            image: "https://images.unsplash.com/photo-1505843490538-5133c6c7b0e1?q=80&w=1000&auto=format&fit=crop",
            description: "Máximo confort para largas jornadas. Ajuste lumbar y reposabrazos 4D.",
            badge: "Popular"
        },
        {
            id: 7,
            name: "Set de Escritorio Premium",
            category: "destacado",
            price: 249,
            originalPrice: 299,
            image: "https://images.unsplash.com/photo-1518459034110-744dc650259b?q=80&w=1000&auto=format&fit=crop",
            description: "Organiza tu espacio con estilo. Incluye organizador, porta lápices y base.",
            badge: "Oferta"
        },
        {
            id: 8,
            name: "Smartwatch Pro Series",
            category: "nuevo",
            price: 399,
            originalPrice: null,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
            description: "Monitoreo de salud 24/7, GPS integrado y resistencia al agua 50m.",
            badge: "Nuevo"
        }
    ];
    
    // Estado del carrito
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Elementos DOM
    const productsGrid = $("#productsGrid");
    const searchInput = $("#searchInput");
    const sortSelect = $("#sortSelect");
    const filterBtns = $$(".filter-btn");
    const cartToggle = $("#cartToggle");
    const cartSidebar = $("#cartSidebar");
    const cartClose = $("#cartClose");
    const cartOverlay = $("#cartOverlay");
    const cartItems = $("#cartItems");
    const cartEmpty = $("#cartEmpty");
    const cartCount = $("#cartCount");
    const cartTotal = $("#cartTotal");
    const quickViewModal = $("#quickViewModal");
    const quickViewClose = $("#quickViewClose");
    const quickViewBody = $("#quickViewBody");
    const shopHeader = $("#shopHeader");
    const shopHeroBg = $("#shopHeroBg");
    
    // Filtros activos
    let currentFilter = "all";
    let searchQuery = "";
    let sortValue = "default";
    
    // Utilidades
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => [...document.querySelectorAll(sel)];
    
    // Inicialización
    function init() {
        renderProducts();
        updateCart();
        initParallax();
        initScrollEffects();
        initCursor();
        initEvents();
    }
    
    // Renderizar productos
    function renderProducts() {
        let filtered = [...PRODUCTS];
        
        // Filtrar por categoría
        if (currentFilter !== "all") {
            filtered = filtered.filter(p => p.category === currentFilter);
        }
        
        // Buscar
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }
        
        // Ordenar
        filtered = sortProducts(filtered);
        
        // Mostrar/ocultar no results
        const noResults = $("#noResults");
        if (filtered.length === 0) {
            productsGrid.innerHTML = "";
            noResults.style.display = "block";
        } else {
            noResults.style.display = "none";
            productsGrid.innerHTML = filtered.map((product, index) => createProductCard(product, index)).join("");
            
            // Animar entrada
            setTimeout(() => {
                $$(".product-card").forEach((card, i) => {
                    setTimeout(() => {
                        card.classList.add("visible");
                    }, i * 100);
                });
            }, 100);
        }
        
        // Agregar eventos a botones
        $$(".product-add-to-cart").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(btn.dataset.id);
                addToCart(id);
            });
        });
        
        $$(".product-quick-view").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(btn.dataset.id);
                openQuickView(id);
            });
        });
    }
    
    // Crear card de producto
    function createProductCard(product, index) {
        return `
            <div class="product-card" style="animation-delay: ${index * 0.1}s">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
                    <div class="product-actions">
                        <button class="action-btn product-quick-view" data-id="${product.id}" title="Vista rápida">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                        <button class="action-btn product-add-to-cart" data-id="${product.id}" title="Agregar al carrito">
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
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice}</span>` : ""}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Ordenar productos
    function sortProducts(products) {
        switch(sortValue) {
            case "price-asc":
                return products.sort((a, b) => a.price - b.price);
            case "price-desc":
                return products.sort((a, b) => b.price - a.price);
            case "name-asc":
                return products.sort((a, b) => a.name.localeCompare(b.name));
            case "name-desc":
                return products.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return products;
        }
    }
    
    // Agregar al carrito
    function addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        saveCart();
        updateCart();
        openCart();
    }
    
    // Actualizar carrito
    function updateCart() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        cartCount.textContent = totalItems;
        cartTotal.textContent = `$${totalPrice}`;
        
        if (cart.length === 0) {
            cartItems.innerHTML = "";
            cartEmpty.style.display = "block";
        } else {
            cartEmpty.style.display = "none";
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price}</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            `).join("");
        }
    }
    
    // Actualizar cantidad
    window.updateQuantity = function(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                updateCart();
            }
        }
    };
    
    // Eliminar del carrito
    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCart();
    };
    
    // Guardar carrito
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Abrir/cerrar carrito
    function openCart() {
        cartSidebar.classList.add("open");
        document.body.style.overflow = "hidden";
    }
    
    function closeCart() {
        cartSidebar.classList.remove("open");
        document.body.style.overflow = "";
    }
    
    // Quick View
    function openQuickView(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        quickViewBody.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="quick-view-image">
            <div class="quick-view-info">
                <div class="quick-view-category">${product.category}</div>
                <h2 class="quick-view-title">${product.name}</h2>
                <div class="quick-view-price">$${product.price}</div>
                <p class="quick-view-description">${product.description}</p>
                <button class="quick-view-add-to-cart" onclick="addToCart(${product.id}); closeQuickView();">
                    Agregar al Carrito
                </button>
            </div>
        `;
        quickViewModal.classList.add("open");
        document.body.style.overflow = "hidden";
    }
    
    function closeQuickView() {
        quickViewModal.classList.remove("open");
        document.body.style.overflow = "";
    }
    
    // Parallax
    function initParallax() {
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY;
            if (shopHeroBg) {
                shopHeroBg.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0) scale(1.1)`;
            }
            
            // Header scroll
            if (shopHeader) {
                shopHeader.classList.toggle("scrolled", scrollY > 100);
            }
        }, { passive: true });
    }
    
    // Scroll effects
    function initScrollEffects() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );
        
        $$(".product-card").forEach(card => observer.observe(card));
    }
    
    // Cursor personalizado
    function initCursor() {
        if (window.innerWidth < 769) return;
        
        const cursor = $(".cursor");
        const follower = $(".cursor-follower");
        
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
            fx += (mx - fx) * 0.12;
            fy += (my - fy) * 0.12;
            follower.style.left = fx + "px";
            follower.style.top = fy + "px";
            requestAnimationFrame(animateFollower);
        }
        
        animateFollower();
        
        // Hover effects
        const hoverTargets = "a, button, .product-card";
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
    
    // Event listeners
    function initEvents() {
        // Filtros
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.dataset.filter;
                renderProducts();
            });
        });
        
        // Búsqueda
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderProducts();
        });
        
        // Ordenar
        sortSelect.addEventListener("change", (e) => {
            sortValue = e.target.value;
            renderProducts();
        });
        
        // Carrito
        cartToggle.addEventListener("click", openCart);
        cartClose.addEventListener("click", closeCart);
        cartOverlay.addEventListener("click", closeCart);
        
        // Quick View
        quickViewClose.addEventListener("click", closeQuickView);
        $(".quick-view-overlay").addEventListener("click", closeQuickView);
        
        // Checkout
        $("#cartCheckout").addEventListener("click", () => {
            if (cart.length > 0) {
                alert("¡Gracias por tu compra! (Demo)");
                cart = [];
                saveCart();
                updateCart();
                closeCart();
            }
        });
    }
    
    // Iniciar
    init();
})();