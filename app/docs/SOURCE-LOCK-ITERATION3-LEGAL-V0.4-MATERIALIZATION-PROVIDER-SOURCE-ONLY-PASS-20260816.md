# SOURCE LOCK — ITERATION 3 · LEGAL V0.4 MATERIALIZATION PROVIDER · SOURCE-ONLY PASS · 2026-08-16

**Estado:** `PASS_I3_LEGAL_V0_4_MATERIALIZATION_PROVIDER_SOURCE_ONLY__COUNSEL_DEFERRED_POST_GOLIVE__NO_PROVIDER_IO__HUMAN_ACCEPTANCE_REQUIRED__GO_LIVE_35`

## 1. Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; target futuro exacto `cxorbia-backend-dev`.

Preserva I1/I2, historical I3 congelado, request08 consumido, counsel diferido y aceptación exclusivamente humana.

## 2. Preservaciones

Historical exact Shopper run `31906391682` PASS congelado; reset único consumido; `passwordResets=0`; cero credential access/reconcile/recovery. Request08 run `31909354336` / job `95071998299` consumido/no rerun. Counsel GT/HN `deferred_post_golive`, nunca `approved` por inferencia técnica. Ninguna automatización acepta por usuarios.

## 3. Delta técnico source-only

- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs` — `2c4f383868a41246677559790cfbb0ae2b12beb7`.
- `tools/qa/verify-i3-legal-v04-materialization-source-only.mjs` — `211230564576478204101c60da2d17df3a268063`.
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json` — `d17de93b0d858608d5c4f2f3b2f7e630e0fe5ef7`.
- `.github/workflows/cxorbia-phase-a-live-checkpoint.yml` extendido sin workflow nuevo — `27e220c78efa1198d92c2aa33a6c9d1978c060e5`.
- `app/adapters/cxorbia-command-adapter-v1.js` — `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`.

Provider prepara create-only/readback para legalProfile, Provider Registry core, legalContent y version. `legal.acceptance.record` cruza como self-scoped human-confirmed command; provider deriva UID del ID token verificado y no se abrieron otros writes de Shopper/Cliente.

## 4. Presupuesto futuro exacto

Una ejecución: Firestore `4`; legalProfile `1`; legalProvider `1`; legalContent/version `2`; legalAcceptance `0`; Auth `0`; passwordResets `0`; historical access/reconcile `0`; otherIdentity/HR/Rules/Storage/Make/Gemini/payment `0`; automaticAcceptance `false`; humanAcceptanceRequired `true`.

Provider source bloquea placeholders, marcadores internos, falso counsel, domicilio restringido público, collision/overwrite y budget drift.

## 5. No-code / rebrand-safe

`tenantLegalProfile mutable provider-authoritative → snapshot público inmutable → render UTF-8/LF → SHA-256 → receipt humano`.

Los valores TyA no se hardcodean en runtime; tras provider ACK, la autoridad es provider/no-code.

## 6. Evidencia CI

- técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: run `31959900456`, job `95196342385`, SUCCESS.
- documental `7862a4f67fe5ce526d5e4b465e9e19bff65a28d8`: run `31960246332`, job `95197007415`, SUCCESS.
- checkpoint `d50fbbd07bedca89b03c667e97ab76a830d644bc`: run `31960342757`, job `95197241342`, SUCCESS.
- **HEAD final reconciliado `662e060c7026ebf27ce1f2a106787fb51bccc45e`: run `31960413262`, job `95197408054`, SUCCESS.**

En HEAD final pasaron I1, I2, frozen I3, legal-aware historical harness, overlay-aware Admin subgate, durable legal acceptance, immutable publication snapshot, `Verify I3 V0.4 interim materialization provider source contract` y current operational checkpoint.

## 7. Efectos reales

Provider credentials/reads/writes `0/0/0`; Firestore/Auth/legalContent/legalAcceptance writes `0`; passwordResets `0`; historical access/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## 8. Infraestructura de ejecución

`CXOrbia Phase A Firestore Materialization Executor` existe pero su `execute` actual está limitado a emulator. La ejecución real DEV reutilizará/extenderá un carril existente bajo gate exacto, sin workflow nuevo y sin request08.

## 9. Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`. **GO-LIVE 35% completado / 65% pendiente.**

## 10. Siguiente gate exacto

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Debe autorizar bootstrap DEV exacto de cuatro writes y wiring/runtime DEV. La aceptación jurídica permanece humana e indelegable. Request08 no se reutiliza.
