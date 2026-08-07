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
    accent:       "#4a90d9",   // ★ Color principal de la marca
    accentRGB:   "74, 144, 217",
    accentLight:  "#7ab0e8",
    white:        "#ffffff",
    dark:         "#0a0a0a",
    fontDisplay: "'Playfair Display', Georgia, serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap",
    fontAwesomeUrl: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
    personality: "editorial",   // "editorial" | "minimal" | "bold"
    heroLayout:  "center",      // "center" | "center" | "split"
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
      { label: "Equipo",     href: "#team" },
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
  partners: {
        enabled: true,   // ← true para mostrar el carrusel
        title: "Patrocinadores y Convenios",
        logos: [          // ★ CLIENTE: sus marcas reales
            { name: "GNP Seguros",      img: "" },  // si img va vacío, se muestra el nombre como texto elegante
            { name: "Laboratorios Roma", img: "https://.../logo-roma.png" },
            { name: "UNAM",             img: "" },
            { name: "MetLife",          img: "" },
            { name: "Farmacias Similar", img: "" },
            { name: "AXA",              img: "" },
        ],
    },
},

  // ──────────────────────────────────────────
  // ⚙️ SERVICIOS
  // ★ CLIENTE: los servicios reales que ofrece
  // ──────────────────────────────────────────
  services: {
  enabled: true,
  label: "Especialidades",
  heading: "Atención médica <em>integral</em>",
  subtitle: "Cada consulta está diseñada para brindarte un diagnóstico preciso y un trato humano.",
  visibleCount: 6,   // ✅ tarjetas visibles al inicio; el resto tras "Ver todos"
  items: [
  { 
    number: "01", 
    title: "Consulta General",
    intro: "Valoración completa y plan de tratamiento personalizado en una sola visita.",  // ✍️ FRENTE (corto y atractivo)
    desc: "En esta consulta realizamos historia clínica completa, exploración física, interpretación de estudios recientes y diseñamos un plan de tratamiento paso a paso. Incluye receta digital, indicaciones por escrito y seguimiento por WhatsApp durante 7 días.",  // ✍️ REVERSO (largo y detallado)
    image: "https://..." 
  },
  { 
    number: "02", 
    title: "Consulta General",
    intro: "Valoración completa y plan de tratamiento personalizado en una sola visita.",  // ✍️ FRENTE (corto y atractivo)
    desc: "En esta consulta realizamos historia clínica completa, exploración física, interpretación de estudios recientes y diseñamos un plan de tratamiento paso a paso. Incluye receta digital, indicaciones por escrito y seguimiento por WhatsApp durante 7 días.",  // ✍️ REVERSO (largo y detallado)
    image: "https://..." 
  },
  { 
    number: "03", 
    title: "Consulta General",
    intro: "Valoración completa y plan de tratamiento personalizado en una sola visita.",  // ✍️ FRENTE (corto y atractivo)
    desc: "En esta consulta realizamos historia clínica completa, exploración física, interpretación de estudios recientes y diseñamos un plan de tratamiento paso a paso. Incluye receta digital, indicaciones por escrito y seguimiento por WhatsApp durante 7 días.",  // ✍️ REVERSO (largo y detallado)
    image: "https://..." 
  },
],
},

// ──────────────────────────────────────────
// 👩‍⚕️ EQUIPO MÉDICO (tarjetas flotantes + ficha técnica)
// ──────────────────────────────────────────
team: {
  enabled: true,   // ← true para activar
  label: "Equipo Médico",
  heading: "Especialistas que <em>te cuidan</em>",
  subtitle: "Profesionales certificados con vocación de servicio.",
  items: [
    {
      photo: "https://.../dra-lopez.jpg",          // ★ foto del doctor
      name: "Dra. María López",
      cedula: "Céd. Prof. 1234567",
      specialty: "Cardiología",
      bio: "Más de 12 años de experiencia en cardiología clínica y ecocardiografía. Certificada por el Consejo Mexicano de Cardiología.",
      phone: "+52 55 1234 5678",
      whatsapp: "5215512345678",
      email: "dra.lopez@clinica.com",
      schedule: "Lun–Vie · 9:00–17:00",
    },
    { /* más doctores… */ },
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
    products: [],

    // ★ PROMOCIONES — actualiza fechas de vigencia por cliente
    promotions: {
      enabled: true,
      delay: 3000,
      autoRotate: true,
      rotateInterval: 6000,
      showCloseButton: true,
      rememberDismiss: true,
      dismissDuration: 24,
      items: []
    },
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
          { label: "Equipo",    href: "#team" },
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
    categories: [], // ★ Categorías iniciales
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
// 📍 UBICACIÓN (bloque opcional: mapa + datos)
// ★ CLIENTE: dirección, horario y teléfono reales
// ──────────────────────────────────────────
location: {
  enabled: true,   // ← true para activar el bloque
  label: "Ubicación",
  heading: "Visítanos <em>hoy</em>",
  subtitle: "Estamos para atenderte en el corazón de la ciudad.",
  address: "Av. Siempre Viva 123, Col. Centro, C.P. 06000, Ciudad de México",
  phone: "+52 55 1234 5678",
  phoneHref: "tel:+525512345678",
  hours: [
    { d: "Lunes a Viernes", h: "9:00 – 19:00" },
    { d: "Sábado",          h: "10:00 – 14:00" },
    { d: "Domingo",         h: "Cerrado" }
  ],
  mapsQuery: "Av. Siempre Viva 123, Col. Centro, Ciudad de México", // ← lo que busca Google Maps
},
// ──────────────────────────────────────────
// 📅 CITAS (bloque opcional: solicitud → WhatsApp + BD)
// ──────────────────────────────────────────
appointments: {
  enabled: true,   // ← true para activar el bloque
  label: "Agenda tu cita",
  heading: "Reserva tu <em>momento</em>",
  subtitle: "Déjanos tus datos y te confirmamos por WhatsApp en menos de 24 horas.",
  slots: ["Mañana (9:00–13:00)", "Tarde (14:00–18:00)", "Noche (18:00–21:00)"],
  successMessage: "¡Solicitud enviada! Te confirmaremos por WhatsApp.",
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