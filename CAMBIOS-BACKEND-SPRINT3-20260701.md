# CAMBIOS-BACKEND-SPRINT3-20260701.md

Registro especifico de cambios Sprint 3. Mantener junto con CAMBIOS-BACKEND.md.

## 2026-07-01 - Cierre Sprint 2 documental

- ARCHIVO: SPRINT-2-CIERRE-DOCUMENTAL-20260701.md
- TIPO: nuevo
- QUE CAMBIO: se cerro documentalmente Sprint 2 con la validacion confirmada: fuente firestore, tenant tya, Auth DEV OK, proyecto cinepolis-abril-26, 1 proyecto visible, 34 visitas, 215 shoppers, 0 postulaciones, Guard CX.data OK y sin titileo.
- POR QUE: dejar evidencia persistente antes de avanzar a Sprint 3.
- IMPACTO EN FRONTEND: ninguno. No se tocaron app/modules ni UI.
- PENDIENTE/RIESGO: Claude debe corregir separacion Proyecto/Periodo/Pais/Historico en el prototipo sin tocar backend.

## 2026-07-01 - Backend Sprint 3 acciones operativas controladas

- ARCHIVO: app/core/backend-operational-actions.js
- TIPO: modificado
- QUE CAMBIO: se reemplazo el scaffold por una capa Sprint 3 de acciones operativas controladas. Agrega wrappers seguros para solicitar asignacion, reprogramacion, visita realizada, cuestionario, submitido/validado y cambio de estado de postulacion/aplicacion. No muta entidades finales; registra solicitud, evento, auditoria y responsibilityLog solo con preview DEV y aprobacion explicita.
- POR QUE: preparar escrituras DEV trazables sin activar acciones finales en UI.
- IMPACTO EN FRONTEND: ninguno directo. No se tocaron app/modules. Las funciones quedan expuestas para integracion futura, pero bloqueadas si no existe token DEV o flag explicito.
- PENDIENTE/RIESGO: ejecutar smoke DEV antes de conectar cualquier boton real.

## 2026-07-01 - Reglas Firestore Sprint 3 preparadas

- ARCHIVO: firestore.rules
- TIPO: modificado
- QUE CAMBIO: se agregaron reglas para operationActions, operationEvents, entityAuditTrail y operationActionLocks a nivel tenant. Se reforzo responsibilityLog de proyecto para exigir tenantId y projectId correctos en create.
- POR QUE: permitir trazabilidad de acciones operativas controladas en DEV.
- IMPACTO EN FRONTEND: ninguno.
- PENDIENTE/RIESGO: reglas modificadas en repo; no publicadas en Firebase DEV en este paso. Requieren autorizacion explicita antes de deploy solo rules DEV.

## 2026-07-01 - Smoke Sprint 3 preparado

- ARCHIVO: firebase/client-write-tools/smoke-cxorbia-sprint3-operation-actions-dev.mjs
- TIPO: nuevo
- QUE CAMBIO: se agrego smoke DEV con Auth ficticio para escribir solo documentos de log/control y leerlos despues. No modifica visitas, postulaciones, cuestionarios ni liquidaciones.
- POR QUE: validar reglas y trazabilidad antes de activar acciones finales.
- IMPACTO EN FRONTEND: ninguno.
- PENDIENTE/RIESGO: requiere CXORBIA_DEV_PASSWORD local y autorizacion exacta CXORBIA_SMOKE_SPRINT3_ACTIONS=YES_PAULA_SMOKE_SPRINT3_OPERATION_ACTIONS_DEV. No imprime secretos.

## 2026-07-01 - Plan Sprint 3

- ARCHIVO: SPRINT-3-ACCIONES-OPERATIVAS-CONTROLADAS-20260701.md
- TIPO: nuevo
- QUE CAMBIO: se documento el alcance, gates, restricciones y siguiente paso unico de Sprint 3.
- POR QUE: mantener metodologia de avance seguro y trazable.
- IMPACTO EN FRONTEND: ninguno.
- PENDIENTE/RIESGO: publicar reglas DEV y ejecutar smoke solo con autorizacion expresa.

## Restricciones respetadas

- No deploy.
- No Hosting.
- No produccion.
- No datos reales nuevos.
- No Orbit.
- No Orbia.
- No app/modules.
- UTF-8 sin BOM.
## 2026-07-01 - Resultado reglas DEV y smoke Sprint 3

- ARCHIVO: RESULTADO-SPRINT3-REGLAS-SMOKE-DEV.md
- TIPO: nuevo
- QUE CAMBIO: se documento la publicacion exclusiva de irestore.rules en Firebase DEV y la ejecucion exitosa del smoke Sprint 3.
- RESULTADO: smoke OK, modo write-log-only, 5 documentos de control/log creados, sin mutar entidades operativas finales.
- IMPACTO EN FRONTEND: ninguno. No se tocaron pp/modules ni se activaron acciones finales en UI.
- RESTRICCIONES: no Hosting, no produccion, no datos reales nuevos, no Orbit, no Orbia.
- SIGUIENTE GATE: preparar la primera mutacion DEV real de forma reversible y accion por accion, solo con autorizacion separada.
