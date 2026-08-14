# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 20:31 -06:00
**Estado:** `SHOPPER_P0_READONLY_GATE_HOLD_INCONCLUSIVE__BACKEND_SOURCE_CHAIN_REPAIRED__NO_UI_REDESIGN__REAL_E2E_PENDING`

**No parchear ni rediseñar UI.** El P0 está en integración backend Auth/perfil/HR.

La única lectura real se consumió. La salida v1 `62 unique / 137 unmapped / 10 ambiguous-review` no es verdad autoritativa: el harness prefiltraba aliases y el runtime podía conservar un owner legacy antes de relacionarlo con HR. No convertir `137+10` en backlog de usuarios ni resolver por nombre/correo.

La misma lectura sí registró 231 Auth users, 209 principals Shopper, 340 perfiles, HR 15 periodos / 660 visitas / 212 shoppers y evidencia independiente de 616 matches exactos, 208 relaciones HR→protegido y 194 shoppers protegidos con histórico.

Backend source reparado: `app/adapters/tya-canonical-state-semantics-v2.js` canonicaliza owners exactos de visitas/certificaciones/liquidaciones/postulaciones/aplicaciones/posts mediante `CX_EXACT_IDENTITY_CONTRACT` antes de componer. Match exacto único solamente; ambiguos/no resueltos fail-closed.

Run source `31763545130`, job `94654691101`: SUCCESS; `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`, `PASS_P0_GLOBAL_COMPOSITION_SOURCE`, `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`, hard fails 0.

El handoff privado disponible era histórico y no produjo credencial Shopper vigente; E2E real/Academia/Certificación quedaron SKIPPED. Request real consumido/deshabilitado; run `31763754714` confirmó todos los pasos provider/E2E skipped. No repetir bajo la autorización anterior.

Para Claude: no candidata/rama/PR nuevo; no cambios UI; no hardcode TyA/Cinépolis global; no identidad por nombre/correo/teléfono/username; no snapshot source-safe operacional pre-auth; preservar rutas/UX; Academia/Certificación no requiere rediseño.

El source reparado no está desplegado en el DEV actual.

Siguiente bloque backend: `SOURCE_ONLY_CURRENT_SHOPPER_CREDENTIAL_HANDOFF_RECONCILIATION`, sin proveedor ni password changes. Nueva revalidación v2 requiere autorización explícita separada. Producción, merge y deploy bloqueados.
