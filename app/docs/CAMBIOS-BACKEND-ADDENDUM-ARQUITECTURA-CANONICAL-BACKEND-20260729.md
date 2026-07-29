# CAMBIOS BACKEND — Corrección arquitectura legacy vs backend canónico

**Fecha:** 2026-07-29  
**Estado:** `ARCHITECTURE_CORRECTED__CANONICAL_INVENTORY_PASS__PHASEA_GAP_PASS__ANOMALY_PROBE_PASS__NO_DATA_WRITES`

## Qué se corrigió
- Se eliminó la interpretación que trataba `cxorbia-backend-dev` como “base vieja/excluida”.
- La plataforma legacy a retirar es TyA Consultores actual; de ella solo se recuperan datos útiles limpios.
- `cxorbia-backend-dev` es backend DEV canónico de CXOrbia con TyA como primer tenant.
- `cxorbia-tya-dev-260729-c4` es sandbox técnico Corte 4, no destino de materialización.
- Se conserva el Hosting público actual para cutover final.

## Archivos creados/tocados
- `app/docs/ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
- `app/core/backend-config.js`: identidad canónica/sandbox corregida; `enabled=false`, writes deshabilitados.
- `tools/qa/cxorbia-canonical-backend-readonly-inventory.mjs` + workflow/request.
- `tools/qa/cxorbia-canonical-backend-phasea-gap-reconcile.mjs` + workflow/request.
- `tools/qa/cxorbia-canonical-backend-anomaly-probe.mjs` + workflow/request.
- `app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.*`.
- `app/docs/evidence/CANONICAL-BACKEND-PHASEA-GAP-LATEST.*`.
- `app/docs/evidence/CANONICAL-BACKEND-ANOMALY-PROBE-LATEST.*`.
- `app/docs/PROMPT-REFRESH-DELTA-LEGACY-TYA-SHOPPERS-CERTIFICACIONES-20260729.md`.
- addenda Claude/PENDIENTES/Academia de arquitectura canónica.

## Inventario read-only — PASS
`cxorbia/canonical-backend-readonly-inventory=success`.

Sin PII ni provider writes:
- Auth users=17, claims tenant/proyecto/rol/shopper presentes;
- 83 rutas Firestore, no truncadas;
- clients=3;
- projects=29;
- visits=619;
- questionnaires=557;
- shoppers=215;
- liquidations=255;
- postulations=3;
- applications=1;
- notifications=20;
- shopperBenefits=572;
- certifications=0;
- shoppers con campos de certificación/curso/Academia=0.

## Reconciliación Phase A — PASS incremental
`cxorbia/canonical-backend-phasea-gap=success` con `PASS_GAP_RECONCILED_INCREMENTAL_PHASEA_REQUIRED`.

- Source lock: 14 periodos × 44 = 616 visitas.
- Proyectos canónicos esperados/encontrados: 28/26.
- Faltan `cinepolis-julio-26` y `cinepolis-julio-26-hn` = 44 visitas.
- Proyectos canónicos encontrados: 574 visitas vs 572 esperadas.
- Excesos: `cinepolis-abril-26` +1 y `cinepolis-junio-26-hn` +1.
- Pilotos/no canónicos: `julio-pilot` 1, `r1` 36, `tya-piloto` 8 = 45 visitas; no se borran por inferencia.
- Resolver los 2 excesos + materializar julio 2026 deja 616 visitas canónicas.

## Probe de excesos — PASS read-only
`cxorbia/canonical-backend-anomaly-probe=success`.

### `cinepolis-abril-26`
- 35/34.
- 35 sourceRows únicos, sin sourceKey duplicados.
- Entre los IDs aparece `sprint5-visit-mutation-no-real-data`, claramente fuera del patrón `hr-*` y consistente con registro de prueba; no se ha borrado.

### `cinepolis-junio-26-hn`
- 11/10.
- sourceRows 2..12, todos únicos; sin sourceKey duplicados.
- Los 11 documentos siguen patrón `hr-*`; no es seguro decidir cuál sobra solo con Firestore.
- Requiere contraste contra HR/source lock antes de cualquier write.

## Shoppers/certificaciones
- 215 shoppers ya existen: no recrear.
- Certificaciones no están materializadas ni embebidas: refresh legacy dirigido obligatorio.
- Prompt de refresh sanitizado preparado; exporta shoppers+certificaciones, no visitas, código ni parches.

## Impacto Phase A
- Se evita reconstruir TyA en otro Firebase.
- Corte 5 = materialización incremental/delta, no recreación completa.
- Julio 2026 es faltante HR demostrable, sujeto a dry-run.
- Certificaciones legacy son faltante demostrado.
- Shopper refresh se compara contra 215 existentes.

## Seguridad
- Firestore/Auth/Storage/HR writes: 0.
- Hosting/deploy: 0 en este bloque.
- Producción/merge: false.
- Make/Gemini/pagos: 0.

## Clasificación
- **Reusable CXOrbia:** inventario previo, reconciliación contra source lock, separación de pilotos, delta idempotente.
- **Exclusivo TyA:** proyectos/periodos/legacy/Hosting concretos.
- **Claude/prototipo:** preservar fixes core; no nueva candidata.
- **Academia:** migración incremental, cutover y carryover de certificaciones.
- **Sin impacto Claude:** probes provider read-only.

## Siguiente gate
`CONTRASTAR JUNIO-26-HN CONTRA HR SOURCE-SAFE + PREPARAR DRY-RUN SIN WRITES DE JULIO-26 Y DELTA LEGACY SHOPPERS/CERTS → SOLO DESPUÉS PEDIR AUTORIZACIÓN DE WRITES EXACTOS`.
