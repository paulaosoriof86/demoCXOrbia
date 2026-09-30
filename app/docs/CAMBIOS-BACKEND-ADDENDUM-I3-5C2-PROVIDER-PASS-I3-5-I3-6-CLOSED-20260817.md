# CAMBIOS BACKEND — ADDENDUM I3.5C-2 PROVIDER PASS

**Fecha:** 2026-08-17 16:31 -06:00  
**Estado:** `I3_5_PASS__I3_6_CLOSED__NEXT_I3_8`

## Ejecución real

Gate consumido:
`I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION`.

Run `32076682895`; job `95531280631`.

## Archivos creados/tocados en el bloque

1. `backend/requests/i3-5c2-period-independent-link-materialization.json`
   - request one-shot;
   - consumido `true`;
   - noAutomaticRetry `true`.

2. `.github/workflows/cxorbia-phase-a-firestore-materialization-executor.yml`
   - reutilizado workflow existente;
   - añadido lane focal I3.5C-2;
   - I3.5B y legal lanes permanecieron no ejecutados;
   - no workflow nuevo.

3. `app/docs/evidence/ITERATION3-I3-5C2-PERIOD-INDEPENDENT-LINK-MATERIALIZATION-LATEST.json`
   - evidencia provider ACK/readback.

4. `app/docs/SOURCE-LOCK-I3-5C2-PERIOD-INDEPENDENT-LINK-PASS-I3-5-I3-6-CLOSED-20260817.md`.

5. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.

7. `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

8. `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`.

9. `RESUMEN-PARA-CLAUDE.md`.

10. `PENDIENTES-PROTOTIPO.md`.

## Provider mutation exacta

Una sola creación en:
`tenants/tya/shopperIdentityLinks/irl_3ed1b9a65d36c5873c1306bae1621e9d`.

Resultado:

- Firestore writes `1`;
- identity-link writes `1`;
- provider ACK `true`;
- readback `true`;
- identityLinks `0→1`;
- authority `tenant_adjudication`;
- periodIndependent `true`;
- agosto PASS;
- septiembre PASS;
- sameCanonical PASS;
- sameLink PASS;
- secondLinkCreated `false`.

## Sin cambios no autorizados

Historical Shopper access/login/recovery/reset `0`; Auth/user/password writes `0`; HR/Finance/Rules/Storage/Make/Gemini/pagos `0`; deploy `0`; merge `false`; production `false`.

## Cierre

I3.5 = PASS/CLOSED. I3.6 = CLOSED/FROZEN PASS.

Siguiente bloque exacto: I3.8 Admin create/update one new Shopper provider-backed con identity link `platform_created` period-independent.

## Clasificación

- Reusable CXOrbia: sí.
- Exclusivo cliente: el registro provider actual.
- Claude/prototipo: sin parche UI.
- Academia: identidad durable entre períodos.
- Sin impacto Claude: request/workflow/evidence/provider ACK.
