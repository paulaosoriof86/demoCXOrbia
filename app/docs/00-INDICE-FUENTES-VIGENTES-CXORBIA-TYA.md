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
- V171b permanece no aplicada por el P0 Shopper documentado.
- Candidata V172 recibida: SHA-256 `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.
- Estado V172: `EMPALMED_PENDING_POST_GATES`.
- La declaración GO emitida fuera del carril quedó invalidada, pero el carril file-aware fue restablecido en checkout local autenticado.
- No existe empalme parcial: los objetos blob/tree creados durante el desvío no fueron asociados a commit ni a la rama.
- Fuente vigente: `MANIFEST-V172-EMPALME-DIRECTO-20260721.json` y checkpoint operativo vigente.
- Fuente de trazabilidad invalidada: `AUDITORIA-CANDIDATA-V172-CORTE1B-20260721.md`.

Lectura obligatoria: reglas maestras, addendum canónico de empalme file-aware, plan Phase A, checkpoint vigente, preflight V172, CAMBIOS, resumen, pendientes, Academia y PR #7.

## Método obligatorio

`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO: APPLY_DELTA_DIRECTLY → COMMIT/PUSH ATÓMICO → POST-GATES → VALIDACIÓN VISUAL → FREEZE`

No Contents API archivo por archivo, blobs/trees, workflow transportador, nueva rama/PR, nueva candidata ni trabajo manual para Paula.

## Siguiente acción exacta

`POST-GATES V172 → HOSTING DEV → VALIDACIÓN VISUAL PAULA → FREEZE CORTE 1 SOLO CON APROBADO`

Corte 2 continúa bloqueado.
