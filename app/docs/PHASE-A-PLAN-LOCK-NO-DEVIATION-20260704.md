# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Última sincronización:** 2026-08-17 14:11 -06:00  
**Estado:** `ACTIVO__UNIFICADO__NO_REPROCESO__I1_PASS__I2_PASS__I3_1_PASS__I3_2B_NO_PERIODS_ROOT_CAUSE_FIXED_SOURCE_ONLY__I3_2C_GATE_NEXT__I4_I5_PENDIENTES`

## Lock

Secuencia/porcentaje/subgates: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Estado técnico: source lock más reciente declarado en `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

Cortes 0B→8 y S1→S6 se preservan dentro de I1→I5; no son planes paralelos.

## Avance

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `0/25 EN CURSO`; I4 `0/25`; I5 `0/15`.

**35% / 65%.** I3 integral →60%; I4→85%; I5→100%.

## No reprocesar

Historical Shopper `31906391682` PASS/reset consumido; TARGET_B Admin `32049054855` PASS; request08 consumido; HR 15/660 no reimport; Finance V2/historical no rebuild; canonical V2/exact identity preserved; legal previous materialization/deploy no rerun/autoaccept.

## I3.2B estado

Runtime run `32062886562` aisló `staff_first_NO_PERIODS_VISIBLE` con 15 periods/660 visits y current August correctos; rail/view mounted, project selector present, period selector absent. Legal loaded/provider-backed/not pending.

Root cause exact: durante canonical `CX.app.enter()`, Auth wrapper reconstruye temporalmente la sesión y `router.mount()` ocurre antes del post-enter membership republish; el compat bridge perdía la membership flag y caía al legacy `p.id===scopeProjectId`, ocultando `cinepolis-YYYY-MM` bajo root scope `cinepolis`.

Fix focal source-only `tya-phase-a-authority-compat-v1.js` commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`: solo usa membership C6 ya verificada con tenant/namespace/role/projectIds exactos durante esa ventana. No raw scopeProjectId, no UI/core/modules.

QA commit `a3e130387ceb4148aac85053dd4a2af471202a95`; source-preflight run `32063359036` PASS, provider/deploy/writes 0.

## Definición de terminado

`FUENTE/REGLA → ADAPTER/MAPPING → GATE SEMÁNTICO → BUILD EXACTO → VALIDACIÓN REAL → CORRECCIÓN FOCAL → EVIDENCIA/HEAD → DOCUMENTACIÓN → FREEZE`.

## Siguiente acción

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX`.

Requiere gate nuevo porque I3.2B consumió su único deploy. Debe certificar period selector + 15/660/AGO + legal no-pending + reload/new-tab. Si PASS, cerrar I3.2/I3.3 y seguir I3.4→I3.7 directamente; luego I3.8→I3.11, I4.1→I4.12 e I5.1→I5.8.

No nueva candidata/rama/PR/workflow, no reauditoría, no producción sin gate.
