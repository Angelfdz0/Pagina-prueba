/* ============================================================
   APP.JS — CEREBRO DE LA PÁGINA (OPTIMIZADO)
   ============================================================
   Lee SITE_CONFIG y construye + anima todo el sitio.
   
   ✅ Bugs corregidos: initStoryRibbon, memory leaks
   ✅ Optimizaciones: event delegation, throttling, cleanup
   ✅ Código consolidado: partículas, validaciones
   ============================================================ */

(function () {
  "use strict";

  const C = SITE_CONFIG;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧰 UTILIDADES GLOBALES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isBlockEnabled(blockName) {
    return C[blockName]?.enabled !== false;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  function initials(name) {
    return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  // Throttle para eventos de scroll/resize
  function throttle(fn, wait) {
    let timeout = null, lastArgs = null;
    return function (...args) {
      lastArgs = args;
      if (!timeout) {
        timeout = setTimeout(() => {
          fn.apply(this, lastArgs);
          timeout = null;
        }, wait);
      }
    };
  }

  const SOURCE_ICONS = {
    instagram: '<i class="fa-brands fa-instagram"></i>',
    facebook:  '<i class="fa-brands fa-facebook-f"></i>',
    whatsapp:  '<i class="fa-brands fa-whatsapp"></i>',
    google:    '<i class="fa-brands fa-google"></i>',
    tiktok:    '<i class="fa-brands fa-tiktok"></i>'
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 APLICAR TEMA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function applyTheme() {
    const r = document.documentElement.style;
    const t = C.theme;
    
    r.setProperty("--color-bg", t.bg);
    r.setProperty("--color-bg-alt", t.bgAlt);
    r.setProperty("--color-text", t.text);
    r.setProperty("--color-text-muted", t.textMuted);
    r.setProperty("--color-accent", t.accent);
    r.setProperty("--accent-rgb", t.accentRGB || "201, 169, 110");
    r.setProperty("--color-accent-light", t.accentLight);
    r.setProperty("--color-white", t.white);
    r.setProperty("--color-dark", t.dark);
    r.setProperty("--font-display", t.fontDisplay);
    r.setProperty("--font-body", t.fontBody);
    
    document.title = C.header.logo.text + C.header.logo.highlight;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 INYECTAR SEO DINÁMICO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⭐ HERO STARS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
        left: ${x}%; top: ${y}%;
        width: ${size}px; height: ${size}px;
        --twinkle-duration: ${duration}s;
        --twinkle-delay: ${delay}s;
        --min-opacity: ${minOpacity};
        --max-opacity: ${maxOpacity};
        --glow-size: ${glowSize}px;
      `;
      starsContainer.appendChild(star);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📏 BARRA DE PROGRESO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initProgressBar() {
    if (!C.effects.progressBarEnabled) return;

    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.prepend(bar);

    const updateProgress = throttle(() => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) {
        bar.style.width = "0%";
        return;
      }
      const progress = clamp(window.scrollY / h, 0, 1);
      bar.style.width = (progress * 100) + "%";
    }, 100);

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ LOADER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initLoader() {
    const loader = $("#loader");
    const titleBase = $(".loader-title-base");
    const titleFill = $("#loaderTitleFill");
    const percentage = $("#loaderPercentage");

    const loaderText = String(C.loader?.text || "Studio").toUpperCase();
    if (titleBase) titleBase.textContent = loaderText;
    if (titleFill) titleFill.textContent = loaderText;

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
    }, (C.loader?.duration || 2200) / 8);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧭 HEADER / NAVEGACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    const maxLinks = typeof h.maxLinks === "number" ? h.maxLinks : 5;
    const mobileMax = 4;
    const extraLinks = visibleLinks.slice(maxLinks);

    const linkLis = visibleLinks.map((l, i) =>
      `<li class="${i >= mobileMax ? "m-extra" : ""}">
         <a href="${l.href}" class="${i >= maxLinks ? "nav-link-extra" : ""}">${l.label}</a>
       </li>`
    );
    
    if (visibleLinks.length > mobileMax) {
      linkLis.splice(mobileMax, 0, `
        <li class="nav-more-mobile" id="navMoreMobile">
          <button class="nav-more-btn" id="navMoreMobileBtn" aria-haspopup="true" aria-expanded="false">
            <span class="mm-label">Más<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>
          </button>
        </li>`);
    }

    nav.innerHTML = `
      <a href="#hero" class="nav-logo">${h.logo.text}<span>${h.logo.highlight}</span></a>
      <ul class="nav-links" id="navLinks">
        ${linkLis.join("")}
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
    const moreMobileBtn = $("#navMoreMobileBtn");

    const closeMobileMore = () => {
      if (navLinks) navLinks.classList.remove("more-open");
      if (moreMobileBtn) moreMobileBtn.setAttribute("aria-expanded", "false");
    };

    if (hamburger && navLinks && header) {
      hamburger.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("open");
        if (isOpen) {
          navLinks.classList.remove("open");
          hamburger.classList.remove("active");
          header.classList.remove("menu-open");
          document.body.style.overflow = "";
          closeMobileMore();
        } else {
          navLinks.classList.add("open");
          hamburger.classList.add("active");
          header.classList.add("menu-open");
          document.body.style.overflow = "hidden";
        }
      });
    }

    if (moreMobileBtn && navLinks) {
      moreMobileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = navLinks.classList.toggle("more-open");
        moreMobileBtn.setAttribute("aria-expanded", String(open));
      });
    }

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

    // Event delegation para cerrar menú al hacer clic en enlaces
    nav.addEventListener("click", (e) => {
      if (e.target.closest(".nav-links a")) {
        if (hamburger) hamburger.classList.remove("active");
        if (navLinks) navLinks.classList.remove("open");
        if (header) header.classList.remove("menu-open");
        document.body.style.overflow = "";
        closeMobileMore();
      }
    });

    const updateScrolled = throttle(() => {
      const headerEl = $("#header");
      if (headerEl) headerEl.classList.toggle("scrolled", window.scrollY > 80);
    }, 100);

    window.addEventListener("scroll", updateScrolled, { passive: true });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏠 HERO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
      <a href="${h.ctaHref}" class="hero-cta">
        <span>${h.cta}</span>
        <i class="fa-solid fa-arrow-right hero-cta-arrow" aria-hidden="true"></i>
      </a>
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⌨️ TYPEWRITER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
      position: absolute; visibility: hidden; white-space: nowrap;
      font-family: var(--font-display); font-style: italic;
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

    let wordIndex = 0, charIndex = 0, isDeleting = false, currentText = "";
    const typeSpeed = 120, deleteSpeed = 60, pauseEnd = 2200, pauseStart = 400;

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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 BLOQUE 1: HISTORIA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function buildStory() {
    if (!isBlockEnabled("story")) {
      const section = $("#story");
      if (section) section.style.display = "none";
      return;
    }
    const s = C.story;
    const inner = $("#storyInner");
    if (!inner) return;

    const partnersOn = s.partners?.enabled && (s.partners.logos || []).length > 0;
    
    const logosHTML = partnersOn ? s.partners.logos.map(l => `
      <span class="partner-logo" title="${escapeHtml(l.name)}">
        ${l.img
          ? `<img src="${l.img}" alt="${escapeHtml(l.name)}" loading="lazy">`
          : `<span class="partner-name">${escapeHtml(l.name)}</span>`}
      </span>`).join("") : "";

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
      ${partnersOn ? `
      <div class="partners-strip reveal reveal-delay-4">
        <h3 class="partners-title">${escapeHtml(s.partners.title || "Patrocinadores y Convenios")}</h3>
        <div class="partners-marquee">
          <div class="partners-track">
            <div class="partners-group">${logosHTML}</div>
            <div class="partners-group" aria-hidden="true">${logosHTML}</div>
          </div>
        </div>
      </div>` : ""}
    `;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ SERVICIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async function loadServicesFromDB() {
    try {
      const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
      const { data, error } = await sb.from('services').select('*')
        .eq('is_active', true)
        .order('sort', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data && data.length) {
        C.services.items = data.map(r => ({
          number: r.number || '01', 
          title: r.title,
          intro: r.intro || '', 
          desc: r.content || '', 
          image: r.image || ''
        }));
      }
    } catch (e) {}
  }
  
  function svcPlain(text) {
    return (text || '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/^##\s+/gm, '')
      .replace(/^[-•]\s+/gm, '')
      .replace(/^>\s?/gm, '');
  }
  
  function svcInline(text) {
    let s = escapeHtml(text || '');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/_([^_]+)_/g, '<em>$1</em>');
    return s;
  }
  
  function renderServiceContent(text) {
    if (!text) return '';
    return String(text).split(/\n\n+/).map(par => {
      const t = par.trim();
      if (!t) return '';
      if (/^##\s/.test(t)) return `<h4 class="svc-h2">${svcInline(t.replace(/^##\s+/, ''))}</h4>`;
      if (/^[-•]\s/.test(t)) return `<ul class="svc-ul">${t.split('\n').map(l => l.trim()).filter(l => /^[-•]\s/.test(l)).map(l => `<li>${svcInline(l.replace(/^[-•]\s+/, ''))}</li>`).join('')}</ul>`;
      if (/^>\s?/.test(t)) return `<blockquote class="svc-quote">${svcInline(t.replace(/^>\s?/gm, ''))}</blockquote>`;
      return `<p>${svcInline(t).replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

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
      <div class="services-carousel reveal reveal-delay-2">
        <div class="services-ghost" id="servicesGhost" aria-hidden="true">01</div>
        <div class="services-track" id="servicesTrack">
          ${s.items.map((item, i) => `
            <div class="service-card">
              <div class="service-flip">
                <div class="service-face service-front">
                  ${item.image ? `<div class="service-bg-img" style="background-image:url('${item.image}')" aria-hidden="true"></div>` : ""}
                  <div class="service-number">${item.number}</div>
                  <h3 class="service-title">${item.title}</h3>
                  <p class="service-desc">${escapeHtml(item.intro || svcPlain(item.desc))}</p>
                  <button class="service-more" type="button" data-flip="open" aria-expanded="false">Ver más</button>
                </div>
                <div class="service-face service-back">
                  ${item.image ? `<div class="service-bg-img" style="background-image:url('${item.image}')" aria-hidden="true"></div>` : ""}
                  <div class="service-back-head">
                    <span class="service-number-sm">${item.number}</span>
                    <h3 class="service-title">${item.title}</h3>
                  </div>
                  <div class="service-desc-full">${renderServiceContent(item.desc)}</div>
                  <button class="service-more service-back-btn" type="button" data-flip="close">← Volver</button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="services-meta">
        <div class="services-progress"><div class="services-progress-fill" id="servicesProgressFill"></div></div>
        <div class="services-count" id="servicesCount"></div>
        <div class="services-nav">
          <button class="services-arrow services-arrow-prev" id="servicesPrev" aria-label="Servicios anteriores">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="services-arrow services-arrow-next" id="servicesNext" aria-label="Más servicios">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
      <div class="services-hint" id="servicesHint">← desliza →</div>
    `;

    const unflipAll = (except = null) => {
      inner.querySelectorAll(".service-card.flipped").forEach(c => {
        if (c !== except) {
          c.classList.remove("flipped");
          const ob = c.querySelector('[data-flip="open"]');
          if (ob) ob.setAttribute("aria-expanded", "false");
        }
      });
    };

    // Event delegation para flip
    inner.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-flip]");
      if (btn) {
        const card = btn.closest(".service-card");
        const willOpen = !card.classList.contains("flipped");
        unflipAll(card);
        card.classList.toggle("flipped", willOpen);
        btn.setAttribute("aria-expanded", String(willOpen));
      }
    });

    const track = inner.querySelector("#servicesTrack");
    const prev = inner.querySelector("#servicesPrev");
    const next = inner.querySelector("#servicesNext");
    const counter = inner.querySelector("#servicesCount");
    const progressFill = inner.querySelector("#servicesProgressFill");
    const ghost = inner.querySelector("#servicesGhost");
    const hint = inner.querySelector("#servicesHint");

    if (track && prev && next) {
      const pad = n => String(n).padStart(2, "0");
      
      const cardStep = () => {
        const card = track.querySelector(".service-card");
        const gap = parseFloat(getComputedStyle(track).columnGap) || 2;
        return card ? card.getBoundingClientRect().width + gap : 300;
      };
      
      prev.addEventListener("click", () => { unflipAll(); track.scrollBy({ left: -cardStep(), behavior: "smooth" }); });
      next.addEventListener("click", () => { unflipAll(); track.scrollBy({ left: cardStep(), behavior: "smooth" }); });

      track.addEventListener("click", (e) => {
        if (e.target.closest("[data-flip]")) return;
        const card = e.target.closest(".service-card");
        if (card) unflipAll(card);
      });

      const updateHUD = throttle(() => {
        const total = s.items.length;
        const stepW = cardStep();
        const scrollable = track.scrollWidth > track.clientWidth + 1;

        prev.style.display = scrollable ? "" : "none";
        next.style.display = scrollable ? "" : "none";
        if (hint) hint.style.display = scrollable ? "" : "none";

        if (!scrollable) {
          if (counter) counter.innerHTML = `<span class="sc-now">${pad(total)}</span> / ${pad(total)}`;
          if (progressFill) progressFill.style.transform = "scaleX(1)";
          return;
        }

        const max = track.scrollWidth - track.clientWidth - 1;
        prev.disabled = track.scrollLeft <= 0;
        next.disabled = track.scrollLeft >= max;

        const idx = Math.max(0, Math.round(track.scrollLeft / stepW));
        const perView = Math.max(1, Math.round(track.clientWidth / stepW));
        const from = idx + 1;
        const to = Math.min(idx + perView, total);
        if (counter) counter.innerHTML = `<span class="sc-now">${from === to ? pad(from) : pad(from) + "–" + pad(to)}</span> / ${pad(total)}`;

        if (progressFill) progressFill.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;

        const num = (s.items[Math.min(idx, total - 1)] || {}).number || pad(idx + 1);
        if (ghost && ghost.dataset.num !== num) {
          ghost.dataset.num = num;
          ghost.textContent = num;
          ghost.classList.remove("tick");
          void ghost.offsetWidth;
          ghost.classList.add("tick");
        }
      }, 100);

      track.addEventListener("scroll", () => {
        if (hint) hint.classList.add("hide");
        requestAnimationFrame(updateHUD);
      }, { passive: true });
      
      window.addEventListener("resize", updateHUD);
      updateHUD();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💡 LUZ QUE CAE EN SERVICIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖼️ BLOQUE 3: GALERÍA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
          const rgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '201, 169, 110';
          light.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(${rgb}, 0.3) 0%, rgba(${rgb}, 0.1) 30%, transparent 60%)`;
        }
      });
    });
  }

  function initGalleryCarousel() {
    const wrapper = $("#galleryCarouselWrapper");
    const carousel = $("#galleryCarousel");
    const progressFill = $("#galleryProgressFill");
    if (!wrapper || !carousel) return;

    const realSlides = $$(".gallery-slide", carousel);
    const n = realSlides.length;
    if (!n) return;

    const lite = window.matchMedia("(max-width: 768px)").matches;

    let slides, START;
    if (lite) {
      slides = realSlides;
      START = 0;
    } else {
      const beforeFrag = document.createDocumentFragment();
      const afterFrag = document.createDocumentFragment();
      realSlides.forEach(s => { beforeFrag.appendChild(s.cloneNode(true)); afterFrag.appendChild(s.cloneNode(true)); });
      carousel.insertBefore(beforeFrag, realSlides[0]);
      carousel.appendChild(afterFrag);
      slides = $$(".gallery-slide", carousel);
      START = n;
    }

    if (!lite) {
      slides.forEach(s => {
        const img = s.querySelector(".gallery-slide-img");
        if (img) {
          img.loading = "eager";
          if (img.decode) img.decode().catch(() => {});
        }
      });
    }

    let isDragging = false, startX = 0, startTranslate = 0, currentTranslate = 0,
        velocity = 0, lastX = 0, lastTime = 0, rafId = null,
        snapPositions = [], slideCenters = [], snapAnimating = false, snapFallbackTimer = null;

    let autoTimer = null, idleTimer = null, autoIndex = START;
    const autoOn = () => C.effects?.galleryAuto !== false && !prefersReducedMotion;
    const autoEvery = C.effects?.galleryAutoInterval || 4000;

    function calculateSnapPositions() {
      snapPositions = []; slideCenters = [];
      const wrapperCenter = wrapper.offsetWidth / 2;
      const paddingLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;
      slides.forEach(slide => {
        const c = paddingLeft + slide.offsetLeft + slide.offsetWidth / 2;
        slideCenters.push(c);
        snapPositions.push(wrapperCenter - c);
      });
    }

    function getLimits() {
      return { minTranslate: -(carousel.scrollWidth - wrapper.offsetWidth), maxTranslate: 0 };
    }

    function getClosestIndex(x) {
      let bi = 0, md = Infinity;
      snapPositions.forEach((p, i) => { const d = Math.abs(x - p); if (d < md) { md = d; bi = i; } });
      return bi;
    }

    function getClosestSnap(x) { return snapPositions[getClosestIndex(x)] ?? 0; }

    function updateVisuals(x, isSnapping = false) {
      const { minTranslate, maxTranslate } = getLimits();
      let finalX = x;
      if (!isSnapping) {
        if (x > maxTranslate) finalX = maxTranslate + (x - maxTranslate) * 0.3;
        else if (x < minTranslate) finalX = minTranslate + (x - minTranslate) * 0.3;
      } else finalX = clamp(x, minTranslate, maxTranslate);

      currentTranslate = finalX;
      carousel.classList.toggle("is-snapping", isSnapping);
      carousel.style.transform = `translate3d(${finalX}px, 0, 0)`;

      const wrapperCenter = wrapper.offsetWidth / 2, halfW = wrapper.offsetWidth / 2;
      if (!lite) {
        slides.forEach((slide, i) => {
          const norm = ((slideCenters[i] + finalX) - wrapperCenter) / halfW;
          const img = $(".gallery-slide-img", slide);
          if (img) img.style.transform = `translate3d(${norm * 20}px, 0, 0) scale(1.05)`;
          const scale = clamp(1 - Math.abs(norm) * 0.15, 0.85, 1);
          const opacity = clamp(1 - Math.abs(norm) * 0.4, 0.5, 1);
          const rot = clamp(norm * -8, -8, 8);
          slide.style.transform = `scale(${scale}) rotate(${rot}deg)`;
          slide.style.opacity = opacity;
          slide.style.zIndex = String(20 - Math.round(Math.abs(norm) * 10));
        });
      }

      if (progressFill && minTranslate !== 0)
        progressFill.style.width = (clamp(Math.abs(finalX) / Math.abs(minTranslate), 0, 1) * 100) + "%";
    }

    function goToSlide(i) {
      if (snapPositions[i] === undefined) return;
      autoIndex = i;
      snapAnimating = true;
      updateVisuals(snapPositions[i], true);
      clearTimeout(snapFallbackTimer);
      snapFallbackTimer = setTimeout(settle, 900);
    }

    function settle() {
      carousel.classList.remove("is-snapping");
      snapAnimating = false; velocity = 0;

      let changed = false;
      if (!lite) {
        if (autoIndex >= 2 * n) { autoIndex -= n; changed = true; }
        else if (autoIndex < n) { autoIndex += n; changed = true; }
      }

      if (changed) {
        carousel.classList.add("no-anim");
        updateVisuals(snapPositions[autoIndex], false);
        void carousel.offsetWidth;
        requestAnimationFrame(() => carousel.classList.remove("no-anim"));
      }
    }

    function startAuto() {
      if (lite || !autoOn() || n < 2) return;
      stopAuto();
      autoTimer = setInterval(() => {
        if (isDragging || snapAnimating) return;
        goToSlide(autoIndex + 1);
      }, autoEvery);
    }

    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function pauseAuto() { stopAuto(); clearTimeout(idleTimer); idleTimer = setTimeout(startAuto, 6000); }

    function getX(e) { return e.type.includes("mouse") ? e.clientX : e.touches[0].clientX; }

    function onStart(e) {
      if (e.type === "mousedown") e.preventDefault();
      isDragging = true; pauseAuto();
      startX = getX(e); startTranslate = currentTranslate;
      lastX = startX; lastTime = Date.now(); velocity = 0;
      if (rafId) cancelAnimationFrame(rafId);
      carousel.classList.remove("is-snapping");
      snapAnimating = false; clearTimeout(snapFallbackTimer);
    }

    function onMove(e) {
      if (!isDragging) return;
      if (e.type === "touchmove" && e.cancelable) e.preventDefault();
      const x = getX(e), dx = x - startX, now = Date.now(), dt = now - lastTime;
      if (dt > 0) velocity = clamp(((x - lastX) / dt) * 16, -50, 50);
      lastX = x; lastTime = now;
      if (!rafId) rafId = requestAnimationFrame(() => { updateVisuals(startTranslate + dx, false); rafId = null; });
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false; pauseAuto();
      snapAnimating = true;
      const target = getClosestSnap(currentTranslate + velocity * 15);
      autoIndex = getClosestIndex(target);
      updateVisuals(target, true);
      clearTimeout(snapFallbackTimer);
      snapFallbackTimer = setTimeout(settle, 900);
    }

    carousel.addEventListener("transitionend", e => { if (e.target === carousel) settle(); });

    wrapper.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    wrapper.addEventListener("mouseleave", onEnd);
    wrapper.addEventListener("touchstart", onStart, { passive: true });
    wrapper.addEventListener("touchmove", onMove, { passive: false });
    wrapper.addEventListener("touchend", onEnd);

    slides.forEach((slide, i) => {
      slide.addEventListener("click", () => {
        if (!isDragging && Math.abs(velocity) <= 2) { pauseAuto(); goToSlide(i); }
      });
    });

    function recalculateWhenImagesLoad() {
      const imgs = $$(".gallery-slide-img", carousel);
      if (!imgs.length) return;
      let remaining = imgs.length, finished = false;
      const done = () => {
        if (finished) return;
        if (--remaining <= 0) {
          finished = true;
          calculateSnapPositions();
          if (!isDragging && !snapAnimating) updateVisuals(getClosestSnap(currentTranslate), true);
        }
      };
      imgs.forEach(img => img.complete ? done() : (img.addEventListener("load", done, { once: true }), img.addEventListener("error", done, { once: true })));
    }

    calculateSnapPositions();
    updateVisuals(snapPositions[START], true);
    recalculateWhenImagesLoad();
    startAuto();

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
      calculateSnapPositions();
      if (!isDragging && !snapAnimating) updateVisuals(getClosestSnap(currentTranslate), true);
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateSnapPositions();
        if (!isDragging && !snapAnimating) updateVisuals(getClosestSnap(currentTranslate), true);
      }, 200);
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💬 BLOQUE 4: FILOSOFÍA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛍️ BLOQUE 5: E-COMMERCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
      <div class="ecommerce-bg-icon" aria-hidden="true">
        <i class="fa-solid fa-bag-shopping"></i>
      </div>
      <div class="ecommerce-inner">
        <span class="section-label reveal">${e.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${e.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="ecommerce-subtitle reveal reveal-delay-3">${e.subtitle}</p>
        <a href="${e.ctaHref}" class="ecommerce-cta reveal reveal-delay-4">
          <span>${e.cta}</span>
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </a>
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⭐ BLOQUE: TESTIMONIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let tAll = [];
  let tRendered = 0;
  const T_BATCH = 6;

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
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <div class="testimonials-track" id="testimonialsTrack" aria-live="polite"></div>
        <button class="testimonials-nav next" id="testimonialsNext" aria-label="Más testimonios">
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    `;

    inner.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));

    const track = $("#testimonialsTrack");
    const behavior = prefersReducedMotion ? "auto" : "smooth";
    const prev = $("#testimonialsPrev");
    const next = $("#testimonialsNext");
    
    if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -360, behavior }));
    if (next) next.addEventListener("click", () => {
      renderTestimonialBatch();
      track.scrollBy({ left: 360, behavior });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          loadTestimonials();
        }
      });
    }, { threshold: 0.1, rootMargin: "200px 0px" });
    observer.observe(section);

    track.addEventListener("scroll", throttle(() => {
      const nearEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 400;
      if (nearEnd) renderTestimonialBatch();
    }, 200), { passive: true });
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
        .limit(30);
      
      if (error) throw error;
      
      if (!data || !data.length) {
        track.innerHTML = '<div class="testimonials-empty">Muy pronto compartiremos opiniones reales de nuestros clientes.</div>';
        return;
      }
      
      tAll = data;
      tRendered = 0;
      renderTestimonialBatch();
      setTimeout(renderTestimonialBatch, 2500);
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
    
    track.querySelectorAll(".testimonial-img:not([data-fb])").forEach(img => {
      img.dataset.fb = "1";
      img.addEventListener("error", function () { this.style.display = "none"; });
    });
  }

  function testimonialCard(t) {
    const rating = clamp(Number(t.rating) || 5, 1, 5);
    const photo = (t.images && t.images.length) ? t.images[0] : null;

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
          <span class="testimonial-verified"><i class="fa-solid fa-circle-check"></i> Real</span>
        </div>
      </div>
    </article>`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 BLOQUE 6: BLOG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
      <div class="blog-bg-icon" id="blogBgIcon" aria-hidden="true">
        <i class="fa-solid fa-book-open"></i>
      </div>
      <div class="blog-inner">
        <span class="section-label reveal">${b.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${b.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="blog-subtitle reveal reveal-delay-3">${b.subtitle}</p>
        <a href="${b.ctaHref}" class="blog-cta reveal reveal-delay-4">
          <span>${b.cta}</span>
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </a>
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
    const updateParallax = throttle(() => {
      const rect = icon.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const normalizedProgress = (progress - 0.5) * 2;
        const translateY = normalizedProgress * -40;
        const rotateX = 5 + (normalizedProgress * 8);
        const rotateY = -15 + (normalizedProgress * 10);
        icon.style.transform = `translateY(calc(-50% + ${translateY}px)) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      }
    }, 100);

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📬 BLOQUE 7: CONTACTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
      <div class="contact-bg-icon" id="contactBgIcon" aria-hidden="true">
        <i class="fa-solid fa-envelope"></i>
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
          <button type="submit" class="contact-submit">
            <span>${c.form.submitText}</span>
            <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
          </button>
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
    const updateParallax = throttle(() => {
      const rect = icon.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const normalizedProgress = (progress - 0.5) * 2;
        const translateY = normalizedProgress * -40;
        const rotateX = -5 + (normalizedProgress * 8);
        const rotateY = 15 + (normalizedProgress * 10);
        icon.style.transform = `translateY(calc(-50% + ${translateY}px)) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      }
    }, 100);

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🦶 FOOTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    const FOOTER_VISIBLE = 3;

    inner.innerHTML = `
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-brand-name">${f.brand.name}<span>${f.brand.highlight}</span></div>
          <p class="footer-brand-desc">${f.brand.desc}</p>
        </div>
        ${visibleColumns.map(col => {
          const hasMore = col.links.length > FOOTER_VISIBLE + 1;
          const shown   = hasMore ? col.links.slice(0, FOOTER_VISIBLE) : col.links;
          const hidden  = hasMore ? col.links.slice(FOOTER_VISIBLE) : [];
          return `
            <div class="footer-col">
              <h4 class="footer-col-title">${col.title}</h4>
              <ul>
                ${shown.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}
                ${hasMore ? `
                  <li class="footer-more-wrap">
                    <button class="footer-more-btn" aria-haspopup="true" aria-expanded="false">
                      Más
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <ul class="footer-more-panel">
                      ${hidden.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}
                    </ul>
                  </li>` : ""}
              </ul>
            </div>`;
        }).join("")}
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">${f.copyright}</span>
        <div class="footer-socials">${(C.socials || []).map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join("")}</div>
      </div>
      <div data-admin-link style="margin-top:1.4rem;">
        <a href="admin.html" class="footer-admin-link" title="Acceso administrativo">
          <i class="fa-solid fa-user-shield" aria-hidden="true"></i> Acceso administrativo
        </a>
      </div>
    `;

    const closeAllMore = () => {
      $$(".footer-more-wrap.open", inner).forEach(w => {
        w.classList.remove("open");
        w.querySelector(".footer-more-btn").setAttribute("aria-expanded", "false");
      });
    };
    
    inner.addEventListener("click", (e) => {
      const btn = e.target.closest(".footer-more-btn");
      if (btn) {
        e.stopPropagation();
        const wrap = btn.closest(".footer-more-wrap");
        const open = wrap.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      } else if (e.target.closest(".footer-more-panel a")) {
        closeAllMore();
      } else if (!e.target.closest(".footer-more-wrap")) {
        closeAllMore();
      }
    });
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllMore();
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👁️ SCROLL REVEAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎭 PARALLAX ENGINE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initParallax() {
    const isMobile = window.innerWidth < 769;
    const heroSpeed = isMobile ? C.effects.parallaxHeroSpeed * 0.3 : C.effects.parallaxHeroSpeed;
    const imageSpeed = isMobile ? C.effects.parallaxImageSpeed * 0.5 : C.effects.parallaxImageSpeed;

    if (prefersReducedMotion) return;

    const heroBg = $("#heroBg");
    const storyImg = $(".story-image");
    let ticking = false;

    const updateParallax = throttle(() => {
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
    }, 100);

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖱️ CURSOR PERSONALIZADO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    const hoverTargets = "a, button, .service-card, .gallery-item, .philosophy-cta, .footer-social-icon, .testimonials-nav, .testimonials-source";
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔗 SMOOTH ANCHOR SCROLL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌾 GRAIN TOGGLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initGrain() {
    if (!C.effects.grainEnabled) {
      const grain = $(".grain-overlay");
      if (grain) grain.style.display = "none";
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔢 COUNTER ANIMATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧲 MAGNETIC EFFECT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function initMagnetic() {
    if (prefersReducedMotion) return;
    
    const buttons = $$(".philosophy-cta, .hero-cta, .nav-cta, .blog-cta, .ecommerce-cta, .contact-submit");
    
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📍 BLOQUE: UBICACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function buildLocation() {
    if (!isBlockEnabled("location")) {
      const section = $("#location");
      if (section) section.style.display = "none";
      return;
    }
    const L = C.location;
    const inner = $("#locationInner");
    if (!inner) return;

    const section = document.getElementById("location");
    if (section && L.image) section.style.setProperty("--location-img", `url("${L.image}")`);
    
    const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(L.mapsQuery)}&output=embed`;
    const dirHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(L.mapsQuery)}`;
    
    inner.innerHTML = `
      <div class="location-header">
        <span class="section-label reveal">${L.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${L.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="reveal reveal-delay-3">${L.subtitle}</p>
      </div>
      <div class="location-grid">
        <div class="location-map reveal-left">
          <iframe src="${mapSrc}" title="Mapa de ubicación" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <div class="location-info reveal-right">
          <div class="location-card">
            <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
            <h4>Dirección</h4>
            <p>${L.address}</p>
          </div>
          <div class="location-card">
            <i class="fa-solid fa-clock" aria-hidden="true"></i>
            <h4>Horario</h4>
            <ul>${L.hours.map(h => `<li><span>${h.d}</span><span>${h.h}</span></li>`).join("")}</ul>
          </div>
          <div class="location-card">
            <i class="fa-solid fa-phone" aria-hidden="true"></i>
            <h4>Teléfono</h4>
            <p><a href="${L.phoneHref}">${L.phone}</a></p>
          </div>
          <a class="location-directions" href="${dirHref}" target="_blank" rel="noopener">
            <i class="fa-solid fa-diamond-turn-right" aria-hidden="true"></i> Cómo llegar
          </a>
        </div>
      </div>
    `;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📅 BLOQUE: CITAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function buildAppointments() {
    if (!isBlockEnabled("appointments")) {
      const section = $("#appointments");
      if (section) section.style.display = "none";
      return;
    }
    const A = C.appointments;
    const inner = $("#appointmentsInner");
    if (!inner) return;
    
    inner.innerHTML = `
      <div class="appt-header">
        <span class="section-label reveal">${A.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${A.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="reveal reveal-delay-3">${A.subtitle}</p>
      </div>
      <form class="appt-form reveal reveal-delay-3" id="apptForm" novalidate>
        <input type="text" name="website_url" class="contact-honeypot" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0;height:0;width:0;" aria-hidden="true">
        <div class="appt-row">
          <div class="form-group"><input type="text" class="form-input" name="name" placeholder="Nombre completo" required minlength="2" maxlength="100"></div>
          <div class="form-group"><input type="tel" class="form-input" name="phone" placeholder="WhatsApp (55 1234 5678)" required minlength="8" maxlength="20"></div>
        </div>
        <div class="appt-row">
          <div class="form-group"><input type="date" class="form-input" name="date" required></div>
          <div class="form-group">
            <select class="form-input" name="slot" required>
              <option value="" disabled selected>Horario preferido</option>
              ${A.slots.map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>
        </div>
        <div class="form-group"><textarea class="form-textarea" name="reason" placeholder="Motivo de la cita (opcional)" maxlength="300"></textarea></div>
        <button type="submit" class="contact-submit"><span>Solicitar Cita</span></button>
        <div class="form-message" id="apptMessage"></div>
      </form>
    `;
    
    setTimeout(initAppointmentForm, 100);
  }

  function initAppointmentForm() {
    const form = $("#apptForm");
    const msg = $("#apptMessage");
    if (!form) return;
    
    const dateInput = form.querySelector('input[name="date"]');
    if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

    function showApptMsg(text, type) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = "form-message " + type + " visible";
      setTimeout(() => msg.classList.remove("visible"), 6000);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      
      if (data.website_url && data.website_url.trim()) return;
      
      if (!data.name || data.name.trim().length < 2)  return showApptMsg("Escribe tu nombre.", "error");
      if (!data.phone || data.phone.trim().length < 8) return showApptMsg("Escribe un teléfono válido.", "error");
      if (!data.date) return showApptMsg("Elige una fecha.", "error");
      if (!data.slot) return showApptMsg("Elige un horario.", "error");

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;

      let saved = false;
      try {
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { error } = await sb.from("appointments").insert([{
          name: data.name.trim(),
          phone: data.phone.trim(),
          date: data.date,
          slot: data.slot,
          reason: (data.reason || "").trim() || null,
          status: "pending"
        }]);
        saved = !error;
        if (error) console.warn("No se guardó la cita:", error.message);
      } catch (err) { console.warn(err); }

      const wa = (C.tienda && C.tienda.whatsapp) || "521234567890";
      let m = `📅 *Solicitud de cita*\n\n▪️ *Nombre:* ${data.name}\n▪️ *Teléfono:* ${data.phone}\n▪️ *Fecha:* ${data.date}\n▪️ *Horario:* ${data.slot}\n`;
      if (data.reason) m += `▪️ *Motivo:* ${data.reason}\n`;
      m += `\n_Enviado desde el sitio web_`;
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(m)}`, "_blank");

      btn.disabled = false;
      form.reset();
      showApptMsg(saved ? (C.appointments.successMessage || "¡Solicitud enviada!") : "Te llevamos a WhatsApp para completar tu cita.", "success");
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👥 BLOQUE: EQUIPO MÉDICO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function buildTeam() {
    if (!isBlockEnabled("team") || !C.team) {
      const section = $("#team");
      if (section) section.style.display = "none";
      return;
    }
    const T = C.team;
    const inner = $("#teamInner");
    if (!inner) return;

    inner.innerHTML = `
      <div class="team-header">
        <span class="section-label reveal">${T.label}</span>
        <h2 class="section-heading reveal reveal-delay-1">${T.heading}</h2>
        <hr class="editorial-hr center reveal reveal-delay-2" />
        <p class="reveal reveal-delay-3">${T.subtitle}</p>
      </div>
      <div class="team-carousel reveal reveal-delay-2">
        <div class="services-track team-track" id="teamTrack">
          ${T.items.map(d => `
          <div class="team-card">
            <div class="team-flip">
              <div class="team-face team-front">
                <div class="team-photo"><img src="${d.photo}" alt="${escapeHtml(d.name)}" loading="lazy"></div>
                <div class="team-front-info">
                  <h3 class="team-name">${escapeHtml(d.name)}</h3>
                  <span class="team-cedula"><i class="fa-solid fa-id-badge" aria-hidden="true"></i>${escapeHtml(d.cedula)}</span>
                  <span class="team-specialty">${escapeHtml(d.specialty)}</span>
                  <button class="team-more" type="button" data-tflip="open" aria-expanded="false">Ver ficha</button>
                </div>
              </div>
              <div class="team-face team-back">
                <div class="team-back-head">
                  <h3 class="team-name">${escapeHtml(d.name)}</h3>
                  <span class="team-specialty">${escapeHtml(d.specialty)}</span>
                </div>
                <p class="team-bio">${escapeHtml(d.bio)}</p>
                <ul class="team-contact">
                  ${d.phone ? `<li><a href="tel:${String(d.phone).replace(/\s/g, "")}"><i class="fa-solid fa-phone" aria-hidden="true"></i>${escapeHtml(d.phone)}</a></li>` : ""}
                  ${d.whatsapp ? `<li><a href="https://wa.me/${d.whatsapp}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>Escribir por WhatsApp</a></li>` : ""}
                  ${d.email ? `<li><a href="mailto:${d.email}"><i class="fa-solid fa-envelope" aria-hidden="true"></i>${escapeHtml(d.email)}</a></li>` : ""}
                  ${d.schedule ? `<li><span><i class="fa-solid fa-clock" aria-hidden="true"></i>${escapeHtml(d.schedule)}</span></li>` : ""}
                </ul>
                <button class="team-more team-back-btn" type="button" data-tflip="close">← Volver</button>
              </div>
            </div>
          </div>`).join("")}
        </div>
      </div>
      <div class="services-meta">
        <div class="services-progress"><div class="services-progress-fill" id="teamFill"></div></div>
        <div class="services-count" id="teamCount"></div>
        <div class="services-nav">
          <button class="services-arrow" id="teamPrev" aria-label="Doctores anteriores"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button class="services-arrow" id="teamNext" aria-label="Más doctores"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>
        </div>
      </div>
      <div class="services-hint" id="teamHint">← desliza →</div>
    `;

    const unflipTeam = (except = null) => {
      inner.querySelectorAll(".team-card.flipped").forEach(c => {
        if (c !== except) {
          c.classList.remove("flipped");
          const ob = c.querySelector('[data-tflip="open"]');
          if (ob) ob.setAttribute("aria-expanded", "false");
        }
      });
    };
    
    inner.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tflip]");
      if (btn) {
        const card = btn.closest(".team-card");
        const willOpen = !card.classList.contains("flipped");
        unflipTeam(card);
        card.classList.toggle("flipped", willOpen);
        btn.setAttribute("aria-expanded", String(willOpen));
      }
    });

    const track = inner.querySelector("#teamTrack");
    const prev = inner.querySelector("#teamPrev");
    const next = inner.querySelector("#teamNext");
    const counter = inner.querySelector("#teamCount");
    const fill = inner.querySelector("#teamFill");
    const hint = inner.querySelector("#teamHint");
    
    if (track && prev && next) {
      const pad = n => String(n).padStart(2, "0");
      
      const stepW = () => {
        const c = track.querySelector(".team-card");
        const g = parseFloat(getComputedStyle(track).columnGap) || 24;
        return c ? c.getBoundingClientRect().width + g : 320;
      };
      
      prev.addEventListener("click", () => { unflipTeam(); track.scrollBy({ left: -stepW(), behavior: "smooth" }); });
      next.addEventListener("click", () => { unflipTeam(); track.scrollBy({ left: stepW(), behavior: "smooth" }); });
      
            track.addEventListener("click", (e) => {
        // Los botones "Ver ficha"/"Volver" los maneja la delegación de inner
        if (e.target.closest("[data-tflip]")) return;
        const card = e.target.closest(".team-card");
        if (card) unflipTeam(card);
      });
      
      const updateHUD = throttle(() => {
        const total = T.items.length;
        const w = stepW();
        const scrollable = track.scrollWidth > track.clientWidth + 1;
        
        prev.style.display = scrollable ? "" : "none";
        next.style.display = scrollable ? "" : "none";
        if (hint) hint.style.display = scrollable ? "" : "none";
        
        if (!scrollable) {
          if (counter) counter.innerHTML = `<span class="sc-now">${pad(total)}</span> / ${pad(total)}`;
          if (fill) fill.style.transform = "scaleX(1)";
          return;
        }
        
        const max = track.scrollWidth - track.clientWidth - 1;
        prev.disabled = track.scrollLeft <= 0;
        next.disabled = track.scrollLeft >= max;
        
        const idx = Math.max(0, Math.round(track.scrollLeft / w));
        const perView = Math.max(1, Math.round(track.clientWidth / w));
        const from = idx + 1, to = Math.min(idx + perView, total);
        
        if (counter) counter.innerHTML = `<span class="sc-now">${from === to ? pad(from) : pad(from) + "–" + pad(to)}</span> / ${pad(total)}`;
        if (fill) fill.style.transform = `scaleX(${max > 0 ? track.scrollLeft / max : 0})`;
      }, 100);
      
      track.addEventListener("scroll", () => { 
        if (hint) hint.classList.add("hide"); 
        requestAnimationFrame(updateHUD); 
      }, { passive: true });
      
      window.addEventListener("resize", updateHUD);
      updateHUD();
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎀 LISTÓN CON APARICIÓN AL SCROLL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 INICIALIZACIÓN PRINCIPAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  async function init() {
    applyTheme();
    injectSEO();
    
    buildHeader();
    buildHero();
    
    buildStory();
    await loadServicesFromDB();
    buildServices();
    buildTeam();
    buildGallery();
    buildPhilosophy();
    buildEcommerce();
    initEcommerceParticles();
    buildBlog();
    initBlogInkEffect();
    initBlogParticles();
    initBlogParallax();
    buildLocation();
    buildAppointments();
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
    if (C.effects?.servicesLight !== false) initServicesLight();
    
    setTimeout(initMagnetic, C.loader.duration + 600);
    
    buildTestimonials();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();