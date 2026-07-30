# RESUMEN PARA CLAUDE — Corte 5 CX.data period model PASS

Fecha: 2026-07-30

## Decisión
`P0_C5_CXDATA_PERIOD_MODEL_MISMATCH` queda técnicamente resuelto.

No requiere nueva candidata frontend.

## Qué no se debe reabrir
- Corte 3 V182 FROZEN.
- R17N DEV 1,406/1,406 writes y 1,406/1,406 readback PASS.
- Provider/identity compare PASS.
- Backend canónico `cxorbia-backend-dev`.
- Proyecto padre `cinepolis` con 14 periodos canónicos, 616 visitas, 572 controles y 77 certificaciones.
- 616 visitas con identidad real y target shopper existente.

## Fix backend
`app/core/backend-firebase.js`, commit `96cb7601559a76595d6203724a4bcf2d0b35b390`:
- periodos se leen desde `projects/<projectId>/periods`;
- no se derivan de los project docs raíz;
- currentPeriodId se valida contra los IDs canónicos.

Re-smoke read-only final `30544595440`:
- source=firestore;
- fallback=false;
- projects=1;
- periods=14;
- visits=616;
- currentProjectId=cinepolis;
- currentPeriodId=2026-07;
- period IDs exactos;
- interfaz CX.data preservada;
- blockers 0.

## Claude no debe hacer
- no crear V183/R33;
- no tocar selector/módulos para compensar el backend;
- no volver a mes=proyecto;
- no inventar/duplicar periodos;
- no tocar datos Firestore;
- no deduplicar shoppers por nombre;
- no activar Auth/Make/Gemini/pagos.

## Próxima validación
Backend hará binding DEV read-only al backend canónico y un único Hosting DEV controlado, con autorización separada. Solo si la validación visual demuestra un P0 frontend reproducible se genera una tarea localizada para Claude.

## Academia
Actualizar proyecto padre vs periodo, provider readback vs runtime consumer, identidad real/source-safe y liquidación ≠ pago.
