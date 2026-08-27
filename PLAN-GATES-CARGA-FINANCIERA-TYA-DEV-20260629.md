# PLAN-GATES-CARGA-FINANCIERA-TYA-DEV-20260629

## Objetivo

Definir los controles obligatorios antes de cargar en Firestore DEV cualquier dato financiero histórico TyA/Cinépolis proveniente del Excel de movimientos y liquidaciones.

## Estado actual

Ya existen herramientas y documentos para:

- inspección del Excel TyA;
- dry-run financiero inicial;
- transformador estricto financiero;
- esquema Firestore HR/finanzas v1;
- draft de reglas HR/finanzas;
- validador de salida strict dry-run.

Todavía no hay autorización para escritura Firestore de movimientos financieros.

## Gates obligatorios

### Gate 1 — Fuente confirmada

Debe estar confirmado:

- archivo correcto;
- hojas TyA/TyA HN/Liquidación desde 2025;
- exclusión de hojas personales y otros negocios;
- inclusión de `May HN 26` como TyA Honduras.

Estado: parcialmente cumplido por inspección inicial.

### Gate 2 — Transformación strict dry-run

Debe generarse:

```text
financial-tya-strict-dry-run.json
financial-tya-strict-dry-run-summary.md
financial-tya-strict-dry-run-issues.csv
financial-tya-strict-dry-run-shopper-aliases.csv
```

Estado: script creado, pendiente ejecución local estable o ejecución controlada equivalente.

### Gate 3 — Validación de salida

Debe ejecutarse:

```text
firebase/client-write-tools/validate-financial-tya-strict-output.mjs
```

Debe quedar estado `OK` o `REVIEW` aceptado manualmente. Si queda `FAIL`, no se puede cargar.

### Gate 4 — Shoppers y aliases

Debe resolverse:

- shopper exact match;
- shopper fuzzy match;
- shopper no match;
- shopper ambiguo;
- nombres históricos incompletos;
- mayúsculas/minúsculas/acentos.

No se crean usuarios automáticamente sin autorización.

### Gate 5 — Validación contra HR V4

Cruzar por:

- periodo;
- país;
- shopper;
- visita;
- sucursal;
- monto;
- estado esperado.

Objetivo: evitar pagos o beneficios huérfanos o duplicados.

### Gate 6 — Revisión de totales

Paula debe aprobar:

- totales por país;
- totales por moneda;
- totales por periodo;
- beneficios pendientes;
- beneficios pagados;
- movimientos financieros reales;
- filas ignoradas;
- issues pendientes.

### Gate 7 — Reglas Firestore listas

Antes de escribir nuevas colecciones, las reglas DEV deben soportar:

- `shopperBenefits`;
- `paymentLots`;
- `financialMovements`;
- `reconciliations`;
- `hrImportBatches`;
- `hrSyncRuns`;
- `hrWriteBackJobs`;
- `collaborators`;
- `shopper aliases`.

El draft de reglas no debe publicarse sin confirmación explícita.

### Gate 8 — Confirmación explícita de escritura DEV

La confirmación de escritura debe especificar alcance exacto: Firestore DEV, datos financieros TyA validados, sin Hosting, sin merge, sin producción, sin adapter global y sin modificar módulos de frontend.

Sin esa confirmación, no se escribe Firestore.

## Estrategia de escritura futura

Cuando se confirme la carga, debe hacerse por lote:

1. crear importBatch financiero;
2. escribir financialMovements validados;
3. escribir shopperBenefits validados;
4. escribir paymentLots validados;
5. escribir reconciliations candidatas;
6. escribir shopper aliases aprobados;
7. generar reporte post-carga por conteos exactos;
8. validar lectura por IDs;
9. documentar resultado.

## Reglas de seguridad

- No mezclar monedas.
- No mezclar países.
- No mezclar proyectos.
- No mezclar datos personales.
- No asumir pago real desde beneficio calculado.
- No crear shoppers automáticamente sin aprobación.
- No sobrescribir datos existentes sin batchId/auditoría.

## Restricciones conservadas

- Sin escritura Firestore.
- Sin importación real.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin adapter global.
- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
