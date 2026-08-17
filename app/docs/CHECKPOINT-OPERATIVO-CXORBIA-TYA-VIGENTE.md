# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-17 13:18 -06:00  
**Estado:** `UNIFIED_PLAN_LOCKED__I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__TARGET_B_ADMIN_PASS__LEGAL_HUMAN_ACTION_DONE_READBACK_PENDING__AUTHORITY_COMPOSITION_SOURCE_PASS__I3_RUNTIME_VALIDATION_NEXT__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Plan de secuencia prevalente:
`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Source lock técnico prevalente:
`SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## No reprocesar

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- Historical Shopper run `31906391682` PASS congelado; reset único consumido; continuaciones `passwordResets=0`; no credential access/reconcile/recovery.
- request08 consumido/no rerun.
- TARGET_B Admin: Firebase password sign-in real PASS run `32049054855`; Paula ingresó. No crear/rotar/reemplazar.
- materialización legal V0.4 y deploy legal DEV previos no se rerun.
- HR viva no se reimporta.
- Finance V2 y fuentes source-safe/historical payments no se reconstruyen.

## Plan unificado

El plan actual NO reemplaza el anterior. Unifica:

- Cortes 0B→8 = cobertura funcional;
- S1→S6 = controles forenses intermedios;
- I1→I5 = avance formal;
- subgates I3/I4/I5 = secuencia exacta sin pasos implícitos.

Los seis S1→S6 quedan dentro de I1→I5 y no forman un plan paralelo.

## HR / regresión actual

HR viva comprobada: 15 periodos / 660 visitas hasta AGO 2026; agosto = 44 (GT 34/HN 10). KPI estructurales: 44 total, 32 asignadas, 12 sin asignar, 25 agendadas, 7 sin agendar, 18 realizadas, 26 pendientes de realizar.

Protected overlay observado = 616; diferencia exacta 44. Interpretación: overlay anterior + periodo nuevo HR. No reimportar ni reprocesar 616; crosswalk exacto del periodo nuevo se trata en I3.5.

Causas raíz source-only cerradas:

1. scope membership `cinepolis` como proyecto raíz era comparado contra IDs de periodo;
2. asignaciones HR eran convertidas en `hr-post-*` y presentadas como postulaciones.

Delta source-only:

- `app/adapters/tya-phase-a-authority-compat-v1.js`;
- wiring en `app/index-backend-dev.html`;
- source PASS, deploy DEV del delta todavía pendiente.

## Legal

Paula ya realizó la aceptación humana V0.4. Falta I3.7: provider ACK/readback durable del receipt exact identity/version/digest + reload/new-tab. La doble presentación queda P1 no bloqueante mientras no impida sesión/rutas. No automatizar consentimiento.

## I3 — pendientes exactos

- I3.2 runtime validation + exact DEV deploy bajo gate;
- I3.3 proyecto/15 periodos/AGO/660;
- I3.4 postulación persistida separada de assignment HR;
- I3.5 crosswalk exacto agosto/reviewQueue;
- I3.6 Mi Perfil + histórico Shopper sin reproceso;
- I3.7 legal receipt readback durable;
- I3.8 Admin create/update de un único Shopper nuevo por provider ACK;
- I3.9 login/reload/new-tab/segundo contexto del Shopper nuevo;
- I3.10 KPI derivados/state semantics;
- I3.11 cierre integral I3 same-build.

El punto Admin/new Shopper **sigue siendo obligatorio** y no se considera resuelto por el PASS del Admin existente ni por el Shopper histórico.

## I4 — cobertura obligatoria cuando I3 cierre

I4 integra operación completa: documentos/instructivos, certificación e histórico, visitas disponibles, postulaciones, asignación, agenda, reprogramación/cancelación, realizada, cuestionario, submit/revisión, HR bidireccional/Make gated, Finanzas, multi-proyecto/configuración, roles/scopes, evidencias/Storage según flujo, Academia/manuales/rutas/notificaciones, Gemini gated según necesidad y S6 E2E integral del mismo build.

## I5 — producción

Exact SHA → manifest/build-lock/verificador → preproducción remota → rollback → E2E same-build → autorización producción → deploy/cutover/smoke → `ACTIVE_BASELINE_PHASE_A_PRODUCTION`.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** Subgates cerrados no se repiten.

## Acción siguiente exacta

`I3.2_PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_AND_EXACT_DEV_DEPLOY_NO_REPROCESS`.

No nueva candidata/rama/PR, no nueva auditoría general, no Auth histórico, no HR import, no reconstrucción Finance, no merge/producción sin gate.