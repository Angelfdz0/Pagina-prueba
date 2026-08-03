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
    enabled: true,
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
      { label: "Tienda",     href: "#ecommerce" },
      { label: "Blog",       href: "#blog" },
      { label: "Contacto",   href: "#contact" },
    ],
    cta: {
      label: "Contacto",
      href: "#contact",
    },
  },

  // ──────────────────────────────────────────
  // 🏠 HERO / INTRO
  // ──────────────────────────────────────────
  hero: {
    enabled: true,
    backgroundImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
    eyebrow: "Estudio Creativo — Desde 2018",
    title: {
      line1: "Creamos",
      line2: "Experiencias",
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
    enabled: true,
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
    enabled: true,
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
    enabled: true,
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

  // ──────────────────────────────────────────
  // 💬 BLOQUE 4 — FILOSOFÍA / CTA
  // ──────────────────────────────────────────
  philosophy: {
    enabled: false,  // ★ true/false para mostrar/ocultar
    label: "Nuestra Filosofía",
    quote: "El diseño no es solo lo que se ve y se siente. El diseño es <em>cómo funciona</em>.",
    author: "— Steve Jobs",
    cta: "Iniciar un Proyecto",
    ctaHref: "#contact",
  },

  // ──────────────────────────────────────────
  // 🛍️ BLOQUE 5 — E-COMMERCE
  // ──────────────────────────────────────────
  ecommerce: {
    enabled: true,
    label: "Tienda Online",
    heading: "Productos que <em>inspiran</em>",
    subtitle: "Descubre nuestra colección curada de productos diseñados para transformar tu espacio y estilo de vida.",
    cta: "Ver Catálogo Completo",
    ctaHref: "tienda.html",
    products: [
      {
        id: 1,
        name: "Reloj Minimalista Premium",
        category: "destacado",
        price: 299,
        originalPrice: null,
        badge: "Destacado",
        description: "Diseño atemporal con materiales de la más alta calidad. Correa de cuero genuino y movimiento suizo de precisión.",
        features: [
          "Movimiento suizo automático",
          "Cristal de zafiro antirreflejos",
          "Resistencia al agua 100m",
          "Correa de cuero italiano",
          "Garantía de 2 años"
        ],
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1542496658-e33a6d0d41f6?q=80&w=1200&auto=format&fit=crop"
        ],
        variants: [
          { name: "Negro Clásico", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop", price: 299, inStock: true },
          { name: "Plata Elegante", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=400&auto=format&fit=crop", price: 329, inStock: true },
          { name: "Dorado Premium", image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=400&auto=format&fit=crop", price: 399, inStock: false }
        ]
      },
      {
        id: 2,
        name: "Auriculares Wireless Elite",
        category: "nuevo",
        price: 449,
        originalPrice: 549,
        badge: "Nuevo",
        description: "Sonido de estudio con cancelación activa de ruido. 40 horas de batería y comodidad excepcional.",
        features: [
          "Cancelación activa de ruido",
          "40 horas de batería",
          "Audio Hi-Res certificado",
          "Conectividad multipoint",
          "Micrófono integrado"
        ],
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=1200&auto=format&fit=crop"
        ],
        variants: [
          { name: "Negro Mate", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop", price: 449, inStock: true },
          { name: "Blanco Perla", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=400&auto=format&fit=crop", price: 449, inStock: true }
        ]
      },
      {
        id: 3,
        name: "Café Especial de Origen",
        category: "popular",
        price: 24,
        originalPrice: null,
        badge: "Popular",
        description: "Café de especialidad 100% arábica, cultivado en las montañas de Colombia. Tostado artesanal para resaltar notas de chocolate y frutos rojos.",
        features: [
          "100% Arábica de origen único",
          "Tostado medio artesanal",
          "Notas: chocolate, frutos rojos, caramelo",
          "Empaque con válvula de desgasificación",
          "Certificación de comercio justo"
        ],
        images: [
          "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop"
        ],
        variants: [
          { name: "Colombia - 250g", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop", price: 24, inStock: true },
          { name: "Colombia - 500g", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop", price: 42, inStock: true },
          { name: "Etiopía - 250g", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400&auto=format&fit=crop", price: 28, inStock: true },
          { name: "Brasil - 250g", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop", price: 22, inStock: false }
        ]
      }
    ],
  
    // ★ PROMOCIONES
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
          id: 1, badge: "🔥 OFERTA LIMITADA", title: "30% de Descuento",
          subtitle: "En toda la colección de relojes",
          description: "Solo por tiempo limitado. Aprovecha nuestro descuento especial en productos seleccionados.",
          code: "RELOJ30", discount: "30%", validUntil: "2025-12-31",
          cta: "Comprar Ahora", ctaHref: "#products", accent: "gold"
        },
        {
          id: 2, badge: "✨ NUEVO", title: "Envío Gratis",
          subtitle: "En compras mayores a $100",
          description: "Recibe tus productos sin costo de envío en todo el país. Sin código necesario.",
          code: "ENVIOGRATIS", discount: "FREE", validUntil: "2025-11-30",
          cta: "Ver Productos", ctaHref: "#products", accent: "purple"
        },
        {
          id: 3, badge: "🎁 EXCLUSIVO", title: "2x1 en Accesorios",
          subtitle: "Lleva dos, paga uno",
          description: "Compra cualquier accesorio y llévate otro completamente gratis. Oferta por tiempo limitado.",
          code: "2X1ACC", discount: "2x1", validUntil: "2025-10-15",
          cta: "Aprovechar Oferta", ctaHref: "#products", accent: "red"
        }
      ]
    },

    promoCodes: {
      "RELOJ30": { type: "percent", value: 30, label: "30% de descuento" },
      "ENVIOGRATIS": { type: "fixed", value: 50, label: "$50 de descuento" },
      "2X1ACC": { type: "percent", value: 50, label: "50% de descuento" }
    }
  },

  // ──────────────────────────────────────────
  // 📝 BLOQUE 6 — BLOG
  // ──────────────────────────────────────────
  blog: {
    enabled: true, 
    label: "Nuestro Blog",
    heading: "Historias que <em>inspiran</em>",
    subtitle: "Reflexiones, tendencias y detrás de escena de nuestro proceso creativo. Un espacio para compartir ideas que dejan huella.",
    cta: "Leer Artículos",
    ctaHref: "blog.html", 
  },

  // ──────────────────────────────────────────
  // 📬 BLOQUE 7 — CONTACTO (FORMULARIO)
  // ──────────────────────────────────────────
  contact: {
    enabled: true, // ★ Cambiado a true para que se muestre
    label: "Contacto",
    heading: "Hablemos de tu <em>próximo proyecto</em>",
    subtitle: "¿Tienes una idea en mente? Cuéntanos sobre ella y juntos la haremos realidad. Estamos listos para escucharte.",
    form: {
      namePlaceholder: "Tu nombre",
      emailPlaceholder: "Tu correo electrónico",
      subjectPlaceholder: "Asunto",
      messagePlaceholder: "Cuéntanos sobre tu proyecto...",
      submitText: "Enviar Mensaje",
      successMessage: "¡Mensaje enviado con éxito! Te contactaremos pronto.",
      errorMessage: "Hubo un error al enviar. Por favor, intenta de nuevo.",
    },
    email: "hola@studio.com", 
    phone: "+34 612 345 678", 
    address: "Madrid, España", 
  },

  // ──────────────────────────────────────────
  // 🦶 FOOTER
  // ──────────────────────────────────────────
  footer: {
    enabled: true,
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
          { label: "Tienda",    href: "#ecommerce" },
          { label: "Blog",      href: "#blog" },
          { label: "Contacto",  href: "#contact" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Política de Privacidad", href: "legal.html#privacy" },
          { label: "Términos y Condiciones", href: "legal.html#terms" },
          { label: "Política de Cookies",    href: "legal.html#cookies" },
        ],
      },
      {
        title: "Servicios",
        links: [
          { label: "Branding",   href: "#" },
          { label: "Diseño Web", href: "#" },
          { label: "Desarrollo", href: "#" },
          { label: "Estrategia", href: "#" },
        ],
      },
      {
        title: "Contacto",
        links: [
          { label: "hola@studio.com",  href: "mailto:hola@studio.com" },
          { label: "+34 612 345 678",  href: "tel:+34612345678" },
          { label: "Madrid, España",   href: "#" },
        ],
      },
    ],
    copyright: "© 2025 Studio. Todos los derechos reservados.",
  },

  // ──────────────────────────────────────────
  // 🌐 REDES SOCIALES (ÚNICA FUENTE DE VERDAD)
  // ──────────────────────────────────────────
  socials: [
    { label: "Instagram", href: "https://instagram.com/studio" },
    { label: "Behance",   href: "https://behance.net/studio" },
    { label: "LinkedIn",  href: "https://linkedin.com/company/studio" },
    { label: "Twitter",   href: "https://twitter.com/studio" }
  ],

  // ──────────────────────────────────────────
  // ⚡ CONFIGURACIÓN DE EFECTOS
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
  // 🛒 CONFIGURACIÓN DE LA TIENDA (tienda.html)
  // ──────────────────────────────────────────
  tienda: {
    whatsapp: "521234567890", // ★ TU NÚMERO AQUÍ (sin +, sin espacios)
    hero: {
      eyebrow: "Tienda Online",
      titleLine1: "Productos que",
      titleLine2: "inspiran",
      subtitle: "Descubre nuestra colección curada de productos diseñados para transformar tu espacio y estilo de vida."
    }
  },
  
  // ──────────────────────────────────────────
  // 🔐 SUPABASE (Blog)
  // ──────────────────────────────────────────
  supabase: {
    url: "https://ouxfmeugibrpjysjfqso.supabase.co",
    key: "sb_publishable_jAgXqz1iqlEyveCIFy4eOw_idYvxmoQ",
    storageBucket: "blog-images",
  },

  // ──────────────────────────────────────────
  // 📧 EMAIL & FORMULARIOS
  // ──────────────────────────────────────────
  email: {
    contactForm: "hola@studio.com",
    formSubmitUrl: "https://formsubmit.co/ajax/hola@studio.com",
  },

  // ──────────────────────────────────────────
  // 📝 BLOG CONFIG (Mensajes y categorías)
  // ──────────────────────────────────────────
  blogConfig: {
    categories: ["historias", "recetas", "opiniones", "datos", "tutoriales"],
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
  // 🛒 TIENDA CONFIG (Extensiones de mensajes)
  // ──────────────────────────────────────────
  shopConfig: {
    whatsapp: {
      number: "521234567890",
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
  // 🏢 INFORMACIÓN DEL NEGOCIO
  // ──────────────────────────────────────────
  business: {
    name: "Studio Creativo",
    legalName: "Studio Creativo S.L.",
    taxId: "B12345678",
    address: "Calle Principal 123, 28001 Madrid, España",
    phone: "+34 612 345 678",
    email: "hola@studio.com",
    businessHours: "Lun - Vie: 9:00 - 18:00",
    registryData: "Inscrita en el Registro Mercantil de Madrid",
  },
};