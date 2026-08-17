# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-17 16:15 -06:00  
**Estado:** `I3_5C_1_PERIOD_INDEPENDENT_IDENTITY_ROLL_FORWARD_SOURCE_PASS__CURRENT_TARGET_AUTHORITY_MATERIALIZATION_PENDING__I3_6_FROZEN_PASS__GO_LIVE_35__NO_PRODUCTION`

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; DEV `cxorbia-backend-dev`.

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Source lock: `SOURCE-LOCK-I3-5C-1-PERIOD-INDEPENDENT-IDENTITY-ROLL-FORWARD-SOURCE-PASS-20260817.md`.

## Frozen

I1/I2/I3.1/I3.2/I3.3/I3.4/I3.7 PASS; Historical Shopper `31906391682` PASS/reset consumed; Admin `32049054855` PASS; HR 15/660; Finance V2/historical; exact identity contract; durable legal receipt V0.4. I3.6 product/evidence frozen PASS. No reproceso.

## I3.5B — provider validation consumida

Run `32070767910`, job `95513264398`: `HOLD_I3_5B_NO_INDEPENDENT_PROVIDER_AUTHORITY` / `SAFE_HOLD_ZERO_WRITES`.

Provider tenía 616 visits / 14 periods, 0 `shopperIdentityLinks`, 0 authority records exactos para agosto. Live HR 660/15. El gate está consumido y no se rerun.

## I3.5C-1 — corrección sistémica implementada

Se implementó source-only un mecanismo reusable de identity roll-forward:

- vínculo durable a nivel `tenants/{tenantId}/shopperIdentityLinks/{identityLinkId}`;
- identidad canónica independiente del `periodKey`;
- scope exacto tenant/project/sourceSystem;
- project-specific o tenant-wide según naturaleza de la fuente;
- conflicto = fail-closed;
- source-safe ID sin autoridad persistida = review, nunca auto-match;
- alta desde plataforma exige `platform_created` identity link + provider ACK;
- protected DEV queda preparado para leer links autorizados y alimentar el composer exacto sin reautenticar históricos.

Gate local PASS con `2026-08`, `2026-09`, `2027-01`, aislamiento entre tenants y entre proyectos.

No se hardcodea TyA/Cinépolis/agosto/septiembre en el contrato reusable.

## Estado actual del target agosto

El mecanismo anti-recurrencia ya existe en source, pero hoy todavía no hay un vínculo autoritativo materializado para el target que I3.5B dejó en HOLD.

Por tanto:

- no repetir Auth/Shopper histórico;
- no repetir I3.5B;
- no crear un link por similitud;
- resolver una sola vez el vínculo actual con autoridad exacta;
- después el mismo link deberá funcionar automáticamente en septiembre y períodos posteriores sin nueva adjudicación.

## Progreso

Formal **35% / 65%** porque I3 permanece 0/25 hasta I3.11.

Operativamente: I3.5C-1 source PASS; el blocker se redujo a `I3.5C-2` one-time authority/materialization para el target actual.

## Next

`I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION`.

Requiere gate provider separado para máximo un upsert idempotente + ACK/readback, después test agosto + septiembre con el mismo link. Cero deploy/merge/producción en ese gate salvo autorización distinta.
