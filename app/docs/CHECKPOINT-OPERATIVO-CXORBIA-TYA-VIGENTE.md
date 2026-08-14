# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-13 19:20 -06:00
**Estado:** `P0_SHOPPER_SOURCE_REPAIR_PASS__REAL_PROVIDER_IDENTITY_E2E_PENDING__REAL_CUTOVER_BLOCKED`

## Estado vivo

- Repo `paulaosoriof86/demoCXOrbia`.
- Rama `docs-tya-v6-v71-audit`.
- PR #7 draft/open/no merge.
- HEAD documentado de cierre source-repair: `32ab6ca22f78cd9448f495f7f0c7f50c1fb796e5` antes de este pin documental; verificar HEAD otra vez antes del siguiente gate.
- M1–M10: 100% de calificación técnica DEV; no equivalen a aprobación funcional.
- Plataforma/hosting oficial TyA: sin reemplazar.
- Deploy DEV anterior: run `31758046539`, exactamente 1 Hosting deploy; aceptación humana posterior **RECHAZADA**.
- Segundo deploy: no autorizado; request previo consumido/deshabilitado.
- P0 forense post-deploy: causa raíz demostrada en `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json`.
- Reparación estructural source-only: **PASS** en run `31761257145`, job `94647914674`.
- El source repair actual **todavía no está desplegado en DEV**.

## Reparación source-only cerrada

### 1. Contrato único reusable de identidad exacta

Se creó `app/adapters/cxorbia-exact-identity-contract-v1.js`, reusable tenant/project. Define exactamente el mismo universo técnico que el activador Auth:

`shopperId · legacyShopperId · legacyId · externalShopperId · externalId · sourceId · sourceKey · hrRowId · personId · profileId · shopperDocId`.

No usa nombre, correo, teléfono, WhatsApp, username o similitud para adjudicar identidad. Un anchor exacto único se propaga; múltiples propietarios exactos quedan fail-closed/revisión.

`app/adapters/tya-cumulative-read-model-v2.js` y `app/adapters/tya-canonical-shopper-portal-v2.js` consumen el mismo contrato. El compositor publica diagnóstico de versión/llaves/conflictos del contrato.

### 2. Bootstrap humano pre-auth corregido

`app/index-backend-dev.html` ya no carga en la ruta humana canónica:
- `data/tya-hr-source-safe-periods.js`;
- `core/tya-phase-a-source-safe-preview.js`.

Los archivos source-safe se preservan; no fueron borrados ni se rediseñó el prototipo. El entrypoint declara `preAuthOperationalData:'none'` y carga el contrato exacto antes del compositor.

`app/adapters/tya-live-source-refresh-watch-v2.js` no inicia lectura HR operacional en la ruta humana protegida hasta que exista contexto Auth válido; se reactiva al evento `backend-auth-ready`.

### 3. Gate de aceptación real preparado

`tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` quedó preparado para una ejecución real read-only por formulario visible Firebase. Por contrato no usa `CX.app.selectRole`; exige Auth canónico, autoridad HR final, identidad exacta única, ausencia en review queue, país, fuente HR final e histórico. La ejecución real requiere un gate explícito y credenciales privadas; **no se ejecutó contra proveedor en este bloque**.

## Evidencia autoritativa del bloque

Workflow `CXOrbia Phase A Visual Smoke`:
- run `31761257145`;
- job `94647914674`;
- conclusión SUCCESS;
- `PASS_P0_EXACT_IDENTITY_CONTRACT_SOURCE`;
- `PASS_P0_REAL_SHOPPER_AUTH_E2E_SOURCE`;
- smoke local `GO_WITH_WARNINGS_VISUAL_SMOKE_POST_V96`;
- hard fails 0;
- warning conocido `custom:custom_role_visible_nav_items:1`;
- artifact `9204689215`;
- digest `sha256:0ec1c5fb23c894d89b6c80838303a2befb7f0e58c0fac9f774df407fc75d4402`.

Los runs intermedios `31760905131` y `31761151928` fallaron únicamente por falsos positivos del harness source y no ejecutaron proveedor, writes ni deploy. Fueron corregidos antes del run autoritativo.

## Qué está probado y qué no

**Probado:** contrato source único, equivalencia de las 11 llaves con Auth, fail-closed en ambigüedad, entrada humana sin snapshot viejo, HR humana condicionada a Auth, E2E real preparado sin rol sintético y smoke local sin hard fails.

**No probado todavía:** que el universo real actual de Auth/claims/perfiles/HR tenga crosswalk exacto completo; que el Shopper humano fallido resuelva después del source repair; que todos los principals Shopper efectivos estén mapeados uno-a-uno; que el build desplegado contenga este repair. Por ello no se declara aceptación humana ni go-live.

## Academia

No se modificaron cursos, manuales, bancos de preguntas ni UI. Academia/Certificación deben resolverse por el mismo principal canónico y se revalidarán en la misma sesión Shopper real. Ver `app/docs/ACADEMIA-ADDENDUM-P0-SHOPPER-IDENTITY-CONTRACT-SOURCE-READY-20260813.md`.

## Seguridad

Este bloque: provider reads 0, provider writes 0, Auth/Firestore/HR/Rules/Storage writes 0, Hosting/Cloud Run deploys 0, Make/Gemini/pagos 0, merge false, producción false.

## Siguiente bloque exacto

Un único gate DEV read-only para: (a) revalidar el universo efectivo Auth/claims/perfiles/HR usando exactamente `cxorbia-exact-identity-contract-v1`; y (b) ejecutar un Shopper Firebase real → perfil Firestore → HR exacta → histórico, incluyendo Academia/Certificación. Sin writes, cambios/reset de contraseña ni deploy. Si ese gate da PASS, el siguiente gate separado será deploy DEV del source repair y aceptación humana/regresión dirigida.

Evidencia vigente: `app/docs/evidence/p0-exact-identity-contract-source-repair-pass-31761257145.json`.
