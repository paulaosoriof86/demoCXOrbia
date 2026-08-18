# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 13:13 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I3-11C-RUNTIME-CONTRACT-DRIFT-03`  
**Estado:** `I3_11C_ROOT_CAUSE_PROVEN_RUNTIME_CONTRACT_DRIFT__SOURCE_CORRECTION_NEXT__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

## Avance

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `0/25 formal` hasta PASS integral; I3.1→I3.10 preservados.
- I4 `0/25`.
- I5 `0/15`.
- **Formal 35% / 65% pendiente.**
- I3 integral PASS → **60%**.

## R2 — focal provider read — cerrado

Run `32171812808`: target provider link existe e intacto; 2 trusted links / 0 rejected; provider writes 0. Gate consumido/no rerun.

## R2B — temporal/runtime forensic — cerrado con causa raíz

Sin provider reads/writes se compararon source + evidence.

Causa probada:
`PROVEN_RUNTIME_CONTRACT_DRIFT__LEGACY_PROVIDER_IDENTITY_LINK_APPLICABILITY_FILTER`.

Hechos:
1. target `irl_3ed1b9a65d36c5873c1306bae1621e9d` tiene status `materialized`, authority `tenant_adjudication`, period-independent y mapping `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
2. contrato canónico `cxorbia-identity-roll-forward-v1` acepta status `materialized` y authority `tenant_adjudication` con authorityRef;
3. runtime `cxorbia-provider-identity-link-runtime-v1` exige status exactamente `active` y `providerAck === true`;
4. por eso el target se descarta determinísticamente por source antes de composición;
5. `index-backend-dev.html` carga el runtime legacy y no el roll-forward canónico.

Esto explica el Staff HOLD previo (`1` link global / `0` target links) sin requerir reparación provider ni nuevo diagnóstico de Auth/Rules.

## Siguiente bloque exacto

`I3_11C_UNIFY_PROVIDER_IDENTITY_RUNTIME_WITH_CANONICAL_ROLL_FORWARD_SOURCE_CORRECTION_NO_PROVIDER_IO`

Objetivo: corregir el adapter reusable, mantener su API actual y exact identity, agregar gate de paridad contractual y validar estáticamente. Cero provider/Auth/Firestore-data/Rules/Hosting/CloudRun/HR/Storage/Make/Gemini/pagos/Historical Shopper/merge/producción.

## Después

La corrección source no cierra I3 por sí sola. Siguiente gate runtime read-only debe demostrar:
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- residual live `0`;
- duplicate visits/shopper IDs `0`.

Con ese PASS integral: formal **60% / 40% pendiente** y entrada inmediata a I4 visible.

## Frozen

Historical Shopper, TARGET_B Admin, I3.9/I3.10, Rules I3.11C, focal provider read, HR 15/660, Finance V2/historical, legal V0.4. No provider repair del target.

## Camino restante

I4: lifecycle shopper, agenda/ejecución/cuestionario/revisión, HR bidireccional, Finanzas/liquidaciones/pagos, multi-proyecto/no-code, roles/notificaciones/integraciones y Academia. I5: freeze/build-lock/preprod/rollback/same-build E2E/gate producción/cutover/smoke/baseline.

TyA/Cinépolis siguen como instancias configurables; el fix de contrato es reusable CXOrbia.
