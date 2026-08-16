# SOURCE LOCK — ITERATION 3 · LEGAL V0.4 MATERIALIZATION PROVIDER · SOURCE-ONLY PASS · 2026-08-16

**Estado:** `PASS_I3_LEGAL_V0_4_MATERIALIZATION_PROVIDER_SOURCE_ONLY__COUNSEL_DEFERRED_POST_GOLIVE__NO_PROVIDER_IO__HUMAN_ACCEPTANCE_REQUIRED__GO_LIVE_35`

## 1. Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; target futuro exacto `cxorbia-backend-dev`.

Este lock prevalece sobre el lock V0.4 anterior únicamente en lo relativo a la preparación técnica de materialización. Preserva íntegramente I1/I2, historical I3 congelado, request08 consumido, decisión de counsel diferido y aceptación exclusivamente humana.

## 2. Preservaciones obligatorias

- Historical exact Shopper: run `31906391682`, PASS congelado.
- Reset histórico único consumido; toda continuación `passwordResets=0`.
- Cero credential access/reconcile/recovery histórico.
- Request08 run `31909354336` / job `95071998299` consumido; no rerun.
- Counsel GT/HN: `deferred_post_golive`, nunca `approved` por inferencia técnica.
- V0.4 no puede aceptar por ningún usuario mediante QA, runner, IA, Make, Gemini, GitHub Actions o administrador técnico.

## 3. Delta técnico source-only acumulado

### Provider de publicación legal
`backend/runtime/cxorbia-legal-publication-provider-v1.mjs` — commit `2c4f383868a41246677559790cfbb0ae2b12beb7`.

Bootstrap create-only/readback para:
1. `tenants/{tenantId}/legalProfile/current`;
2. `tenants/{tenantId}/legalProviders/firebase-google-core`;
3. `tenants/{tenantId}/legalContents/{legalContentId}`;
4. `tenants/{tenantId}/legalContents/{legalContentId}/versions/{legalVersion}`.

No carga credenciales provider al importarse ni ejecuta IO en source-only.

### Verificador
`tools/qa/verify-i3-legal-v04-materialization-source-only.mjs` — commit `211230564576478204101c60da2d17df3a268063`.

Decisión:
`PASS_I3_LEGAL_V04_INTERIM_MATERIALIZATION_PROVIDER_SOURCE_ONLY`.

Valida budget, create-only/collision, digest post-render, placeholders, marcadores internos, falso counsel, domicilio restringido, readback y cero acceptance/Auth/historical writes.

### Contrato exacto
`backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json` — commit `d17de93b0d858608d5c4f2f3b2f7e630e0fe5ef7`.

### CI
`.github/workflows/cxorbia-phase-a-live-checkpoint.yml` extendido, sin workflow nuevo — commit `27e220c78efa1198d92c2aa33a6c9d1978c060e5`.

### Command adapter
`app/adapters/cxorbia-command-adapter-v1.js` — commit `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`.

`legal.acceptance.record` es self-scoped para cualquier rol autenticado solo con `humanConfirmed=true`, `humanAcceptanceRequired=true` y `automaticAcceptanceForbidden=true`. Provider deriva UID del ID token verificado. No se abrieron otros writes de Shopper/Cliente.

## 4. Presupuesto exacto del futuro write gate

Una ejecución máxima:
- Firestore writes `4`;
- legalProfile `1`;
- legalProvider registry `1`;
- legalContent/version `2`;
- legalAcceptance `0`;
- Auth `0`;
- passwordResets `0`;
- historicalCredentialAccess/reconciliation `0/0`;
- otherIdentity/HR/Rules/Storage/Make/Gemini/payment `0`;
- automaticAcceptance `false`;
- humanAcceptanceRequired `true`.

## 5. No-code / rebrand-safe

`tenantLegalProfile mutable provider-authoritative → snapshot público inmutable → render UTF-8/LF → SHA-256 → receipt humano`.

Operador, identificación tributaria, contactos, dirección pública, países, retención, controversias, providers, branding/licenciante y evidencia de proyecto no se hardcodean en runtime. El bootstrap request puede llevar valores iniciales bajo autorización; después del ACK la autoridad será provider.

## 6. Evidencia CI

### Head técnico
`4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`:
- run `31959900456`;
- job `95196342385`;
- `SUCCESS`.

### Head reconciliado de documentación
`7862a4f67fe5ce526d5e4b465e9e19bff65a28d8`:
- run `31960246332`;
- job `95197007415`;
- `SUCCESS`.

En ambos pasaron I1, I2, frozen I3, legal-aware historical harness, overlay-aware Admin subgate, durable legal acceptance, immutable publication snapshot, V0.4 materialization provider source contract y current operational checkpoint.

## 7. Efectos reales hasta este lock

Provider credentials/reads/writes `0/0/0`; Firestore/Auth/legalContent/legalAcceptance writes `0`; passwordResets `0`; historical access/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## 8. Infraestructura de ejecución existente

`CXOrbia Phase A Firestore Materialization Executor` fue revisado. Hoy su modo `execute` está limitado a emulator; no se usará para afirmar materialización real de DEV. La futura ejecución debe reutilizar/extender un carril existente bajo gate exacto, sin workflow nuevo y sin request08.

## 9. Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**GO-LIVE 35% completado / 65% pendiente.** Source-only PASS no suma I3.

## 10. Siguiente gate exacto

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Debe autorizar explícitamente el bootstrap DEV de cuatro writes y el wiring/runtime DEV necesario. La aceptación jurídica permanece humana e indelegable. Request08 no se reutiliza.
