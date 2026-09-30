# RESUMEN PARA CLAUDE — ADDENDUM RUNNERS CONTROLADOS

**Fecha:** 2026-07-22  
**Estado:** `SIN_NUEVA_CANDIDATA_SIN_CAMBIO_FRONTEND`

## Qué cambió

Se creó infraestructura backend/QA para que ChatGPT pueda aplicar futuras candidatas auditadas y ejecutar gates con navegador sin depender de Codex:

- `CXORBIA_ATOMIC_APPLY_RUNNER`;
- `CXORBIA_READONLY_POST_GATES_RUNNER`.

## Impacto para Claude

Claude no debe modificar, duplicar, eliminar ni reinterpretar:

- `.github/workflows/cxorbia-atomic-apply-runner.yml`;
- `.github/workflows/cxorbia-readonly-post-gates-runner.yml`;
- `backend/contracts/cxorbia-controlled-runners-v1.json`;
- `tools/release/cxorbia-atomic-apply-runner.mjs`;
- `tools/release/cxorbia-readonly-post-gates-runner.mjs`;
- `tools/qa/cxorbia-controlled-runners-contract-gate.mjs`.

Estos archivos pertenecen al carril backend/QA y no al frontend comercializable.

## Qué se preserva

- V174 permanece como candidata empalmada.
- No se solicita una nueva candidata por este bloque.
- No se modificaron `app/modules/**` ni `app/core/**` durante el bootstrap de runners.
- `CX.data` y su interfaz permanecen iguales.
- Las reglas canónicas de ausencia distinta de cero, identidad Shopper fail-closed, sourceRevision y estados ortogonales se mantienen.

## Para futuras candidatas

Claude seguirá entregando frontend completo, pero el empalme será responsabilidad del carril controlado:

1. auditoría delta de la candidata;
2. source lock con SHA e inventario;
3. aplicación de los archivos GO mediante `CXORBIA_ATOMIC_APPLY_RUNNER`;
4. gates mediante `CXORBIA_READONLY_POST_GATES_RUNNER`;
5. validación visual.

Claude no debe incluir workflows transportadores, planes de empalme, `incoming/`, PowerShell ni instrucciones manuales para Paula.

## Pendiente frontend vivo

No surge un nuevo pendiente frontend por los runners. Permanecen únicamente los pendientes ya documentados de V174 y validación visual posterior.

## Academia

La Academia debe explicar el principio reusable:

- una entrega frontend no se considera aplicada por estar auditada;
- un empalme exige commit/push/HEAD verificables;
- los gates deben ejecutarse contra el composite exacto;
- la automatización controlada no equivale a deploy o producción.

## Clasificación

- **Reusable CXOrbia:** patrón de entrega auditada y aplicación atómica.
- **Exclusivo cliente:** ninguno en la infraestructura; el primer perfil de gates usa TyA.
- **Claude/prototipo:** preservar runner contract y no incorporar infraestructura en la candidata.
- **Academia:** integridad de entrega, gates y evidencia.
- **Sin impacto Claude:** Actions, Playwright, artifacts y permisos.
