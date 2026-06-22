# Plan de trabajo (backlog vivo)

> Documento **vivo**: se actualiza cada sesión. No se borra lo pendiente; se complementa y se re-prioriza.
> Convención de estado: ✅ hecho · 🟡 en progreso · ⬜ pendiente. Prioridad: **P0** (base comercial / desbloquea TyA) · **P1** (núcleo operativo) · **P2** (profundidad) · **P3** (diferenciadores).

_Última actualización: sesión 7 (registro de shopper completo + alta manual + perfil editable con histórico y KPIs clickeables)._

---

## 🔴 Sesión 6 · brief amplio incorporado — priorizado por criticidad

### P0 — Crítico (estructura comercial; sin esto no se vende ni se adapta bien)
- ⬜ **Configuración con submenús** (no todo regado): pestañas/sección — **Marca & Tema** (colores, plantillas, **tipografía** — hoy no se ve dónde elegirlo), Proyecto, Países & Monedas, Honorarios, Cuestionario, HR/Integraciones, Notificaciones/Plantillas, Pagos, Módulos.
- ⬜ **Dos consolas de configuración**:
  - **Cliente (autogestión)**: ajustes básicos permitidos por su plan.
  - **Proveedor (nosotros)**: seleccionar módulos, personalizar todo, **elegir el plan contratado** → habilita de una vez lo del plan (editable).
- ⬜ **Motor de planes**: definir planes (Básico/Estándar/Pro/Enterprise) con módulos, límites, temas y permisos; al asignar plan se preconfigura el tenant.
- ⬜ **Selector de Tema visible**: colores + plantillas + **tipografía**, dentro de "Marca & Tema".
- ⬜ **Login: descargar como app (PWA)** con detección de dispositivo/navegador (Android/iOS/desktop) y CTA directo.
- ⬜ **Cláusula de confidencialidad** en el primer ingreso de cada usuario, según rol.

### P1 — Núcleo operativo (lo que hace la plataforma usable de verdad)
- ✅ **Registro de shopper completo** (desde login): país (lista larga LatAm) → **departamento** → **ciudad** (dependientes), **nombre y apellido por separado**, correo, WhatsApp, **edad y sexo** (para automatización). Usuario = `nombre.apellido`; contraseña `Nombre123*` (patrón **configurable por el cliente** vía `CX.CREDS`). → H37
- ✅ **Alta manual por admin**: solo obligatorios primer nombre + primer apellido + WhatsApp; el shopper completa el resto al ingresar. → H38
- ✅ **Perfil del shopper completo y editable** + histórico de visitas + KPIs clickeables. → H39
- ⬜ **Asignación manual desde Visitas Disponibles**: elegir cuál visita y a quién (shopper existente o **crearlo ahí** con nombre + teléfono mínimo).
- ⬜ **Ofrecer visitas a shoppers de la misma ciudad**: individual (WhatsApp/correo) y **masivo** (WhatsApp/correo/Mailchimp).
- ⬜ **Plantillas de mensajes** (WhatsApp + correo) editables: ofrecer visita, recordatorio de agenda, "¿hiciste la visita?", recordatorio de cuestionario, marcar completada, certificarse, pago. Variables dinámicas.
- ⬜ **WhatsApp por WhatsApp Web** (`wa.me` + plantilla) además de API — sin obligar a automatización.
- ⬜ **Notificación WhatsApp por registro seleccionable** (hoy notifica el lote completo): elegir de cuáles registros.
- ⬜ **Soporte para el shopper**: por plataforma o por WhatsApp a los **contactos por rol** configurables por el cliente.
- ⬜ **Notificaciones al entrar**: mostrar en **drill/modal grande** apenas el shopper ingresa.
- ⬜ **Tablón editable**: publicar, editar, marcar leídas, clickeables, **orden cronológico**, recibir notificaciones.
- ⬜ **Cronograma de actividades en Mi Día** (agenda del día).

### P1/P2 — Patrones transversales
- ⬜ **Tarjetas clickeables con detalle en TODAS las secciones** (no solo dashboard).
- ⬜ **Filtros en TODAS las secciones** con las opciones que correspondan.
- ⬜ **Buscador en todas las listas desplegables** (países, rubros, ciudades, shoppers, etc.).
- ⬜ **Top shoppers: Top 5 + "ver ranking completo"** + seleccionar shopper → **perfil completo**.

### P2 — Wizard de proyecto (mejoras)
- ⬜ **Rubro/industria**: lista desplegable amplia + **"crear nuevo"**.
- ⬜ **Países**: lista amplia (sobre todo **LatAm**) con **buscador**.
- ⬜ **Reembolsos genéricos**: elegir **tipo de reembolso por consumo**; basado en **consumo registrado en HR** o **monto fijo**; **mapear** en qué columna(s) de la HR aparece el consumo. (Quitar "boleto/combo" cableado.)
- ⬜ **HR origen**: Google Sheets **y Excel Online**; si **Excel importado** → cargar y **mapear**.
- ⬜ **Escenarios**: manual **+ extracción inteligente** (como el mapeo de HR).
- ⬜ **Cuestionario / instructivo / base de conocimiento**: opción **importar / crear con IA / manual**.
- ⬜ **Base de conocimiento IA**: **importar y extraer inteligentemente** (alimenta todos los módulos: resumen, escenarios, soporte).
- ⬜ **Lógica de liquidación**: días de pago calculados desde un **criterio elegible** (visita realizada / cuestionario lleno / visita revisada / submitida…).
- ⬜ **Cuestionarios por versión** (marca / tipo de establecimiento / criterio).

### P2 — Hojas de Ruta / HR
- ⬜ **HR propuesta por extracción del proyecto** + import + creación manual.
- ⬜ **HR externa en vivo**: sincroniza y se lee en vivo en **todas** las secciones; **sin duplicar** datos entre HR y Postulaciones (el sistema se alimenta de ambas vías) + automatizaciones de actualización.

### P2 — Documentos / Aprendizaje / Certificación
- ⬜ **Documentos**: al subir, elegir **quién puede verlos** y **a qué proyecto** corresponden; edición.
- ⬜ **Aprendizaje**: recursos vistos **en la plataforma** + **descargables**, **videos embebidos**, **bloques de capacitación con progreso**, edición.
- ⬜ **Certificación**: elegir **tipo de certificación** + **repasar**; recertificación.
- ⬜ Formato/edición consistente en Tablón, Aprendizaje y Documentos.

### P2 — Cuestionarios
- ⬜ Generar con **IA**, **importar** y **manual**.

### P2/P3 — Análisis
- ⬜ **KPIs y OKRs** en el análisis comparativo (tiempos, efectividad, porcentajes, metas).

### P2/P3 — Integraciones (ver `INTEGRACIONES.md`)
- ⬜ Google Sheets, Excel Online, Make, WhatsApp (Web + Green API/Cloud), Gmail/Workspace, Outlook/M365, Mailchimp, Google Docs/Drive, Facebook, YouTube/Vimeo embed, SSO, BI.

---

## ✅ Hecho

| # | Item | Notas |
|---|---|---|
| H16 | **Sync visita↔liquidación** (`core/liquidacion.js`) | realizada→pend.cuestionario→validada→pagada; refleja en Beneficios y Liquidaciones |
| H17 | **Fecha estimada de pago** = realización/submit + `pago.diasPago` | Parametrizable por proyecto |
| H18 | **Liquidaciones**: cambio de estado + **preparar lote seleccionando visitas** (una moneda/lote) | Genera egresos |
| H19 | **Wizard de proyecto inteligente** (`proyecto-wizard.js`), 5 pasos | Proyecto **aislado y persistente** |
| H20 | Wizard: países+moneda (lista larga), honorarios **recibido/pagado**, modelo **directo/delegado** (ISR/regalías), modo cuestionario, HR, restricciones, días de pago, base conocimiento | |
| H21 | **Motor financiero** (`core/finanzas-core.js`): ingreso/egreso, margen por país, modelo directo (ISR+regalías) vs delegado | Multipaís separado |
| H22 | **Dashboard Financiero** ampliado: margen real por país, comparativo mensual, **presupuesto de gastos fijos** editable, CxC/CxP | |
| H23 | **Movimientos** ampliado: ingresos/egresos/anticipos, **pago de lote genera egresos** de todos los shoppers de una vez, import histórico (vista previa), CxC/CxP | |
| H24 | **Separación por moneda 100% genérica** (`CX.paisLabel/paisFlag/moneda`) — cualquier país, no solo GT/HN | |
| H25 | **Dashboard Operativo**: KPIs y fases **clickeables** (drill con listado), **filtro de meses**, **comparativo último trimestre**, **notificación WhatsApp** en gestiones externas | |
| H26 | **Centro de notificaciones** (`core/notif.js`) por rol, badge de no leídas, alimenta **Mi Día + Tablón** | |
| H27 | **Postulaciones bidireccionales**: el equipo **pide** confirmar/cambiar/reprogramar fecha al shopper; el shopper **responde** (Confirmar / Proponer otra) desde Tablón/Mi Día | |
| H28 | **Configuración con submenús** (Marca&Tema, Plan&Módulos, Países&Monedas, Integraciones, Plantillas) + **consola Proveedor/Cliente** | `configuracion.js` |
| H29 | **Selector de Tema visible**: plantillas (swatches) + **tipografía** (`CX.FONTS`) + colores | |
| H30 | **Motor de planes** (`CX.PLANS`): Básico/Estándar/Pro/Enterprise → preconfigura módulos/temas/integraciones, editable | |
| H31 | **Plantillas de mensajes** y **catálogo de integraciones** en la consola | ver INTEGRACIONES.md |
| H32 | **Beneficios shopper**: honorarios vs reembolsos separados + resumen "beneficio total" (ganancia + consumos/entretenimiento disfrutado) | |
| H33 | **Visitas Disponibles**: tarjetas estilo corporativo (grid quincena/franja/canal/escenario + emoticones + disponible-desde + combo) genéricas por proyecto | |
| H34 | **Beneficios**: conceptos de reembolso **genéricos por proyecto** (no "combo/boleto" fijo) | |
| H35 | **Login: Instalar como app (PWA)** con detección de SO/navegador + manifest | `core/pwa.js` |
| H36 | **Cláusula de confidencialidad** al primer ingreso por usuario+rol (registro de aceptación) | |
| H37 | **Registro de shopper completo** desde login: geo dependiente LatAm (`core/geo.js`), nombre/apellido separados, edad/sexo, credenciales auto (`CX.CREDS` configurable) + acceso directo al portal | `app.js`, `core/geo.js`, `core/config.js` |
| H38 | **Alta manual por admin** (mínimos: nombre+apellido+WhatsApp) con datos extra opcionales; perfil queda "incompleto" hasta que el shopper lo complete | `modules/shoppers.js` |
| H39 | **Perfil de shopper editable + persistente** (`core/shoppers-store.js`): histórico de visitas, KPIs clickeables (drill), buscador en base de shoppers, Mi Perfil con banner "completar perfil" | `modules/shoppers.js`, `modules/operacion-extra.js` |

| # | Item | Notas |
|---|---|---|
| H1 | Arquitectura modular (core + 1 archivo por módulo) | Rompe el monolito de 18k líneas |
| H2 | Datos genéricos multi-proyecto (Retail / Banca / Restaurantes) | Sin marcas ni personas reales |
| H3 | 22 módulos navegables (admin + shopper) | Core a fidelidad, resto funcional |
| H4 | Dashboard operativo por país, 10 KPIs, flujo por fases | Se adapta al proyecto activo |
| H5 | Postulaciones agrupadas por sucursal, aprobar/standby/rechazar | Trazable |
| H6 | Finanzas: Dashboard, Movimientos, Liquidaciones, Lotes | GT (Q) y HN (L) separados |
| H7 | Cuestionarios: editor de escenarios/preguntas/pesos en vivo | Auto-administrable |
| H8 | Usuarios & Permisos: matriz editable, invitar, roles | Auto-administrable |
| H9 | **Sistema de temas + plantilla T&A** (Segoe UI, azul/rojo, sidebar claro) | Seleccionable |
| H10 | **Tenant config**: logo, nombre cliente en login ("desarrollada para"), activar/desactivar módulos | Módulos nunca se eliminan |
| H11 | **Ficha de visita/postulación rica** adaptable por proyecto | Escenario, restricción, canal, combo, honorario |
| H12 | **Postulación con propuesta de fecha + validación** de franja/disponibilidad | Se autoriza desde Gestión de Postulaciones |
| H13 | **Flujo de visita del shopper** (instructivo→certificar→agendar→realizar→cuestionario→submit) | Pasos por proyecto |
| H14 | **Cuestionario del shopper**: interno / externo / link por proyecto | Faltaba la vista de llenado |
| H15 | Shopper ve solo proyectos de su país | `data.projectsFor()` |

---

## 🟡 / ⬜ Pendiente — priorizado

### P1 · Núcleo operativo (sigue)
- ⬜ **Sincronía real entre módulos**: que marcar realizada/cuestionario mueva el estado de liquidación en Beneficios (shopper) y en Liquidaciones (admin), con **fecha estimada de pago** según `pago.diasPago` del proyecto. (parcial: eventos `visit-flow` ya emitidos)
- ⬜ **Documentos y Aprendizaje filtrados por proyecto** (recursos por proyecto, instructivo dentro de la visita).
- ⬜ **Notificaciones**: al equipo por cada acción del shopper; alertas "Drill" cuando algo está atrasado; botón WhatsApp donde haya gestión externa.
- ⬜ **Recertificación / actualización** de certificación cuando el proyecto lo pida.
- ⬜ **Cancelación / reasignación** gestionadas también desde admin (hoy el shopper solicita).

### P2 · Profundidad
- ⬜ **Creación de proyecto inteligente**: wizard que mapee instructivos, hoja de ruta (online/import/interna), restricciones, canales, formato, **modo de cuestionario** (interno/externo/link por visita), **lógica de pago** y base de conocimientos → reconfigura toda la plataforma.
- ⬜ **Hojas de Ruta**: (a) lectura online de HR externa (Google Sheets/Excel online), (b) importación, (c) creación interna; las **Visitas Disponibles se derivan** de la HR activa.
- ⬜ **Colaboración HR sin login**: trabajar la HR en Sheets/Excel online y que la plataforma **detecte cambios y se actualice** (y viceversa).
- ⬜ **Integración Make**: cuando shoppers marcan fechas/visitas, **auto-actualizar la HR externa** y disparar WhatsApp/notificaciones.
- ⬜ **Mapeo de HR externa en configuración del proyecto** (columnas → campos de visita).
- ⬜ **KPIs y tarjetas clickeables** con detalle (drill) + notificación WhatsApp para gestiones externas.
- ⬜ **Dashboard operativo**: filtro de meses (no mostrar todos), comparativo del **último trimestre** de KPIs clave; mantener multipaís.
- ⬜ **Perfil del shopper**: histórico de visitas + KPIs clickeables.
- ⬜ **Finanzas ampliadas**:
  - ⬜ Movimientos: ingresar **ingresos, egresos, pagos**; pago de **lote** genera los movimientos de shoppers de golpe (no uno por uno).
  - ⬜ **Importar histórico** de movimientos (con vista previa anti-duplicados).
  - ⬜ **Cuentas por pagar / por cobrar** en histórico y reflejadas en Dashboard Financiero.
  - ⬜ **Comparativos mensuales** y controles para decisiones de rentabilidad/honorarios.
  - ⬜ **Cálculo de reembolsos según programa** del proyecto.
  - ⬜ Liquidaciones: **cambiar de estado**; al **preparar lote, seleccionar** qué visitas incluir.

### P3 · Diferenciadores / configuración avanzada
- ⬜ **Generación con IA** de cuestionarios y certificaciones, + opción de **importar** o **crear manual**.
- ⬜ **Creación de shoppers** configurable: importados / desde hoja de ruta / manual; **patrón de usuario y contraseña** auto-generado (ej. `nombre.apellido`).
- ⬜ **Geolocalización** (check-in en sucursal) y otros add-ons competitivos (evidencia con foto/GPS, validación de ubicación, app instalable).
- ⬜ Backend de producción (Auth, multi-tenant, reglas) — ver `SECURITY.md`.

---

## Sesión 4 · nuevas observaciones (incorporadas, sin excluir lo anterior)

### P1 · Núcleo (suben de prioridad)
- ⬜ **Auto-registro de shoppers desde el login** (botón "Registrarme") + **perfil completo editable** (datos, documentos, país, cuenta de pago). Sirve tanto si el cliente lo registra manual como si el shopper se registra solo.
- ⬜ **Sección "Mi Perfil" editable** con ficha completa y validación de campos requeridos por proyecto.
- ⬜ **Responsive total** (revisión móvil de todos los módulos, no solo el portal shopper).
- ⬜ **Postulaciones bidireccionales**: el equipo puede **pedir** cambio de fecha / confirmación / reprogramación al shopper, además de **gestionar** lo que el shopper pide.
- ⬜ **Notificaciones al shopper** en **Mi Día + Drill + Tablón** (cada acción/recordatorio se refleja en los tres lugares).

### P2 · Configuración de proyecto inteligente (ampliada)
- ⬜ **Países con lista larga + moneda asociada** (no limitar a GT/HN); multipaís real.
- ⬜ **Honorarios por país y moneda**, distinguiendo **lo que se recibe** vs **lo que se paga**.
- ⬜ **Modelo del proyecto**: **Facturado directamente** vs **Delegado** (para franquicias).
  - Directo → elegir **costos asociados**: honorarios shoppers, **ISR / impuestos locales** según país, **regalías (con %)**, otros.
  - Delegado → solo honorario recibido + pagos asociados. **Ambos impactan el módulo financiero** distinto.
- ⬜ **Versiones de cuestionario por criterio** (tipo de establecimiento, marca, u otro) dentro de un mismo proyecto — aplica a creación manual / import / IA.

### P2 · Finanzas (ampliada)
- ⬜ **Presupuesto** (sobre todo **gastos fijos**); los variables (honorarios) van según ejecución. El presupuesto alimenta el **Dashboard Financiero** (real vs presupuesto).
- ⬜ Lógica financiera diferenciada **directo vs delegado** (ingresos, ISR, regalías, costos).

### P2/P3 · Plataforma comercial (planes y autonomía)
- ⬜ **Config del lado del cliente** (no solo nuestra): el cliente ajusta cosas básicas según su plan (marca, algunas reglas, módulos permitidos).
- ⬜ **Catálogo amplio de temas**: muchas **paletas + tipografías** seleccionables (cliente en plan estándar elige; nosotros personalizamos a fondo).
- ⬜ **Extracción de marca**: generar la paleta desde el **logo** o cargar **manual de marca** (colores/tipografía).
- ⬜ **Motor de planes / autonomía total**: crear **roles adicionales**, **permisos** nuevos o distintos, activar/desactivar **lógicas** y módulos por tenant. Desde lo mínimo hasta lo máximo.

### P2 · Onboarding / Migración (nuevo — clave para TyA y otros)
- ⬜ **Importador de migración**: traer de la plataforma actual (Firebase/Sheets/otra) las **visitas asignadas**, **certificaciones ya hechas**, **shoppers** y **estados**, con mapeo de campos y *match* anti-duplicado, **sin pérdida**.
- ⬜ Plantillas de mapeo reutilizables para distintos orígenes (sirve a cualquier cliente que migre).

### P3 · Automatización e integraciones (ampliada)
- ⬜ **Make**: recordatorios automáticos, auto-update de HR, notificaciones WhatsApp por evento.
- ⬜ Evaluar **APIs del mercado**: WhatsApp Cloud API, Google Sheets, correo, calendario, BI/CRM, SSO.

### Demo / repo
- ✅ **Demo guiado** conservado en el repo en `demo/index.html` (no interfiere con la plataforma).

---

## Orden sugerido para las próximas sesiones
1. **Sincronía visita↔liquidación + fechas de pago** (cierra el círculo operativo).
2. **Wizard de creación de proyecto inteligente** (países+moneda, honorarios recibido/pagado, modelo directo/delegado, costos/regalías, modo cuestionario, HR, restricciones) — desbloquea TyA y cualquier cliente.
3. **Auto-registro + perfil de shopper editable** y **postulaciones bidireccionales**.
4. **Hojas de Ruta + mapeo HR + Make** (de aquí salen las Visitas Disponibles).
5. **Finanzas ampliadas** (directo/delegado, presupuesto, CxC/CxP, lotes→movimientos, comparativos).
6. **Importador de migración** (visitas/certificaciones/estados) — ejercicio TyA.
7. **Catálogo de temas + extracción de marca**; **motor de planes/roles/permisos**.
8. **Notificaciones (Mi Día/Drill/Tablón)**, docs/aprendizaje por proyecto, perfil con histórico/KPIs clickeables.
9. **IA para cuestionarios/certificaciones**, **geolocalización y add-ons**, integraciones de mercado.
10. **Responsive total** (transversal, revisar en cada entrega).

> Toda la lógica de negocio detallada está en **`LOGICA-NEGOCIO.md`**. Cuando se implemente un item, se mueve a "Hecho" aquí y se marca en ROADMAP.
