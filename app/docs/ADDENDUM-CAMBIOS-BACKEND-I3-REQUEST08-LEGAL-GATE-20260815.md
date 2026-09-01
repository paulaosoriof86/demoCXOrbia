# ADDENDUM CAMBIOS-BACKEND — I3 REQUEST08 LEGAL GATE — 2026-08-15

Este documento es addendum vigente de `CAMBIOS-BACKEND.md` para el bloque I3 request08 y debe leerse junto con el source lock correspondiente.

## Bloque

`I3_REQUEST08_OVERLAY_AWARE_ADMIN_NEW_SHOPPER_ONLY`

## Archivos/acciones ejecutadas

- `.github/cxorbia-firebase-requests/cxorbia-i3-shopper-persistence-exact-write-v1.json`
  - request08 autorizado una sola vez;
  - lineage exclusiva request07 + `I3_ADMIN_NEW_SHOPPER_OVERLAY_POINTER_INTERCEPTION_BEFORE_CREATE`;
  - frozen historical checkpoint;
  - `passwordResets=0`;
  - presupuestos y providers prohibidos fail-closed.
- Workflow existente `.github/workflows/cxorbia-c6-staff-repair-bootstrap-exact-write-v2.yml`
  - ejecutado una sola vez; no se creó workflow nuevo.
- `app/docs/SOURCE-LOCK-ITERATION3-REQUEST08-ADMIN-LEGAL-CONFIDENTIALITY-GATE-STOP-RETRY-20260815.md`
  - creado como source lock prevalente del bloque.

## Resultado de ejecución

- request commit: `d21fb78aa012b1739fea03053a0a947fcd379ee4`
- workflow run: `31909354336`
- job: `95071998299`
- parking commit: `8fa887900a5507b606b31dc0386a135060980837`
- decisión: `STOP_RETRY`
- blocker: `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`

El gate legal fue detectado antes de `shopper.create`. Se aplicó fail-closed exactamente como estaba autorizado: no aceptar, firmar, guardar ni automatizar consentimiento.

## Escrituras y seguridad

- nuevo Shopper: no creado;
- Auth writes de nuevo Shopper: 0;
- Firestore writes de nuevo Shopper: 0;
- password resets: 0;
- acceso/reconcile histórico: 0;
- otras identidades: 0;
- HR/Rules/Storage/Make/Gemini/pagos: 0;
- deploy: 0;
- merge: false;
- producción: false;
- no rerun/no segundo intento automático.

## Causa raíz nueva localizada

El runtime protegido llega correctamente hasta el gate legal. El problema ya no es visibilidad del botón ni overlay desconocido: el estado pendiente es legal/confidencialidad real.

La fuente vigente muestra que la aceptación/versionado legal actual está tratada como demo/local en frontend y que el estado de producción firmado/auditado todavía no está demostrado como registro durable cross-context en backend. Por ello no se utilizará una aceptación local del navegador de Paula como supuesto desbloqueo de un runner GitHub limpio.

## Clasificación

- **Reusable CXOrbia:** contrato de aceptación legal durable, account-scoped, versionado, auditado y fail-closed debe ser reusable multi-tenant.
- **Exclusivo cliente:** el texto/versiones concretas del NDA TyA pertenecen al tenant/proyecto, no al core reusable.
- **Claude/prototipo:** mantener UI de consentimiento humano clara; no mostrar éxito si no existe provider ACK; no automatizar consentimiento.
- **Academia:** documentar flujo por rol, versión legal vigente, qué ocurre al cambiar versión y qué hacer si el gate bloquea acceso. Ningún curso debe marcarse completado por aceptar el NDA.
- **Sin impacto Claude:** request/workflow/ledger/parking/source lock son backend/gates.

## Impacto Phase A

GO-LIVE permanece `35% / 65%`. I3 permanece `0/25`; el histórico ya está congelado PASS y no se reabre. El único camino vivo es resolver el contrato durable de aceptación legal y luego retomar Admin/new Shopper con un gate nuevo.

## Siguiente bloque exacto

`I3_LEGAL_ACCEPTANCE_DURABLE_ACCOUNT_SCOPED_CONTRACT_AND_PRODUCTION_WIRING_SOURCE_ONLY`

Source-only; no aceptación legal, provider write, deploy, merge ni producción.
