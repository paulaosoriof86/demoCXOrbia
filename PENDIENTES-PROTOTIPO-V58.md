# CXOrbia - Pendientes prototipo V58 para Claude

Fecha: 2026-07-01
Base vigente de prototipo: Prototype development request CXOrbia V58.zip
Backend protegido: V57 en release/cxorbia-tya-rc-20260630

## Regla principal

Claude debe trabajar sobre V58 como prototipo mas reciente, sin usar versiones viejas y sin revertir backend V57.

No debe tocar backend V57, reglas Firestore, scripts Firebase, helpers locales ignorados, app/index-backend-dev.html ni archivos backend-config.

## Ya gestionado en V58 y debe preservarse

- PWA y service worker.
- Login white-label con logo y paises.
- Roles coordinador y aliado con alcance por pais.
- Manuales ampliados y core/manuales-data.js.
- Academia mas profunda.
- Recursos del proyecto y visor/generacion IA.
- IA multi-proveedor en CX.ai.
- Integraciones con estados mas honestos.
- Finanzas con CxC/CxP y pago por shopper.
- CRM 360 con propuestas, proyectos, cuentas y tareas.
- Importador con SheetJS y refinamiento.
- Documentacion interna nueva en app/docs.

## P0 pendientes criticos V58

1. README.md aun recomienda servidor Python. Debe corregirse a preview con Node.
2. modules/aprendizaje.js linea 100 contiene caracter corrupto. Corregir UTF-8 real desde origen.
3. modules/importador.js aun muestra texto de migracion TyA fija. CXOrbia debe ser generico y TyA debe quedar como plantilla/import especifico.
4. modules/importador.js conserva simulateAnalysis. Debe usar CX.ai.ask cuando haya configuracion, y fallback honesto cuando no exista.
5. core/data.js conserva Proyecto Banca y Cliente Banca demo. En tenant TyA no debe aparecer banca como proyecto/demo.
6. core/config.js conserva tema Esmeralda banca. Revisar para que no contamine tenant TyA.
7. V58 sigue usando localStorage como prototipo. Cuando backend este conectado, el badge debe mostrar Fuente firestore y Tenant tya, no localStorage/demo.
8. HR, movimientos, liquidaciones y beneficios reales deben entrar por backend/importador validado, no como semillas demo.

## Pendientes funcionales acumulados vigentes

- HR por proyecto con fuente externa/nativa/upload y write-back sin duplicar.
- HR Cinepolis/TyA con Disponible desde dinamico y reglas Q1/Q2.
- Importador financiero TyA GT/HN/liquidacion para movimientos, beneficios y lotes.
- Honorarios por pais desde configuracion, no hardcode.
- Boleto y combo como reembolsos operativos.
- Postulaciones: aprobar, rechazar, stand-by, solicitar ajuste, reprogramar, reasignar con buscador y notificaciones bidireccionales.
- Reservas/asignacion: visitas disponibles sin shopper, escenarios por periodo, cruce reserva/postulacion.
- Dashboard operativo: KPIs reales vs HR mapeada, historico comparativo y drill accionable.
- Finanzas: monedas por pais separadas; no sumar GTQ/HNL; historicos por mes.
- Certificaciones: banco real de preguntas, recertificacion y KPI con detalle.
- Ranking shoppers: top 5, promedio de dias cuestionario y criterios visibles.
- Mis beneficios: honorarios y reembolsos por shopper con detalle.
- Manuales/cursos editables con recursos embebidos.
- Soporte con bandeja viva y notificacion al solicitante.
- Portal cliente con reportes y recursos segun proyecto/tenant.

## Estado backend/gate que Claude debe respetar

- tenants/tya ya lee OK con admin TyA.
- tenants/tya/projects sigue NO OK en el ultimo smoke.
- Admin TyA queda denegado en tenants/otro: OK.
- Usuario externo queda denegado en tenants/tya: OK.
- El servidor Node local del ultimo bloque no quedo activo.
- Falta HTTP 200 y module render smoke.
- No cargar base TyA completa hasta cerrar gate.

## Entregables esperados de Claude en proxima version

- Prototipo V58 corregido sin revertir avances.
- README.md sin Python.
- UTF-8 corregido.
- Importador generico, no TyA fijo.
- IA/fallback honesto.
- Sin banca visible en tenant TyA.
- Sin localStorage/demo cuando backend indique Firestore.
- CAMBIOS-PROTOTIPO.md actualizado.
- PENDIENTES-PROTOTIPO.md actualizado.
- Lista de archivos tocados.
- Confirmacion de que no toco backend V57 ni helpers locales.

## 2026-07-01 00:45:35 - Estado backend observado desde smoke V58
- Admin lee tenants/tya: True.
- Admin projects access OK: True.
- Admin denegado en tenants/otro: True.
- Externo denegado en tenants/tya: True.
- Preview Node HTTP 200: True.
- DOM localStorage/demo: True.
- DOM banca: False.
- Si DOM muestra localStorage/demo o banca, sigue pendiente para Claude/prototipo, no para reglas.
## 2026-07-01 00:56:58 - NDA V58 corregido en prototipo aplicado
- Configuracion ya no debe mostrar un textarea unico basico de NDA.
- Debe mostrar editor por rol y version.
- Debe usar CX.confidencialidad.text/setText/version/auditLog.
- Revisar visualmente en Configuracion > NDA.