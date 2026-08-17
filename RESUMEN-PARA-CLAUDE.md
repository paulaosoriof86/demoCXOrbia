# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 17:45 -06:00  
**Estado vigente:** `PHASE_A_GO_LIVE_35__I3_1_TO_8_PASS__I3_9_PROVIDER_STATE_PASS__SHOPPER_MEMBERSHIP_LOADER_SOURCE_FIX_NOT_DEPLOYED__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

PASS/frozen y prohibido reprocesar: Historical Shopper `31906391682`, TARGET_B Admin `32049054855`, request08, HR 15/660, Finance V2/historical, I3.1→I3.8 y legal durable V0.4.

Source lock actual:
`app/docs/SOURCE-LOCK-I3-8-PASS-I3-9-MEMBERSHIP-LOADER-ROOT-CAUSE-SOURCE-FIX-PENDING-DEV-GATE-20260817.md`.

## I3.8 cerrado PASS

Nuevo Shopper sintético DEV provider-backed:
- run `32080412142`, job `95542161943`;
- Auth + claims + membership + profile + period-independent crosswalk `platform_created`;
- identityLinkId `irl_fd0e52a9792ef088aa275fa90e27c77d`;
- provider ACK/readback exacto PASS;
- request consumido/no rerun.

## I3.9 — qué se encontró

El provider state del Shopper nuevo está correcto: Auth user, claims, membership, profile, crosswalk, authority `platform_created`, period-independent y visible-login mapping exactos PASS en lecturas posteriores.

El browser E2E visible no se ha certificado aún. Los custom-token diagnostics son no-canónicos y encontraron fallas técnicas del harness/orquestación, sin demostrar una falla de la contraseña visible.

Hallazgo source real: `app/adapters/cxorbia-shopper-membership-wiring-v1.js` ya existía, pero `app/index-backend-dev.html` no lo cargaba; el exact source desplegado I3.2C tampoco. El Staff wiring sí estaba cargado y declara roles no-Staff como no aplicables.

Fix source aplicado en `c796597effac6d77422df888b63933ab865ab198`: `index-backend-dev.html` ahora carga el Shopper membership wiring reusable. **No desplegado todavía.**

## Qué NO debe tocar Claude

- no rediseñar `/app/modules` ni `/app/core`;
- no duplicar ni reemplazar Shopper membership wiring;
- no crear reglas por mes/tenant/proyecto;
- no inferir identidad por PII;
- no tocar Historical Shopper/Auth;
- no recrear el Shopper sintético I3.8;
- no cambiar `CX.data` como interfaz;
- no parchear UI para sortear Auth.

## Frontend/prototipo

No se requiere rediseño. El hallazgo es integración de un adapter backend/Auth ya existente en el entrypoint protegido. Si Claude toca el prototipo en paralelo, debe preservar el script wiring y el flujo visible único de login.

## Siguiente bloque exacto

`I3.9_I3.10_I3.11_EXACT_DEV_DEPLOY_AND_SYNTHETIC_SHOPPER_VISIBLE_LOGIN_CLOSE`.

Necesita gate adicional para:
- máximo 1 Hosting DEV deploy del source exacto vigente;
- máximo 1 password change del Shopper sintético I3.8 únicamente;
- visible username/password login real;
- claims/membership/profile/crosswalk/workspace + reload/new-tab/segundo contexto;
- I3.10 KPI/state dinámico;
- I3.11 same-build.

Cero Historical Shopper, cero nuevo user/claims/Firestore/HR/Finance/Rules/Storage/Make/Gemini/payment writes, cero merge/producción. Si PASS integral, formal → **60%**.

PR #7 permanece draft/open/no merge. Producción intacta.
