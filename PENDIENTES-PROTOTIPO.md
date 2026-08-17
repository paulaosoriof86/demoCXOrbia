# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-17 16:31 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_1_TO_7_PASS__I3_8_NEXT__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR/workflow. I1/I2 cerradas. I3.1→I3.7 cerradas/PASS. El mecanismo de identidad period-independent ya fue materializado y probado en provider.

Tracker: `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`.  
Source lock: `app/docs/SOURCE-LOCK-I3-5C2-PERIOD-INDEPENDENT-LINK-PASS-I3-5-I3-6-CLOSED-20260817.md`.  
Evidencia: `app/docs/evidence/ITERATION3-I3-5C2-PERIOD-INDEPENDENT-LINK-MATERIALIZATION-LATEST.json`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

- I1/I2.
- Historical Shopper `31906391682`; no credential access/reconcile/recovery/reset.
- TARGET_B Admin `32049054855`.
- Request08.
- HR 15/660; no reimport.
- Finance V2/historical; no rebuild.
- I3.5B e I3.5C-2; requests consumidos/no rerun.
- Legal durable V0.4.

## Ya resuelto

- Identidad exacta durable no depende del período.
- Provider-backed `shopperIdentityLinks` activo.
- Agosto y septiembre resuelven al mismo canonical mediante el mismo link.
- Segundo link no creado.
- Tenant/project/source scope explícito.
- Cero hardcode reusable de tenant/proyecto/mes.
- I3.5 PASS/CLOSED.
- I3.6 CLOSED/FROZEN PASS.

## Pendiente ruta crítica I3

1. I3.8 Admin crea/actualiza **un único Shopper nuevo** provider-backed;
2. exact validation;
3. Auth principal;
4. claims;
5. membership;
6. profile/shopper;
7. period-independent identity link `authorityType=platform_created`;
8. provider ACK/readback;
9. I3.9 login/reload/new-tab/segundo contexto del Shopper nuevo;
10. I3.10 KPI/state semantics;
11. I3.11 integral same-build close → 60% formal.

## Multi-proyecto / multi-tenant

Cinépolis continúa como proyecto configurable normal. Ninguna regla reusable debe depender del nombre TyA/Cinépolis, país, mes o período. Los scopes vienen de provider/config.

## Claude / prototipo

No parchear UI desde backend. Si existe review de identidad, debe deduplicarse por autoridad/source scope y no por mes.

## Acción siguiente

`I3.8_ADMIN_CREATE_UPDATE_ONE_NEW_SHOPPER_PROVIDER_BACKED_PERIOD_INDEPENDENT_IDENTITY` bajo gate provider separado.

Sin merge/producción.
