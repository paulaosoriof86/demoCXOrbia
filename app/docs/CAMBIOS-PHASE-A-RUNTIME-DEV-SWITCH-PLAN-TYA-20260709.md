# Cambios - Phase A runtime DEV switch plan TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`

## Archivos agregados

- `backend/contracts/phase-a-runtime-dev-switch-plan-v1.json`
- `tools/contracts/tya-phase-a-runtime-dev-switch-plan-validate.mjs`
- `app/docs/PHASE-A-RUNTIME-DEV-SWITCH-PLAN-TYA-20260709.md`

## Objetivo

Separar solicitud GO de cambio tecnico runtime DEV, dejando un plan futuro que no ejecuta runtime ni writes.

## Decision tecnica

- Plan only.
- No runtime switch.
- No writes.
- No imports.
- No deploy.
- No HR writes.
- No Make/Gemini.
- No pagos reales.
- No UI/core.

## Impacto Phase A

Evita mezclar autorizacion con ejecucion tecnica. El runtime DEV debera ser un paso separado, con GO exacto, readiness limpio, rollback y smoke.

## Impacto backend reusable

Patron reusable para separar request gate, switch plan, switch execution, smoke, rollback y produccion.

## Impacto Claude/prototipo

Claude debe representar esto como arquitectura futura bajo gate, no como integracion activa.

## Impacto Academia

Debe explicar GO request vs runtime switch, DEV preview vs produccion, smoke, rollback y estabilidad de `CX.data`.

## Estado seguro

Sin cambios en `/app/modules` o `/app/core`, sin runtime, sin switch ejecutado, sin deploy, sin produccion, sin Firestore/Auth/Storage, sin HR writes, sin Make/Gemini, sin correos/WhatsApp reales, sin pagos reales, sin import real y sin datos sensibles.

## Commits

- `f31a650c7c58144a7fe083d1dddfac552482c49d`
- `891524edf4d7dc33a6c52c6e5375ff2b9247e693`
- `fe0cef808aafc5f0fb6e266bab31a7e05468a105`
