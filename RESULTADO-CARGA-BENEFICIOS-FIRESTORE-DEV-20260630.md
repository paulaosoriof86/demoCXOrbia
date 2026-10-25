# RESULTADO-CARGA-BENEFICIOS-FIRESTORE-DEV-20260630

## Resultado

Carga DEV completada correctamente.

## Entorno

- Firebase DEV: `cxorbia-backend-dev`
- Tenant: `tya`

## Conteos

- Registros escritos: 572
- Batches ejecutados: 2

## Por país

- GT: 441 beneficios · total 26460.00 · honorarios 26460.00 · reembolsos 0.00
- HN: 131 beneficios · total 26200.00 · honorarios 26200.00 · reembolsos 0.00

## Confirmación usada

```text
PAULA_AUTORIZA_CARGA_BENEFICIOS_DEV_20260629
```

## Alcance respetado

- Solo se escribieron documentos en `tenants/{tenantId}/shopperBenefits/{benefitId}`.
- No se escribieron pagos reales.
- No se escribieron `paymentLots`.
- No se escribieron `financialMovements`.
- No se escribieron `reconciliations`.
- No se publicó Hosting.
- No se hizo merge.
- No se tocó producción.
- No se modificó `/app/modules`.
- No se marcaron pagos reales.
