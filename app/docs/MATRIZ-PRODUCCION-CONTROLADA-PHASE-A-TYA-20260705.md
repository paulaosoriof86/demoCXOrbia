# Matriz de produccion controlada Phase A - CXOrbia TyA

Fecha: 2026-07-05

## Objetivo

Consolidar el estado acumulado para acercar Phase A a salida controlada sin confundir readiness preview con produccion real.

La matriz separa:

- P0 frontend obligatorio;
- backend preview listo;
- backend pendiente de ejecucion local;
- P1 post-P0;
- Academia posterior;
- bloqueo de source lock;
- decision de produccion.

## Archivos agregados en este bloque

1. `app/contracts/controlled-production-matrix-phase-a.tya.contract.json`
   - Contrato de matriz.
   - Define secciones, prioridades, owners, estados e impactos.
   - Mantiene hard stops de no produccion.

2. `tools/migration/tya-controlled-production-matrix-preview.mjs`
   - Generador Node de matriz.
   - Puede usar un JSON summary sanitizado como input.
   - Si no hay input, genera matriz conservadora con blockers conocidos.

3. `tools/migration/tya-controlled-production-matrix-local.ps1`
   - Wrapper PowerShell local.
   - Genera `06-controlled-production-matrix-*.md` o `.json` en `_diagnosticos/tya-release-readiness`.

## Matriz acumulada actual

### 1. P0 frontend obligatorio

Estado: bloqueado.

Owner: Claude/frontend.

Evidencia:

- `app/docs/AUDITORIA-FORENSE-V87-CXORBIA-20260705.md`
- `app/docs/PENDIENTES-CLAUDE-ADDENDUM-V87-AUDITORIA-20260705.md`

Pendientes:

- Cambiar mensajes que prometen envio real.
- Cambiar mensajes que prometen sincronizacion real.
- Cambiar textos que indican movimiento automatico de liquidaciones.
- Cambiar `cuestionario enviado` por cuestionario realizado/completado pendiente revision.

Impacto: bloquea source lock y produccion.

### 2. Backend preview listo

Estado: preview ready documental/herramientas.

Owner: ChatGPT/backend.

Evidencia acumulada:

- Synthetic fixtures manifest.
- Synthetic input pack runner.
- Readiness map.
- Bridge a release readiness snapshot.
- Release readiness snapshot validator.
- Release readiness sanitized report generator.
- Controlled production matrix generator.

Impacto: no bloquea avance documental, pero no autoriza produccion.

### 3. Backend pendiente de ejecucion local

Estado: pendiente ejecucion local.

Owner: ChatGPT/backend con repo local cuando corresponda.

Pendientes:

1. Ejecutar `tya-synthetic-pack-release-readiness-local-chain.ps1` sin `-ExecuteValidators`.
2. Revisar salidas `01` a `04`.
3. Generar reporte sanitizado `05`.
4. Generar matriz `06`.
5. Repetir con `-ExecuteValidators` solo si el primer reporte es seguro.

Impacto: no bloquea seguir documentando, pero debe resolverse antes de decisiones finales.

### 4. P1 post-P0

Estado: diferido hasta despues del P0.

Owner: Claude/frontend + backend segun aplique.

Pendientes:

- Incorporar `availableFrom`.
- Incorporar `outboxStatus`.
- Incorporar `mailboxId`.
- Incorporar `formVersion`.
- Incorporar `externalFolderRef`.
- Incorporar `crmEntityId`.
- Mostrar readiness con estados honestos.
- Separar Mis beneficios/liquidaciones por conceptos y estado.

Impacto: importante para robustez, pero no desplaza P0 si la capacidad es limitada.

### 5. Academia posterior

Estado: diferido hasta despues del P0.

Owner: Claude/frontend/Academia.

Pendientes:

- Preview vs produccion.
- Gates.
- Blockers.
- Manual review.
- Missing input.
- Source lock.
- Mensajes honestos antes de indicar envio/sync.

Impacto: no debe ejecutarse antes de corregir P0.

### 6. Bloqueo de source lock

Estado: bloqueado.

Motivo: `prototype_audit` sigue pendiente por P0 V87. V87 no tuvo delta real contra V86.

Para removerlo se requiere:

1. Nueva candidata Claude con delta real.
2. Correccion P0 quirurgica.
3. Auditoria forense nueva.
4. 0 scripts faltantes/duplicados.
5. 0 fallas JS.
6. Confirmacion de 0 textos operativos que prometan integraciones reales sin gates.

### 7. Decision de produccion

Estado: no autorizado.

No se autoriza:

- produccion;
- deploy;
- merge;
- import real;
- Firestore writes;
- Storage writes;
- HR writes;
- Make real;
- Gemini real;
- correo real;
- WhatsApp real;
- pagos reales.

## Ejecucion local recomendada

Generar matriz conservadora sin input:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-controlled-production-matrix-local.ps1
```

Generar matriz desde un JSON summary sanitizado:

```powershell
powershell -ExecutionPolicy Bypass -File tools/migration/tya-controlled-production-matrix-local.ps1 -SanitizedSummaryPath "_diagnosticos/tya-release-readiness/05-release-readiness-sanitized-report-YYYYMMDD_HHMMSS.json" -Format markdown
```

## Siguiente bloque recomendado

Preparar el paquete acumulado para Claude cuando recupere capacidad, incorporando esta matriz y separando prompt corto P0, contexto backend acumulado y criterios de auditoria de la proxima candidata.
