# HANDOFF NUEVA CONVERSACION CXORBIA BACKEND 20260701

## Estado actual confirmado

Proyecto: CXOrbia backend y migracion a produccion.
Repo: paulaosoriof86/demoCXOrbia.
Rama canonica: release/cxorbia-tya-rc-20260630.
Repo local canonico de Paula: C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia-rc-20260630.
No usar repo antiguo C:\Users\paula\OneDrive\Documentos\GitHub\demoCXOrbia.
No tocar Orbit ni Orbia.

## Reglas fijas

- El prototipo manda.
- No tocar app/modules para resolver backend.
- No tocar UI salvo aplicacion autorizada de ZIP de Claude.
- Backend solo en app/core/backend*.js, index-backend-dev.html, Firebase, reglas, seeds, validadores y docs.
- No deploy, no Hosting, no produccion y no datos reales sin autorizacion explicita.
- UTF-8 sin BOM.
- Documentar todo.
- PowerShell solo si es indispensable, en bloque unico, con reporte y Chrome como navegador visual.

## Base prototipo

V63 ya fue aplicada y subida a GitHub preservando backend.
Sprint 0 cerrado.
Sprint 1 cerrado: preview backend V63 abre con Firestore DEV, tenant tya, Auth DEV y badge estable.
Sprint 2 en cierre: adapter Firestore ya entrega proyecto activo antes del render y separa metadatos historicos.

## Backend actual

Archivos clave:

- app/index-backend-dev.html
- app/core/backend-config.js
- app/core/backend-config-preview-dev.js
- app/core/backend-firebase.js
- app/core/backend-cxdata-read-guard.js
- app/core/backend-preview-status.js
- app/core/backend-v57-extra-config.js
- app/core/backend-operational-actions.js
- app/core/backend-finance-benefits.js
- app/core/backend-cxdata-finance-read.js
- app/core/backend-bulletins.js
- app/core/backend-automations.js

## Validaciones recientes

Preview local Chrome:

- Fuente: firestore.
- Tenant: tya.
- Auth DEV: OK.
- Proyecto: cinepolis-abril-26.
- Proyectos visibles: 1.
- Visitas visibles: 34.
- Shoppers: 215.
- Postulaciones: 0.
- Guard CX.data: ok.
- Sin titileo luego de mover el alcance al adapter antes del render.

## Incidencia aprendida

No filtrar proyecto/periodo despues del render. Eso causo varios estados visuales sucesivos y titileo. El alcance debe resolverse dentro del adapter Firestore antes de entregar datos a CX.data.

## Pendiente para Claude

Claude debe corregir prototipo para separar Proyecto, Periodo, Pais e Historico.
Proyecto no es mes. Periodo debe ir en control separado. Historico debe poder consultarse, no mezclarse con operacion activa.
Documento entregable preparado: PAQUETE-COMPLETO-PARA-CLAUDE-CXORBIA-V63-V64.md.

## Metodologia agil acordada

Cuando Claude entregue un nuevo ZIP:

1. Adjuntar ZIP.
2. Pedir: Audita y aplica VXX por fast-track GitHub preservando backend protegido.
3. ChatGPT audita el ZIP, aplica solo archivos permitidos en GitHub, preserva backend y documenta.
4. PowerShell solo para preview visual local o Firebase CLI.

## Siguiente paso backend

Cerrar formalmente Sprint 2 y avanzar a Sprint 3:

Sprint 3: acciones operativas controladas y responsibilityLog.
Objetivo: preparar escrituras controladas DEV con trazabilidad sin tocar modulos UI.

Primeras acciones candidatas:

- asignar visita;
- reprogramar visita;
- marcar realizada;
- marcar cuestionario;
- marcar submitido/validada;
- cambiar estado de postulacion;
- registrar responsabilidad en responsibilityLog.

No activar escrituras finales en UI sin smoke DEV y validacion.
