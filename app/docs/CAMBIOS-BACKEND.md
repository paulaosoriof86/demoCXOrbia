# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-13 19:20 -06:00
**Estado:** `P0_SHOPPER_GENERIC_IDENTITY_SOURCE_REPAIR_PASS__REAL_AUTH_E2E_PENDING__NO_DEPLOY`

## Bloque 2026-08-13 — reparación estructural source-only del P0 Shopper

Partiendo de la causa raíz forense `P0_PROVEN_IDENTITY_CONTRACT_SPLIT_AND_STALE_PREAUTH_BOOTSTRAP`, se aplicó una reparación genérica en la rama viva `docs-tya-v6-v71-audit`. No se creó candidata, rama ni PR nuevos; no se modificaron módulos UI funcionales.

### Archivos creados

- `app/adapters/cxorbia-exact-identity-contract-v1.js`: contrato reusable de identidad exacta para CXOrbia.
- `tools/qa/cxorbia-p0-exact-identity-contract-source-gate.mjs`: gate source que compara runtime con el universo técnico Auth y controla bootstrap humano.
- `tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs`: E2E preparado para formulario Firebase real; por defecto solo self-test source y exige gate explícito para ejecución real.
- `app/docs/evidence/p0-exact-identity-contract-source-repair-pass-31761257145.json`: evidencia durable del PASS.
- `app/docs/ACADEMIA-ADDENDUM-P0-SHOPPER-IDENTITY-CONTRACT-SOURCE-READY-20260813.md`: impacto y revalidación requerida en Academia/Certificación.

### Archivos modificados

- `app/adapters/tya-cumulative-read-model-v2.js`: consume `CX_EXACT_IDENTITY_CONTRACT`, construye el índice canónico desde fuentes técnicas exactas y publica diagnóstico del contrato/conflictos.
- `app/adapters/tya-canonical-shopper-portal-v2.js`: resolución Shopper por el mismo contrato exacto; no adjudica por nombre/correo/teléfono.
- `app/adapters/tya-live-source-refresh-watch-v2.js`: la ruta humana protegida espera Auth antes de leer HR operacional y reintenta tras `backend-auth-ready`.
- `app/index-backend-dev.html`: elimina del entrypoint humano la carga del snapshot source-safe viejo y del mutador preview; preserva ambos archivos para contextos source-safe/laboratorio; carga el contrato exacto antes del compositor y declara `preAuthOperationalData:'none'`.
- `.github/workflows/cxorbia-phase-a-visual-smoke.yml`: se reforzó el workflow existente; no se creó workflow nuevo. Ejecuta los gates P0 source antes del smoke local.
- Documentación viva: índice, checkpoint, CAMBIOS, RESUMEN, PENDIENTES y tracker.

## Contrato exacto reusable

El contrato comparte exactamente estas 11 llaves con el activador Auth:

`shopperId · legacyShopperId · legacyId · externalShopperId · externalId · sourceId · sourceKey · hrRowId · personId · profileId · shopperDocId`.

Reglas:
- match exacto único únicamente;
- múltiples propietarios exactos => revisión/fail-closed;
- nombre, correo, teléfono, WhatsApp, username/login y similitud no son selectores de identidad;
- reusable tenant/project; TyA/Cinépolis no define la semántica global.

## Gate autoritativo

Workflow `CXOrbia Phase A Visual Smoke`, run `31761257145`, job `94647914674`: **SUCCESS**.

- `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE` — hard fails 0.
- `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE` — E2E real source-ready, no ejecutado contra proveedor.
- Smoke local: `GO_WITH_WARNINGS_VISUAL_SMOKE_POST_V96`, hard fails 0.
- Warning no bloqueante existente: `custom:custom_role_visible_nav_items:1`.
- Artifact `9204689215`.
- Digest `sha256:0ec1c5fb23c894d89b6c80838303a2befb7f0e58c0fac9f774df407fc75d4402`.

Dos runs previos (`31760905131`, `31761151928`) aislaron falsos positivos del harness nuevo; no hubo proveedor/writes/deploy. Los detectores fueron corregidos y el run autoritativo posterior quedó SUCCESS.

## Qué NO se hizo

No se desplegó el source repair. No se ejecutó el E2E Firebase real. No se releyó proveedor. No se modificaron claims, perfiles, passwords, HR, Firestore, Rules o Storage. No se reimportó HR. No se tocó producción, dominio oficial, main ni merge.

El DEV visible que falló humanamente sigue correspondiendo al deploy anterior; **no pedir retest humano sobre ese build como validación de este source repair**.

## Clasificación

- **Reusable CXOrbia:** contrato técnico exacto único, fail-closed y gate real de identidad.
- **Exclusivo cliente:** crosswalk efectivo TyA, datos HR y resultado concreto del Shopper humano, todavía por revalidar read-only.
- **Claude/prototipo:** no rediseño de módulos; el prototipo se preserva. El entrypoint humano ya no recibe snapshot operativo pre-auth.
- **Academia:** contenido sin cambios; debe revalidarse por la misma identidad exacta en la sesión real.
- **Sin impacto Claude:** CI source-only, evidencia y seguridad.

## Avance y siguiente bloque

- M1–M10 técnico DEV: 100% preservado.
- Forense causa raíz P0: 100%.
- Reparación estructural source-only: **100% / PASS**.
- Validación empírica del universo real + Shopper Firebase real: **pendiente**.
- Go-live: **BLOCKED**.

Siguiente gate: una única validación DEV read-only de Auth/claims/perfiles/HR bajo el contrato común + E2E real Shopper → perfil → HR → histórico/Academia/Certificación. Cero writes o deploy. Solo después de ese PASS se solicita deploy DEV separado.
