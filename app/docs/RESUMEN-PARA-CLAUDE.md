# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 14:06 -06:00  
**Estado:** `NO_REPROCESS__I3_2B_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_ADAPTER_FIX_SOURCE_PASS__NO_UI_REBUILD`

## Fuente actual

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## No tocar

No nueva candidata/rama/PR/workflow. No reconstruir Dashboard/Shoppers/Postulaciones/Finance/HR/Auth. No tocar `app/modules` ni `app/core` por este blocker.

Preservar Historical Shopper `31906391682`, Admin `32049054855`, HR 15/660, Finance V2/historical, canonical V2/exact identity y legal previous gates.

## Hallazgo exacto

I3.2B runtime artifact aisló `staff_first_NO_PERIODS_VISIBLE` con 15 periodos/660 visitas correctos, current `cinepolis-2026-08`, rail/view montado, project selector sí y period selector no.

Legal estaba loaded=true, pending=false, providerAuthority=true y sin modal/error: no es el blocker actual.

## Causa

Dentro de `CX.app.enter()`, el wrapper Auth reconstruye temporalmente `CX.session.user`; el router monta antes del post-enter membership republish. En esa ventana, el compat bridge antiguo no veía `membershipVerified` y caía al legacy `p.id===scopeProjectId`; `cinepolis` no coincide con IDs de periodo `cinepolis-YYYY-MM`.

## Fix permitido ya aplicado

`app/adapters/tya-phase-a-authority-compat-v1.js`, commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`.

Fallback transitorio únicamente desde `CX_C6_LIVE_USER_ADMIN_WIRING` ya verificado y con contexto Auth tenant/namespace/role/projectIds exactamente iguales. Nunca raw scopeProjectId. Sin patch de rail/router/core/modules.

QA source-only commit `a3e130387ceb4148aac85053dd4a2af471202a95`; run `32063359036` PASS, cero provider/deploy/writes.

## Claude — prohibido

No ocultar `Sin periodos disponibles`, no hardcodear agosto/cinepolis en UI, no cambiar router/core para compensar, no autoaccept legal, no revertir adapters V2, no convertir assignment HR en postulación.

## Progreso

Formal 35%/65%. I3.1 PASS; I3.2B causa exacta + source fix PASS; runtime post-fix pendiente.

## Siguiente acción

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX` bajo nuevo gate. Si PASS, I3.2/I3.3 cierran y sigue I3.4→I3.7.

Clasificación: Reusable = verified-scope lifecycle; Exclusivo cliente = TyA/Cinépolis; Claude/prototipo = no UI change; Academia = lifecycle race; Sin impacto Claude = tooling/gates excepto no revertir.
