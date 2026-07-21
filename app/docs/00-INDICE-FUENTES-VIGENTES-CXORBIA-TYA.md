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
- V171b permanece no aplicada; su P0 Shopper fue corregido por V172.
- Candidata V172: SHA-256 `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.
- Auditoría focalizada V172: `AUDITED_GO_READY_DIRECT_APPLY`.
- 67 JS sintaxis PASS; 73 referencias locales PASS; 18 hashes/bytes PASS; gate Shopper A/B/sin identidad PASS.
- No existe P0 nuevo reproducible.
- El supuesto bloqueo de checkout queda retractado como desvío metodológico.
- Fuente vigente: `AUDITORIA-CANDIDATA-V172-CORTE1B-20260721.md`.

Lectura obligatoria: reglas maestras, plan Phase A, addendum de empalme, checkpoint vigente, auditoría V172, CAMBIOS, resumen, pendientes, Academia y PR #7.

Siguiente acción exacta:

`APPLY_DELTA_DIRECTLY V172 SOBRE docs-tya-v6-v71-audit → COMMIT/PUSH ATÓMICO → MANIFEST/BUILD-LOCK/VERIFICADOR → POST-GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`

Corte 2 continúa bloqueado.