# Plan HR Live Connector TyA / Cinépolis

Fecha: 2026-07-03
Estado: diseño backend. Fuente viva Google Sheets ya confirmada por Paula y verificada con Google Drive Connector.

## Fuente viva confirmada

Paula compartió la HR viva como Google Sheets. Metadatos verificados: título `HR Guatemala - Sincronizacion Google Sheets`, creada el 2025-05-29 y modificada el 2026-07-03.

La hoja contiene 28 tabs operativos por periodo/país y 2 dashboards. El conteo operativo detectado es 617 filas, consistente con V6:

- GT: 34 filas por periodo.
- HN: 10 filas por periodo.
- Excepción: `JUNIO 26 HN` tiene 11 filas.
- `JULIO 26` y `JULIO 26 HN` existen y deben quedar como preparación.

Por seguridad no se versiona la URL completa ni datos crudos en este repo público. El enlace debe guardarse como configuración privada del proyecto/tenant, no como literal en código ni documentación pública.

## Principio técnico

La HR viva no debe conectarse directamente a módulos UI. Debe entrar por una capa backend/controlada:

```text
Proyecto normal CXOrbia
→ configuración privada de fuente HR
→ HR externa
→ HR Live Connector
→ preview validado
→ migrationBatch/hrReadBatch
→ Firestore DEV
→ CX.data adapter
→ UI
```

## Contrato de proyecto

Cada proyecto CXOrbia debe poder registrar una fuente HR:

```json
{
  "hrSource": {
    "type": "google_sheets",
    "storage": "private_config",
    "spreadsheetTitle": "HR Guatemala - Sincronizacion Google Sheets",
    "tabsPattern": "{MES} {YY} / {MES} {YY} HN",
    "mode": "read_preview_first",
    "writeBackEnabled": false
  }
}
```

## Columnas canónicas

El conector debe mapear variaciones de encabezados hacia estos campos:

- `sourceTab`, `sourceRow`, `periodRaw`, `periodId`, `periodStatus`
- `country`, `cinemaId`, `city`, `address`, `branchName`
- `timeBand`, `cinemaFormat`, `comboType`, `purchaseType`, `paymentMethod`
- `quincena`, `shopperNameRaw`, `phoneRaw`, `emailRaw`
- `availableFromRaw`, `scheduledDateRaw`, `completedDateRaw`, `questionnaireDateRaw`, `submittedAtRaw`
- `ticketAmountRaw`, `comboAmountRaw`, `surveyIdRaw`, `honorariumRaw`
- `reviewerRaw`, `liquidatedRaw`, `statusRaw`, `observationsRaw`, `scenarioSentRaw`

## Variaciones de encabezado detectadas

- `DIRECCIÓN` / `DIRECCIÓN `.
- `Shopping` / `Shopping `.
- `Fecha  programada` / `Fecha programada`.
- `Fecha  submitido` / `Fecha submitido`.
- `Ccuestionario completado` con salto de línea.
- `Observaciones de revisión` con salto de línea.
- `Disponible a partir de` aparece en tabs 2026, no en todos los tabs 2025.
- `Envío de escenario` aparece en tabs recientes.

Regla: normalizar encabezados con trim, minúsculas, eliminación de saltos/doble espacio y alias por columna.

## Validadores obligatorios

- No secrets ni PII en logs públicos.
- Encabezados presentes.
- Tabs detectados.
- Filas parseables.
- Fechas interpretables.
- País válido.
- Periodo con año explícito.
- Conteo esperado por programa: GT 34, HN 10, total 44.
- Julio 2026 como preparación.
- `JUNIO 26 HN` con 11 filas como revisión.
- Submitido sin visita = issue crítico.
- Liquidación sin visita = issue crítico.
- Duplicado de `visitKey` = issue crítico.

## Estados honestos de lectura

| Estado | Significado |
|---|---|
| `connected` | Fuente viva accesible. |
| `auth_error` | Credencial/permisos fallaron. |
| `not_found` | Archivo, hoja o rango no existe. |
| `empty_range` | Rango existe pero no tiene datos. |
| `schema_changed` | Encabezados no coinciden. |
| `parsed_with_warnings` | Preview generado con issues no críticos. |
| `blocked` | Hay issues críticos. |
| `ready_for_preview` | Puede mostrarse preview. |
| `ready_for_import` | Puede pedirse autorización de importación. |

## Flujo recomendado

1. Admin crea proyecto normal CXOrbia.
2. Admin registra fuente HR viva.
3. Backend lee HR viva.
4. Backend genera fingerprint de fuente.
5. Backend parsea filas a preview.
6. Backend valida conteos y reglas.
7. Admin revisa preview con issues.
8. Admin autoriza importación piloto o sincronización.
9. Backend escribe en staging/import batch.
10. Backend promueve a colecciones operativas solo con gate aprobado.
11. Backend conserva rollback.

## Write-back controlado

No escribir a HR sin diseño separado. Write-back futuro posible para asignación, fecha programada, realizada, cuestionario, observaciones y estado, siempre con auditoría before/after y control de conflicto.

## Pendiente para Claude/prototipo

El formulario de proyecto debe permitir configurar `Fuente de Hoja de Ruta` con tipo de fuente, campo URL visible solo a roles autorizados, botón `Probar conexión`, estados honestos y preview de tabs/periodos antes de importar.
