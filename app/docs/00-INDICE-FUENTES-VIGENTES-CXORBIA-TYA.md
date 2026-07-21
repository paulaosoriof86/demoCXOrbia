# 00 - INDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-21
Estado: ACTIVO Y OBLIGATORIO

- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- V161C/R21 continúa como baseline activa hasta aprobación visual.
- V164 y Corte 1A están integrados.
- HR viva read-only confirmada con cambios reales.
- Cloud Run DEV y Hosting DEV desplegados.
- Último deploy de refresco rápido: run `29799752544`, job `88538293485`, artefacto `8483321397`.
- Candidata acumulada V171b auditada: SHA-256 `e655ea88950c8485a497b52b3870c9b18ebef98181e1662993ef496efc17d4e2`.
- V171b preserva las mejoras de V170 y corrige estáticamente sus siete P0 principales.
- Decisión V171b: `HOLD — P0_PROVEN_SHOPPER_IDENTITY_FAIL_OPEN`; no aplicada.
- P0 vigente: `misvisitas`, `reservas`, `midia` y fallback demo de `app.js` no fallan cerrados cuando falta `shopperId`.
- Fuentes vinculantes actuales:
  - `AUDITORIA-CANDIDATA-V171B-CORTE1B-20260721.md`;
  - `PAQUETE-CORRECCION-CLAUDE-V171B-CORTE1B-20260721.md`;
  - `RESUMEN-PARA-CLAUDE-ADDENDUM-V171B-HOLD-20260721.md`;
  - `PENDIENTES-PROTOTIPO-ADDENDUM-V171B-HOLD-20260721.md`;
  - `CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V171B-CORTE1B-20260721.md`.

Lectura obligatoria: reglas maestras, plan Phase A, addendum de empalme, checkpoint vigente, auditoría V171b, paquete de corrección V171b, CAMBIOS, resumen, pendientes, Academia y PR #7.

Siguiente acción exacta:

`CANDIDATA V171B CORREGIDA → EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA → GO: APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`

Corte 2 continúa bloqueado.