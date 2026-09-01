# CAMBIOS BACKEND — R14C FINANZAS REALES TyA

## Clasificación

- Reusable CXOrbia: enlace exacto por referencias protegidas y campos operativos disponibles.
- Exclusivo cliente TyA: mapeo del control de liquidaciones y ledger del workbook TyA.
- Claude/prototipo: sin P0 nuevo; conservar distinción liquidada/pagada.
- Academia: explicar enlace protegido, revisión humana y evidencia de pago.
- Sin impacto Claude inmediato: reconciliación backend source-safe.

## Resultado

- Decisión: `PASS_WITH_REVIEW_REAL_TYA_FINANCIAL_RECONCILIATION_R14C`.
- Visitas HR: 616.
- Filas financieras: 247.
- Enlaces exactos aceptados: 196.
- Filas en revisión: 51.
- Ledger itemizado vinculado a visita: 1/37.
- Importador R4 dry-run: {"schemaVersion":"1.0.0","generatedAt":"2026-07-13T14:32:07Z","tenantId":"tya","projectId":"cinepolis","hrIndex":{"visits":616,"shoppers":210,"sourceSafe":true},"financial":{"rawRecords":196,"uniqueRecords":196,"exactDuplicates":0,"acceptedPaid":0,"pendingReview":196,"batches":0,"sensitiveColumnsExcluded":[]},"certification":{"status":"not_supplied"},"reviewQueue":196,"auditEvents":196,"dryRun":true,"writes":false,"imported":false,"production":false,"providers":false,"safe":true}.
- Cero writes, import real, pagos, deploy o producción.
