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
`backend/runtime/cxorbia-legal-publication-provider-v1.mjs`  
Commit `2c4f383868a41246677559790cfbb0ae2b12beb7`.

Implementa bootstrap create-only y readback para:
1. `tenants/{tenantId}/legalProfile/current`;
2. `tenants/{tenantId}/legalProviders/firebase-google-core`;
3. `tenants/{tenantId}/legalContents/{legalContentId}`;
4. `tenants/{tenantId}/legalContents/{legalContentId}/versions/{legalVersion}`.

No carga credenciales provider en source-only y no ejecuta IO al importarse.

### Verificador
`tools/qa/verify-i3-legal-v04-materialization-source-only.mjs`  
Commit `211230564576478204101c60da2d17df3a268063`.

Valida en memoria:
- presupuesto exacto de cuatro documentos Firestore;
- create-only/collision fail-closed;
- SHA-256 post-render UTF-8/LF;
- rechazo de placeholders;
- rechazo de `LEGAL_REVIEW_REQUIRED` residual;
- rechazo de afirmación falsa `counselReviewed=true`;
- domicilio restringido no publicable;
- provider readback;
- legalAcceptance/Auth/password reset/historical writes = 0.

Decisión:
`PASS_I3_LEGAL_V04_INTERIM_MATERIALIZATION_PROVIDER_SOURCE_ONLY`.

### Contrato exacto
`backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`  
Commit `d17de93b0d858608d5c4f2f3b2f7e630e0fe5ef7`.

Target futuro: `cxorbia-backend-dev`; tenant `tya`; legal content `tya-platform-master-terms`; version `tya-legal-bundle-v0.4-interim-golive-20260816`.

### Gate CI canónico extendido
`.github/workflows/cxorbia-phase-a-live-checkpoint.yml`  
Commit `27e220c78efa1198d92c2aa33a6c9d1978c060e5`.

No se creó workflow nuevo. Se añadió el paso `Verify I3 V0.4 interim materialization provider source contract`.

### Command adapter — aceptación legal para todos los roles autenticados
`app/adapters/cxorbia-command-adapter-v1.js`  
Commit `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`.

Se corrigió un bloqueo source real: el adapter restringía al Shopper y al Cliente antes de que el provider pudiera evaluar `legal.acceptance.record`. Ahora ese comando es self-scoped y puede cruzar el cliente únicamente cuando:
- `entityType=legalAcceptance`;
- `payload.humanConfirmed=true`;
- `humanAcceptanceRequired=true`;
- `automaticAcceptanceForbidden=true`.

La autoridad de identidad sigue siendo el provider: UID derivado del ID token verificado. No se relajaron los permisos operativos ordinarios de Shopper/Cliente.

## 4. Presupuesto exacto del futuro write gate

Una ejecución máxima:
- Firestore writes: `4`;
- legalProfile: `1`;
- legalProvider registry: `1`;
- legalContent/version: `2`;
- legalAcceptance: `0`;
- Auth: `0`;
- passwordResets: `0`;
- historicalCredentialAccess: `0`;
- historicalReconciliationWrites: `0`;
- otherIdentityWrites: `0`;
- HR/Rules/Storage/Make/Gemini/payment: `0`;
- deploy: `0` dentro del bootstrap de datos;
- merge: `false`;
- production: `false` dentro del bootstrap DEV;
- automaticAcceptance: `false`;
- humanAcceptanceRequired: `true`.

El bootstrap request puede transportar los valores públicos iniciales TyA únicamente como input de una operación autorizada; después del ACK la autoridad será provider/no-code, no el request ni una constante runtime.

## 5. No-code / rebrand-safe

Los datos TyA —Operador, identificación tributaria, contactos, dirección pública, países, retención, controversias, Provider Registry, branding/licenciante y evidencia por proyecto— no se fijan en el runtime.

Flujo:
`tenantLegalProfile mutable provider-authoritative → snapshot público inmutable → render UTF-8/LF → SHA-256 → receipt humano`.

V0.4 conserva counsel `deferred_post_golive` y el rebranding no reescribe aceptaciones históricas.

## 6. Evidencia CI

Commit `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9` pasó `CXOrbia Phase A Live Execution Checkpoint`:
- run `31959900456`;
- job `95196342385`;
- conclusión `SUCCESS`.

Pasaron I1, I2, frozen I3, legal-aware historical harness, overlay-aware Admin subgate, durable legal acceptance, immutable publication snapshot, **V0.4 materialization provider source contract** y current operational checkpoint.

## 7. Efectos reales hasta este lock

Provider credentials/reads/writes `0/0/0`; Firestore/Auth/legalContent/legalAcceptance writes `0`; passwordResets `0`; historical access/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## 8. Infraestructura de ejecución existente

Se revisó el workflow existente `CXOrbia Phase A Firestore Materialization Executor`. Actualmente es fail-closed y su modo `execute` está restringido a emulator; no se usará para simular que DEV real fue materializado. La futura ejecución DEV debe extender/reutilizar un carril existente bajo gate exacto, sin crear workflow nuevo y sin reutilizar request08.

## 9. Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**GO-LIVE 35% completado / 65% pendiente.** Source-only PASS no suma I3.

## 10. Siguiente gate exacto

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Ese gate debe autorizar explícitamente el bootstrap DEV de cuatro writes y el wiring/runtime DEV necesario para mostrar la versión provider-authoritative. La aceptación seguirá siendo realizada por la persona autenticada en UI; no por automatización.
