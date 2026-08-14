# Academia — Addendum P0 Shopper identity contract

**Fecha:** 2026-08-13
**Estado:** `SOURCE_CHAIN_REPAIR_PASS__REAL_SHOPPER_ACADEMIA_CERTIFICATION_E2E_PENDING`

No se modificó contenido, cursos, manuales, evaluaciones, bancos de preguntas ni UI de Academia/Certificación.

El único gate provider read-only se consumió una vez (`31762716234`) y leyó 77 documentos de certificación, pero el handoff privado disponible era histórico y no produjo credencial Shopper vigente. Por tanto Academia/Certificación real quedó **SKIPPED**, no PASS ni FAIL. Run disabled final `31763754714` confirmó cero segundo provider read.

La salida v1 `62/137/10` no describe autoritativamente el universo real y no debe usarse para asociar o bloquear contenido/certificaciones.

Source reusable: `app/adapters/tya-canonical-state-semantics-v2.js` canonicaliza owners exactos de fuentes vinculadas —incluidas certificaciones— mediante `CX_EXACT_IDENTITY_CONTRACT` antes de HR composition; ambiguos/no resueltos fail-closed.

Run source `31763545130`, job `94654691101`: SUCCESS. `PASS_P0_GLOBAL_COMPOSITION_SOURCE` y `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`; el E2E source exige misma identidad Shopper en `aprendizaje` y `cert`.

Clasificación:
- **Reusable CXOrbia:** identidad exacta canónica para rutas de aprendizaje/certificación.
- **Exclusivo cliente:** certificaciones/cursos/intentos y credencial vigente TyA.
- **Claude/prototipo:** no rediseñar Academia/Certificación.
- **Academia:** validación real pendiente.
- **Sin impacto Claude:** CI/request/evidencia.

Pendiente: resolver source-only el handoff privado Shopper vigente; después nueva autorización one-shot para E2E real. No desplegar antes de PASS.

Evidencia: `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`.
