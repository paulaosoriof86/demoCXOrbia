# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 17:45 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_1_TO_8_PASS__I3_9_PROVIDER_PRECONDITIONS_PASS__SHOPPER_MEMBERSHIP_LOADER_SOURCE_FIX_APPLIED_NOT_DEPLOYED__I3_9_10_11_DEV_GATE_REQUIRED__GO_LIVE_35`

## Prevalencia

Plan vigente: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Source lock técnico actual: **`SOURCE-LOCK-I3-8-PASS-I3-9-MEMBERSHIP-LOADER-ROOT-CAUSE-SOURCE-FIX-PENDING-DEV-GATE-20260817.md`**.

Evidencias principales:
- `app/docs/evidence/ITERATION3-I3-8-NEW-SHOPPER-PROVIDER-BACKED-LATEST.json`;
- `app/docs/evidence/ITERATION3-I3-8-PASS-I3-9-DIAGNOSTIC-LATEST.json`;
- `app/docs/evidence/ITERATION3-I3-5C2-PERIOD-INDEPENDENT-LINK-MATERIALIZATION-LATEST.json`;
- último DEV deploy exacto: `app/docs/evidence/I3-2C-DEV-BUILD-LOCK-LATEST.json`.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR/workflow. No reauditoría general.

## Frozen / no reprocess

I1/I2 PASS; I3.1→I3.8 PASS; I3.5/I3.6 cerrados; Historical Shopper `31906391682` frozen PASS/reset consumed/`passwordResets=0`; TARGET_B Admin `32049054855` frozen PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; legal V0.4 durable PASS/no autoaccept; I3.5B/I3.5C-2 consumed/no rerun.

## I3.8 PASS

Run `32080412142`, job `95542161943`.

Un único Shopper sintético DEV fue creado y leído de vuelta correctamente:
- Auth create `1`;
- claims write `1`;
- membership/profile/crosswalk Firestore `3`;
- identityLinkId `irl_fd0e52a9792ef088aa275fa90e27c77d`;
- authority `platform_created`;
- period-independent `true`;
- provider ACK/readback `true/true`;
- exact Auth/claims/membership/profile/crosswalk readback PASS.

Request consumido; no rerun I3.8 y no crear otro Shopper bajo ese gate.

## I3.9 estado real

Provider preconditions del Shopper nuevo fueron comprobadas repetidamente read-only y son PASS. El browser E2E visible todavía no está certificado.

Los intentos custom-token se clasifican como harness/orchestration, no como falla demostrada de credenciales del producto. El último run `32081426357`, job `95545032005`, demostró visible login surface PASS y Firebase Hosting project exact PASS, pero terminó en timeout técnico antes de certificar el contexto CXOrbia; provider admin writes/password changes/resets/Historical access = `0`.

## Hallazgo source

El adapter reusable `app/adapters/cxorbia-shopper-membership-wiring-v1.js` existía pero no era cargado por `app/index-backend-dev.html`, incluido el source exacto desplegado en I3.2C.

Corrección source aplicada en commit `c796597effac6d77422df888b63933ab865ab198`: el entrypoint protegido ahora carga el wiring Shopper. **No se desplegó**, porque el gate I3.8 prohibía deploy.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15` = **35% / 65% formal**.

Operativamente I3.1→I3.8 están PASS. I3.9 está acotado a validar el login visible canónico sobre el source corregido; I3.10/I3.11 siguen detrás.

## Siguiente frontera exacta

`I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE`.

Requiere gate nuevo para máximo un Hosting DEV deploy exacto y máximo un `updateUser(password)` del Shopper sintético I3.8 exclusivamente; después login visible real, reload/new-tab/segundo contexto, KPI/state dinámico y cierre I3.11 sobre la misma build. Cero Historical Shopper, cero createUser/claims/Firestore/HR/Finance/Rules/Storage/Make/Gemini/pagos, cero merge/producción.
