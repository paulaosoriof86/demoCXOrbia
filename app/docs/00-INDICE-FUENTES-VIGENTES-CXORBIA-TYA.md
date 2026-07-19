# 00 - INDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-19
Estado: ACTIVO Y OBLIGATORIO

## Lectura obligatoria

1. Reglas maestras y continuidad.
2. Addendum de empalme directo y carril file-aware.
3. Addenda de Academia, patrones reutilizables y antidesvio.
4. Plan Phase A sin desviacion.
5. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
6. Contratos R20/R21, CAMBIOS, RESUMEN-PARA-CLAUDE, PENDIENTES, tracker y PR #7.

## Estado vigente

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- V161C aplicada por carril file-aware.
- Estado: `EMPALMED_PENDING_POST_GATES`.
- HEAD_BEFORE: `d640b1119e373e303f188bfd87758221ef3b9fae`.
- Manifest: `app/docs/MANIFEST-V161C-EMPALME-DIRECTO-20260719.json`.
- Build lock: `app/core/build-lock.js`.
- Verificador: `tools/release/tya-v161c-empalme-directo-verify.mjs`.
- No publicar Hosting DEV sin autorizacion separada.

## Evidencia funcional vigente

- Corte activo: `CORTE 0B - MOTOR CANONICO HISTORICO + TENANT/LOGIN`.
- V161C corrige delta frontend localizado R21.
- Se preservan proyecto/periodo, historia, source-safe, TyA multi-proyecto y `CX.data`.

## Carril

`EXECUTION_LANE_READY -> APPLY_DELTA_DIRECTLY -> COMMIT/PUSH -> POST-GATES -> VALIDACION VISUAL -> FREEZE`

Siguiente accion: post-gates R21 sobre el mismo HEAD/build. No iniciar Corte 1 antes de validacion visual y freeze de Corte 0B.
