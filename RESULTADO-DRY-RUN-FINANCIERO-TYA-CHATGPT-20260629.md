# RESULTADO-DRY-RUN-FINANCIERO-TYA-CHATGPT-20260629

## Contexto

El dry-run local en PowerShell no generó reporte por problemas de ejecución local y variables previas de la consola. Para avanzar con mayor agilidad, se ejecutó una inspección equivalente desde ChatGPT usando el Excel ya cargado en la conversación.

## Modo

Solo lectura.

No se escribió Firestore. No se modificó el Excel. No se hizo Hosting. No se hizo merge. No se tocó producción. No se activó adapter global.

## Archivo analizado

```text
2026 Ingresos Egresos y Presupuesto Paula.xlsx
```

## Resultado general

- Hojas totales del workbook: 206.
- Hojas incluidas TyA/TyA HN/Liquidación desde 2025: 46.
- Filas clasificadas: 1227.
- Filas ignoradas/header/total/no útiles: 819.
- Filas de baja confianza para revisión manual: 96.
- Filas provenientes de hojas Liquidación: 479.
- Candidatos de movimientos en hojas TyA/HN: 748.

## Agrupación por país

| País | Filas | Monto absoluto detectado |
|---|---:|---:|
| GT | 1038 | 1,402,018.82 |
| HN | 189 | 468,118.54 |

## Agrupación por categoría

| Categoría | Filas | Monto absoluto detectado |
|---|---:|---:|
| honorariumAndReimbursement | 284 | 151,724.98 |
| honorariumPayment | 321 | 867,579.14 |
| income | 74 | 305,698.78 |
| liquidationRow | 458 | 399,534.00 |
| other | 41 | 99,359.38 |
| reimbursement | 48 | 38,775.08 |
| remittanceIn | 1 | 7,466.00 |

## Destino sugerido

| Destino | Filas | Monto absoluto detectado |
|---|---:|---:|
| financialMovements | 164 | 451,299.24 |
| paymentLots/shopperBenefits | 1063 | 1,418,838.12 |

## Observaciones

- El Excel sí contiene base útil para migrar información TyA/TyA HN/Liquidación desde 2025.
- `May HN 26` fue tratado como TyA Honduras.
- Las hojas TyA previas a 2025 fueron excluidas del alcance inicial.
- Los montos son diagnósticos por fila clasificada; todavía no son conciliación final.
- Las 96 filas de baja confianza deben revisarse antes de cualquier escritura en Firestore.
- El resultado confirma que conviene continuar con transformador por etapas, no con carga directa.

## Siguiente paso técnico

Crear una versión más estricta del transformador financiero que genere estructuras separadas:

- `financialMovements`;
- `shopperBenefits`;
- `paymentLots`;
- `reconciliations`;
- `ignoredRows`;
- `issues`.

Luego validar nombres de shoppers contra HR V4 y resolver ambigüedades antes de escribir Firestore DEV.

## Restricciones conservadas

- Sin escritura Firestore.
- Sin importación real.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin adapter global.
- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
