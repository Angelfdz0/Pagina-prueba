/* ============================================================
   ██████  ██████  ███    ██ ███████ ██  ██████  
   ██      ██    ██ ████   ██ ██      ██ ██       
   ██      ██    ██ ██ ██  ██ █████   ██ ██   ███ 
   ██      ██    ██ ██  ██ ██ ██      ██ ██    ██ 
   ██████  ██████  ██   ████ ██      ██  ██████  
                                                    
   ★ AQUÍ EDITAS TODO EL CONTENIDO DE TU PÁGINA ★
   Solo modifica este archivo para crear sitios 
   de cualquier negocio.
   ============================================================ */

const SITE_CONFIG = {

  // ──────────────────────────────────────────
  // 🎨 TEMA / COLORES
  // ──────────────────────────────────────────
  theme: {
    bg:           "#0a0a0a",
    bgAlt:        "#111111",
    text:         "#f0ece2",
    textMuted:    "#8a8578",
    accent:       "#c9a96e",
    accentLight:  "#e2c992",
    white:        "#ffffff",
    dark:         "#0a0a0a",
    fontDisplay:  "'Playfair Display', Georgia, serif",
    fontBody:     "'Inter', -apple-system, sans-serif",
  },

  // ──────────────────────────────────────────
  // ⏳ LOADER
  // ──────────────────────────────────────────
  loader: {
    text: "Studio",          // Texto que aparece en el loader
    duration: 2200,          // Duración en ms
  },

  // ──────────────────────────────────────────
  // 🧭 HEADER / NAVEGACIÓN
  // ──────────────────────────────────────────
  header: {
    logo: {
      text: "STU",           // Primera parte del logo
      highlight: "DIO",      // Parte resaltada (color accent)
    },
    links: [
      { label: "Inicio",     href: "#hero" },
      { label: "Historia",   href: "#story" },
      { label: "Servicios",  href: "#services" },
      { label: "Galería",    href: "#gallery" },
      { label: "Filosofía",  href: "#philosophy" },
    ],
    cta: {
      label: "Contacto",
      href: "#footer",
    },
  },

  // ──────────────────────────────────────────
  // 🏠 HERO / INTRO
  // ──────────────────────────────────────────
  hero: {
    backgroundImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
    eyebrow: "Estudio Creativo — Desde 2018",
    title: {
    line1: "Creamos",
    line2: "Experiencias",
    // ★ CAMBIO AQUÍ: array de palabras que se escribirán en bucle
    typewriterWords: ["Digitales", "Únicas", "Memorables"],
  },
  subtitle: "Diseño, estrategia y tecnología fusionados para construir marcas que trascienden lo ordinario.",
  cta: "Descubrir Más",
  ctaHref: "#story",
},

  // ──────────────────────────────────────────
  // 📖 BLOQUE 1 — HISTORIA (Scrollytelling)
  // ──────────────────────────────────────────
  story: {
    label: "Nuestra Historia",
    heading: "Donde la <em>visión</em> se convierte en realidad",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    paragraphs: [
      "Nacimos de la convicción de que cada marca merece una presencia digital que no solo se vea, sino que se sienta. Desde nuestro primer proyecto, entendimos que el diseño verdadero no decora: comunica, persuade y permanece.",
      "Hoy, nuestro estudio reúne a estrategas, diseñadores y desarrolladores que comparten una obsesión: crear experiencias digitales que dejen huella. Cada píxel, cada interacción, cada palabra está cuidadosamente orquestada para contar tu historia.",
    ],
    stats: [
      { number: "150+", label: "Proyectos" },
      { number: "12",   label: "Premios" },
      { number: "98%",  label: "Satisfacción" },
    ],
  },

  // ──────────────────────────────────────────
  // ⚙️ BLOQUE 2 — SERVICIOS
  // ──────────────────────────────────────────
  services: {
    label: "Lo Que Hacemos",
    heading: "Servicios que <em>transforman</em>",
    subtitle: "Cada servicio está diseñado para elevar tu marca al siguiente nivel, combinando estética impecable con funcionalidad estratégica.",
    items: [
      {
        number: "01",
        title: "Branding & Identidad",
        desc: "Construimos sistemas de marca completos que comunican tu esencia de forma coherente y memorable en cada punto de contacto.",
      },
      {
        number: "02",
        title: "Diseño Web & UI/UX",
        desc: "Interfaces digitales que equilibran belleza y usabilidad, diseñadas para cautivar y convertir visitantes en clientes leales.",
      },
      {
        number: "03",
        title: "Desarrollo a Medida",
        desc: "Código limpio, rendimiento óptimo y arquitecturas escalables. Tu plataforma digital construida para crecer contigo.",
      },
      {
        number: "04",
        title: "Estrategia Digital",
        desc: "Investigación, análisis y planificación estratégica para posicionar tu marca donde tu audiencia realmente está.",
      },
    ],
  },

  // ──────────────────────────────────────────
  // 🖼️ BLOQUE 3 — GALERÍA (Parallax)
  // ──────────────────────────────────────────
  gallery: {
    label: "Portafolio",
    heading: "Trabajo que <em>habla</em> por sí solo",
    subtitle: "Una selección de proyectos donde la creatividad y la estrategia se encuentran.",
    items: [
      {
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
        caption: "Identidad Visual",
        parallaxSpeed: 0.08,
      },
      {
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=2032&auto=format&fit=crop",
        caption: "Diseño Editorial",
        parallaxSpeed: -0.05,
      },
      {
        image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=2080&auto=format&fit=crop",
        caption: "App Design",
        parallaxSpeed: 0.1,
      },
      {
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
        caption: "E-Commerce",
        parallaxSpeed: -0.07,
      },
      {
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop",
        caption: "Desarrollo Web",
        parallaxSpeed: 0.06,
      },
    ],
  },

  // ─────────────────────────────────────────
// 💬 BLOQUE 4 — FILOSOFÍA / CTA
// ──────────────────────────────────────────
philosophy: {
  enabled: false,  // ★ true/false para mostrar/ocultar
  label: "Nuestra Filosofía",
  quote: "El diseño no es solo lo que se ve y se siente. El diseño es <em>cómo funciona</em>.",
  author: "— Steve Jobs",
  cta: "Iniciar un Proyecto",
  ctaHref: "#footer",
},

// ──────────────────────────────────────────
//  BLOQUE 5 — E-COMMERCE (SIMPLIFICADO)
// ──────────────────────────────────────────
ecommerce: {
  enabled: true,  // ★ true/false para mostrar/ocultar
  label: "Tienda Online",
  heading: "Productos que <em>inspiran</em>",
  subtitle: "Descubre nuestra colección curada de productos diseñados para transformar tu espacio y estilo de vida.",
  cta: "Ver Catálogo Completo",
  ctaHref: "tienda.html",  // URL de tu tienda
},

  // ──────────────────────────────────────────
  // 🦶 FOOTER
  // ──────────────────────────────────────────
  footer: {
    brand: {
      name: "STU",
      highlight: "DIO",
      desc: "Estudio creativo especializado en diseño digital, branding y desarrollo web de alto impacto.",
    },
    columns: [
      {
        title: "Navegación",
        links: [
          { label: "Inicio",    href: "#hero" },
          { label: "Historia",  href: "#story" },
          { label: "Servicios", href: "#services" },
          { label: "Galería",   href: "#gallery" },
        ],
      },
      {
        title: "Servicios",
        links: [
          { label: "Branding",     href: "#" },
          { label: "Diseño Web",   href: "#" },
          { label: "Desarrollo",   href: "#" },
          { label: "Estrategia",   href: "#" },
        ],
      },
      {
        title: "Contacto",
        links: [
          { label: "hola@studio.com",  href: "mailto:hola@studio.com" },
          { label: "+34 612 345 678",  href: "tel:+34612345678" },
          { label: "Madrid, España",    href: "#" },
        ],
      },
    ],
    socials: [
      { label: "Instagram", href: "#" },
      { label: "Behance",   href: "#" },
      { label: "LinkedIn",  href: "#" },
      { label: "Twitter",   href: "#" },
    ],
    copyright: "© 2025 Studio. Todos los derechos reservados.",
  },

  // ──────────────────────────────────────────
  // ⚡ CONFIGURACIÓN DE EFECTOS
  // ──────────────────────────────────────────
  effects: {
    parallaxHeroSpeed: 0.35,       // Velocidad parallax del hero (0-1)
    parallaxImageSpeed: 0.12,      // Velocidad parallax imágenes story
    smoothScrollLerp: 0.08,        // Suavizado del scroll (menor = más suave)
    revealThreshold: 0.15,         // % visible para activar reveal (0-1)
    cursorEnabled: true,           // Activar/desactivar cursor custom
    grainEnabled: true,            // Activar/desactivar grano
    progressBarEnabled: true,      // Barra de progreso superior
  },
};