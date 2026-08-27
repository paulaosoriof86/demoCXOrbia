# CAMBIOS-BACKEND-ADDENDUM-20260629-DRY-RUN-FINANCIERO-TYA

## Archivos creados o modificados

### firebase/client-write-tools/package.json

Se agregó la dependencia `xlsx` para leer archivos Excel desde herramientas locales de diagnóstico.

También se dejó el archivo en UTF-8 sin BOM.

### firebase/client-write-tools/dry-run-financial-tya-excel.mjs

Se creó un script local de solo lectura para inspeccionar el Excel financiero histórico de TyA.

El script no escribe Firestore, no modifica el Excel, no activa adapter y no toca producción.

## Objetivo

Generar un primer dry-run financiero para clasificar hojas TyA, TyA HN y Liquidación.

El diagnóstico produce:

- candidatos a movimientos financieros;
- filas de liquidación;
- categoría sugerida;
- país;
- periodo;
- destino sugerido;
- filas de baja confianza para revisión manual.

## Salidas locales esperadas

El script genera estos archivos dentro de `firebase/private-output`:

```text
financial-tya-dry-run-summary.md
financial-tya-dry-run-details.json
financial-tya-low-confidence-rows.csv
```

## Restricciones conservadas

- Sin escritura en Firestore.
- Sin importación real del Excel.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin adapter global.
- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
