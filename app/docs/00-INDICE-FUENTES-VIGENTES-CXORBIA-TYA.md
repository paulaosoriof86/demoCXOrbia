# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 16:15 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_1_2_3_4_7_PASS__I3_5C_1_PERIOD_INDEPENDENT_ROLL_FORWARD_SOURCE_PASS__I3_5C_2_PROVIDER_MATERIALIZATION_PENDING__I3_6_FROZEN_PASS__GO_LIVE_35`

## Prevalencia

Secuencia/porcentaje/subgates: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Source lock técnico actual: **`SOURCE-LOCK-I3-5C-1-PERIOD-INDEPENDENT-IDENTITY-ROLL-FORWARD-SOURCE-PASS-20260817.md`**.

Evidencia source: `app/docs/evidence/ITERATION3-I3-5C-IDENTITY-ROLL-FORWARD-SOURCE-LATEST.json`.

Evidencia provider previa I3.5B: `app/docs/evidence/ITERATION3-I3-5B-PROVIDER-EXACT-CROSSWALK-LATEST.json`.

Último exact DEV build-lock desplegado: `app/docs/evidence/I3-2C-DEV-BUILD-LOCK-LATEST.json`.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR/workflow; no reauditoría general.

## Frozen / no reprocess

I1/I2 PASS; I3.1/I3.2/I3.3/I3.4/I3.7 PASS; Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; TARGET_B Admin `32049054855` PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal V0.4 receipt durable PASS/no autoaccept. I3.6 product/evidence frozen PASS.

## I3.5B provider result — cerrado / no rerun

Run `32070767910`, job `95513264398`: `HOLD_I3_5B_NO_INDEPENDENT_PROVIDER_AUTHORITY` / `SAFE_HOLD_ZERO_WRITES`.

Provider observó 616 visits / 14 periods, 0 `shopperIdentityLinks`, 0 exact independent authority records para el target agosto y 0 conflictos. Live HR = 660 / 15. No hubo writes. Request consumido; no retry.

## I3.5C-1 — mecanismo anti-recurrencia source PASS

Se implementó un contrato reusable de identidad durable y period-independent:

- `app/adapters/cxorbia-identity-roll-forward-v1.js`;
- `backend/contracts/cxorbia-identity-roll-forward-v1.json`;
- `tools/qa/cxorbia-identity-roll-forward-gate.mjs`;
- loader protegido en `app/core/backend-config-preview-dev.js`.

Regla: `tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}` sin `periodKey` en path ni en resolución. Un vínculo autoritativo creado una vez se reutiliza en agosto, septiembre y períodos posteriores. Scope tenant/project configurable; cero hardcode de tenant/proyecto/mes en el contrato reusable.

Gate local: `PASS_CXORBIA_IDENTITY_ROLL_FORWARD_PERIOD_INDEPENDENT` con agosto, septiembre, 2027, tenant isolation y project isolation.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15` = **35% / 65% formal**.

El 35% permanece por scoring integral de I3. Operativamente, la causa sistémica de repetición mensual quedó corregida a nivel source; el target actual todavía necesita una única autoridad/materialización.

## Siguiente frontera exacta

`I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION`.

No rerun I3.5B. No reprocess Historical Shopper/Auth. No mapping por nombre/PII. Requiere autoridad exacta para el target actual y, bajo gate separado, máximo un upsert idempotente + provider ACK/readback. Después debe probarse agosto + fixture septiembre con el mismo vínculo y cero segundo link.
