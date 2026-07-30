# PLAN-TRANSFORMACION-ESTRICTA-FINANCIERA-TYA-20260629

## Objetivo

Preparar una segunda etapa de dry-run para transformar el Excel financiero histórico TyA en estructuras separadas compatibles con el modelo backend CXOrbia.

## Script creado

```text
firebase/client-write-tools/transform-financial-tya-excel-strict-dry-run.mjs
```

## Modo

Solo lectura.

No escribe Firestore, no modifica Excel, no hace Hosting, no hace merge, no toca producción y no activa adapter global.

## Entradas

### Obligatoria

```text
--file="ruta del Excel financiero"
```

### Opcional

```text
--hr="firebase/private-output/hr-tya-historico-good-firestore-transform-v4.json"
```

Si existe HR V4 local, el script intenta cruzar nombres de shoppers contra el índice histórico.

## Salidas

En `firebase/private-output`:

```text
financial-tya-strict-dry-run.json
financial-tya-strict-dry-run-summary.md
financial-tya-strict-dry-run-issues.csv
financial-tya-strict-dry-run-shopper-aliases.csv
```

## Estructuras generadas

El JSON separa:

- `financialMovements`;
- `shopperBenefits`;
- `paymentLots`;
- `reconciliations`;
- `ignoredRows`;
- `issues`.

## Reglas incluidas

- Incluye hojas TyA, TyA HN y Liquidación desde 2025.
- Incluye `May HN 26` como TyA Honduras.
- Excluye hojas anteriores a 2025 y no TyA.
- Diferencia movimientos reales de beneficios calculados.
- No asume pago real solo por existir fila de liquidación.
- Genera issues cuando falta periodo, monto o match de shopper.

## Revisión requerida

Antes de cualquier escritura Firestore DEV se debe revisar:

- nombres de shoppers sin match;
- aliases ambiguos;
- lotes detectados;
- movimientos financieros incluidos;
- filas ignoradas;
- totales por país y periodo;
- ausencia de datos personales u otros negocios.

## Siguiente paso posterior

Después del dry-run estricto, preparar un script de validación cruzada contra HR V4:

- periodo;
- país;
- shopper;
- visita;
- sucursal;
- monto;
- estado de pago.

Solo después de esa validación se podrá pedir autorización explícita para escritura en Firestore DEV.

## Restricciones conservadas

- Sin escritura Firestore.
- Sin importación real.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin adapter global.
- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
