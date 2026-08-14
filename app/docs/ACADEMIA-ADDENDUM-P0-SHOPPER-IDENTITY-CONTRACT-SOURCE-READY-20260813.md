# Academia — Addendum P0 Shopper identity contract

**Fecha:** 2026-08-13
**Estado:** `SOURCE_CHAIN_REPAIR_PASS__REAL_SHOPPER_ACADEMIA_CERTIFICATION_E2E_PENDING`

## Alcance

El P0 de identidad Shopper sigue siendo una integración backend Auth/perfil/HR. **No se modificó contenido, cursos, manuales, evaluaciones, bancos de preguntas ni UI de Academia/Certificación.**

## Gate real consumido

El único gate provider read-only autorizado se ejecutó una vez en run `31762716234`. Leyó 77 documentos de certificación dentro del universo técnico, pero no llegó a ejecutar navegador con un Shopper real porque el handoff privado disponible era histórico y no produjo una credencial vigente.

Por tanto:
- Academia/Certificación real **no pasó ni falló**; quedó SKIPPED.
- No se debe asociar contenido/certificaciones por nombre, correo, teléfono o similitud.
- No se debe inferir que `62/137/10` describe el universo real de usuarios; ese output v1 fue invalidado como veredicto autoritativo.
- El request real quedó consumido/deshabilitado y el run `31763754714` confirmó que no hubo segundo provider read ni segundo E2E.

## Source reusable corregido

`app/adapters/tya-canonical-state-semantics-v2.js` canonicaliza owners exactos de fuentes protegidas vinculadas antes de la composición HR, utilizando `CX_EXACT_IDENTITY_CONTRACT`. Esto cubre también certificaciones, liquidaciones, postulaciones/aplicaciones y visitas; ambiguos/no resueltos quedan fail-closed.

La regresión provider-free `tools/qa/cxorbia-p0-global-composition-source-selftest.mjs` pasó la cadena profile→alias→visita protegida→HR.

Run source `31763545130`, job `94654691101`: SUCCESS. También `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`, cuyo instrumento exige en la misma sesión real Auth Shopper, perfil + HR exacta + histórico, ruta `aprendizaje`, ruta `cert` y ausencia del lock de identidad.

## Clasificación

- **Reusable CXOrbia:** identidad técnica exacta y owner canónico único como prerequisito de rutas de aprendizaje/certificación.
- **Exclusivo cliente:** certificaciones, cursos/intentos y credencial vigente TyA.
- **Claude/prototipo:** no rediseñar Academia/Certificación por este P0.
- **Academia:** revalidación funcional real obligatoria cuando exista handoff vigente y nueva autorización read-only.
- **Sin impacto Claude:** CI, request consumido y evidencia.

## Pendiente exacto

Primero resolver **source-only** el handoff privado vigente de Shopper, sin provider read y sin cambiar/resetear password. Después, bajo una nueva autorización explícita one-shot, ejecutar el E2E real y confirmar que la misma identidad canónica que resuelve perfil/histórico conserva correctamente Academia y Certificación. No desplegar antes de ese PASS.

Evidencia prevalente: `app/docs/evidence/p0-exact-identity-readonly-gate-hold-and-source-repair-20260813.json`.
