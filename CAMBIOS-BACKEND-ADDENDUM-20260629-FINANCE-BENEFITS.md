# CAMBIOS-BACKEND-ADDENDUM-20260629-FINANCE-BENEFITS

## Bloque

Finanzas profundo / Mis Beneficios.

## Archivos creados

```text
firebase/schema/cxorbia-finance-benefits-v2.json
firebase/contracts/cx-data-finance-benefits-contract-v2.json
firebase/client-write-tools/build-finance-benefits-from-hr-v4-dry-run.mjs
firebase/client-write-tools/validate-finance-benefits-from-hr-v4-dry-run.mjs
firebase/client-write-tools/run-finance-benefits-hr-v4-pipeline-dry-run.mjs
firebase/client-write-tools/build-finance-benefits-write-plan-dry-run.mjs
firebase/client-write-tools/validate-finance-benefits-write-plan-dry-run.mjs
firebase/client-write-tools/run-finance-benefits-full-pipeline-dry-run.mjs
RUNBOOK-FINANCE-BENEFITS-HR-V4-DRY-RUN-20260629.md
RUNBOOK-FINANCE-BENEFITS-FULL-PIPELINE-20260629.md
MODELO-REGLAS-FINANCE-BENEFITS-DEV-20260629.md
app/core/backend-finance-benefits.js
```

## Decisiones

- Separar beneficio calculado, lote de pago, movimiento financiero real, conciliación y reembolso cliente/franquicia.
- Mis Beneficios debe consultar solo beneficios del shopper autenticado.
- Si no hay shopperId o no hay beneficios, debe devolver vacío.
- GT usa GTQ y honorario base Q60.
- HN usa HNL y honorario base L200.
- El adapter financiero se creó como archivo nuevo y no queda conectado al HTML principal todavía.

## Estado técnico

- Dry-run desde HR V4 listo.
- Validación de dry-run lista.
- Write-plan seco listo.
- Validación de write-plan seco lista.
- Scaffold de lectura para beneficios, lotes, movimientos y sugerencias de conciliación listo.

## Pendiente

Ejecutar pipeline completo, revisar reporte y luego decidir carga DEV.

## Impacto

- Sin escritura Firestore.
- Sin Hosting.
- Sin publicación de reglas.
- Sin cambios en `/app/modules`.
- Sin producción.
