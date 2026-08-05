# CAMBIOS-BACKEND — Addendum C6 client route harness

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Sin impacto funcional en runtime

## Archivos creados

- `tools/qa/tya-c6-client-route-wait-diagnostic.mjs`: diagnóstico focal read-only por subcondición del Portal Cliente.
- `app/docs/evidence/CORTE6-CLIENT-ROUTE-WAIT-DIAGNOSTIC-LATEST.json`: evidencia sanitizada y clasificación.
- `CAMBIOS-BACKEND-ADDENDUM-C6-CLIENT-ROUTE-HARNESS-20260805.md`.
- `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-CLIENT-ROUTE-HARNESS-20260805.md`.
- `PENDIENTES-PROTOTIPO-ADDENDUM-C6-CLIENT-ROUTE-HARNESS-20260805.md`.
- `ACADEMIA-IMPACTO-C6-CLIENT-ROUTE-HARNESS-20260805.md`.

## Archivos técnicos tocados

- `backend/contracts/cxorbia-controlled-runners-v1.json`: perfil focal read-only registrado.
- `.github/workflows/cxorbia-readonly-post-gates-runner.yml`: soporte del perfil focal en el carril actual.
- `tools/release/cxorbia-phase-a-runtime-multirole-runner.mjs`: dispatch read-only del diagnóstico focal.
- `tools/qa/cxorbia-c6-existing-client-e2e-credential.mjs`: preservación del alias de decisión esperado por el runner legado, manteniendo `canonicalDecision` explícita.
- `.github/cxorbia-gate-requests/request.json`: request consumido y deshabilitado con evidencia observable.

## Documentación actualizada

- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`.
- PR #7 pendiente de actualización ejecutiva.

## Resultado

```text
PASS_READONLY_POST_GATES
PASS_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_CLASSIFIED
OWNER=HARNESS
CODE=HARNESS_NAV_ACTIVE_SUBCONDITION_MISMATCH
```

El producto aceptó `cli_dashboard`, renderizó `#view`, `.ph` y 690 caracteres de contenido, sin excepción. No se modificó runtime ni se desplegó.

## Seguridad

```text
Hosting deploys del bloque=0
Cloud Run=0
Firestore/Auth/Rules/Storage/HR writes=0
Make/Gemini/pagos=0
merge=false
production=false
```
