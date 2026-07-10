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
  <div class="acad-step"><span>1</span><b>Tenant / Consultora</b><p>Ej. tu consultora. Tiene su marca, plan y usuarios.</p></div>
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
<p>Configuración → 🎨 Marca. Sube el logo (se aplica a login, topbar, propuestas y documentos). Elige la paleta (CXOrbia, Corporativo claro, Esmeralda, Violeta) o personaliza colores. El logo se usa también como favicon e ícono de la app instalada.</p>
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
        {t:'1 · Tu rol y acceso', html:`
<h2>Equipo administrativo</h2>
<p>Ves toda la operación, las finanzas y el comercial de tu tenant. No tienes acceso a la configuración técnica avanzada del Super Admin (backend, multi-tenant, IA transversal) — esa queda reservada al manual maestro.</p>
<div class="acad-cards">
  <div class="acad-card"><div>📋</div><b>Operación</b><p>Proyectos, visitas, postulaciones, reservas, shoppers.</p></div>
  <div class="acad-card"><div>💰</div><b>Finanzas</b><p>Movimientos, liquidaciones, lotes de pago, presupuesto.</p></div>
  <div class="acad-card"><div>📈</div><b>Comercial</b><p>CRM, costos y propuestas, marketing.</p></div>
  <div class="acad-card"><div>🎓</div><b>Academia</b><p>Cursos, manuales y certificaciones — puedes crear y editar contenido.</p></div>
</div>
<blockquote>Tu día se centra en tres preguntas: ¿el programa avanza a tiempo?, ¿las cuentas cuadran?, ¿el cliente está contento? El Dashboard operativo, el Dashboard financiero y el Portal del Cliente te responden cada una.</blockquote>`},
        {t:'2 · Crear y configurar un proyecto completo', html:`
<h2>Set-up de un programa, paso a paso</h2>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Crear</b><p>Admin del Proyecto → Proyectos → Crear. Define nombre, cliente y modelo (directo/delegado).</p></div>
  <div class="acad-step"><span>2</span><b>Países y dinero</b><p>Países, monedas, honorarios por país, reembolsos y periodicidad de rondas.</p></div>
  <div class="acad-step"><span>3</span><b>Instructivo → IA</b><p>Carga el instructivo del cliente; la IA propone escenarios y cuestionario ponderado.</p></div>
  <div class="acad-step"><span>4</span><b>Certificación</b><p>Genera el banco de preguntas de certificación desde el mismo instructivo.</p></div>
  <div class="acad-step"><span>5</span><b>Cargar HR</b><p>Importador inteligente o conexión en vivo a Google Sheets.</p></div>
  <div class="acad-step"><span>6</span><b>Publicar</b><p>Las visitas nacen "disponibles" y el ciclo operativo arranca.</p></div>
</div>
<h3>Qué revisar antes de publicar</h3>
<ul>
<li>El cuestionario ponderado suma 100% entre secciones y cada pregunta tiene su peso correcto.</li>
<li>Los honorarios y reembolsos están cargados por país (nunca se mezclan monedas).</li>
<li>El periodo de cumplimiento (quincena/mes) coincide con lo pactado con el cliente.</li>
<li>La certificación está lista si el proyecto la requiere antes de la primera visita.</li>
</ul>
<blockquote>Un proyecto mal configurado se nota semanas después, en liquidaciones que no cuadran o en shoppers que no pueden postularse. Revisa esta lista antes de publicar, no después.</blockquote>`},
        {t:'3 · Gestión operativa diaria', html:`
<h2>Tu rutina</h2>
<div class="acad-cards">
  <div class="acad-card"><div>☀️</div><b>Mi Día</b><p>Cronograma de hoy: visitas propias y tareas pendientes de gestión.</p></div>
  <div class="acad-card"><div>📊</div><b>Dashboard operativo</b><p>Avance real vs. ideal por país, ranking de shoppers, atrasos, comparativo trimestral.</p></div>
  <div class="acad-card"><div>📝</div><b>Postulaciones</b><p>Aprobar, rechazar, poner en espera, reasignar, reprogramar o cancelar — todo con trazabilidad de quién lo gestionó.</p></div>
  <div class="acad-card"><div>📅</div><b>Reservas & asignación</b><p>Para programas mensuales: cruce entre lo reservado y lo postulado.</p></div>
</div>
<h3>Cuándo intervenir</h3>
<ul>
<li>Un proyecto por debajo del avance ideal en el Dashboard — revisa si faltan shoppers certificados o visitas sin publicar.</li>
<li>Postulaciones acumuladas sin gestionar más de 24-48h — el shopper está esperando una respuesta.</li>
<li>Visitas "realizada" sin cuestionario después de varios días — pueden quedar fuera del periodo de liquidación.</li>
</ul>`},
        {t:'4 · Finanzas para administradores', html:`
<h2>Control financiero completo</h2>
<div class="acad-cards">
  <div class="acad-card"><div>📊</div><b>Dashboard financiero</b><p>Márgenes por país, CxC/CxP, financiamientos, análisis crítico con IA, comparativo intermensual/interanual.</p></div>
  <div class="acad-card"><div>💵</div><b>Movimientos & Tesorería</b><p>Ingresos (comisiones, honorarios, anticipos, facturación, remesas), egresos, CxC/CxP clickeables y editables.</p></div>
  <div class="acad-card"><div>🧾</div><b>Liquidaciones</b><p>Se generan automáticamente de las visitas elegibles; eliges cuáles van al lote de pago.</p></div>
  <div class="acad-card"><div>📦</div><b>Lotes de pago</b><p>Al pagar un lote, se reflejan como egresos por shopper de forma automática.</p></div>
</div>
<h3>El ciclo de una liquidación</h3>
<p>Una visita no se convierte en pago de un solo paso. Sigue etapas separadas y honestas: <b>realizada</b> → <b>cuestionario submitido</b> → <b>elegible</b> (cumple reglas del proyecto) → <b>liquidada</b> (candidata a pago) → <b>en lote</b> → <b>pagada</b>. Si una visita no tiene cuestionario submitido, no es elegible aunque se haya realizado.</p>
<blockquote><b>Regla de oro:</b> nunca se suman monedas entre países. GT (Q) y HN (L) se ven siempre separados, en KPIs y en reportes.</blockquote>
<h3>Las no pagadas no desaparecen</h3>
<p>Las liquidaciones que no entraron a un lote de pago este mes pasan automáticamente a Cuentas por Pagar (CxP) del mes siguiente — nada se pierde ni se oculta.</p>`},
        {t:'5 · Comercial (CRM, costos, marketing)', html:`
<h2>La cara comercial</h2>
<div class="acad-cards">
  <div class="acad-card"><div>🧭</div><b>CRM</b><p>Dashboard/Insights, Pipeline (kanban), Leads, Cuentas, Contactos, Actividades con recordatorios.</p></div>
  <div class="acad-card"><div>👤</div><b>Ficha 360</b><p>Timeline del cliente + trazabilidad de correos + proyectos vinculados, todo en un solo lugar.</p></div>
  <div class="acad-card"><div>🧮</div><b>Costos & Propuestas</b><p>Calculadora de estructura de costos; genera propuestas desde plantilla + investigación del cliente, con su logo.</p></div>
  <div class="acad-card"><div>📣</div><b>Marketing</b><p>Calendario de contenidos, generación de piezas con IA, métricas de alcance.</p></div>
</div>
<h3>Del lead al proyecto activo</h3>
<ol>
<li>El lead entra al CRM (manual, portal o solicitud de add-on de un cliente existente).</li>
<li>Se cotiza con la calculadora de costos y se genera la propuesta.</li>
<li>Al cerrarse, se crea la cuenta (o se vincula a una existente) y nace el proyecto.</li>
<li>El proyecto queda enlazado a la Ficha 360 del cliente para todo seguimiento futuro.</li>
</ol>`},
        {t:'6 · Reportes y decisiones basadas en datos', html:`
<h2>De KPI a decisión</h2>
<p>Cada tarjeta de KPI en Dashboard operativo, Dashboard financiero y Reportes es <b>clickeable</b>: te lleva al detalle (visitas, movimientos, shoppers) que explica el número, no solo lo muestra.</p>
<ul>
<li><b>Ranking de shoppers</b>: ayuda a decidir a quién asignar primero, pero la asignación final siempre la confirma una persona.</li>
<li><b>Hallazgos frecuentes</b>: los criterios del cuestionario que más bajan el score — úsalos para priorizar capacitación con el cliente.</li>
<li><b>Comparativo trimestral/interanual</b>: te dice si el programa mejora o se estanca, país por país.</li>
</ul>
<blockquote>El reporte que el cliente ve en su portal se genera de la misma data que tú ves aquí — no hay un PDF aparte que se pueda desalinear.</blockquote>`},
        {t:'7 · Buenas prácticas y errores comunes', html:`
<h2>Checklist del administrador</h2>
<ul class="acad-check">
<li>Revisé que cada proyecto activo tenga honorarios y reembolsos cargados por país.</li>
<li>No dejé postulaciones sin gestionar más de 48 horas.</li>
<li>Verifiqué que las visitas "realizadas" tengan su cuestionario submitido antes del cierre del periodo.</li>
<li>Concilié los lotes de pago contra el estado de CxP antes de cerrar el mes.</li>
<li>Actualicé la Ficha 360 de cuentas con actividad reciente antes de la siguiente reunión comercial.</li>
</ul>
<h3>Errores comunes</h3>
<ul>
<li>Mezclar honorarios de dos países en un mismo reporte — siempre se ven separados por moneda.</li>
<li>Asignar shoppers sin certificación vigente al proyecto — bloquea la elegibilidad de la visita.</li>
<li>Publicar un proyecto sin revisar que el cuestionario ponderado sume 100%.</li>
</ul>`},
      ]
    },
    {
      id:'m_ops', rol:'ops', ic:'📋', titulo:'Manual del Equipo Operativo',
      desc:'Operación de visitas, postulaciones y seguimiento — sin acceso a finanzas.',
      secciones:[
        {t:'1 · Tu rol y alcance', html:`
<h2>Equipo operativo</h2>
<p>Te enfocas en la operación: visitas, postulaciones, certificación y capacitación. No ves finanzas ni comercial — eso es de administración.</p>
<div class="acad-cards">
  <div class="acad-card"><div>📋</div><b>Visitas</b><p>Publicar, dar seguimiento y cerrar el ciclo de cada visita.</p></div>
  <div class="acad-card"><div>📝</div><b>Postulaciones</b><p>Aprobar, reasignar, reprogramar y cancelar con trazabilidad.</p></div>
  <div class="acad-card"><div>🎓</div><b>Certificación</b><p>Verificar que los shoppers estén certificados antes de asignarles visitas.</p></div>
</div>`},
        {t:'2 · El ciclo operativo completo', html:`
<h2>De publicar a liquidar</h2>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Publicar</b><p>Carga la HR o publica visitas sueltas. Nacen "disponible".</p></div>
  <div class="acad-step"><span>2</span><b>Reservar/Postular</b><p>El shopper reserva un cupo o se postula a una sucursal.</p></div>
  <div class="acad-step"><span>3</span><b>Asignar</b><p>Apruebas la postulación o asignas manualmente → notificación al shopper.</p></div>
  <div class="acad-step"><span>4</span><b>Agendar</b><p>El shopper elige fecha y franja horaria.</p></div>
  <div class="acad-step"><span>5</span><b>Realizar</b><p>Se marca realizada → se habilita el cuestionario.</p></div>
  <div class="acad-step"><span>6</span><b>Cuestionario</b><p>El shopper lo llena, adjunta evidencias y lo envía.</p></div>
</div>
<p>Tu trabajo termina cuando el cuestionario queda submitido — de ahí en adelante, finanzas toma el relevo con la liquidación.</p>`},
        {t:'3 · Gestionar postulaciones a fondo', html:`
<h2>Las seis acciones sobre una postulación</h2>
<div class="acad-cards">
  <div class="acad-card"><div>✅</div><b>Aprobar</b><p>El shopper queda asignado y notificado.</p></div>
  <div class="acad-card"><div>❌</div><b>Rechazar</b><p>Libera el cupo para otro shopper.</p></div>
  <div class="acad-card"><div>⏸️</div><b>Standby</b><p>La dejas en espera sin decidir todavía (cupo limitado, evaluando candidatos).</p></div>
  <div class="acad-card"><div>🔄</div><b>Reasignar</b><p>Cambias el shopper asignado a esa visita.</p></div>
  <div class="acad-card"><div>📅</div><b>Reprogramar</b><p>Cambias fecha/franja manteniendo al mismo shopper.</p></div>
  <div class="acad-card"><div>🚫</div><b>Cancelar</b><p>La visita deja de estar disponible.</p></div>
</div>
<blockquote>Toda acción queda registrada con tu nombre como gestor — es la trazabilidad que te protege a ti y le da seguimiento claro al cliente si pregunta qué pasó con una sucursal.</blockquote>`},
        {t:'4 · Evitar duplicados con HR en vivo', html:`
<h2>Cuidado con la HR conectada a Sheets</h2>
<p>Cuando la HR es un Google Sheet en vivo, el sistema lee y escribe de vuelta usando una <b>llave natural inmutable</b> (no un número de fila, que puede cambiar). Por eso nunca duplica una visita, sin importar si la gestionas desde la plataforma o directamente en la hoja.</p>
<ul>
<li>Si editas una fila en la Sheet, el cambio se refleja en la plataforma sin crear un registro nuevo.</li>
<li>Si asignas desde la plataforma, el sistema escribe de vuelta a la fila correspondiente, no agrega una fila nueva.</li>
<li>Siempre verifica que la visita muestre el gestor correcto después de una edición cruzada (plataforma y Sheet el mismo día).</li>
</ul>`},
        {t:'5 · Seguimiento y atrasos', html:`
<h2>Detectar y actuar sobre atrasos</h2>
<p>El Dashboard operativo resalta visitas con agenda vencida sin marcar "realizada", y cuestionarios sin submitir pasado cierto número de días.</p>
<ol>
<li>Revisa el semáforo de atrasos en Mi Día o el Dashboard al iniciar tu turno.</li>
<li>Contacta al shopper (la notificación automática ya salió; un mensaje directo ayuda si el atraso persiste).</li>
<li>Si el shopper no responde, evalúa reasignar la visita a tiempo para no perder el periodo de cumplimiento.</li>
</ol>`},
        {t:'6 · Checklist diario', html:`
<h2>Antes de cerrar tu turno</h2>
<ul class="acad-check">
<li>No quedan postulaciones sin gestionar de más de 24 horas.</li>
<li>Revisé las visitas con agenda vencida y contacté a los shoppers atrasados.</li>
<li>Verifiqué que las visitas realizadas hoy tengan su cuestionario en curso o submitido.</li>
<li>Confirmé que no haya conflictos de duplicado entre la HR y la plataforma.</li>
</ul>`},
      ]
    },
    {
      id:'m_coord', rol:'coordinador', ic:'🌎', titulo:'Manual del Coordinador / Representante',
      desc:'Administración de proyectos y HR de tu(s) país(es) asignado(s).',
      secciones:[
        {t:'1 · Tu rol de coordinador', html:`
<h2>Coordinador o Representante regional</h2>
<p>Administras los proyectos y la hoja de ruta (HR) de tu país. Es la herramienta que la consultora te da para gestionar tu operación local — algo que antes probablemente hacías en hojas de cálculo sueltas y correos.</p>
<blockquote>Como Aliado/Franquiciado, tu alcance es similar pero operas proyectos regionales delegados por la consultora, bajo su marca y sus reglas.</blockquote>`},
        {t:'2 · Tu alcance exacto', html:`
<h2>Qué puedes ver y hacer</h2>
<div class="acad-cards">
  <div class="acad-card"><div>🌎</div><b>Solo tu país</b><p>Ves y gestionas únicamente las visitas/HR del país que tienes asignado.</p></div>
  <div class="acad-card"><div>👥</div><b>Tus shoppers</b><p>Asignas y das seguimiento a los evaluadores de tu país.</p></div>
  <div class="acad-card"><div>📝</div><b>Trazabilidad</b><p>Toda tu gestión queda auditada con tu nombre, igual que el equipo operativo central.</p></div>
</div>
<p>No ves la operación de otros países ni la configuración global del tenant — esas quedan en el equipo administrativo central y el Super Admin.</p>`},
        {t:'3 · Gestionar tu HR y tus shoppers', html:`
<h2>El día a día regional</h2>
<ol>
<li>Recibes o cargas la HR de tu país para el periodo.</li>
<li>Publicas las visitas disponibles para tus shoppers certificados.</li>
<li>Apruebas postulaciones y resuelves conflictos de agenda localmente.</li>
<li>Escalas al equipo administrativo central cualquier tema que exceda tu alcance (nuevo proyecto, cambio de honorarios, disputa con el cliente).</li>
</ol>`},
        {t:'4 · Liquidaciones y honorarios locales', html:`
<h2>Control local del dinero de tus shoppers</h2>
<p>Según el modelo del proyecto (directo o delegado), puedes ver la liquidación de honorarios de tus shoppers y el cruce de cuentas cuando facturas localmente a la consultora.</p>
<blockquote>Aunque veas montos, las reglas de elegibilidad (visita realizada + cuestionario submitido + dentro de periodo) son las mismas para todo el tenant — no las defines tú a nivel local.</blockquote>`},
        {t:'5 · Buenas prácticas de coordinación regional', html:`
<h2>Checklist del coordinador</h2>
<ul class="acad-check">
<li>Confirmé que la HR de mi país esté cargada antes de iniciar el periodo.</li>
<li>Verifiqué que mis shoppers activos tengan certificación vigente para el proyecto.</li>
<li>Escalé a tiempo cualquier tema fuera de mi alcance (nuevo cliente, cambio de tarifa).</li>
<li>Revisé la liquidación local antes de reportarla al equipo central.</li>
</ul>`},
      ]
    },
    {
      id:'m_aliado', rol:'aliado', ic:'🏢', titulo:'Manual del Aliado / Franquiciado',
      desc:'Operas proyectos regionales delegados de forma semi-autónoma: tu HR, tus shoppers, tu facturación local.',
      secciones:[
        {t:'1 · Tu rol: distinto de un coordinador', html:`
<h2>Aliado / Franquiciado</h2>
<p>A diferencia de un Coordinador (que es parte del equipo directo de la consultora), tú operas de forma <b>semi-autónoma</b>: gestionas proyectos delegados en tu territorio bajo la marca y metodología de la consultora, pero facturas localmente y liquidas a tus propios shoppers.</p>
<div class="acad-cards">
  <div class="acad-card"><div>🧭</div><b>Coordinador</b><p>Parte del equipo de la consultora; administra HR y asignaciones de su país.</p></div>
  <div class="acad-card"><div>🏢</div><b>Aliado / Franquiciado (tú)</b><p>Opera de forma semi-independiente: su propia facturación local y su propia red de shoppers.</p></div>
</div>
<blockquote>Usas la misma plataforma y las mismas reglas de calidad que toda la red de la consultora — lo que cambia es el modelo comercial y financiero de tu territorio, no el estándar del servicio.</blockquote>`},
        {t:'2 · Tu alcance', html:`
<h2>Qué ves y qué gestionas</h2>
<ul>
<li>Los proyectos delegados a tu territorio — no ves la operación de otros países o franquicias.</li>
<li>Tu propia red de shoppers: reclutamiento, certificación y asignación.</li>
<li>Tu HR local, con las mismas reglas anti-duplicado que el resto de la plataforma.</li>
<li>Tu facturación y liquidación local hacia tus shoppers.</li>
</ul>
<p>La casa matriz (la consultora) define el instructivo, el cuestionario y el estándar de calidad del programa; tú operas la ejecución en tu territorio.</p>`},
        {t:'3 · Operar tu territorio', html:`
<h2>El ciclo, con tu propia red</h2>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Reclutar</b><p>Certificas a tus propios shoppers en el proyecto de la casa matriz.</p></div>
  <div class="acad-step"><span>2</span><b>Publicar</b><p>Publicas las visitas de tu territorio para tu red.</p></div>
  <div class="acad-step"><span>3</span><b>Operar</b><p>Apruebas postulaciones, das seguimiento y resuelves conflictos localmente.</p></div>
  <div class="acad-step"><span>4</span><b>Liquidar</b><p>Facturas a la casa matriz y liquidas a tus shoppers con tus propias condiciones.</p></div>
</div>`},
        {t:'4 · Facturación y cruce de cuentas', html:`
<h2>El dinero de tu territorio</h2>
<p>Ves la liquidación de honorarios de tus shoppers según tus propias reglas locales, y el cruce de cuentas con la casa matriz cuando facturas tu operación del periodo.</p>
<blockquote>Las reglas de <b>elegibilidad</b> de una visita (realizada + cuestionario submitido + dentro del periodo) las define la casa matriz para todo el programa — no las cambias tú a nivel local, aunque sí gestiones el pago final a tus shoppers.</blockquote>`},
        {t:'5 · Buenas prácticas', html:`
<h2>Checklist del aliado</h2>
<ul class="acad-check">
<li>Verifiqué que mi red de shoppers esté certificada antes de asignarles visitas.</li>
<li>Mantuve mi facturación local al día con el periodo de cumplimiento de la casa matriz.</li>
<li>Reporté a tiempo cualquier incidente de calidad detectado en mi territorio.</li>
<li>Escalé a la casa matriz cualquier cambio de instructivo o cuestionario que necesite mi programa.</li>
</ul>`},
      ]
    },

    {
      id:'m_shopper', rol:'shopper', ic:'📱', titulo:'Manual del Shopper / Evaluador',
      desc:'Todo lo que el evaluador necesita: certificarse, postularse, ejecutar visitas, cobrar.',
      secciones:[
        {t:'1 · Tu portal', html:`
<h2>Bienvenido, evaluador</h2>
<p>Tu portal móvil tiene todo lo que necesitas para trabajar como mystery shopper de forma profesional.</p>
<div class="acad-cards">
  <div class="acad-card"><div>🛍️</div><b>Visitas disponibles</b><p>El marketplace de visitas de todos los proyectos donde estás habilitado.</p></div>
  <div class="acad-card"><div>📅</div><b>Mis visitas</b><p>Tu agenda: reservadas, agendadas, realizadas y su estado de cuestionario.</p></div>
  <div class="acad-card"><div>🎓</div><b>Certificación</b><p>El examen que te habilita para postularte a un proyecto.</p></div>
  <div class="acad-card"><div>💰</div><b>Mis beneficios</b><p>Honorarios, reembolsos y el estado de cada pago.</p></div>
  <div class="acad-card"><div>💬</div><b>Soporte</b><p>Pide ayuda o reporta un problema directamente desde la app.</p></div>
</div>`},
        {t:'2 · Certificarte antes de tu primera visita', html:`
<h2>El examen de certificación</h2>
<p>Debes aprobar la certificación del proyecto antes de poder postularte a sus visitas. El banco de preguntas sale directamente del instructivo del cliente, así que estudiarlo bien es la mejor preparación.</p>
<ol>
<li>Estudia el instructivo y los recursos de Capacitación asignados al proyecto.</li>
<li>Presenta el examen — verás cuántas preguntas y el puntaje mínimo para aprobar.</li>
<li>Recibes feedback detallado de cada respuesta, correcta o incorrecta.</li>
<li>Si no apruebas, puedes volver a estudiar y recertificarte; recibirás una notificación cuando puedas reintentar.</li>
</ol>
<blockquote>La certificación protege tu reputación como evaluador: un shopper certificado es un shopper que la consultora y el cliente pueden confiar en asignar sin supervisión directa.</blockquote>`},
        {t:'3 · Postularte y agendar', html:`
<h2>Conseguir visitas</h2>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Explora</b><p>En Visitas Disponibles filtra por país/proyecto y revisa honorario y fecha límite.</p></div>
  <div class="acad-step"><span>2</span><b>Reserva o postúlate</b><p>Algunas visitas se reservan directo; otras requieren postulación y aprobación.</p></div>
  <div class="acad-step"><span>3</span><b>Espera aprobación</b><p>Si postulaste, te notifican cuando te aprueban (o rechazan/reasignan).</p></div>
  <div class="acad-step"><span>4</span><b>Agenda</b><p>Elige la fecha y franja horaria que te convenga dentro de la ventana disponible.</p></div>
</div>`},
        {t:'4 · Ejecutar la visita', html:`
<h2>El día de la visita</h2>
<ol>
<li>Llega en la franja acordada y marca la visita como <b>realizada</b> — esto habilita el cuestionario.</li>
<li>Llena el cuestionario con atención: cada sección tiene un peso en tu score final.</li>
<li>Adjunta las evidencias exactamente como pide el escenario (foto simple, foto geolocalizada, audio o video, según el proyecto).</li>
<li>Revisa tus respuestas y <b>envía</b> el cuestionario — este es el paso que lo hace "submitido" y elegible para pago.</li>
</ol>
<blockquote>Una visita "realizada" sin cuestionario submitido NO es una visita pagable. Envía siempre el cuestionario el mismo día si es posible.</blockquote>`},
        {t:'5 · Reglas de oro del evaluador', html:`
<h2>Lo que nunca debes hacer</h2>
<ul class="acad-check">
<li>Nunca reveles tu identidad como evaluador durante la visita.</li>
<li>Nunca inventes o alteres una respuesta — la honestidad es la base de tu reputación y de tu recertificación.</li>
<li>Nunca compartas el instructivo o el cuestionario con el personal evaluado.</li>
<li>Nunca dejes pasar la fecha límite de envío del cuestionario sin avisar a soporte.</li>
</ul>`},
        {t:'6 · Tus beneficios y el ciclo de pago', html:`
<h2>Cómo y cuándo cobras</h2>
<p>En Mis Beneficios ves el detalle de cada visita: honorario, reembolso (si aplica) y el estado actual.</p>
<div class="acad-flow">
  <div class="acad-step"><span>1</span><b>Realizada</b><p>Marcaste la visita en sitio.</p></div>
  <div class="acad-step"><span>2</span><b>Submitido</b><p>Enviaste el cuestionario completo.</p></div>
  <div class="acad-step"><span>3</span><b>Elegible</b><p>Cumple las reglas del proyecto para pasar a liquidación.</p></div>
  <div class="acad-step"><span>4</span><b>Liquidada</b><p>Candidata a pago, a la espera de entrar a un lote.</p></div>
  <div class="acad-step"><span>5</span><b>Pagada</b><p>El lote se procesó y el pago está confirmado.</p></div>
</div>
<p>Registra tus datos bancarios en tu perfil para agilizar los pagos cuando el lote se procese.</p>`},
        {t:'7 · Soporte', html:`
<h2>Cuándo y cómo pedir ayuda</h2>
<p>Usa el botón de Soporte para reportar problemas de acceso, dudas sobre una visita específica, o inconsistencias en tus beneficios. Indica el proyecto y la visita afectada para una respuesta más rápida.</p>`},
      ]
    },
    {
      id:'m_cliente', rol:'cliente', ic:'📈', titulo:'Manual del Cliente (Portal)',
      desc:'Cómo el cliente de la consultora usa el portal: resultados, score, acciones, reportes.',
      secciones:[
        {t:'1 · Tu portal de resultados', html:`
<h2>Bienvenido</h2>
<p>Aquí ves los resultados de tu programa de evaluación en tiempo real, sin esperar a que alguien te envíe un PDF por correo.</p>
<div class="acad-cards">
  <div class="acad-card"><div>📊</div><b>Dashboard</b><p>Score general, ranking de sucursales y tendencia del periodo.</p></div>
  <div class="acad-card"><div>🏬</div><b>Sucursales</b><p>Detalle por sucursal con historial y planes de acción.</p></div>
  <div class="acad-card"><div>🔍</div><b>Hallazgos</b><p>Los criterios que más impactan tu score, para priorizar mejoras.</p></div>
  <div class="acad-card"><div>🎓</div><b>Capacitación</b><p>Solicita entrenamiento dirigido a tus áreas más débiles.</p></div>
</div>`},
        {t:'2 · Leer el dashboard a fondo', html:`
<h2>Del número al panorama</h2>
<ul>
<li><b>Score ponderado</b>: el promedio de tu programa según el peso de cada sección del cuestionario — no todas las preguntas valen lo mismo.</li>
<li><b>Ranking de sucursales</b>: te muestra quién lidera y quién necesita atención, comparando peras con peras (mismo cuestionario, mismo periodo).</li>
<li><b>Evolución</b>: la tendencia periodo a periodo te dice si las acciones que tomaste están funcionando.</li>
</ul>
<blockquote>Todas las tarjetas son clickeables: puedes bajar del score general hasta la visita individual y su evidencia.</blockquote>`},
        {t:'3 · Sucursales y planes de acción', html:`
<h2>De resultado a acción</h2>
<p>Por cada sucursal puedes ver su score histórico y crear un plan de acción concreto.</p>
<div class="acad-cards">
  <div class="acad-card"><div>🏆</div><b>Incentivos</b><p>Reconoce a las sucursales que lideran el ranking.</p></div>
  <div class="acad-card"><div>📈</div><b>Plan de mejora</b><p>Para sucursales por debajo de la meta, con seguimiento en el siguiente periodo.</p></div>
  <div class="acad-card"><div>⚠️</div><b>Sanciones</b><p>Para incumplimientos reiterados, según tu política interna.</p></div>
</div>
<p>La IA puede sugerir qué tipo de acción tiene sentido según los hallazgos, pero la decisión final siempre es tuya.</p>`},
        {t:'4 · Hallazgos: del dato a la decisión', html:`
<h2>Priorizar lo que más importa</h2>
<p>Los "hallazgos frecuentes" son los criterios del cuestionario que más seguido bajan el score en tu programa — no son errores técnicos, son patrones reales de tu operación.</p>
<ol>
<li>Identifica el hallazgo con mayor frecuencia e impacto en el score.</li>
<li>Revisa si es un tema de un punto específico o transversal a toda la red.</li>
<li>Solicita capacitación dirigida (sección siguiente) o ajusta tu propio proceso interno.</li>
<li>Da seguimiento al próximo periodo para confirmar si el hallazgo bajó de frecuencia.</li>
</ol>`},
        {t:'5 · Capacitación y reportes', html:`
<h2>Mejorar continuamente</h2>
<p>Desde el portal puedes solicitar capacitación dirigida a tus áreas débiles — la consultora la diseña con base en tus hallazgos reales, no un temario genérico.</p>
<p>También puedes generar y exportar reportes de tu programa cuando los necesites para tu propia gerencia o directorio.</p>`},
        {t:'6 · Soporte y solicitar servicios adicionales', html:`
<h2>Pide ayuda o crece tu programa</h2>
<p>Usa el botón de soporte para dudas o problemas de acceso. También puedes solicitar servicios adicionales (más visitas, nuevos add-ons como evidencia geolocalizada o NPS) directamente desde el portal — la solicitud llega como oportunidad al equipo comercial de la consultora.</p>`},
      ]
    },

    {
      id:'m_automatizaciones', rol:'admin', ic:'⚡', titulo:'Manual de Automatizaciones',
      desc:'Motor de eventos, catálogo completo, configuración con Make, plantillas y variables, canales y escenarios recomendados.',
      secciones:[
        {t:'1 · Qué es una automatización', html:`<h2>Trabajo que ocurre solo</h2><p>Una automatización es una regla que dispara una acción cuando pasa algo, sin ejecutarla manualmente. Cuando un evento del flujo ocurre (visita asignada, pago procesado, visita atrasada), la plataforma notifica, registra o dispara un proceso externo automáticamente.</p>`},
        {t:'2 · El modelo de eventos', html:`<h2>Cómo funciona por dentro</h2><p>CXOrbia no envía mensajes directamente: cada acción <b>emite un evento</b> (<code>CX.automations.fire</code>) que hace un POST al webhook de Make del tenant con un payload JSON completo. Desde Make decides destino y contenido. Así cambias la lógica sin tocar la plataforma.</p>`},
        {t:'3 · Catálogo de eventos', html:`<h2>Eventos disponibles</h2><ul><li><b>postulacion</b> → equipo</li><li><b>aprobacion</b> → shopper</li><li><b>agenda</b> → equipo</li><li><b>realizada</b> → equipo</li><li><b>cuestionario</b> → equipo/QA</li><li><b>reprog</b> → shopper</li><li><b>pago</b> → shopper</li><li><b>atraso</b> → shopper + equipo</li><li><b>recert</b> → shopper</li><li><b>soporte_estado</b> → solicitante</li></ul>`},
        {t:'4 · Configurar paso a paso', html:`<h2>Ruta: Configuración → Automatizaciones</h2><ol><li>Crea el escenario en Make (Custom webhook) y copia la URL.</li><li>Pega el webhook en CXOrbia y guarda.</li><li>Activa los eventos, elige canal y edita la plantilla.</li><li>Prueba el disparo y mapea los campos en Make.</li><li>Ramifica a WhatsApp/correo/Sheets.</li></ol><p>Todo autoadministrable, sin código.</p>`},
        {t:'5 · Plantillas y variables', html:`<h2>Mensajes con datos reales</h2><p>Usa variables entre llaves: <code>{shopper}</code>, <code>{sucursal}</code>, <code>{fecha}</code>, <code>{estado}</code>, <code>{score}</code>, <code>{monto}</code>. Ejemplo: "Hola {shopper}, tu visita a {sucursal} fue aprobada. Agenda tu fecha en la app."</p>`},
        {t:'6 · Canales y escenarios', html:`<h2>A dónde va cada evento</h2><p>Canales: in-app (siempre), WhatsApp (vía Make, mayor apertura), correo (formal), Google Sheets (auditoría). Escenarios recomendados: visita asignada → WhatsApp; recordatorio de agenda → WhatsApp+push; atraso → alerta equipo + shopper; lote pagado → notificación con monto.</p>`},
      ]
    },
    {
      id:'m_addons', rol:'admin', ic:'🧩', titulo:'Manual de Add-ons y valor agregado',
      desc:'Cada módulo opcional a fondo: qué resuelve, cómo se activa, cómo se factura, qué valor entrega y cómo venderlo.',
      secciones:[
        {t:'1 · Cómo funcionan', html:`<h2>Modelo comercial</h2><p>Los add-ons son capacidades opcionales que la consultora activa por cliente o plan. No están en el precio base — se cotizan aparte. El cliente los solicita desde su portal → llega como lead al CRM → se cotiza → se activa. Niveles: Core (todos los planes), Pro (cotizable), Enterprise (infraestructura dedicada).</p>`},
        {t:'2 · Evidencia geolocalizada', html:`<h2>📍 Foto + GPS + timestamp</h2><p>Elimina el fraude de visitas fantasma. Se activa por proyecto; el shopper captura foto con coordenadas y hora dentro del cuestionario. Se factura por volumen. Valor: confianza total y auditable.</p>`},
        {t:'3 · Evidencia multimedia', html:`<h2>🎥 Video / audio</h2><p>Captura tono y detalle imposible de transcribir. Requiere Storage conectado. Solo donde la ley lo permite y sin revelar identidad. Ideal para experiencia al cliente.</p>`},
        {t:'4 · NPS y benchmarking', html:`<h2>📊 Voz del cliente y comparación</h2><p><b>NPS:</b> complementa el mystery shopping con la percepción del cliente real. <b>Benchmarking:</b> compara el score vs. el promedio anónimo del sector — fuerte diferenciador de venta (Enterprise).</p>`},
        {t:'5 · Capacitación y marketing', html:`<h2>🎓 Cerrar el ciclo</h2><p><b>Capacitación del personal:</b> el programa detecta la brecha, la consultora capacita justo ahí. <b>Marketing:</b> genera piezas con IA (Canva/Gamma/HeyGen) sin equipo de diseño.</p>`},
        {t:'6 · Cómo vender un add-on', html:`<h2>Flujo comercial</h2><ol><li>El cliente lo solicita desde su portal.</li><li>Llega como lead al CRM con contexto.</li><li>Se cotiza con la calculadora de costos.</li><li>Se activa en Configuración → Add-ons.</li><li>Se factura en el siguiente ciclo y alimenta KPIs y la ficha 360.</li></ol>`},
      ]
    },
    {
      id:'m_integraciones', rol:'admin', ic:'🔌', titulo:'Manual de Integraciones',
      desc:'Cada integración a fondo: qué hace, cómo se configura, qué módulos alimenta, su estado y su valor.',
      secciones:[
        {t:'1 · Patrón de configuración', html:`<h2>Cómo se configura cualquiera</h2><p>Configuración → Integraciones → busca la integración → ⚙️ Config → pega credenciales → Probar conexión → Guardar y activar. Estados: 🟢 funciona en prototipo · 🟡 requiere backend · 🔵 según plan.</p>`},
        {t:'2 · Comunicación', html:`<h2>💬 WhatsApp y ✉️ Correo</h2><p><b>WhatsApp:</b> vía Make (Twilio/360dialog/Meta) o wa.me manual. Alimenta automatizaciones, KPIs, soporte. Apertura ~98% en LatAm. <b>Correo:</b> OAuth Outlook/Gmail. Alimenta el módulo Correo (bandeja + trazabilidad) y el CRM.</p>`},
        {t:'3 · Automatización y datos', html:`<h2>🔗 Make/Zapier/n8n · 📗 Sheets · 🗂️ Storage</h2><p><b>Make:</b> orquestador central de eventos. <b>Google Sheets:</b> HR viva con lectura/escritura sin duplicar. <b>Storage:</b> evidencias, logos y documentos segmentados por proyecto.</p>`},
        {t:'4 · Inteligencia artificial', html:`<h2>✨ Gemini / ChatGPT / Claude / propio</h2><p>Configuración → Asistente de IA → elige proveedor → pega API key → activa. Alimenta importadores, set-up, cuestionarios, certificaciones, documentos, análisis y marketing. Funciona ya con tu API key. Eliges el modelo por costo/beneficio, sin quedar atada.</p>`},
        {t:'5 · Marketing y facturación', html:`<h2>🎨 Contenido · 🧾 Facturación</h2><p><b>Canva/Gamma/HeyGen y Metricool:</b> alimentan el módulo Marketing. <b>Facturación electrónica (FEL/DIAN) y banca:</b> Enterprise, requieren backend seguro; alimentan Finanzas.</p>`},
        {t:'6 · Seguridad en producción', html:`<h2>🔒 Nota crítica</h2><p>Las API keys y secretos NUNCA se guardan en el navegador. En producción van en el backend. En el prototipo se guardan localmente solo para demostrar el flujo; "Probar conexión" es simulación hasta conectar el backend.</p>`},
      ]
    },
  ],
};
