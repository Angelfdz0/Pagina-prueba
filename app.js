/* ============================================================
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

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isBlockEnabled(blockName) {
    return C[blockName]?.enabled !== false;
  }

    // ✅ Utilidades para testimonios
  function escapeHtml(str) {
      if (!str) return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
  }
  function initials(name) {
      return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
  const SOURCE_ICONS = {
      instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
      whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
      google: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 11v3.6h5.1c-.5 2.4-2.6 3.9-5.1 3.9a5.5 5.5 0 1 1 0-11c1.4 0 2.7.5 3.7 1.4l2.7-2.7A9.2 9.2 0 1 0 12 21.2c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.2-.2-1.2H12z"/></svg>'
  };

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
    const firstParagraph = C.story?.paragraphs?.[0];
    const description = firstParagraph
      ? firstParagraph.substring(0, 155)
      : C.hero?.subtitle || "Estudio creativo especializado en diseño digital, branding y desarrollo web.";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.content = description;

    const ogImage = C.hero?.backgroundImage || "";
    const ogTags = {
      'og:title': (C.header?.logo?.text || "") + (C.header?.logo?.highlight || ""),
      'og:description': C.hero?.subtitle || description,
      'og:type': 'website'
    };
    if (ogImage) ogTags['og:image'] = ogImage;

    for (const [key, value] of Object.entries(ogTags)) {
      if (!value) continue;
      let tag = document.querySelector(`meta[property="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', key);
        document.head.appendChild(tag);
      }
      tag.content = value;
    }
  }

  // ─── HERO STARS ──────────────────────────
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

    function updateProgress() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) {
        bar.style.width = "0%";
        return;
      }
      const progress = clamp(window.scrollY / h, 0, 1);
      bar.style.width = (progress * 100) + "%";
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();
  }

  // ─── LOADER ──────────────────────────────
  function initLoader() {
    const loader = $("#loader");
    const titleFill = $("#loaderTitleFill");
    const percentage = $("#loaderPercentage");

    if (!loader) {
      if (isBlockEnabled("hero")) animateHero();
      return;
    }

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
  if (!nav) return;
  const h = C.header;
  if (!h) return;

  const visibleLinks = (h.links || []).filter(link => {
    const href = link.href || "";
    if (href.startsWith("#") && href.length > 1) {
      const blockId = href.replace("#", "");
      return isBlockEnabled(blockId);
    }
    return true;
  });

  // ✅ Límite inteligente: primeros N en línea, resto en "MÁS"
  const maxLinks = typeof h.maxLinks === "number" ? h.maxLinks : 5;
  const extraLinks = visibleLinks.slice(maxLinks);

  nav.innerHTML = `
    <a href="#hero" class="nav-logo">${h.logo.text}<span>${h.logo.highlight}</span></a>
    <ul class="nav-links" id="navLinks">
      ${visibleLinks.map((l, i) =>
        `<li><a href="${l.href}" class="${i >= maxLinks ? "nav-link-extra" : ""}">${l.label}</a></li>`
      ).join("")}
      ${extraLinks.length ? `
      <li class="nav-more" id="navMore">
        <button class="nav-more-btn" id="navMoreBtn" aria-haspopup="true" aria-expanded="false">
          Más
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="nav-more-panel" id="navMorePanel">
          ${extraLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join("")}
        </div>
      </li>` : ""}
    </ul>
    <a href="${h.cta.href}" class="nav-cta">${h.cta.label}</a>
    <button class="nav-hamburger" id="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  `;

  const hamburger = $("#hamburger");
  const navLinks = $("#navLinks");
  const header = $("#header");
  const moreWrap = $("#navMore");
  const moreBtn = $("#navMoreBtn");

  if (hamburger && navLinks && header) {
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
  }

  // ✅ Menú "MÁS" (abrir/cerrar)
  if (moreWrap && moreBtn) {
    const closeMore = () => {
      moreWrap.classList.remove("open");
      moreBtn.setAttribute("aria-expanded", "false");
    };
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = moreWrap.classList.toggle("open");
      moreBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      if (moreWrap.classList.contains("open") && !moreWrap.contains(e.target)) closeMore();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMore();
    });
    $$("#navMorePanel a").forEach(a => a.addEventListener("click", closeMore));
  }

  $$(".nav-links a").forEach(a => {
    a.addEventListener("click", () => {
      if (hamburger) hamburger.classList.remove("active");
      if (navLinks) navLinks.classList.remove("open");
      if (header) header.classList.remove("menu-open");
      document.body.style.overflow = "";
    });
  });

  window.addEventListener("scroll", () => {
    const headerEl = $("#header");
    if (headerEl) headerEl.classList.toggle("scrolled", window.scrollY > 80);
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

    if (bg) bg.style.backgroundImage = `url(${h.backgroundImage})`;
    if (!content) return;

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
      if (eyebrow) {
        eyebrow.style.transition = "opacity 1s, transform 1s cubic-bezier(0.16,1,0.3,1)";
        eyebrow.style.opacity = "1";
        eyebrow.style.transform = "translateY(0)";
      }
    }, 100);

    setTimeout(() => {
      const sub = $(".hero-subtitle");
      if (sub) {
        sub.style.transition = "opacity 1s, transform 1s cubic-bezier(0.16,1,0.3,1)";
        sub.style.opacity = "1";
        sub.style.transform = "translateY(0)";
      }
    }, 700);

    setTimeout(() => {
      const cta = $(".hero-cta");
      if (cta) {
        cta.style.transition = "opacity 1s, transform 1s cubic-bezier(0.16,1,0.3,1)";
        cta.style.opacity = "1";
        cta.style.transform = "translateY(0)";
      }
    }, 900);

    setTimeout(() => {
      const si = $("#scrollIndicator");
      if (si) {
        si.style.transition = "opacity 1s";
        si.style.opacity = "1";
      }
    }, 1400);
  }

  // ─── TYPEWRITER ──────────────────────────
  function initTypewriter() {
    if (!isBlockEnabled("hero")) return;
    const words = C.hero?.title?.typewriterWords;
    if (!words || !Array.isArray(words) || words.length === 0) return;

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
    if (!inner) return;

    inner.innerHTML = `
      <div class="story-ribbon" id="storyRibbon">
        <svg viewBox="0 0 400 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="ribbon-path" d="M380,0 C350,100 320,200 340,300 C360,400 300,500 280,600 C260,700 300,750 320,800" stroke="var(--color-accent)" stroke-width="2" fill="none" opacity="0.3"/>
          <path class="ribbon-path-shadow" d="M380,0 C350,100 320,200 340,300 C360,400 300,500 280,600 C260,700 300,750 320,800" stroke="var(--color-accent)" stroke-width="8" fill="none" opacity="0.08"/>
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
    if (!inner) return;

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
    let particleTimer = null;
    let activationTimer = null;
    let particlesActive = false;

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
      if (!particlesActive) return;
      const delay = Math.random() * 1500 + 1000;
      particleTimer = setTimeout(() => {
        createParticle();
        particleTimer = null;
        scheduleNextParticle();
      }, delay);
    }

    function startParticles() {
      if (particlesActive) return;
      particlesActive = true;
      scheduleNextParticle();
    }

    function stopParticles() {
      particlesActive = false;
      if (particleTimer) {
        clearTimeout(particleTimer);
        particleTimer = null;
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          clearTimeout(activationTimer);
          activationTimer = setTimeout(() => {
            lightBeam.classList.add("active");
            ambientGlow.classList.add("active");
            if (heading) heading.classList.add("glow-active");
            startParticles();
          }, 500);
        } else {
          clearTimeout(activationTimer);
          stopParticles();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(servicesSection);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopParticles();
      } else {
        const rect = servicesSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) startParticles();
      }
    });
  }

  // ─── BLOQUE 3: GALERÍA ──────────────────
  function buildGallery() {
    if (!isBlockEnabled("gallery")) {
      const section = $("#gallery");
      if (section) section.style.display = "none";
      return;
    }
    const g = C.gallery;
    const inner = $("#galleryInner");
    if (!inner) return;

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

  // ─── CARRUSEL PARALLAX DE GALERÍA ───────
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
    let snapPositions = [];
    let snapAnimating = false;
    let snapFallbackTimer = null;

    function calculateSnapPositions() {
      snapPositions = [];
      const wrapperCenter = wrapper.offsetWidth / 2;
      const paddingLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;

      slides.forEach(slide => {
        const slideVisualCenter = paddingLeft + slide.offsetLeft + (slide.offsetWidth / 2);
        let targetX = wrapperCenter - slideVisualCenter;
        snapPositions.push(targetX);
      });
    }

    function getLimits() {
      const maxTranslate = 0;
      const minTranslate = -(carousel.scrollWidth - wrapper.offsetWidth);
      return { minTranslate, maxTranslate };
    }

    function updateVisuals(x, isSnapping = false) {
      const { minTranslate, maxTranslate } = getLimits();

      let finalX = x;
      if (!isSnapping) {
        if (x > maxTranslate) finalX = maxTranslate + (x - maxTranslate) * 0.3;
        else if (x < minTranslate) finalX = minTranslate + (x - minTranslate) * 0.3;
      } else {
        finalX = Math.max(minTranslate, Math.min(maxTranslate, x));
      }

      currentTranslate = finalX;

      if (isSnapping) carousel.classList.add("is-snapping");
      else carousel.classList.remove("is-snapping");

      carousel.style.transform = `translate3d(${finalX}px, 0, 0)`;

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

      if (progressFill && minTranslate !== 0) {
        const progress = Math.abs(finalX) / Math.abs(minTranslate);
        progressFill.style.width = (clamp(progress, 0, 1) * 100) + "%";
      }
    }

    function getX(e) {
      return e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    }

    function onStart(e) {
      if (e.type === 'mousedown') e.preventDefault();
      isDragging = true;
      startX = getX(e);
      startTranslate = currentTranslate;
      lastX = startX;
      lastTime = Date.now();
      velocity = 0;
      if (rafId) cancelAnimationFrame(rafId);
      carousel.classList.remove("is-snapping");
      snapAnimating = false;
      clearTimeout(snapFallbackTimer);
    }

    function onMove(e) {
      if (!isDragging) return;
      if (e.type === 'touchmove' && e.cancelable) e.preventDefault();

      const x = getX(e);
      const deltaX = x - startX;
      const now = Date.now();
      const dt = now - lastTime;

      if (dt > 0) {
        velocity = (x - lastX) / dt * 16;
        velocity = clamp(velocity, -50, 50);
      }

      lastX = x;
      lastTime = now;

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

      const projected = currentTranslate + (velocity * 15);
      const closestSnap = getClosestSnap(projected);

      snapAnimating = true;
      updateVisuals(closestSnap, true);

      clearTimeout(snapFallbackTimer);
      snapFallbackTimer = setTimeout(() => {
        if (snapAnimating) {
          carousel.classList.remove("is-snapping");
          snapAnimating = false;
          velocity = 0;
        }
      }, 900);
    }

    carousel.addEventListener("transitionend", (e) => {
      if (e.target !== carousel) return;
      carousel.classList.remove("is-snapping");
      snapAnimating = false;
      velocity = 0;
      clearTimeout(snapFallbackTimer);
    });

    wrapper.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    wrapper.addEventListener("mouseleave", onEnd);

    wrapper.addEventListener("touchstart", onStart, { passive: true });
    wrapper.addEventListener("touchmove", onMove, { passive: false });
    wrapper.addEventListener("touchend", onEnd);

    slides.forEach(slide => {
      slide.addEventListener("click", (e) => {
        if (isDragging || snapAnimating || Math.abs(velocity) > 2) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
    });

    function recalculateWhenImagesLoad() {
      const images = $$(".gallery-slide-img", carousel);
      if (!images.length) return;

      let remaining = images.length;
      let finished = false;

      const done = () => {
        if (finished) return;
        remaining -= 1;
        if (remaining <= 0) {
          finished = true;
          calculateSnapPositions();
          if (!isDragging && !snapAnimating) {
            updateVisuals(getClosestSnap(currentTranslate), true);
          }
        }
      };

      images.forEach(img => {
        if (img.complete) done();
        else {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }
      });
    }

    function getClosestSnap(x) {
      let closest = snapPositions[0] || 0;
      let minDistance = Infinity;
      snapPositions.forEach(pos => {
        const dist = Math.abs(x - pos);
        if (dist < minDistance) {
          minDistance = dist;
          closest = pos;
        }
      });
      return closest;
    }

    function init() {
      calculateSnapPositions();
      updateVisuals(snapPositions[0] || 0, true);
    }

    init();
    recalculateWhenImagesLoad();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        calculateSnapPositions();
        if (!isDragging && !snapAnimating) {
          updateVisuals(getClosestSnap(currentTranslate), true);
        }
      });
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateSnapPositions();
        updateVisuals(getClosestSnap(currentTranslate), true);
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
    if (!inner) return;

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
    if (!inner) return;

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

   // ─── BLOQUE: TESTIMONIOS (confianza social + lazy render) ───
let tAll = [];            // todos los testimonios de la BD
let tRendered = 0;        // cuántas tarjetas ya se pintaron
const T_BATCH = 6;        // tarjetas por lote

function buildTestimonials() {
    const section = $("#testimonials");
    if (!isBlockEnabled("testimonials") || !C.testimonials) {
        if (section) section.style.display = "none";
        return;
    }
    const t = C.testimonials;
    const inner = $("#testimonialsInner");
    if (!inner) return;

    inner.innerHTML = `
        <div class="testimonials-header">
            <span class="section-label reveal">${t.label}</span>
            <h2 class="section-heading reveal reveal-delay-1">${t.heading}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="reveal reveal-delay-3">${t.subtitle}</p>
        </div>
        <div class="testimonials-carousel reveal reveal-delay-3">
            <button class="testimonials-nav prev" id="testimonialsPrev" aria-label="Testimonios anteriores">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div class="testimonials-track" id="testimonialsTrack" aria-live="polite"></div>
            <button class="testimonials-nav next" id="testimonialsNext" aria-label="Más testimonios">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
        </div>
    `;

    // ✅ Garantizar visibilidad (el observer de reveal ya pasó)
    inner.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));

    const track = $("#testimonialsTrack");
    const behavior = prefersReducedMotion ? "auto" : "smooth";
    const prev = $("#testimonialsPrev");
    const next = $("#testimonialsNext");
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -360, behavior }));
    if (next) next.addEventListener("click", () => {
        renderTestimonialBatch(); // asegura que haya tarjetas antes de avanzar
        track.scrollBy({ left: 360, behavior });
    });

    // ✅ LAZY #1: no consultar la BD hasta que el bloque entra en pantalla
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                loadTestimonials();
            }
        });
    }, { threshold: 0.1, rootMargin: "200px 0px" });
    observer.observe(section);

    // ✅ LAZY #2: pintar más al acercarse al final del carrusel
    track.addEventListener("scroll", () => {
        const nearEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 400;
        if (nearEnd) renderTestimonialBatch();
    }, { passive: true });
}

async function loadTestimonials() {
    const track = $("#testimonialsTrack");
    if (!track) return;
    if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
    try {
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb
            .from("testimonials")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(30); // ✅ permite hasta 30 tarjetas (antes 12)
        if (error) throw error;
        if (!data || !data.length) {
            track.innerHTML = '<div class="testimonials-empty">Muy pronto compartiremos opiniones reales de nuestros clientes.</div>';
            return;
        }
        tAll = data;
        tRendered = 0;
        renderTestimonialBatch();                  // 1er lote: inmediato al mostrarse
        setTimeout(renderTestimonialBatch, 2500);  // ✅ 2do lote: a los 2.5 segundos
    } catch (e) {
        track.innerHTML = '<div class="testimonials-empty"></div>';
    }
}

function renderTestimonialBatch() {
    const track = $("#testimonialsTrack");
    if (!track || tRendered >= tAll.length) return;
    const batch = tAll.slice(tRendered, tRendered + T_BATCH);
    batch.forEach(item => track.insertAdjacentHTML("beforeend", testimonialCard(item)));
    tRendered += batch.length;
    // fallback de imagen solo en las tarjetas nuevas
    track.querySelectorAll(".testimonial-img:not([data-fb])").forEach(img => {
        img.dataset.fb = "1";
        img.addEventListener("error", function () { this.style.display = "none"; });
    });
}

  function testimonialCard(t) {
    const rating = clamp(Number(t.rating) || 5, 1, 5);
    const photo = (t.images && t.images.length) ? t.images[0] : null;

    // ✅ Si hay foto real → se muestra; si no → placeholder sobrio
    const photoHTML = photo
        ? `<div class="testimonial-photo">
             <img class="testimonial-img" src="${photo}" alt="Foto real de ${escapeHtml(t.author)}" loading="lazy">
           </div>`
        : `<div class="testimonial-photo testimonial-photo--default" aria-hidden="true">
             <span class="testimonial-quote-mark">"</span>
           </div>`;

    return `<article class="testimonial-card">
        ${photoHTML}
              <div class="testimonial-body">
                  <div class="testimonial-top">
                      <span class="testimonial-stars" aria-label="${rating} de 5 estrellas">${"★".repeat(rating)}</span>
                      <span class="testimonial-source" title="Opinión vía ${escapeHtml(t.source || 'redes')}">${SOURCE_ICONS[t.source] || SOURCE_ICONS.instagram}</span>
                  </div>
                  <p class="testimonial-text">"${escapeHtml(t.comment)}"</p>
                  <div class="testimonial-footer">
                      <div class="testimonial-author">
                          <span class="testimonial-avatar">${initials(t.author)}</span>
                          <span>
                              <span class="testimonial-name">${escapeHtml(t.author)}</span>
                              ${t.location ? `<span class="testimonial-location">${escapeHtml(t.location)}</span>` : ""}
                          </span>
                      </div>
                      <span class="testimonial-verified">✓ Real</span>
                  </div>
              </div>
          </article>
      `;
  }

  // ─── BLOQUE 6: BLOG ─────────────────────
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
    if (!inner) return;

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

  // ─── BLOQUE 7: CONTACTO ─────────────────
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
    if (!inner) return;

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
        <form class="contact-form reveal reveal-delay-4" id="contactForm" novalidate>
          <input type="text" name="website_url" class="contact-honeypot" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0;height:0;width:0;" aria-hidden="true">
          <input type="hidden" name="form_loaded_at" id="formLoadedAt" value="">
          <div class="form-group">
            <input type="text" class="form-input" name="name" placeholder="${c.form.namePlaceholder}" required minlength="2" maxlength="100">
          </div>
          <div class="form-group">
            <input type="email" class="form-input" name="email" placeholder="${c.form.emailPlaceholder}" required maxlength="150">
          </div>
          <div class="form-group">
            <input type="text" class="form-input" name="subject" placeholder="${c.form.subjectPlaceholder}" required minlength="3" maxlength="150">
          </div>
          <div class="form-group">
            <textarea class="form-textarea" name="message" placeholder="${c.form.messagePlaceholder}" required minlength="10" maxlength="2000"></textarea>
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

    const loadedAtInput = $("#formLoadedAt");
    if (loadedAtInput) loadedAtInput.value = Date.now().toString();

    let lastSubmitTime = 0;
    const MIN_SUBMIT_INTERVAL = 3000;

    const inputs = $$(".form-input, .form-textarea", form);
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        input.classList.add("typing");
        clearTimeout(input.typingTimeout);
        input.typingTimeout = setTimeout(() => input.classList.remove("typing"), 500);
      });
    });

    function isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      return re.test(email);
    }

    function looksLikeSpam(text) {
      if (!text) return false;
      const lower = text.toLowerCase();
      if (/https?:\/\/|www\.|\.[a-z]{2,4}\/[a-z]/i.test(text) && text.length > 50) return true;
      const spamWords = ['viagra', 'casino', 'poker', 'lottery', 'winner', 'prize', 'bitcoin', 'crypto investment', 'earn $', 'make money fast'];
      return spamWords.some(word => lower.includes(word));
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      const submitBtn = $(".contact-submit", form);
      const originalText = submitBtn.querySelector("span").textContent;

      if (data.website_url && data.website_url.trim() !== "") {
        messageEl.textContent = C.contact.form.errorMessage;
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
        return;
      }

      const loadedAt = parseInt(data.form_loaded_at || "0");
      const timeSinceLoad = Date.now() - loadedAt;
      if (timeSinceLoad < 1500) {
        messageEl.textContent = "Por favor, tómate un momento para leer el formulario antes de enviarlo.";
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
        return;
      }

      const now = Date.now();
      if (now - lastSubmitTime < MIN_SUBMIT_INTERVAL) {
        const waitSec = Math.ceil((MIN_SUBMIT_INTERVAL - (now - lastSubmitTime)) / 1000);
        messageEl.textContent = `Por favor espera ${waitSec} segundo(s) antes de enviar otro mensaje.`;
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
        return;
      }

      if (!data.name || data.name.trim().length < 2) {
        messageEl.textContent = "Por favor, ingresa tu nombre (mínimo 2 caracteres).";
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
        return;
      }
      if (!data.email || !isValidEmail(data.email)) {
        messageEl.textContent = "Por favor, ingresa un correo electrónico válido.";
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
        return;
      }
      if (!data.subject || data.subject.trim().length < 3) {
        messageEl.textContent = "Por favor, ingresa un asunto (mínimo 3 caracteres).";
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
        return;
      }
      if (!data.message || data.message.trim().length < 10) {
        messageEl.textContent = "Por favor, escribe un mensaje de al menos 10 caracteres.";
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
        return;
      }
      if (looksLikeSpam(data.message) || looksLikeSpam(data.subject)) {
        messageEl.textContent = "Tu mensaje ha sido marcado como sospechoso. Si es un error, intenta reformularlo.";
        messageEl.className = "form-message error visible";
        setTimeout(() => messageEl.classList.remove("visible"), 5000);
        return;
      }

      submitBtn.querySelector("span").textContent = "Enviando...";
      submitBtn.disabled = true;
      lastSubmitTime = now;

      try {
        const response = await fetch(C.email?.formSubmitUrl || "https://formsubmit.co/ajax/hola@studio.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            subject: data.subject.trim(),
            message: data.message.trim(),
            _subject: `Nuevo mensaje de ${data.name} - ${data.subject}`,
            _template: "table"
          })
        });

        const result = await response.json();
        if (result.success === "true" || response.ok) {
          messageEl.textContent = C.contact.form.successMessage;
          messageEl.className = "form-message success visible";
          form.reset();
          if (loadedAtInput) loadedAtInput.value = Date.now().toString();
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
    if (!f) return;

    const inner = $("#footerInner");
    if (!inner) return;

    const visibleColumns = (f.columns || []).map(col => {
      const visibleLinks = (col.links || []).filter(link => {
        const href = link.href || "";
        if (href.startsWith("#") && href.length > 1) {
          const blockId = href.replace("#", "");
          return isBlockEnabled(blockId);
        }
        return true;
      });
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
        <div class="footer-socials">${(C.socials || []).map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join("")}</div>
      </div>
      <div data-admin-link style="margin-top:1.4rem;"></div>
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
    const isMobile = window.innerWidth < 769;
    const heroSpeed = isMobile ? C.effects.parallaxHeroSpeed * 0.3 : C.effects.parallaxHeroSpeed;
    const imageSpeed = isMobile ? C.effects.parallaxImageSpeed * 0.5 : C.effects.parallaxImageSpeed;

    if (prefersReducedMotion) return;

    const heroBg = $("#heroBg");
    const storyImg = $(".story-image");
    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      if (heroBg) heroBg.style.transform = `translate3d(0, ${scrollY * heroSpeed}px, 0) scale(1.1)`;
      if (storyImg) {
        const rect = storyImg.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          storyImg.style.transform = `translate3d(0, ${(progress - 0.5) * rect.height * imageSpeed}px, 0) scale(1.15)`;
        }
      }
      const si = $("#scrollIndicator");
      if (si) si.style.opacity = clamp(1 - scrollY / 300, 0, 1);
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
    if (!cursor || !follower) return;

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

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      const headerEl = $("#header");
      const headerHeight = headerEl ? headerEl.offsetHeight : 80;
      const offset = headerHeight + 20;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      const behavior = prefersReducedMotion ? "auto" : "smooth";

      window.scrollTo({ top: targetPosition, behavior });

      if (window.history && window.history.pushState) {
        history.pushState(null, "", href);
      }
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
    if (prefersReducedMotion) return;
    const buttons = $$(".philosophy-cta, .hero-cta, .nav-cta");
    buttons.forEach(btn => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.2}px, ${(e.clientY - rect.top - rect.height / 2) * 0.2}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
        btn.style.transform = "translate(0, 0)";
        const cleanup = () => {
          btn.style.transition = "";
          btn.removeEventListener("transitionend", cleanup);
        };
        btn.addEventListener("transitionend", cleanup);
        setTimeout(() => {
          if (btn.style.transition) btn.style.transition = "";
        }, 600);
      });
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
    setTimeout(initMagnetic, C.loader.duration + 600);
    buildTestimonials();
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
    const storyEl = $("#story");
    if (storyEl) observer.observe(storyEl);
  }
})();