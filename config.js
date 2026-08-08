/* ============================================================
   CONFIG.JS — CONFIGURACIÓN MAESTRA DEL SITIO
   ============================================================
   Este archivo controla TODO el comportamiento del sitio web.
   Cada sección corresponde a un bloque visual o funcionalidad.
   
   FLUJO DE TRABAJO POR CLIENTE:
   1. Copiar este archivo como config.js
   2. Modificar campos marcados con ★ CLIENTE
   3. Configurar Supabase (URL + key anon)
   4. Subir al hosting del cliente
   ============================================================ */

const SITE_CONFIG = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 TEMA / IDENTIDAD VISUAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Controla colores, fuentes y personalidad visual del sitio.
  // theme.js lee estos valores y los aplica como variables CSS.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  theme: {
    // Colores principales del sitio
    bg: "#0a0a0a",              // Fondo principal (negro muy oscuro)
    bgAlt: "#111111",           // Fondo alternativo (secciones alternas)
    text: "#f0ece2",            // Color de texto principal (blanco cálido)
    textMuted: "#9a9488",       // Texto secundario (gris cálido)
    
    accent: "#4a90d9",          // ★ CLIENTE: Color de acento (azul en este ejemplo)
    accentRGB: "74, 144, 217",  // ★ Mismo color en formato RGB (sin paréntesis)
    accentLight: "#7ab0e8",     // Versión clara del acento (para hovers)
    
    white: "#ffffff",           // Blanco puro
    dark: "#0a0a0a",            // Negro puro
    
    // Tipografías (se cargan desde Google Fonts)
    fontDisplay: "'Playfair Display', Georgia, serif",  // Fuente para títulos
    fontBody: "'Inter', -apple-system, sans-serif",     // Fuente para cuerpo
    
    // URLs de recursos externos
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap",
    fontAwesomeUrl: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
    
    // Personalidad visual (afecta bordes, botones, animaciones)
    personality: "editorial",   // Opciones: "editorial" | "minimal" | "bold"
                                // - editorial: elegante, serif, sofisticado
                                // - minimal: limpio, sin ruido, sobrio
                                // - bold: juvenil, botones pill, tarjetas redondas
    
    // Layout del hero (pantalla de inicio)
    heroLayout: "center",       // Opciones: "center" | "split"
                                // - center: texto centrado sobre imagen de fondo
                                // - split: texto a la izquierda, imagen a la derecha
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ LOADER (pantalla de carga inicial)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  loader: {
    text: "Studio",             // ★ Texto que aparece en el loader
    duration: 2200,             // Duración en milisegundos (2.2 segundos)
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧭 HEADER / NAVEGACIÓN SUPERIOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // app.js construye el header dinámicamente usando estos datos.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header: {
    enabled: true,              // Mostrar/ocultar el header completo
    maxLinks: 5,                // Máximo de enlaces visibles antes del menú "Más"
    
    logo: {
      text: "STU",              // ★ CLIENTE: Primera parte del logo
      highlight: "DIO",         // ★ Parte que se muestra en color accent
    },
    
    // Enlaces de navegación (orden = orden de aparición)
    links: [
      { label: "Inicio",      href: "#hero" },         // Salta a sección #hero
      { label: "Historia",    href: "#story" },        // Salta a sección #story
      { label: "Equipo",      href: "#team" },         // Salta a sección #team
      { label: "Servicios",   href: "#services" },     // Salta a sección #services
      { label: "Galería",     href: "#gallery" },      // Salta a sección #gallery
      { label: "Tienda",      href: "#ecommerce" },    // Salta a sección #ecommerce
      { label: "Blog",        href: "#blog" },         // Salta a sección #blog
      { label: "Testimonios", href: "#testimonials" }, // Salta a sección #testimonials
      { label: "Contacto",    href: "#contact" },      // Salta a sección #contact
    ],
    
    // Botón CTA (Call To Action) principal
    cta: { 
      label: "Contacto",        // Texto del botón
      href: "#contact"          // Destino al hacer clic
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏠 HERO (sección principal de inicio)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Primera pantalla que ve el usuario al cargar el sitio.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hero: {
    enabled: true,              // Mostrar/ocultar la sección hero
    
    backgroundImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop",
    // ★ CLIENTE: URL de la imagen de fondo (recomendado: 2000x1200px mínimo)
    
    eyebrow: "Estudio Creativo — Desde 2018",
    // ★ Texto pequeño sobre el título (ej: "Agencia Digital — Desde 2020")
    
    title: {
      line1: "Creamos",         // ★ Primera línea del título principal
      line2: "Experiencias",    // ★ Segunda línea del título principal
      
      // Palabras que rotan con efecto typewriter (máquina de escribir)
      typewriterWords: [
        "Digitales",            // Aparece como: "Creamos Experiencias Digitales"
        "Únicas",               // Luego cambia a: "Creamos Experiencias Únicas"
        "Memorables"            // Luego cambia a: "Creamos Experiencias Memorables"
      ],
    },
    
    subtitle: "Diseño, estrategia y tecnología fusionados para construir marcas que trascienden lo ordinario.",
    // ★ Descripción debajo del título (máximo 2 líneas recomendado)
    
    cta: "Descubrir Más",       // ★ Texto del botón CTA
    ctaHref: "#story",          // Destino del botón (puede ser #sección o URL externa)
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 HISTORIA (sección "Sobre Nosotros")
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Cuenta la historia del negocio con imagen + texto + estadísticas.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  story: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Nuestra Historia",  // Etiqueta pequeña sobre el título
    heading: "Donde la <em>visión</em> se convierte en realidad",
    // Título principal (puede incluir HTML como <em> para cursivas)
    
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
    // ★ Imagen principal (recomendado: 1200x1600px, formato vertical)
    
    // Párrafos de la historia (se muestran en orden)
    paragraphs: [
      "Párrafo 1 de la historia del negocio...",  // ★ Primer párrafo
      "Párrafo 2 de la historia del negocio...",  // ★ Segundo párrafo
      // Puedes agregar más párrafos si necesitas
    ],
    
    // Estadísticas numéricas (se muestran en fila)
    stats: [
      { number: "150+", label: "Proyectos" },    // ★ Número + descripción
      { number: "12",   label: "Premios" },
      { number: "98%",  label: "Satisfacción" },
    ],
    
    // Carrusel de patrocinadores/convenios (opcional)
    partners: {
      enabled: true,            // Mostrar/ocultar el carrusel
      title: "Patrocinadores y Convenios",  // Título del carrusel
      
      // Lista de logos (si img está vacío, muestra el nombre como texto)
      logos: [
        { name: "GNP Seguros",       img: "" },  // ★ Sin imagen = muestra texto
        { name: "Laboratorios Roma", img: "" },
        { name: "UNAM",              img: "" },
        { name: "MetLife",           img: "" },
        { name: "Farmacias Similar", img: "" },
        { name: "AXA",               img: "" },
        // Para usar imagen: { name: "Marca", img: "https://url-del-logo.png" }
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ SERVICIOS (tarjetas flip con frente/reverso)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Cada servicio tiene una tarjeta que gira al hacer clic.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  services: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Especialidades",    // Etiqueta pequeña
    heading: "Atención médica <em>integral</em>",  // Título (con HTML permitido)
    subtitle: "Cada consulta está diseñada para brindarte un diagnóstico preciso y un trato humano.",
    // Descripción debajo del título
    
    visibleCount: 6,            // Cuántas tarjetas mostrar antes del botón "Ver todos"
    
    // Lista de servicios (cada uno es una tarjeta)
    items: [
      {
        number: "01",           // Número decorativo (01, 02, 03...)
        title: "Consulta General",  // ★ Título del servicio
        
        intro: "Valoración completa y plan de tratamiento personalizado en una sola visita.",
        // ★ Texto del FRENTE de la tarjeta (corto, atractivo, máximo 120 caracteres)
        
        desc: "En esta consulta realizamos historia clínica completa, exploración física, interpretación de estudios recientes y diseñamos un plan de tratamiento paso a paso. Incluye receta digital, indicaciones por escrito y seguimiento por WhatsApp durante 7 días.",
        // ★ Texto del REVERSO de la tarjeta (largo, detallado, sin límite)
        // Soporta formato Markdown: **negrita**, *cursiva*, ## subtítulos, - listas
        
        image: "https://..."    // URL de imagen de fondo (marca de agua sutil)
      },
      {
        number: "02",
        title: "Consulta General",
        intro: "Valoración completa y plan de tratamiento personalizado en una sola visita.",
        desc: "En esta consulta realizamos historia clínica completa, exploración física, interpretación de estudios recientes y diseñamos un plan de tratamiento paso a paso. Incluye receta digital, indicaciones por escrito y seguimiento por WhatsApp durante 7 días.",
        image: "https://..."
      },
      {
        number: "03",
        title: "Consulta General",
        intro: "Valoración completa y plan de tratamiento personalizado en una sola visita.",
        desc: "En esta consulta realizamos historia clínica completa, exploración física, interpretación de estudios recientes y diseñamos un plan de tratamiento paso a paso. Incluye receta digital, indicaciones por escrito y seguimiento por WhatsApp durante 7 días.",
        image: "https://..."
      },
      // Agrega más servicios según necesites
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👩‍⚕️ EQUIPO MÉDICO (tarjetas con ficha técnica)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Muestra doctores/especialistas con foto + datos de contacto.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  team: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Equipo Médico",     // Etiqueta pequeña
    heading: "Especialistas que <em>te cuidan</em>",  // Título
    subtitle: "Profesionales certificados con vocación de servicio.",
    
    // Lista de miembros del equipo
    items: [
      {
        photo: "https://.../dra-lopez.jpg",  // ★ Foto del doctor (600x800px recomendado)
        name: "Dra. María López",            // ★ Nombre completo
        cedula: "Céd. Prof. 1234567",        // ★ Cédula profesional
        specialty: "Cardiología",            // ★ Especialidad
        
        bio: "Más de 12 años de experiencia en cardiología clínica y ecocardiografía. Certificada por el Consejo Mexicano de Cardiología.",
        // ★ Biografía corta (máximo 200 caracteres)
        
        phone: "+52 55 1234 5678",           // Teléfono de contacto
        whatsapp: "5215512345678",           // WhatsApp (formato: 52 + 10 dígitos)
        email: "dra.lopez@clinica.com",      // Correo electrónico
        schedule: "Lun–Vie · 9:00–17:00",    // Horario de atención
      },
      // { /* más doctores… */ },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖼️ GALERÍA / PORTAFOLIO (carrusel parallax)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Carrusel horizontal de imágenes con efecto parallax al hacer scroll.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  gallery: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Portafolio",        // Etiqueta pequeña
    heading: "Trabajo que <em>habla</em> por sí solo",  // Título
    subtitle: "Una selección de proyectos donde la creatividad y la estrategia se encuentran.",
    
    // Lista de imágenes del portafolio
    items: [
      {
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
        // ★ URL de la imagen (recomendado: 1600x1200px mínimo)
        
        caption: "Proyecto 1",  // ★ Texto que aparece al hacer hover
        
        parallaxSpeed: 0.08     // Velocidad del efecto parallax (0.05 a 0.15)
                                // Valores positivos = se mueve hacia adelante
                                // Valores negativos = se mueve hacia atrás
      },
      {
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=2032&auto=format&fit=crop",
        caption: "Proyecto 2",
        parallaxSpeed: -0.05    // Este se mueve en dirección opuesta
      },
      {
        image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=2080&auto=format&fit=crop",
        caption: "Proyecto 3",
        parallaxSpeed: 0.1
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💬 FILOSOFÍA (cita inspiracional + CTA)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Sección opcional con una frase + botón de acción.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  philosophy: {
    enabled: false,             // Cambiar a true para activar esta sección
    
    label: "Nuestra Filosofía",
    
    quote: "El diseño no es solo lo que se ve y se siente. El diseño es <em>cómo funciona</em>.",
    // Cita principal (puede incluir HTML)
    
    author: "— Steve Jobs",     // Autor de la cita
    
    cta: "Iniciar un Proyecto", // Texto del botón
    ctaHref: "#contact",        // Destino del botón
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛍️ TIENDA (sección de acceso a tienda.html)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Esta sección solo muestra un CTA que lleva a tienda.html.
  // Los productos reales están en tienda.html + Supabase.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ecommerce: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Tienda Online",
    heading: "Productos que <em>inspiran</em>",
    subtitle: "Descubre nuestra colección curada de productos.",
    
    cta: "Ver Catálogo Completo",  // Texto del botón
    ctaHref: "tienda.html",        // Destino (archivo tienda.html)
    
    products: [],               // No se usa aquí (productos están en Supabase)
    
    // Popup de promociones (aparece después de X segundos)
    promotions: {
      enabled: true,            // Mostrar/ocultar el popup
      delay: 3000,              // Milisegundos antes de mostrar (3 segundos)
      autoRotate: true,         // Rotar automáticamente entre promociones
      rotateInterval: 6000,     // Intervalo entre rotaciones (6 segundos)
      showCloseButton: true,    // Mostrar botón de cerrar
      rememberDismiss: true,    // Recordar si el usuario cerró el popup
      dismissDuration: 24,      // Horas antes de volver a mostrar
      
      items: []                 // Promociones (se cargan desde Supabase)
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 BLOG (sección de acceso a blog.html)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Esta sección solo muestra un CTA que lleva a blog.html.
  // Los posts reales están en blog.html + Supabase.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  blog: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Nuestro Blog",
    heading: "Historias que <em>inspiran</em>",
    subtitle: "Reflexiones, tendencias y detrás de escena de nuestro proceso creativo.",
    
    cta: "Leer Artículos",      // Texto del botón
    ctaHref: "blog.html",       // Destino (archivo blog.html)
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📬 CONTACTO (formulario + datos)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Formulario de contacto que envía a FormSubmit.co
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  contact: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Contacto",
    heading: "Hablemos de tu <em>próximo proyecto</em>",
    subtitle: "¿Tienes una idea en mente? Cuéntanos sobre ella.",
    
    // Configuración del formulario
    form: {
      namePlaceholder: "Tu nombre",
      emailPlaceholder: "Tu correo electrónico",
      subjectPlaceholder: "Asunto",
      messagePlaceholder: "Cuéntanos sobre tu proyecto...",
      
      submitText: "Enviar Mensaje",  // Texto del botón enviar
      
      successMessage: "¡Mensaje enviado con éxito! Te contactaremos pronto.",
      errorMessage: "Hubo un error al enviar. Por favor, intenta de nuevo.",
    },
    
    email: "contacto@clientedominio.com",   // ★ Correo de contacto
    phone: "+52 55 1234 5678",              // ★ Teléfono (formato internacional)
    address: "Ciudad de México, México",    // ★ Dirección física
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🦶 FOOTER (pie de página)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // app.js construye el footer dinámicamente usando estos datos.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  footer: {
    enabled: true,              // Mostrar/ocultar el footer
    
    brand: {
      name: "STU",              // ★ Nombre del logo (igual que header)
      highlight: "DIO",         // ★ Parte resaltada
      desc: "Descripción corta del negocio para el pie de página.",
      // ★ Descripción breve (máximo 100 caracteres)
    },
    
    // Columnas del footer (máximo 4 columnas recomendado)
    columns: [
      {
        title: "Navegación",    // Título de la columna
        links: [
          { label: "Inicio",      href: "#hero" },
          { label: "Historia",    href: "#story" },
          { label: "Equipo",      href: "#team" },
          { label: "Servicios",   href: "#services" },
          { label: "Galería",     href: "#gallery" },
          { label: "Tienda",      href: "#ecommerce" },
          { label: "Blog",        href: "#blog" },
          { label: "Testimonios", href: "#testimonials" },
          { label: "Contacto",    href: "#contact" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Aviso de Privacidad",    href: "legal.html#privacy" },
          { label: "Términos y Condiciones", href: "legal.html#terms" },
          { label: "Términos Comerciales",   href: "legal.html#commercial" },
          { label: "Política de Cookies",    href: "legal.html#cookies" },
        ],
      },
      {
        title: "Contacto",
        links: [
          { label: "contacto@clientedominio.com", href: "mailto:contacto@clientedominio.com" },
          { label: "+52 55 1234 5678",            href: "tel:+525512345678" },
          { label: "Ciudad de México, MX",        href: "#contact" },
        ],
      },
    ],
    
    // Copyright (año se calcula automáticamente)
    copyright: "© " + new Date().getFullYear() + " NOMBRE LEGAL S.A. de C.V. Todos los derechos reservados.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌐 REDES SOCIALES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Enlaces que aparecen en el footer.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  socials: [
    { label: "Instagram", href: "https://instagram.com/USUARIO_CLIENTE" },  // ★
    { label: "Facebook",  href: "https://facebook.com/USUARIO_CLIENTE" },   // ★
    { label: "WhatsApp",  href: "https://wa.me/5215512345678" },           // ★
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚡ EFECTOS VISUALES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Controla animaciones y efectos avanzados.
  // Normalmente no necesitas modificar esto.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  effects: {
    parallaxHeroSpeed: 0.35,     // Velocidad del parallax en el hero
    parallaxImageSpeed: 0.12,    // Velocidad del parallax en imágenes
    smoothScrollLerp: 0.08,      // Suavidad del scroll (0.05 a 0.15)
    revealThreshold: 0.15,       // Umbral para activar animaciones (0.1 a 0.3)
    
    cursorEnabled: true,         // Cursor personalizado (desactivar en móvil)
    grainEnabled: true,          // Efecto de grano/ruido sutil
    progressBarEnabled: true,    // Barra de progreso de scroll
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛒 TIENDA (configuración específica de tienda.html)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  tienda: {
    whatsapp: "5215512345678",  // ★ WhatsApp (52 + 10 dígitos, sin + ni espacios)
    
    // Hero de la tienda
    hero: {
      eyebrow: "Tienda Online",
      titleLine1: "Productos que",
      titleLine2: "inspiran",
      subtitle: "Descubre nuestra colección curada de productos."
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 SUPABASE (base de datos)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Conexión a Supabase para blog, testimonios, productos, etc.
  // Cada cliente debe tener su propio proyecto de Supabase.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  supabase: {
    url: "https://ouxfmeugibrpjysjfqso.supabase.co",
    // ★ URL del proyecto (Settings → API → Project URL)
    
    key: "sb_publishable_jAgXqz1iqlEyveCIFy4eOw_idYvxmoQ",
    // ★ Clave anon/public (NUNCA usar service_role)
    
    storageBucket: "blog-images",  // Nombre del bucket de Storage
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📧 EMAIL & FORMULARIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Configuración de FormSubmit.co para el formulario de contacto.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  email: {
    contactForm: "contacto@clientedominio.com",  // ★ Correo que recibe mensajes
    formSubmitUrl: "https://formsubmit.co/ajax/contacto@clientedominio.com",
    // ★ URL de FormSubmit (se activa al primer envío)
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 BLOG CONFIG (mensajes del sistema)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Mensajes que muestra blog.js al usuario.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  blogConfig: {
    categories: [],             // Categorías iniciales (se cargan desde Supabase)
    heroStars: 35,              // Número de estrellas en el hero del blog
    
    // Mensajes del sistema (puedes personalizar el texto)
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛒 TIENDA CONFIG (mensajes del sistema)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Mensajes que muestra shop.js al usuario.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  shopConfig: {
    whatsapp: {
      number: "5215512345678",  // ★ Igual que tienda.whatsapp
      defaultMessage: "¡Hola! Me interesa conocer más sobre sus productos.",
      orderMessage: "¡Hola! Me interesa hacer el siguiente pedido:\n\n",
      orderTotal: "\n*💰 Total a pagar: $",
      emptyCartAlert: "Tu carrito está vacío. ¡Agrega algunos productos primero!",
    },
    
    // Botón flotante de WhatsApp
    whatsappButton: {
      showThreshold: 0.80,      // Mostrar después del 80% del scroll
      hideThreshold: 0.75,      // Ocultar antes del 75% del scroll
    },
    
    messages: {
      promoApplied: '¡Código "{code}" aplicado! {label}',
      promoInvalid: "Código no válido o expirado",
      promoRemoved: "Código de descuento eliminado",
      promoCopied: 'Código "{code}" copiado',
      addedToCart: "Producto agregado al carrito",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏢 DATOS FISCALES DEL NEGOCIO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Información legal que aparece en legal.html
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  business: {
    name: "Nombre Comercial",                    // ★ Nombre comercial
    legalName: "Razón Social S.A. de C.V.",      // ★ Razón social legal
    taxId: "XXX000000XX0",                       // ★ RFC (12-13 caracteres)
    address: "Calle, Número, Colonia, C.P., Ciudad, México", // ★ Dirección fiscal
    phone: "+52 55 1234 5678",                   // ★ Teléfono
    email: "contacto@clientedominio.com",        // ★ Correo
    businessHours: "Lun - Vie: 9:00 - 18:00",    // Horario de atención
    registryData: "Inscrita en el Registro Público de Comercio", // ★ Datos registrales
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📍 UBICACIÓN (mapa + datos de contacto)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Sección opcional con mapa de Google Maps embebido.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  location: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Ubicación",
    heading: "Visítanos <em>hoy</em>",
    subtitle: "Estamos para atenderte en el corazón de la ciudad.",
    
    address: "Av. Siempre Viva 123, Col. Centro, C.P. 06000, Ciudad de México",  // ★
    phone: "+52 55 1234 5678",  // ★
    phoneHref: "tel:+525512345678",  // Enlace para llamar
    
    // Horarios de atención
    hours: [
      { d: "Lunes a Viernes", h: "9:00 – 19:00" },
      { d: "Sábado",          h: "10:00 – 14:00" },
      { d: "Domingo",         h: "Cerrado" }
    ],
    
    mapsQuery: "Av. Siempre Viva 123, Col. Centro, Ciudad de México",
    // ★ Dirección que busca Google Maps (debe ser exacta)
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📅 CITAS (formulario de solicitud)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Formulario que envía solicitudes a WhatsApp + Supabase.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  appointments: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Agenda tu cita",
    heading: "Reserva tu <em>momento</em>",
    subtitle: "Déjanos tus datos y te confirmamos por WhatsApp en menos de 24 horas.",
    
    // Horarios disponibles para reservar
    slots: [
      "Mañana (9:00–13:00)",
      "Tarde (14:00–18:00)",
      "Noche (18:00–21:00)"
    ],
    
    successMessage: "¡Solicitud enviada! Te confirmaremos por WhatsApp.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💳 PAGOS CON TARJETA (módulo opcional)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Integración con Mercado Pago o Stripe.
  // Déjalo en false hasta que el cliente pague por esta funcionalidad.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  payments: {
    enabled: false,             // EL INTERRUPTOR: true = pagos activos
    provider: "mercadopago",    // "mercadopago" | "stripe"
    currency: "MXN",            // Moneda (MXN, USD, EUR)
    buttonLabel: "💳 Pagar con tarjeta",  // Texto del botón
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌟 TESTIMONIOS (prueba social)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Sección que carga testimonios desde Supabase.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  testimonials: {
    enabled: true,              // Mostrar/ocultar esta sección
    
    label: "Testimonios",
    heading: "Clientes que <em>confían</em> en nosotros",
    subtitle: "Opiniones reales tomadas de nuestras redes sociales, con fotos reales de nuestros productos.",
  },
};