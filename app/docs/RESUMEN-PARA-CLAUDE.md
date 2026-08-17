# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 14:15 -06:00  
**Estado:** `NO_REPROCESS__I3_2B_NO_PERIODS_ROOT_CAUSE_PROVEN__FOCAL_ADAPTER_FIX_SOURCE_PASS__I3_2C_NEXT__NO_UI_REBUILD`

Plan: `ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.
Source lock: `SOURCE-LOCK-I3-2B-NO-PERIODS-LIFECYCLE-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## No tocar

No nueva candidata/rama/PR/workflow. No reconstruir Dashboard/Shoppers/Postulaciones/Finance/HR/Auth. No tocar `app/modules` ni `app/core` por este blocker.

Preservar Historical Shopper `31906391682`, Admin `32049054855`, HR 15/660, Finance V2/historical, canonical V2/exact identity y legal previous gates.

## Hallazgo exacto

I3.2B runtime artifact aisló `staff_first_NO_PERIODS_VISIBLE` con 15 periodos/660 visitas correctos, current `cinepolis-2026-08`, rail/view montado, project selector sí y period selector no.

Legal loaded=true, pending=false, providerAuthority=true, error/modal ausentes: no es el blocker actual.

## Causa y fix

Dentro de canonical `CX.app.enter()`, Auth wrapper reconstruye temporalmente `CX.session.user`; `router.mount()` ocurre antes del post-enter membership republish. El compat bridge antiguo caía al legacy `p.id===scopeProjectId`, por lo que root project `cinepolis` no coincidía con period IDs `cinepolis-YYYY-MM`.

Fix focal: `app/adapters/tya-phase-a-authority-compat-v1.js`, commit `852ce453e7a65c5a49bdbfc378cdd1866ac0c697`. Solo usa membership C6 ya verificada y backend Auth context exactamente coincidente en tenant/namespace/role/projectIds durante esa ventana. Nunca raw scopeProjectId. Sin patch rail/router/core/modules.

QA focal commit `a3e130387ceb4148aac85053dd4a2af471202a95`; source-preflight `32063359036` PASS, provider/deploy/writes 0.

## Prohibido para Claude

No hardcodear agosto/cinepolis en UI, no ocultar estados fail-closed, no autoaccept legal, no revertir adapters V2, no transformar assignment HR en postulación, no copiar módulos anteriores.

## Progreso

Formal 35%/65%. I3.1 PASS; I3.2B exact root cause + source fix PASS; post-fix runtime pending.

## Siguiente frontera

`I3.2C_EXACT_DEV_RUNTIME_CONFIRM_NO_PERIODS_LIFECYCLE_FIX` bajo gate nuevo. PASS closes I3.2/I3.3; then I3.4→I3.7 directly.

Clasificación: Reusable = verified-scope lifecycle; Exclusivo cliente = TyA/Cinépolis; Claude/prototipo = no UI change; Academia = lifecycle race; Sin impacto Claude = tooling/gates except preserving fix.
