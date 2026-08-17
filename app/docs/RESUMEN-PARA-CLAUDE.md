# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-17 13:34 -06:00  
**Estado:** `UNIFIED_PHASE_A_PLAN__SAME_CANDIDATE__ADMIN_PASS_FROZEN__HISTORICAL_SHOPPER_PASS_FROZEN__I3_1_SOURCE_PASS__I3_2_DEV_DEPLOY_PARITY_PASS_RUNTIME_FOCAL_FAIL__NO_MODULE_REBUILD`

## Lock de continuidad

No nueva candidata/rama/PR. No reconstruir Auth, Shoppers, Finanzas, HR, KPI ni módulos ya resueltos. No tocar `app/modules` ni `app/core` por el blocker actual.

Plan de secuencia:
`ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Source lock técnico:
`SOURCE-LOCK-I3-2-DEV-DEPLOY-PARITY-PASS-RUNTIME-BLOCKER-DIAGNOSTICS-SOURCE-PASS-20260817.md`.

## No tocar / no reprocesar

- Historical Shopper `31906391682` PASS; reset único consumido; `passwordResets=0`.
- TARGET_B Admin sign-in PASS `32049054855`; Paula ingresó. No crear/rotar/reemplazar.
- request08 consumido/no rerun.
- I1/I2 PASS.
- HR 15 periodos / 660 visitas; no reimportar.
- Finance V2 + source-safe/historical payments; no reconstruir.
- exact identity contract: no nombre/email/teléfono/WhatsApp/username como matching.

## Candidata canónica preservada

El entry vivo conserva cumulative read model V2, canonical Shopper portal V2, protected HR authority V2, state semantics V2, Finance V2 y financial source-safe adapter. La regresión actual sigue siendo de integración/runtime, no pérdida general de módulos.

## I3.1 — cerrado

Scope membership root-project/program compatible con period rows y assignment HR separado de postulación persistida. No revertir `tya-phase-a-authority-compat-v1.js` ni su wiring.

## I3.2 — avance y blocker

Run `32058831910`, job `95475132736` desplegó una vez el source autorizado a Firebase Hosting DEV.

PASS:
- source/preflight;
- deploy DEV exacto;
- remote parity root/direct;
- remote hash `952319a9a2cac7e61eff01f21c67f8e079de695e3bbc67767c4023c47f8271a7`.

FAIL focal:
`staff_first_VISIBLE_SHELL_OR_SOURCE_BLOCK`.

El readiness previo al FAIL ya confirmó Auth Staff, membership, protected HR authority, data projects/visits no vacíos, currentProjectId/currentPeriodId y app visible/login hidden. El harness antiguo juntaba en una sola aserción empty shell/backend empty/no project/no period/source block, así que no existe evidencia para rediseñar ningún módulo.

## Focal source-only

Solo se modificó `tools/qa/tya-c6-staff-admin-human-auth-browser-smoke.mjs` para separar errores y registrar snapshot sanitizado de:

- router/shell mounted;
- selector proyecto;
- selector periodo;
- empty/source flags;
- legal loaded/pending/provider authority/error/modal.

Commit `58b39f0cff760a37cb00a0f4d4e2adabcea5c24e`.

Source-only preflight `32060010492` / `95478920028`: PASS, cero provider/deploy/writes.

## Legal

`CX.app.enter()` difiere `CX.router.mount()` mientras `CX.confidencialidad.pending(...)` esté activo. Paula ya hizo la aceptación humana V0.4, pero I3.7 durable provider readback sigue pendiente y hubo doble presentación. Legal es hipótesis fuerte del blocker, NO causa declarada hasta el siguiente snapshot granular. No autoaceptar ni esconder el modal.

## Qué Claude NO debe hacer

- no copiar versiones antiguas de Dashboard/Shoppers/Postulaciones/Finanzas;
- no quitar fail-closed guards para hacer pasar la prueba;
- no convertir assignment HR en postulación;
- no inventar proyecto/periodo en UI;
- no tocar legal/NDA para autoaceptar;
- no hacer cherry-pick/rollback de módulos completos.

## I3 restante

I3.2B runtime granular → I3.3 proyecto/periodos/660 → I3.4 postulations authority → I3.5 exact crosswalk → I3.6 Mi Perfil/history → I3.7 legal receipt durable → I3.8/I3.9 new Shopper provider flow/login → I3.10 KPI semantics → I3.11 same-build closure.

## Progreso

Formal: I1 15/15; I2 20/20; I3 0/25; I4 0/25; I5 0/15 = **35% / 65%**. I3.2 partial no otorga puntos todavía; no se repite su deploy PASS.

## Siguiente frontera

`I3.2B_GRANULAR_AUTHENTICATED_STAFF_RUNTIME_RECHECK_AFTER_DIAGNOSTICS_SOURCE_PASS`.

El one-shot anterior está consumido. Una nueva ejecución autenticada/deploy requiere gate nuevo; no rerun automático.

## Clasificación

- Reusable CXOrbia: same-build parity, granular runtime diagnostics, router-mounted readiness.
- Exclusivo cliente: TyA DEV/legal receipt.
- Claude/prototipo: preservar módulos; P0 solo focal con evidencia.
- Academia: handoff efectivo requiere router/contexto, no solo app visible.
- Sin impacto Claude: tooling/gates; sí requiere no revertir decisiones.
