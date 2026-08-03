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
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = C.story.paragraphs[0].substring(0, 155);
    
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

    const starsContainer = document.createElement("div");
    starsContainer.className = "hero-stars";
    hero.appendChild(starsContainer);

    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const duration = Math.random() * 4 + 2;
      const delay = Math.random() * 5;
      const minOpacity = Math.random() * 0.3 + 0.1;
      const maxOpacity = Math.random() * 0.5 + 0.5;
      const glowSize = size * 3;

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

  // ─── LOADER CON TÍTULO QUE SE RELLENA ───
  function initLoader() {
    const loader = $("#loader");
    const titleFill = $("#loaderTitleFill");
    const percentage = $("#loaderPercentage");

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 3;
      if (progress > 100) progress = 100;
      
      if (titleFill) titleFill.style.width = progress + "%";
      if (percentage) percentage.textContent = Math.round(progress) + "%";
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add("hidden");
          setTimeout(() => {
            if (isBlockEnabled("hero")) animateHero();
          }, 800);
        }, 600);
      }
    }, C.loader.duration / 8);
  }

  // ─── HEADER ──────────────────────────────
  function buildHeader() {
    const nav = $("#nav");
    const h = C.header;
    
    const visibleLinks = h.links.filter(link => {
      const blockId = link.href.replace("#", "");
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
  
    const hamburger = $("#hamburger");
    const navLinks = $("#navLinks");
    const header = $("#header");
    
    hamburger.addEventListener("click", () => {
      const isOpen = navLinks.classList.contains("open");
      if (isOpen) {
        navLinks.classList.remove("open");
        hamburger.classList.remove("active");
        header.classList.remove("menu-open");
        document.body.style.overflow = "";
      } else {
        hamburger.classList.add("active");
        navLinks.classList.add("open");
        header.classList.add("menu-open");
        document.body.style.overflow = "hidden";
      }
    });

    $$(".nav-links a").forEach(a => {
      a.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("open");
        header.classList.remove("menu-open");
        document.body.style.overflow = "";
      });
    });

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
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = pauseStart;
      }
      setTimeout(tick, speed);
    }
    setTimeout(() => tick(), 1800);
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
      <div class="story-ribbon" id="storyRibbon">
        <svg viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="ribbon-path" d="M380,0 C350,100 320,200 340,300 C360,400 300,500 280,600 C260,700 300,750 320,800" stroke="var(--color-accent)" stroke-width="2" fill="none" opacity="0.3"/>
          <path class="ribbon-path-shadow" d="M380,0 C350,100 320,200 340,300 C360,400 300,500 280,600 C260,700 300,750 320,800" stroke="var(--color-accent)" stroke-width="8" fill="none" opacity="0.08"/>
        </svg>
      </div>
      <div class="story-grid">
        <div class="story-image-wrapper reveal-left">
          <img class="story-image" 
         src="${s.image}" 
         alt="${s.label}" 
         loading="lazy" 
         decoding="async" />
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

  // ─── LUZ QUE CAE EN SERVICIOS ───────────
  function initServicesLight() {
    const servicesSection = $("#services");
    if (!servicesSection) return;

    const lightContainer = document.createElement("div");
    lightContainer.className = "services-light-container";
    const servicesInner = $("#servicesInner");
    servicesInner.insertBefore(lightContainer, servicesInner.firstChild);

    const lightBeam = document.createElement("div");
    lightBeam.className = "light-beam";
    lightContainer.appendChild(lightBeam);

    const ambientGlow = document.createElement("div");
    ambientGlow.className = "services-ambient-glow";
    lightContainer.appendChild(ambientGlow);

    const heading = $(".services-header .section-heading");
    const maxParticles = 15;
    const particles = [];

    function createParticle() {
      if (particles.length >= maxParticles) return;
      const particle = document.createElement("div");
      particle.className = "light-particle";
      const startX = 30 + Math.random() * 40;
      particle.style.left = startX + "%";
      particle.style.top = "-10%";
      const size = Math.random() * 2 + 1;
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      const duration = Math.random() * 6 + 2;
      const delay = Math.random() * 2;
      const driftX = (Math.random() - 0.5) * 100;

      particle.style.setProperty("--fall-duration", duration + "s");
      particle.style.setProperty("--fall-delay", delay + "s");
      particle.style.setProperty("--drift-x", driftX + "px");
      lightContainer.appendChild(particle);
      particles.push(particle);

      setTimeout(() => particle.classList.add("animate"), 50);
      setTimeout(() => {
        particle.remove();
        const index = particles.indexOf(particle);
        if (index > -1) particles.splice(index, 1);
      }, (duration + delay) * 1000);
    }

    function scheduleNextParticle() {
      const delay = Math.random() * 1500 + 1000;
      setTimeout(() => {
        createParticle();
        scheduleNextParticle();
      }, delay);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            lightBeam.classList.add("active");
            ambientGlow.classList.add("active");
            if (heading) heading.classList.add("glow-active");
            scheduleNextParticle();
          }, 500);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(servicesSection);
  }

  // ─── BLOQUE 3: GALERÍA (CARRUSEL) ───────
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
              <div class="gallery-slide-light"></div>
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
    setTimeout(() => initGalleryParticles(), 100);
  }

  function initGalleryParticles() {
    const slides = $$(".gallery-slide");
    slides.forEach((slide, index) => {
      const particlesContainer = $(`#galleryParticles-${index}`);
      if (!particlesContainer) return;
      
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement("div");
        particle.className = "gallery-particle";
        const x = Math.random() * 100;
        const y = 50 + Math.random() * 50;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        const driftX = (Math.random() - 0.5) * 40;
        
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.animation = `galleryParticleFloat ${duration}s ease-in-out ${delay}s infinite`;
        particle.style.setProperty("--drift-x", `${driftX}px`);
        particlesContainer.appendChild(particle);
      }
      
      slide.addEventListener("mousemove", (e) => {
        const rect = slide.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const light = $(".gallery-slide-light", slide);
        if (light) {
          light.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(201, 169, 110, 0.3) 0%, rgba(201, 169, 110, 0.1) 30%, transparent 60%)`;
        }
      });
    });
  }

  // ─── CARRUSEL PARALLAX DE GALERÍA (SNAP AUTOMÁTICO & CERO TEMBLOR) ─────────────────
function initGalleryCarousel() {
    const wrapper = $("#galleryCarouselWrapper");
    const carousel = $("#galleryCarousel");
    const progressFill = $("#galleryProgressFill");
    if (!wrapper || !carousel) return;

    const slides = $$(".gallery-slide", carousel);
    
    let isDragging = false;
    let startX = 0;
    let startTranslate = 0;
    let currentTranslate = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let rafId = null;
    let snapPositions = []; // Almacena la posición exacta para centrar cada tarjeta

    // 1. Calcular posiciones exactas de "Snap" (Centrado matemático)
    function calculateSnapPositions() {
        snapPositions = [];
        const wrapperCenter = wrapper.offsetWidth / 2;
        const paddingLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;

        slides.forEach(slide => {
            // Centro visual de la tarjeta respecto al contenedor
            const slideVisualCenter = paddingLeft + slide.offsetLeft + (slide.offsetWidth / 2);
            // Cuánto debemos mover el carrusel para alinear ese centro con el centro del wrapper
            let targetX = wrapperCenter - slideVisualCenter;
            snapPositions.push(targetX);
        });
    }

    // 2. Obtener límites físicos del carrusel
    function getLimits() {
        const maxTranslate = 0; // Tope izquierdo
        const minTranslate = -(carousel.scrollWidth - wrapper.offsetWidth); // Tope derecho
        return { minTranslate, maxTranslate };
    }

    // 3. Actualizar DOM (Posición + Efectos Visuales Originales)
    function updateVisuals(x, isSnapping = false) {
        const { minTranslate, maxTranslate } = getLimits();
        
        // Efecto "goma" si se arrastra más allá de los límites
        let finalX = x;
        if (!isSnapping) {
            if (x > maxTranslate) finalX = maxTranslate + (x - maxTranslate) * 0.3;
            else if (x < minTranslate) finalX = minTranslate + (x - minTranslate) * 0.3;
        } else {
            finalX = Math.max(minTranslate, Math.min(maxTranslate, x));
        }

        currentTranslate = finalX;

        // Activar/Desactivar transición CSS solo para el Snap
        if (isSnapping) {
            carousel.classList.add("is-snapping");
        } else {
            carousel.classList.remove("is-snapping");
        }

        carousel.style.transform = `translate3d(${finalX}px, 0, 0)`;

        // Efectos internos (Parallax, Escala, Opacidad) - Se mantienen intactos
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
        
        slides.forEach(slide => {
            const rect = slide.getBoundingClientRect();
            const slideCenterX = rect.left + rect.width / 2;
            const distance = slideCenterX - wrapperCenterX;
            const normalized = distance / (wrapperRect.width / 2);
            
            const img = $(".gallery-slide-img", slide);
            if (img) {
                const parallaxOffset = normalized * 30;
                img.style.transform = `translate3d(${parallaxOffset}px, 0, 0) scale(1.2)`;
            }
            
            const scale = 1 - Math.abs(normalized) * 0.15;
            const opacity = 1 - Math.abs(normalized) * 0.4;
            slide.style.transform = `scale(${clamp(scale, 0.85, 1)})`;
            slide.style.opacity = clamp(opacity, 0.5, 1);
        });

        // Barra de progreso
        if (progressFill && minTranslate !== 0) {
            const progress = Math.abs(finalX) / Math.abs(minTranslate);
            progressFill.style.width = (clamp(progress, 0, 1) * 100) + "%";
        }
    }

        // --- EVENTOS DE ARRASTRE (BLINDADOS) ---
    function getX(e) {
        return e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    }

    function onStart(e) {
        // ★ CLAVE: Evitar que el navegador inicie el arrastre nativo de la imagen al hacer clic sostenido
        if (e.type === 'mousedown') {
            e.preventDefault();
        }
        
        isDragging = true;
        startX = getX(e);
        startTranslate = currentTranslate;
        lastX = startX;
        lastTime = Date.now();
        velocity = 0;
        if (rafId) cancelAnimationFrame(rafId);
        carousel.classList.remove("is-snapping");
    }

    function onMove(e) {
        if (!isDragging) return;
        
        // ★ Solo prevenir default en táctil para no bloquear el scroll vertical de la página
        if (e.type === 'touchmove' && e.cancelable) {
            e.preventDefault();
        }

        const x = getX(e);
        const deltaX = x - startX;
        const now = Date.now();
        const dt = now - lastTime;

        if (dt > 0) {
            velocity = (x - lastX) / dt * 16;
            velocity = clamp(velocity, -50, 50); // Limitar velocidad máxima
        }

        lastX = x;
        lastTime = now;

        // ★ USAR requestAnimationFrame para agrupar lecturas/escrituras y evitar el temblor
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                updateVisuals(startTranslate + deltaX, false);
                rafId = null;
            });
        }
    }

    function onEnd() {
        if (!isDragging) return;
        isDragging = false;

        // Proyección de inercia: ¿Hacia dónde iba el dedo?
        let projected = currentTranslate + (velocity * 15);
        
        // Buscar el punto de Snap más cercano a esa proyección
        let closestSnap = snapPositions[0];
        let minDistance = Infinity;

        snapPositions.forEach(pos => {
            const dist = Math.abs(projected - pos);
            if (dist < minDistance) {
                minDistance = dist;
                closestSnap = pos;
            }
        });

        // Ejecutar animación de centrado automático
        updateVisuals(closestSnap, true);
    }

    // Limpiar clase de transición cuando termine la animación CSS
    carousel.addEventListener("transitionend", () => {
        carousel.classList.remove("is-snapping");
    });

    // Bind Events
    wrapper.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    wrapper.addEventListener("mouseleave", onEnd);

    wrapper.addEventListener("touchstart", onStart, { passive: true });
    wrapper.addEventListener("touchmove", onMove, { passive: false });
    wrapper.addEventListener("touchend", onEnd);

    // Evitar clicks accidentales tras arrastrar
    slides.forEach(slide => {
        slide.addEventListener("click", (e) => {
            if (Math.abs(velocity) > 2) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    });

    // Inicializar
    function init() {
        calculateSnapPositions();
        updateVisuals(snapPositions[0] || 0, true);
    }

    init();

    // Recalcular en resize
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            calculateSnapPositions();
            // Encontrar el snap más cercano a la posición actual y reajustar
            let closest = snapPositions[0];
            let min = Infinity;
            snapPositions.forEach(pos => {
                if (Math.abs(currentTranslate - pos) < min) {
                    min = Math.abs(currentTranslate - pos);
                    closest = pos;
                }
            });
            updateVisuals(closest, true);
        }, 200);
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
    const section = $("#philosophy");
    if (!p.enabled) {
      if (section) section.style.display = "none";
      return;
    }
    if (section) section.style.display = "flex";

    const inner = $("#philosophyInner");
    inner.innerHTML = `
      <div class="philosophy-inner">
        <span class="section-label reveal">${p.label}</span>
        <hr class="editorial-hr center reveal reveal-delay-1" />
        <blockquote class="philosophy-quote reveal reveal-delay-2">${p.quote}</blockquote>
        <p class="philosophy-author reveal reveal-delay-3">${p.author}</p>
        <a href="${p.ctaHref}" class="philosophy-cta reveal reveal-delay-4"><span>${p.cta}</span></a>
      </div>
    `;
  }

  // ─── BLOQUE 5: E-COMMERCE ───────────────
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
      <div class="ecommerce-bg-icon">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M100,140 L100,360 Q100,380 120,380 L280,380 Q300,380 300,360 L300,140 Z" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M140,140 L140,100 Q140,60 200,60 Q260,60 260,100 L260,140" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          <line x1="100" y1="180" x2="300" y2="180" stroke="currentColor" stroke-width="2" opacity="0.5"/>
          <circle cx="160" cy="240" r="8" fill="currentColor" opacity="0.3"/>
          <circle cx="240" cy="280" r="6" fill="currentColor" opacity="0.25"/>
          <circle cx="200" cy="320" r="10" fill="currentColor" opacity="0.2"/>
          <line x1="150" y1="260" x2="180" y2="260" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
          <line x1="220" y1="300" x2="260" y2="300" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
        </svg>
      </div>
      <div class="ecommerce-inner">
        <span class="section-label reveal">${e.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${e.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="ecommerce-subtitle reveal reveal-delay-3">${e.subtitle}</p>
        <a href="${e.ctaHref}" class="ecommerce-cta reveal reveal-delay-4"><span>${e.cta}</span></a>
      </div>
    `;
  }

  function initEcommerceParticles() {
    const section = $("#ecommerce");
    if (!section) return;
    const particlesContainer = document.createElement("div");
    particlesContainer.className = "ecommerce-particles";
    section.appendChild(particlesContainer);

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "ecommerce-particle";
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        --particle-duration: ${Math.random() * 8 + 6}s;
        --particle-delay: ${Math.random() * 5}s;
      `;
      particlesContainer.appendChild(particle);
    }

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

  // ─── BLOQUE 6: BLOG (TINTA DORADA) ──────
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
      <div class="blog-ink-bg"></div>
      <div class="blog-particles-container" id="blogParticles"></div>
      <div class="blog-bg-icon" id="blogBgIcon">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M200,320 L200,100 C160,80 120,90 100,100 L100,300 C120,290 160,280 200,320 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M200,320 L200,100 C240,80 280,90 300,100 L300,300 C280,290 240,280 200,320 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
          <line x1="130" y1="150" x2="180" y2="160" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
          <line x1="130" y1="190" x2="170" y2="200" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
          <line x1="130" y1="230" x2="180" y2="240" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
          <line x1="220" y1="160" x2="270" y2="150" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
          <line x1="230" y1="200" x2="270" y2="190" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
          <circle cx="150" cy="280" r="3" fill="currentColor" opacity="0.5"/>
          <circle cx="250" cy="270" r="4" fill="currentColor" opacity="0.3"/>
          <path d="M140,270 Q150,260 160,275" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
        </svg>
      </div>
      <div class="blog-inner">
        <span class="section-label reveal">${b.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${b.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="blog-subtitle reveal reveal-delay-3">${b.subtitle}</p>
        <a href="${b.ctaHref}" class="blog-cta reveal reveal-delay-4"><span>${b.cta}</span></a>
      </div>
    `;
  }

  function initBlogInkEffect() {
    const section = $("#blog");
    if (!section) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => section.classList.add("blog-visible"), 200);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -50px 0px" });
    observer.observe(section);
  }

  function initBlogParticles() {
    const container = $("#blogParticles");
    if (!container) return;
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement("div");
      particle.className = "blog-particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${50 + Math.random() * 50}%`;
      const duration = Math.random() * 6 + 4;
      const delay = Math.random() * 5;
      const driftX = (Math.random() - 0.5) * 60;
      particle.style.animation = `blogParticleFloat ${duration}s ease-in-out ${delay}s infinite`;
      particle.style.setProperty("--drift-x", `${driftX}px`);
      container.appendChild(particle);
    }
  }

  function initBlogParallax() {
    const icon = $("#blogBgIcon");
    if (!icon) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = icon.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const normalizedProgress = (progress - 0.5) * 2;
            const translateY = normalizedProgress * -40;
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

  // ─── BLOQUE 7: CONTACTO (FORMULARIO) ────
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
      <div class="contact-waves">
        <svg viewBox="0 0 1440 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path class="wave-path wave-1" d="M0,200 C240,100 480,300 720,200 C960,100 1200,300 1440,200 L1440,400 L0,400 Z" fill="var(--color-accent)" fill-opacity="0.08"/>
          <path class="wave-path wave-2" d="M0,250 C180,180 360,320 540,250 C720,180 900,320 1080,250 C1260,180 1440,320 1440,250 L1440,400 L0,400 Z" fill="var(--color-accent)" fill-opacity="0.05"/>
          <path class="wave-path wave-3" d="M0,280 C120,240 240,320 360,280 C480,240 600,320 720,280 C840,240 960,320 1080,280 C1200,240 1320,320 1440,280 L1440,400 L0,400 Z" fill="var(--color-accent)" fill-opacity="0.03"/>
        </svg>
      </div>
      <div class="contact-particles-container" id="contactParticles"></div>
      <div class="contact-bg-icon" id="contactBgIcon">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <rect x="80" y="120" width="240" height="160" rx="8" fill="none" stroke="currentColor" stroke-width="2.5"/>
          <path d="M80,120 L200,220 L320,120" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
          <line x1="120" y1="200" x2="280" y2="200" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
          <line x1="120" y1="220" x2="240" y2="220" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
          <line x1="120" y1="240" x2="260" y2="240" stroke="currentColor" stroke-width="1.5" opacity="0.2"/>
          <circle cx="280" cy="240" r="15" fill="currentColor" opacity="0.3"/>
          <path d="M275,240 L280,245 L288,235" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/>
        </svg>
      </div>
      <div class="contact-inner">
        <span class="section-label reveal">${c.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${c.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="contact-subtitle reveal reveal-delay-3">${c.subtitle}</p>
        <form class="contact-form reveal reveal-delay-4" id="contactForm">
          <div class="form-group">
            <input type="text" class="form-input" name="name" placeholder="${c.form.namePlaceholder}" required>
          </div>
          <div class="form-group">
            <input type="email" class="form-input" name="email" placeholder="${c.form.emailPlaceholder}" required>
          </div>
          <div class="form-group">
            <input type="text" class="form-input" name="subject" placeholder="${c.form.subjectPlaceholder}" required>
          </div>
          <div class="form-group">
            <textarea class="form-textarea" name="message" placeholder="${c.form.messagePlaceholder}" required></textarea>
          </div>
          <button type="submit" class="contact-submit"><span>${c.form.submitText}</span></button>
        </form>
        <div class="form-message" id="formMessage"></div>
      </div>
    `;
    setTimeout(() => {
      initContactParticles();
      initContactParallax();
      initContactForm();
    }, 100);
  }

  function initContactParticles() {
    const container = $("#contactParticles");
    if (!container) return;
    for (let i = 0; i < 20; i++) {
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

  function initContactParallax() {
    const icon = $("#contactBgIcon");
    if (!icon) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = icon.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
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

  function initContactForm() {
    const form = $("#contactForm");
    const messageEl = $("#formMessage");
    if (!form) return;

    const inputs = $$(".form-input, .form-textarea", form);
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        input.classList.add("typing");
        clearTimeout(input.typingTimeout);
        input.typingTimeout = setTimeout(() => input.classList.remove("typing"), 500);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      const submitBtn = $(".contact-submit", form);
      const originalText = submitBtn.querySelector("span").textContent;
      submitBtn.querySelector("span").textContent = "Enviando...";
      submitBtn.disabled = true;

      try {
        // ★ IMPORTANTE: Reemplaza "TU_EMAIL@ejemplo.com" con tu correo real
        const response = await fetch(C.email?.formSubmitUrl || "https://formsubmit.co/ajax/hola@studio.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            _subject: `Nuevo mensaje de ${data.name} - ${data.subject}`,
            _template: "table"
          })
        });

        const result = await response.json();
        if (result.success === "true" || response.ok) {
          messageEl.textContent = C.contact.form.successMessage;
          messageEl.className = "form-message success visible";
          form.reset();
          setTimeout(() => messageEl.classList.remove("visible"), 5000);
        } else {
          throw new Error("Error en el envío");
        }
      } catch (error) {
        messageEl.textContent = C.contact.form.errorMessage;
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
      } finally {
        submitBtn.querySelector("span").textContent = originalText;
        submitBtn.disabled = false;
      }
    });
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
    const visibleColumns = f.columns.map(col => {
      const visibleLinks = col.links.filter(link => isBlockEnabled(link.href.replace("#", "")));
      return { ...col, links: visibleLinks };
    }).filter(col => col.links.length > 0);
    
    inner.innerHTML = `
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-brand-name">${f.brand.name}<span>${f.brand.highlight}</span></div>
          <p class="footer-brand-desc">${f.brand.desc}</p>
        </div>
        ${visibleColumns.map(col => `
          <div class="footer-col">
            <h4 class="footer-col-title">${col.title}</h4>
            <ul>${col.links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}</ul>
          </div>
        `).join("")}
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">${f.copyright}</span>
        <div class="footer-socials">${C.socials.map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join("")}</div>
      </div>
    `;
  }

  // ─── SCROLL REVEAL ───────────────────────
  function initReveal() {
    const els = $$(".reveal, .reveal-left, .reveal-right, .reveal-scale");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: C.effects.revealThreshold, rootMargin: "0px 0px -50px 0px" });
    els.forEach(el => observer.observe(el));
  }

  // ─── PARALLAX ENGINE ─────────────────────
  function initParallax() {
    const heroBg = $("#heroBg");
    const storyImg = $(".story-image");
    let lastScroll = 0;
  const throttle = 16; // ~60fps
    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      if (heroBg) heroBg.style.transform = `translate3d(0, ${scrollY * C.effects.parallaxHeroSpeed}px, 0) scale(1.1)`;
      if (storyImg) {
        const rect = storyImg.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          storyImg.style.transform = `translate3d(0, ${(progress - 0.5) * rect.height * C.effects.parallaxImageSpeed}px, 0) scale(1.15)`;
        }
      }  
      const si = $("#scrollIndicator");
      if (si) si.style.opacity = clamp(1 - scrollY / 300, 0, 1);
      ticking = false;
    }

    window.addEventListener("scroll", () => {
    const now = Date.now();
    if (now - lastScroll >= throttle) {
      lastScroll = now;
      updateParallax();
    }
  }, { passive: true });
  }

  // ─── CURSOR PERSONALIZADO ────────────────
  function initCursor() {
    if (!C.effects.cursorEnabled || window.innerWidth < 769) return;
    const cursor = $("#cursor");
    const follower = $("#cursorFollower");
    let mx = 0, my = 0, fx = 0, fy = 0;

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
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    });
  }

  // ─── GRAIN TOGGLE ────────────────────────
  function initGrain() {
    if (!C.effects.grainEnabled) {
      const grain = $(".grain-overlay");
      if (grain) grain.style.display = "none";
    }
  }

  // ─── COUNTER ANIMATION ───────────────────
  function initCounters() {
    const counters = $$(".story-stat-number");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const match = el.textContent.match(/(\d+)/);
          if (!match) return;
          const target = parseInt(match[1]);
          const suffix = el.textContent.replace(match[1], "");
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
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }

  // ─── MAGNETIC EFFECT ─────────────────────
  function initMagnetic() {
    const buttons = $$(".philosophy-cta, .hero-cta, .nav-cta");
    buttons.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.2}px, ${(e.clientY - rect.top - rect.height / 2) * 0.2}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0, 0)";
        btn.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
        setTimeout(() => btn.style.transition = "", 500);
      });
    });
  }

  // ─── INIT ────────────────────────────────
  function init() {
    const isMobile = window.innerWidth < 768;

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
    if (!isMobile) {
    initParallax();
    initCursor();
    }
    initGalleryCarousel();
    initSmoothScroll();
    initCounters();
    initGalleryParticles();
    initServicesLight();
    setTimeout(initMagnetic, C.loader.duration + 600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ─── LISTÓN CON APARICIÓN AL SCROLL ──────
  function initStoryRibbon() {
    const ribbon = $("#storyRibbon");
    if (!ribbon) return;
    ribbon.style.opacity = "0";
    ribbon.style.transition = "opacity 2s ease-out";
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ribbon.style.opacity = "1";
          ribbon.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe($("#story"));
  }
})();