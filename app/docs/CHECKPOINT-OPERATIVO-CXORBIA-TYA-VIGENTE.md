# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_CONSUMED__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__DOCS_RECONCILED__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT__NO_PRODUCTION_YET`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; Firebase DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS 15/15. I2 PASS 20/20. Shopper histórico I3 PASS congelado run `31906391682`; reset histórico único consumido. Prohibido repetir reset/recovery/reconcile o acceder a credencial histórica. Toda continuación `passwordResets=0`.

Request08 run `31909354336`, job `95071998299`: STOP seguro `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Consumido/no rerun.

## Legal V0.4 interina

Counsel GT/HN está `deferred_post_golive`, no aprobado. V0.4 es candidata interina vigente y la revisión profesional permanece registrada para después del go-live.

Source lock técnico prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.

## Materialización provider — SOURCE PASS

Preparados:
- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`;
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`;
- `tools/qa/verify-i3-legal-v04-materialization-source-only.mjs`;
- `app/adapters/cxorbia-command-adapter-v1.js` con aceptación legal self-scoped/human-confirmed.

Bootstrap DEV futuro exacto: Firestore `4` create-only = legalProfile `1` + Provider Registry `1` + legalContent/version `2`; legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/payment `0`.

Provider fuente rechaza placeholders, falso counsel, domicilio restringido público, colisión/overwrite y budget drift. Readback preparado. Tras ACK, autoridad provider/no-code.

## Evidencia canónica

- técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: run `31959900456`, job `95196342385`, SUCCESS;
- documental `7862a4f67fe5ce526d5e4b465e9e19bff65a28d8`: run `31960246332`, job `95197007415`, SUCCESS;
- **checkpoint final `d50fbbd07bedca89b03c667e97ab76a830d644bc`: run `31960342757`, job `95197241342`, SUCCESS**.

En el último pasaron I1, I2, frozen I3, historical legal-aware, overlay-aware, durable legal, immutable publication, V0.4 materialization provider source y current checkpoint.

Source lock final documentado en `b896e4e75b1bad5bec3e81682d54d5e73d0dfd96`; índice final `82826962b327ec07aaa31848eb153d76a09e17c9`. Esos commits son documentales posteriores al gate y no ejecutan provider IO.

## Infraestructura de ejecución

El workflow existente `CXOrbia Phase A Firestore Materialization Executor` tiene su `execute` actual limitado a emulator. No se confundirá con DEV real; la siguiente ejecución reutilizará/extenderá un carril existente bajo gate exacto, sin workflow nuevo.

## No-code / rebrand-safe

`perfil mutable provider-authoritative → snapshot público inmutable → render UTF-8/LF → SHA-256 → receipt humano`.

Los valores TyA vivirán como configuración editable. Rebranding/config posterior no reescriben versiones históricas.

## Efectos reales

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; historical access/reset/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.**

## Gate siguiente

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Debe autorizar bootstrap DEV exacto de cuatro writes y wiring/runtime DEV. La aceptación sigue siendo exclusiva de la persona autenticada. Después: continuación I3 nueva Admin/new Shopper, sin request08 ni identidad histórica.
