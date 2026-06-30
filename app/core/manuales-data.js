/* CXOrbia · Manuales — biblioteca de manuales completos por rol, legibles in-app.
   superadmin = manual maestro (TODO) · admin · ops · coordinador · shopper · cliente.
   Se integra a Academia (botón 📖 Manuales) y es autoadministrable (editar/crear). */
CX.manualesData = {
  KEY:'cx_manuales_custom',
  getCustom(){ try{return JSON.parse(localStorage.getItem(this.KEY)||'[]');}catch(e){return [];} },
  saveCustom(a){ try{localStorage.setItem(this.KEY,JSON.stringify(a));}catch(e){} CX.bus&&CX.bus.emit('manuales'); },
  add(m){ const a=this.getCustom(); a.unshift(Object.assign({id:'mu'+Date.now().toString(36),custom:true,secciones:[]},m)); this.saveCustom(a); },
  edit(id,patch){ const a=this.getCustom(); const m=a.find(x=>x.id===id); if(m)Object.assign(m,patch); this.saveCustom(a); },
  del(id){ this.saveCustom(this.getCustom().filter(x=>x.id!==id)); },
  all(){ return [...this.MANUALES, ...this.getCustom()]; },

  /* ── Manuales base (estructura: id, rol, ic, titulo, desc, secciones[{t, html}]) ── */
  MANUALES:[
    {
      id:'m_master', rol:'superadmin', ic:'👑', titulo:'Manual Maestro CXOrbia (todo el sistema)',
      desc:'Documento completo para el Super Admin: arquitectura, todos los módulos, configuración, operación, finanzas, comercial, IA, integraciones, multi-tenant y backend.',
      secciones:[
        {t:'1 · Qué es CXOrbia y arquitectura', html:`
<h2>Plataforma estratégica de field operations</h2>
<p>CXOrbia es una plataforma SaaS <b>multi-tenant</b> para consultoras de mystery shopping, auditoría, experiencia del cliente e investigación de mercados. Tiene <b>tres caras</b> que comparten la misma base de datos:</p>
<ul>
<li><b>Operativa/Administrativa</b> (la consultora): opera proyectos, shoppers, finanzas, comercial.</li>
<li><b>Shopper</b> (el evaluador): portal móvil con sus visitas, certificación, beneficios.</li>
<li><b>Portal del Cliente</b> (el cliente de la consultora): resultados, score, acciones, reportes.</li>
</ul>
<h3>Jerarquía de datos</h3>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Tenant / Consultora</b><p>Ej. TyA. Tiene su marca, plan y usuarios.</p></div>
  <div class="acad-step"><span>2</span><b>Cuenta / Cliente final</b><p>Ej. una cadena. Vive en CRM y en Clientes.</p></div>
  <div class="acad-step"><span>3</span><b>Proyecto / Programa</b><p>Ej. programa mensual GT/HN. Tiene sus reglas.</p></div>
  <div class="acad-step"><span>4</span><b>Visitas / Sucursales</b><p>Las unidades operativas del periodo.</p></div>
</div>
<h3>Roles del sistema</h3>
<ul>
<li><b>Super Admin</b>: acceso total (este manual).</li>
<li><b>Equipo administrativo</b>: operación + finanzas.</li>
<li><b>Equipo operativo</b>: solo operación.</li>
<li><b>Coordinador / Representante</b>: administra proyectos y HR de su(s) país(es).</li>
<li><b>Aliado / Franquiciado</b>: opera proyectos regionales delegados.</li>
<li><b>Shopper</b>: portal móvil.</li>
<li><b>Cliente</b> (portal): director / regional / sucursal.</li>
</ul>`},
        {t:'2 · Configuración inicial (white-label)', html:`
<h2>Personalizar la plataforma sin tocar código</h2>
<h3>Identidad de marca</h3>
<p>Configuración → 🎨 Marca. Sube el logo (se aplica a login, topbar, propuestas y documentos). Elige la paleta (CXOrbia, Corporativa/TyA, Esmeralda, Violeta) o personaliza colores. El logo se usa también como favicon e ícono de la app instalada.</p>
<h3>Plan y módulos</h3>
<p>Configuración → 📦 Plan. Elige el plan contratado (activa módulos automáticamente) o personaliza qué módulos están activos. Los módulos de administración están siempre disponibles.</p>
<h3>Países y monedas</h3>
<p>Configuración → 🌍 Países. Agrega los países de operación; cada uno con su moneda. Las finanzas y KPIs se separan automáticamente por moneda (nunca se suman entre países).</p>
<h3>Usuarios y permisos</h3>
<p>Configuración → 🔐 Usuarios. Invita usuarios (correo de cualquier dominio), asigna rol, edita o desactiva. Crea roles personalizados con su matriz de acceso por módulo. El patrón de usuario/contraseña es configurable (ej. nombre.apellido / Nombre123*).</p>
<h3>NDA / Confidencialidad</h3>
<p>Configuración → 📜 NDA. Edita el acuerdo de confidencialidad que firman los usuarios por rol.</p>`},
        {t:'3 · IA transversal (elige tu proveedor)', html:`
<h2>Inteligencia artificial en toda la plataforma</h2>
<p>CXOrbia es <b>agnóstica</b> de proveedor. Configuración → Automatizaciones → Asistente de IA. Elige entre Gemini, ChatGPT, Claude o un endpoint propio según costo/beneficio (hay un comparativo integrado). Pega tu API key y actívala.</p>
<h3>Dónde actúa la IA</h3>
<ul>
<li><b>Importadores</b>: lee archivos, extrae entidades, mapea, deduplica.</li>
<li><b>Set-up de proyecto</b>: extrae escenarios, secciones y cuestionario de un instructivo.</li>
<li><b>Certificación</b>: genera banco de preguntas desde el instructivo.</li>
<li><b>Documentos y propuestas</b>: redacta con branding del cliente.</li>
<li><b>Análisis crítico</b>: interpreta resultados financieros y operativos.</li>
<li><b>Marketing</b>: genera calendarios, piezas y copys.</li>
</ul>
<p>Toda función de IA permite <b>iterar</b>: revisar lo generado, dar una instrucción de ajuste y regenerar hasta que quede bien. Sin key, los módulos usan heurística (sin costo).</p>`},
        {t:'4 · Operación (el corazón)', html:`
<h2>El ciclo operativo</h2>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Publicar</b><p>Carga HR o publica visitas. Nacen "disponible".</p></div>
  <div class="acad-step"><span>2</span><b>Reservar/Postular</b><p>El shopper reserva o se postula.</p></div>
  <div class="acad-step"><span>3</span><b>Asignar</b><p>Aprobar postulación o asignar manual → WhatsApp al shopper.</p></div>
  <div class="acad-step"><span>4</span><b>Agendar</b><p>El shopper elige fecha/franja.</p></div>
  <div class="acad-step"><span>5</span><b>Realizar</b><p>Marca realizada → habilita cuestionario.</p></div>
  <div class="acad-step"><span>6</span><b>Cuestionario</b><p>Llena, adjunta evidencias, envía.</p></div>
  <div class="acad-step"><span>7</span><b>Liquidar</b><p>Se genera la liquidación automáticamente.</p></div>
</div>
<h3>Módulos de Operación</h3>
<ul>
<li><b>Mi Día</b>: cronograma tipo calendario con visitas y tareas pendientes.</li>
<li><b>Dashboard operativo</b>: KPIs clickeables, avance real vs ideal por país, ranking de shoppers, comparativo trimestral, estado operativo de visitas.</li>
<li><b>Visitas</b>: tabla operativa (admin) / marketplace (shopper).</li>
<li><b>Postulaciones</b>: aprobar/rechazar/standby/reprogramar/reasignar/cancelar, con trazabilidad de quién gestionó.</li>
<li><b>Reservas y asignación</b>: para programas mensuales, cruce reserva↔postulación.</li>
</ul>
<h3>Anti-duplicación con HR externa</h3>
<p>Cuando la HR es un Google Sheet/Excel en vivo, el sistema lee y escribe de vuelta usando una <b>llave natural inmutable</b>, por lo que nunca duplica aunque asignes desde la plataforma o desde la HR.</p>`},
        {t:'5 · Finanzas', html:`
<h2>Control financiero completo</h2>
<ul>
<li><b>Dashboard financiero</b>: márgenes por país, CxC/CxP, financiamientos, análisis crítico con IA, comparativo intermensual/interanual.</li>
<li><b>Movimientos & Tesorería</b>: ingresos (comisiones, honorarios, anticipos, facturación, remesas), egresos, CxC/CxP clickeables y editables, financiamientos (no cuentan como ingreso operativo), presupuesto mensual.</li>
<li><b>Liquidaciones</b>: se generan automáticamente de las visitas; elige cuáles van al lote; las no pagadas pasan a CxP el mes siguiente.</li>
<li><b>Lotes de pago</b>: al pagar, se reflejan como egresos por shopper.</li>
</ul>
<p><b>Regla de oro:</b> nunca se suman monedas entre países. GT (Q) y HN (L) se ven separados.</p>`},
        {t:'6 · Comercial (CRM, costos, marketing)', html:`
<h2>La cara comercial</h2>
<ul>
<li><b>CRM</b>: Dashboard/Insights, Pipeline (kanban), Leads, Cuentas, Contactos, Actividades con recordatorios, Ficha 360 con timeline + trazabilidad de correos + proyectos vinculados, Reportes de producción/metas.</li>
<li><b>Costos & Propuestas</b>: calculadora de estructura de costos; genera propuestas a partir de plantilla + investigación del cliente, con el logo del cliente.</li>
<li><b>Marketing</b>: calendario de contenidos, generación de piezas con IA, métricas.</li>
</ul>`},
        {t:'7 · Capacitación, certificación y documentos', html:`
<h2>Academia y conocimiento</h2>
<ul>
<li><b>Academia</b>: cursos por lecciones (texto, video, imagen, quiz) por rol. Autoadministrable: crear/editar/eliminar cursos, lecciones y categorías; generar con IA.</li>
<li><b>Certificación</b>: el shopper debe certificarse por proyecto antes de postularse. Genera banco de preguntas con IA desde el instructivo; recertificación con notificación.</li>
<li><b>Documentos</b>: biblioteca con lector in-app (PDF, imagen, video). Generación inteligente con branding.</li>
<li><b>Manuales</b> (esta sección): manuales completos por rol.</li>
</ul>`},
        {t:'8 · Integraciones y automatizaciones', html:`
<h2>Conectar el ecosistema</h2>
<p>Configuración → Automatizaciones e Integraciones.</p>
<ul>
<li><b>Make.com</b>: la integración más importante. Cada evento (postulación, agenda, realizada, cuestionario, reprogramación, pago, atraso) puede disparar un escenario que ramifica a WhatsApp/correo/Sheets. Webhook por tenant (cada consultora usa los suyos).</li>
<li><b>WhatsApp Business</b>: notificaciones al shopper.</li>
<li><b>Correo (Outlook/Gmail)</b>: bandeja integrada con trazabilidad a clientes/proyectos.</li>
<li><b>Google Sheets</b>: HR en vivo.</li>
<li><b>IA (Gemini/ChatGPT/Claude)</b>: el motor inteligente.</li>
</ul>`},
        {t:'9 · Multi-tenant, franquicias y backend', html:`
<h2>Escalar a varios clientes</h2>
<p>Cada consultora es un <b>tenant</b> con su marca, plan, países, usuarios y datos segmentados por <code>projectId</code>. Los roles <b>Coordinador/Representante</b> y <b>Aliado/Franquiciado</b> permiten dar acceso a colaboradores de otros países para administrar proyectos/HR de su país específico.</p>
<h3>Backend (producción)</h3>
<p>El prototipo usa almacenamiento local. En producción se conecta a Firebase (Firestore + Auth + Storage) o Supabase. Los datos reales entran por el <b>importador inteligente</b> (no por conexión directa a bases viejas). Ver guías de migración en los documentos del proyecto.</p>`},
      ]
    },
    {
      id:'m_admin', rol:'admin', ic:'🖥️', titulo:'Manual del Equipo Administrativo',
      desc:'Operación diaria, proyectos, finanzas, comercial y configuración para coordinadores y administradores.',
      secciones:[
        {t:'1 · Tu rol y acceso', html:`<h2>Equipo administrativo</h2><p>Ves toda la operación, finanzas y comercial. No tienes acceso a la configuración técnica avanzada del Super Admin. Tu día se centra en gestionar proyectos, visitas, postulaciones y el seguimiento financiero.</p>`},
        {t:'2 · Crear y configurar un proyecto', html:`<h2>Set-up de un programa</h2><ol><li>Admin del Proyecto → Proyectos → Crear.</li><li>Define países, monedas, honorarios por país, reembolsos, modelo (directo/delegado), periodicidad de rondas y periodo de cumplimiento.</li><li>Carga el instructivo → la IA propone escenarios y cuestionario.</li><li>Configura la certificación.</li><li>Carga la HR (importador) o conéctala en vivo (Google Sheets).</li></ol>`},
        {t:'3 · Gestión operativa diaria', html:`<h2>Tu rutina</h2><ul><li><b>Mi Día</b>: revisa visitas y tareas del día.</li><li><b>Dashboard</b>: vigila avance vs meta, atrasos, ranking.</li><li><b>Postulaciones</b>: aprueba/rechaza, reasigna, reprograma. Todo queda con tu nombre como gestor.</li><li><b>Estado operativo de visitas</b>: gestiona masiva o individualmente; notifica por WhatsApp/correo.</li></ul>`},
        {t:'4 · Finanzas para administradores', html:`<h2>Control financiero</h2><p>Registra movimientos, controla CxC/CxP, genera lotes de pago, concilia remesas. Crea el presupuesto mensual y vigila su avance con semáforos en el dashboard.</p>`},
        {t:'5 · Comercial', html:`<h2>Gestión de clientes</h2><p>Usa el CRM para leads y cuentas, genera propuestas con la calculadora de costos, y da seguimiento con actividades y recordatorios.</p>`},
      ]
    },
    {
      id:'m_ops', rol:'ops', ic:'📋', titulo:'Manual del Equipo Operativo',
      desc:'Operación de visitas, postulaciones y seguimiento — sin acceso a finanzas.',
      secciones:[
        {t:'1 · Tu rol', html:`<h2>Equipo operativo</h2><p>Te enfocas en la operación: visitas, postulaciones, certificación y capacitación. No ves finanzas.</p>`},
        {t:'2 · Gestionar visitas y postulaciones', html:`<h2>El día a día operativo</h2><ul><li>Publica visitas o carga la HR.</li><li>Aprueba postulaciones y asigna shoppers (manual o por postulación).</li><li>Da seguimiento al estado de cada visita hasta el cuestionario enviado.</li><li>Notifica a los shoppers atrasados.</li></ul>`},
        {t:'3 · Sin duplicar', html:`<h2>Cuidado con la HR en vivo</h2><p>Si gestionas desde la plataforma y desde la HR, el sistema no duplica. Siempre verifica que la visita aparezca con el gestor correcto.</p>`},
      ]
    },
    {
      id:'m_coord', rol:'coordinador', ic:'🌎', titulo:'Manual del Coordinador / Representante',
      desc:'Administración de proyectos y HR de tu(s) país(es) asignado(s).',
      secciones:[
        {t:'1 · Tu rol de coordinador', html:`<h2>Coordinador regional</h2><p>Administras los proyectos y la hoja de ruta de tu país. Es la herramienta que la consultora te da para gestionar tu operación local — algo que antes no tenías.</p>`},
        {t:'2 · Tu alcance', html:`<h2>Qué puedes ver y hacer</h2><ul><li>Ver y gestionar solo las visitas/HR de tu país asignado.</li><li>Asignar shoppers de tu país.</li><li>Dar seguimiento operativo local.</li><li>Toda tu gestión queda auditada con tu nombre.</li></ul>`},
        {t:'3 · Liquidaciones y honorarios', html:`<h2>Control local</h2><p>Según el modelo, puedes ver la liquidación de honorarios de tus shoppers y el cruce de cuentas cuando facturas localmente.</p>`},
      ]
    },
    {
      id:'m_shopper', rol:'shopper', ic:'📱', titulo:'Manual del Shopper / Evaluador',
      desc:'Todo lo que el evaluador necesita: certificarse, postularse, ejecutar visitas, cobrar.',
      secciones:[
        {t:'1 · Tu portal', html:`<h2>Bienvenido, evaluador</h2><p>Tu portal móvil tiene todo lo que necesitas: visitas disponibles, mis visitas, certificación, beneficios y soporte.</p>`},
        {t:'2 · Certificarte', html:`<h2>Antes de tu primera visita</h2><p>Debes aprobar la certificación del proyecto. Estudia el instructivo y los recursos en Capacitación, luego presenta el examen. Recibirás feedback detallado de cada respuesta.</p>`},
        {t:'3 · Postularte y agendar', html:`<h2>Conseguir visitas</h2><ol><li>En Visitas Disponibles ves la oferta de todos los proyectos (filtra por país/proyecto).</li><li>Reserva o postúlate a las sucursales que quieras.</li><li>Cuando te aprueban, agenda fecha y franja.</li></ol>`},
        {t:'4 · Ejecutar la visita', html:`<h2>El día de la visita</h2><ol><li>Marca la visita como realizada.</li><li>Se habilita el cuestionario: llénalo y adjunta las evidencias requeridas (foto, foto geolocalizada, audio o video según el escenario).</li><li>Envía el cuestionario.</li></ol>`},
        {t:'5 · Tus beneficios', html:`<h2>Cobrar</h2><p>En Mis Beneficios ves tus honorarios, reembolsos y el estado de cada pago con fecha estimada. Registra tus datos bancarios en tu perfil para agilizar los pagos.</p>`},
      ]
    },
    {
      id:'m_cliente', rol:'cliente', ic:'📈', titulo:'Manual del Cliente (Portal)',
      desc:'Cómo el cliente de la consultora usa el portal: resultados, score, acciones, reportes.',
      secciones:[
        {t:'1 · Tu portal de resultados', html:`<h2>Bienvenido</h2><p>Aquí ves los resultados de tu programa de evaluación en tiempo real, sin esperar PDFs.</p>`},
        {t:'2 · Leer el dashboard', html:`<h2>Panorama</h2><p>Score ponderado por sucursal, ranking, áreas más débiles, evolución. Todas las tarjetas son clickeables para ver el detalle por sucursal, responsable o visita.</p>`},
        {t:'3 · Sucursales y acciones', html:`<h2>De resultado a acción</h2><p>Por cada sucursal puedes ver su score y crear planes de acción: incentivos, planes de mejora, sanciones. La IA sugiere acciones según los hallazgos.</p>`},
        {t:'4 · Capacitación y reportes', html:`<h2>Mejorar continuamente</h2><p>Solicita capacitación dirigida a tus áreas débiles. Genera y exporta reportes. Pide soporte directamente desde el portal.</p>`},
      ]
    },
  ],
};
