/* ============================================================
   ★ PLANTILLA MAESTRA DE CONFIGURACIÓN — USO POR CLIENTE ★
   
   FLUJO RÁPIDO (10 min por cliente):
   1. Copia este archivo como config.js en la carpeta del cliente
   2. Llena TODOS los campos marcados con ★ CLIENTE
   3. Crea proyecto Supabase → ejecuta tu setup-supabase.sql
   4. Crea usuario admin (Authentication → Add user → auto-confirm)
   5. Pega URL + clave anon en la sección 🔐 SUPABASE
   6. Sube archivos al hosting del cliente → listo ✅
   ============================================================ */

const SITE_CONFIG = {

  // ──────────────────────────────────────────
  // 🎨 TEMA / COLORES
  // ★ CLIENTE: ajusta a los colores de su marca
  // ──────────────────────────────────────────
  theme: {
    bg:           "#0a0a0a",
    bgAlt:        "#111111",
    text:         "#f0ece2",
    textMuted:    "#9a9488",
    accent:       "#c9a96e",   // ★ Color principal de la marca
    accentLight:  "#e2c992",
    white:        "#ffffff",
    dark:         "#0a0a0a",
    fontDisplay:  "'Playfair Display', Georgia, serif",
    fontBody:     "'Inter', -apple-system, sans-serif",
  },

  loader: {
    text: "Studio",          // ★ Texto del loader (puede ser el nombre corto)
    duration: 2200,
  },

  // ──────────────────────────────────────────
  // 🧭 HEADER / NAVEGACIÓN
  // ──────────────────────────────────────────
  header: {
    enabled: true,
    maxLinks: 5,
    logo: {
      text: "STU",           // ★ CLIENTE: primera parte del logo
      highlight: "DIO",      // ★ Parte resaltada con color accent
    },
    links: [
      { label: "Inicio",     href: "#hero" },
      { label: "Historia",   href: "#story" },
      { label: "Servicios",  href: "#services" },
      { label: "Galería",    href: "#gallery" },
      { label: "Tienda",     href: "#ecommerce" },
      { label: "Blog",       href: "#blog" },
      { label: "Testimonios", href: "#testimonials" },
      { label: "Contacto",   href: "#contact" },
    ],
    cta: { label: "Contacto", href: "#contact" },
  },

  // ──────────────────────────────────────────
  // 🏠 HERO
  // ★ CLIENTE: textos y foto principal del negocio
  // ──────────────────────────────────────────
  hero: {
    enabled: true,
    backgroundImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop", // ★ Foto real
    eyebrow: "Estudio Creativo — Desde 2018",   // ★ Frase corta
    title: {
      line1: "Creamos",
      line2: "Experiencias",
      typewriterWords: ["Digitales", "Únicas", "Memorables"], // ★ Palabras rotativas
    },
    subtitle: "Diseño, estrategia y tecnología fusionados para construir marcas que trascienden lo ordinario.",
    cta: "Descubrir Más",
    ctaHref: "#story",
  },

  // ──────────────────────────────────────────
  // 📖 HISTORIA
  // ★ CLIENTE: su historia real y cifras reales
  // ──────────────────────────────────────────
  story: {
    enabled: true,
    label: "Nuestra Historia",
    heading: "Donde la <em>visión</em> se convierte en realidad",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop", // ★ Foto real
    paragraphs: [
      "Párrafo 1 de la historia del negocio...",  // ★
      "Párrafo 2 de la historia del negocio...",  // ★
    ],
    stats: [
      { number: "150+", label: "Proyectos" },   // ★ Cifras reales
      { number: "12",   label: "Premios" },
      { number: "98%",  label: "Satisfacción" },
    ],
  },

  // ──────────────────────────────────────────
  // ⚙️ SERVICIOS
  // ★ CLIENTE: los servicios reales que ofrece
  // ──────────────────────────────────────────
  services: {
    enabled: true,
    label: "Lo Que Hacemos",
    heading: "Servicios que <em>transforman</em>",
    subtitle: "Cada servicio está diseñado para elevar tu marca al siguiente nivel.",
    items: [
      { number: "01", title: "Servicio Uno",   desc: "Descripción del servicio 1..." }, // ★
      { number: "02", title: "Servicio Dos",   desc: "Descripción del servicio 2..." }, // ★
      { number: "03", title: "Servicio Tres",  desc: "Descripción del servicio 3..." }, // ★
    ],
  },

  // ──────────────────────────────────────────
  // 🖼️ GALERÍA / PORTAFOLIO
  // ★ CLIENTE: fotos reales de su trabajo
  // ──────────────────────────────────────────
  gallery: {
    enabled: true,
    label: "Portafolio",
    heading: "Trabajo que <em>habla</em> por sí solo",
    subtitle: "Una selección de proyectos donde la creatividad y la estrategia se encuentran.",
    items: [
      { image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop", caption: "Proyecto 1", parallaxSpeed: 0.08 },  // ★
      { image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=2032&auto=format&fit=crop", caption: "Proyecto 2", parallaxSpeed: -0.05 }, // ★
      { image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=2080&auto=format&fit=crop", caption: "Proyecto 3", parallaxSpeed: 0.1 },   // ★
    ],
  },

  // ──────────────────────────────────────────
  // 💬 FILOSOFÍA (opcional: true/false)
  // ──────────────────────────────────────────
  philosophy: {
    enabled: false,
    label: "Nuestra Filosofía",
    quote: "El diseño no es solo lo que se ve y se siente. El diseño es <em>cómo funciona</em>.",
    author: "— Steve Jobs",
    cta: "Iniciar un Proyecto",
    ctaHref: "#contact",
  },

  // ──────────────────────────────────────────
  // 🛍️ TIENDA
  // ★ CLIENTE: sus productos reales con fotos y precios en MXN
  // ──────────────────────────────────────────
  ecommerce: {
    enabled: true,
    label: "Tienda Online",
    heading: "Productos que <em>inspiran</em>",
    subtitle: "Descubre nuestra colección curada de productos.",
    cta: "Ver Catálogo Completo",
    ctaHref: "tienda.html",
    products: [
      {
        id: 1,
        name: "Producto Uno",                 // ★
        category: "destacado",
        price: 299,                          // ★ Precio en MXN
        originalPrice: null,
        badge: "Destacado",
        description: "Descripción del producto...",
        features: ["Característica 1", "Característica 2"],
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop", // ★ Fotos reales
        ],
        variants: [
          { name: "Variante A", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop", price: 299, inStock: true },
          { name: "Variante B", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop", price: 329, inStock: false }, // inStock: false = agotado
        ]
      },
    ],

    // ★ PROMOCIONES — actualiza fechas de vigencia por cliente
    promotions: {
      enabled: true,
      delay: 3000,
      autoRotate: true,
      rotateInterval: 6000,
      showCloseButton: true,
      rememberDismiss: true,
      dismissDuration: 24,
      items: [
        {
          id: 1, badge: "🔥 OFERTA", title: "10% de Descuento",
          subtitle: "En toda la tienda",
          description: "Aprovecha nuestro descuento de bienvenida.",
          code: "BIENVENIDA10", discount: "10%", validUntil: "2026-12-31", // ★ Fecha futura
          cta: "Comprar Ahora", ctaHref: "#products", accent: "gold"
        },
      ]
    },

    // ★ Debe coincidir con las promos de arriba (misma semántica)
    promoCodes: {
      "BIENVENIDA10": { type: "percent", value: 10, label: "10% de descuento" },
    }
  },

  // ──────────────────────────────────────────
  // 📝 BLOG
  // ──────────────────────────────────────────
  blog: {
    enabled: true,
    label: "Nuestro Blog",
    heading: "Historias que <em>inspiran</em>",
    subtitle: "Reflexiones, tendencias y detrás de escena de nuestro proceso creativo.",
    cta: "Leer Artículos",
    ctaHref: "blog.html",
  },

  // ──────────────────────────────────────────
  // 📬 CONTACTO
  // ★ CLIENTE: sus datos reales de contacto (México)
  // ──────────────────────────────────────────
  contact: {
    enabled: true,
    label: "Contacto",
    heading: "Hablemos de tu <em>próximo proyecto</em>",
    subtitle: "¿Tienes una idea en mente? Cuéntanos sobre ella.",
    form: {
      namePlaceholder: "Tu nombre",
      emailPlaceholder: "Tu correo electrónico",
      subjectPlaceholder: "Asunto",
      messagePlaceholder: "Cuéntanos sobre tu proyecto...",
      submitText: "Enviar Mensaje",
      successMessage: "¡Mensaje enviado con éxito! Te contactaremos pronto.",
      errorMessage: "Hubo un error al enviar. Por favor, intenta de nuevo.",
    },
    email: "contacto@clientedominio.com",   // ★ CLIENTE
    phone: "+52 55 1234 5678",              // ★ CLIENTE (formato +52)
    address: "Ciudad de México, México",    // ★ CLIENTE
  },

  // ──────────────────────────────────────────
  // 🦶 FOOTER
  // ──────────────────────────────────────────
  footer: {
    enabled: true,
    brand: {
      name: "STU",          // ★ Igual que header.logo
      highlight: "DIO",
      desc: "Descripción corta del negocio para el pie de página.", // ★
    },
    columns: [
      {
        title: "Navegación",
        links: [
          { label: "Inicio",    href: "#hero" },
          { label: "Historia",  href: "#story" },
          { label: "Servicios", href: "#services" },
          { label: "Galería",   href: "#gallery" },
          { label: "Tienda",    href: "#ecommerce" },
          { label: "Blog",      href: "#blog" },
          { label: "Testimonios", href: "#testimonials" },
          { label: "Contacto",  href: "#contact" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Aviso de Privacidad",  href: "legal.html#privacy" },
          { label: "Términos y Condiciones", href: "legal.html#terms" },
          { label: "Términos Comerciales", href: "legal.html#commercial" },
          { label: "Política de Cookies",  href: "legal.html#cookies" },
        ],
      },
      {
        title: "Contacto",
        links: [
          { label: "contacto@clientedominio.com", href: "mailto:contacto@clientedominio.com" }, // ★
          { label: "+52 55 1234 5678", href: "tel:+525512345678" }, // ★
          { label: "Ciudad de México, MX", href: "#contact" },      // ★
        ],
      },
    ],
    // ★ Año automático + nombre legal del cliente
    copyright: "© " + new Date().getFullYear() + " NOMBRE LEGAL S.A. de C.V. Todos los derechos reservados.",
  },

  // ──────────────────────────────────────────
  // 🌐 REDES SOCIALES
  // ★ CLIENTE: sus URLs reales
  // ──────────────────────────────────────────
  socials: [
    { label: "Instagram", href: "https://instagram.com/USUARIO_CLIENTE" },
    { label: "Facebook",  href: "https://facebook.com/USUARIO_CLIENTE" },
    { label: "WhatsApp",  href: "https://wa.me/5215512345678" },
  ],

  // ──────────────────────────────────────────
  // ⚡ EFECTOS (normalmente no se toca)
  // ──────────────────────────────────────────
  effects: {
    parallaxHeroSpeed: 0.35,
    parallaxImageSpeed: 0.12,
    smoothScrollLerp: 0.08,
    revealThreshold: 0.15,
    cursorEnabled: true,
    grainEnabled: true,
    progressBarEnabled: true,
  },

  // ──────────────────────────────────────────
  // 🛒 TIENDA (tienda.html)
  // ★ CLIENTE: su WhatsApp (52 + 1 + 10 dígitos, sin + ni espacios)
  // ──────────────────────────────────────────
  tienda: {
    whatsapp: "5215512345678",
    hero: {
      eyebrow: "Tienda Online",
      titleLine1: "Productos que",
      titleLine2: "inspiran",
      subtitle: "Descubre nuestra colección curada de productos."
    }
  },

  // ──────────────────────────────────────────
  // 🔐 SUPABASE (Blog)
  // ★ POR CLIENTE: pega aquí la URL y clave anon de SU proyecto
  //   (Settings → API → Project URL + anon/public key)
  // ──────────────────────────────────────────
  supabase: {
    url: "https://ouxfmeugibrpjysjfqso.supabase.co",   // ★ URL del proyecto del cliente
    key: "sb_publishable_jAgXqz1iqlEyveCIFy4eOw_idYvxmoQ",                  // ★ Clave anon/public (NUNCA service_role)
    storageBucket: "blog-images",
  },

  // ──────────────────────────────────────────
  // 📧 EMAIL & FORMULARIOS
  // ★ CLIENTE: su correo real (FormSubmit se activa al primer envío)
  // ──────────────────────────────────────────
  email: {
    contactForm: "contacto@clientedominio.com",
    formSubmitUrl: "https://formsubmit.co/ajax/contacto@clientedominio.com",
  },

  // ──────────────────────────────────────────
  // 📝 BLOG CONFIG (mensajes del sistema)
  // ──────────────────────────────────────────
  blogConfig: {
    categories: ["historias", "recetas", "opiniones", "datos", "tutoriales"], // ★ Categorías iniciales
    heroStars: 35,
    messages: {
      postSuccess: "¡Post publicado con éxito!",
      postError: "Error al crear el post",
      categoryAdded: "Categoría agregada",
      categoryRemoved: "Categoría eliminada",
      categoryExists: "Categoría ya existe o inválida",
      loginWelcome: "¡Bienvenido, administrador!",
      loginError: "Credenciales inválidas. Verifica tu email y contraseña.",
      sessionClosed: "Sesión cerrada",
      logoutError: "Error al cerrar sesión",
      imageUploading: "Subiendo imágenes...",
      imageSuccess: "Imágenes subidas correctamente",
      imageError: "Error al subir",
      notImage: "no es una imagen",
      exceedsSize: "excede 5MB",
      needLogin: "Debes iniciar sesión primero",
      needImage: "Debes subir al menos una imagen",
      dbError: "Error al conectar con la base de datos",
      noPosts: "No se encontraron artículos",
      noComments: "Sé el primero en comentar",
      commentAdded: "¡Comentario agregado!",
      likeAdded: "¡Te gustó este post!",
      likeRemoved: "Like removido",
      saved: "Post guardado",
      unsaved: "Post removido de guardados",
      invalidCategory: "Debe haber al menos una categoría",
    },
  },

  // ──────────────────────────────────────────
  // 🛒 TIENDA CONFIG (mensajes del sistema)
  // ──────────────────────────────────────────
  shopConfig: {
    whatsapp: {
      number: "5215512345678",  // ★ Igual que tienda.whatsapp
      defaultMessage: "¡Hola! Me interesa conocer más sobre sus productos.",
      orderMessage: "¡Hola! Me interesa hacer el siguiente pedido:\n\n",
      orderTotal: "\n*💰 Total a pagar: $",
      emptyCartAlert: "Tu carrito está vacío. ¡Agrega algunos productos primero!",
    },
    whatsappButton: {
      showThreshold: 0.80,
      hideThreshold: 0.75,
    },
    messages: {
      promoApplied: '¡Código "{code}" aplicado! {label}',
      promoInvalid: "Código no válido o expirado",
      promoRemoved: "Código de descuento eliminado",
      promoCopied: 'Código "{code}" copiado',
      addedToCart: "Producto agregado al carrito",
    },
  },

  // ──────────────────────────────────────────
  // 🏢 DATOS FISCALES DEL NEGOCIO
  // ★ CLIENTE: para la página legal (legal.html)
  // ──────────────────────────────────────────
  business: {
    name: "Nombre Comercial",                    // ★
    legalName: "Razón Social S.A. de C.V.",      // ★
    taxId: "XXX000000XX0",                       // ★ RFC real (12-13 caracteres)
    address: "Calle, Número, Colonia, C.P., Ciudad, México", // ★
    phone: "+52 55 1234 5678",                   // ★
    email: "contacto@clientedominio.com",        // ★
    businessHours: "Lun - Vie: 9:00 - 18:00",
    registryData: "Inscrita en el Registro Público de Comercio", // ★
  },

    // ──────────────────────────────────────────
  // 💳 PAGOS CON TARJETA (módulo listo para activar)
  // ★ Déjalo en false hasta que un cliente pida cobrar con tarjeta
  // ──────────────────────────────────────────
  payments: {
    enabled: false,            // ← EL INTERRUPTOR: true = pagos activos
    provider: "mercadopago",   // "mercadopago" | "stripe"
    currency: "MXN",
    buttonLabel: "💳 Pagar con tarjeta",
  },

    // ──────────────────────────────────────────
  // 🌟 TESTIMONIOS (prueba social real)
  // ──────────────────────────────────────────
  testimonials: {
    enabled: true,
    label: "Testimonios",
    heading: "Clientes que <em>confían</em> en nosotros",
    subtitle: "Opiniones reales tomadas de nuestras redes sociales, con fotos reales de nuestros productos.",
  },
};