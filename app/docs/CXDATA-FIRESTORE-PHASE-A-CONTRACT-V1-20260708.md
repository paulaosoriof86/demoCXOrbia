# CX.data Firestore Phase A Contract v1

Fecha: 2026-07-08  
Bloque: contrato backend para futura conexion CX.data -> Firestore  
Estado: creado, no conectado, seguro.

## 1. Objetivo

Avanzar el backend real sin bloquearse por el problema de hosting visual.

Este bloque define el contrato para reemplazar localStorage por Firestore limpio manteniendo la misma interfaz `CX.data`, sin tocar modulos UI y sin conectar una base vieja.

## 2. Archivos creados

- `backend/contracts/cxdata-firestore-phase-a-v1.json`
- `backend/adapters/firebase-cxdata-adapter.preview.mjs`
- `tools/release/tya-cxdata-firestore-contract-validate.mjs`
- `app/docs/CXDATA-FIRESTORE-PHASE-A-CONTRACT-V1-20260708.md`

## 3. Estado seguro

El adapter queda como preview backend-side y no esta importado por `app/index.html`.

No conecta frontend. No escribe. No importa. No activa providers. No toca Firestore/Auth/Storage reales.

## 4. Llaves obligatorias

Identity:

- tenantId;
- projectId;
- entityType;
- entityId.

Sync HR/plataforma:

- tenantId;
- projectId;
- visitId;
- hrRowId;
- shopperId;
- assignmentSource;
- assignmentSyncStatus;
- lastSyncedAt.

## 5. Colecciones Phase A definidas

- tenants;
- projects;
- visits;
- assignments;
- shoppers;
- applications;
- certifications;
- liquidations;
- hrImports;
- conflictReviews;
- outbox;
- auditLog.

## 6. Interfaz CX.data preservada

Metodos minimos:

- get;
- set;
- remove;
- list;
- upsert;
- seed;
- export.

Los modulos deben seguir llamando `CX.data` igual que hoy. El cambio futuro debe quedar detras de la fachada, no dentro de cada modulo.

## 7. Gates

- DEV read-only: permitido solo despues de revisar config/reglas.
- DEV writes: bloqueado hasta GO explicito y rollback.
- Staging import: bloqueado hasta candidato sanitizado y conflicto revisado.
- Production cutover: bloqueado hasta GO explicito de Paula, smoke, rollback y sin NO GO critico.

## 8. Clasificacion obligatoria

- Reusable CXOrbia: si. Contrato reusable para clientes futuros.
- Exclusivo cliente: parcial. Contiene prioridades Phase A TyA, pero el patron es reusable.
- Claude/prototipo: si. Claude debe saber que la UI no debe cambiar interfaz CX.data.
- Academia: sin cambio directo de UI, pero impacta contenido de Academia tecnica/admin futura.
- Sin impacto Claude: no. Debe ir en paquete Claude/backend replicable.

## 9. Estado final del bloque

- Sin deploy.
- Sin produccion.
- Sin merge final.
- Sin import real.
- Sin pagos reales.
- Sin provider real.
- Sin Firestore/Auth/Storage real.
- Sin HR writes.
- Sin Make/Gemini real.
- Sin datos sensibles.
