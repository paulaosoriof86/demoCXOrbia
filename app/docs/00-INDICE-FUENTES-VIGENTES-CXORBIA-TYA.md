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
- V171b permanece `HOLD — P0_PROVEN_SHOPPER_IDENTITY_FAIL_OPEN`; no aplicada.
- Candidata corregida V172 recibida y extraída.
- SHA-256 V172: `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.
- V172 contiene 261 entradas y un delta exacto de 8 archivos frente a V171b: cuatro archivos funcionales autorizados, `REPORTE-DE-CAMBIOS` y manifiestos/inventario.
- Estado V172: `EXECUTION_LANE_NOT_READY`; no se declara auditoría, GO ni HOLD porque falta checkout autenticado de la rama viva en el mismo workspace.
- Fuente vigente adicional: `PREFLIGHT-CANDIDATA-V172-EXECUTION-LANE-NOT-READY-20260721.md`.

Lectura obligatoria: reglas maestras, plan Phase A, addendum de empalme, checkpoint vigente, preflight V172, auditoría/paquete V171b, CAMBIOS, resumen, pendientes, Academia y PR #7.

Siguiente acción exacta:

`RESTABLECER WORKSPACE FILE-AWARE CON CHECKOUT AUTENTICADO → EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA V172 → GO: APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`

Corte 2 continúa bloqueado.