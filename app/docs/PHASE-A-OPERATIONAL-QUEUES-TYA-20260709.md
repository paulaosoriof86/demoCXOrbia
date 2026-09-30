# Phase A operational queues TyA

Fecha: 2026-07-09
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Formalizar las colas operativas que debe usar Phase A para priorizar conflictos, sincronizacion HR/plataforma, certificaciones, liquidaciones/pagos de junio, cuestionarios y correcciones administrativas, sin writes reales ni runtime.

Este bloque permite avanzar hacia una operacion administrable sin parches puntuales y sin repetir Level 0/1.

## Archivos agregados

- `backend/contracts/phase-a-operational-queues-contract-v1.json`
- `tools/contracts/tya-phase-a-operational-queues-validate.mjs`

## Colas definidas

### 1. `sync_conflicts`

Para conflictos de asignacion o estado entre HR y plataforma.

- No se resuelve automaticamente.
- Bloquea duplicados.
- Requiere revision humana.
- Usa `tenantId`, `projectId`, `visitId`, `hrRowId`.

### 2. `hr_platform_sync_pending`

Para asignaciones que deben reflejarse entre HR y plataforma.

- Plataforma -> HR.
- HR -> plataforma.
- No duplica disponibles.
- No escribe hasta gate final.

### 3. `certification_preservation_review`

Para certificaciones ya presentadas que deben preservarse o revisarse.

- Evita pedir de nuevo certificaciones ya presentadas.
- Permite review si falta evidencia segura.
- No guarda evidencia cruda ni datos sensibles.

### 4. `june_liquidation_payment_control`

Para liquidaciones y pagos de junio como control administrativo.

- No ejecuta pagos.
- No usa proveedor de pago.
- Puede mover a revision, programado o confirmado externamente.
- Requiere auditoria y fuente segura.

### 5. `questionnaire_route_review`

Para visitas con ruta de cuestionario pendiente o configurable.

- CXOrbia.
- TyA Online.
- Plataforma externa.
- Link general.
- Link por visita desde HR.

### 6. `admin_corrections_review`

Para anulaciones/correcciones logicas.

- No hard delete.
- Requiere before/after y razon.
- Mantiene trazabilidad.

## Campos obligatorios de item de cola

- `queueItemId`
- `tenantId`
- `projectId`
- `queueType`
- `severity`
- `status`
- `entityType`
- `entityId`
- `stableKeys`
- `reasonCode`
- `source`
- `sourceRef`
- `createdAt`
- `updatedAt`
- `gateStatus`

Campos seguros opcionales:

- `visitId`
- `hrRowId`
- `shopperId`
- `assignmentSource`
- `assignmentSyncStatus`
- `lastSyncedAt`
- `periodId`
- `country`
- `currency`
- `amountExpectedSafe`
- `questionnaireRouteMode`
- `certificationId`
- `liquidationId`
- `paymentControlId`
- `notesSafe`

## Datos prohibidos

No se permite en colas:

- DPI;
- banco/cuenta bancaria;
- telefono;
- email;
- nombre crudo;
- service account;
- webhook Make;
- API key Gemini;
- token de pago;
- evidencia cruda/binaria;
- fila HR cruda;
- CSV/workbook crudo.

## Priorizacion

Reglas:

1. Blockers primero.
2. Conflictos de asignacion antes que pagos.
3. Preservacion de certificaciones antes de pedir repetir.
4. Control de pago junio solo despues de submitido/candidato valido.
5. No crear item de cola sin stable keys.

## Expectativa futura para Claude/prototipo

Claude debe reflejar:

- tablero de colas por tipo/severidad/estado/pais/proyecto;
- drill por item con llaves estables no sensibles;
- accion sugerida y razon requerida;
- botones preparados/deshabilitados si gate esta apagado;
- mensajes honestos: preview/preparado/no write/no envio/no pago/no sync real;
- bitacora de decisiones administrativas.

No debe prometer integraciones reales si el gate esta apagado.

## Impacto Academia

Academia debe explicar:

- que es una cola operativa;
- por que los blockers van primero;
- por que no se resuelve automaticamente;
- por que no se deduplica por nombre;
- que significa sourceRef opaca;
- diferencia entre pago en control y pago real;
- diferencia entre item de cola, accion administrativa, write real y produccion.

## Validador

Uso tecnico futuro:

```bash
node tools/contracts/tya-phase-a-operational-queues-validate.mjs --out .tmp/tya-phase-a-operational-queues
```

El validador solo revisa contrato. No llama proveedores, no escribe base, no importa, no despliega y no cambia runtime.

## Estado seguro

- Sin cambios en `/app/modules` o `/app/core`.
- Sin runtime conectado.
- Sin deploy.
- Sin produccion.
- Sin Firestore/Auth/Storage.
- Sin HR writes.
- Sin Make/Gemini.
- Sin correos/WhatsApp reales.
- Sin pagos reales.
- Sin import real.
- Sin datos sensibles.
