# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

Fecha: 2026-07-21
Estado: `CORTE_1B_R20_HEADER_VARIANT_FIX_READY`

## Estado comprobado

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Commit operativo V172 + HR in-place: `4f195b07a8cfc5962a7de6bd99d0c13915b847ad`.
- Los 14 archivos acumulados V165–V171 ya están aplicados.
- Backend/adapters in-place y Hosting DEV R22 ya están aplicados.
- Cloud Run DEV sigue ejecutando el mapper anterior porque el deploy local quedó bloqueado por falta de sesión gcloud.
- Corte 1: abierto.
- Corte 2: bloqueado.

## Gate remoto actual

```text
/api/tya/cinepolis/hr-live?format=meta&fresh=1
HTTP 503
live_hr_read_failed
R20 HR mapping HOLD: header_not_found en tab JULIO 26
```

El HOLD es correcto y evita publicar un snapshot incompleto.

## Causa raíz exacta

La HR vigente es la misma configurada desde el inicio.

`JULIO 26` GT tiene una variante compacta:

- empieza en `CIUDAD`, `DIRECCIÓN`, `Shopping`;
- no incluye `País` ni `ID CINEMA`;
- repite dos veces `Fecha submitido`.

`JULIO 26 HN` conserva la variante completa con `País` e `ID CINEMA`.

El mapper R20 actual:

- reconoce encabezado solo si existe `País`;
- acepta filas solo si existen País + Shopping + ID CINEMA;
- marca País e ID CINEMA como críticos sin excepción contextual;
- rechazaría la duplicidad exacta de `Fecha submitido`.

## Corrección preparada

Paquete:

`PAQUETE_EJECUCION_CODEX_CXORBIA_R20_HEADER_VARIANT_20260721.zip`

SHA-256:

`371199c7790c181dbc8077aedcc4c22286146e17f116b58d2611e68b2ab7b899`

Delta permitido:

1. `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs`;
2. `backend/contracts/tya-hr-column-map-r20-v1.json`;
3. `tools/qa/tya-hr-header-variants-r20-gate.mjs`;
4. documentación operativa.

No se modifican frontend, adapters in-place, server, HR, ID de hoja, tabs, Hosting ni producción.

## Política de mapping

- `full_identity`: País e ID CINEMA desde columnas.
- `tab_scoped_compact`: país desde nombre validado del tab; ID CINEMA nulo.
- La identidad se mantiene con `hrRowId/sourceTab/sourceRow`; nunca solo por nombre visual.
- Duplicados de `Fecha submitido`:
  - un solo valor → usarlo;
  - valores iguales → consolidar;
  - valores distintos → HOLD crítico.

## Evidencia obligatoria después del deploy

- `fresh=1`: HTTP 200 y `cacheOrigin=runtime_refresh`.
- `JULIO 26`: `headerVariant=tab_scoped_compact`.
- `JULIO 26 HN`: `headerVariant=full_identity`.
- JUL 2026: 34 visitas GT + 10 HN.
- Cero `header_not_found`, `column_ambiguous` y `duplicate_column_conflict`.
- `JULIO 26!7` refleja cuestionario confirmado y deja de aparecer en `Cuest. pendiente`.
- Sin `location.reload()`, pantalla blanca o estado degradado.
- Misma `sourceRevision` en Dashboard, Liquidaciones, Reportes Admin y Reportes Cliente.

## Ejecución

Codex debe aplicar el paquete exacto y hacer un commit/push atómico. Para Cloud Run DEV debe usar únicamente el workflow temporal ya autorizado que produjo los despliegues R22 anteriores; no debe crear/modificar workflows ni pedir autenticación manual a Paula.

## Siguiente bloque exacto

`CODEX APLICA PAQUETE → COMMIT/PUSH → WORKFLOW DEV EXISTENTE DESPLIEGA CLOUD RUN → GATE REMOTO fresh=1 → VALIDACIÓN VISUAL ADMIN/CLIENTE/SHOPPER`

## Estado seguro

Sin merge, producción, importación real, writes Firestore/Auth/Storage/HR, Make/Gemini ni pagos.