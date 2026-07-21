# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

Fecha: 2026-07-21
Estado: ACTIVO Y OBLIGATORIO

## Rama y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Producción: sin merge, sin deploy productivo y sin writes.
- Corte 1: abierto.
- Corte 2: bloqueado.

## Estado V172

- Candidata V172: SHA-256 `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.
- Empalme acumulado + HR in-place aplicado en `4f195b07a8cfc5962a7de6bd99d0c13915b847ad`.
- Los 14 archivos acumulados V165–V171 ya están en la rama.
- Backend/adapters in-place y Hosting DEV R22 están aplicados.
- Gate local HR in-place: PASS.
- Gate remoto `fresh=1`: HOLD por mapper R20, no por V172, caché, credencial ni cambio de HR.

## Causa raíz vigente

La HR configurada sigue siendo la misma: `HR Guatemala - Sincronizacion Google Sheets`.

La pestaña actual `JULIO 26` de Guatemala usa una firma compacta legítima:

- encabezado inicia con `CIUDAD`, `DIRECCIÓN`, `Shopping`;
- no contiene `País` ni `ID CINEMA`;
- contiene dos columnas exactas `Fecha submitido`.

`JULIO 26 HN` conserva la firma completa con `País` e `ID CINEMA`.

El mapper actual exige siempre `País + ID CINEMA + Shopping`; por eso falla con `header_not_found` antes de leer las filas GT.

## Corrección preparada

Paquete: `PAQUETE_EJECUCION_CODEX_CXORBIA_R20_HEADER_VARIANT_20260721.zip`

SHA-256: `371199c7790c181dbc8077aedcc4c22286146e17f116b58d2611e68b2ab7b899`

Modifica únicamente:

1. `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs`;
2. `backend/contracts/tya-hr-column-map-r20-v1.json`;
3. `tools/qa/tya-hr-header-variants-r20-gate.mjs`.

Política:

- firma `full_identity` para tabs completos;
- firma `tab_scoped_compact` para tabs sin País/ID CINEMA;
- país derivado solo del nombre exacto del tab;
- no inventar `ID CINEMA`;
- identidad mediante `hrRowId/sourceTab/sourceRow`;
- `Fecha submitido` duplicada se consolida solo si hay un valor o los valores coinciden;
- conflicto entre duplicados = HOLD.

## Método obligatorio

`RESOLVER HEAD_BEFORE → VERIFICAR ANCESTRO 4f195b0 → APLICAR PAQUETE EXACTO → COMMIT/PUSH ATÓMICO → GATES → DEPLOY CLOUD RUN DEV MEDIANTE WORKFLOW YA AUTORIZADO → GATE REMOTO fresh=1 → VALIDACIÓN VISUAL IN-PLACE`

No reempalmar V172, no Claude, no nueva candidata, no cambiar HR/ID/tabs, no parchear UI, no crear workflows y no pedir autenticación manual a Paula.

## Fuente vigente

- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/DIAGNOSTICO-RAIZ-R20-HEADER-VARIANT-JULIO26-20260721.md`;
- PR #7.