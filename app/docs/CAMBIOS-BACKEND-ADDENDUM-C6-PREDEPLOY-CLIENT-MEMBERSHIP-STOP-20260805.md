# CAMBIOS BACKEND — C6 predeploy y STOP de membresía Cliente

**Fecha:** 2026-08-05  
**Estado:** `STOP_RETRY_CLIENT_MEMBERSHIP_WRITE_AUTH_REQUIRED__NO_HOSTING_DEPLOY`

## Archivos creados o modificados

### Control plane reusable CXOrbia

- `tools/release/cxorbia-focal-text-patch-runner.mjs`
  - amplió allowlist focal para gates C6, selector de credenciales y materializador Cliente;
  - mantuvo parent exacto, hash exacto, una ruta por request, node check, commit/push atómico y cero deploy.

### Gates y compatibilidad TyA

- `tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`
  - sustituyó la autoridad parcial A+B por `tya-phase-a-complete-composition-source-gate.mjs`;
  - preservó el resto de verificaciones C6.

- `tools/qa/cxorbia-c6-existing-users-e2e-envelope-compat.mjs`
  - eliminó el supuesto congelado de `616` visitas;
  - usa selector HR dinámico;
  - conserva alias compatible para el workflow heredado;
  - no expone credenciales.

- `tools/qa/cxorbia-c6-client-auth-materialization.mjs`
  - preservó `PASS_C6_CLIENT_AUTH_MEMBERSHIP_READBACK` como decisión canónica;
  - agregó alias contextual `PASS_C6_CLIENT_AUTH_READBACK` solo para el workflow heredado;
  - agregó etapa diagnóstica sanitizada, sin secretos.

### Requests y evidencia

- `backend/config/corte6-live-domain-readonly-audit-request.json`
  - consumió intentos 36–40;
  - todos cerraron STOP_RETRY antes del deploy.

- `app/docs/evidence/CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`
  - actualizó source lock exacto por intento.

- `app/docs/evidence/CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`
  - registra el bloqueo final `CLIENT_MEMBERSHIP_READBACK_MISMATCH`.

## Evidencia de commits funcionales

- `26062218d1f2527f6815caf99f94b3cea94944da` — gate C6 sobre composición Phase A activa;
- `06e120d11776307cd63dbc78ed72b8b814a3a0a7` — selector de credenciales con HR dinámico;
- `23aebfedeb03a0e041312a6e3b97bf5916f64d41` — alias de readback Cliente;
- `fc65fe85d12744dfcfeb21f682c23a4cebb788da` — diagnóstico sanitizado de etapa.

## Causa raíz vigente

El usuario Auth Cliente y sus claims pasan la validación canónica. Falla únicamente la membresía Firestore del Portal Cliente. La materialización histórica del 2026-08-02 creó Auth/claims con `firestoreWrites: 0`; el contrato v2 ahora exige el documento `tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`.

## Clasificación

- **Reusable CXOrbia:** gates sin conteos congelados, alias contractuales contextuales y diagnóstico sanitizado.
- **Exclusivo cliente:** tenant `tya`, proyecto `cinepolis` y ruta de membresía.
- **Claude/prototipo:** cero cambios visuales o funcionales de módulos.
- **Academia:** patrón STOP antes del deploy y separación Auth/membership.
- **Sin impacto Claude:** control plane, requests y evidencia.

## Estado seguro

Cero Hosting, Cloud Run, Firestore/Auth/Rules/Storage/HR writes, Make/Gemini, pagos, merge o producción.
