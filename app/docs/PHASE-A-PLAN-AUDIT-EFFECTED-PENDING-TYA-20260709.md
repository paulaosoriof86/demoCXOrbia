# Phase A plan audit: efectuado y pendiente TyA

Fecha: 2026-07-09
Repo: `paulaosoriof86/demoCXOrbia`
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft/open/no merge

## Objetivo

Auditar el plan Phase A para no volver a marcar como pendiente algo que ya fue trabajado o documentado.

## Hallazgo principal

La lista pendiente anterior fue demasiado amplia. Varias piezas ya estaban trabajadas en forma documental, contractual o de preparacion source-safe. No deben reiniciarse.

## Ya efectuado o documentado

### Prototipo / baseline V91

- Auditoria forense de candidata V91.
- Source lock documental/controlado de V91.
- Baseline V91 incremental documentada.
- Empalme controlado V91 por batches.
- Diagnostico y Administrabilidad agregados.
- Acciones visibles de Academia agregadas.
- Crear con IA preview estable agregado.
- Gates/smoke automatizados ampliados.

### Continuidad y antirreproceso

- Checkpoint no-reversion Level 0/1.
- Checkpoint real-data preview.
- Continuidad operacional Phase A.
- State machine operacional.
- Acciones administrativas auditables.
- Colas operativas.
- Readiness acumulado.
- Prompt/resumen de continuidad.

### Backend / contratos / source-safe

- Solicitud GO runtime DEV.
- Plan runtime DEV switch.
- Contrato `CX.data` DEV adapter.
- Source-safe domain mapping.
- Real-data domain readiness pack.
- Source-safe input builder contract.
- Local builder execution control.
- Future single-command pack.
- Human smoke precheck.
- GO/NO GO decision pack.
- DEV conditions.
- Rollback y auditoria DEV.
- Cola de revision humana y conflictos.

### Claude/prototipo/Academia

- Paquete acumulado Claude/Pendientes/Academia documentado.
- RESUMEN-PARA-CLAUDE actualizado por bloques recientes.
- PENDIENTES-PROTOTIPO actualizado previamente y addenda recientes creados cuando la herramienta bloqueo escritura directa.
- Academia cubierta en los bloques de readiness, DEV, rollback/auditoria y revision humana.

## No debe marcarse como pendiente desde cero

- `CX.data` adapter: ya hay contrato/plan documentado; pendiente es habilitarlo cuando corresponda.
- Domain mapping/modelado operacional: ya hay source-safe domain mapping y readiness pack; pendiente es consolidar colecciones/esquema final si se va a conectar base nueva.
- Builder local/source-safe: ya esta preparado; pendiente es ejecucion local cuando Paula tenga computador y fuente source-safe.
- ReviewQueue/conflictos: ya documentado; pendiente es implementacion real posterior.
- Rollback/auditoria: ya documentado; pendiente es implementacion real posterior.
- Smoke/GO: ya preparado; pendiente es ejecucion humana/consola y decision explicita.

## Pendiente real por categoria

### Pendiente de ejecucion o autorizacion

- Smoke humano/consola focalizado.
- Decision GO/NO GO/HOLD segun evidencia.
- Ejecucion local del builder con fuente source-safe si se requiere.
- Autorizacion explicita para DEV.
- Activacion controlada de adapter/runtime si llega GO.
- Merge/deploy/produccion siguen bloqueados hasta GO separado.

### Pendiente de implementacion backend real

- Crear/conectar base nueva limpia.
- Configurar Auth/Firestore/Storage por gates.
- Habilitar adapter `CX.data` sin romper interfaz.
- Ejecutar dry-run import con fuente TyA source-safe.
- Ejecutar import real solo con GO y sin datos sensibles crudos en repo.
- Implementar writes controlados y auditoria.
- Implementar reviewQueue real.
- Implementar sync Make HR/plataforma con gates.
- Implementar Gemini con revision humana.
- Validar liquidaciones/pagos reales como control administrativo, no pago automatico.

### Pendiente Claude/prototipo

- Consolidar patches de Academia si mejora mantenibilidad.
- Profundizar Academia por rol/manual/checklist/glosario.
- Completar acciones equivalentes para manuales/checklists/glosario.
- Limpiar copy P0 residual modulo por modulo.
- Mostrar estados honestos de DEV, runtime, import, sync, pagos, Make, Gemini y proveedores.

### Pendiente operativo TyA

- Validar con fuente controlada shoppers historicos completos.
- Validar certificaciones ya presentadas.
- Validar visitas ejecutadas y junio como liquidaciones/pagos.
- Validar liquidaciones y pago-control.
- Resolver conflictos por reviewQueue, no por nombre.

## Siguiente bloque recomendado

Si Paula esta sin computador: preparar documento de ruta de ejecucion Phase A por carriles, separando lo ya documentado, lo que requiere Claude, lo que requiere computador, lo que requiere GO DEV y lo que requiere GO produccion.

Si Paula esta con computador: smoke humano/consola focalizado sobre PR #7 y registrar GO/NO GO/HOLD.

## Estado seguro

Auditoria documental solamente. No cambia UI/core, no activa runtime, no importa, no escribe, no despliega, no produce y no usa datos sensibles.
