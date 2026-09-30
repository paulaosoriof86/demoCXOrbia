# Sprint 2 - Cierre documental backend CXOrbia

Fecha: 2026-07-01
Repo: paulaosoriof86/demoCXOrbia
Rama: release/cxorbia-tya-rc-20260630
Alcance: backend DEV, sin deploy, sin Hosting, sin produccion, sin Orbit, sin Orbia y sin datos reales nuevos.

## Estado confirmado

Sprint 2 queda cerrado documentalmente porque el adapter Firestore ya entrega el alcance operativo antes del primer render.

Validacion visual reportada en Chrome:

- Fuente: firestore.
- Tenant: tya.
- Auth DEV: OK.
- Proyecto activo visible: cinepolis-abril-26.
- Proyectos visibles: 1.
- Visitas visibles: 34.
- Shoppers: 215.
- Postulaciones: 0.
- Guard CX.data: ok.
- Sin titileo.

## Decision tecnica cerrada

El filtro de proyecto, periodo e historico no debe ejecutarse despues del render.

Motivo:

- El filtrado post-render causo estados visuales sucesivos y titileo.
- El adapter debe resolver el alcance antes de entregar datos a CX.data.
- CX.data debe recibir un estado ya estabilizado para que los modulos existentes no tengan que cambiar.

## Archivos backend relacionados

- app/core/backend-firebase.js
- app/core/backend-cxdata-read-guard.js
- app/core/backend-preview-status.js
- app/index-backend-dev.html

## Responsabilidad de Claude/prototipo

Claude debe corregir en el frontend la separacion conceptual entre Proyecto, Periodo, Pais e Historico.

No corresponde a backend ocultar meses como proyectos despues del render.

## Resultado

Sprint 2: cerrado.

Siguiente sprint: Sprint 3 - acciones operativas controladas y responsibilityLog.

## Restricciones mantenidas

- No se hizo deploy.
- No se publico Hosting.
- No se toco produccion.
- No se agregaron datos reales nuevos.
- No se tocaron app/modules.
- No se mezclo Orbit ni Orbia.
- Se mantiene UTF-8 sin BOM.
