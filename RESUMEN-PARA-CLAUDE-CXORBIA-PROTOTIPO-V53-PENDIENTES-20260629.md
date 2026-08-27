# RESUMEN PARA CLAUDE — CXOrbia Prototipo V53 — Pendientes priorizados

Fecha: 2026-06-29

## Regla de trabajo

No tocar backend, Firebase, reglas, migraciones ni scripts. No hacer merge directo. Trabajar por lotes verificables. Conservar UTF-8. No presentar como terminado algo que sea solamente UI, toast, memoria local o demo.

## Estado general V53

V53 mejora visualmente Configuración, Integraciones, Automatizaciones, IA, login white-label, PWA, manuales y filtros shopper. Aun así no debe considerarse completo para producción porque varias funciones siguen dependiendo de estado local, simulación, catálogos visuales o mensajes de éxito sin persistencia real.

## P0 — Configuración real

Configuración se ve completa, pero todavía no funciona como centro administrativo real. Debe persistir por tenant y proyecto, con auditoría y permisos.

Debe separarse en tenantConfig, projectConfig, brandConfig, moduleConfig, countryConfig, ndaConfig, hrConfig, financeConfig, integrationsConfig, automationConfig y collaboratorPermissions.

No debe depender de almacenamiento local para producción. Debe usar interfaz estable y backend adapter. Debe guardar quién cambió, cuándo, qué cambió, antes/después sanitizado, proyecto, país y tenant. Si algo no persiste, debe mostrarse como preview o demo.

## P0/P1 — Integraciones & Add-ons

El catálogo amplio no equivale a integración real. Cada integración debe distinguir disponible, configurada, validada, activa, fallando, revocada y deshabilitada.

Cada integración necesita configuración pública sanitizada, referencia segura a credenciales, último test, último estado, último error, scopes, auditoría, usuario que configuró y dependencia de plan.

Probar conexión debe hacer una prueba real o decir simulación. Si no hay backend seguro, no decir conexión probada.

Prioridad: Google Sheets/Excel Online, Drive/Storage, Make/Zapier/n8n, WhatsApp, Outlook/Gmail/IMAP e IA multi-proveedor.

## P0/P1 — Automatizaciones reales

La consola visual debe registrar ejecuciones reales. No basta con fire local, toast o log local.

Debe existir automationRules y automationRuns con payload sanitizado, status, respuesta, error, reintentos, usuario origen, projectId, visitId, shopperId y countryScope.

Eventos mínimos: agenda, reprog, realizada, cuestionario, submit, pago_programado, pago_realizado, fuera_rango, pendiente_cuestionario e integracion_error.

Debe distinguir prueba, simulación, envío real, fallo, retry y skipped.

## P0 — Shopper data isolation

V53 reporta que Mis Visitas y Mis Beneficios filtran por shopperId. Debe validarse con datos reales DEV.

Validar que no exista fallback inseguro a todas las visitas. Los botones deben operar solo sobre visitas del shopper. Cada visita y beneficio debe tener shopperId canónico. Los aliases son solo histórico, no permisos.

Pruebas: Shopper A no ve ni acciona datos de Shopper B; shopper sin visitas no recibe datos ajenos; admin ve todo según rol.

## P1 — Roles coordinador / aliado

Los roles declarados con scopeCountry no están completos. Falta asignar países por usuario, filtrar proyectos, HR, visitas, shoppers, postulaciones, beneficios, finanzas y reportes por país. Debe auditarse cada acción.

## P1 — Creación de proyectos

Crear proyecto debe generar una estructura operativa completa: tenant, cliente/cuenta, campaña, países, monedas, periodicidad, periodos, escenarios, reglas, evidencias, cuestionario, certificación, HR, finanzas, automatizaciones, colaboradores, importación inicial, sync viva, dedupe, preview y conflictos.

Debe alimentar projects.hrConfig, projects.financeConfig, projectConfig, collaborators, automationRules e integration states.

## P1 — HR viva

La HR no es solo importación histórica. Debe soportar Google Sheets, Excel Online, upload manual, plantilla nativa, sync incremental, write-back, import batches, sync runs, conflictos, preview, dedupe, reintentos y auditoría.

Si HR y plataforma difieren en shopper, fecha, estado, submit, cuestionario, país, periodo o sucursal, no sobrescribir silenciosamente: crear conflicto.

## P1 — Importador real desde UI

No debe prometer importación completada si solo hay toast o evento local. Debe distinguir preview, dry-run e import real; mostrar conteos buenos, duplicados, conflictos, ignorados y errores; generar importBatch; permitir descargar reporte; resolver conflictos; integrar con backend pipeline.

## P1 — Finanzas profundo

La mejora CxC/CxP es avance UI, pero no reemplaza el modelo backend: financialMovements, shopperBenefits, paymentLots, reconciliations y franchiseReimbursements.

Debe separar beneficio calculado vs pago real, honorarios vs reembolsos, ingresos de consultora vs pagos a shoppers, país, moneda, histórico pendiente y reconciliación.

## P1 — Storage / evidencias / logos / documentos

Storage sigue pendiente. Debe soportar evidencias por visita, fotos, videos, audios, documentos, logo, documentos generados, NDA, manuales e instructivos. Debe segmentarse por tenant/proyecto/visita/shopper y no guardar archivos pesados en Firestore.

## P1/P2 — Academia y manuales

V53 agrega manuales, pero falta persistencia, versionado, publicación por rol, progreso, quizzes, certificaciones, recursos embebidos, lectura obligatoria y relación con proyecto.

## P1 — Certificaciones

Las certificaciones no vienen de HR. Deben migrarse desde BD actual u otra fuente confiable, con intentos, calificación, vigencia, bloqueo/desbloqueo de visitas y relación con instructivo.

## P1 — Postulaciones y sincronía

Todos los botones deben funcionar y pasar por método persistible: aprobar, rechazar, asignar, reprogramar, autorizar, cancelar, marcar realizada, marcar cuestionario y submit. Debe sincronizar HR/plataforma, auditar y evitar duplicados.

## P1/P2 — CRM Comercial

Completar clientes/cuentas, contactos, propuestas, costos, pipeline, proyectos vinculados, cuentas CRM bidireccionales, historial, documentos, correos e integraciones de marketing.

## P2 — PWA / white-label

Validar service worker, cache, favicon desde Storage, instalación en Chrome/Edge/Android/iOS, logo en login/topbar/propuestas/documentos, países configurados y crédito CXOrbia.

## Mensajes de UI

Cambiar mensajes que prometen guardado, importación, conexión, sincronización o envío si solo son simulación. Usar estados claros: preview, simulación, guardado local, pendiente de backend, validado, activo o fallido.

## Lotes recomendados

Lote A: validar P0 shopper, chips de países, manuales, PWA y white-label.

Lote B: trabajar Configuración, Integraciones, Automatizaciones, Usuarios/Permisos, roles y CxC/CxP como UI avanzada, sin marcarlos terminados.

Lote C: no aplicar sin backend seguro: credenciales reales, OAuth, webhooks reales, Storage/evidencias, open banking, facturación, HR viva con write-back y pagos reales.

## Checklist mínimo

Carga sin errores, sin mojibake, login funciona, admin navega, shopper no ve datos ajenos, Configuración no promete guardado falso, Integraciones no prometen conexión falsa, Automatizaciones no prometen envío falso, Finanzas no mezcla pago real con beneficio calculado, HR no sobrescribe sin preview, no se toca backend protegido, no producción, no merge directo, todo documentado.

## Instrucción directa para Claude

Prioriza profundidad sobre velocidad. V53 se ve mucho mejor, pero todavía hay funciones UI/demo. No marques Configuración, Integraciones ni Automatizaciones como terminadas hasta que tengan persistencia real, estados reales, auditoría, permisos y conexión backend mediante interfaz estable. No ocultes pendientes detrás de mensajes de éxito.
