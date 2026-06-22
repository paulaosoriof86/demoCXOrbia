# Plan de trabajo (backlog vivo)

> Documento **vivo**: se actualiza cada sesión. No se borra lo pendiente; se complementa y se re-prioriza.
> Convención de estado: ✅ hecho · 🟡 en progreso · ⬜ pendiente. Prioridad: **P0** (base comercial / desbloquea TyA) · **P1** (núcleo operativo) · **P2** (profundidad) · **P3** (diferenciadores).

_Última actualización: sesión 22 (**Tablero de Estado Operativo** estilo HR en el Dashboard — buckets por etapa con detalle, WA/correo e ir a sección; **ranking de shoppers clickeable + completo** con perfil)._

### ✅ Hecho en sesión 22
| # | Item | Notas |
|---|---|---|
| H69 | **Tablero de Estado Operativo** en Dashboard: buckets (próximas, realizadas pend. cuestionario, pend. submitir, pend. programar, pend. asignar, alertas vencidas) con fila detallada (sucursal/ciudad/franja/shopper/escenario/combo/estado), **WhatsApp + correo por fila**, recordatorio masivo e ir a Visitas; alimenta recordatorios/automatizaciones | `dashboard.js` |
| H70 | **Ranking de shoppers clickeable** (perfil con KPIs + WA + ir a Shoppers) y **ranking completo** | `dashboard.js` |

_Última actualización: sesión 26 (**Financiero completo** — movimientos globales + conceptos categorizados, ingresos por tipo, CxC/CxP con abonos, remesas y reembolsos mensuales para conciliación)._

### ✅ Hecho en sesión 26
| # | Item | Notas |
|---|---|---|
| H78 | **Tesorería**: movimientos **globales** (no solo proyecto) con scope; **categorías** (admin/financiero/tecnología/proyecto…); ingresos separados por **comisiones/honorarios/anticipos/facturación vs financiamiento→CxP**; fecha histórica; eliminar | `finanzas-core.js`, `finanzas.js` |
| H79 | **CxC/CxP** registrables (saldos iniciales de importación) + **abonos** vinculados a egreso; **remesas** recibidas; KPIs clickeables (drill) | `finanzas-core.js`, `finanzas.js` |
| H80 | **Reembolsos mensuales · conciliación** en Dashboard Financiero (gastado vs reembolsado por cliente/casa matriz) | `finanzas.js` |

> 🟡 Falta en Financiero: en Liquidaciones, armar lote eligiendo de **CxP/meses anteriores** (no solo del mes); tiles internos del dashboard 100% clickeables.

_Última actualización: sesión 25 (**módulo Automatizaciones (Make)** + escritura de vuelta a HR que cierra la doble vía; integraciones Outlook/Sheets; **IA Gemini** configurable; ejemplos anonimizados de otra industria)._

### ✅ Hecho en sesión 25
| # | Item | Notas |
|---|---|---|
| H75 | **Módulo Automatizaciones**: activar/editar automatizaciones (canal + plantilla), **webhook de escenario Make**, integraciones (Outlook/M365, Gmail, Sheets, WhatsApp Cloud), panel de alertas de pendientes y **registro de disparos** | `modules/automatizaciones.js` |
| H76 | **Escritura de vuelta a HR** (`hr.writeBack`): al asignar/agendar en plataforma, actualiza la fila externa correspondiente (por llave natural) y dispara `hr_writeback` a Make → **doble vía sin duplicar** (verificado: 1 fila por visita) | `core/hr.js`, `core/data.js` |
| H77 | **IA configurable `CX.ai`**: proveedor **Gemini** por defecto (`gemini-1.5-flash`, económico), modelo/endpoint/key por tenant, activación opcional; asistente para importadores/extracción/generación | `core/automations.js` |

> Datos de ejemplo del módulo: **anonimizados, industria red de farmacias** (no cine), 100% genérico.

_Última actualización: sesión 24 (**anti-duplicación robusta en doble vía HR↔plataforma** — llave natural inmutable compartida por importador y HR viva)._

### ✅ Hecho en sesión 24
| # | Item | Notas |
|---|---|---|
| H72 | **`core/dedupe.js` — llave natural estable**: identidad por id externo (ref/extId) **y** llave compuesta inmutable (sucursal+ciudad+escenario+quincena). NUNCA deduplica por fecha/estado/shopper (mutables) | evita el duplicado clásico de doble vía |
| H73 | **HR viva sin duplicar**: `hr.diff` resuelve cada fila por extId y, si no, por **llave natural** contra visitas ya existentes (creadas en plataforma vía postulación) → las marca como update, no como nuevas | doble vía HR↔plataforma idempotente |
| H74 | **Importador con misma llave**: detecta duplicados por identidad estable (no por fecha); commit fija `extId=ref` para convergencia | verificado: fila con fecha distinta = mismo registro |

> ⚠️ Recomendación que confirma el fix: el problema de duplicación en la otra plataforma venía de deduplicar por campos que cambian (fecha al agendar, estado al avanzar). Aquí la identidad es inmutable y compartida en ambos sentidos.

### 🤖 IA económica para importadores/herramientas (decisión pendiente)
- ⬜ Vincular un proveedor de IA **económico y con tokens duraderos** para: mapeo de columnas del importador, extracción desde documentos (instructivos/protocolos), generación de cuestionarios/propuestas. Recomendado: modelo pequeño/barato (p.ej. gama "mini/flash/haiku") con caché de prompts y plantillas; abstraer en `CX.ai` configurable por tenant (endpoint + key + modelo) para no acoplar. Hoy los importadores usan heurística determinística (sin costo); la IA sería un asistente opcional encima.

_Última actualización: sesión 23 (**Importador inteligente genérico** — detecta columnas de cualquier HR/histórico, mapeo editable, anti-duplicado, preview y commit que crea visitas+shoppers y sincroniza)._

### ✅ Hecho en sesión 23
| # | Item | Notas |
|---|---|---|
| H71 | **Importador inteligente** `core/importador.js` + módulo: parse CSV/TSV/pegado, **autodetección de columnas** por palabras clave (sucursal/ciudad/fecha/shopper/escenario/honorario/reembolso/estado), mapeo editable, normaliza fechas/estados, **anti-duplicado** (sucursal+fecha), preview 3 pasos, commit crea visitas + vincula/crea shoppers + emite `visit-flow` | sirve HR viva y migración inicial de cualquier consultora |

> 🟡 Pendiente del backlog que sigue: importar HR **dentro de la creación de proyecto** (mapear criterios/KPIs), e importadores en instructivos/cert/aprendizaje. En **Liquidaciones**: el armado de lote debe permitir elegir de **CxP/meses anteriores**, no solo del mes activo.

> Pendientes reales detectados/confirmados. La operativa NO está al 100% hasta cerrar P0–P1.

**P0 — Importaciones inteligentes (genéricas, cualquier consultora)**
- ⬜ Importar HR en **creación de proyecto**: mapear columnas, elegir criterios/KPIs, mantener colaborativa online; adaptar plataforma a industria/características.
- ⬜ Importador inteligente en **instructivos, certificaciones, hojas de ruta, aprendizaje** (patrón importar/IA/manual ya en cuestionarios).
- ⬜ **Importador de migración inicial** (cualquier proyecto): shoppers, visitas, certificaciones, **CxC/CxP, históricos de HR**, anti-duplicado, preview→commit. 🟡 base lista (H71); falta CxC/CxP/cert.
- ⬜ Importar **históricos por shopper** (de HR históricas) → perfil con histórico real.

**P0 — Autoadministración / edición**
- ⬜ **Usuarios, roles y permisos** editables (matriz) + alta usuarios cliente/representante.
- ⬜ Edición/config en módulos hoy sin editar; **NDA editor** en Configuración (motor ya configurable, falta UI).
- ⬜ Configuración con submenús + planes/consolas (Cliente vs Proveedor).

**P0 — Financiero**
- ⬜ Tarjetas del Dashboard Financiero **clickeables**; **reembolsos mensuales** (conciliar pago cliente/casa matriz).
- ⬜ **Movimientos globales** (no solo por proyecto) + **conceptos con listas** (admin/financiero/tecnología/proyecto…); separar ingresos por comisiones/honorarios/anticipos/facturación vs **financiamientos**→CxP; **históricos**; **remesas** para conciliar; **presupuesto** dentro del módulo.
- ⬜ **Liquidaciones**: selección real de cuáles entran al lote; CxC/CxP desde importación; abonos vinculados a egresos; **elegir de CxP/meses anteriores, no solo del mes**.

**P1 — Gestión accionable (detalles ampliados)**
- ⬜ Ampliar **detalle de TODOS los KPIs/secciones**: contacto individual y **masivo** WA+correo desde cada registro.
- ⬜ **Postulaciones dinámicas**: KPI pendientes → ver detalle **filtrado y gestionable** (aprobar/standby/reprogramar) dentro del drill.
- ⬜ **Calendario**: detalle amplio por registro (sucursal, shopper, escenario…) + ir a sección + WA.
- ⬜ **Comparativo trimestral** ampliado (más KPIs/OKRs), leyendo el trimestre de la **HR** (incl. Google Sheets).

**P1 — Portal cliente / clientes / shopper**
- ⬜ **Clientes**: corregir copy ("cartera plan Pro" suena a nosotros) → enfoque consultora-administra-sus-clientes; **perfil de cliente con historial, puntuaciones, OKRs**.
- ⬜ **Mis Visitas**: ver **historial** (toggle activo/historial).
- ⬜ **Aprendizaje inteligente**: cargar material externo, generar infografías/imágenes (tipo notebook), bloques de capacitación, exámenes/formularios, registro de avances.
- ⬜ **Reportes** ampliados (admin / portal cliente / por rol representante).

**P1 — Automatizaciones / integraciones**
- ⬜ **Módulo Automatizaciones (UI)**: toggles, plantillas, **webhook Make**, log; **vincular escenarios ya creados en Make**; **Outlook** (correo/calendario) y cómo se vincula a cada módulo.

**P1 — Costos & Propuestas**
- ⬜ Importador inteligente de costeo: cargar características del programa → **proponer honorario shopper y precio**; selección de qué **imprimir/incluir**.
- ⬜ **Plantilla de propuesta editable** + investigación web del cliente + insertar costos.

**P2 — Nuevo rol**
- ⬜ **Coordinador/Representante**: admin de proyectos, liquidación/cuenta cruzada local, plantillas.

_Última actualización: sesión 21 (**motor de automatizaciones Make** + alertas de atrasados/pendientes; movimientos del shopper enrutados por automatizaciones configurables; **NDA editable por rol**)._

### ✅ Hecho en sesión 21
| # | Item | Notas |
|---|---|---|
| H65 | **Motor de automatizaciones** `core/automations.js`: 8 automatizaciones editables/activables (evento→canal push/WhatsApp/correo/Sheets vía **Make**), webhook configurable, log de disparos; `fire()` notifica + registra | base de la integración Make |
| H66 | **Movimientos del shopper → automatizaciones**: agendar/realizar/reprogramar/cuestionario/pago/aprobación disparan `fire()` (notifica al equipo y registra canal externo) | `misvisitas.js`, `cuestionario-shopper.js`, `data.js`, `postulaciones.js` |
| H67 | **Alertas de pendientes**: `scanPendientes()` detecta visitas **atrasadas / pend. cuestionario / sin agendar** y genera alertas | `core/automations.js` |
| H68 | **Cláusula de confidencialidad editable** por rol (shopper/admin/cliente), persistente | `core/pwa.js` |

_Última actualización: sesión 20 (**flujo del shopper funcional y sincronizado** — agendar/realizar/reprogramar mutan estado real y disparan toda la cadena; revisión del checklist de cierre operativo)._

### ✅ Hecho en sesión 20
| # | Item | Notas |
|---|---|---|
| H64 | **Flujo del shopper real**: `data.setVisitState` + recableo de Mis Visitas — agendar (→agendada), marcar realizada (→realizada), reprogramar y cancelar **mutan el estado** y emiten `visit-flow`; notifican al admin; sincronizan liquidación/beneficios/finanzas/portal. Antes solo mostraban un toast | `core/data.js`, `misvisitas.js` |


### ✅ Hecho en sesión 19
| # | Item | Notas |
|---|---|---|
| H62 | **Motor de costos** `core/costos.js`: modalidades (tradicional/audio/video/online/auditoría/call), honorario por ubicación (capital/interior + incremento), viáticos, overhead (revisión/RRHH/coordinación/plataforma), **regalías + retención/ISR**, **precio por margen objetivo**, reembolsos pass-through | basado en la lógica real de costeo, generalizado |
| H63 | **Módulo Comercial · Costos & Propuestas**: calculadora en vivo, panel de resultado, **comparador de modalidades**, **honorario sugerido al shopper** y **generador de propuesta** (exportar/enviar) | `modules/comercial.js` |

_Última actualización: sesión 18 (sincronía 2 — Portal del Cliente alimentado por **visitas reales**; **egresos financieros automáticos** al pagar lote, centralizados en `payVisits`)._

### ✅ Hecho en sesión 18 (ver `SINCRONIA.md`)
| # | Item | Notas |
|---|---|---|
| H60 | **Portal del Cliente derivado de visitas reales**: `sucursales()` agrupa las visitas del proyecto; score real de cuestionarios enviados con fallback determinístico; invalida caché en `visit-flow` | `core/cliente-data.js` |
| H61 | **Egresos financieros automáticos al pagar**: `payVisits` genera egreso consolidado por país y sincroniza Liquidaciones, Beneficios, Movimientos y Dashboard; "Crear lote" y "Pagar lote" usan la misma ruta | `core/data.js`, `finanzas.js` |

_Última actualización: sesión 17 (**auditoría de sincronía completa** — re-render central por bus para toda la plataforma; cierre del ciclo visita→liquidación→beneficios→finanzas con fecha de pago; **score real del cuestionario alimenta el Portal del Cliente**)._

### ✅ Hecho en sesión 17 (ver `SINCRONIA.md`)
| # | Item | Notas |
|---|---|---|
| H57 | **Sincronía central**: re-render único por bus (`visit-flow`/`shoppers`/`clients`/`programa`) registrado una sola vez en `router.js`, sin fugas de listeners → toda vista activa + badges se actualizan en vivo ante cualquier mutación | `core/router.js` |
| H58 | **Cierre del ciclo de pago**: `data.payVisits(ids)` marca visitas `liquidada` con **fecha de pago** real → Liquidaciones, Beneficios (Pagado+fecha) y Finanzas (CxP) se sincronizan; "Crear lote" lo dispara | `core/data.js`, `core/liquidacion.js`, `finanzas.js` |
| H59 | **Score real → Portal del Cliente**: el cuestionario guarda `score`/`scoreBySection`/`evaluada`; el Panorama muestra **Resultados en vivo de operación** (`CX.clienteData.realResults`) | `cuestionario-shopper.js`, `core/cliente-data.js`, `cliente.js` |


### ✅ Hecho en sesión 16
| # | Item | Notas |
|---|---|---|
| H56 | **KPIs clickeables** en Reportes&KPIs (informes), Postulaciones (drill por estado), Mis Beneficios (drill por concepto) y Dashboard Financiero (drill de liquidaciones por país) | `operacion-extra.js`, `postulaciones.js`, `beneficios.js`, `finanzas.js` |


### ✅ Hecho en sesión 15
| # | Item | Notas |
|---|---|---|
| H54 | **Cronograma tipo calendario** en Mi Día (mes navegable, marcadores visita/tarea por día, click en día → agenda del día) — admin y shopper | `midia.js`, `theme.css` |
| H55 | **KPIs clickeables en Visitas (admin)** con drill a la lista filtrada (disponibles/asignadas/realizadas/sin asignar/fuera de rango) | `visitas.js` |

> 🟢 **KPIs clickeables (transversal) — COMPLETO**: dashboard, shoppers, portal cliente, clientes, visitas, **informes, postulaciones, beneficios y finanzas** (drill por país). Pendiente solo donde no aplica.


### ✅ Hecho en sesión 14
| # | Item | Notas |
|---|---|---|
| H51 | **Cronograma en Mi Día** (admin y shopper): visitas y tareas **agrupadas por día**, clickeables, adicional a lo actual | `midia.js` |
| H52 | **Hojas de Ruta funcionales** (`core/hr.js`): origen interna/import/**online** (Sheets/Excel); **lectura en vivo**; filas dadas de alta directamente en la HR se **sincronizan sin duplicar** (match por extId/visitId); edición de **fechas y reembolsos** se refleja en las visitas; las Visitas Disponibles derivan de la HR | `core/hr.js`, `operacion-extra.js` |
| H53 | **Wizard mejorado**: rubro con **datalist buscable + crear nuevo**, **buscador de países**, **importador de instructivo/HR con extracción IA** (prefill de escenarios/restricción/base de conocimiento) | `proyecto-wizard.js` |

### ✅ Hecho en sesión 13
| # | Item | Notas |
|---|---|---|
| H49 | **Tipo de evidencia por pregunta** (foto / foto geolocalizada / video / audio / varios) + **nota/recomendación**: configurable en el editor, mostrado y **capturado por el shopper** al llenar (con botón de ubicación para foto-geo) | `programa.js`, `configuracion.js`, `cuestionario-shopper.js` |
| H50 | **Asignación manual desde Visitas** (admin): botón Asignar → elegir shopper existente (buscador) o **crear nuevo con nombre+apellido+WhatsApp** y asignar en el acto; pasa la visita a `asignada` | `visitas.js`, `data.js (assignVisit)` |

### ℹ️ Estado de la INTELIGENCIA/IA (honesto, para no perder el hilo)
- ✅ **Cuestionarios**: importar + crear con IA (H48). ✅ **Evidencia** configurable por pregunta (H49).
- ⚠️ **Wizard/Set-up de proyecto**: captura toda la config pero la “inteligencia” es **presentacional**; **no** extrae aún escenarios/cuestionario/HR desde documentos.
- ⬜ **Pendiente con IA real**: extracción desde **documentos corporativos** (entrenar modelo del cliente → generar set-up), **certificaciones**, **hojas de ruta**, **proponer honorarios** desde relevamiento, **mapeo HR**, **calculadora de costos** y **elaboración de propuestas** (estos dos aún no existen).
- ➡️ Conclusión: **NO** está implementado todo lo inteligente del set-up de proyecto; falta la capa de **extracción por documentos** y los módulos comerciales (costos/propuestas).

### ✅ Hecho en sesión 12
| # | Item | Notas |
|---|---|---|
| H47 | **Módulo Clientes (admin)**: cartera de clientes/marcas, **cada proyecto cuelga de un cliente** (`clientId`), detalle con proyectos+contactos, alta/edición persistente, abrir proyecto desde el cliente, **KPIs y filas clickeables** | `modules/clientes.js` |
| H48 | **Importar** (pegar/CSV simple) y **Crear con IA** en el editor de Cuestionarios (genera secciones/preguntas ponderadas según descripción del negocio); manual sigue disponible | `configuracion.js` |

### ✅ Hecho en sesión 11 (transversal · operativa + cliente)
| # | Item | Notas |
|---|---|---|
| H45 | **Motor de programa/cuestionario `core/programa.js`** = fuente única de verdad por proyecto (persistente): secciones→preguntas con **pesos %**, **versiones por criterio** (sucursal/marca/cadena/tipo), validación 100%, preguntas **crítico/KO**, motor de **score ponderado** | consumido por las 3 caras |
| H46 | **Editor admin de Cuestionarios** reescrito a 2 niveles (secciones+preguntas) con versiones, validación de pesos y **persistencia**; **Shopper** llena por secciones y se calcula **score real**; **Portal del Cliente** lee la misma estructura (sincronizado) | `configuracion.js`, `cuestionario-shopper.js`, `cliente-data.js` |

---

## 🟠 Sesión 10 · feedback de producto + insumos reales TyA (incorporado, priorizado)

> **Insumos cargados** (para minar el próximo bloque, en `uploads/`): `Costos Grupo Rimet 2025.xlsx`, `T&A Propuesta Grupo Rimet feb-2025.pdf`, `Cuestionario Maestro Rimet (Coordinación IT).xlsx`, `Listado de Usuarios - Tipo de Usuarios.xlsx`, `Manual de usuario APP de Checker V1.pdf`, `TA GT Presentacion 2025.pdf`. **Genérico/comercializable**: extraer patrones, no datos reales.

### Decisiones de diseño (respuestas a feedback)
- **Selector del portal del cliente = "Programa / Servicio", NO "Proyecto".** Un mismo cliente puede contratar varios programas: **mystery presencial, mystery call, telemarketing, auditoría, campañas especiales**. El selector cambia de programa; el **scope sucursal/región** se resuelve por el **rol** (Director/Regional/Responsable) + filtros. → renombrar y reencuadrar.
- **Config: todo desde Admin (consultora) + futura autogestión del cliente por plan.** Habrá **dos consolas**: Cliente (autogestión según plan) y Proveedor (nosotros, todo). En el portal del cliente NO va config global del tenant; sí preferencias propias permitidas por su plan. → incluir opciones de config correspondientes.
- **El set-up del programa se puede crear desde Operaciones O desde el portal del Cliente** (según plan) y **sincroniza en ambos sentidos** (fuente única de verdad por programa).

### P0 — Analíticas y rankings (alto valor de decisión)
- ⬜ **Analíticas clickeables con drill de alto detalle**: por **sucursal**, por **responsable**, por **visita**, por **puntuación**, por **sección/hallazgo**. Sección de "detalle profundo".
- ⬜ **Rankings**: de **tiendas/sucursales**, y de **personas por rol y ubicación** (responsables, asesores, gerentes, supervisores) por programa y por región.
- ⬜ **Hallazgos**: registro y ranking de hallazgos (críticos/recurrentes) para acción.
- ⬜ **Reportes ampliados**: ranking de tiendas, ranking de hallazgos, desempeño por responsable, tendencias — exportables para toma de decisiones.

### P0 — Mi Programa / Cuestionarios (editable, versionable, sincronizado)
- 🟡 **Secciones y preguntas editables/configurables** con **pesos %** — ✅ manual desde Operaciones, **sincronizado** a Cliente; ⬜ importar/IA y edición desde portal Cliente según plan.
- ✅ **Versiones de cuestionario por criterio** (sucursal / marca / tienda / cadena) dentro del mismo programa (H45).
- ⬜ **Carga de documentación corporativa** (protocolos de servicio, manual de imagen, etc.) → **entrenar el modelo del cliente** y **extraer el set-up** (escenarios, preguntas, instructivos).
- ⬜ **Add-ons activables por plan** reflejados en el portal del cliente.

### P0 — Comercial (consultora)
- ⬜ **Calculadora de estructura de costos MEJORADA** (base: lógica del `Costos Rimet.xlsx`, mejorada): honorarios shopper, reembolsos pass-through, overhead/coordinación, **ISR/regalías** por modelo directo/delegado, **margen objetivo → precio**, por país/moneda y por **tipo de servicio**; comparador de escenarios.
- ⬜ **Propuesta de honorarios para shoppers** sugerida por **relevamiento** (zona, dificultad, escenario, recencia).
- ⬜ **Plantillas de propuesta** (base: `Propuesta Rimet.pdf`): generar propuesta desde plantilla + **investigación en línea del cliente** + relevamiento + costo de la calculadora (propuesta inteligente).

### P0 — Nuevo rol: **Coordinador / Representante** (franquiciado / coordinador de campo)
> TyA hoy no da herramienta a sus representantes; esto es diferenciador comercial.
- ⬜ **Rol Coordinador/Representante** con consola de **administración de proyectos** asignados (visitas, shoppers, agenda, avance).
- ⬜ **Liquidación de honorarios del representante** y/o **cuenta cruzada** cuando factura localmente los programas (cobra al cliente local, paga shoppers, neto vs consultora).
- ⬜ **Plantillas de propuesta para el representante** (como ejemplo/editable) para vender en su plaza.
- ⬜ Scope por plaza/territorio; permisos configurables.

### P1 — Soporte y capacitación (transversal)
- ⬜ **Solicitud de soporte** desde portal del cliente (plataforma / WhatsApp a contactos por rol).
- ⬜ **Capacitación**: a **personal del cliente** (servicio, comercial, técnica) y **capacitación de uso de plataforma**; ligada a brechas detectadas. Academia white-label.

### Usuarios/roles/permisos (reforzar — configurables)
- ⬜ **Matriz de roles/permisos por módulo y acción** (ver/editar/exportar/accionar) configurable por tenant; **crear roles nuevos** (incl. Coordinador). Base: `Listado de Usuarios - Tipo de Usuarios.xlsx`.

---

## 🟣 Sesión 8 · Ecosistema estratégico (ver `ECOSISTEMA.md`)

> CXOrbia pasa de **plataforma operativa** a **ecosistema de 3 caras**: Comercial (consultora) → Operación (campo) → Estrategia (cliente final). Login unificado + enrutamiento por persona (recomendación de arquitectura en `ECOSISTEMA.md`).

### ✅ Hecho en esta sesión
| # | Item | Notas |
|---|---|---|
| H40 | **Portal Estratégico del Cliente v1** (rol `cliente` + `CX.NAV.cliente`) con login propio y **conmutador de persona** (Director / Gerente Regional / Responsable de Sucursal) y **scope de datos** | `core/cliente-data.js`, `modules/cliente*.js`, `app.js` |
| H41 | **Motor de score ponderado**: programa con **secciones y preguntas con pesos %**; scorecard por sucursal (0–100 + desglose por sección) | `core/cliente-data.js` |
| H42 | **Panorama ejecutivo** (score global, NPS, ranking mejores/peores clickeable, distribución, brechas) + **Sucursales & Score** (filtros, detalle con histórico) | `modules/cliente.js` |
| H43 | **Planes de Acción** (reconocimiento/incentivo/mejora/sanción, persistentes) + **Capacitación** (brechas→cursos) + **Reportes** + **Mi Programa** (simulador) + **Servicios & Add-ons** | `modules/cliente*.js` |
| H44 | Sección **Comercial** en consola consultora (CRM + Marketing) declarada en nav (scaffold) | roadmap |

### P0 — Ecosistema (siguiente, por criticidad)
- ⬜ **Editor de cuestionarios con pesos %** (secciones/preguntas, validación suma 100, KO/críticas, NPS, versiones por criterio) en módulo Cuestionarios + **simulador**; el Portal del Cliente lee de ahí.
- ⬜ **Roles & permisos del cliente completos**: matriz por módulo/acción (ver/editar/exportar/accionar) + **scope** país/región/sucursal + **alta de usuarios del cliente** por la consultora.
- ⬜ **Vincular score real visita↔sucursal**: que el cuestionario llenado alimente el scorecard (hoy el score es derivado/demostrativo por proyecto).
- ⬜ **Seguimiento de planes de acción**: estados (Abierto/En curso/Cerrado), evidencia de cierre, recordatorios.

### P1 — Comercial (consultora)
- ⬜ **CRM**: pipeline de prospectos/oportunidades (kanban), cuentas y contactos.
- ⬜ **Propuestas inteligentes** a partir de relevamiento (IA arma alcance/programa/precio).
- ⬜ **Demos & simuladores** de programa y cuestionario para prospección.
- ⬜ **Actas inteligentes** (transcribe/resume Zoom·Meet, extrae acuerdos/tareas) + **Notion**.
- ⬜ **Marketing & Contenidos**: generación de piezas/publicaciones, calendario, mediciones, estrategia.

### P0/P1 — Apoyo IA, costos y base de conocimiento (sesión 9 · incorporado)- ⬜ **Calculadora de estructura de costos** (consola comercial/admin): honorarios, reembolsos pass-through, overhead, impuestos (ISR/regalías según modelo directo/delegado), **margen objetivo → precio sugerido**; por moneda. Alimenta la propuesta. *(en curso — siguiente bloque)*
- ⬜ **Elaboración de propuestas**: desde **plantilla** + **investigación en línea del cliente** + **relevamiento**; la IA arma alcance, programa, cronograma y precio (toma el costo de la calculadora).
- ⬜ **IA en cada sección del set-up**: generación asistida de **instructivos, certificaciones, hojas de ruta, cuestionarios (con pesos)** — opción crear con IA / importar / manual.
- ⬜ **Base de conocimiento del cliente (entrenar el modelo)**: cargar **protocolos de servicio, manual de imagen y documentos corporativos** → extracción inteligente que **alimenta todo el set-up** (escenarios, cuestionarios, soporte, capacitación). Campo `conocimiento` + repositorio por proyecto.
- ⬜ **Automatizaciones transversales** en cada sección (Make/webhooks): recordatorios, actualización de HR, notificaciones WhatsApp/correo por evento, generación/distribución de reportes.
- ⬜ **Portal del Cliente — áreas más débiles → estadísticas + planes de capacitación dirigidos** (parcial: brechas y cursos ya en `cli_capacitacion`; falta histórico/tendencia de brechas y asignación con seguimiento).

### 🔌 Transversal — módulos que impactan 2–3 caras (construir en paralelo)
> Tienen criterios complementarios entre Comercial ↔ Operación ↔ Estrategia; se trabajan junto con la operativa.
- ✅ **Cuestionarios con pesos** (Operación crea ↔ Cliente consume ↔ Comercial simula) — `core/programa.js` fuente única (H45/H46).
- ⬜ **Base de conocimiento IA** (Comercial relevamiento ↔ Operación set-up ↔ Cliente soporte/capacitación).
- ⬜ **Automatizaciones/notificaciones** (las tres caras).
- ⬜ **Reportería/score** (Operación produce ↔ Cliente visualiza).

### 🧱 Arquitectura escalable / Multi-tenant (base correcta — decisiones confirmadas)
- ⬜ **Tenant = consultora**; **TyA = tenant #1**. Migrar TyA activando **solo módulos contratados** (`CX.applyPlan` + `cx_modules`); el resto queda **disponible para activar** cuando lo desee (los módulos nunca se eliminan).
- ⬜ **Login unificado + enrutamiento por persona** (Proveedor/Consultora/Cliente/Shopper); en producción, subdominios por cara sobre el mismo backend (ver `ECOSISTEMA.md §2`).
- ⬜ **Aislamiento de datos por tenant** + scope por país/región/sucursal; reglas en backend (ver `SECURITY.md`).
- ⬜ **Modelo de datos versionado** para soportar add-ons sin romper tenants existentes.

### ✅ Checklist de cierre — "Plataforma OPERATIVA completa" (avisar a stakeholder al llegar a 100%)
> Cuando todo esto esté en ✅, la operativa está lista para **lanzar/migrar TyA Online**.
- ✅ Registro/alta/perfil de shoppers · asignación manual desde Visitas Disponibles (H37–H39, H50).
- ✅ Hojas de Ruta: online/import/interna → de aquí derivan Visitas Disponibles (H52).
- ✅ **Flujo del shopper end-to-end**: instructivo→certificar→agendar→realizar→cuestionario→submit, mutando estado real y sincronizado (H64).
- 🟡 Cuestionario operativo: interno/externo/link **+ pesos** y llenado con score real (✅ interno ponderado con score real y evidencia; ⬜ score en modos externo/link).
- ✅ Sincronía completa visita↔liquidación↔beneficios con fecha de pago (H58/H61).
- ⬜ Documentos/Aprendizaje/Certificación **filtrados por proyecto** + instructivo contextual en la visita (hoy presentacionales; navegación desde la visita ✅).
- 🟡 Notificaciones (Mi Día/Drill/Tablón) + WhatsApp por evento (bus + Tablón ✅; ⬜ WhatsApp real/Make).
- ⬜ Configuración con submenús + motor de planes/consolas (P0 sesión 6).
- ⬜ Importador de migración (visitas/certificaciones/estados de TyA, anti-duplicado).
- ⬜ Responsive total revisado.

> **Estado para migrar TyA:** núcleo operativo (proyectos→HR→visitas→asignación→flujo shopper→cuestionario→liquidación→beneficios→finanzas) **funcional y sincronizado**. Faltan para 100%: filtrar Documentos/Aprendizaje/Cert por proyecto, **importador de migración**, Configuración con submenús, WhatsApp real y repaso responsive.

### P0/P1 — Pendientes que siguen (de feedback)
- ✅ **Control de clientes en administración** (no solo proyectos) — H47.
- ✅ **Importar / crear con IA** en cuestionarios — H48; ⬜ replicar el patrón **importar/IA/manual** en **instructivos, certificaciones, hojas de ruta, base de conocimiento**.
- ✅ **Pesos por sección y por pregunta** configurables (el cliente/operación eligen) — editor H46.
- 🟡 **KPIs/tarjetas clickeables con detalle en TODAS las secciones** — hecho en dashboard, shoppers, portal cliente y **clientes**; ⬜ pasada transversal en finanzas, informes, postulaciones, visitas, beneficios, midía.

### P2 — Profundización del ecosistema (recomendado, ver `ECOSISTEMA.md §7`)
- ⬜ Investigación de mercados · Voz del Cliente (VoC) · Quality Assurance / calibración · Facturación & contratos · SLAs/cumplimiento · Gobernanza de datos/privacidad · Centro de Inteligencia (IA) · Benchmarking sectorial.
- ⬜ Integraciones: Notion, Zoom, Google Meet, Power BI/Looker, SSO (añadir a `INTEGRACIONES.md`).

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
- ✅ **Asignación manual desde Visitas Disponibles**: elegir cuál visita y a quién (shopper existente o **crearlo ahí** con nombre + teléfono mínimo). — H50
- ⬜ **Ofrecer visitas a shoppers de la misma ciudad**: individual (WhatsApp/correo) y **masivo** (WhatsApp/correo/Mailchimp).
- ⬜ **Plantillas de mensajes** (WhatsApp + correo) editables: ofrecer visita, recordatorio de agenda, "¿hiciste la visita?", recordatorio de cuestionario, marcar completada, certificarse, pago. Variables dinámicas.
- ⬜ **WhatsApp por WhatsApp Web** (`wa.me` + plantilla) además de API — sin obligar a automatización.
- ⬜ **Notificación WhatsApp por registro seleccionable** (hoy notifica el lote completo): elegir de cuáles registros.
- ⬜ **Soporte para el shopper**: por plataforma o por WhatsApp a los **contactos por rol** configurables por el cliente.
- ⬜ **Notificaciones al entrar**: mostrar en **drill/modal grande** apenas el shopper ingresa.
- ⬜ **Tablón editable**: publicar, editar, marcar leídas, clickeables, **orden cronológico**, recibir notificaciones.
- ✅ **Cronograma de actividades en Mi Día** (agenda del día) — H51 (admin + shopper).

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
- 🟡 **HR externa en vivo**: sincroniza y se lee en vivo en **todas** las secciones; **sin duplicar** datos entre HR y Postulaciones (el sistema se alimenta de ambas vías) + automatizaciones de actualización. — H52 (lectura en vivo + sync sin duplicar listo; falta Make/automatización y propagación a todas las secciones).

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
