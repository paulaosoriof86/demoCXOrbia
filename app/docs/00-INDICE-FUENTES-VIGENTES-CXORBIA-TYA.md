# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 15:06 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_1_2_3_4_7_PASS__I3_5_PROVIDER_CROSSWALK_REQUIRED__I3_6_PRODUCT_PASS_HARNESS_SOURCE_FIXED__GO_LIVE_35`

## Prevalencia

Secuencia/porcentaje/subgates: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock técnico actual: **`SOURCE-LOCK-I3-5A-NO-INDEPENDENT-CROSSWALK-I3-6-HARNESS-SOURCE-FIX-20260817.md`**.
Último exact DEV build-lock: `app/docs/evidence/I3-2C-DEV-BUILD-LOCK-LATEST.json`.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR/workflow; no reauditoría general.

## Frozen/no reprocess

I1/I2 PASS; I3.1/I3.2/I3.3/I3.4/I3.7 PASS; Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; TARGET_B Admin `32049054855` PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal V0.4 receipt durable PASS/no autoaccept.

## I3.5A source hunt result

Runtime previo: identityMap 208, reviewQueue 145, reason `no_exact_hr_crosswalk`; target live `shp-57d2e3769946` sin canonical mapping, 2 visitas agosto residuales; canonical `TYA_GT_0C0BA8856E` con 0 agosto.

El live `shp-*` y `shopperCode` derivan de texto HR y no son anclas canónicas independientes. No fuzzy/name/email/phone/username/hash shortcut.

Los contratos existentes definen candidatos `shopperIdentityLinks`, pero `writeStatus=not_written`; no se localizó en repo una autoridad independiente materializada para el target. Estado: `I3_5_PROVIDER_BACKED_CROSSWALK_MATERIALIZATION_REQUIRED`.

## I3.6

Producto/evidencia historical Shopper continúa frozen PASS. Harness source fix `84d26871c6f0cff96eaa84a8789d78b462e190ee` trae read-only el commit histórico si falta en shallow checkout antes de comparar blobs. Combined status observado: success. Historical Shopper access/reset/recovery = 0.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15` = **35% / 65% formal**.

El 35% permanece porque I3 entrega sus 25 puntos únicamente al cierre I3.11. Operativamente I3.1/.2/.3/.4/.7 están PASS y I3.6 está frozen PASS de producto con harness source fixed; I3.5 es el blocker real actual.

## Siguiente acción exacta

`I3.5B_PROVIDER_BACKED_EXACT_CROSSWALK_VALIDATE_AND_MATERIALIZE_ONE_TARGET`.

Primero provider read/validation de autoridad técnica exacta independiente. Si no se demuestra: STOP, cero writes. Si se demuestra: máximo un identity-link materialization/update necesario + provider ACK/readback. Cero Historical Shopper/Auth/password/HR/Finance/Rules/Storage/Make/Gemini/payment/deploy/merge/production fuera del gate.
