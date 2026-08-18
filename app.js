/* ============================================================
   APP.JS — SISTEMA WEB MULTI-GIRO (v2026.08)
   ÍNDICE:
   01 Utilidades globales        15 Testimonios
   02 Tema                       16 Blog
   03 SEO dinámico               17 Contacto
   04 Hero Stars                 18 Footer
   05 Barra de progreso          19 Scroll Reveal
   06 Loader                     20 Parallax Engine
   07 Header / Nav               21 Cursor personalizado
   08 Hero + Typewriter          22 Smooth Scroll
   09 Historia                   23 Grain Toggle
   10 Servicios                  24 Counters
   11 Galería                    25 Magnetic Effect
   12 Filosofía                  26 Ubicación
   13 E-commerce                 27 Citas
   14 Colabora B2B               28 Inicialización
   ============================================================ */

(function () {
"use strict";

const C = SITE_CONFIG;

// ============ 01 UTILIDADES GLOBALES ============
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

// ============ 02 TEMA ============
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

// ============ 03 SEO DINÁMICO ============
function upsertMeta(attr, key, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
    }
    tag.content = content;
}

function injectSEO() {
    const S = C.seo || {};
    const brand = (C.header?.logo?.text || "") + (C.header?.logo?.highlight || "");

    // <title>
    const title = S.title || brand || document.title;
    document.title = title;

    // meta description (config → primer párrafo de historia → subtítulo hero → default)
    const firstParagraph = C.story?.paragraphs?.[0];
    const description = S.description
        || (firstParagraph ? firstParagraph.substring(0, 155) : "")
        || C.hero?.subtitle
        || "Estudio creativo especializado en diseño digital, branding y desarrollo web de alto impacto en México.";
    upsertMeta('name', 'description', description);

    // theme-color (config → según modo claro/oscuro del tema)
    const themeColor = S.themeColor
        || (C.theme?.mode === "light" ? C.theme?.bg : C.theme?.dark)
        || "#0a0a0a";
    upsertMeta('name', 'theme-color', themeColor);

    // robots
    upsertMeta('name', 'robots', S.robots || "index, follow");

    // Open Graph
    const ogImage = S.ogImage || C.hero?.backgroundImage || "";
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:locale', S.locale || 'es_MX');
    upsertMeta('property', 'og:site_name', brand);
    upsertMeta('property', 'og:url', S.ogUrl || (location.origin + location.pathname));
    if (ogImage) upsertMeta('property', 'og:image', ogImage);

    // Twitter Cards
    upsertMeta('name', 'twitter:card', S.twitterCard || "summary_large_image");
    if (S.twitterSite) upsertMeta('name', 'twitter:site', S.twitterSite);
    if (ogImage) upsertMeta('name', 'twitter:image', ogImage);
}

// ============ 04 HERO STARS ============
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

// ============ 05 BARRA DE PROGRESO ============
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

// ============ 06 LOADER ============
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

    const duration = C.loader?.duration || 2200;

    const startCount = () => {
        loader.classList.add("ready");   // 🔓 destraba las animaciones CSS
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const progress = eased * 100;
            if (titleFill) titleFill.style.width = progress + "%";
            if (percentage) percentage.textContent = Math.round(progress) + "%";
            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                setTimeout(() => {
                    loader.classList.add("hidden");
                    setTimeout(() => { if (isBlockEnabled("hero")) animateHero(); }, 800);
                }, 400);
            }
        };
        requestAnimationFrame(tick);
    };

    // Espera la tipografía del título (máx. 900ms) → sin swap a mitad de animación
    if (document.fonts && document.fonts.ready) {
        Promise.race([
            document.fonts.ready,
            new Promise(res => setTimeout(res, 900))
        ]).then(startCount);
    } else {
        setTimeout(startCount, 250);
    }
}

// ── LOADER MAESTRO: tagline + duración sincronizada ──
(function () {
  const C = typeof SITE_CONFIG !== 'undefined' ? SITE_CONFIG : null;
  const boot = () => {
    const loader = document.querySelector('.loader');
    const inner = document.querySelector('.loader-inner');
    if (loader && C?.loader?.duration) {
      loader.style.setProperty('--loader-ms', C.loader.duration + 'ms');
    }
    const tag = C?.loader?.tagline || '';
    if (inner && tag && !inner.querySelector('.loader-tagline')) {
      const el = document.createElement('p');
      el.className = 'loader-tagline';
      el.textContent = tag;
      inner.appendChild(el);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

// ============ 07 HEADER / NAV ============
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

async function loadHeroFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("hero").select("*")
            .eq("is_active", true)
            .order("id", { ascending: true })
            .limit(1);
        if (error) throw error;
        const r = data && data[0];
        if (r) {
            C.hero = Object.assign({}, C.hero, {
                eyebrow: r.eyebrow || C.hero?.eyebrow || "",
                subtitle: r.subtitle || C.hero?.subtitle || "",
                backgroundImage: r.background_image || C.hero?.backgroundImage || "",
                sealImage: r.seal_image || C.hero?.sealImage || "",
                cta: r.cta_label || C.hero?.cta || "",
                ctaHref: r.cta_href || C.hero?.ctaHref || "#appointments",
                title: {
                    line1: r.title_line1 || C.hero?.title?.line1 || "",
                    line2: r.title_line2 || C.hero?.title?.line2 || "",
                    typewriterWords: (r.typewriter_words && r.typewriter_words.length)
                        ? r.typewriter_words
                        : (C.hero?.title?.typewriterWords || [])
                }
            });
            if (r.seal_image) document.documentElement.style.setProperty("--hero-seal-img", `url("${r.seal_image}")`);
        }
    } catch (e) { console.warn("Hero no disponible —", e.message); }
}

// ============ 08 HERO ============
function buildHero() {
    if (!isBlockEnabled("hero") || !C.hero || (!C.hero.title?.line1 && !C.hero.subtitle)) {
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

// ============ TYPEWRITER ============
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

async function loadStoryFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("story").select("*")
            .eq("is_active", true)
            .order("id", { ascending: true })
            .limit(1);
        if (error) throw error;
        const r = data && data[0];
        if (r) {
            C.story = Object.assign({}, C.story, {
                label: r.label || C.story?.label || "",
                heading: r.heading || C.story?.heading || "",
                image: r.image || C.story?.image || "",
                paragraphs: (r.paragraphs && r.paragraphs.length) ? r.paragraphs : (C.story?.paragraphs || []),
                stats: (r.stats && r.stats.length) ? r.stats : (C.story?.stats || []),
                partners: {
                    enabled: !!r.partners_enabled,
                    title: r.partners_title || C.story?.partners?.title || "",
                    logos: (r.partners || []).map(p => ({ name: p.name, img: p.img || "" }))
                }
            });
            C.story.paragraphs = C.story.paragraphs || [];
            C.story.stats = C.story.stats || [];
        }
    } catch (e) { console.warn("Historia no disponible —", e.message); }
}

// ============ 09 HISTORIA ============
function buildStory() {
    if (!isBlockEnabled("story") || !C.story || (!C.story.heading && !(C.story.paragraphs || []).length)) {
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
    
    const pTrack = inner.querySelector('.partners-track');
    if (pTrack) {
        const restart = () => { pTrack.style.animation = 'none'; void pTrack.offsetWidth; pTrack.style.animation = ''; };
        pTrack.querySelectorAll('img').forEach(img => {
            if (img.complete) requestAnimationFrame(restart);
            else img.addEventListener('load', restart, { once: true });
        });
    }
}

// ============ 10 SERVICIOS ============
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
    return String(text).split(/\n+/).map(par => {
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

// ============ LUZ QUE CAE EN SERVICIOS ============
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

async function loadGalleryFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("gallery").select("*")
            .eq("is_active", true)
            .order("sort", { ascending: true })
            .order("created_at", { ascending: true });
        if (error) throw error;
        if (data && data.length) {
            C.gallery.items = data.map(r => ({ image: r.image, caption: r.caption || "" }));
        }
    } catch (e) { console.warn("Galería no disponible —", e.message); }
}

// ============ 11 GALERÍA ============
function buildGallery() {
    if (!isBlockEnabled("gallery") || !(C.gallery.items || []).length) {
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
            snapPositions.push(lite ? (paddingLeft - slide.offsetLeft) : (wrapperCenter - c));
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

async function loadPhilosophyFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("philosophy").select("*")
            .eq("is_active", true)
            .order("id", { ascending: true })
            .limit(1);
        if (error) throw error;
        const r = data && data[0];
        if (r) {
            C.philosophy = Object.assign({}, C.philosophy, {
                label: r.label || C.philosophy?.label || "",
                quote: r.quote || C.philosophy?.quote || "",
                author: r.author || C.philosophy?.author || "",
                cta: r.cta_label || C.philosophy?.cta || "",
                ctaHref: r.cta_href || C.philosophy?.ctaHref || ""
            });
        }
    } catch (e) { console.warn("Filosofía no disponible —", e.message); }
}

// ============ 12 FILOSOFÍA ============
function buildPhilosophy() {
    if (!isBlockEnabled("philosophy") || !C.philosophy || !C.philosophy.quote) {
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

// ============ 13 E-COMMERCE ============
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

async function loadCollabFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("collab").select("*")
            .eq("is_active", true)
            .order("id", { ascending: true })
            .limit(1);
        if (error) throw error;
        const r = data && data[0];
        if (r) {
            C.collab = Object.assign({}, C.collab, {
                label: r.label || "",
                heading: r.heading || "",
                subtitle: r.subtitle || "",
                marquee: (r.marquee && r.marquee.length) ? r.marquee : (C.collab?.marquee || []),
                points: (r.points && r.points.length) ? r.points : (C.collab?.points || []),
                cta: r.cta || "",
                brochureUrl: r.brochure_url || "",
                ctaSecondary: r.cta_secondary || "",
                whatsapp: r.whatsapp || ""
            });
        }
    } catch (e) { console.warn("Colabora no disponible —", e.message); }
}

// ============ 14 COLABORA B2B ============
function buildCollab() {
    if (!isBlockEnabled("collab") || !C.collab || (!C.collab.heading && !(C.collab.points || []).length)) {
        const section = $("#collab");
        if (section) section.style.display = "none";
        return;
    }
    
    const K = C.collab;
    const inner = $("#collabInner");
    if (!inner) return;
    
    const marqueeHTML = (K.marquee || []).map(m =>
        `<span class="collab-marquee-item">${escapeHtml(m)}<i aria-hidden="true">✦</i></span>`).join("");
    
    inner.innerHTML = `
        <div class="collab-marquee" aria-hidden="true">
            <div class="collab-marquee-track">
                <div class="collab-marquee-group">${marqueeHTML}</div>
                <div class="collab-marquee-group">${marqueeHTML}</div>
            </div>
        </div>
        <div class="collab-card reveal">
            <div class="collab-glow" aria-hidden="true"></div>
            <span class="collab-badge"><i class="fa-solid fa-handshake" aria-hidden="true"></i> Programa B2B</span>
            <span class="section-label">${escapeHtml(K.label || "")}</span>
            <h2 class="section-heading">${K.heading}</h2>
            <p class="collab-subtitle">${K.subtitle}</p>
            <div class="collab-points">
                ${(K.points || []).map((p, i) => `
                    <div class="collab-point reveal reveal-delay-${i + 1}">
                        <i class="fa-solid ${p.icon}" aria-hidden="true"></i>
                        <h3>${escapeHtml(p.title)}</h3>
                        <p>${escapeHtml(p.desc)}</p>
                    </div>`).join("")}
            </div>
            <div class="collab-ctas reveal reveal-delay-3">
                ${K.brochureUrl ? `<a class="collab-cta" href="${K.brochureUrl}" target="_blank" rel="noopener">
                    <i class="fa-solid fa-file-pdf" aria-hidden="true"></i><span>${escapeHtml(K.cta || "Ver folleto")}</span></a>` : ""}
                ${K.whatsapp ? `<a class="collab-cta ghost" href="https://wa.me/${K.whatsapp}?text=${encodeURIComponent("Hola, me interesa el programa de proveedor de postres.")}" target="_blank" rel="noopener">
                    <i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>${escapeHtml(K.ctaSecondary || "Escríbenos")}</span></a>` : ""}
            </div>
        </div>
    `;
}

async function loadSeasonFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from('site_settings').select('value').eq('key', 'season').maybeSingle();
        
        if (error) throw error;
        
        if (data && data.value) {
            const s = data.value;
            const base = C.season || {};
            C.season = Object.assign({}, base, s);
            C.season.product = Object.assign({}, base.product || {}, s.product || {});
        }
    } catch (e) {}
}

// ============ COTIZADOR ============
async function loadCakeBookings() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return {};
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("cake_bookings").select("order_date, status");
        
        if (error) throw error;
        
        const map = {};
        (data || []).forEach(r => {
            if (r.status === "cancelled") return;
            map[r.order_date] = (map[r.order_date] || 0) + 1;
        });
        return map;
    } catch (e) { console.warn("Cotizador: fechas ocupadas no disponibles —", e.message); return {}; }
}

async function loadCotizadorFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from('site_settings').select('value').eq('key', 'cotizador').maybeSingle();
        
        if (error) throw error;
        
        if (data && data.value) {
            const s = data.value;
            const base = C.cotizador || {};
            C.cotizador = Object.assign({}, base, s);
            C.cotizador.delivery = Object.assign({}, base.delivery || {}, s.delivery || {});
        }
    } catch (e) { console.warn('Cotizador: usando config.js —', e.message); }
}

function buildCotizador() {
    const section = $("#cotizador");
    if (!isBlockEnabled("cotizador") || !C.cotizador) { if (section) section.style.display = "none"; return; }
    
    const K = C.cotizador;
    const inner = $("#cotizadorInner");
    if (!inner) return;
    
    const fmt = n => new Intl.NumberFormat("es-MX", { style: "currency", currency: K.currency || "MXN", minimumFractionDigits: 0 }).format(n || 0);
    const st = { size: 0, filling: 0, deco: 0, extras: new Set(), qty: 1, delivery: "pickup", date: null };
    
    const MIN_DAYS = K.minDaysAhead ?? 3;
    const MAX_PER_DAY = K.maxPerDay ?? 1;
    const pad = n => String(n).padStart(2, "0");
    const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const today0 = new Date(); today0.setHours(0, 0, 0, 0);
    const minDate = new Date(today0); minDate.setDate(minDate.getDate() + MIN_DAYS);
    
    let bookedMap = {};
    let viewMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const isFull = key => (bookedMap[key] || 0) >= MAX_PER_DAY;
    
    const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const SEMANA = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];
    const DIAS_L = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
    
    const fmtDateLong = key => {
        if (!key) return "";
        const [y, m, d] = key.split("-").map(Number);
        return `${DIAS_L[new Date(y, m - 1, d).getDay()]} ${pad(d)}/${pad(m)}/${y}`;
    };
    
    function renderCalendar() {
        const cal = $("#cotizCalendar");
        if (!cal) return;
        
        const y = viewMonth.getFullYear(), m = viewMonth.getMonth();
        const firstDay = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const canPrev = viewMonth > new Date(today0.getFullYear(), today0.getMonth(), 1);
        const canNext = viewMonth < new Date(today0.getFullYear(), today0.getMonth() + 3, 1);
        
        let cells = "";
        for (let i = 0; i < firstDay; i++) cells += `<span class="cal-empty"></span>`;
        
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(y, m, d);
            const key = toKey(date);
            const past = date < minDate;
            const full = isFull(key);
            cells += `<button type="button" class="cal-day${st.date === key ? " sel" : ""}${full && !past ? " full" : ""}" data-date="${key}" ${(past || full) ? "disabled" : ""} title="${full ? "Día ocupado" : ""}">${d}</button>`;
        }
        
        cal.innerHTML = `
            <div class="cal-head">
                <button type="button" class="cal-nav" data-cal="prev" ${canPrev ? "" : "disabled"} aria-label="Mes anterior">‹</button>
                <span class="cal-title">${MESES[m]} ${y}</span>
                <button type="button" class="cal-nav" data-cal="next" ${canNext ? "" : "disabled"} aria-label="Mes siguiente">›</button>
            </div>
            <div class="cal-week">${SEMANA.map(d => `<span>${d}</span>`).join("")}</div>
            <div class="cal-grid">${cells}</div>
            <div class="cal-legend">
                <span><i class="dot ok"></i> Disponible</span>
                <span><i class="dot no"></i> Ocupado</span>
                <span><i class="dot sel"></i> Elegido</span>
            </div>`;
    }
    
    const chipGroup = (items, group) => items.map((it, i) => `
        <button type="button" class="cotiz-chip${i === 0 ? " active" : ""}" data-group="${group}" data-idx="${i}">
            <span>${escapeHtml(it.label)}</span>${it.add ? `<em>+${fmt(it.add)}</em>` : ""}
        </button>`).join("");
    
    inner.innerHTML = `
        <div class="cotiz-header">
            <span class="section-label reveal">${K.label}</span>
            <h2 class="section-heading reveal reveal-delay-1">${K.heading}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="reveal reveal-delay-3">${K.subtitle}</p>
        </div>
        <div class="cotiz-card reveal reveal-delay-2">
            <div class="cotiz-grid">
                <div class="cotiz-options">
                    <div class="cotiz-group"><h4>1 · Elige el tamaño</h4><div class="cotiz-chips">${chipGroup(K.sizes, "size")}</div></div>
                    <div class="cotiz-group"><h4>2 · Elige el relleno</h4><div class="cotiz-chips">${chipGroup(K.fillings, "filling")}</div></div>
                    <div class="cotiz-group"><h4>3 · Elige la decoración</h4><div class="cotiz-chips">${chipGroup(K.decorations, "deco")}</div></div>
                    <div class="cotiz-group"><h4>4 · Extras (opcional)</h4><div class="cotiz-chips">${(K.extras || []).map((it, i) => `
                        <button type="button" class="cotiz-chip" data-group="extras" data-idx="${i}">
                            <span>${escapeHtml(it.label)}</span>${it.add ? `<em>+${fmt(it.add)}</em>` : ""}
                        </button>`).join("")}</div></div>
                    <div class="cotiz-group">
                        <h4>5 · Fecha de entrega (mínimo ${MIN_DAYS} días de preparación)</h4>
                        <div class="cotiz-calendar" id="cotizCalendar"></div>
                        <p class="cotiz-date-pick" id="cotizDatePick"></p>
                    </div>
                    <div class="cotiz-row">
                        <div class="cotiz-group" style="margin-bottom:0;">
                            <h4>Cantidad</h4>
                            <div class="cotiz-qty">
                                <button type="button" data-qty="-1" aria-label="Menos">−</button>
                                <span class="n" id="cotizQty">1</span>
                                <button type="button" data-qty="1" aria-label="Más">+</button>
                            </div>
                        </div>
                        <div class="cotiz-group" style="margin-bottom:0;">
                            <h4>Entrega</h4>
                            <div class="cotiz-chips">
                                <button type="button" class="cotiz-chip active" data-delivery="pickup"><span>🏪 ${escapeHtml(K.delivery?.pickupLabel || "Recoger en tienda")}</span></button>
                                <button type="button" class="cotiz-chip" data-delivery="delivery"><span>🚗 ${escapeHtml(K.delivery?.deliveryLabel || "Envío a domicilio")}</span></button>
                            </div>
                        </div>
                    </div>
                </div>
                <aside class="cotiz-summary">
                    <h4>Tu cotización</h4>
                    <ul class="cotiz-breakdown" id="cotizBreakdown"></ul>
                    <div class="cotiz-total"><span>Total estimado</span><span class="n" id="cotizTotal">$0</span></div>
                    <p class="cotiz-delivery-note" id="cotizDeliveryNote"></p>
                    <button type="button" class="cotiz-cta" id="cotizCta"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>${escapeHtml(K.cta || "Enviar cotización por WhatsApp")}</span></button>
                    <p class="cotiz-msg" id="cotizMsg"></p>
                    <p class="cotiz-note">${escapeHtml(K.note || "*Precio estimado. El precio final se confirma al realizar tu pedido.")}</p>
                </aside>
            </div>
        </div>
    `;
    
    const unitPrice = () => {
        let p = (K.sizes[st.size]?.price || 0) + (K.fillings[st.filling]?.add || 0) + (K.decorations[st.deco]?.add || 0);
        st.extras.forEach(i => { p += (K.extras[i]?.add || 0); });
        return p;
    };
    
    function recalc() {
        const lines = [
            [`Tamaño · ${K.sizes[st.size]?.label || ""}`, fmt(K.sizes[st.size]?.price || 0)],
            [`Relleno · ${K.fillings[st.filling]?.label || ""}`, (K.fillings[st.filling]?.add || 0) ? `+${fmt(K.fillings[st.filling].add)}` : "Incluido"],
            [`Decoración · ${K.decorations[st.deco]?.label || ""}`, (K.decorations[st.deco]?.add || 0) ? `+${fmt(K.decorations[st.deco].add)}` : "Incluida"],
        ];
        
        st.extras.forEach(i => lines.push([`Extra · ${K.extras[i]?.label || ""}`, (K.extras[i]?.add || 0) ? `+${fmt(K.extras[i].add)}` : "Incluido"]));
        
        if (st.qty > 1) lines.push(["Cantidad", `×${st.qty}`]);
        if (st.date) lines.push([`Entrega · ${fmtDateLong(st.date)}`, "📅"]);
        
        const bd = $("#cotizBreakdown");
        if (bd) bd.innerHTML = lines.map(l => `<li><span>${escapeHtml(l[0])}</span><span>${l[1]}</span></li>`).join("");
        
        const tEl = $("#cotizTotal");
        if (tEl) tEl.textContent = fmt(unitPrice() * st.qty);
        
        const qEl = $("#cotizQty");
        if (qEl) qEl.textContent = st.qty;
        
        const note = $("#cotizDeliveryNote");
        if (note) note.textContent = st.delivery === "delivery"
            ? `🚗 ${K.delivery?.deliveryNote || "El envío a domicilio tiene un costo extra que depende del trayecto. Lo confirmamos al confirmar tu pedido."}`
            : `🏪 ${K.delivery?.pickupNote || "Recoger en tienda no tiene costo extra."}`;
        
        const dp = $("#cotizDatePick");
        if (dp) dp.textContent = st.date ? `✅ Entrega: ${fmtDateLong(st.date)}` : `Elige una fecha disponible (mínimo ${MIN_DAYS} días de preparación)`;
        
        const msg = $("#cotizMsg");
        if (msg) msg.textContent = "";
    }
    
    inner.addEventListener("click", async (e) => {
        const navBtn = e.target.closest("[data-cal]");
        if (navBtn && !navBtn.disabled) {
            viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + (navBtn.dataset.cal === "next" ? 1 : -1), 1);
            renderCalendar();
            return;
        }
        
        const dayBtn = e.target.closest(".cal-day");
        if (dayBtn && !dayBtn.disabled) {
            st.date = dayBtn.dataset.date;
            renderCalendar();
            recalc();
            return;
        }
        
        const chip = e.target.closest(".cotiz-chip");
        const qtyBtn = e.target.closest("[data-qty]");
        const cta = e.target.closest("#cotizCta");
        
        if (chip) {
            const g = chip.dataset.group;
            if (g === "extras") {
                const i = Number(chip.dataset.idx);
                st.extras.has(i) ? st.extras.delete(i) : st.extras.add(i);
                chip.classList.toggle("active", st.extras.has(i));
            } else if (chip.dataset.delivery) {
                st.delivery = chip.dataset.delivery;
                inner.querySelectorAll("[data-delivery]").forEach(b => b.classList.toggle("active", b === chip));
            } else {
                st[g] = Number(chip.dataset.idx);
                inner.querySelectorAll(`.cotiz-chip[data-group="${g}"]`).forEach(b => b.classList.toggle("active", b === chip));
            }
            recalc();
            return;
        }
        
        if (qtyBtn) { st.qty = Math.min(10, Math.max(1, st.qty + Number(qtyBtn.dataset.qty))); recalc(); return; }
        
        if (cta) {
            const msg = $("#cotizMsg");
            if (!st.date) {
                if (msg) msg.textContent = "⚠️ Elige una fecha de entrega disponible en el calendario.";
                $("#cotizCalendar")?.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }
            
            if (isFull(st.date)) {
                if (msg) msg.textContent = "⚠️ Esa fecha acaba de ocuparse. Elige otra.";
                st.date = null; renderCalendar(); recalc();
                return;
            }
            
            const total = unitPrice() * st.qty;
            const extraNames = [...st.extras].map(i => K.extras[i]?.label).filter(Boolean);
            
            try {
                if (typeof window.supabase !== "undefined" && C.supabase?.url) {
                    const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
                    const { error } = await sb.from("cake_bookings").insert([{
                        order_date: st.date,
                        customer_name: null,
                        details: { size: K.sizes[st.size]?.label, filling: K.fillings[st.filling]?.label, deco: K.decorations[st.deco]?.label, extras: extraNames, qty: st.qty, delivery: st.delivery, total },
                        status: "pending"
                    }]);
                    if (!error) bookedMap[st.date] = (bookedMap[st.date] || 0) + 1;
                }
            } catch (err) { console.warn("No se registró el pedido:", err); }
            
            renderCalendar();
            
            let m = `🎂 *Cotización de pastel*\n`;
            m += `▪️ *Tamaño:* ${K.sizes[st.size]?.label}\n`;
            m += `▪️ *Relleno:* ${K.fillings[st.filling]?.label}\n`;
            m += `▪️ *Decoración:* ${K.decorations[st.deco]?.label}\n`;
            if (extraNames.length) m += `▪️ *Extras:* ${extraNames.join(", ")}\n`;
            m += `▪️ *Cantidad:* ${st.qty}\n`;
            m += `📅 *Entrega:* ${fmtDateLong(st.date)}\n`;
            m += st.delivery === "delivery"
                ? `🚗 *A domicilio* (costo de envío según trayecto, se confirma al confirmar)\n`
                : `🏪 *Recoger en tienda*\n`;
            m += `*Total estimado: ${fmt(total)}*\n_Enviado desde el cotizador del sitio web_`;
            
            window.open(`https://wa.me/${K.whatsapp || "521234567890"}?text=${encodeURIComponent(m)}`, "_blank");
        }
    });
    
    recalc();
    renderCalendar();
    loadCakeBookings().then(map => { bookedMap = map; renderCalendar(); });
}

// ============ TEMPORADA ============
let seasonTimer = null;

function buildSeason() {
    const section = $("#season");
    if (!isBlockEnabled("season") || !C.season) {
        if (section) section.style.display = "none";
        return;
    }
    
    const K = C.season;
    const inner = $("#seasonInner");
    if (!inner) return;
    
    const end = K.endDate ? new Date(K.endDate) : null;
    if (end && !isNaN(end.getTime()) && end.getTime() <= Date.now()) {
        section.style.display = "none";
        return;
    }
    
    const marqueeHTML = (K.marquee || []).map(m =>
        `<span class="season-marquee-item">${escapeHtml(m)}<i aria-hidden="true">✦</i></span>`).join("");
    
    inner.innerHTML = `
        <div class="season-marquee" aria-hidden="true">
            <div class="season-marquee-track">
                <div class="season-marquee-group">${marqueeHTML}</div>
                <div class="season-marquee-group">${marqueeHTML}</div>
            </div>
        </div>
        <div class="season-card reveal">
            <div class="season-glow" aria-hidden="true"></div>
            <div class="season-media reveal-left">
                <span class="season-badge">${escapeHtml(K.product?.badge || "Edición limitada")}</span>
                <img src="${K.product?.image || ""}" alt="${escapeHtml(K.product?.name || "Producto de temporada")}" loading="lazy">
            </div>
            <div class="season-info reveal-right">
                <span class="section-label">${escapeHtml(K.label || "Temporada")}</span>
                <h2 class="section-heading">${K.heading}</h2>
                <p class="season-subtitle">${K.subtitle}</p>
                <h3 class="season-product-name">${escapeHtml(K.product?.name || "")}</h3>
                <p class="season-product-desc">${escapeHtml(K.product?.desc || "")}</p>
                ${K.product?.price ? `
                    <div class="season-price">
                        <span class="now">$${Number(K.product.price).toLocaleString("es-MX")}</span>
                        ${K.product.originalPrice ? `<span class="was">$${Number(K.product.originalPrice).toLocaleString("es-MX")}</span>` : ""}
                    </div>` : ""}
                ${end ? `<div class="season-countdown" role="timer" aria-label="Tiempo restante de la temporada">
                    <div class="season-count"><span class="n" id="scD">--</span><span class="l">días</span></div>
                    <div class="season-count"><span class="n" id="scH">--</span><span class="l">hrs</span></div>
                    <div class="season-count"><span class="n" id="scM">--</span><span class="l">min</span></div>
                    <div class="season-count"><span class="n" id="scS">--</span><span class="l">seg</span></div>
                </div>` : ""}
                <div class="season-ctas">
                    ${K.whatsapp ? `<a class="season-cta" href="https://wa.me/${K.whatsapp}?text=${encodeURIComponent(K.waMessage || ("Hola, me interesa el producto de temporada: " + (K.product?.name || "")))}" target="_blank" rel="noopener">
                        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i><span>${escapeHtml(K.cta || "Apartar la mía")}</span></a>` : ""}
                </div>
            </div>
        </div>
    `;
    
    if (end) {
        const d = $("#scD"), h = $("#scH"), m = $("#scM"), s = $("#scS");
        const pad = n => String(n).padStart(2, "0");
        
        const tick = () => {
            const diff = end.getTime() - Date.now();
            if (diff <= 0) { clearInterval(seasonTimer); section.style.display = "none"; return; }
            
            if (d) d.textContent = pad(Math.floor(diff / 86400000));
            if (h) h.textContent = pad(Math.floor(diff / 3600000) % 24);
            if (m) m.textContent = pad(Math.floor(diff / 60000) % 60);
            
            if (s) {
                const v = pad(Math.floor(diff / 1000) % 60);
                if (s.textContent !== v) { s.textContent = v; s.classList.remove("tick"); void s.offsetWidth; s.classList.add("tick"); }
            }
        };
        
        tick();
        seasonTimer = setInterval(tick, 1000);
    }
}

// ============ 15 TESTIMONIOS ============
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

// ============ 16 BLOG ============
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
                setTimeout(() => section.classList.add("blog_visible"), 200);
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

// ============ 17 CONTACTO ============
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

// ============ 18 FOOTER ============
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

// ============ 19 SCROLL REVEAL ============
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

// ============ 20 PARALLAX ENGINE ============
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

// ============ 21 CURSOR PERSONALIZADO ============
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

// ============ 22 SMOOTH SCROLL ============
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

// ============ 23 GRAIN TOGGLE ============
function initGrain() {
    if (!C.effects.grainEnabled) {
        const grain = $(".grain-overlay");
        if (grain) grain.style.display = "none";
    }
}

// ============ 24 COUNTERS ============
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

// ============ 25 MAGNETIC EFFECT ============
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

async function loadLocationFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("location").select("*")
            .eq("is_active", true)
            .order("id", { ascending: true })
            .limit(1);
        if (error) throw error;
        const r = data && data[0];
        if (r) {
            C.location = Object.assign({}, C.location, {
                label: r.label || C.location?.label || "",
                heading: r.heading || C.location?.heading || "",
                subtitle: r.subtitle || C.location?.subtitle || "",
                address: r.address || C.location?.address || "",
                phone: r.phone || C.location?.phone || "",
                phoneHref: r.phone_href || C.location?.phoneHref || "",
                hours: (r.hours && r.hours.length) ? r.hours : (C.location?.hours || []),
                image: r.image || C.location?.image || "",
                mapsQuery: r.maps_query || C.location?.mapsQuery || ""
            });
        }
    } catch (e) { console.warn("Ubicación no disponible —", e.message); }
}

// ============ 26 UBICACIÓN ============
function buildLocation() {
    if (!isBlockEnabled("location") || !C.location || !C.location.mapsQuery) {
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

// ============ 27 CITAS ============
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
        
        let m = `📅 *Solicitud de cita*\n`;
        m += `▪️ *Nombre:* ${data.name}\n`;
        m += `▪️ *Teléfono:* ${data.phone}\n`;
        m += `▪️ *Fecha:* ${data.date}\n`;
        m += `▪️ *Horario:* ${data.slot}\n`;
        
        if (data.reason) m += `▪️ *Motivo:* ${data.reason}\n`;
        m += `\n_Enviado desde el sitio web_`;
        
        window.open(`https://wa.me/${wa}?text=${encodeURIComponent(m)}`, "_blank");
        
        btn.disabled = false;
        form.reset();
        showApptMsg(saved ? (C.appointments.successMessage || "¡Solicitud enviada!") : "Te llevamos a WhatsApp para completar tu cita.", "success");
    });
}

// ============ LISTÓN CON APARICIÓN AL SCROLL ============
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

// ============ 28 INICIALIZACIÓN ============
async function init() {
    window.LANG = localStorage.getItem("site-lang") || (C.lang?.default || "es");
    document.documentElement.lang = window.LANG;
    if (window.LANG === "en") applyEnOverrides(C);
    
    applyTheme();
    await loadHeroFromDB();
    injectSEO();
    buildHeader();
    buildHero();
    await loadStoryFromDB();
    buildStory();
    await loadServicesFromDB();
    buildServices();
    await loadMenuFromDB();
    buildMenu();
    await loadBusinessFromDB();
    injectStructuredData();
    renderFAQBlock();
    buildLangSwitcher();
    translateUI();
    await loadBeforeAfterFromDB();
    buildBeforeAfter();
    await loadPlansFromDB();
    buildPlans();
    await loadClassesFromDB();
    buildClasses();
    await loadTeamFromDB();
    buildTeam();
    await loadGalleryFromDB();
    buildGallery();
    await loadPhilosophyFromDB();
    buildPhilosophy();
    buildEcommerce();
    initEcommerceParticles();
    await loadCollabFromDB();
    buildCollab();
    await loadSeasonFromDB();
    await loadCotizadorFromDB();
    buildCotizador();
    buildSeason();
    buildBlog();
    initBlogInkEffect();
    initBlogParticles();
    initBlogParallax();
    await loadLocationFromDB();
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

// ============ MENÚ v2 ============
async function loadMenuFromDB() {
    window.__menuItems = [];
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("menu_items").select("*")
            .eq("is_active", true)
            .order("sort", { ascending: true })
            .order("created_at", { ascending: true });
        if (error) throw error;
        window.__menuItems = data || [];
    } catch (e) { console.warn("Menú no disponible —", e.message); }
}

function buildMenu() {
    const section = $("#menu");
    if (!section) return;
    
    const cfg = C.menu || {};
    const groups = [];
    
    (cfg.categories || []).forEach(c => groups.push({ name: c.name, items: [...(c.items || [])] }));
    
    (window.__menuItems || []).forEach(r => {
        const catName = (r.category || "General").trim();
        let g = groups.find(x => x.name.toLowerCase() === catName.toLowerCase());
        if (!g) { g = { name: catName, items: [] }; groups.push(g); }
        g.items.push({ name: r.name, desc: r.description || "", price: Number(r.price) || 0, tag: r.tag || "" });
    });
    
    const hasAny = groups.some(g => g.items.length);
    if (cfg.enabled === false || !hasAny) { section.style.display = "none"; return; }
    
    section.style.display = "";
    
    const inner = $("#menuInner");
    if (!inner) return;
    
    const fmtPrice = n => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n || 0);
    
    inner.innerHTML = `
        <div class="menu-header">
            <span class="section-label reveal">${cfg.label || "Nuestro Menú"}</span>
            <h2 class="section-heading reveal reveal-delay-1">${cfg.heading || ""}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="reveal reveal-delay-3">${cfg.subtitle || ""}</p>
        </div>
        ${groups.length > 1 ? `<div class="menu-tabs reveal reveal-delay-3" id="menuTabs">
            ${groups.map((g, i) => `<button type="button" class="menu-tab${i === 0 ? " active" : ""}" data-cat="${i}">${escapeHtml(g.name)}</button>`).join("")}
        </div>` : ""}
        <div class="menu-board" id="menuBoard"></div>
        ${cfg.cta ? `<div class="menu-cta-wrap reveal reveal-delay-4">
            <a class="menu-cta" href="${cfg.ctaHref || "#contact"}"${String(cfg.ctaHref || "").startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>
                <span>${escapeHtml(cfg.cta)}</span><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
            </a>
        </div>` : ""}
    `;
    
    const board = $("#menuBoard");
    
    const itemHTML = (it, idx) => `
        <li class="menu-item" data-idx="${idx}">
            <div class="menu-item-main">
                <span class="menu-item-name">${escapeHtml(it.name)}${it.tag ? `<em class="menu-item-tag">${escapeHtml(it.tag)}</em>` : ""}</span>
                <span class="menu-dots" aria-hidden="true"></span>
                <span class="menu-item-price">${fmtPrice(it.price)}</span>
            </div>
            ${it.desc ? `<p class="menu-item-desc">${escapeHtml(it.desc)}</p>` : ""}
        </li>`;
    
    function renderCat(i) {
        const g = groups[i];
        board.scrollTop = 0;
        board.innerHTML = `
            ${groups.length > 1 ? `<h3 class="menu-cat-title">${escapeHtml(g.name)}</h3>` : ""}
            <ul class="menu-list">${g.items.map(itemHTML).join("")}</ul>
        `;
    }
    
    renderCat(0);
    
    inner.addEventListener("click", e => {
        const tab = e.target.closest(".menu-tab");
        if (tab && !tab.classList.contains("active")) {
            inner.querySelectorAll(".menu-tab").forEach(b => b.classList.remove("active"));
            tab.classList.add("active");
            renderCat(Number(tab.dataset.cat));
        }
    });
}

// ============ ANTES/DESPUÉS ============
async function loadBeforeAfterFromDB() {
    window.__baItems = [];
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("before_after").select("*")
            .eq("is_active", true)
            .order("sort", { ascending: true })
            .order("created_at", { ascending: true });
        if (error) throw error;
        window.__baItems = data || [];
    } catch (e) { console.warn("Antes/Después no disponible —", e.message); }
}

function buildBeforeAfter() {
    const section = $("#beforeafter");
    if (!section) return;
    
    const cfg = C.beforeafter || {};
    const items = window.__baItems || [];
    
    if (cfg.enabled === false || !items.length) { section.style.display = "none"; return; }
    
    section.style.display = "";
    
    const inner = $("#beforeafterInner");
    if (!inner) return;
    
    inner.innerHTML = `
        <div class="ba-header">
            <span class="section-label reveal">${cfg.label || "Resultados reales"}</span>
            <h2 class="section-heading reveal reveal-delay-1">${cfg.heading || ""}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="reveal reveal-delay-3">${cfg.subtitle || ""}</p>
        </div>
        <div class="ba-grid reveal reveal-delay-3">
            ${items.map(b => `
                <div class="ba-card">
                    <div class="ba-frame" style="--ba: 50%">
                        <div class="ba-layer">
                            <div class="ba-fill" style="background-image:url('${b.after_img}')"></div>
                            <img class="ba-img" src="${b.after_img}" alt="Después: ${escapeHtml(b.title)}" loading="lazy" draggable="false">
                        </div>
                        <div class="ba-layer ba-before">
                            <div class="ba-fill" style="background-image:url('${b.before_img}')"></div>
                            <img class="ba-img" src="${b.before_img}" alt="Antes: ${escapeHtml(b.title)}" loading="lazy" draggable="false">
                        </div>
                        <div class="ba-handle"><span class="ba-grip"><i class="fa-solid fa-left-right" aria-hidden="true"></i></span></div>
                        <span class="ba-flag left">Antes</span>
                        <span class="ba-flag right">Después</span>
                    </div>
                    <div class="ba-info">
                        <h3>${escapeHtml(b.title)}</h3>
                        ${b.tag ? `<em>${escapeHtml(b.tag)}</em>` : ""}
                    </div>
                </div>`).join("")}
        </div>
    `;
    
    inner.querySelectorAll(".ba-frame").forEach(frame => {
        const img = frame.querySelector(".ba-layer:not(.ba-before) .ba-img");
        const fit = () => frame.classList.toggle("ba-wide", (img.naturalWidth || 0) > (img.naturalHeight || 0));
        
        if (img) {
            if (img.complete) fit();
            img.addEventListener("load", fit, { once: true });
        }
        
        let dragging = false;
        
        const set = x => {
            const r = frame.getBoundingClientRect();
            let pct = ((x - r.left) / r.width) * 100;
            pct = Math.max(4, Math.min(96, pct));
            frame.style.setProperty("--ba", pct + "%");
        };
        
        frame.addEventListener("pointerdown", e => { dragging = true; frame.setPointerCapture(e.pointerId); set(e.clientX); });
        frame.addEventListener("pointermove", e => { if (dragging) set(e.clientX); });
        frame.addEventListener("pointerup", () => dragging = false);
        frame.addEventListener("pointercancel", () => dragging = false);
    });
}

// ============ PLANES/MEMBRESÍAS ============
async function loadPlansFromDB() {
    window.__planItems = [];
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("plans").select("*")
            .eq("is_active", true)
            .order("sort", { ascending: true })
            .order("created_at", { ascending: true });
        if (error) throw error;
        window.__planItems = data || [];
    } catch (e) { console.warn("Planes no disponible —", e.message); }
}

function buildPlans() {
    const section = $("#plans");
    if (!section) return;
    
    const cfg = C.plans || {};
    const items = window.__planItems || [];
    
    if (cfg.enabled === false || !items.length) { section.style.display = "none"; return; }
    
    section.style.display = "";
    
    const inner = $("#plansInner");
    if (!inner) return;
    
    const fmtPrice = n => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n || 0);
    
    const waLink = p => `https://wa.me/${(cfg.whatsapp || "").replace(/\D/g, "") || "521234567890"}?text=${encodeURIComponent(`Hola, me interesa el plan ${p.name} (${fmtPrice(p.price)}/${p.period || "mes"}). ¿Me das más información?`)}`;
    
    inner.innerHTML = `
        <div class="pl-header">
            <span class="section-label reveal">${cfg.label || "Membresías"}</span>
            <h2 class="section-heading reveal reveal-delay-1">${cfg.heading || ""}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="reveal reveal-delay-3">${cfg.subtitle || ""}</p>
        </div>
        <div class="pl-grid reveal reveal-delay-3">
            ${items.map(p => `
                <div class="pl-card${p.highlighted ? " featured" : ""}">
                    ${p.highlighted ? `<span class="pl-badge">Más popular</span>` : ""}
                    <h3 class="pl-name">${escapeHtml(p.name)}</h3>
                    <div class="pl-price"><span class="n">${fmtPrice(p.price)}</span><span class="per">/ ${escapeHtml(p.period || "mes")}</span></div>
                    ${p.description ? `<p class="pl-desc">${escapeHtml(p.description)}</p>` : ""}
                    <ul class="pl-feats">
                        ${(p.features || []).map(f => `<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${escapeHtml(f)}</span></li>`).join("")}
                    </ul>
                    <a class="pl-cta" href="${waLink(p)}" target="_blank" rel="noopener">
                        <span>${escapeHtml(p.cta || "Elegir plan")}</span><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
                    </a>
                </div>`).join("")}
        </div>
        ${cfg.note ? `<p class="pl-note reveal reveal-delay-4">${escapeHtml(cfg.note)}</p>` : ""}
    `;
}

// ============ CLASES ============
async function loadClassesFromDB() {
    window.__classItems = [];
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("classes").select("*")
            .eq("is_active", true)
            .order("sort", { ascending: true })
            .order("created_at", { ascending: true });
        if (error) throw error;
        window.__classItems = data || [];
    } catch (e) { console.warn("Agenda no disponible —", e.message); }
}

const CLASS_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function buildClasses() {
    const section = $("#classes");
    if (!section) return;
    
    const cfg = C.classes || {};
    const items = window.__classItems || [];
    
    if (cfg.enabled === false || !items.length) { section.style.display = "none"; return; }
    
    section.style.display = "";
    
    const inner = $("#classesInner");
    if (!inner) return;
    
    const days = CLASS_DAYS.filter(d => items.some(c => (c.day || "").toLowerCase() === d.toLowerCase()));
    
    inner.innerHTML = `
        <div class="cl-header">
            <span class="section-label reveal">${cfg.label || "Agenda de clases"}</span>
            <h2 class="section-heading reveal reveal-delay-1">${cfg.heading || ""}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
            <p class="reveal reveal-delay-3">${cfg.subtitle || ""}</p>
        </div>
        <div class="cl-tabs reveal reveal-delay-3" id="clTabs">
            ${days.map((d, i) => `<button type="button" class="cl-tab${i === 0 ? " active" : ""}" data-day="${d}">${d.slice(0, 3)}</button>`).join("")}
        </div>
        <div class="cl-board" id="clBoard"></div>
        ${cfg.note ? `<p class="cl-note reveal reveal-delay-4">${escapeHtml(cfg.note)}</p>` : ""}
    `;
    
    const board = $("#clBoard");
    
    function renderDay(day) {
        const list = items
            .filter(c => (c.day || "").toLowerCase() === day.toLowerCase())
            .sort((a, b) => (a.time || "").localeCompare(b.time || "", undefined, { numeric: true }));
        
        board.innerHTML = `<ul class="cl-list">` + list.map(c => `
            <li class="cl-item">
                <span class="cl-time">${escapeHtml(c.time || "")}</span>
                <span class="cl-main">
                    <span class="cl-name">${escapeHtml(c.name)}</span>
                    ${c.coach ? `<span class="cl-coach">con ${escapeHtml(c.coach)}</span>` : ""}
                </span>
                ${c.level ? `<em class="cl-level">${escapeHtml(c.level)}</em>` : ""}
            </li>`).join("") + `</ul>`;
    }
    
    if (days.length) renderDay(days[0]);
    
    inner.addEventListener("click", e => {
        const tab = e.target.closest(".cl-tab");
        if (!tab || tab.classList.contains("active")) return;
        inner.querySelectorAll(".cl-tab").forEach(b => b.classList.remove("active"));
        tab.classList.add("active");
        renderDay(tab.dataset.day);
    });
}

// ============ SEO JSON-LD + FAQ ============
function addLD(obj, id) {
    const old = document.getElementById(id);
    if (old) old.remove();
    
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    el.textContent = JSON.stringify(obj);
    document.head.appendChild(el);
}

async function loadBusinessFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("business").select("*")
            .eq("is_active", true)
            .order("id", { ascending: true })
            .limit(1);
        if (error) throw error;
        const r = data && data[0];
        if (r) {
            C.business = Object.assign({}, C.business, {
                type: r.type || C.business?.type || "LocalBusiness",
                name: r.name || "",
                legalName: r.legal_name || "",
                taxId: r.tax_id || "",
                description: r.description || "",
                url: r.url || "",
                logo: r.logo || "",
                image: r.image || "",
                phone: r.phone || "",
                email: r.email || "",
                priceRange: r.price_range || C.business?.priceRange || "$$",
                address: Object.assign({ street: "", city: "", state: "", zip: "", country: "MX" }, r.address || {}),
                geo: (r.geo_lat != null && r.geo_lng != null) ? { lat: Number(r.geo_lat), lng: Number(r.geo_lng) } : (C.business?.geo || { lat: 0, lng: 0 }),
                hours: r.hours || "",
                social: (r.social && r.social.length) ? r.social : (C.business?.social || []),
                registryData: r.registry_data || "",
                faqLabel: r.faq_label || C.business?.faqLabel || "Preguntas frecuentes",
                faqHeading: r.faq_heading || C.business?.faqHeading || "",
                faq: (r.faq && r.faq.length) ? r.faq : (C.business?.faq || [])
            });
        }
    } catch (e) { console.warn("Datos del negocio no disponibles —", e.message); }
}

function injectStructuredData() {
    const B = C.business;
    if (!B) return;
    
    addLD({
        "@context": "https://schema.org",
        "@type": B.type || "LocalBusiness",
        "@id": (B.url || location.origin) + "#negocio",
        "name": B.name,
        "description": B.description,
        "url": B.url || location.origin,
        "logo": B.logo,
        "image": B.image,
        "telephone": B.phone,
        "email": B.email,
        "priceRange": B.priceRange,
        "address": B.address ? {
            "@type": "PostalAddress",
            "streetAddress": B.address.street,
            "addressLocality": B.address.city,
            "addressRegion": B.address.state,
            "postalCode": B.address.zip,
            "addressCountry": B.address.country
        } : undefined,
        "geo": B.geo ? { "@type": "GeoCoordinates", "latitude": B.geo.lat, "longitude": B.geo.lng } : undefined,
        "openingHours": B.hours,
        "sameAs": B.social
    }, "ld-business");
    
    if ((B.faq || []).length) {
        addLD({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": B.faq.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
            }))
        }, "ld-faq");
    }
    
    const items = window.__menuItems || [];
    if (C.menu && C.menu.enabled !== false && items.length) {
        const groups = {};
        items.forEach(i => {
            const cat = i.category || "General";
            (groups[cat] = groups[cat] || []).push(i);
        });
        
        addLD({
            "@context": "https://schema.org",
            "@type": "Menu",
            "name": C.menu.label || "Nuestra Carta",
            "inLanguage": "es-MX",
            "hasMenuSection": Object.entries(groups).map(([cat, list]) => ({
                "@type": "MenuSection",
                "name": cat,
                "hasMenuItem": list.map(it => ({
                    "@type": "MenuItem",
                    "name": it.name,
                    "description": it.description || "",
                    "offers": { "@type": "Offer", "price": it.price, "priceCurrency": "MXN" }
                }))
            }))
        }, "ld-menu");
    }
}

function renderFAQBlock() {
    const B = C.business;
    if (!B?.faq?.length) return;
    
    let sec = document.getElementById('faq');
    if (!sec) {
        sec = document.createElement('section');
        sec.id = 'faq';
        sec.className = 'section section-faq';
        sec.innerHTML = '<div class="section-inner" id="faqInner"></div>';
        document.querySelector('footer')?.before(sec);
    }
    
    const inner = document.getElementById('faqInner');
    if (!inner) return;
    
    inner.innerHTML = `
        <div class="faq-header">
            <span class="section-label reveal">${B.faqLabel || "Preguntas frecuentes"}</span>
            <h2 class="section-heading reveal reveal-delay-1">${B.faqHeading || "Resolvemos tus <em>dudas</em>"}</h2>
            <hr class="editorial-hr center reveal reveal-delay-2" />
        </div>
        <div class="faq-list reveal reveal-delay-3">
            ${B.faq.map(f => `
                <details class="faq-item">
                    <summary>${escapeHtml(f.q)}<span class="faq-icon" aria-hidden="true">+</span></summary>
                    <p>${escapeHtml(f.a)}</p>
                </details>`).join("")}
        </div>
    `;
}

// ============ MULTI-IDIOMA ============
window.LANG = "es";

function applyEnOverrides(obj) {
    if (Array.isArray(obj)) { obj.forEach(applyEnOverrides); return; }
    
    if (obj && typeof obj === "object") {
        Object.keys(obj).forEach(k => {
            if (k.endsWith("_en") && obj[k.slice(0, -3)] !== undefined) obj[k.slice(0, -3)] = obj[k];
        });
        Object.values(obj).forEach(applyEnOverrides);
    }
}

const ES_EN = {
    "Agendar consulta": "Book appointment", "Agendar cita": "Book appointment",
    "Solicitar cita": "Request appointment", "Enviar": "Send", "Enviar mensaje": "Send message",
    "Nombre": "Name", "Nombre completo": "Full name", "Correo": "Email",
    "Teléfono / WhatsApp": "Phone / WhatsApp", "Mensaje": "Message", "Fecha": "Date",
    "Horario": "Time slot", "Motivo": "Reason", "Carrito": "Cart", "Ver carrito": "View cart",
    "Agregar al carrito": "Add to cart", "Total": "Total", "Subtotal": "Subtotal",
    "Finalizar pedido": "Checkout", "Hacer pedido por WhatsApp": "Order via WhatsApp",
    "Ver más platillos": "See more dishes", "Elegir plan": "Choose plan", "Más popular": "Most popular",
    "Antes": "Before", "Después": "After", "Todos los derechos reservados.": "All rights reserved.",
    "Aviso de privacidad": "Privacy notice", "Términos y condiciones": "Terms & conditions",
    "Aceptar": "Accept", "Vaciar": "Empty", "Cantidad": "Quantity", "Precio": "Price",
    "Descripción": "Description", "Entrega": "Delivery", "Recoger en tienda": "Pickup at store",
    "Envío a domicilio": "Home delivery", "Ocupado": "Taken", "Disponible": "Available",
    "Leer más": "Read more", "Comentarios": "Comments", "Compartir": "Share",
    "Categorías": "Categories", "Inicio": "Home", "Contacto": "Contact",
    "Resultados": "Results", "con": "with", "Mostrando": "Showing",
};

function translateUI() {
    if (window.LANG !== "en") return;
    
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    
    while (walk.nextNode()) nodes.push(walk.currentNode);
    
    nodes.forEach(n => {
        const t = n.textContent.trim();
        if (ES_EN[t]) n.textContent = ES_EN[t];
    });
    
    document.querySelectorAll("[placeholder]").forEach(el => {
        if (ES_EN[el.placeholder]) el.placeholder = ES_EN[el.placeholder];
    });
}

function buildLangSwitcher() {
    if (!C.lang?.enabled) return;
    
    const header = document.querySelector("header");
    if (!header || document.getElementById("langSwitch")) return;
    
    header.insertAdjacentHTML("beforeend", `
        <div class="lang-switch" id="langSwitch">
            <button type="button" class="${window.LANG === "es" ? "active" : ""}" data-lang="es">ES</button>
            <button type="button" class="${window.LANG === "en" ? "active" : ""}" data-lang="en">EN</button>
        </div>`);
    
    header.addEventListener("click", e => {
        const b = e.target.closest("[data-lang]");
        if (!b || b.dataset.lang === window.LANG) return;
        localStorage.setItem("site-lang", b.dataset.lang);
        location.reload();
    });
}

async function loadTeamFromDB() {
    try {
        if (typeof window.supabase === "undefined" || !C.supabase?.url) return;
        const sb = window.__supabaseShared || (window.__supabaseShared = window.supabase.createClient(C.supabase.url, C.supabase.key));
        const { data, error } = await sb.from("team").select("*")
            .eq("is_active", true)
            .order("sort", { ascending: true })
            .order("created_at", { ascending: true });
        if (error) throw error;
        if (data && data.length) {
            C.team.items = data.map(r => ({
                photo: r.photo || "",
                name: r.name,
                cedula: r.cedula || "",
                specialty: r.specialty || "",
                bio: r.bio || "",
                phone: r.phone || "",
                whatsapp: r.whatsapp || "",
                email: r.email || "",
                schedule: r.schedule || ""
            }));
        }
    } catch (e) { console.warn("Equipo no disponible —", e.message); }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 BLOQUE: EQUIPO MÉDICO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildTeam() {
    if (!isBlockEnabled("team") || !C.team || !(C.team.items || []).length) {
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

})();