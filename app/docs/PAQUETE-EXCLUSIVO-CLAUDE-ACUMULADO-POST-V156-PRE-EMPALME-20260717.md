# PAQUETE EXCLUSIVO PARA CLAUDE — ACUMULADO POST-V156, PRE-EMPALME FINAL

Fecha: 2026-07-17  
Proyecto: CXOrbia — prototipo comercializable + sincronía con backend/tenant TyA  
Repo de continuidad: `paulaosoriof86/demoCXOrbia`  
Rama de empalme posterior: `docs-tya-v6-v71-audit`  
PR de continuidad: #7 draft/open/no merge

## 1. Objetivo de este paquete

Generar una única candidata frontend completa, derivada exclusivamente de la V156 actual, que incorpore los pendientes reales del prototipo, los patrones reutilizables aprendidos durante Phase A, los fixes locales que sí deben consolidarse de forma genérica, la sincronía de Academia y la corrección final del gate comercial.

Este paquete no autoriza ni solicita cambios backend. Claude trabaja solo en el prototipo comercializable. ChatGPT aplicará después el delta auditado mediante `APPLY_DELTA_DIRECTLY` sobre la rama viva.

## 2. Fuente única obligatoria

Trabajar exclusivamente sobre:

- Archivo: `Prototype development request CXOrbia V156.zip`.
- SHA-256 del ZIP actualmente entregado: `d25a9de150d0f3e8e3b83916e98196ff71bf1346aab8a2a986a66e107ca056de`.
- Identidad interna: V156.
- Manifest interno: `app/docs/MANIFEST-V156.json`.
- Runtime cubierto por manifest: 205 archivos.
- Aggregate SHA-256 reproducible: `0262675769bf613c933e0872484bd27d38c4adabe28b335f697ae456cc5c0305`.
- Verificación actual: 0 diferencias de manifest.
- JavaScript verificado: 66 archivos, 0 errores de sintaxis.
- Total del paquete: 256 archivos, incluyendo documentación y evidencias excluidas del runtime manifest.

No partir de V155, V151, V131, V110 ni de otra candidata. No reconstruir libremente. No devolver cambios basados en una versión anterior.

## 3. Diagnóstico actual vinculante

V156 conserva avances importantes y no debe rehacerse. Sin embargo, el cierre comercial reportado no coincide todavía con el árbol entregado:

1. El reporte V156 declara 0 términos técnicos visibles, pero el runtime todavía contiene copy renderizable con palabras y códigos internos.
2. `app/docs/RESUMEN-PARA-CLAUDE.md` y `app/docs/PENDIENTES-PROTOTIPO.md` dentro de V156 siguen describiendo V82 y crean una fuente de continuidad obsoleta.
3. El gate ejecutado no viene como herramienta reproducible suficiente dentro de la candidata para comprobar, por rol y módulo, que el DOM comercial queda limpio.
4. Parte de los patrones backend reutilizables está representada de forma técnica en la UI en vez de traducida a lenguaje comercial y acciones administrables.

Archivos con hallazgos vigentes que deben revisarse de forma focalizada, sin limitarse a esta lista:

- `app/core/manuales-data.js`
- `app/core/topbar.js`
- `app/modules/dashboard.js`
- `app/modules/importador.js`
- `app/modules/postulaciones.js`
- `app/modules/marketing.js`
- `app/modules/correo.js`
- `app/modules/cert.js`
- `app/modules/finanzas.js`
- `app/modules/integraciones.js`
- `app/modules/administrabilidad.js`
- `app/modules/automatizaciones.js`
- `app/modules/hr-source.js`
- `app/modules/configuracion.js`
- `app/modules/academia.js`

Ejemplos reales aún presentes: `pending_backend`, `reviewQueue`, `sourceRef`, `connectionRef`, `runtimeSyncActive`, `source_safe_preview`, “pendiente backend”, “backend/Make”, “backend/Outlook”, “gate backend”, “HR sync pendiente backend” y manuales comerciales que explican detalles de adapters/servidor.

## 4. Límites estrictos de Claude

Claude puede modificar únicamente el frontend y su documentación de candidata:

- `app/core/**` solo cuando sea necesario para corregir contrato visual, copy, estado de UI o comportamiento genérico ya existente.
- `app/modules/**`.
- `app/styles/**`.
- `app/docs/**` de la candidata.
- `app/index.html`, `app/app.js`, `app/sw.js` o `app/manifest.webmanifest` solo si un gate concreto lo exige.

Claude no debe tocar ni incluir como cambios:

- `backend/**`.
- `tools/**` del repositorio de ChatGPT.
- `.github/workflows/**`.
- Firebase, Firestore, Auth, Storage, Make, Gemini, correo, WhatsApp o HR reales.
- adapters TyA, overlays TyA, R11D, R14C o datos source-safe del tenant.
- datos reales, secretos, webhooks, service accounts, API keys o referencias privadas.
- lógica específica de Cinépolis como lógica global.

Claude puede regenerar el manifest y el build-lock internos de su candidata como evidencia del paquete. Estos no sustituyen el build-lock activo de la rama; ChatGPT generará el lock de la unión empalmada.

## 5. Avances cerrados que se deben preservar, no reabrir

### Producto y contexto

- Separación real entre proyecto y periodo.
- Un proyecto agrupa varios periodos; el periodo cambia los datos visibles.
- Contexto único reutilizable `{tenantId, projectId, periodId, country}`.
- Selector multiproyecto para admin, shopper y cliente.
- Histórico separado de operación activa.
- Configuración por tenant/proyecto de país, moneda, frecuencia, medición, HR, cuestionario, documentos, certificación, pagos e integraciones.
- Retail, Banca y Restaurantes como proyectos demo curados.
- Migración de fixtures tenant-safe, repetible e idempotente.

### Operación y KPIs

- Estados ortogonales de visita.
- “Pendientes de realizar” incluye toda visita no realizada del periodo activo, aunque no esté asignada o agendada.
- “Visitas disponibles” significa postulables: sin shopper, no realizadas y del periodo activo.
- Shopper activo por cuenta activa + al menos una visita realizada dentro de la ventana configurada.
- Paridad entre KPI, detalle y exportación.
- Postulaciones agrupadas sin ocultar sucursales por límites arbitrarios.
- Perfil de shopper, reasignación, cancelación con motivo, solicitud de ajuste y reprogramación.

### Finanzas

- `porPais()` conserva `data.project()`.
- El adapter de `serieMensual()` conserva simultáneamente `project()`, `period()` y `visitas()`.
- Dashboard financiero es análisis y drilldown; las acciones se realizan en Movimientos/Configuración.
- `liquidada` no equivale a `pagada`.
- Un pago solo es confirmado por evidencia/referencia real; `pagada_preview` sigue pendiente.
- No fabricar series, narrativas o cobros sin fuente.
- Lotes y movimientos individuales por shopper ya existentes deben preservarse.

### PWA y seguridad

- Prompt nativo de instalación en navegadores elegibles; guía manual solo cuando el navegador no expone prompt programático.
- Un único listener de instalación.
- `hasTechAccess()` permanece desactivado en el build comercial.
- El curso técnico interno `a_backend` no aparece para audiencias comerciales.
- No existe autorización técnica por `?internal=1`.
- Ningún secreto se solicita ni persiste en formularios.

### Academia ya implementada

- Ciclo de vida de cursos personalizados.
- Crear, editar, duplicar, archivar/restaurar, versionar y transición de estado con motivo/auditoría.
- Segmentación por audiencia, tenant, proyecto, país, rol y módulo.
- Cursos, lecciones, evaluaciones, manuales y recursos existentes.

No reescribir estos bloques desde cero. Corregir únicamente regresiones o brechas demostradas al ejecutar los gates de este paquete.

## 6. P0 — cierre obligatorio antes de entregar la nueva candidata

### P0-A. Gate comercial real y reproducible

Eliminar de todas las superficies comerciales renderizadas para `admin`, `ops`, `coordinador`, `aliado`, `shopper` y `cliente`:

- `backend`
- `runtime`
- `source-safe` / `source_safe`
- `pending_backend`
- `reviewQueue`
- `auditEvents`
- `sourceRef`
- `connectionRef`
- `manifest`
- `source lock`
- `BUILD_ID`
- `app/docs`
- `dry-run`
- nombres crudos de estados o propiedades internas equivalentes

La corrección aplica a:

- textos fijos;
- badges;
- tooltips y atributos accesibles;
- toasts;
- modales;
- tablas;
- plantillas de correo/notificación;
- manuales y cursos comerciales;
- contenido abierto por botones o drilldowns;
- estados vacíos y mensajes de error.

Los identificadores internos, comentarios y contratos de código pueden conservar sus nombres si no llegan al DOM. No renombrar APIs internas solo para satisfacer el gate visual.

Usar lenguaje comercial uniforme:

- `prepared` → Preparado / Borrador listo.
- `pending_backend` → Pendiente de activación o Pendiente de conexión.
- `pending_gate` → Requiere autorización.
- `pending_source` → Pendiente de fuente.
- `manual_review_required` / `reviewQueue` → Requiere revisión humana / En revisión.
- `source_safe_preview` → Vista previa con datos controlados.
- `connected` → Conectado, únicamente cuando la fuente lo confirme.
- evento no ejecutado → Preparado, no enviado.
- import no ejecutado → Vista previa, no importado.
- pago no confirmado → Liquidado o programado, no pagado.

#### Gate entregable obligatorio

Incluir dentro de la candidata un script reproducible que:

1. inicia la app limpia;
2. entra como cada rol comercial;
3. navega todos los módulos accesibles de ese rol;
4. abre acciones relevantes: modales, detalles, toasts, tabs y manuales;
5. inspecciona `document.body.innerText`, nombres accesibles y mensajes generados;
6. reporta ruta, rol, módulo, término y texto exacto de cada coincidencia;
7. falla con cualquier coincidencia no permitida;
8. termina con 0 coincidencias reales.

No basta un reporte escrito. El script y su resultado deben estar incluidos en el ZIP y ser ejecutables por ChatGPT/Codex.

### P0-B. Separación real entre contenido comercial y contenido técnico

- El curso `a_backend`, manuales técnicos de Firebase/Gemini/Make/Storage y cualquier guía de desarrollo deben permanecer inaccesibles para todos los roles comerciales.
- No basta ocultarlos del menú: la navegación directa por id/ruta debe bloquearse.
- No debe existir parámetro URL, sessionStorage, botón oculto o rol demo que habilite acceso técnico en el build comercial.
- Los manuales de administradores comerciales deben explicar qué puede configurar el usuario, no la arquitectura interna, adapters, payloads, códigos de estado o dónde guardar secretos.
- Nunca instruir al usuario final a copiar API keys, webhooks, `firebaseConfig`, tokens o credenciales.
- Cuando una conexión dependa del sistema central, mostrar únicamente estado, solicitud, responsable y siguiente paso comercial.

### P0-C. Handoff y evidencia coherentes con el árbol entregado

Actualizar dentro de la nueva candidata:

- `app/docs/RESUMEN-PARA-CLAUDE.md`.
- `app/docs/PENDIENTES-PROTOTIPO.md`.
- `app/docs/CAMBIOS-PROTOTIPO.md` o addendum equivalente.
- reporte de la nueva versión.
- manifest de la nueva versión.
- build-lock de candidata.

Eliminar referencias que presenten V82 como estado actual. El handoff debe indicar:

- baseline exacta V156;
- archivos modificados;
- qué se preservó;
- qué se corrigió;
- qué sigue pendiente;
- qué es frontend y qué pertenece a backend;
- qué afecta Academia;
- qué no se debe reabrir;
- resultados reales de sintaxis, manifest y gate comercial.

El reporte debe coincidir con el ZIP. No declarar 0 coincidencias si el gate reproducible encuentra términos. No enumerar menos archivos que el delta real.

## 7. P1 — sincronía acumulada prototipo ↔ producto CXOrbia

Estos puntos no deben implementarse a ciegas. Primero verificar lo que V156 ya contiene; preservar lo completo y corregir solo brechas.

### P1-A. Contexto, proyecto, periodo e histórico

- Mantener un único estado compartido de tenant/proyecto/periodo/país para todos los módulos.
- Ningún módulo debe tratar un periodo como si fuera un proyecto.
- Cambiar MAY/JUN/JUL debe cambiar Dashboard, Visitas, Postulaciones, Histórico, Finanzas, Liquidaciones, Hoja de Ruta y Portal Cliente sin recarga.
- Periodos debe permitir crear, cerrar, archivar, duplicar y comparar bajo permisos.
- Histórico no debe mezclarse con la operación activa.
- País y moneda derivan del proyecto/visita, nunca de `countries[0]` o una moneda global.

### P1-B. Fuente externa y `CX.data`

- Todos los módulos consumen `CX.data` y el contexto; no llaman directamente HR, Google Sheets, Firebase, Make ni proveedores.
- La fuente externa es configurable por proyecto: archivo, Google Sheets, CRM, API o plataforma propia.
- La UI debe mostrar modo comercial, estado, última actualización, incidencias y acción permitida sin exponer `sourceRef` cruda.
- Una referencia opaca puede existir internamente, pero no debe mostrarse como código técnico al usuario.
- Vista previa no significa importación; solicitud de sincronización no significa sincronización completada.

### P1-C. Importadores separados y revisión humana

Preservar y completar las vistas separadas para:

- HR/visitas;
- shoppers;
- pagos/movimientos;
- certificaciones presentadas;
- documentos/recursos;
- otras fuentes declaradas.

Cada vista debe mostrar comercialmente:

- archivo y formato;
- fuente/proyecto/periodo;
- aceptados;
- duplicados exactos;
- conflictos;
- descartados;
- campos protegidos excluidos;
- bloqueos;
- revisión requerida;
- materialización desactivada cuando el gate no está autorizado.

No mostrar filas crudas con DPI, banco, NDA, correo completo, teléfonos privados, adjuntos o referencias sensibles.

Los conflictos nunca se resuelven por nombre, monto o coincidencia visual. Acciones permitidas: conservar ambos, escalar, solicitar información o marcar revisado con motivo.

### P1-D. Controles administrativos operativos

Aplicar un patrón visual consistente de búsqueda, filtros, acción con motivo, revisión humana e historial visible en:

- Certificaciones.
- Postulaciones.
- Asignaciones.
- Visitas.
- Beneficios/liquidaciones.
- Evidencias.
- Integraciones.
- Academia.
- Importaciones.
- Notificaciones.

Dashboard debe ser lectura y drilldown, no lugar para correcciones silenciosas o creación de registros financieros.

### P1-E. Certificaciones y Academia

En Certificaciones verificar o completar:

- búsqueda por certificación, proyecto, shopper y estado;
- filtros: certificado, pendiente, vencido, en revisión y excepción individual;
- autorizar/revocar excepción para una certificación específica;
- solicitar una certificación específica a un shopper específico;
- resolver una certificación presentada que no se reflejó;
- razón obligatoria e historial visible;
- carryover aceptado sin pedir repetir certificación;
- habilitación solo con estado confirmado/publicado, carryover materializado o excepción individual válida.

No permitir excepciones globales para todas las certificaciones o todos los shoppers.

### P1-F. Beneficios, liquidaciones, pagos y lotes

Verificar o completar de forma genérica y configurable:

- honorario separado de reembolsos;
- componentes de reembolso configurables por proyecto; no hardcodear “Boleto/Combo” como modelo global;
- moneda y país por movimiento;
- estado de liquidación distinto de estado de pago;
- fecha programada distinta de pago confirmado;
- selección manual de personas/visitas que entran al lote;
- el lote no incluye automáticamente todos los elegibles;
- movimiento individual visible por cada shopper/visita aun cuando se pague en lote;
- `batchId`, `paymentItemId`, visita, shopper, componentes, total, moneda, fuente, estado y auditoría en el contrato visual;
- casos en revisión no aparecen pagados;
- cero procesados genera un mensaje honesto;
- llamadas repetidas no deben duplicar visualmente movimientos o IDs.

Conservar el hotfix financiero protegido y no volver a usar `data.period()` dentro de `porPais()`.

### P1-G. Postulaciones, asignaciones y ciclo de visita

Preservar las acciones ya existentes y completar únicamente brechas:

- bandeja por estado, sucursal, shopper, proyecto, periodo y país;
- perfil completo del shopper con historial y requisitos;
- aprobar, rechazar, standby, reabrir o mover a revisión con razón;
- asignar, desasignar, reasignar y cancelar con trazabilidad;
- solicitar ajuste de fecha, autorizar, conservar fecha, reprogramar y cancelar;
- distinguir asignación originada en plataforma, fuente externa, pendiente de sincronía, sincronía preparada, conflicto y revisión humana;
- visita deja de estar disponible cuando existe asignación válida;
- no duplicar al reflejarse la misma asignación en la otra fuente.

La ficha dinámica de postulación debe poder mostrar datos configurables del proyecto sin exponer datos sensibles innecesarios.

### P1-H. Comunicaciones, notificaciones y proveedores

- WhatsApp Web funciona como borrador/manual fallback y requiere confirmación humana; nunca se marca enviado automáticamente.
- Correo se representa como borrador, preparado, pendiente de proveedor, enviado confirmado o error.
- La bandeja debe ser provider-agnostic y permitir futura cuenta por usuario sin guardar credenciales en navegador.
- Outbox visible con lenguaje comercial, reintento controlado, correlación, motivo y revisión humana.
- Plantillas y notificaciones deben indicar claramente si están preparadas o confirmadas.
- Marketing programado no significa publicado.
- Automatización activa en UI no significa que Make esté conectado.

### P1-I. CRM, documentos y shopper history

Verificar y consolidar:

- CRM con cuentas, contactos, pipeline, actividades, reportes y ficha 360;
- referencias a carpetas/documentos externos configurables sin almacenar enlaces privados crudos en datos demo;
- historial de comunicaciones por shopper/cliente;
- shopper history completo por proyecto/periodo/visita;
- trazabilidad de propuestas, documentos y comunicaciones;
- no inventar responsables, NPS, fechas o estados en Portal Cliente.

### P1-J. Login, white-label y configuración por tenant

- Login externo/configurable por tenant cuando aplique, sin prometer SSO activo.
- Logo, marca, países y opciones provienen de configuración.
- El mismo tenant puede tener múltiples proyectos.
- No usar un proyecto global por defecto.
- El wizard debe permitir crear otros proyectos sin clonar reglas exclusivas de Cinépolis.

### P1-K. Centro de novedades

Mantener o completar:

- releases y cambios por tenant/rol;
- banner opcional;
- historial;
- confirmación de lectura;
- vínculo con cursos/manuales actualizados;
- estados honestos de disponibilidad.

## 8. Academia — cierre acumulado obligatorio

Academia debe sincronizarse con cada módulo realmente modificado. No agregar texto superficial para aparentar cobertura.

### Preservar

- Cursos y lecciones profundas existentes.
- Segmentación por rol/tenant/proyecto/país/módulo.
- Lifecycle y auditoría de contenido personalizado.
- Crear, editar, duplicar, archivar/restaurar y versionar.
- IA como borrador local sujeto a revisión humana.

### Completar o verificar

1. Acceso persistente y claro a Mi ruta, cursos pendientes, manuales, novedades y solicitud de capacitación.
2. Controles visibles de administración: crear, editar, enviar a revisión, aprobar, publicar, archivar, restaurar, duplicar, versionar y soft-delete cuando corresponda.
3. Estados visibles: borrador, generado por IA, revisión humana requerida, aprobado, publicado, archivado.
4. Motivo obligatorio y auditRef comercialmente comprensible en cambios sensibles.
5. Rutas por rol sin contenido técnico interno para usuarios comerciales.
6. Manuales por módulo con pasos, botones, datos a ingresar, validación esperada, errores frecuentes y qué hacer si falla.
7. Checklists interactivos, glosario, preguntas frecuentes, búsqueda y filtros.
8. Notificaciones cuando cambia una regla, manual, curso o flujo operativo.
9. Backfill de proyecto vs periodo, histórico, KPIs, HR/fuente externa, importadores, revisión humana, certificaciones, pagos, comunicaciones, CRM y novedades.
10. Contenido técnico interno completamente aislado del build comercial.

No usar Academia para enseñar a usuarios finales a configurar Firebase, pegar API keys, webhooks o credenciales.

## 9. Exclusivo TyA — no convertir en lógica global

No hardcodear en el producto:

- `tenantId=tya`.
- Cinépolis como proyecto único/default.
- 14 periodos, 616 visitas o 44 visitas por periodo.
- reglas Q1/Q2, quincenas o columnas específicas de la HR TyA.
- junio como estado universal.
- nombres “Boleto” y “Combo” como únicos tipos de reembolso.
- TyAOnline como único origen de cuestionario.
- moneda, país, URLs, shoppers, certificaciones o reglas de pago de TyA.

Traducir lo reusable a configuración por tenant/proyecto. Las cifras y reglas TyA serán aplicadas después mediante overlays/backend, no dentro de la candidata comercial.

## 10. Matriz mínima de validación

| Área | Validación obligatoria |
|---|---|
| Login/shell | Marca correcta, roles, navegación y sin acceso técnico comercial |
| Proyecto/periodo | Identidades separadas y cambio sincronizado sin recarga |
| Dashboard | KPI = detalle = exportación; drilldown sin acciones financieras impropias |
| Visitas | Estados ortogonales, disponibles correctas y ficha/history |
| Postulaciones | Filtros completos, acciones con razón, reprogramación y revisión |
| Shoppers | Perfil, historial, proyecto/país y datos protegidos |
| HR Source | Lenguaje comercial, referencia opaca, preview ≠ sync real |
| Importador | Áreas separadas, conteos, conflictos, campos protegidos, gate apagado |
| Certificaciones | Carryover, excepciones individuales, solicitud y auditoría |
| Finanzas | `liquidada ≠ pagada`, hotfix preservado, sin series inventadas |
| Beneficios/lotes | Componentes, selección manual e individuales por lote |
| Integraciones | Sin secretos, estado honesto, no conexión simulada como real |
| Correo/WhatsApp | Borrador/preparado/confirmado diferenciados |
| CRM/documentos | Trazabilidad sin fabricar datos o enlaces privados |
| Academia | Profunda, editable, por rol, acciones visibles y contenido técnico aislado |
| Novedades | Historial, banner, lectura y vínculo con capacitación |
| PWA | Prompt nativo elegible y un listener |
| Responsive | Admin, shopper y cliente utilizables en desktop y móvil |
| Seguridad | 0 secretos, 0 datos TyA reales, 0 proveedores activados |

## 11. Gates de entrega

Claude debe ejecutar y reportar:

1. Delta exacto contra la V156 fuente única.
2. Lista completa de agregados, modificados y eliminados.
3. `node --check` de todo JS/MJS de la candidata: 0 errores.
4. Validación de `index.html`: scripts existentes, sin duplicados y orden correcto.
5. Manifest reproducible: 0 diferencias.
6. Gate comercial automatizado por 6 roles y todos sus módulos: 0 coincidencias.
7. Navegación directa al contenido técnico bloqueada para roles comerciales.
8. Smoke por rol: admin, shopper y cliente; consola y página sin errores críticos.
9. Prueba desktop y móvil de las rutas tocadas.
10. Confirmación de que no se tocó backend, tools, workflows, Firebase, TyA real ni integraciones reales.
11. Confirmación de que no se introdujeron secretos o datos sensibles.
12. Handoff y pendientes internos actualizados a la nueva versión, sin referencias obsoletas a V82.

## 12. Entregables esperados

Entregar:

- Una candidata ZIP completa, derivada únicamente de la V156 actual.
- Versión interna nueva y consecutiva; no reutilizar V156.
- Manifest de candidata y verificador.
- Build-lock de candidata.
- Reporte de corrección que coincida con el árbol real.
- Script y resultado del gate comercial reproducible.
- Lista exacta del delta.
- `RESUMEN-PARA-CLAUDE.md` actualizado.
- `PENDIENTES-PROTOTIPO.md` actualizado.
- `CAMBIOS-PROTOTIPO.md` o addendum actualizado.
- Matriz PASS/FAIL de esta aceptación.

No entregar ramas, PR, scripts PowerShell, instaladores, Firebase, bases de datos ni paquetes backend.

## 13. Regla final para Claude

Trabaja sobre la V156 actual y no reinicies el prototipo. Conserva todo lo ya cerrado. Corrige primero el gate comercial y la continuidad documental; después completa únicamente brechas comprobadas de los patrones acumulados. El resultado debe seguir siendo un SaaS genérico multi-tenant/multi-proyecto, sin TyA hardcodeado, listo para que ChatGPT audite el delta y lo empalme directamente con el backend y overlays existentes.
