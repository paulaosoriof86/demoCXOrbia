# Plan HR Live Connector TyA / Cinépolis

Fecha: 2026-07-03  
Estado: diseño para implementar después de auditoría V6 + V7.1.  
Restricción: no ejecutar conexión viva sin autorización y credenciales seguras.

## 1. Objetivo

Evitar nuevas iteraciones fallidas leyendo la hoja de ruta como datos sueltos. El objetivo es crear una capa backend que lea la HR viva, genere preview validado y solo después permita sincronizar datos hacia Firestore DEV.

## 2. Principio técnico

La HR viva no debe conectarse directamente a módulos UI. Debe entrar por una capa backend/controlada:

```text
HR externa -> HR Live Connector -> Migration Preview -> Validation Gates -> Firestore DEV -> CX.data adapter -> UI
```

## 3. Lo que NO debe pasar

- No leer HR directamente desde `/app/modules`.
- No convertir errores en conteo 0.
- No mezclar 403/404/hoja vacía/columna cambiada como si fueran lo mismo.
- No escribir Firestore si el preview tiene errores críticos.
- No sobrescribir datos activos sin rollback.
- No hardcodear Cinépolis como regla global.
- No reescribir frontend para resolver lectura backend.

## 4. Entradas requeridas

Para construir el conector vivo se necesita definir una fuente:

### Opción A — Excel Online / OneDrive
- Tenant/cuenta autorizada.
- Drive item ID o ruta del archivo.
- Workbook/table/range.
- Método de autenticación server-side.

### Opción B — Google Sheets
- Spreadsheet ID.
- Ranges por periodo o tab.
- Service account o OAuth seguro.
- Permisos mínimos de lectura y, si aplica, escritura.

### Opción C — Archivo subido/manual temporal
- XLSX cargado por admin.
- Útil como transición, pero no es lectura viva.

## 5. Contrato de columnas HR

El conector debe aceptar variaciones de encabezados, pero mapear a un contrato canónico.

Campos canónicos:
- `sourceTab`
- `sourceRow`
- `periodRaw`
- `periodId`
- `periodStatus`
- `country`
- `cinemaId`
- `city`
- `address`
- `branchName`
- `timeBand`
- `cinemaFormat`
- `comboType`
- `purchaseType`
- `paymentMethod`
- `quincena`
- `shopperNameRaw`
- `phoneRaw`
- `emailRaw`
- `availableFromRaw`
- `scheduledDateRaw`
- `completedDateRaw`
- `questionnaireDateRaw`
- `submittedAtRaw`
- `ticketAmountRaw`
- `comboAmountRaw`
- `surveyIdRaw`
- `honorariumRaw`
- `reviewerRaw`
- `liquidatedRaw`
- `statusRaw`
- `observationsRaw`

## 6. Validadores obligatorios

### Seguridad
- No secrets en logs.
- No PII cruda en repo.
- No datos bancarios en preview público.

### Estructura
- Encabezados presentes.
- Tabs detectados.
- Filas parseables.
- Fechas interpretables.
- País válido.
- Periodo con año explícito.

### Conteo TyA/Cinépolis
- Guatemala normalmente 34 por periodo.
- Honduras normalmente 10 por periodo.
- Total normal 44.
- Estos conteos son QA del programa, no regla global de plataforma.

### Casos especiales
- Julio 2026 = preparación.
- `JUNIO_26_HN/source_row=12` = revisar/descarte.
- Fechas futuras en cuestionario/realizada = issue.
- Submitido sin visita = issue crítico.
- Liquidación sin visita = issue crítico.
- Duplicado `visitKey` = issue crítico.

## 7. Estados de lectura

El conector debe reportar estados honestos:

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

## 8. Flujo operativo recomendado

1. Admin selecciona programa y periodo.
2. Backend lee HR viva.
3. Backend genera fingerprint de fuente.
4. Backend parsea filas a preview.
5. Backend valida conteos y reglas.
6. Admin revisa preview con issues.
7. Admin autoriza importación piloto o sincronización.
8. Backend escribe en staging/import batch.
9. Backend promueve a colecciones operativas solo con gate aprobado.
10. Backend conserva rollback.

## 9. Write-back controlado

No debe escribirse a HR sin diseño separado.

Write-back posible en el futuro:
- asignación shopper;
- fecha programada;
- realizada;
- cuestionario marcado;
- observaciones;
- estado.

Condiciones:
- Solo campos permitidos.
- Lock o revisión de última versión/fingerprint.
- Auditoría `before/after`.
- Manejo de conflicto si la HR cambió desde la lectura.

## 10. Colecciones de apoyo

```text
tenants/{tenantId}/hrConnections/{connectionId}
tenants/{tenantId}/hrReadBatches/{batchId}
tenants/{tenantId}/hrReadBatches/{batchId}/rows/{rowId}
tenants/{tenantId}/hrReadBatches/{batchId}/issues/{issueId}
tenants/{tenantId}/hrMappings/{mappingId}
tenants/{tenantId}/programRules/{programId}
```

## 11. Reglas configurables de programa

Para Cinépolis:

```json
{
  "programId": "cinepolis",
  "expectedMonthlyVisits": {"GT": 34, "HN": 10},
  "periodsRequireExplicitYear": true,
  "july2026Status": "preparation",
  "quincenaDependency": {
    "enabled": true,
    "q2RequiresQ1Submitted": true
  },
  "availability": {
    "source": "hr_and_computed",
    "requiresSubmittedPreviousVisit": true
  },
  "liquidation": {
    "requiresSubmitted": true,
    "requiresExternalFinanceCrosscheck": true
  }
}
```

## 12. Primer bloque implementable sin riesgo

Crear script dry-run local/CI que:
- reciba ZIP V6 y V7.1 o XLSX HR futura;
- no escriba Firestore;
- genere JSON/MD de preview;
- falle si encuentra issue crítico;
- distinga errores de permisos, archivo faltante, vacío y schema cambiado;
- no suba PII al repo.

## 13. Pregunta abierta para Paula

Para construir lectura viva real falta decidir la fuente técnica de HR:
- Excel Online/OneDrive;
- Google Sheets;
- carga manual XLSX temporal.

Mientras no se defina esa fuente, se puede avanzar con el pipeline de preview/importación usando V6 + V7.1 como contrato y datos de prueba sanitizados.
