# Academia — Addendum P0 Shopper identity contract source-ready

**Fecha:** 2026-08-13
**Estado:** `SOURCE_REPAIR_PASS__REAL_SHOPPER_ROLE_VALIDATION_PENDING`

## Alcance

El bloque P0 de identidad Shopper corrigió source-only la integración backend que relaciona Firebase Auth, perfil protegido y HR viva. **No se modificó contenido, cursos, manuales, evaluaciones, bancos de preguntas ni UI de Academia/Certificación.**

## Impacto obligatorio en Academia

- La visibilidad de Academia y Certificación para Shopper debe derivar del mismo principal Firebase autenticado y de la misma identidad canónica exacta que gobierna su perfil e histórico.
- Ningún curso, certificación presentada, certificación aprobada o ruta por rol puede asociarse por nombre, correo, teléfono o similitud.
- La reparación source-only no certifica todavía que un Shopper humano real recupere sus cursos/certificaciones después del handoff HR.
- La prueba posterior debe validar, en la misma sesión real Shopper, identidad canónica, país/alcance, histórico, Academia y estado de Certificación.
- Ante identidad ambigua o sin crosswalk exacto, Academia/Certificación debe permanecer fail-closed y pasar a revisión; nunca fusionar silenciosamente.

## Evidencia de este bloque

- Contrato reusable: `app/adapters/cxorbia-exact-identity-contract-v1.js`.
- Gate source: run `31761257145`, job `94647914674`, SUCCESS.
- Evidencia: `app/docs/evidence/p0-exact-identity-contract-source-repair-pass-31761257145.json`.
- E2E real preparado: `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`; **no ejecutado contra proveedor en este bloque**.

## Clasificación

- **Reusable CXOrbia:** identidad técnica exacta única como prerequisito de rutas de aprendizaje/certificación por rol.
- **Exclusivo cliente:** cursos, intentos y certificaciones reales TyA ligados a cada Shopper.
- **Claude/prototipo:** no rediseñar Academia ni Certificación por este P0.
- **Academia:** revalidación funcional obligatoria después del gate real de identidad y del deploy DEV autorizado.
- **Sin impacto Claude:** CI/evidencia source-only.

## Pendiente exacto

Ejecutar, bajo gate read-only separado, un Shopper Firebase real de extremo a extremo y confirmar que la misma identidad que resuelve perfil/histórico también resuelve correctamente Academia y Certificación. Cero escritura o deploy dentro de esa validación.
