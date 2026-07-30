# CAMBIOS-BACKEND.md

> Registro principal de cambios backend. Para bloques recientes, revisar también los addenda fechados en `app/docs/` y el índice vigente.

## Estado vigente 2026-07-30

Ver:
- `CAMBIOS-BACKEND-ADDENDUM-CORTE5-HOSTING-EXISTENTE-AUTH-PREFLIGHT-20260730.md`;
- `CORTE5-EXISTING-HOSTING-DEV-PREFLIGHT-AUTH-DEPENDENCY-20260730.md`;
- `CORTE6-AUTH-RBAC-MINIMAL-PLAN-NO-EXECUTE-20260730.md`;
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.

Estado resumido:
- backend canónico `cxorbia-backend-dev`;
- R17N 1,406 writes/readback PASS;
- CX.data period model P0 corregido y re-smoke PASS;
- Hosting DEV existente confirmado `cxorbia-backend-dev.web.app` / target `cxorbia-dev`;
- un redeploy autorizado, **0 ejecutados y autorización no consumida**;
- preflight HOLD antes de deploy porque PII real requiere Firebase Auth/claims y el alcance actual prohíbe Auth writes/Rules deploy;
- no nuevo Firebase/Hosting, no producción.

Los registros históricos completos previos permanecen en el historial Git y en los addenda fechados del repositorio; este archivo principal apunta al source lock vigente para evitar divergencia documental.
