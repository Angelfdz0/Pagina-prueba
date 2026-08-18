/* ============================================================
   CONFIG.JS — DOLCENITA · Pastelería Artesanal Premium
   Paleta: blanco + rosado premium (dusty rose + crema)
   ============================================================ */

const SITE_CONFIG = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 TEMA / IDENTIDAD VISUAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  theme: {
    mode: "light",
    bg: "#FEFBF9",              // Blanco crema muy suave
    bgAlt: "#FBEFF2",           // Rosa pálido premium
    text: "#3D2828",            // Marrón chocolate oscuro (elegante)
    textMuted: "#9B7A7F",       // Gris rosado
    accent: "#C97B8F",          // Rosa francés (dusty rose premium)
    accentRGB: "201, 123, 143",
    accentLight: "#E8B4BC",     // Rosa pastel
    white: "#ffffff",
    dark: "#3D2828",
    fontDisplay: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
    fontBody: "'Quicksand', 'Poppins', -apple-system, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Quicksand:wght@300;400;500;600;700&display=swap",
    fontAwesomeUrl: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
    personality: "editorial",
    heroLayout: "split",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔍 SEO / HEAD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  seo: {
    title: "Dolcenita | Pastelería Artesanal en CDMX",
    title_en: "Dolcenita | Artisan Bakery in Mexico City",
    description: "Pasteles artesanales para bodas, XV años, cumpleaños y eventos especiales. Ingredientes premium, diseño personalizado y entrega en CDMX.",
    description_en: "Artisan cakes for weddings, quinceañeras, birthdays and special events. Premium ingredients, custom design and delivery in Mexico City.",
    themeColor: "#C97B8F",
    robots: "index, follow",
    locale: "es_MX",
    locale_en: "en_US",
    ogImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2000&auto=format&fit=crop",
    ogUrl: "",
    twitterCard: "summary_large_image",
    twitterSite: "@dolcenita",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ LOADER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  loader: {
    text: "Dolcenita",
    text_en: "Dolcenita",
    tagline: "Pastelería artesanal · CDMX",   // ★ frase que aparece bajo el porcentaje
    duration: 2700,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧭 HEADER / NAVEGACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header: {
    enabled: true,
    adminTab: true,
    maxLinks: 5,
    logo: {
      text: "DOLCE",
      highlight: "NITA",
    },
    links: [
      { label: "Inicio",          label_en: "Home",          href: "#hero" },
      { label: "Historia",        label_en: "Our Story",    href: "#story" },
      { label: "Especialidades",  label_en: "Specialties",   href: "#services" },
      { label: "Menú",            label_en: "Menu",          href: "#menu" },
      { label: "Galería",         label_en: "Gallery",       href: "#gallery" },
      { label: "Temporada",       label_en: "Seasonal",      href: "#season" },
      { label: "Cotiza tu pastel", label_en: "Quote a cake", href: "#cotizador" },
      { label: "Colabora",        label_en: "Partner",       href: "#collab" },
      { label: "Blog",            label_en: "Blog",          href: "#blog" },
      { label: "Testimonios",     label_en: "Testimonials",  href: "#testimonials" },
      { label: "Ubicación",       label_en: "Location",      href: "#location" },
      { label: "Contacto",        label_en: "Contact",       href: "#contact" },
    ],
    cta: {
      label: "Cotiza tu pastel",
      label_en: "Quote a cake",
      href: "#cotizador"
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏠 HERO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hero: {
    enabled: true,
    adminTab: false,
    sealImage: "",
    backgroundImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2000&auto=format&fit=crop",
    eyebrow: "Pastelería artesanal · Desde 2016",
    eyebrow_en: "Artisan bakery · Since 2016",
    title: {
      line1: "Endulzamos tus",
      line1_en: "Sweetening your",
      line2: "momentos más",
      line2_en: "most precious",
      typewriterWords: ["Especiales", "Dulces", "Únicos", "Inolvidables"],
      typewriterWords_en: ["Moments", "Sweets", "Unique", "Unforgettable"],
    },
    subtitle: "Pasteles artesanales elaborados con ingredientes premium, recetas familiares y el cariño de siempre. Bodas, XV años, cumpleaños y eventos que merecen lo mejor.",
    subtitle_en: "Artisan cakes made with premium ingredients, family recipes, and heartfelt care. Weddings, quinceañeras, birthdays and events that deserve the best.",
    cta: "Cotiza tu pastel",
    cta_en: "Quote your cake",
    ctaHref: "#cotizador",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 HISTORIA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  story: {
    enabled: true,
    adminTab: false,
    label: "Nuestra Historia",
    label_en: "Our Story",
    heading: "Una tradición familiar que se <em>hornea</em> con el alma",
    heading_en: "A family tradition <em>baked</em> with soul",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2000&auto=format&fit=crop",
    paragraphs: [
      "Dolcenita nació en 2016 en la cocina de la abuela Elena, donde cada pastel era una carta de amor. Lo que empezó como un regalo para los vecinos, hoy es una pastelería reconocida por su calidad artesanal y el trato cercano con cada cliente.",
      "Trabajamos con ingredientes de origen responsable: mantequilla francesa, chocolate belga, vainilla de Madagascar y frutas de temporada. Cada creación pasa por las manos de nuestros pasteleros, que hornean con la misma dedicación de aquel primer pastel.",
      "Creemos que los mejores momentos de la vida merecen los mejores sabores. Por eso diseñamos cada pastel como una pieza única, pensada para la historia que celebras."
    ],
    paragraphs_en: [
      "Dolcenita was born in 2016 in grandma Elena's kitchen, where every cake was a love letter. What started as a gift for neighbors is now a bakery recognized for its artisan quality and close connection with every client.",
      "We work with responsibly sourced ingredients: French butter, Belgian chocolate, Madagascar vanilla, and seasonal fruits. Every creation passes through our bakers' hands, who bake with the same dedication as that very first cake.",
      "We believe life's best moments deserve the best flavors. That's why we design every cake as a unique piece, created for the story you're celebrating."
    ],
    stats: [
      { number: "9K+", label: "Pasteles entregados", label_en: "Cakes delivered" },
      { number: "600+", label: "Bodas endulzadas", label_en: "Weddings sweetened" },
      { number: "99%", label: "Clientes felices", label_en: "Happy clients" },
      { number: "10", label: "Años horneando", label_en: "Years baking" },
    ],
    partners: {
      enabled: true,
      title: "Aliados y convenios",
      title_en: "Partners & Alliances",
      logos: [
        { name: "Wedding Planner MX", img: "" },
        { name: "Eventos Premium", img: "" },
        { name: "Café Central", img: "" },
        { name: "Hotel Riviera", img: "" },
        { name: "Salón Luna", img: "" },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ SERVICIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  services: {
    enabled: true,
    adminTab: true,
    label: "Especialidades",
    label_en: "Specialties",
    heading: "Creaciones <em>artesanales</em> para cada ocasión",
    heading_en: "Artisan <em>creations</em> for every occasion",
    subtitle: "Cada pieza es única, horneada con ingredientes premium y diseñada para tu celebración.",
    subtitle_en: "Every piece is unique, baked with premium ingredients and designed for your celebration.",
    visibleCount: 6,
        items: [
      {
        number: "01",
        title: "Pasteles de Boda",
        title_en: "Wedding Cakes",
        intro: "Diseños únicos para el día más importante de tu historia.",
        intro_en: "Unique designs for the most important day of your story.",
        desc: "**Diseño 100% personalizado** con prueba de sabor incluida.\n\nNuestro proceso:\n- Entrevista y boceto de diseño\n- Degustación de 3 sabores\n- Montaje en el salón incluido\n- Coordinación con tu wedding planner\n\n*Incluye topper de bienvenida y caja para el primer aniversario.*",
        image: "https://images.unsplash.com/photo-1535254973040-607b47802d6f?q=80&w=2070&auto=format&fit=crop"
      },
      {
        number: "02",
        title: "XV Años",
        title_en: "Quinceañeras",
        intro: "Pasteles que brillan tanto como la festejada.",
        intro_en: "Cakes that shine as bright as the guest of honor.",
        desc: "**Temáticas personalizadas** con acabados premium.\n\nOpciones favoritas:\n- Fondant con detalles metálicos\n- Flores naturales o de azúcar\n- Efectos mármol y perlas comestibles\n- Montaje en el salón del evento\n\n*Incluye degustación previa para la familia.*",
        image: "https://images.unsplash.com/photo-1562777717-dc6984f64a33?q=80&w=2070&auto=format&fit=crop"
      },
      {
        number: "03",
        title: "Cumpleaños",
        title_en: "Birthdays",
        intro: "Celebraciones dulces para todas las edades.",
        intro_en: "Sweet celebrations for every age.",
        desc: "**Diseños temáticos** para niños y adultos.\n\nPersonaliza:\n- Personajes y colores favoritos\n- Foto comestible o topper personalizado\n- Sabores de temporada\n- Velas premium y caja de regalo\n\n*Pedido mínimo con 3 días de anticipación.*",
        image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=2070&auto=format&fit=crop"
      },
      {
        number: "04",
        title: "Mesas de Postres",
        title_en: "Dessert Tables",
        intro: "Mesas completas que enamoran a primera vista.",
        intro_en: "Complete tables that charm at first sight.",
        desc: "**Curaduría completa** de postres para tu evento.\n\nIncluye:\n- Macarons y tartas individuales\n- Cupcakes decorados\n- Cheesecakes y pays artesanales\n- Montaje y mobiliario decorativo\n\n*Ideal para bodas, bautizos y eventos corporativos.*",
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=2070&auto=format&fit=crop"
      },
      {
        number: "05",
        title: "Cupcakes y Detalles",
        title_en: "Cupcakes & Treats",
        intro: "Detalles perfectos para regalar o consentirte.",
        intro_en: "Perfect little details to gift or indulge.",
        desc: "**Horneado diario** con ingredientes premium.\n\nDisponibles:\n- Cajas de 6, 12 y 24 piezas\n- Sabores rotativos de temporada\n- Personalización con tu marca\n- Empaque para regalo incluido\n\n*Perfectos para detalles de empresa y eventos.*",
        image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcf8?q=80&w=2070&auto=format&fit=crop"
      },
      {
        number: "06",
        title: "Eventos Corporativos",
        title_en: "Corporate Events",
        intro: "Endulza tu marca con postres personalizados.",
        intro_en: "Sweeten your brand with custom desserts.",
        desc: "**Soluciones B2B** para empresas y eventos corporativos.\n\nServicios:\n- Postres con logo de tu marca\n- Cajas de regalo para colaboradores\n- Coffee breaks y mesas dulces\n- Facturación y precios de mayoreo\n\n*Descuento especial por volumen.*",
        image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=2070&auto=format&fit=crop"
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👥 EQUIPO (desactivado en pastelería pequeña)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  team: {
    enabled: false,
    adminTab: false,
    label: "Nuestro Equipo", label_en: "Our Team",
    heading: "", heading_en: "",
    subtitle: "", subtitle_en: "",
    items: [],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖼️ GALERÍA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  gallery: {
    enabled: true,
    adminTab: false,
    label: "Nuestra Galería",
    label_en: "Our Gallery",
    heading: "Creaciones que enamoran a la <em>primera vista</em>",
    heading_en: "Creations you fall in love with at <em>first sight</em>",
    subtitle: "Una pequeña muestra de nuestros trabajos más recientes.",
    subtitle_en: "A small sample of our most recent creations.",
        items: [
      { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBPvImDx1DVjr79DGAzabomuLICZot-1S1Nrrq3876BfvHvE2oFSDGa9sr&s=10",
        caption: "Pastel de boda con flores naturales", caption_en: "Wedding cake with fresh flowers" },
      { image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=2000&auto=format&fit=crop",
        caption: "Fresas con crema Signature", caption_en: "Signature strawberries & cream" },
      { image: "https://dulcesilusiones.mx/wp-content/uploads/2022/09/XV-anos-rosa-pastel--scaled.jpg",
        caption: "XV años en rosa pastel", caption_en: "Quinceañera in pastel pink" },
      { image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=2000&auto=format&fit=crop",
        caption: "Cumpleaños que se celebran con pastel", caption_en: "Birthdays celebrated with cake" },
      { image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=2000&auto=format&fit=crop",
        caption: "Mesa de postres para eventos", caption_en: "Event dessert table" },
      { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRvz_5RzKxkQewj8mQMlfsRLKxwoKCYhsqWWxoo-KnxSHYkpqOE3ZifoJq&s=10",
        caption: "Cupcakes de temporada", caption_en: "Seasonal cupcakes" },
      { image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=2000&auto=format&fit=crop",
        caption: "Macarons artesanales", caption_en: "Artisan macarons" },
      { image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2000&auto=format&fit=crop",
        caption: "Nuestro horno, cada mañana", caption_en: "Our oven, every morning" },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💬 FILOSOFÍA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  philosophy: {
    enabled: true,
    adminTab: false,
    label: "Nuestra Filosofía", label_en: "Our Philosophy",
    quote: "Hornear no es solo un oficio, es el <em>arte de regalar felicidad</em>.",
    quote_en: "Baking is not just a trade, it's the <em>art of gifting happiness</em>.",
    author: "— Elena Ramírez, fundadora",
    author_en: "— Elena Ramírez, founder",
    cta: "Conoce nuestra historia",
    cta_en: "Discover our story",
    ctaHref: "#story",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛒 E-COMMERCE (desactivado)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ecommerce: {
    enabled: false,
    adminTab: false,
    label: "Tienda", label_en: "Shop",
    heading: "", heading_en: "",
    subtitle: "", subtitle_en: "",
    cta: "Ver catálogo", cta_en: "View catalog",
    ctaHref: "tienda.html",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 BLOG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  blog: {
    enabled: true,
    adminTab: true,
    label: "Recetas y Tips",
    label_en: "Recipes & Tips",
    heading: "El rincón dulce del <em>blog</em>",
    heading_en: "The sweet corner of our <em>blog</em>",
    subtitle: "Recetas, consejos y tendencias del mundo de la repostería.",
    subtitle_en: "Recipes, tips, and trends from the world of baking.",
    cta: "Leer artículos", cta_en: "Read articles",
    ctaHref: "blog.html",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📬 CONTACTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  contact: {
    enabled: true,
    adminTab: false,
    label: "Contacto", label_en: "Contact",
    heading: "Hablemos de tu <em>próximo pastel</em>",
    heading_en: "Let's talk about your <em>next cake</em>",
    subtitle: "¿Tienes una ocasión especial en mente? Escríbenos y diseñamos juntos tu creación ideal.",
    subtitle_en: "Do you have a special occasion in mind? Write to us and let's design your ideal creation together.",
    form: {
      namePlaceholder: "Tu nombre", namePlaceholder_en: "Your name",
      emailPlaceholder: "Tu correo", emailPlaceholder_en: "Your email",
      subjectPlaceholder: "Motivo (boda, cumpleaños, evento...)", subjectPlaceholder_en: "Subject (wedding, birthday, event...)",
      messagePlaceholder: "Cuéntanos tu idea: fecha, personas, sabores favoritos...", messagePlaceholder_en: "Tell us your idea: date, guests, favorite flavors...",
      submitText: "Enviar mensaje", submitText_en: "Send message",
      successMessage: "¡Mensaje enviado! Te contactamos en menos de 24 horas.", successMessage_en: "Message sent! We'll contact you within 24 hours.",
      errorMessage: "Hubo un error. Intenta de nuevo o escríbenos por WhatsApp.", errorMessage_en: "An error occurred. Try again or message us on WhatsApp.",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🦶 FOOTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  footer: {
    enabled: true,
    adminTab: false,
    brand: {
      name: "DOLCE", highlight: "NITA",
      desc: "Pastelería artesanal. Endulzando momentos desde 2016.",
      desc_en: "Artisan bakery. Sweetening moments since 2016.",
    },
    columns: [
      {
        title: "Pastelería", title_en: "Bakery",
        links: [
          { label: "Inicio",        label_en: "Home",          href: "#hero" },
          { label: "Historia",      label_en: "Story",         href: "#story" },
          { label: "Especialidades", label_en: "Specialties",  href: "#services" },
          { label: "Menú",          label_en: "Menu",          href: "#menu" },
          { label: "Galería",       label_en: "Gallery",       href: "#gallery" },
          { label: "Blog",          label_en: "Blog",          href: "#blog" },
          { label: "Testimonios",   label_en: "Testimonials",  href: "#testimonials" },
        ],
      },
      {
        title: "Servicios", title_en: "Services",
        links: [
          { label: "Bodas",         label_en: "Weddings",       href: "#services" },
          { label: "XV años",       label_en: "Quinceañeras",   href: "#services" },
          { label: "Cumpleaños",    label_en: "Birthdays",      href: "#services" },
          { label: "Eventos corporativos", label_en: "Corporate events", href: "#services" },
          { label: "Temporada",     label_en: "Seasonal",       href: "#season" },
          { label: "Cotizador",     label_en: "Quote tool",     href: "#cotizador" },
          { label: "Proveedor B2B", label_en: "B2B supplier",   href: "#collab" },
        ],
      },
      {
        title: "Legal", title_en: "Legal",
        links: [
          { label: "Aviso de privacidad",    label_en: "Privacy notice",    href: "legal.html#privacy" },
          { label: "Términos y condiciones", label_en: "Terms & conditions", href: "legal.html#terms" },
          { label: "Política de cookies",    label_en: "Cookie policy",     href: "legal.html#cookies" },
        ],
      },
      {
        title: "Contacto", title_en: "Contact",
        links: [
          { label: "📞 +52 55 5555 1234",       label_en: "📞 +52 55 5555 1234",       href: "tel:+525555551234" },
          { label: "✉️ hola@dolcenita.mx",      label_en: "✉️ hello@dolcenita.mx",     href: "mailto:hola@dolcenita.mx" },
          { label: "📍 Av. Ámsterdam 123, CDMX", label_en: "📍 123 Amsterdam Ave, CDMX", href: "#location" },
        ],
      },
    ],
    copyright: "© 2026 Pastelería Dolcenita S.A. de C.V. — Todos los derechos reservados.",
    copyright_en: "© 2026 Dolcenita Bakery — All rights reserved.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌐 REDES SOCIALES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  socials: [
    { label: "Instagram", href: "https://instagram.com/dolcenita" },
    { label: "Facebook",  href: "https://facebook.com/dolcenita" },
    { label: "TikTok",    href: "https://tiktok.com/@dolcenita" },
    { label: "WhatsApp",  href: "https://wa.me/5215555551234" },
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚡ EFECTOS VISUALES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  effects: {
    parallaxHeroSpeed: 0.35,
    parallaxImageSpeed: 0.12,
    smoothScrollLerp: 0.08,
    revealThreshold: 0.15,
    cursorEnabled: true,
    grainEnabled: true,        // Look artesanal con grano sutil
    progressBarEnabled: true,
    servicesLight: false,       // Efecto de luz sobre especialidades
    galleryAuto: true,
    galleryAutoInterval: 4000,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 SUPABASE (rellenar con credenciales del cliente)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  supabase: {
    url: "https://fcxmqjiuacyyudwiqoju.supabase.co",
    key: "sb_publishable_nn8jVPm-CDx2VjnUxd7iTA_P5HuqhkS",
    storageBucket: "media",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 ANALÍTICA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  analytics: {
    enabled: false,
    measurementId: "",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📧 EMAIL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  email: {
    formSubmitUrl: "https://formsubmit.co/ajax/hola@dolcenita.mx",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💬 MENSAJES DEL SISTEMA (se dejan iguales — multinegocio)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  blogConfig: {
    categories: ["recetas", "tendencias", "bodas", "eventos", "tips"],
    heroStars: 25,
    messages: {
      postSuccess: "¡Artículo publicado!", postSuccess_en: "Article published!",
      postError: "Error al publicar", postError_en: "Publish error",
      categoryAdded: "Categoría agregada", categoryAdded_en: "Category added",
      categoryRemoved: "Categoría eliminada", categoryRemoved_en: "Category removed",
      categoryExists: "La categoría ya existe", categoryExists_en: "Category already exists",
      loginWelcome: "¡Bienvenido!", loginWelcome_en: "Welcome!",
      loginError: "Credenciales inválidas", loginError_en: "Invalid credentials",
      sessionClosed: "Sesión cerrada", sessionClosed_en: "Session closed",
      logoutError: "Error al cerrar sesión", logoutError_en: "Logout error",
      imageUploading: "Subiendo...", imageUploading_en: "Uploading...",
      imageSuccess: "Imágenes subidas", imageSuccess_en: "Images uploaded",
      imageError: "Error al subir", imageError_en: "Upload error",
      notImage: "no es una imagen", notImage_en: "is not an image",
      exceedsSize: "excede 5MB", exceedsSize_en: "exceeds 5MB",
      needLogin: "Inicia sesión primero", needLogin_en: "Please login first",
      needImage: "Sube al menos una imagen", needImage_en: "Upload at least one image",
      dbError: "Error de conexión", dbError_en: "Connection error",
      noPosts: "No hay artículos", noPosts_en: "No articles found",
      noComments: "Sé el primero en comentar", noComments_en: "Be the first to comment",
      commentAdded: "¡Comentario agregado!", commentAdded_en: "Comment added!",
      likeAdded: "¡Like agregado!", likeAdded_en: "Like added!",
      likeRemoved: "Like removido", likeRemoved_en: "Like removed",
      saved: "Guardado", saved_en: "Saved",
      unsaved: "Removido de guardados", unsaved_en: "Removed from saved",
      invalidCategory: "Debe haber al menos una categoría", invalidCategory_en: "There must be at least one category",
    },
  },

  shopConfig: {
    whatsapp: {
      number: "5215555551234",
      defaultMessage: "Hola, me interesa este producto de Dolcenita.", defaultMessage_en: "Hi, I'm interested in this Dolcenita product.",
      orderMessage: "Hola, quiero hacer el siguiente pedido:\n\n", orderMessage_en: "Hi, I'd like to place the following order:\n\n",
      orderTotal: "\n*💰 Total: $", orderTotal_en: "\n*💰 Total: $",
      emptyCartAlert: "Tu carrito está vacío.", emptyCartAlert_en: "Your cart is empty.",
    },
    messages: {
      promoApplied: '¡Código "{code}" aplicado!', promoApplied_en: 'Code "{code}" applied!',
      promoInvalid: "Código no válido", promoInvalid_en: "Invalid code",
      promoRemoved: "Código removido", promoRemoved_en: "Code removed",
      promoCopied: 'Código "{code}" copiado', promoCopied_en: 'Code "{code}" copied',
      addedToCart: "Producto agregado", addedToCart_en: "Product added",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📍 UBICACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  location: {
    enabled: true,
    adminTab: false,
    label: "Visítanos", label_en: "Visit us",
    heading: "Nuestra <em>pastelería</em>",
    heading_en: "Our <em>bakery</em>",
    subtitle: "Te esperamos con el aroma de pan recién horneado y un café caliente.",
    subtitle_en: "We're waiting with the aroma of fresh-baked bread and a hot coffee.",
    address: "Av. Ámsterdam 123, Col. Hipódromo, C.P. 06100, Ciudad de México",
    address_en: "123 Amsterdam Ave, Hipódromo, 06100 Mexico City",
    phone: "+52 55 5555 1234",
    phoneHref: "tel:+525555551234",
    hours: [
      { d: "Lunes a Viernes", h: "9:00 – 20:00", d_en: "Monday to Friday", h_en: "9:00 AM – 8:00 PM" },
      { d: "Sábado", h: "9:00 – 21:00", d_en: "Saturday", h_en: "9:00 AM – 9:00 PM" },
      { d: "Domingo", h: "10:00 – 18:00", d_en: "Sunday", h_en: "10:00 AM – 6:00 PM" },
    ],
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2000&auto=format&fit=crop",
    mapsQuery: "Av. Ámsterdam 123, Hipódromo, Cuauhtémoc, 06100 Ciudad de México, CDMX",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📅 CITAS (desactivado — pastelería usa cotizador)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  appointments: {
    enabled: false,
    adminTab: false,
    label: "Agenda tu cita", label_en: "Book your appointment",
    heading: "", heading_en: "",
    subtitle: "", subtitle_en: "",
    slots: [],
    successMessage: "", successMessage_en: "",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💳 PAGOS (desactivado)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  payments: {
    enabled: false,
    adminTab: false,
    provider: "mercadopago",
    currency: "MXN",
    buttonLabel: "Pagar", buttonLabel_en: "Pay",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⭐ TESTIMONIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  testimonials: {
    enabled: true,
    adminTab: true,
    label: "Testimonios", label_en: "Testimonials",
    heading: "Lo que dicen nuestros <em>clientes</em>",
    heading_en: "What our <em>clients</em> say",
    subtitle: "Historias dulces de quienes confiaron en nosotros para sus momentos más especiales.",
    subtitle_en: "Sweet stories from those who trusted us for their most special moments.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤝 COLABORA B2B
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  collab: {
    enabled: true,
    adminTab: false,
    label: "Colabora con nosotros", label_en: "Partner with us",
    heading: "Tu negocio con <em>sabor propio</em>",
    heading_en: "Your business with <em>its own flavor</em>",
    subtitle: "Somos tu proveedor de postres artesanales para cafeterías, restaurantes, hoteles y eventos. Entregas diarias, precios de mayoreo y personalización con tu marca.",
    subtitle_en: "We're your artisan dessert supplier for cafes, restaurants, hotels, and events. Daily deliveries, wholesale prices, and branding with your logo.",
    marquee: ["Pasteles", "Cheesecakes", "Macarons", "Tartas frías", "Postres individuales", "Pan dulce", "Mesas de postres", "Temporadas especiales"],
    points: [
      { icon: "fa-truck-fast", title: "Entrega diaria", desc: "Rutas de reparto matutinas para que tu vitrina siempre esté llena.", title_en: "Daily delivery", desc_en: "Morning delivery routes to keep your showcase always full." },
      { icon: "fa-tags", title: "Precio de mayoreo", desc: "Esquema especial para negocios con pedidos recurrentes.", title_en: "Wholesale prices", desc_en: "Special pricing for businesses with recurring orders." },
      { icon: "fa-cake-candles", title: "Marca blanca", desc: "Personalizamos postres con el nombre y estilo de tu negocio.", title_en: "White label", desc_en: "Custom desserts with your business name and style." },
      { icon: "fa-handshake", title: "Asesoría de menú", desc: "Te ayudamos a elegir los postres que más rotan en tu zona.", title_en: "Menu consulting", desc_en: "We help you choose the best-selling desserts for your area." }
    ],
    cta: "Ver folleto de precios", cta_en: "View price brochure",
    brochureUrl: "",
    ctaSecondary: "Escríbenos por WhatsApp", ctaSecondary_en: "Message us on WhatsApp",
    whatsapp: "5215555551234",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🍓 TEMPORADA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
season: {
    enabled: true,
    adminTab: true,
    label: "Temporada", label_en: "Seasonal",
    heading: "Sabor de <em>temporada</em>", heading_en: "<em>Seasonal</em> flavor",
    subtitle: "Ediciones limitadas que solo existen mientras dura su momento.",
    subtitle_en: "Limited editions that only exist while the moment lasts.",
    marquee: ["Fresas con crema", "Rosca de Reyes", "Pan de muerto", "Tarta de elote", "Buñuelos", "Conchas de temporada"],
    product: {
      badge: "🍓 Edición limitada", badge_en: "🍓 Limited edition",
      name: "Fresas con Crema Dolcenita", name_en: "Dolcenita Strawberries & Cream",
      desc: "Bizcocho de vainilla de Madagascar, fresas maceradas y crema chantilly italiana.",
      desc_en: "Madagascar vanilla sponge, macerated strawberries and Italian chantilly cream.",
      price: 480,
      originalPrice: 560,
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=2000&auto=format&fit=crop",
    },
    endDate: "2026-09-30T23:59:59",
    cta: "Apartar la mía", cta_en: "Reserve mine",
    whatsapp: "5215555551234",
    waMessage: "Hola, quiero apartar mi Fresas con Crema Dolcenita 🍓",
    waMessage_en: "Hi, I'd like to reserve my Dolcenita Strawberries & Cream 🍓",
},

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎂 COTIZADOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cotizador: {
    enabled: true,
    adminTab: true,
    minDaysAhead: 3,
    maxPerDay: 2,
    label: "Cotiza tu pastel", label_en: "Quote your cake",
    heading: "Diseña y cotiza <em>tu pastel</em>", heading_en: "Design and quote <em>your cake</em>",
    subtitle: "Arma tu pastel ideal y recibe un precio estimado al instante. El precio final se confirma al realizar tu pedido.",
    subtitle_en: "Build your ideal cake and get an instant estimate. Final price is confirmed when you place your order.",
    currency: "MXN",
    sizes: [
      { label: "10 personas", label_en: "10 servings", price: 550 },
      { label: "20 personas", label_en: "20 servings", price: 950 },
      { label: "30 personas", label_en: "30 servings", price: 1350 },
      { label: "50 personas", label_en: "50 servings", price: 2100 },
    ],
    fillings: [
      { label: "Vainilla clásica", label_en: "Classic vanilla", add: 0 },
      { label: "Chocolate belga", label_en: "Belgian chocolate", add: 50 },
      { label: "Fresas con crema", label_en: "Strawberries & cream", add: 70 },
      { label: "Tres leches", label_en: "Three milks", add: 80 },
      { label: "Red velvet", label_en: "Red velvet", add: 90 },
    ],
    decorations: [
      { label: "Glaseado básico", label_en: "Basic glaze", add: 0 },
      { label: "Chantilly con manga", label_en: "Piped chantilly", add: 90 },
      { label: "Foto comestible", label_en: "Edible photo", add: 200 },
      { label: "Flores naturales", label_en: "Fresh flowers", add: 250 },
      { label: "Fondant temático", label_en: "Themed fondant", add: 280 },
    ],
    extras: [
      { label: "Topper personalizado", label_en: "Custom topper", add: 100 },
      { label: "Velas premium", label_en: "Premium candles", add: 60 },
      { label: "Caja de regalo", label_en: "Gift box", add: 70 },
      { label: "Dedicatoria especial", label_en: "Special dedication", add: 0 },
    ],
    delivery: {
      pickupLabel: "Recoger en pastelería", pickupLabel_en: "Pickup at bakery",
      pickupNote: "Recoger en tienda no tiene costo extra.", pickupNote_en: "Pickup has no extra cost.",
      deliveryLabel: "Envío a domicilio", deliveryLabel_en: "Home delivery",
      deliveryNote: "El envío tiene costo extra según el trayecto; lo confirmamos con tu pedido.", deliveryNote_en: "Delivery has an extra cost depending on distance; confirmed with your order.",
    },
    whatsapp: "5215555551234",
    cta: "Enviar cotización por WhatsApp", cta_en: "Send quote via WhatsApp",
    note: "*Precio estimado. El precio final puede variar según disponibilidad y personalización.",
    note_en: "*Estimated price. Final price may vary based on availability and customization.",
},

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🍽️ MENÚ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  menu: {
    enabled: true,
    adminTab: true,
    label: "Nuestro Menú", label_en: "Our Menu",
    heading: "Sabores que <em>enamoran</em>",
    heading_en: "Flavors you <em>fall in love</em> with",
    subtitle: "Productos de vitrina hechos al momento con ingredientes frescos.",
    subtitle_en: "Showcase products made fresh with the finest ingredients.",
    cta: "Hacer pedido por WhatsApp", cta_en: "Order via WhatsApp",
    ctaHref: "https://wa.me/5215555551234",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔁 ANTES/DESPUÉS (desactivado)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  beforeafter: {
    enabled: false, adminTab: false,
    label: "", label_en: "",
    heading: "", heading_en: "",
    subtitle: "", subtitle_en: "",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💎 PLANES (desactivado)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  plans: {
    enabled: false, adminTab: false,
    label: "", label_en: "",
    heading: "", heading_en: "",
    subtitle: "", subtitle_en: "",
    whatsapp: "",
    note: "", note_en: "",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏋️ CLASES (desactivado)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  classes: {
    enabled: false, adminTab: false,
    label: "", label_en: "",
    heading: "", heading_en: "",
    subtitle: "", subtitle_en: "",
    note: "", note_en: "",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔍 DATOS DEL NEGOCIO (SEO + fiscal)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  business: {
    enabled: true,
    adminTab: false,
    type: "Bakery",
    name: "Pastelería Dolcenita", name_en: "Dolcenita Bakery",
    legalName: "Pastelería Dolcenita S.A. de C.V.",
    taxId: "PDO160315ABC",
    registryData: "Registro COFEPRIS 23-AL-00123",
    description: "Pastelería artesanal con pasteles personalizados, temporadas y entregas el mismo día en CDMX.",
    description_en: "Artisan bakery with custom cakes, seasonal specials, and same-day delivery in Mexico City.",
    url: "https://dolcenita.mx",
    logo: "",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2000&auto=format&fit=crop",
    phone: "+52 55 5555 1234",
    email: "hola@dolcenita.mx",
    priceRange: "$$",
    address: { street: "Av. Ámsterdam 123", city: "Ciudad de México", state: "CDMX", zip: "06100", country: "MX" },
    geo: { lat: 19.4326, lng: -99.1332 },
    hours: "Mo-Fr 09:00-20:00; Sa 09:00-21:00; Su 10:00-18:00",
    hours_en: "Mon-Fri 9 AM-8 PM; Sat 9 AM-9 PM; Sun 10 AM-6 PM",
    social: ["https://instagram.com/dolcenita", "https://facebook.com/dolcenita", "https://tiktok.com/@dolcenita"],
    faqLabel: "Preguntas frecuentes", faqLabel_en: "Frequently asked questions",
    faqHeading: "Resolvemos tus <em>dudas</em>", faqHeading_en: "Answering your <em>questions</em>",
    faq: [
      { q: "¿Hacen pasteles personalizados?", a: "Sí, con al menos 3 días de anticipación. Cotízalo desde el cotizador o por WhatsApp.", q_en: "Do you make custom cakes?", a_en: "Yes, with at least 3 days' notice. Quote it from the quote tool or via WhatsApp." },
      { q: "¿Tienen opciones sin azúcar o veganas?", a: "Sí, manejamos línea especial bajo pedido. Pregúntanos por disponibilidad.", q_en: "Do you have sugar-free or vegan options?", a_en: "Yes, we offer a special line on request. Ask us about availability." },
      { q: "¿Hacen entregas a domicilio?", a: "Sí, el costo depende del trayecto y se confirma al confirmar tu pedido.", q_en: "Do you deliver?", a_en: "Yes, cost depends on distance and is confirmed when we confirm your order." },
      { q: "¿Con cuánta anticipación debo pedir mi pastel?", a: "Recomendamos mínimo 3 días; para bodas y XV años, al menos 2 meses.", q_en: "How far in advance should I order?", a_en: "We recommend at least 3 days; for weddings and quinceañeras, at least 2 months." },
      { q: "¿Puedo probar sabores antes de pedir?", a: "Sí, agenda una degustación en nuestra pastelería con cita previa.", q_en: "Can I taste flavors before ordering?", a_en: "Yes, book a tasting at our bakery by appointment." },
    ],
    faq_en: [],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛒 TIENDA (desactivada)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  tienda: {
    enabled: false,
    adminTab: false,
    whatsapp: "",
    hero: {
      eyebrow: "", eyebrow_en: "",
      titleLine1: "", titleLine1_en: "",
      titleLine2: "", titleLine2_en: "",
      subtitle: "", subtitle_en: "",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌐 MULTI-IDIOMA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  lang: {
    enabled: false,
    adminTab: false,
    default: "es",
  },
};