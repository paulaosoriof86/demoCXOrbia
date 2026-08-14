# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 20:29 -06:00
**Estado:** `SHOPPER_P0_READONLY_GATE_HOLD_INCONCLUSIVE__BACKEND_SOURCE_CHAIN_REPAIRED__NO_UI_REDESIGN__REAL_E2E_PENDING`

## Estado para Claude

**No corresponde parchear ni rediseñar UI.** El P0 sigue ubicado en la integración backend de identidad Auth/perfil/HR.

El único gate real read-only se consumió una vez. La salida inicial `62 unique / 137 unmapped / 10 ambiguous-review` **no es verdad autoritativa del universo**: la auditoría posterior demostró que el harness prefiltraba aliases antes de componer y que el compositor podía conservar un owner protegido legacy en lugar del profile id canónico. No etiquetar 147 shoppers como defectuosos ni crear soluciones por nombre/correo.

La misma lectura real sí mostró 231 Auth users, 209 principals Shopper efectivos, 340 perfiles, HR 15 periodos / 660 visitas / 212 shoppers, además de evidencia independiente de 616 matches exactos de visita, 208 relaciones HR→shopper protegido y 194 shoppers protegidos con histórico.

## Backend source reparado

Se mantiene `app/adapters/cxorbia-exact-identity-contract-v1.js` con las 11 llaves exactas compartidas con Auth.

`app/adapters/tya-canonical-state-semantics-v2.js` ahora canonicaliza, antes de la composición acumulativa, owners técnicos exactos de visitas/certificaciones/liquidaciones/postulaciones/aplicaciones/posts mediante el mismo contrato. Solo match exacto único; ambiguos/no resueltos quedan fail-closed. No usa nombre, correo, teléfono, WhatsApp, username/login o similitud.

Regresión provider-free `tools/qa/cxorbia-p0-global-composition-source-selftest.mjs` certificó la cadena `profile claim → profile alias → protected visit → hrRowId → live HR`.

Run source autoritativo `31763545130`, job `94654691101`: SUCCESS; `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`, `PASS_P0_GLOBAL_COMPOSITION_SOURCE`, `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`; hard fails 0.

## Para Claude

- No crear candidata, rama ni PR nuevo.
- No modificar módulos UI por este P0.
- No hardcodear TyA/Cinépolis como lógica global.
- No unir identidades por nombre/correo/teléfono/username.
- No reintroducir el snapshot source-safe como estado operacional pre-auth.
- Preservar rutas y UX del prototipo.
- Academia/Certificación no requiere rediseño; requiere la misma identidad canónica exacta.

## E2E real pendiente

El handoff privado disponible es histórico (109 credenciales) y no produjo una credencial Shopper vigente. Por eso el navegador E2E real, Academia y Certificación se **omitieron**; no se consideran FAIL.

El request real está consumido/deshabilitado y el run final `31763754714` omitió todos los pasos provider/credencial/E2E. No repetirlo bajo la autorización anterior.

El source reparado **no está desplegado** en el DEV visible actual. No pedir prueba humana sobre ese build como si contuviera este cambio.

## Siguiente bloque backend

Source-only: reconciliar el handoff privado vigente de Shopper a partir de material ya existente, sin provider read ni cambios/reset de contraseña. Una nueva revalidación real v2 requerirá autorización explícita separada. Producción, merge y deploy permanecen bloqueados.
