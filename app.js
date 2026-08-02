/* ============================================================
   ██████  ██████  ██████  ██    ██ 
   ██   ██ ██   ██ ██   ██  ██  ██  
   ██████  ██████  ██████    ████   
   ██      ██   ██ ██         ██    
   ██      ██   ██ ██         ██    
                                    
   ★ CEREBRO DE LA PÁGINA ★
   Lee SITE_CONFIG y construye + anima todo.
   ============================================================ */

(function () {
  "use strict";

  const C = SITE_CONFIG;

  // ─── UTILIDADES ──────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ★ NUEVA FUNCIÓN: Verifica si un bloque está habilitado
function isBlockEnabled(blockName) {
    // Si no existe la propiedad enabled, asumimos true para retrocompatibilidad
    return C[blockName]?.enabled !== false;
}

  // ─── APLICAR TEMA ───────────────────────
  function applyTheme() {
    const r = document.documentElement.style;
    const t = C.theme;
    r.setProperty("--color-bg", t.bg);
    r.setProperty("--color-bg-alt", t.bgAlt);
    r.setProperty("--color-text", t.text);
    r.setProperty("--color-text-muted", t.textMuted);
    r.setProperty("--color-accent", t.accent);
    r.setProperty("--color-accent-light", t.accentLight);
    r.setProperty("--color-white", t.white);
    r.setProperty("--color-dark", t.dark);
    r.setProperty("--font-display", t.fontDisplay);
    r.setProperty("--font-body", t.fontBody);
    document.title = C.header.logo.text + C.header.logo.highlight;
  }

  // ─── INYECTAR SEO DINÁMICO ──────────────

  function injectSEO() {
      const C = SITE_CONFIG;
      // Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          document.head.appendChild(metaDesc);
      }
      metaDesc.content = C.story.paragraphs[0].substring(0, 155); // Ejemplo
      
      // OpenGraph (Para WhatsApp, Facebook, LinkedIn)
      const ogTags = {
          'og:title': C.header.logo.text + C.header.logo.highlight,
          'og:description': C.hero.subtitle,
          'og:image': C.hero.backgroundImage,
          'og:type': 'website'
      };
      for (const [key, value] of Object.entries(ogTags)) {
          let tag = document.querySelector(`meta[property="${key}"]`);
          if (!tag) {
              tag = document.createElement('meta');
              tag.setAttribute('property', key);
              document.head.appendChild(tag);
          }
          tag.content = value;
      }
  }

  // ─── HERO STARS (Estrellas parpadeantes) ──────────────────────
function initHeroStars() {
  if (!isBlockEnabled("hero")) return;
  const hero = $("#hero");
  if (!hero) return;

  // Crear contenedor de estrellas
  const starsContainer = document.createElement("div");
  starsContainer.className = "hero-stars";
  hero.appendChild(starsContainer);

  const starCount = 40; // Número de estrellas

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.className = "star";

    // Posición aleatoria
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    // Tamaño aleatorio (1px a 3px)
    const size = Math.random() * 2 + 1;

    // Duración del parpadeo (2s a 6s)
    const duration = Math.random() * 4 + 2;

    // Delay aleatorio
    const delay = Math.random() * 5;

    // Opacidad mínima y máxima
    const minOpacity = Math.random() * 0.3 + 0.1;
    const maxOpacity = Math.random() * 0.5 + 0.5;

    // Tamaño del glow
    const glowSize = size * 3;

    // Aplicar variables CSS
    star.style.cssText = `
      left: ${x}%;
      top: ${y}%;
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

  // ─── BARRA DE PROGRESO ──────────────────
  function initProgressBar() {
    if (!C.effects.progressBarEnabled) return;
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.prepend(bar);
    window.addEventListener("scroll", () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (window.scrollY / h) * 100 + "%";
    }, { passive: true });
  }

  // ─── LOADER CON TÍTULO QUE SE RELLENA ─────────────────────────────
function initLoader() {
    const loader = $("#loader");
    const titleFill = $("#loaderTitleFill");
    const percentage = $("#loaderPercentage");

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 3;
        if (progress > 100) progress = 100;
        
        // ★ Actualizar el relleno del título
        if (titleFill) {
            titleFill.style.width = progress + "%";
        }
        
        // ★ Actualizar el porcentaje
        if (percentage) {
            percentage.textContent = Math.round(progress) + "%";
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            // Esperar un momento para que el usuario vea el 100%
            setTimeout(() => {
                // Ocultar el loader
                loader.classList.add("hidden");
                
                // Animar el Hero después
                setTimeout(() => {
                    if (isBlockEnabled("hero")) {
                        animateHero();
                    }
                }, 800);
            }, 600);
        }
    }, C.loader.duration / 8);
}

  // ─── HEADER ──────────────────────────────
function buildHeader() {
    const nav = $("#nav");
    const h = C.header;
    
    // ★ FILTRAR LINKS: Solo muestra los que apuntan a bloques habilitados
    const visibleLinks = h.links.filter(link => {
        const blockId = link.href.replace("#", ""); // Ej: "#story" -> "story"
        return isBlockEnabled(blockId);
    });

    nav.innerHTML = `
        <a href="#hero" class="nav-logo">${h.logo.text}<span>${h.logo.highlight}</span></a>
        <ul class="nav-links" id="navLinks">
            ${visibleLinks.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}
        </ul>
        <a href="${h.cta.href}" class="nav-cta">${h.cta.label}</a>
        <button class="nav-hamburger" id="hamburger" aria-label="Menu">
            <span></span><span></span><span></span>
        </button>
    `;
  
    // Hamburger toggle
    const hamburger = $("#hamburger");
    const navLinks = $("#navLinks");
    const header = $("#header");
    
    hamburger.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("open");
        
        // ★ CORRECCIÓN: Forzar reflow antes de cambiar clases
        // Esto asegura que el navegador procese el cambio de estado
        if (isOpen) {
            // Cerrando
            navLinks.classList.remove("open");
            hamburger.classList.remove("active");
            header.classList.remove("menu-open");
            document.body.style.overflow = "";
        } else {
            // Abriendo
            hamburger.classList.add("active");
            navLinks.classList.add("open");
            header.classList.add("menu-open");
            document.body.style.overflow = "hidden";
        }
    });

    // Close on link click (mobile)
    $$(".nav-links a").forEach(a => {
        a.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navLinks.classList.remove("open");
            header.classList.remove("menu-open");
            document.body.style.overflow = "";
        });
    });

    // Scroll state
    window.addEventListener("scroll", () => {
        $("#header").classList.toggle("scrolled", window.scrollY > 80);
    }, { passive: true });
}

  // ─── HERO ────────────────────────────────
  function buildHero() {
    if (!isBlockEnabled("hero")) {
        const section = $("#hero");
        if (section) section.style.display = "none";
        return;
    }
  const h = C.hero;
  const bg = $("#heroBg");
  const content = $("#heroContent");

  bg.style.backgroundImage = `url(${h.backgroundImage})`;

  content.innerHTML = `
    <p class="hero-eyebrow">${h.eyebrow}</p>
    <h1 class="hero-title">
      <span class="line"><span class="line-inner">${h.title.line1}</span></span>
      <span class="line">
        <span class="line-inner">${h.title.line2}&nbsp;</span>
      </span>
      <span class="line">
        <span class="line-inner">
          <span class="typewriter-wrapper" id="typewriterWrapper">
            <em class="typewriter-word" id="typewriterWord"></em><span class="typewriter-cursor" id="typewriterCursor">|</span>
          </span>
        </span>
      </span>
    </h1>
    <p class="hero-subtitle">${h.subtitle}</p>
    <a href="${h.ctaHref}" class="hero-cta">${h.cta}</a>
  `;
}

  function animateHero() {
    const lines = $$(".hero-title .line-inner");
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.style.transition = `transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)`;
        line.style.transform = "translateY(0)";
      }, 200 + i * 150);
    });

    setTimeout(() => {
      const eyebrow = $(".hero-eyebrow");
      eyebrow.style.transition = "opacity 1s, transform 1s cubic-bezier(0.16,1,0.3,1)";
      eyebrow.style.opacity = "1";
      eyebrow.style.transform = "translateY(0)";
    }, 100);

    setTimeout(() => {
      const sub = $(".hero-subtitle");
      sub.style.transition = "opacity 1s, transform 1s cubic-bezier(0.16,1,0.3,1)";
      sub.style.opacity = "1";
      sub.style.transform = "translateY(0)";
    }, 700);

    setTimeout(() => {
      const cta = $(".hero-cta");
      cta.style.transition = "opacity 1s, transform 1s cubic-bezier(0.16,1,0.3,1)";
      cta.style.opacity = "1";
      cta.style.transform = "translateY(0)";
    }, 900);

    setTimeout(() => {
      const si = $("#scrollIndicator");
      si.style.transition = "opacity 1s";
      si.style.opacity = "1";
    }, 1400);
  }

// ─── TYPEWRITER EFFECT ───────────────────
function initTypewriter() {
  if (!isBlockEnabled("hero")) return;
  const words = C.hero.title.typewriterWords;
  const wordEl = $("#typewriterWord");
  const wrapperEl = $("#typewriterWrapper");
  const cursorEl = $("#typewriterCursor");

  if (!wordEl || !wrapperEl || !cursorEl) return;

  // ★ CALCULAR EL ANCHO DE LA PALABRA MÁS LARGA
  const tempSpan = document.createElement("span");
  tempSpan.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: nowrap;
    font-family: var(--font-display);
    font-style: italic;
    font-size: ${getComputedStyle(wordEl).fontSize};
    line-height: ${getComputedStyle(wordEl).lineHeight};
  `;
  document.body.appendChild(tempSpan);

  let maxWidth = 0;
  words.forEach(word => {
    tempSpan.textContent = word;
    const width = tempSpan.offsetWidth;
    if (width > maxWidth) maxWidth = width;
  });

  document.body.removeChild(tempSpan);

  // ★ APLICAR EL ANCHO FIJO al wrapper
  wrapperEl.style.minWidth = (maxWidth + 12) + "px";

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let currentText = "";

  const typeSpeed = 120;
  const deleteSpeed = 60;
  const pauseEnd = 2200;
  const pauseStart = 400;

  function tick() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      currentText = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      currentText = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    wordEl.textContent = currentText;

    let speed = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentWord.length) {
      speed = pauseEnd;
      isDeleting = true;
    }
    else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = pauseStart;
    }

    setTimeout(tick, speed);
  }

  setTimeout(() => {
    tick();
  }, 1800);
}
  
  // ─── BLOQUE 1: HISTORIA ─────────────────
function buildStory() {
  if (!isBlockEnabled("story")) {
        const section = $("#story");
        if (section) section.style.display = "none";
        return;
  }
  const s = C.story;
  const inner = $("#storyInner");
  inner.innerHTML = `
    <!-- LISTÓN DECORATIVO ANIMADO -->
    <div class="story-ribbon" id="storyRibbon">
      <svg viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="ribbon-path" 
              d="M380,0 C350,100 320,200 340,300 C360,400 300,500 280,600 C260,700 300,750 320,800" 
              stroke="var(--color-accent)" 
              stroke-width="2" 
              fill="none" 
              opacity="0.3"/>
        <path class="ribbon-path-shadow" 
              d="M380,0 C350,100 320,200 340,300 C360,400 300,500 280,600 C260,700 300,750 320,800" 
              stroke="var(--color-accent)" 
              stroke-width="8" 
              fill="none" 
              opacity="0.08"/>
      </svg>
    </div>
    
    <div class="story-grid">
      <div class="story-image-wrapper reveal-left">
        <img class="story-image" src="${s.image}" alt="${s.label}" loading="lazy" />
      </div>
      <div class="story-text">
        <span class="section-label reveal">${s.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${s.heading}</h2>
        <hr class="editorial-hr reveal reveal-delay-2" />
        ${s.paragraphs.map((p, i) => `<p class="reveal reveal-delay-${i + 3}">${p}</p>`).join("")}
        <div class="story-stat-row">
          ${s.stats.map((st, i) => `
            <div class="reveal reveal-delay-${i + 4}">
              <div class="story-stat-number">${st.number}</div>
              <div class="story-stat-label">${st.label}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

  // ─── BLOQUE 2: SERVICIOS ────────────────
  function buildServices() {
    if (!isBlockEnabled("services")) {
        const section = $("#services");
        if (section) section.style.display = "none";
        return;
  }
    const s = C.services;
    const inner = $("#servicesInner");
    inner.innerHTML = `
      <div class="services-header">
        <span class="section-label reveal">${s.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${s.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="reveal reveal-delay-3">${s.subtitle}</p>
      </div>
      <div class="services-grid">
        ${s.items.map((item, i) => `
          <div class="service-card reveal reveal-delay-${i + 1}">
            <div class="service-number">${item.number}</div>
            <h3 class="service-title">${item.title}</h3>
            <p class="service-desc">${item.desc}</p>
          </div>
        `).join("")}
      </div>
    `;
  }

  // ─── LUZ QUE CAE EN SERVICIOS ─────────────────
function initServicesLight() {
    const servicesSection = $("#services");
    if (!servicesSection) return;

    // Crear contenedor de luz
    const lightContainer = document.createElement("div");
    lightContainer.className = "services-light-container";
    
    // Insertar al inicio de la sección
    const servicesInner = $("#servicesInner");
    servicesInner.insertBefore(lightContainer, servicesInner.firstChild);

    // Crear haz de luz principal
    const lightBeam = document.createElement("div");
    lightBeam.className = "light-beam";
    lightContainer.appendChild(lightBeam);

    // Crear resplandor ambiental
    const ambientGlow = document.createElement("div");
    ambientGlow.className = "services-ambient-glow";
    lightContainer.appendChild(ambientGlow);

    const heading = $(".services-header .section-heading");
    const maxParticles = 15;
    const particles = [];

    // Función para crear partículas
    function createParticle() {
        if (particles.length >= maxParticles) return;

        const particle = document.createElement("div");
        particle.className = "light-particle";

        // Posición horizontal aleatoria (centrada)
        const startX = 30 + Math.random() * 40; // 30% a 70%
        particle.style.left = startX + "%";
        particle.style.top = "-10%";

        // Tamaño aleatorio
        const size = Math.random() * 2 + 1;
        particle.style.width = size + "px";
        particle.style.height = size + "px";

        // Variables CSS para la animación
        const duration = Math.random() * 6 + 2; // 3s a 6s
        const delay = Math.random() * 2;
        const driftX = (Math.random() - 0.5) * 100; // -50px a +50px

        particle.style.setProperty("--fall-duration", duration + "s");
        particle.style.setProperty("--fall-delay", delay + "s");
        particle.style.setProperty("--drift-x", driftX + "px");

        lightContainer.appendChild(particle);
        particles.push(particle);

        // Activar animación
        setTimeout(() => {
            particle.classList.add("animate");
        }, 50);

        // Eliminar después de la animación
        setTimeout(() => {
            particle.remove();
            const index = particles.indexOf(particle);
            if (index > -1) particles.splice(index, 1);
        }, (duration + delay) * 1000);
    }

    // Generar partículas continuamente
    function scheduleNextParticle() {
        const delay = Math.random() * 1500 + 1000; // 0.4s a 1.2s
        setTimeout(() => {
            createParticle();
            scheduleNextParticle();
        }, delay);
    }

    // Activar todo cuando la sección sea visible
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Activar haz de luz y resplandor
                    setTimeout(() => {
                        lightBeam.classList.add("active");
                        ambientGlow.classList.add("active");
                        if (heading) {
                            heading.classList.add("glow-active");
                        }
                        // Iniciar partículas
                        scheduleNextParticle();
                    }, 500);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );
    
    observer.observe(servicesSection);
}

  // ─── BLOQUE 3: GALERÍA (CARRUSEL) ─────────────────
function buildGallery() {
    if (!isBlockEnabled("gallery")) {
        const section = $("#gallery");
        if (section) section.style.display = "none";
        return;
    }
    const g = C.gallery;
    const inner = $("#galleryInner");
    inner.innerHTML = `
        <div class="gallery-header">
            <span class="section-label reveal">${g.label}</span>
            <h2 class="section-heading reveal reveal-delay-1">${g.heading}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="reveal reveal-delay-3">${g.subtitle}</p>
        </div>
        <div class="gallery-carousel-wrapper" id="galleryCarouselWrapper">
            <div class="gallery-carousel" id="galleryCarousel">
                ${g.items.map((item, i) => `
                    <div class="gallery-slide reveal-scale reveal-delay-${i + 1}" data-index="${i}">
                        <!-- ★ NUEVO: Contenedor de luz que barre -->
                        <div class="gallery-slide-light"></div>
                        
                        <!-- ★ NUEVO: Contenedor de partículas -->
                        <div class="gallery-particles" id="galleryParticles-${i}"></div>
                        
                        <div class="gallery-slide-img-wrapper">
                            <img class="gallery-slide-img" src="${item.image}" alt="${item.caption}" loading="lazy" />
                        </div>
                        <span class="gallery-slide-caption">${item.caption}</span>
                    </div>
                `).join("")}
            </div>
        </div>
        <div class="gallery-progress">
            <div class="gallery-progress-fill" id="galleryProgressFill"></div>
        </div>
        <div class="gallery-drag-hint">← Arrastra para explorar →</div>
    `;
    
    // ★ NUEVO: Inicializar partículas después de renderizar
    setTimeout(() => initGalleryParticles(), 100);
}

// ★ NUEVA FUNCIÓN: Crear partículas para cada slide
function initGalleryParticles() {
    const slides = $$(".gallery-slide");
    
    slides.forEach((slide, index) => {
        const particlesContainer = $(`#galleryParticles-${index}`);
        if (!particlesContainer) return;
        
        const particleCount = 12; // 12 partículas por slide
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            particle.className = "gallery-particle";
            
            // Posición aleatoria dentro del slide
            const x = Math.random() * 100;
            const y = 50 + Math.random() * 50; // Empiezan desde la mitad hacia abajo
            
            // Variables para la animación
            const duration = Math.random() * 3 + 2; // 2s a 5s
            const delay = Math.random() * 2; // 0s a 2s
            const driftX = (Math.random() - 0.5) * 40; // -20px a +20px
            
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.animation = `galleryParticleFloat ${duration}s ease-in-out ${delay}s infinite`;
            particle.style.setProperty("--drift-x", `${driftX}px`);
            
            particlesContainer.appendChild(particle);
        }
        
        // ★ NUEVO: Efecto de luz que sigue al cursor
        slide.addEventListener("mousemove", (e) => {
            const rect = slide.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Mover el haz de luz según la posición del cursor
            const light = $(".gallery-slide-light", slide);
            if (light) {
                light.style.background = `
                    radial-gradient(
                        circle at ${x}% ${y}%,
                        rgba(201, 169, 110, 0.3) 0%,
                        rgba(201, 169, 110, 0.1) 30%,
                        transparent 60%
                    )
                `;
            }
        });
    });
}

  // ─── CARRUSEL PARALLAX DE GALERÍA ─────────────────
function initGalleryCarousel() {
    const wrapper = $("#galleryCarouselWrapper");
    const carousel = $("#galleryCarousel");
    const progressFill = $("#galleryProgressFill");
    if (!wrapper || !carousel) return;

    const slides = $$(".gallery-slide", carousel);
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let translateX = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let animationId = null;

    // Calcular límites
    function getMaxTranslate() {
        const wrapperWidth = wrapper.offsetWidth;
        const carouselWidth = carousel.scrollWidth;
        return -(carouselWidth - wrapperWidth);
    }

    // Actualizar posición con parallax interno y escala dinámica
    function updateCarousel(x, isSmooth = false) {
        const maxTranslate = getMaxTranslate();
        translateX = clamp(x, maxTranslate, 0);
        
        if (isSmooth) {
            carousel.classList.add("smooth");
        } else {
            carousel.classList.remove("smooth");
        }
        
        carousel.style.transform = `translate3d(${translateX}px, 0, 0)`;

        // Parallax interno + escala dinámica por slide
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;

        slides.forEach(slide => {
            const rect = slide.getBoundingClientRect();
            const slideCenter = rect.left + rect.width / 2;
            const distanceFromCenter = slideCenter - wrapperCenter;
            const normalizedDistance = distanceFromCenter / (wrapperRect.width / 2);

            // Parallax interno: la imagen se mueve opuesto al arrastre
            const img = $(".gallery-slide-img", slide);
            if (img) {
                const parallaxOffset = normalizedDistance * 30;
                img.style.transform = `translate3d(${parallaxOffset}px, 0, 0) scale(1.2)`;
            }

            // Escala dinámica: más grande en el centro
            const scale = 1 - Math.abs(normalizedDistance) * 0.15;
            const opacity = 1 - Math.abs(normalizedDistance) * 0.4;
            slide.style.transform = `scale(${clamp(scale, 0.85, 1)})`;
            slide.style.opacity = clamp(opacity, 0.5, 1);
        });

        // Actualizar barra de progreso
        if (progressFill) {
            const progress = Math.abs(translateX) / Math.abs(maxTranslate);
            progressFill.style.width = (progress * 100) + "%";
        }
    }

    // Inercia después de soltar
    function applyInertia() {
        if (Math.abs(velocity) < 0.5) return;
        translateX += velocity;
        velocity *= 0.92; // Fricción
        updateCarousel(translateX);
        animationId = requestAnimationFrame(applyInertia);
    }

    // Eventos de arrastre (mouse + touch)
    function onStart(e) {
        isDragging = true;
        startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        lastX = startX;
        lastTime = Date.now();
        velocity = 0;
        if (animationId) cancelAnimationFrame(animationId);
        carousel.classList.remove("smooth");
    }

    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        const deltaX = x - startX;
        const now = Date.now();
        const dt = now - lastTime;
        
        if (dt > 0) {
            velocity = (x - lastX) / dt * 16; // Normalizar a ~60fps
        }
        lastX = x;
        lastTime = now;
        
        updateCarousel(translateX + deltaX);
        startX = x;
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        applyInertia();
    }

    // Mouse events
    wrapper.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    wrapper.addEventListener("mouseleave", onEnd);

    // Touch events
    wrapper.addEventListener("touchstart", onStart, { passive: true });
    wrapper.addEventListener("touchmove", onMove, { passive: false });
    wrapper.addEventListener("touchend", onEnd);

    // Click en slide para evitar conflicto con drag
    slides.forEach(slide => {
        slide.addEventListener("click", (e) => {
            if (Math.abs(velocity) > 2) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // Inicializar posición
    updateCarousel(0, true);

    // Actualizar en resize
    window.addEventListener("resize", () => {
        updateCarousel(translateX);
    });
}

  // ─── BLOQUE 4: FILOSOFÍA ────────────────
function buildPhilosophy() {
  if (!isBlockEnabled("philosophy")) {
        const section = $("#philosophy");
        if (section) section.style.display = "none";
        return;
  }
  const p = C.philosophy;
  const section = $("#philosophy");  // ★ La sección completa

  // Si no está habilitado, ocultar la sección entera
  if (!p.enabled) {
    if (section) section.style.display = "none";
    return;
  }

  // Si está habilitado, asegurar que sea visible
  if (section) section.style.display = "flex";

  const inner = $("#philosophyInner");
  inner.innerHTML = `
    <div class="philosophy-inner">
      <span class="section-label reveal">${p.label}</span>
      <hr class="editorial-hr center reveal reveal-delay-1" />
      <blockquote class="philosophy-quote reveal reveal-delay-2">${p.quote}</blockquote>
      <p class="philosophy-author reveal reveal-delay-3">${p.author}</p>
      <a href="${p.ctaHref}" class="philosophy-cta reveal reveal-delay-4">
        <span>${p.cta}</span>
      </a>
    </div>
  `;
}

// ─── BLOQUE 5: E-COMMERCE ──────────────
function buildEcommerce() {
  if (!isBlockEnabled("ecommerce")) {
        const section = $("#ecommerce");
        if (section) section.style.display = "none";
        return;
  }
  const e = C.ecommerce;
  const section = $("#ecommerce");

  if (!e.enabled) {
    if (section) section.style.display = "none";
    return;
  }

  if (section) section.style.display = "flex";

  const inner = $("#ecommerceInner");
  inner.innerHTML = `
    <!-- ÍCONO DE TIENDA DECORATIVO EN FONDO -->
    <div class="ecommerce-bg-icon">
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <!-- Bolsa de compras -->
        <path d="M100,140 L100,360 Q100,380 120,380 L280,380 Q300,380 300,360 L300,140 Z" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="3" 
              stroke-linecap="round" 
              stroke-linejoin="round"/>
        
        <!-- Asa de la bolsa -->
        <path d="M140,140 L140,100 Q140,60 200,60 Q260,60 260,100 L260,140" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="3" 
              stroke-linecap="round"/>
        
        <!-- Detalle decorativo: línea horizontal -->
        <line x1="100" y1="180" x2="300" y2="180" 
              stroke="currentColor" 
              stroke-width="2" 
              opacity="0.5"/>
        
        <!-- Estrella decorativa 1 -->
        <circle cx="160" cy="240" r="8" 
                fill="currentColor" 
                opacity="0.3"/>
        
        <!-- Estrella decorativa 2 -->
        <circle cx="240" cy="280" r="6" 
                fill="currentColor" 
                opacity="0.25"/>
        
        <!-- Estrella decorativa 3 -->
        <circle cx="200" cy="320" r="10" 
                fill="currentColor" 
                opacity="0.2"/>
        
        <!-- Líneas decorativas -->
        <line x1="150" y1="260" x2="180" y2="260" 
              stroke="currentColor" 
              stroke-width="1.5" 
              opacity="0.3"/>
        <line x1="220" y1="300" x2="260" y2="300" 
              stroke="currentColor" 
              stroke-width="1.5" 
              opacity="0.3"/>
      </svg>
    </div>
    
    <div class="ecommerce-inner">
      <span class="section-label reveal">${e.label}</span>
      <h2 class="section-heading reveal reveal-delay-1">${e.heading}</h2>
      <hr class="editorial-hr center reveal reveal-delay-2" />
      <p class="ecommerce-subtitle reveal reveal-delay-3">${e.subtitle}</p>
      <a href="${e.ctaHref}" class="ecommerce-cta reveal reveal-delay-4" target="_blank" rel="noopener">
        <span>${e.cta}</span>
      </a>
    </div>
  `;
}

  // ─── EFECTO PARTÍCULAS PARA TIENDA ─────────────
function initEcommerceParticles() {
    const section = $("#ecommerce");
    if (!section) return;

    // Crear contenedor de partículas
    const particlesContainer = document.createElement("div");
    particlesContainer.className = "ecommerce-particles";
    section.appendChild(particlesContainer);

    // Crear 20 partículas
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "ecommerce-particle";
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            --particle-duration: ${duration}s;
            --particle-delay: ${delay}s;
        `;
        
        particlesContainer.appendChild(particle);
    }

    // Animar al entrar en viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                particlesContainer.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(section);
}

  // ─── BLOQUE 6: BLOG (TINTA DORADA) ──────────────
function buildBlog() {
    if (!isBlockEnabled("blog")) {
        const section = $("#blog");
        if (section) section.style.display = "none";
        return;
    }
    const b = C.blog;
    const section = $("#blog");
    if (section) section.style.display = "flex";

    const inner = $("#blogInner");
    inner.innerHTML = `
        <!-- CAPA 1: Tinta Dorada que se expande -->
        <div class="blog-ink-bg"></div>
        
        <!-- CAPA 2: Partículas de polvo flotante -->
        <div class="blog-particles-container" id="blogParticles"></div>

        <!-- CAPA 3: Ícono de Libro con Parallax 3D -->
        <div class="blog-bg-icon" id="blogBgIcon">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <!-- Hoja izquierda -->
                <path d="M200,320 L200,100 C160,80 120,90 100,100 L100,300 C120,290 160,280 200,320 Z" 
                      fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- Hoja derecha -->
                <path d="M200,320 L200,100 C240,80 280,90 300,100 L300,300 C280,290 240,280 200,320 Z" 
                      fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- Líneas de texto (simulando páginas escritas) -->
                <line x1="130" y1="150" x2="180" y2="160" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                <line x1="130" y1="190" x2="170" y2="200" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                <line x1="130" y1="230" x2="180" y2="240" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                <line x1="220" y1="160" x2="270" y2="150" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                <line x1="230" y1="200" x2="270" y2="190" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                <!-- Elementos místicos (Tinta / Estrellas) -->
                <circle cx="150" cy="280" r="3" fill="currentColor" opacity="0.5"/>
                <circle cx="250" cy="270" r="4" fill="currentColor" opacity="0.3"/>
                <path d="M140,270 Q150,260 160,275" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
            </svg>
        </div>
        
        <!-- CAPA 4: Contenido Editorial -->
        <div class="blog-inner">
            <span class="section-label reveal">${b.label}</span>
            <h2 class="section-heading reveal reveal-delay-1">${b.heading}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="blog-subtitle reveal reveal-delay-3">${b.subtitle}</p>
            <a href="${b.ctaHref}" class="blog-cta reveal reveal-delay-4" target="_blank" rel="noopener">
                <span>${b.cta}</span>
            </a>
        </div>
    `;
}

// ─── EFECTO TINTA DORADA (Intersection Observer optimizado) ─────
function initBlogInkEffect() {
    const section = $("#blog");
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // ★ CAMBIO 1: Umbral al 35%. Se activa cuando el bloque está realmente enfocado en pantalla
                // ★ CAMBIO 2: Pequeño delay de 200ms para que la aparición se sienta más natural y menos robótica
                setTimeout(() => {
                    section.classList.add("blog-visible");
                }, 200);
                
                // Dejamos de observar para que la animación solo ocurra una vez
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.35, // ★ Antes era 0.2. Ahora requiere que el 35% del bloque sea visible
        rootMargin: "0px 0px -50px 0px" // Ayuda a que se active justo antes de que el usuario llegue al centro
    });

    observer.observe(section);
}

// ─── PARTÍCULAS DE POLVO DORADO ────────────────────
function initBlogParticles() {
    const container = $("#blogParticles");
    if (!container) return;

    const particleCount = 25; // Cantidad de partículas (suficiente para efecto, sin lag)
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "blog-particle";
        
        // Posición aleatoria
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${50 + Math.random() * 50}%`; // Empiezan desde la mitad hacia abajo
        
        // Variables para la animación CSS
        const duration = Math.random() * 6 + 4; // 4s a 10s
        const delay = Math.random() * 5; // 0s a 5s
        const driftX = (Math.random() - 0.5) * 60; // -30px a +30px
        
        particle.style.animation = `blogParticleFloat ${duration}s ease-in-out ${delay}s infinite`;
        particle.style.setProperty("--drift-x", `${driftX}px`);
        
        container.appendChild(particle);
    }
}

// ─── PARALLAX 3D PARA EL ÍCONO DEL BLOG ────────────
function initBlogParallax() {
    const icon = $("#blogBgIcon");
    if (!icon) return;

    let ticking = false;

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const rect = icon.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                // Solo calcular si la sección está en pantalla
                if (rect.top < windowHeight && rect.bottom > 0) {
                    // Progreso de scroll (de -1 a 1)
                    const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
                    const normalizedProgress = (progress - 0.5) * 2; 
                    
                    // Movimiento vertical (Parallax clásico)
                    const translateY = normalizedProgress * -40; 
                    
                    // Inclinación 3D basada en el scroll (Profundidad)
                    const rotateX = 5 + (normalizedProgress * 8); 
                    const rotateY = -15 + (normalizedProgress * 10);
                    
                    icon.style.transform = `translateY(calc(-50% + ${translateY}px)) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

  // ─── FOOTER ──────────────────────────────
  function buildFooter() {
    if (!isBlockEnabled("footer")) {
        const section = $("#footer");
        if (section) section.style.display = "none";
        return;
  }
    const f = C.footer;
    const inner = $("#footerInner");

    // ★ FILTRAR COLUMNAS Y LINKS DEL FOOTER
    const visibleColumns = f.columns.map(col => {
        const visibleLinks = col.links.filter(link => {
            const blockId = link.href.replace("#", "");
            return isBlockEnabled(blockId);
        });
        return { ...col, links: visibleLinks };
    }).filter(col => col.links.length > 0); // Oculta la columna entera si se queda sin links
    
    inner.innerHTML = `
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-brand-name">${f.brand.name}<span>${f.brand.highlight}</span></div>
          <p class="footer-brand-desc">${f.brand.desc}</p>
        </div>
        ${f.columns.map(col => `
          <div class="footer-col">
            <h4 class="footer-col-title">${col.title}</h4>
            <ul>
              ${col.links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">${f.copyright}</span>
        <div class="footer-socials">
          ${f.socials.map(s => `<a href="${s.href}">${s.label}</a>`).join("")}
        </div>
      </div>
    `;
  }

  // ─── SCROLL REVEAL (Intersection Observer) ──
  function initReveal() {
    const els = $$(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: C.effects.revealThreshold, rootMargin: "0px 0px -50px 0px" }
    );
    els.forEach(el => observer.observe(el));
  }

  // ─── PARALLAX ENGINE ─────────────────────
  function initParallax() {
    const heroBg = $("#heroBg");
    const storyImg = $(".story-image");

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Hero parallax
      if (heroBg) {
        const heroOffset = scrollY * C.effects.parallaxHeroSpeed;
        heroBg.style.transform = `translate3d(0, ${heroOffset}px, 0) scale(1.1)`;
      }

      // Story image parallax
      if (storyImg) {
        const rect = storyImg.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          const progress = (vh - rect.top) / (vh + rect.height);
          const offset = (progress - 0.5) * rect.height * C.effects.parallaxImageSpeed;
          storyImg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
        }
      }  

      // Scroll indicator fade
      const si = $("#scrollIndicator");
      if (si) {
        si.style.opacity = clamp(1 - scrollY / 300, 0, 1);
      }

      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  // ─── CURSOR PERSONALIZADO ────────────────
  function initCursor() {
    if (!C.effects.cursorEnabled || window.innerWidth < 769) return;

    const cursor = $("#cursor");
    const follower = $("#cursorFollower");
    let mx = 0, my = 0;
    let fx = 0, fy = 0;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + "px";
      cursor.style.top = my + "px";
    });

    function animateFollower() {
      fx = lerp(fx, mx, 0.12);
      fy = lerp(fy, my, 0.12);
      follower.style.left = fx + "px";
      follower.style.top = fy + "px";
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover effect on interactive elements
    const hoverTargets = "a, button, .service-card, .gallery-item, .philosophy-cta";
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

  // ─── SMOOTH ANCHOR SCROLL ────────────────
  function initSmoothScroll() {
    document.addEventListener("click", (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      e.preventDefault();
      const target = $(anchor.getAttribute("href"));
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  // ─── GRAIN TOGGLE ────────────────────────
  function initGrain() {
    if (!C.effects.grainEnabled) {
      const grain = $(".grain-overlay");
      if (grain) grain.style.display = "none";
    }
  }

  // ─── COUNTER ANIMATION (stats) ───────────
  function initCounters() {
    const counters = $$(".story-stat-number");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const text = el.textContent;
            const match = text.match(/(\d+)/);
            if (!match) return;
            const target = parseInt(match[1]);
            const suffix = text.replace(match[1], "");
            let current = 0;
            const step = Math.ceil(target / 60);
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = current + suffix;
            }, 25);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(c => observer.observe(c));
  }

  // ─── MAGNETIC EFFECT ON CTA BUTTONS ──────
  function initMagnetic() {
    const buttons = $$(".philosophy-cta, .hero-cta, .nav-cta");
    buttons.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
        btn.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
        setTimeout(() => btn.style.transition = "", 500);
      });
    });
  }

  // ─── BLOQUE 7: CONTACTO (FORMULARIO CON ONDAS MEJORADAS) ──────────────
function buildContact() {
    if (!isBlockEnabled("contact")) {
        const section = $("#contact");
        if (section) section.style.display = "none";
        return;
    }
    const c = C.contact;
    const section = $("#contact");
    if (section) section.style.display = "flex";

    const inner = $("#contactInner");
    inner.innerHTML = `
        <!-- CAPA 1: Ondas de tinta líquida (MEJORADO) -->
        <div class="contact-waves">
            <svg viewBox="0 0 1440 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <!-- Onda 1: Más grande y lenta -->
                <path class="wave-path wave-1" 
                      d="M0,200 C240,100 480,300 720,200 C960,100 1200,300 1440,200 L1440,400 L0,400 Z" 
                      fill="var(--color-accent)" 
                      fill-opacity="0.08"/>
                
                <!-- Onda 2: Mediana -->
                <path class="wave-path wave-2" 
                      d="M0,250 C180,180 360,320 540,250 C720,180 900,320 1080,250 C1260,180 1440,320 1440,250 L1440,400 L0,400 Z" 
                      fill="var(--color-accent)" 
                      fill-opacity="0.05"/>
                
                <!-- Onda 3: Más pequeña y rápida -->
                <path class="wave-path wave-3" 
                      d="M0,280 C120,240 240,320 360,280 C480,240 600,320 720,280 C840,240 960,320 1080,280 C1200,240 1320,320 1440,280 L1440,400 L0,400 Z" 
                      fill="var(--color-accent)" 
                      fill-opacity="0.03"/>
            </svg>
        </div>
        
        <!-- CAPA 2: Partículas de polvo flotante -->
        <div class="contact-particles-container" id="contactParticles"></div>

        <!-- CAPA 3: Ícono de Sobre con Parallax 3D -->
        <div class="contact-bg-icon" id="contactBgIcon">
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <!-- Sobre base -->
                <rect x="80" y="120" width="240" height="160" rx="8" 
                      fill="none" stroke="currentColor" stroke-width="2.5"/>
                <!-- Solapa del sobre -->
                <path d="M80,120 L200,220 L320,120" 
                      fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- Líneas decorativas (texto del sobre) -->
                <line x1="120" y1="200" x2="280" y2="200" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                <line x1="120" y1="220" x2="240" y2="220" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
                <line x1="120" y1="240" x2="260" y2="240" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
                <!-- Sello decorativo -->
                <circle cx="280" cy="240" r="15" fill="currentColor" opacity="0.3"/>
                <path d="M275,240 L280,245 L288,235" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
            </svg>
        </div>
        
        <!-- CAPA 4: Formulario de Contacto -->
        <div class="contact-inner">
            <span class="section-label reveal">${c.label}</span>
            <h2 class="section-heading reveal reveal-delay-1">${c.heading}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="contact-subtitle reveal reveal-delay-3">${c.subtitle}</p>
            
            <form class="contact-form reveal reveal-delay-4" id="contactForm">
                <div class="form-group">
                    <input type="text" class="form-input" placeholder="${c.form.namePlaceholder}" required>
                </div>
                <div class="form-group">
                    <input type="email" class="form-input" placeholder="${c.form.emailPlaceholder}" required>
                </div>
                <div class="form-group">
                    <input type="text" class="form-input" placeholder="${c.form.subjectPlaceholder}" required>
                </div>
                <div class="form-group">
                    <textarea class="form-textarea" placeholder="${c.form.messagePlaceholder}" required></textarea>
                </div>
                <button type="submit" class="contact-submit">
                    <span>${c.form.submitText}</span>
                </button>
            </form>
            
            <div class="form-message" id="formMessage"></div>
        </div>
    `;

    // Inicializar efectos después de renderizar
    setTimeout(() => {
        initContactParticles();
        initContactParallax();
        initContactForm();
    }, 100);
}

// ─── PARTÍCULAS DE POLVO DORADO (CONTACTO) ────────────────────
function initContactParticles() {
    const container = $("#contactParticles");
    if (!container) return;

    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "contact-particle";
        
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${50 + Math.random() * 50}%`;
        
        const duration = Math.random() * 6 + 4;
        const delay = Math.random() * 5;
        const driftX = (Math.random() - 0.5) * 60;
        
        particle.style.animation = `contactParticleFloat ${duration}s ease-in-out ${delay}s infinite`;
        particle.style.setProperty("--drift-x", `${driftX}px`);
        
        container.appendChild(particle);
    }
}

// ─── PARALLAX 3D PARA EL ÍCONO DEL SOBRE ────────────
function initContactParallax() {
    const icon = $("#contactBgIcon");
    if (!icon) return;

    let ticking = false;

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const rect = icon.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                if (rect.top < windowHeight && rect.bottom > 0) {
                    const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
                    const normalizedProgress = (progress - 0.5) * 2;
                    
                    const translateY = normalizedProgress * -40;
                    const rotateX = -5 + (normalizedProgress * 8);
                    const rotateY = 15 + (normalizedProgress * 10);
                    
                    icon.style.transform = `translateY(calc(-50% + ${translateY}px)) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ─── FORMULARIO DE CONTACTO (FormSubmit - Sin registro) ───────────────────
function initContactForm() {
    const form = $("#contactForm");
    const messageEl = $("#formMessage");
    if (!form) return;

    // Efecto de partículas al escribir
    const inputs = $$(".form-input, .form-textarea", form);
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            input.classList.add("typing");
            clearTimeout(input.typingTimeout);
            input.typingTimeout = setTimeout(() => {
                input.classList.remove("typing");
            }, 500);
        });
    });

    // Manejar envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Mostrar estado de carga
        const submitBtn = $(".contact-submit", form);
        const originalText = submitBtn.querySelector("span").textContent;
        submitBtn.querySelector("span").textContent = "Enviando...";
        submitBtn.disabled = true;

        try {
            // ★ Enviar a FormSubmit (reemplaza TU_EMAIL@ejemplo.com con tu email real)
            const response = await fetch("https://formsubmit.co/ajax/TU_EMAIL@ejemplo.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    subject: data.subject,
                    message: data.message,
                    _subject: `Nuevo mensaje de ${data.name} - ${data.subject}`,
                    _template: "table" // Formato bonito del email
                })
            });

            const result = await response.json();

            if (result.success === "true" || response.ok) {
                messageEl.textContent = C.contact.form.successMessage;
                messageEl.className = "form-message success visible";
                form.reset();
                
                setTimeout(() => {
                    messageEl.classList.remove("visible");
                }, 5000);
            } else {
                throw new Error("Error en el envío");
            }
            
        } catch (error) {
            messageEl.textContent = C.contact.form.errorMessage;
            messageEl.className = "form-message error visible";
            
            setTimeout(() => {
                messageEl.classList.remove("visible");
            }, 5000);
        } finally {
            submitBtn.querySelector("span").textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

  // ─── INIT ────────────────────────────────
function init() {
  applyTheme();
  injectSEO();
  buildHeader();
  buildHero();
  buildStory();
  buildServices();
  buildGallery();
  buildPhilosophy();
  buildEcommerce();
  initEcommerceParticles();
  buildBlog();
  initBlogInkEffect();
  initBlogParticles();
  initBlogParallax();
  buildContact();
  buildFooter();
  initGrain();
  initProgressBar();
  initLoader();
  initTypewriter();
  initHeroStars();
  initStoryRibbon();
  initReveal();
  initParallax();
  initCursor();
  initSmoothScroll();
  initCounters();
  initGalleryCarousel();
  initGalleryParticles();
  initServicesLight();
  
  // Delay magnetic init until after loader
  setTimeout(initMagnetic, C.loader.duration + 600);
}

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ─── LISTÓN CON APARICIÓN AL SCROLL ──────────────────────
function initStoryRibbon() {
  const ribbon = $("#storyRibbon");
  if (!ribbon) return;

  ribbon.style.opacity = "0";
  ribbon.style.transition = "opacity 2s ease-out";

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ribbon.style.opacity = "1";
          ribbon.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe($("#story"));
}
  
})();