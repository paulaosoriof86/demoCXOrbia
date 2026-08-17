# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 16:31 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_1_2_3_4_5_6_7_PASS__I3_8_NEXT__PERIOD_INDEPENDENT_IDENTITY_PROVIDER_BACKED__GO_LIVE_35`

## Prevalencia

Secuencia/porcentaje/subgates: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Source lock técnico actual: **`SOURCE-LOCK-I3-5C2-PERIOD-INDEPENDENT-LINK-PASS-I3-5-I3-6-CLOSED-20260817.md`**.

Evidencia provider I3.5C-2: `app/docs/evidence/ITERATION3-I3-5C2-PERIOD-INDEPENDENT-LINK-MATERIALIZATION-LATEST.json`.

Último exact DEV build-lock desplegado: `app/docs/evidence/I3-2C-DEV-BUILD-LOCK-LATEST.json`.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR. No reauditoría general.

## Frozen / no reprocess

I1/I2 PASS; I3.1/I3.2/I3.3/I3.4/I3.5/I3.6/I3.7 PASS; Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; TARGET_B Admin `32049054855` PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; legal V0.4 receipt durable PASS/no autoaccept.

## I3.5C-2 PASS

Gate consumido una sola vez:
`I3.5C-2_ONE_TIME_AUTHORITATIVE_ADJUDICATION_AND_PERIOD_INDEPENDENT_LINK_MATERIALIZATION`.

Run `32076682895`, job `95531280631`.

Resultado:
`PASS_COMMITTED_READBACK_PERIOD_INDEPENDENT` / `PASS_I3_5C2_ONE_TIME_ADJUDICATION_PERIOD_INDEPENDENT_LINK`.

Provider:

- `shopperIdentityLinks` `0 → 1`;
- identityLinkId `irl_3ed1b9a65d36c5873c1306bae1621e9d`;
- provider ACK/readback `true/true`;
- Firestore writes `1`;
- identity-link writes `1`;
- agosto PASS;
- septiembre PASS;
- mismo canonical PASS;
- mismo link PASS;
- segundo link creado `false`.

La identidad queda durable y period-independent. El scope `cinepolis` es dato del vínculo del tenant actual; no existe lógica reusable hardcodeada por tenant/proyecto/mes.

## Seguridad

Historical Shopper access/login/recovery/reset `0`; Auth/user/password writes `0`; HR/Finance/Rules/Storage/Make/Gemini/payment writes `0`; deploy `0`; merge `false`; production `false`.

Request I3.5C-2 consumido; `noAutomaticRetry=true`.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15` = **35% / 65% formal**.

El 35% permanece por scoring integral de I3. Operativamente I3.1→I3.7 ya están cerrados/PASS.

## Siguiente frontera exacta

`I3.8_ADMIN_CREATE_UPDATE_ONE_NEW_SHOPPER_PROVIDER_BACKED_PERIOD_INDEPENDENT_IDENTITY`.

Un único Shopper nuevo de prueba. Flujo obligatorio:
`Admin create/update → exact validation → Auth → claims → membership → profile/shopper → period-independent identity link authorityType=platform_created → provider ACK/readback`.

I3.8 requiere gate provider separado. Cero Historical Shopper reprocessing y cero unrelated writes.
