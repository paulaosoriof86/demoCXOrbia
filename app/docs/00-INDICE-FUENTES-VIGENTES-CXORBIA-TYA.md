# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-17 14:19 -06:00  
**Estado vivo:** `I1_PASS__I2_PASS__I3_1_PASS__I3_2B_EXACT_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_SOURCE_FIX_PASS__I3_2C_RUNTIME_GATE_NEXT__GO_LIVE_35`

## Prevalencia

Secuencia/porcentaje/subgates: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock técnico actual: **`SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`**.

## Carril

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

No nueva candidata/rama/PR/workflow; no reauditoría general.

## Frozen/no reprocess

I1/I2 PASS; Historical Shopper `31906391682` PASS/reset consumed/`passwordResets=0`; TARGET_B Admin `32049054855` PASS; request08 consumed; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal previous materialization/deploy no rerun/autoaccept.

## I3.2B exact result

Runtime run `32062886562` isolated **`staff_first_NO_PERIODS_VISIBLE`** while Staff membership, 15 periods, 660 visits, current August, authority/data, rail/view and project selector were all valid. Period selector alone was absent. Legal loaded/provider-backed/not pending.

Root cause: transient membership metadata loss inside canonical Auth wrapper before synchronous router mount; legacy period-id filter was used during that narrow window.

Fix source-only: `tya-phase-a-authority-compat-v1.js` commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`, exact verified tenant/namespace/role/projectIds fallback only. QA commit `a3e130387ceb4148aac85053dd4a2af471202a95`; source-preflight `32063359036` PASS, zero provider/deploy/writes.

## Progress

I1 `15/15`; I2 `20/20`; I3 formal `0/25`; I4 `0/25`; I5 `0/15` = **35%/65%**.

## Next exact action

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX`.

Requires a new exact gate because I3.2B consumed its one deploy. PASS must certify period selector + 15/660/AGO + legal no-pending + 3 reloads + new-tab. Then close I3.2/I3.3 and continue I3.4→I3.7 directly.
