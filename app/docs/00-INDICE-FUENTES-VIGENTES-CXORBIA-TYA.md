# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-13 20:31 -06:00
**Estado vivo:** `SHOPPER_P0_READONLY_GATE_CONSUMED_HOLD_INCONCLUSIVE__V1_MAPPING_INVALIDATED__SOURCE_CHAIN_REPAIRED_PASS__REAL_E2E_PENDING__CUTOVER_BLOCKED`

## Fuentes vigentes

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`
2. `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json` — evidencia prevalente.
3. `backend/config/corte6-human-login-shopper-identity-audit.json` — request `consumed_hold_stop_retry`, disabled, 0 ejecuciones restantes.
4. `app/docs/evidence/p0-exact-identity-contract-source-repair-pass-31761257145.json` — antecedente source-repair inicial.
5. `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json` — causa raíz post-deploy original.
6. `app/docs/ACADEMIA-ADDENDUM-P0-SHOPPER-IDENTITY-CONTRACT-SOURCE-READY-20260813.md`.
7. `app/docs/CAMBIOS-BACKEND.md`.
8. `app/docs/PENDIENTES-PROTOTIPO.md`.
9. `app/docs/RESUMEN-PARA-CLAUDE.md`.
10. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`.
11. PR #7.

## Estado prevalente

El único gate DEV read-only autorizado se consumió una vez en run `31762716234`, job `94652243857`. Leyó 231 Auth users, 209 principals Shopper efectivos, 340 perfiles Firestore, 616 visitas protegidas, 572 liquidaciones, 77 certificaciones y HR viva de 15 periodos / 660 visitas / 212 shoppers. No hubo writes ni deploy.

La salida v1 `62 unique / 137 unmapped / 10 ambiguous-review` **no es un veredicto autoritativo** y no puede interpretarse como 147 identidades reales rotas. La misma ejecución produjo evidencia independiente de 616 matches exactos de visita, 208 relaciones HR→shopper protegido y 194 shoppers protegidos con histórico. El análisis source posterior demostró prefiltrado incorrecto del auditor v1 y falta de canonicalización del owner protegido antes de la relación HR.

La brecha reusable quedó reparada source-only en `app/adapters/tya-canonical-state-semantics-v2.js`. Run `31763545130`, job `94654691101`: SUCCESS con `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`, `PASS_P0_GLOBAL_COMPOSITION_SOURCE`, `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`, hard fails 0.

El handoff privado disponible era histórico y no produjo credencial Shopper vigente. El E2E real, Academia y Certificación quedaron **SKIPPED**, no FAIL.

El request está disabled/consumido. Run final de neutralización `31763754714` terminó SUCCESS con provider audit, credencial, proxy y E2E skipped: **no hubo segundo provider read**.

El source reparado todavía **no está desplegado en DEV**. Producción, dominio oficial y merge permanecen intactos.

## Siguiente acción exacta

`SOURCE_ONLY_CURRENT_SHOPPER_CREDENTIAL_HANDOFF_RECONCILIATION`: reconciliar un handoff privado Shopper vigente usando material ya existente, sin proveedor, sin password reset/cambio y sin PII en repo. Cualquier auditor v2 + E2E real posterior requiere nueva autorización one-shot. Cero deploy hasta PASS real.
