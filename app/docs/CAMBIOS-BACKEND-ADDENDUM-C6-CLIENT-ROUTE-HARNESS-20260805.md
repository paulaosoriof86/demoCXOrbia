# CAMBIOS-BACKEND — Addendum C6 Client route harness

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · QA/harness · Sin cambio funcional en runtime

## Diagnóstico previo

```text
PASS_C6_CLIENT_ROUTE_WAIT_DIAGNOSTIC_CLASSIFIED
OWNER=HARNESS
CODE=HARNESS_NAV_ACTIVE_SUBCONDITION_MISMATCH
```

El Portal Cliente ya renderizaba `cli_dashboard`; la condición inválida era exigir `#nav-cli_dashboard.active` después de navegación directa del router.

## Cambios ejecutados en este bloque

### `tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs`

- incorporó una transformación efímera y fail-closed del gate semántico;
- eliminó únicamente la dependencia de `#nav-cli_dashboard.active`;
- exigió `session.view`, `#view`, `.ph`, texto no vacío y ausencia de excepción;
- agregó `predicateVersion=session-view-canonical-render-v1`;
- valida sintaxis antes de ejecutar;
- no modifica el archivo funcional desplegado.

### `tools/release/cxorbia-phase-a-runtime-multirole-runner.mjs`

- agregó el modo `remote_domain_semantic_only`;
- ejecuta exclusivamente el gate semántico remoto;
- comprueba el predicado exacto autorizado;
- preserva cero deploy y cero writes.

### `.github/cxorbia-gate-requests/request.json`

- request único creado, consumido y deshabilitado;
- ejecución permitida final: `0`;
- evidencia y estado seguro incorporados.

### Evidencia creada

- `app/docs/evidence/CORTE6-REMOTE-DOMAIN-SEMANTIC-CLIENT-PREDICATE-PASS-LATEST.json`.

### Documentación actualizada

- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`;
- este addendum;
- `RESUMEN-PARA-CLAUDE-ADDENDUM-C6-CLIENT-ROUTE-HARNESS-20260805.md`;
- `PENDIENTES-PROTOTIPO-ADDENDUM-C6-CLIENT-ROUTE-HARNESS-20260805.md`;
- `ACADEMIA-IMPACTO-C6-CLIENT-ROUTE-HARNESS-20260805.md`;
- PR #7.

## Resultado

```text
run=31025221503
job=92392748352
artifact=8940832844
PASS_READONLY_POST_GATES
PASS_PHASE_A_REMOTE_DOMAIN_FINANCE_PORTALS_RESERVATIONS_DYNAMIC
```

Cliente, Shopper, Finanzas y Reservas pasaron. El repositorio quedó sin delta generado por el gate.

## Archivos bloqueados/no tocados

- `/app/modules/**`;
- `/app/core/**` funcional;
- Login y router;
- Firebase Hosting y producción;
- Auth, claims, memberships, Firestore, Rules, Storage y HR.

## Seguridad

```text
Hosting deploys del bloque=0
Cloud Run=0
Firestore/Auth/Rules/Storage/HR writes=0
Make/Gemini/pagos=0
merge=false
production=false
```

El comentario automático opcional del workflow recibió HTTP 403; fue telemetría no bloqueante. Artifact, commit status, enforcement y resultado técnico: PASS.
