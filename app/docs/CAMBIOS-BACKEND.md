# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 20:31 -06:00
**Estado:** `P0_READONLY_GATE_HOLD_INCONCLUSIVE__V1_MAPPING_INVALIDATED__EXACT_LINKED_OWNER_SOURCE_REPAIR_PASS__NO_DEPLOY`

## Gate real read-only

Run `31762716234`, job `94652243857`, 1/1 provider read consumido. Inventario bruto: 231 Auth users, 209 principals Shopper, 340 perfiles, 616 visitas protegidas, 572 liquidaciones, 77 certificaciones, HR 15 periodos / 660 visitas / 212 shoppers.

La salida v1 `62 unique / 137 unmapped / 10 ambiguous-review` quedó invalidada como veredicto autoritativo; no representa 147 identidades demostrablemente rotas. Evidencia independiente del mismo run: 616 matches exactos, 208 relaciones HR→shopper protegido y 194 shoppers protegidos con histórico.

## Brecha source demostrada y reparada

El auditor v1 prefiltraba linked sources antes de composición y el runtime podía relacionar HR con un owner protegido legacy sin canonicalizarlo a profile id.

`app/adapters/tya-canonical-state-semantics-v2.js` ahora canonicaliza owners exactos únicos de visits/certifications/liquidations/postulations/applications/posts mediante `CX_EXACT_IDENTITY_CONTRACT` antes de componer; ambiguos/no resueltos fail-closed. No usa similitud/nombre/correo.

Archivos/gates relevantes:
- `tools/qa/cxorbia-p0-exact-identity-provider-readonly.mjs` v2 preparado; no reejecutado contra proveedor.
- `tools/qa/cxorbia-p0-local-readonly-proxy.mjs` GET/HEAD-only.
- `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` incluye Academia/Certificación.
- `tools/qa/cxorbia-p0-global-composition-source-selftest.mjs` regresión exacta provider-free.
- workflows existentes reforzados; ningún workflow nuevo.

Run source `31763545130`, job `94654691101`: SUCCESS; `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`, `PASS_P0_GLOBAL_COMPOSITION_SOURCE`, `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`; hard fails 0; artifact `9205478201`, digest `sha256:12c5196203588c70ebe2f2ba86774f77965d7fbb5dbdcdb27007aa916272706a`.

## E2E y seguridad

Handoff privado histórico de 109 credenciales no produjo credencial Shopper vigente; E2E real/Academia/Certificación SKIPPED. Request consumido/deshabilitado; run `31763754714` SUCCESS con provider/credencial/proxy/E2E skipped. No hubo segundo provider read.

Provider read executions 1; provider/Auth/Firestore/HR/Rules/Storage writes 0; password changes/resets 0; deploy 0; Make/Gemini/pagos 0; merge/producción false.

Clasificación: **Reusable CXOrbia** contrato+owner normalization+regresión; **Exclusivo cliente** universo TyA/credenciales; **Claude/prototipo** sin cambio UI; **Academia** validación real pendiente; **Sin impacto Claude** CI/request/evidencia.

Siguiente bloque: `SOURCE_ONLY_CURRENT_SHOPPER_CREDENTIAL_HANDOFF_RECONCILIATION`. Nueva lectura v2/E2E requiere autorización one-shot nueva; no deploy antes de PASS.

Evidencia: `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`.
