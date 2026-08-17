# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-17 17:45 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_1_TO_8_PASS__I3_9_VISIBLE_LOGIN_PENDING_SOURCE_FIX_NOT_DEPLOYED__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR/workflow. I3.1→I3.8 cerradas/PASS. I3.9 tiene provider preconditions PASS y una corrección source focal pendiente de deploy DEV.

Tracker: `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`.  
Source lock: `app/docs/SOURCE-LOCK-I3-8-PASS-I3-9-MEMBERSHIP-LOADER-ROOT-CAUSE-SOURCE-FIX-PENDING-DEV-GATE-20260817.md`.  
Evidencia: `app/docs/evidence/ITERATION3-I3-8-PASS-I3-9-DIAGNOSTIC-LATEST.json`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

- I1/I2/I3.1→I3.8.
- Historical Shopper `31906391682`; no credential access/login/reconcile/recovery/reset.
- TARGET_B Admin `32049054855`.
- Shopper sintético I3.8: no recrear ni duplicar.
- Request08, I3.5B, I3.5C-2, I3.8 requests consumidos/no rerun.
- HR 15/660; no reimport.
- Finance V2/historical; no rebuild.
- Legal durable V0.4.

## Ya resuelto

- Identidad exacta durable y period-independent.
- I3.8 nuevo Shopper: Auth + claims + membership + profile + `platform_created` crosswalk provider-backed PASS.
- Provider ACK/readback exacto PASS.
- I3.9 provider preconditions del nuevo Shopper PASS.
- Causa source encontrada: Shopper membership wiring existía pero no estaba cargado por protected DEV entrypoint.
- Source fix `c796597effac6d77422df888b63933ab865ab198` aplicado; no desplegado.

## Pendiente ruta crítica I3

1. autorizar máximo 1 Hosting DEV deploy del source exacto vigente;
2. autorizar máximo 1 password change del Shopper sintético I3.8 únicamente;
3. ejecutar login visible usuario+contraseña real;
4. validar claims + membership + profile + crosswalk + workspace;
5. reload + new-tab + segundo contexto;
6. I3.10 KPI/state semantics dinámico, sin hardcode por período;
7. I3.11 integral same-build close;
8. si PASS, I3 = 25/25 y GO-LIVE formal = 60%.

## Multi-proyecto / multi-tenant

Cinépolis continúa como proyecto configurable normal. El wiring Shopper es reusable; no depende de nombre de tenant/proyecto/mes.

## Claude / prototipo

No rediseñar UI. Preservar el flujo visible único de login y el loader `cxorbia-shopper-membership-wiring-v1.js` en el protected entrypoint. No sustituirlo por lógica de módulos.

## Acción siguiente

`I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE` bajo gate adicional combinado.

Cero Historical Shopper, cero createUser/claims/Firestore/HR/Finance/Rules/Storage/Make/Gemini/pagos, cero merge/producción.
