# Claude package index - reusable backend patterns CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se consolido indice para que el proximo paquete Claude no pierda los patrones reutilizables generados desde backend.

Este documento apunta a los addenda, contratos y checklists que Claude debe leer antes de generar nueva candidata de prototipo.

## Actualizacion de continuidad

Este indice se actualizo para incluir los bloques posteriores ya confirmados:

- sync Academia / reglas de proyecto;
- estados de beneficios/liquidaciones;
- workflow remote smoke post-staging;
- matriz de cutover;
- readiness de cierre Phase A.

## Documentos fuente para Claude

### Maestro y metodologia

- `app/docs/ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
- `app/docs/TEMPLATE-CLASIFICACION-BLOQUE-BACKEND-CXORBIA-20260707.md`

### Patrones backend/producto reutilizables

- `app/docs/CLAUDE-PATRONES-REUTILIZABLES-BACKEND-PRODUCTO-CXORBIA-20260707.md`
- `app/docs/PROJECT-CONFIG-CONTRACT-REUSABLE-CXORBIA-20260707.md`
- `app/docs/INTEGRATION-GATE-STATE-CONTRACT-REUSABLE-CXORBIA-20260707.md`
- `app/docs/HUMAN-REVIEW-QUEUE-CONTRACT-REUSABLE-CXORBIA-20260707.md`
- `app/docs/ACADEMIA-PROJECT-RULES-SYNC-CONTRACT-REUSABLE-CXORBIA-20260707.md`
- `app/docs/SETTLEMENT-STATE-CONTRACT-CXORBIA-20260707.md`
- `app/docs/CUTOVER-AUTHORIZATION-MATRIX-CXORBIA-20260707.md`

### Validacion y salida controlada

- `app/docs/PHASE-A-TODAY-FINISH-READINESS-20260707.md`
- `app/docs/REMOTE-SMOKE-WORKFLOW-POST-STAGING-CXORBIA-20260707.md`
- `app/docs/POST-STAGING-SMOKE-CHECKLIST-RC-PHASE-A-20260707.md`
- `app/docs/RC-PHASE-A-STAGING-DEPLOY-RUNBOOK-20260707.md`

### Sync e integraciones

- `app/docs/ASSIGNMENT-SYNC-CONFLICT-PREVIEW-PHASE-A-20260707.md`
- `app/docs/ASSIGNMENT-SYNC-OUTBOX-CONTRACT-PHASE-A-20260707.md`

## Scripts/contratos relacionados

- `tools/contracts/cxorbia-project-config-contract.mjs`
- `tools/contracts/cxorbia-integration-gate-state-contract.mjs`
- `tools/contracts/cxorbia-human-review-queue-contract.mjs`
- `tools/contracts/cxorbia-academia-project-rules-sync-contract.mjs`
- `tools/contracts/cxorbia-liquidation-payment-state-contract.mjs`
- `tools/migration/tya-assignment-sync-conflict-preview.mjs`
- `tools/migration/tya-assignment-sync-outbox-contract.mjs`
- `tools/release/tya-phase-a-today-finish-readiness.mjs`
- `tools/qa/tya-phase-a-remote-smoke.mjs`

## Instruccion para Claude

Claude debe tratar estos documentos como entrada de producto, no solo como documentacion backend.

Debe incorporar en el prototipo comercializable:

1. Estados visuales honestos de backend e integraciones.
2. Configuracion por tenant/proyecto sin hardcodes de cliente.
3. Representacion de gates: apagado, preview, bloqueado, listo, activo controlado, pausado y fallo.
4. Bandeja/estado de revision humana para conflictos, importaciones, beneficios/liquidaciones, certificaciones, integraciones y Academia.
5. Copy generico para acciones pendientes, simuladas, bloqueadas, listas para gate o reales con evidencia.
6. Academia conectada a reglas configurables, roles, manuales, cursos y notificaciones.
7. Preparacion para validar rutas por smoke visual/remote smoke.
8. Estados visibles de beneficios/liquidaciones separados de visitas ejecutadas.
9. Estados de contenido Academia: faltante, borrador, revision humana, aprobado, publicado y archivado.

## Lo que Claude no debe generalizar

No debe convertir en logica base del producto:

- reglas especificas del cliente actual;
- un proyecto como unico flujo global;
- una fuente externa como unica arquitectura;
- un cuestionario externo como unico modo;
- pagos, certificaciones o liquidaciones especificas como reglas universales.

Todo eso debe quedar como configuracion de tenant/proyecto.

## Pendientes Claude derivados

- Estados/gates visibles por modulo.
- Badges de configuracion por tenant/proyecto.
- Bandeja de revision humana o estados equivalentes.
- Copy honesto reusable.
- Academia profunda asociada a configuracion por rol/proyecto.
- Evitar hardcodes de cliente en modulos reutilizables.
- Estados de beneficios/liquidaciones por periodo, moneda y proyecto.
- Vinculo entre reglas de proyecto y contenido Academia.

## Clasificacion del bloque

### Reusable CXOrbia

Este indice es reusable para futuros paquetes Claude y para proximos clientes.

### Exclusivo cliente

No contiene logica exclusiva del cliente actual; solo referencias a documentos Phase A actuales.

### Claude/prototipo

Este documento debe incluirse en el proximo paquete Claude.

### Academia

Refuerza que Academia debe recibir patrones de configuracion, gates, revision humana y cambios por rol.

### Sin impacto Claude

No hay cambio UI directo.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports, sin lectura de secrets y sin datos sensibles.
