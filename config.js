/* ============================================================
   CONFIG.JS — CONFIGURACIÓN MAESTRA — SECTOR SALUD
   ============================================================
   Plantilla adaptada para clínicas, hospitales, consultorios
   médicos y profesionales de la salud.
   
   🎨 PALETA PREMIUM MÉDICA:
   - Crema clínica (#FAF8F5)
   - Verde quirúrgico (#2E8B7F)
   - Azul noche (#0F2A3F)
   - Tipografías: Cormorant Garamond + Manrope
   
   FLUJO DE TRABAJO POR CLIENTE:
   1. Copiar este archivo como config.js
   2. Modificar campos marcados con ★ CLIENTE
   3. Configurar Supabase (URL + key anon)
   4. Subir al hosting del cliente
   ============================================================ */

const SITE_CONFIG = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎨 TEMA / IDENTIDAD VISUAL (PALETA MÉDICA PREMIUM)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  theme: {
    mode: "light",   // ← "light" para clínicas | "dark" para clientes oscuros
    // Paleta médica premium: calma, confianza y profesionalismo
    bg: "#FAF8F5",              // Fondo principal (blanco clínico cálido)
    bgAlt: "#F0EDE4",           // Fondo alternativo (crema muy suave)
    text: "#0F2A3F",            // Texto principal (azul noche médico)
    textMuted: "#6B7A8F",       // Texto secundario (gris azulado)
    
    accent: "#2E8B7F",          // ★ Verde quirúrgico (color hospital premium)
    accentRGB: "46, 139, 127",  // Mismo color en RGB
    accentLight: "#5FB8AD",     // Verde menta claro (para hovers)
    
    white: "#ffffff",           // Blanco puro
    dark: "#0F2A3F",            // Azul noche profundo (reemplaza al negro puro)
    
    // Tipografías médicas premium (serif elegante + sans legible)
    fontDisplay: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    fontBody: "'Manrope', 'Inter', -apple-system, sans-serif",
    
    // Google Fonts con la nueva selección
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Manrope:wght@300;400;500;600;700&display=swap",
    fontAwesomeUrl: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
    
    // Personalidad: "editorial" = elegante, sofisticado, serio (ideal para salud)
    personality: "editorial",
    
    // Layout del hero: "split" = texto izquierda + imagen derecha (estilo clínica premium)
    heroLayout: "split",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⏳ LOADER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  loader: {
    text: "Vitalis",            // ★ Nombre corto de la clínica
    duration: 2200,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🧭 HEADER / NAVEGACIÓN SUPERIOR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  header: {
    enabled: true,
    maxLinks: 5,
    
    logo: {
      text: "VI",               // ★ Primera parte del logo
      highlight: "TALIS",       // ★ Parte en color accent
    },
    
    links: [
      { label: "Inicio",         href: "#hero" },
      { label: "Nosotros",       href: "#story" },
      { label: "Especialidades", href: "#services" },
      { label: "Equipo",         href: "#team" },
      { label: "Instalaciones",  href: "#gallery" },
      { label: "Blog de Salud",  href: "#blog" },
      { label: "Testimonios",    href: "#testimonials" },
      { label: "Ubicación",      href: "#location" },
      { label: "Contacto",       href: "#contact" },
    ],
    
    // CTA principal: AGENDAR CITA (el más importante en salud)
    cta: { 
      label: "Agendar Cita",
      href: "#appointments"
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏠 HERO (pantalla principal)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  hero: {
    enabled: true,
    
    // Imagen: doctor(a) o instalaciones premium (recomendado 2000x1200px)
    backgroundImage: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop",
    
    eyebrow: "Clínica Médica Premium — Desde 2010",
    
    title: {
      line1: "Nosotros",
      line2: "Cuidamos tu",
      typewriterWords: [
        "Bienestar",
        "Salud",
        "Futuro",
        "Familia"
      ],
    },
    
    subtitle: "Medicina de precisión con calidez humana. Diagnósticos avanzados y atención personalizada por especialistas certificados.",
    
    cta: "Agendar Consulta",
    ctaHref: "#appointments",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 HISTORIA (Sobre la Clínica)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  story: {
    enabled: true,
    
    label: "Nuestra Historia",
    heading: "Más de una década <em>cuidando</em> de ti",
    
    // Imagen: fachada de la clínica o sala de espera premium
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop",
    
    paragraphs: [
      "Fundada en 2010 por un equipo de médicos con visión humanista, Clínica Vitalis nació con un propósito claro: ofrecer atención médica de primer nivel sin perder el trato cálido que cada paciente merece. Hoy somos referentes en medicina integral en la región.",
      "Contamos con tecnología diagnóstica de última generación, un equipo multidisciplinario de más de 25 especialistas y protocolos clínicos basados en evidencia internacional. Cada paciente recibe un plan de atención personalizado, porque entendemos que no hay dos historias clínicas iguales."
    ],
    
    stats: [
      { number: "15K+", label: "Pacientes Atendidos" },
      { number: "25",   label: "Especialistas" },
      { number: "99%",  label: "Satisfacción" },
      { number: "14",   label: "Años de Experiencia" },
    ],
    
    // Convenios con aseguradoras (clave para clínicas privadas)
    partners: {
      enabled: true,
      title: "Aseguradoras y Convenios",
      logos: [
        { name: "GNP Seguros",    img: "" },
        { name: "MetLife",        img: "" },
        { name: "AXA Seguros",    img: "" },
        { name: "Allianz",        img: "" },
        { name: "Mapfre",         img: "" },
        { name: "Zurich Seguros", img: "" },
        { name: "Cigna",          img: "" },
        { name: "Bupa",           img: "" },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚙️ SERVICIOS / ESPECIALIDADES MÉDICAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  services: {
    enabled: true,
    
    label: "Especialidades",
    heading: "Atención médica <em>integral</em>",
    subtitle: "Cada especialidad cuenta con equipo de diagnóstico avanzado y especialistas certificados por sus respectivos consejos médicos.",
    
    visibleCount: 6,
    
    items: [
      {
        number: "01",
        title: "Cardiología",
        intro: "Diagnóstico y tratamiento de enfermedades del corazón y sistema circulatorio.",
        desc: "**Evaluación cardiovascular completa** con electrocardiograma, ecocardiograma Doppler, prueba de esfuerzo y monitoreo Holter 24h.\n\nNuestros cardiólogos certificados por el Consejo Mexicano de Cardiología atienden:\n- Hipertensión arterial\n- Arritmias cardíacas\n- Insuficiencia cardíaca\n- Enfermedad coronaria\n- Prevención cardiovascular\n\n*Incluye interpretación de estudios, receta digital y seguimiento por WhatsApp.*",
        image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=2070&auto=format&fit=crop"
      },
      {
        number: "02",
        title: "Dermatología",
        intro: "Cuidado especializado de piel, cabello y uñas con tecnología de última generación.",
        desc: "**Diagnóstico dermatoscópico digital** y tratamientos avanzados para:\n- Acné y rosácea\n- Dermatitis y psoriasis\n- Lunares y lesiones sospechosas (mapeo corporal)\n- Caída del cabello\n- Rejuvenecimiento facial médico\n\n*Contamos con láser fraccionado, luz pulsada y crioterapia.*",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop"
      },
      {
        number: "03",
        title: "Pediatría",
        intro: "Atención integral para recién nacidos, niños y adolescentes en un entorno cálido.",
        desc: "**Control del niño sano**, vacunación y atención de enfermedades pediátricas.\n\n- Consultas de desarrollo y crecimiento\n- Vacunación completa (esquema nacional + internacional)\n- Atención de enfermedades comunes\n- Evaluación nutricional\n- Adolescencia y salud mental juvenil\n\n*Área de juegos diseñada para que los pequeños se sientan cómodos.*",
        image: "https://images.unsplash.com/photo-1581056771107-2421345a0e4a?q=80&w=2070&auto=format&fit=crop"
      },
      {
        number: "04",
        title: "Ginecología y Obstetricia",
        intro: "Cuidado integral de la salud femenina en todas las etapas de la vida.",
        desc: "**Atención ginecológica completa** con equipo de diagnóstico de última generación.\n\n- Papanicolaou y colposcopia digital\n- Ultrasonido pélvico y obstétrico 4D\n- Control prenatal de alto y bajo riesgo\n- Climaterio y terapia hormonal\n- Planificación familiar\n\n*Ginecólogas certificadas con enfoque humano y discreto.*",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2069&auto=format&fit=crop"
      },
      {
        number: "05",
        title: "Nutrición Clínica",
        intro: "Planes alimenticios personalizados basados en evidencia científica.",
        desc: "**Evaluación nutricional integral** con análisis de composición corporal (bioimpedancia).\n\n- Pérdida y control de peso\n- Nutrición deportiva\n- Dietas para enfermedades crónicas (diabetes, hipertensión)\n- Nutrición en embarazo y lactancia\n- Alimentación vegetariana/vegana\n\n*Plan de alimentación personalizado + seguimiento semanal.*",
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop"
      },
      {
        number: "06",
        title: "Medicina General",
        intro: "Tu primer punto de contacto: diagnósticos precisos y derivaciones oportunas.",
        desc: "**Consulta médica integral** con historia clínica digital completa.\n\n- Chequeo médico preventivo anual\n- Interpretación de estudios de laboratorio\n- Certificados médicos oficiales\n- Atención de enfermedades agudas\n- Derivación a especialistas cuando sea necesario\n\n*Incluye receta digital y seguimiento por WhatsApp durante 7 días.*",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop"
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 👩‍⚕️ EQUIPO MÉDICO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  team: {
    enabled: true,
    
    label: "Nuestro Equipo",
    heading: "Especialistas que <em>te cuidan</em>",
    subtitle: "Médicos certificados con formación en las mejores instituciones del país y del extranjero.",
    
    items: [
      {
        photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop",
        name: "Dra. María López Hernández",
        cedula: "Céd. Prof. 7845123",
        specialty: "Cardiología Clínica",
        bio: "Egresada de la UNAM con especialidad en el Instituto Nacional de Cardiología. Más de 12 años de experiencia.",
        phone: "+52 55 1234 5678",
        whatsapp: "5215512345678",
        email: "dra.lopez@clinicavitalis.com",
        schedule: "Lun–Vie · 9:00–17:00",
      },
      {
        photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop",
        name: "Dr. Carlos Ramírez Soto",
        cedula: "Céd. Prof. 9234567",
        specialty: "Dermatología",
        bio: "Especialista formado en la Fundación Jiménez Díaz (España). Experto en dermatoscopia y láser dermatológico.",
        phone: "+52 55 1234 5679",
        whatsapp: "5215512345679",
        email: "dr.ramirez@clinicavitalis.com",
        schedule: "Mar–Sáb · 10:00–18:00",
      },
      {
        photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=1974&auto=format&fit=crop",
        name: "Dra. Andrea Torres Vega",
        cedula: "Céd. Prof. 8123456",
        specialty: "Pediatría",
        bio: "Pediatra con subespecialidad en neonatología. Certificada por el Consejo Mexicano de Pediatría.",
        phone: "+52 55 1234 5680",
        whatsapp: "5215512345680",
        email: "dra.torres@clinicavitalis.com",
        schedule: "Lun–Vie · 8:00–15:00",
      },
      {
        photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1964&auto=format&fit=crop",
        name: "Dr. Roberto Mendoza",
        cedula: "Céd. Prof. 6547891",
        specialty: "Ginecología y Obstetricia",
        bio: "Más de 15 años de experiencia en obstetricia de alto riesgo. Formado en el Hospital Español de México.",
        phone: "+52 55 1234 5681",
        whatsapp: "5215512345681",
        email: "dr.mendoza@clinicavitalis.com",
        schedule: "Lun–Vie · 9:00–18:00",
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🖼️ GALERÍA / INSTALACIONES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  gallery: {
    enabled: true,
    label: "Nuestras Instalaciones",
    heading: "Espacios diseñados para tu <em>bienestar</em>",
    subtitle: "Instalaciones modernas, higiénicas y pensadas para que te sientas cómodo desde el primer momento.",
    items: [
      { image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop", caption: "Recepción Principal",  parallaxSpeed: 0.08 },
      { image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=2000&auto=format&fit=crop", caption: "Consultorios",        parallaxSpeed: -0.05 },
      { image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop", caption: "Laboratorio Clínico", parallaxSpeed: 0.1 },
      { image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2000&auto=format&fit=crop", caption: "Sala de Espera",      parallaxSpeed: -0.08 },
      { image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2000&auto=format&fit=crop", caption: "Atención Pediátrica", parallaxSpeed: 0.06 },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💬 FILOSOFÍA (activada para clínicas)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  philosophy: {
    enabled: true,
    label: "Nuestra Filosofía",
    quote: "La medicina no es solo ciencia, es el <em>arte de cuidar</em> con el corazón.",
    author: "— Dr. Carlos Ramírez, Director Médico",
    cta: "Conoce a Nuestro Equipo",
    ctaHref: "#team",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛒 TIENDA (DESACTIVADA — no es natural en clínicas)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ecommerce: { 
    enabled: true,  // ★ Desactivada (clínicas médicas no venden productos)
    label: "Farmacia",
    heading: "Productos que <em>cuidan</em>",
    subtitle: "Productos médicos y de cuidado personal recomendados por nuestros especialistas.",
    cta: "Ver Catálogo",
    ctaHref: "tienda.html",
    products: [],
    promotions: { enabled: false, delay: 3000, autoRotate: true, rotateInterval: 6000, showCloseButton: true, rememberDismiss: true, dismissDuration: 24, items: [] },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 BLOG DE SALUD
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  blog: {
    enabled: true,
    label: "Blog de Salud",
    heading: "Información que <em>cuida</em>",
    subtitle: "Artículos médicos redactados por nuestros especialistas. Educación en salud basada en evidencia.",
    cta: "Leer Artículos",
    ctaHref: "blog.html",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📬 CONTACTO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  contact: {
    enabled: true,
    label: "Contacto",
    heading: "Estamos para <em>atenderte</em>",
    subtitle: "¿Tienes dudas sobre tu salud o nuestros servicios? Nuestro equipo de atención al paciente te responde en menos de 24 horas.",
    
    form: {
      namePlaceholder: "Tu nombre completo",
      emailPlaceholder: "Tu correo electrónico",
      subjectPlaceholder: "Motivo de consulta",
      messagePlaceholder: "Cuéntanos cómo podemos ayudarte...",
      submitText: "Enviar Mensaje",
      successMessage: "¡Mensaje enviado! Nuestro equipo te contactará en las próximas 24 horas.",
      errorMessage: "Hubo un error al enviar. Intenta de nuevo o llámanos directamente.",
    },
    
    email: "contacto@clinicavitalis.com",
    phone: "+52 55 5555 1234",
    address: "Av. Reforma 222, Col. Juárez, C.P. 06600, Ciudad de México",
    urgencias: "+52 55 5555 9999",  // ★ DATO EXTRA: línea de urgencias (útil en salud)
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🦶 FOOTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  footer: {
    enabled: true,
    brand: {
      name: "VI",
      highlight: "TALIS",
      desc: "Clínica médica premium. Medicina integral con tecnología de vanguardia y trato humano.",
    },
    
    columns: [
      {
        title: "Clínica",
        links: [
          { label: "Inicio",           href: "#hero" },
          { label: "Nosotros",         href: "#story" },
          { label: "Especialidades",   href: "#services" },
          { label: "Equipo",           href: "#team" },
          { label: "Instalaciones",    href: "#gallery" },
          { label: "Blog de Salud",    href: "#blog" },
          { label: "Testimonios",      href: "#testimonials" },
        ],
      },
      {
        title: "Servicios",
        links: [
          { label: "Cardiología",              href: "#services" },
          { label: "Dermatología",             href: "#services" },
          { label: "Pediatría",                href: "#services" },
          { label: "Ginecología",              href: "#services" },
          { label: "Nutrición",                href: "#services" },
          { label: "Chequeos Preventivos",     href: "#services" },
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
          { label: "🚨 Urgencias 24h",               href: "tel:+525555559999" },
          { label: "📞 Citas: +52 55 5555 1234",     href: "tel:+525555551234" },
          { label: "✉️ contacto@clinicavitalis.com", href: "mailto:contacto@clinicavitalis.com" },
          { label: "📍 Av. Reforma 222, CDMX",       href: "#location" },
        ],
      },
    ],
    
    copyright: "© " + new Date().getFullYear() + " Clínica Vitalis S.A. de C.V. — Todos los derechos reservados. Aviso: La información en este sitio no sustituye una consulta médica profesional.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌐 REDES SOCIALES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  socials: [
    { label: "Instagram", href: "https://instagram.com/clinicavitalis" },
    { label: "Facebook",  href: "https://facebook.com/clinicavitalis" },
    { label: "WhatsApp",  href: "https://wa.me/5215555551234" },
    { label: "LinkedIn",  href: "https://linkedin.com/company/clinica-vitalis" },
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
    grainEnabled: false,       // ★ Desactivado (clínicas piden look más limpio)
    progressBarEnabled: true,
    servicesLight: false,
    galleryAuto: true,          // false = sin auto-rotación (solo clic/drag)
    galleryAutoInterval: 4000,  // ms entre cada libro centrado
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛒 TIENDA (archivo tienda.html) — desactivada
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  tienda: {
    whatsapp: "5215555551234",
    hero: {
      eyebrow: "Farmacia Vitalis",
      titleLine1: "Productos que",
      titleLine2: "cuidan",
      subtitle: "Productos médicos recomendados por nuestros especialistas."
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔐 SUPABASE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  supabase: {
    url: "https://ouxfmeugibrpjysjfqso.supabase.co",
    key: "sb_publishable_jAgXqz1iqlEyveCIFy4eOw_idYvxmoQ",
    storageBucket: "blog-images",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Analítica (se activa solo si el cliente la pide Y el usuario acepta)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  analytics: {
  enabled: false,            // ← pon true cuando el cliente contrate analítica
  measurementId: "G-XXXXXXXXXX",  // ← ID de Google Analytics 4
},

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📧 EMAIL & FORMULARIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  email: {
    contactForm: "contacto@clinicavitalis.com",
    formSubmitUrl: "https://formsubmit.co/ajax/contacto@clinicavitalis.com",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📝 BLOG CONFIG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  blogConfig: {
    categories: ["prevencion", "cardiologia", "nutricion", "pediatria", "dermatologia"],
    heroStars: 25,  // menos estrellas (look más serio)
    messages: {
      postSuccess: "¡Artículo publicado con éxito!",
      postError: "Error al crear el artículo",
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
      likeAdded: "¡Te gustó este artículo!",
      likeRemoved: "Like removido",
      saved: "Artículo guardado",
      unsaved: "Artículo removido de guardados",
      invalidCategory: "Debe haber al menos una categoría",
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛒 TIENDA CONFIG
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  shopConfig: {
    whatsapp: {
      number: "5215555551234",
      defaultMessage: "Hola, me interesa conocer más sobre sus productos médicos.",
      orderMessage: "Hola, me gustaría realizar el siguiente pedido:\n\n",
      orderTotal: "\n*💰 Total a pagar: $",
      emptyCartAlert: "Tu carrito está vacío.",
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

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏢 DATOS FISCALES (CLÍNICA)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  business: {
    name: "Clínica Vitalis",
    legalName: "Clínica Vitalis S.A. de C.V.",
    taxId: "CVL100315AB1",                       // RFC real de la clínica
    address: "Av. Reforma 222, Col. Juárez, C.P. 06600, Ciudad de México",
    phone: "+52 55 5555 1234",
    email: "contacto@clinicavitalis.com",
    businessHours: "Lun - Sáb: 8:00 - 20:00 | Urgencias 24h",
    registryData: "Inscrita en el Registro Público de Comercio. COFEPRIS: 193300101A0234",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📍 UBICACIÓN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  location: {
    enabled: true,
    label: "Nuestra Ubicación",
    heading: "Visítanos en <em>nuestra clínica</em>",
    subtitle: "Fácil acceso, estacionamiento propio y transporte público cercano.",
    
    address: "Av. Reforma 222, Col. Juárez, C.P. 06600, Ciudad de México",
    phone: "+52 55 5555 1234",
    phoneHref: "tel:+525555551234",
    
    hours: [
      { d: "Lunes a Viernes", h: "8:00 – 20:00" },
      { d: "Sábado",          h: "9:00 – 14:00" },
      { d: "Domingo",         h: "Solo Urgencias" },
      { d: "Urgencias",       h: "24 horas" },
    ],

    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop",
    // ↑ Fachada de la clínica (reemplázala por la foto real del cliente)
    
    mapsQuery: "Av. Paseo de la Reforma 222, Juárez, Cuauhtémoc, 06600 Ciudad de México, CDMX",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📅 CITAS (CRÍTICO en salud)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  appointments: {
    enabled: true,
    label: "Agenda tu Cita",
    heading: "Reserva tu <em>consulta</em>",
    subtitle: "Déjanos tus datos y te confirmamos por WhatsApp en menos de 2 horas en horario laboral.",
    
    slots: [
      "Mañana (8:00–12:00)",
      "Mediodía (12:00–15:00)",
      "Tarde (15:00–19:00)"
    ],
    
    successMessage: "¡Solicitud recibida! Nuestro equipo te contactará para confirmar tu cita.",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💳 PAGOS (desactivado por defecto)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  payments: {
    enabled: false,
    provider: "mercadopago",
    currency: "MXN",
    buttonLabel: "💳 Pagar consulta",
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌟 TESTIMONIOS (de pacientes)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  testimonials: {
    enabled: true,
    label: "Testimonios",
    heading: "Pacientes que <em>confían</em> en nosotros",
    subtitle: "Opiniones reales de pacientes que han recibido atención en nuestra clínica.",
  },
};