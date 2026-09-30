# ACADEMIA — ADDENDUM C6 AUTH FINDINGS ADJUDICATION

**Fecha:** 2026-08-10

## Impacto actual

No cambia contenido funcional, rutas por rol, cursos, manuales ni pantallas. No actualizar capturas ni instrucciones operativas todavía.

El caso sí agrega un patrón de troubleshooting documentable cuando el flujo Auth quede cerrado:

- una cuenta provider habilitada no equivale por sí sola a acceso efectivo al producto;
- el acceso depende además de rol permitido, tenant, proyecto, namespace y shopperId cuando aplica;
- dos principals con el mismo provider email pueden constituir un riesgo de identidad aunque el login canónico del producto use otra dirección interna;
- la adjudicación debe separar evidencia de claims/scope de evidencia de sign-in real;
- los conteos de outliers deben deduplicarse por solapamiento antes de concluir cuántos defectos reales existen.

## Estado para manuales

`HOLD_DOCUMENTATION_UPDATE_UNTIL_AUTH_DUPLICATE_KEEPER_REPAIR_AND_SMOKE_PASS`.

No documentar como comportamiento de usuario ninguno de los fingerprints ni excepciones TyA específicas.
