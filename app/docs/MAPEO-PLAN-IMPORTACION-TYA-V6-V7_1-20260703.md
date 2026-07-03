# Mapeo y plan de importación TyA V6 + V7.1 hacia CXOrbia

Fecha: 2026-07-03  
Estado: diseño documental, no ejecutado.  
Restricción: no importación, no Firestore writes, no deploy, no frontend.

## 1. Principio

- HR manda para visitas, fechas, submitidos y base de liquidaciones.
- RTDB complementa trazabilidad operativa: shoppers, postulaciones, marcas candidatas de cuestionario y notificaciones.
- No se migra código viejo, UI vieja, reglas Firebase, secretos ni raw RTDB completo.
- Todo registro importado debe conservar trazabilidad: `sourceSystem`, `sourceFile`, `sourcePath`, `sourceKey`, `sourceTab`, `sourceRow`, `importBatchId`, `estadoConfianza`, `migrationNote`.

## 2. Segmentación destino

Segmentación obligatoria:
- `tenantId`: `tya`
- `programId`: `cinepolis`
- `projectId`: identificador operativo compatible con adapter actual.
- `periodId`: año + mes + país, con año explícito.
- `country`: `GT` o `HN`.
- `sourcePeriod`: valor original HR, por ejemplo `JUNIO_26_HN`.

Recomendación de transición:
- Mantener compatibilidad con el adapter actual que lee `tenants/{tenantId}/projects/{projectId}/visits`.
- En preview, cada doc `projects/{projectId}` puede representar un periodo-país operativo con campos `programId`, `periodId`, `country` y `sourcePeriod`.
- A mediano plazo, evolucionar a una capa canónica `programs/periods`, sin romper `CX.data`.

## 3. Colecciones staging recomendadas

No cargar directo a colecciones operativas.

```text
tenants/{tenantId}/migrationBatches/{batchId}
tenants/{tenantId}/migrationBatches/{batchId}/files/{fileId}
tenants/{tenantId}/migrationBatches/{batchId}/previewVisits/{previewVisitId}
tenants/{tenantId}/migrationBatches/{batchId}/previewShoppers/{previewShopperId}
tenants/{tenantId}/migrationBatches/{batchId}/previewEvents/{previewEventId}
tenants/{tenantId}/migrationBatches/{batchId}/previewNotifications/{previewNotificationId}
tenants/{tenantId}/migrationBatches/{batchId}/duplicateCandidates/{candidateId}
tenants/{tenantId}/migrationBatches/{batchId}/discardedRecords/{recordId}
tenants/{tenantId}/migrationBatches/{batchId}/validationIssues/{issueId}
tenants/{tenantId}/migrationBatches/{batchId}/rollbackPlan/{rollbackItemId}
```

## 4. Mapeo V6 HR visitas

Origen: `migration_visits_master_hr.csv`  
Destino preview: `previewVisits`

Campos principales:
- `hrVisitKey` <- `visitKey`
- `programId` <- `cinepolis`
- `periodId` <- derivado de `periodo` con año explícito
- `country` <- `pais`
- `sourcePeriod` <- `periodo`
- `periodMigrationStatus` <- `periodo_migracion`
- `cinemaId` <- `id_cinema`
- `branchName` <- `sucursal`
- `city` <- `ciudad`
- `timeBand` <- `franja`
- `quincena` <- `quincena`
- `shopperNameRaw` <- `shopper_asignado`
- `shopperPhoneRaw` <- `telefono`
- `shopperEmailRaw` <- `email`
- `availableFrom` <- `disponible_desde`
- `scheduledDate` <- `fecha_programada`
- `completedDate` <- `fecha_realizada`
- `questionnaireDate` <- `fecha_cuestionario`
- `submittedAtRaw` <- `fecha_submitido`
- `statusRaw` <- `estado`
- `sourceSystem` <- `HR V5`
- `sourceFile` <- `migration_visits_master_hr.csv`
- `sourceTab` <- `source_tab`
- `sourceRow` <- `source_row`
- `estadoConfianza` <- `estado_confianza`

Reglas:
- `JULIO_26` y `JULIO_26_HN`: preparación, no histórico cerrado.
- `JUNIO_26_HN/source_row=12`: enviar a `discardedRecords` o `review_required`.

## 5. Mapeo submitidos

Origen: `migration_submitidos_master_hr.csv`  
Destino preview: `previewEvents`

Evento:
- `eventType`: `submitted_by_tya`
- `hrVisitKey` <- `visitKey`
- `submittedAtRaw` <- `fecha_submitido`
- `controlSubmitida` <- `control_submitida`
- `sourceSystem` <- `HR V5`
- `estadoConfianza` <- `migrar`

Regla:
- El submitido lo hace TyA, no el shopper.
- Impacta liquidación y disponibilidad futura según reglas configurables del programa, no código global.

## 6. Mapeo liquidaciones base

Origen: `migration_liquidations_base_hr.csv`  
Destino preview: `previewLiquidationCandidates`

Regla:
- No convertir en deuda final hasta cruzar Excel financiero externo.
- No crear `paymentLots`, `shopperBenefits` ni `financialMovements` finales solo con V6.

## 7. Mapeo shoppers RTDB

Origen: `shoppers.csv`  
Destino preview: `previewShoppers` + `duplicateCandidates`

Campos principales:
- `rtdbSourceNode` <- `source_node`
- `rtdbSourceId` <- `source_id`
- `legacyShopperId` <- `id`
- `nameRaw` <- `nombre`
- `emailRaw` <- `email`
- `phoneRaw` <- `wa`
- `countryRaw` <- `pais`
- `cityRaw` <- `ciudad`
- `activeRaw` <- `activo`
- `visitsRaw` <- `visitas`
- `certsRaw` <- `certs`
- `dpiPolicy` <- `drop_or_encrypt_pending`
- `sourceSystem` <- `RTDB V4`

Reglas:
- No fusionar automáticamente.
- No usar `id` como único canónico sin revisar, porque tiene duplicados.
- Usar `source_node + source_id` para trazabilidad de origen.
- Crear `canonicalShopperId` solo después de resolver duplicados.

## 8. Mapeo postulaciones

Origen: `postulations.csv`  
Destino preview: `previewEvents` + `platformVisitKeyMap`

Evento:
- `eventType`: `postulation`
- `platformPostulationId` <- `source_id`
- `platformVisitKey` <- `visitKey` o `vid`
- `hrVisitKey` <- resuelto por tabla de equivalencia
- `legacyShopperId` <- `sid`
- `shopperNameRaw` <- `shopper`
- `country` <- `pais`
- `branchName` <- `shopping`
- `proposedDate` <- `fp`
- `completedDate` <- `freal`
- `statusRaw` <- `est`
- `approvedByRaw` <- `aprobadoPor`
- `lastTransitionAt` <- `lastTransition`
- `lastTransitionByRaw` <- `lastTransitionBy`
- `sourceSystem` <- `RTDB V4`

Regla:
- Las 44 postulaciones son vinculables a HR mediante periodo/país/cine/quincena, no por igualdad directa de `visitKey`.

## 9. Mapeo questionnaire marks

Origen: `questionnaire_marks.csv`

Dictamen:
- Es idéntico a `postulations.csv`.
- No debe importarse como fuente independiente.
- Usar `questionnaire_status_candidates.csv` como candidato de estado, con revisión.

Evento candidato:
- `eventType`: `questionnaire_mark_candidate`
- `statusCandidate` <- `questionnaire_status_candidates.status_candidate`
- `platformVisitKey` <- `visitKey`
- `hrVisitKey` <- resuelto
- `estadoConfianza` <- `revisar`

## 10. Mapeo certificaciones

Origen: `certifications.csv`

Resultado:
- 0 registros.
- No hay certificaciones migrables limpias desde RTDB V4.

## 11. Mapeo notificaciones

Origen: `notifications.csv` + `notification_trace.csv`  
Destino preview: `previewNotifications` + `notificationRecipientResolution`

Campos principales:
- `legacyNotificationId` <- `source_id` o `id`
- `typeRaw` <- `tipo`
- `titleRaw` <- `titulo`
- `bodyRaw` <- `mensaje`
- `destRaw` <- `dest`
- `createdAtRaw` <- `fecha`
- `attendedAtRaw` <- `atendidoAt`
- `attendedByRaw` <- `atendidoPor`
- `seenRaw` <- `visto`
- `opsEventRaw` <- `_opsEvent`
- `navDestinationRaw` <- `_navDest`

Regla:
- Resolver `destRaw` a destinatario canónico antes de crear notificaciones vivas.
- Si no se resuelve, conservar como historial/auditoría, no como notificación activa.

## 12. Plan por fases

### Fase 1 — Migration batch staging
Crear lote `migrationBatch`, registrar metadatos, checksums, fuentes y estado `preview_created`. No cargar a operación.

### Fase 2 — Preview HR
Cargar visitas, submitidos, liquidaciones candidatas, country fixes y manifest a staging. Validar conteos, huérfanos, duplicados y julio preparación.

### Fase 3 — Preview shoppers y dedupe
Cargar 276 shoppers RTDB a staging. Crear cola de revisión de 226 candidatos duplicados. Resolver política DPI.

### Fase 4 — Preview postulaciones/cuestionario
Cargar 44 postulaciones y 44 estados candidatos. Crear `platformVisitKeyMap`. No usar `questionnaire_marks.csv` como fuente independiente.

### Fase 5 — Preview notificaciones
Cargar 216 notificaciones parseadas como historial/preview. Resolver destinatarios antes de activarlas.

### Fase 6 — Liquidaciones con Excel
Cruzar HR liquidations base + submitidos + Excel financiero externo. No crear deuda final antes de ese cruce.

### Fase 7 — Piloto DEV
Importar solo un alcance mínimo autorizado. Excluir `JUNIO_26_HN/source_row=12`. Validar UI, roles, país, periodo y rollback.

### Fase 8 — Promoción operativa
Solo con autorización. Todo documento operativo debe guardar `importBatchId` y `sourceRef`.

### Fase 9 — Rollback
Antes de promover, generar lista exacta de documentos creados/mergeados. Rollback elimina solo documentos del `batchId` o restaura snapshots autorizados.

## 13. Gates obligatorios

No avanzar si falta cualquiera:
- Autorización explícita de Paula.
- Encoding V7.1 resuelto.
- Dedupe shopper revisado.
- DPI con política definida.
- Liquidaciones cruzadas con Excel si se activan pagos.
- Firestore rules validadas en DEV.
- Preview visual aprobado.
- Rollback probado en dry-run.
