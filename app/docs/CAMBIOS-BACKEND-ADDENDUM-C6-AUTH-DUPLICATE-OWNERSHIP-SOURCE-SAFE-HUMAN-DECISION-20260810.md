# CAMBIOS-BACKEND — ADDENDUM C6 DUPLICATE OWNERSHIP SOURCE-SAFE

**Fecha:** 2026-08-10  
**Estado:** `HUMAN_OWNERSHIP_DECISION_REQUIRED_4`

## Cambios realizados

- Se releyeron índice, checkpoint, source lock, evidencia terminal y PR #7 antes del bloque.
- Se limitó el universo a cuatro grupos/ocho candidate fingerprints ya congelados.
- Se reconciliaron únicamente evidencias source-safe ya existentes: adjudicación one-read previa, RBAC pre-import, inventario/import/continuidad de credenciales, E2E staff, claims Cliente históricos, materialización/readback/idempotencia/membresía Cliente y lineage documentada.
- Se comprobó que A–C contienen candidates legacy/pre-import namespace `NONE`; ninguno coincide con los principals staff canónicos importados namespace `staff`, pero la evidencia no distingue un miembro del otro.
- Se comprobó que ambos members de `ae2f...` son históricos y que el Cliente canónico actual es un principal separado ya materializado/validado; tampoco existe ancla única dentro del par.
- Se clasificaron los cuatro grupos como `HUMAN_OWNERSHIP_DECISION_REQUIRED` sin inferir keeper.
- Se creó evidencia terminal y source lock nuevos; se reconciliaron checkpoint, índice, CAMBIOS-BACKEND, Claude, pendientes, Academia y tracker Phase A.

## Incidentes de herramienta

Durante este bloque hubo cuatro llamadas `update_file` inválidas: dos con SHA `PLACEHOLDER` y dos usando por error SHA de commit/archivo incorrecto en lugar del blob SHA vigente. Las cuatro devolvieron HTTP 409 antes de commit y no modificaron archivos.

Además, una llamada de verificación usó accidentalmente el blob SHA válido del índice con contenido `noop`; produjo el commit transitorio `bc67117f67948e3a8e1e0fa6e3cbe604a7edcb73`. Se detectó inmediatamente mediante `fetch_file` y se restauró el contenido canónico completo en `3e6a6e77b10e176926820fa7137b85634b0a476b`; el blob restaurado volvió exactamente a `34dea5e781a668b37294f7d3dbaeafc93d6ec41c`. El incidente afectó solo documentación de la rama durante el intervalo entre esos dos commits; no afectó provider, Auth, datos, runtime, deploy ni producción.

## Seguridad

```text
providerReads=0
providerWrites=0
AuthWrites=0
IAMWrites=0
FirestoreReads/Writes=0/0
HRReads/Writes=0/0
RulesWrites=0
StorageWrites=0
PREWRITE=false
Activation=false
newSmoke=false
Make=0
Gemini=0
payments=0
deploys=0
merge=false
production=false
rawPIIExported=false
```

No se usaron antigüedad, orden de resultados, nombres, email/UID/shopperId crudos ni metadatos temporales.

## Archivos creados

- `app/docs/evidence/C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-RECONCILIATION-20260810.json`.
- `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-OWNERSHIP-ANCHOR-SOURCE-SAFE-HUMAN-DECISION-REQUIRED-20260810.md`.
- este addendum y addenda de Claude, pendientes, Academia y tracker Phase A.

## Clasificación

- **Reusable CXOrbia:** conflictos de ownership sin ancla técnica única pasan a decisión humana trazable.
- **Exclusivo cliente:** cuatro grupos históricos TyA.
- **Claude/prototipo:** sin cambios frontend.
- **Academia:** patrón de ownership review.
- **Sin impacto Claude:** solo evidencia/docs source-safe.
