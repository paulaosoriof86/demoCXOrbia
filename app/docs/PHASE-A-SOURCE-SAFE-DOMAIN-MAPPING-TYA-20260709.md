# Phase A source-safe domain mapping TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Definir el mapeo minimo source-safe de dominios reales/sanitizados TyA antes de que el adapter `CX.data` DEV pueda leer datos Phase A. Este bloque mantiene el foco en produccion real controlada: HR como fuente operacional, datos reales limpios, certificaciones preservadas y liquidaciones/pagos de junio como control.

## Archivos agregados

- `backend/contracts/phase-a-source-safe-domain-mapping-v1.json`
- `tools/contracts/tya-phase-a-source-safe-domain-mapping-validate.mjs`

## Principios

- HR es fuente operacional.
- Se requiere fuente original sanitizada.
- `sourceRef` debe ser opaca.
- No se suben filas HR crudas.
- No se exponen datos sensibles.
- No se usan fixtures como reales.
- No se usan `.tmp` derivados como fuente original.
- No se conecta base vieja.
- No se repite Level 0/1.
- Configuracion de proyecto guia comportamiento.
- Conflictos requieren revision humana.

## Dominios mapeados

### `tenant_project_config`

Configuracion del tenant/proyecto:

- tenantId;
- projectId;
- paises;
- monedas;
- periodos;
- origen HR;
- origen cuestionario;
- reglas pago;
- reglas certificacion.

Cinépolis queda como proyecto configurable dentro de TyA.

### `hr_source_status`

Estado de lectura HR source-safe:

- sourceRef;
- readiness;
- ultima lectura;
- tabs leidas;
- conteo seguro de filas;
- warnings;
- canImport false.

### `visits`

Visitas reales/sanitizadas:

- visitId;
- hrRowId;
- pais;
- periodo;
- quincena;
- franja;
- estado;
- disponible desde;
- shopperId;
- fuente asignacion;
- estado sync.

Regla: visitas hasta junio ya ejecutadas no se tratan como pendientes si lo pendiente es pago.

### `shoppers`

Shoppers historicos source-safe:

- shopperId;
- tenantId;
- proyectos;
- estado;
- paises;
- certificacion;
- control de pago;
- sourceRef;
- reviewStatus.

Sin DPI, banco, telefono, email ni nombre crudo.

### `applications_assignments`

Postulaciones/asignaciones:

- applicationId;
- visitId;
- hrRowId;
- shopperId;
- applicationStatus;
- assignmentSource;
- assignmentSyncStatus;
- syncConflict;
- reviewStatus.

Regla: asignacion desde HR o plataforma saca visita de disponibles y no duplica.

### `certifications`

Certificaciones preservadas:

- shopperId;
- certificationId;
- status;
- preservedAlreadyPresented;
- reviewRequired;
- sourceRef;
- lastKnownResult.

Regla: no pedir de nuevo certificacion ya presentada sin revision.

### `liquidations_payments_june`

Liquidaciones/pagos junio:

- liquidationId;
- visitId;
- hrRowId;
- shopperId;
- periodo;
- pais;
- moneda;
- honorario;
- boleto;
- combo;
- paymentStatus;
- paymentControlOnly.

Regla: CXOrbia controla estado, no ejecuta pagos reales.

### `questionnaire_routes`

Rutas de cuestionario:

- routeMode;
- origen cuestionario proyecto;
- link general ref;
- link visita ref;
- TyAOnline configurado;
- routeStatus.

Debe quedar configurado por proyecto/visita o bloqueado honestamente.

### `operational_queues`

Colas operativas:

- queueItemId;
- queueType;
- severity;
- status;
- entityType;
- entityId;
- stableKeys;
- reasonCode;
- sourceRef;
- gateStatus.

### `audit_preview`

Auditoria preview:

- auditId;
- actorRole;
- action;
- entityType;
- beforeState;
- afterState;
- reasonCode;
- sourceRef;
- gateStatus.

No guarda datos sensibles ni ejecuta write real.

## Reglas cruzadas

- Visitas, asignaciones, colas y liquidaciones deben compartir `tenantId`, `projectId`, `visitId`, `hrRowId`.
- Shoppers, certificaciones y liquidaciones deben compartir `shopperId` sin exponer identidad sensible.
- Junio pendiente es pago/liquidacion, no ejecucion de visita.
- Certificacion preservada se revisa antes de pedir repetir.
- Cada visita requiere ruta de cuestionario configurada o estado bloqueado honesto.

## Hard stops

- Dominio requerido faltante.
- Stable key faltante.
- Campo sensible crudo.
- Fila HR cruda.
- URL/secreto crudo.
- Fixture marcado como real.
- `.tmp` derivado marcado como original.
- Base vieja.
- Deduplicacion visual.
- Junio marcado como visita pendiente cuando solo es pago.
- Certificacion repetida sin revision.
- Pago ejecutado por CXOrbia.
- Ruta cuestionario faltante sin bloqueo honesto.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-source-safe-domain-mapping-validate.mjs --out .tmp/tya-phase-a-source-safe-domain-mapping
```

El validador solo revisa contrato. No importa, no escribe y no activa adapter.

## Impacto Claude/prototipo

Claude debe usar este mapping para diseñar pantallas y copy sin inventar fuentes:

- mostrar campos seguros;
- no pedir datos sensibles;
- no prometer sync/pago/import real;
- mostrar bloqueos honestos si falta ruta/fuente;
- diferenciar fuente real/sanitizada de demo/fixture.

## Impacto Academia

Academia debe explicar dominio por dominio, stable keys, sourceRef opaca, por que no se guardan datos sensibles, por que junio es control de pago y por que certificaciones ya presentadas se preservan.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Adapter no habilitado.
- Sin runtime conectado.
- Sin import de dominios.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
