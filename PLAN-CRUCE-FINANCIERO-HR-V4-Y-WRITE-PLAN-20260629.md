# PLAN-CRUCE-FINANCIERO-HR-V4-Y-WRITE-PLAN-20260629

## Objetivo

Agregar la etapa posterior al transformador financiero estricto: cruzar beneficios y pagos contra HR V4 y construir un plan de escritura candidato, sin escribir Firestore.

## Scripts creados

```text
firebase/client-write-tools/crosscheck-financial-tya-strict-vs-hr-v4.mjs
firebase/client-write-tools/build-financial-tya-write-plan-dry-run.mjs
```

## Crosscheck financiero vs HR V4

Entrada esperada:

```text
firebase/private-output/financial-tya-strict-dry-run.json
firebase/private-output/hr-tya-historico-good-firestore-transform-v4.json
```

Salida esperada:

```text
firebase/private-output/financial-tya-strict-vs-hr-v4-crosscheck.json
firebase/private-output/financial-tya-strict-vs-hr-v4-crosscheck-summary.md
firebase/private-output/financial-tya-strict-vs-hr-v4-crosscheck-issues.csv
```

Cruza por shopper, periodo, país, visita, sucursal cuando el texto lo permite y monto cercano cuando aplica.

Clasifica beneficios como:

- `benefitMatches`;
- `ambiguousBenefits`;
- `unmatchedBenefits`.

Solo matches fuertes pueden avanzar a write-plan candidato.

## Write-plan dry-run

Entrada esperada:

```text
firebase/private-output/financial-tya-strict-dry-run.json
firebase/private-output/financial-tya-strict-vs-hr-v4-crosscheck.json
```

Salida esperada:

```text
firebase/private-output/financial-tya-write-plan-dry-run.json
firebase/private-output/financial-tya-write-plan-dry-run-summary.md
```

Construye operaciones candidatas para:

- `shopperBenefits` solo si tuvieron match fuerte contra HR;
- `financialMovements` sin banderas de posible fuera de alcance;
- `paymentLots` solo si tienen beneficios matcheados;
- `auditLogs` como importBatch candidato.

## Restricción central

El write-plan no escribe Firestore. Solo genera JSON de operaciones candidatas.

## No avanzan automáticamente

- beneficios sin shopper;
- beneficios con visita ambigua;
- beneficios sin visita candidata;
- paymentLots sin beneficios matcheados;
- movimientos con posible fuera de alcance.

## Orden recomendado de ejecución local

```text
1. transform-financial-tya-excel-strict-dry-run.mjs
2. validate-financial-tya-strict-output.mjs
3. crosscheck-financial-tya-strict-vs-hr-v4.mjs
4. build-financial-tya-write-plan-dry-run.mjs
```

## Gates antes de carga real

- Validar strict dry-run.
- Validar crosscheck HR V4.
- Resolver aliases y ambiguos.
- Revisar movimientos fuera de alcance.
- Aprobar totales por país, periodo y moneda.
- Publicar reglas DEV solo si se autoriza.
- Pedir confirmación explícita de escritura Firestore DEV.

## Restricciones conservadas

- Sin escritura Firestore.
- Sin importación real.
- Sin Hosting.
- Sin merge.
- Sin producción.
- Sin adapter global.
- Sin cambios en `/app/modules`.
- Sin cambios en `/app/core`.
