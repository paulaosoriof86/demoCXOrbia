# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 12:37 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-FOCAL-ADJUDICATION-02`  
**Estado:** `I3_11C_FOCAL_PROVIDER_PASS__TARGET_LINK_INTACT__TEMPORAL_RUNTIME_DIVERGENCE_FORENSIC_NEXT__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Avance

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `0/25 formal` hasta PASS integral; I3.1→I3.10 preservados según PASS/frozen.
- I4 `0/25`.
- I5 `0/15`.
- **Formal 35% / 65% pendiente.**
- I3 integral PASS → **60%**.

## Iteración cerrada — focal provider identity-link adjudication

Run `32171812808`, job `95824491418`, artifact `9337537655`, digest `sha256:4f19be2f3d8ecaa05287cdba914b51608db78c7bbb79f7341182b0d176dac394`.

Resultado:
- `PASS_I3_FOCAL_PROVIDER_IDENTITY_LINK_ADJUDICATION_READONLY`;
- adjudicación `intact_and_applicable_provider_state`;
- target link existe y conserva exactamente el mapping esperado;
- normalized applicable/trusted `true`;
- field diff `[]`;
- colección `2` documentos / `2` trusted normalized / `0` rejected;
- provider reads `2` / provider writes `0`;
- Auth/password/Firestore-data/Rules/Hosting/CloudRun/HR/Storage/Make/Gemini/pagos/Historical Shopper `0`;
- merge/production `false`.

El primer harness run `32171482856` falló antes de provider read por shallow checkout. Reads/writes provider `0/0`; no consumió la autorización. Se corrigió el binding al exact prior live HEAD y la única ejecución provider autorizada pasó.

## Qué cambia el diagnóstico

Ya no es correcto afirmar que el target link esté ausente del provider actual. Quedan descartados como causa persistente actual: deletion, deactivation, re-scope, mutation y structural non-applicability.

La discrepancia viva es temporal/runtime:
- Staff run previo: provider link count `1`, target links `0`;
- focal provider actual: trusted links `2`, target exacto intacto/aplicable.

Todavía no está probado si hubo un write intermedio de provider state o si el runtime anterior leyó/cacheó/filtró un set stale/incompleto.

## Siguiente bloque exacto

`I3_11C_TEMPORAL_WRITE_HISTORY_AND_RUNTIME_STALENESS_FORENSIC_NO_PROVIDER_READS`

Sin nueva lectura provider. Debe:
1. reconstruir cronología de runs/evidencias entre Staff HOLD y focal PASS;
2. descartar o probar writes a `shopperIdentityLinks` en ese intervalo;
3. revisar source/event-order/refresh/filtering del protected runtime;
4. fijar una sola causa reducida y el mínimo siguiente gate.

## Frozen / no reprocesar

Historical Shopper, TARGET_B Admin, I3.9/I3.10, Rules I3.11C, focal provider read, HR 15/660, Finance V2/historical y legal V0.4. No provider repair del target mientras está probado intacto/aplicable.

## Camino restante

Después de I3: I4 por slices visibles — lifecycle shopper, agenda/ejecución/cuestionario/revisión, HR bidireccional, Finanzas/liquidaciones/pagos, multi-proyecto/no-code, roles/notificaciones/integraciones y Academia. Luego I5 freeze/build-lock/preprod/rollback/same-build E2E/gate producción/cutover/smoke/baseline.

TyA/Cinépolis permanecen instancias de validación configurable, no lógica global.
