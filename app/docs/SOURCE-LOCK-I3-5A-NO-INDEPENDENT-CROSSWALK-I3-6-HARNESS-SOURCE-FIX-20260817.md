# SOURCE LOCK — I3.5A EXACT CROSSWALK SOURCE HUNT · I3.6 HARNESS SOURCE FIX

**Fecha:** 2026-08-17 15:03 -06:00  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**Estado:** `I3_5_PROVIDER_BACKED_CROSSWALK_MATERIALIZATION_REQUIRED__I3_6_FROZEN_PRODUCT_PASS_HARNESS_SOURCE_FIXED__NO_REPROCESS__NO_PROVIDER_WRITE`

## 1. Decisión prevalente

El source-hunt I3.5A se completó sin encontrar en repo/contratos una autoridad independiente y materializada que vincule de forma exacta el target HR de agosto con el Shopper canónico.

La evidencia runtime previa sigue vigente:

- live source-safe id: `shp-57d2e3769946`;
- canonical esperado por evidencia previa: `TYA_GT_0C0BA8856E`;
- `targetCanonicalActual=null`;
- 2 visitas agosto residuales bajo el live id;
- 0 visitas agosto bajo el canonical;
- review reason `no_exact_hr_crosswalk`.

El `shp-*` y `shopperCode` derivados de texto HR no constituyen ancla técnica independiente y no pueden promoverse a crosswalk canónico.

## 2. Source hunt

Se revisaron contratos/provider plans existentes con foco en identidad/crosswalk. El contrato `phase-a-hr-source-safe-to-protected-candidates-v1` define `shopperIdentityLinkCandidates` hacia `tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}`, pero su `writeStatus` es `not_written`, con writes/import/production apagados.

El contrato `c6-shopper-deterministic-suffix-v1` permite linking por `direct_shopper_id` o `exact_technical_anchor` y mantiene provider revalidation pending. No contiene un mapa materializado para el target agosto.

Búsquedas de `shopperIdentityLinks`, `shopperIdentityLinkCandidates`, `canonicalShopperId`, `identityLink`, `linkedSourceResolutionMode` y el canonical target no localizaron una fuente materializada independiente en repo que pueda reutilizarse sin provider adjudication/materialization.

Conclusión: no existe base suficiente para resolver I3.5 source-only sin inventar identidad. El siguiente paso correcto es provider-backed exact validation/materialization bajo gate específico y fail-closed.

## 3. I3.6 harness source fix

Archivo tocado únicamente:
`tools/qa/tya-i3-staff-authority-readonly.mjs`.

Commit funcional source-only:
`84d26871c6f0cff96eaa84a8789d78b462e190ee`.

Se añadió `ensureFrozenSource(sha)` para:

1. verificar si el commit congelado existe en el checkout;
2. si falta por shallow checkout, hacer `git fetch --no-tags --depth=1 origin <frozen_sha>`;
3. validar que el commit ya sea resoluble antes de comparar blobs.

No se toca ni autentica al Shopper histórico. No se modifica producto, frontend, core, HR ni Finance.

Combined status del commit fuente: `cxorbia/c6-skip13-auth-access-adjudication/overall = success`, run `32069217043`.

I3.6 continúa congelado como PASS de producto/evidencia; esta corrección elimina el defecto de harness. No se repite login/recovery/reset histórico.

## 4. Progreso

Formal permanece:

- I1 `15/15 PASS`;
- I2 `20/20 PASS`;
- I3 `0/25` hasta I3.11;
- I4 `0/25`;
- I5 `0/15`.

**GO-LIVE formal: 35% / 65%.**

Estado operativo I3:

- I3.1 PASS;
- I3.2 PASS;
- I3.3 PASS;
- I3.4 PASS;
- I3.5 bloqueado únicamente por crosswalk exacto provider-backed faltante;
- I3.6 producto/evidencia PASS + harness source fixed;
- I3.7 PASS;
- I3.8→I3.11 pendientes.

El porcentaje formal no refleja puntos parciales por diseño; no significa cero avance.

## 5. Siguiente acción exacta

`I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET`.

Gate requerido:

1. alcance exclusivo TyA/Cinépolis y el único target técnico de agosto;
2. primero provider read/validation para demostrar una autoridad técnica exacta independiente;
3. si la autoridad exacta NO se demuestra: STOP, cero writes;
4. si se demuestra: máximo una materialización/actualización exacta de `shopperIdentityLinks` necesaria para el target, seguida de provider ACK/readback;
5. prohibido usar nombre, email, teléfono, WhatsApp, username, `shopperCode` o hash `shp-*` derivado de texto como autoridad única;
6. Historical Shopper credential access/login/reset/recovery = 0;
7. Auth/password/user create/update = 0;
8. HR/Finance/Rules/Storage/Make/Gemini/payment/deploy/merge/production = 0/false.

Después de PASS, verificar I3.5 + I3.6 sin reproceso y continuar directamente I3.8→I3.11.

## 6. Clasificación

- **Reusable CXOrbia:** exact-identity fail-closed, provider-backed crosswalk, frozen-reference harness.
- **Exclusivo cliente:** target agosto TyA/Cinépolis.
- **Claude/prototipo:** no UI mapping/fuzzy fix; preservar separación de identidad.
- **Academia:** distinguir source-safe derived id vs canonical independent anchor.
- **Sin impacto Claude:** harness/tooling y gate provider.
