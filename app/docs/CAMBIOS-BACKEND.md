# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 20:31 -06:00
**Estado:** `P0_READONLY_GATE_HOLD_INCONCLUSIVE__V1_MAPPING_INVALIDATED__EXACT_LINKED_OWNER_SOURCE_REPAIR_PASS__NO_DEPLOY`

Gate real `31762716234`: 1/1 provider read consumido; 231 Auth users, 209 principals, 340 perfiles, HR 15/660/212. `62/137/10` invalidado como veredicto autoritativo; evidencia independiente 616 exact matches / 208 HR→protected relations / 194 protected shoppers with history.

Brecha: prefiltrado v1 + owner protegido legacy no canonicalizado antes de relación HR. Reparación: `tya-canonical-state-semantics-v2.js` canonicaliza exact linked owners mediante `CX_EXACT_IDENTITY_CONTRACT`, fail-closed. Run source `31763545130` SUCCESS con `PASS_P0_GLOBAL_COMPOSITION_SOURCE`.

Handoff privado histórico no produjo credencial vigente; E2E real/Academia/Certificación SKIPPED. Request consumido/deshabilitado; run `31763754714` provider/E2E skipped; no second read.

Seguridad: provider read executions 1; writes/password changes/deploys 0; merge/producción false.

Siguiente: `SOURCE_ONLY_CURRENT_SHOPPER_CREDENTIAL_HANDOFF_RECONCILIATION`; luego nueva autorización one-shot para v2/E2E real; no deploy antes de PASS.

Evidencia: `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`.
