# Integration run contract - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para administracion operativa de ejecuciones de integracion desde plataforma.

Archivo creado:

- `tools/contracts/cxorbia-integration-run-admin-actions-contract.mjs`

## Necesidad cubierta

Las integraciones deben poder observarse, aprobarse, pausarse, revisarse y reportarse sin ejecutar sincronizacion real mientras el gate este apagado.

Debe permitir:

- buscar ejecuciones por proyecto, tipo, estado y gate;
- previsualizar ejecucion;
- aprobar ejecucion en preview;
- pausar ejecucion;
- reintentar solo si el gate lo permite;
- marcar conflicto;
- resolver conflicto con revision;
- exportar reporte de ejecucion.

## Acciones permitidas

- `search_runs`
- `preview_run`
- `approve_run`
- `pause_run`
- `retry_if_allowed`
- `mark_conflict`
- `resolve_conflict`
- `export_run_report`

## Estados requeridos

- `draft`
- `preview_ready`
- `approved_preview`
- `paused`
- `retry_pending`
- `conflict_review`
- `resolved_review`
- `report_ready`
- `blocked_gate`

## Tipos previstos

- `external_source_sync`
- `notification_dispatch`
- `import_pipeline`
- `questionnaire_link_sync`
- `settlement_status_sync`
- `academy_content_sync`

## Reglas clave

- Toda accion debe estar limitada por tenant, proyecto y ejecucion cuando aplique.
- No se permiten acciones globales sobre todas las ejecuciones.
- Preview no equivale a sincronizacion real.
- Reintento requiere gate compatible.
- Conflicto requiere revision humana y no debe resolverse silenciosamente.
- Reporte de ejecucion debe quedar disponible para auditoria.
- Ninguna integracion externa debe activarse sin autorizacion y gate activo.

## Pendiente para Claude

Claude debe incorporar en Integraciones:

- buscador por proyecto, tipo, estado y gate;
- vista de ejecuciones y reportes;
- acciones para previsualizar, aprobar preview, pausar, marcar conflicto y resolver con revision;
- estado visible de gate;
- razon obligatoria para pausa, conflicto o resolucion;
- historial/auditoria visible;
- copy claro diferenciando preview, gate requerido, bloqueado y sync real.

## Relacion con Phase A

Impacta directamente:

- sincronizacion plataforma a fuente externa;
- sincronizacion fuente externa a plataforma;
- links de cuestionario;
- notificaciones;
- importaciones;
- beneficios/liquidaciones;
- Academia.

## Clasificacion del bloque

### Reusable CXOrbia

Reusable para todos los clientes con integraciones externas o flujos con gates.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Impacto directo en UI de Integraciones, Dashboard tecnico, Notificaciones, Importaciones y modulos conectados.

### Academia

Impacto directo cuando integraciones afectan contenido, rutas, certificaciones o mensajes.

### Sin impacto Claude

No aplica. Este bloque genera pendiente Claude.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin Auth real, sin Firestore real, sin imports, sin sincronizacion externa y sin datos sensibles.
