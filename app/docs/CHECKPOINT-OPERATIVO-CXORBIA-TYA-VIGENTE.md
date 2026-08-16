# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-16 10:38 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_CONSUMED__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__DOCS_RECONCILED__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT__NO_PRODUCTION_YET`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; Firebase DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS 15/15. I2 PASS 20/20. Shopper histórico I3 PASS congelado run `31906391682`; reset histórico único consumido. Prohibido repetir reset/recovery/reconcile o acceder a credencial histórica. Toda continuación `passwordResets=0`.

Request08 run `31909354336`, job `95071998299`: STOP seguro `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Consumido/no rerun.

## Legal durable + decisión interina

Acceptance durable source-only permanece PASS. Counsel GT/HN queda diferido post-go-live y **no se declara completado**. V0.4 es la candidata interina vigente.

Source lock técnico prevalente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`.

## Materialización V0.4 — SOURCE PASS

Preparados:
- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`;
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`;
- `tools/qa/verify-i3-legal-v04-materialization-source-only.mjs`;
- `app/adapters/cxorbia-command-adapter-v1.js` con `legal.acceptance.record` self-scoped/human-confirmed.

Futuro bootstrap DEV exacto: Firestore `4` create-only = legalProfile `1` + Provider Registry `1` + legalContent/version `2`; legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/payment `0`.

Provider bloquea placeholders, falso counsel, domicilio restringido público, colisión/overwrite y budget drift. Readback provider preparado. Después del ACK la autoridad será provider/no-code.

## Evidencia canónica

- técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: run `31959900456`, job `95196342385`, SUCCESS;
- documental reconciliado `7862a4f67fe5ce526d5e4b465e9e19bff65a28d8`: run `31960246332`, job `95197007415`, SUCCESS.

Todos los pasos canónicos pasaron, incluido `Verify I3 V0.4 interim materialization provider source contract`.

Documentación posterior: source lock actualizado `e8b65b141b6563fe005e50034580728e769e578a`; índice vivo `1ed04d62bd4f1e1f8bfc5c320af969fbc8bc9843`. Son cambios documentales y no alteran el producto/provider.

## Infraestructura de ejecución

`CXOrbia Phase A Firestore Materialization Executor` existe pero su `execute` actual está restringido a emulator. No se confundirá con materialización real de DEV. La siguiente ejecución reutilizará/extenderá un carril existente bajo gate exacto; no workflow nuevo.

## No-code / rebrand-safe

`perfil mutable provider-authoritative → snapshot público inmutable → render UTF-8/LF → SHA-256 → receipt humano`.

Los valores TyA se administrarán como configuración viva/editable, no constantes runtime. Rebranding/config posterior no reescriben versiones históricas.

## Efectos reales hasta este checkpoint

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; historical access/reset/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.**

## Gate siguiente

`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Debe autorizar explícitamente el bootstrap DEV exacto de cuatro writes y el wiring/runtime DEV. La aceptación seguirá siendo exclusiva de la persona autenticada. Después: continuación I3 nueva Admin/new Shopper, sin request08 ni identidad histórica.
