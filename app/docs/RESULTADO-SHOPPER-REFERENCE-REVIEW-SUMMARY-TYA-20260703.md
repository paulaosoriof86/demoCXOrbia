# Resultado shopper reference review summary TyA

Fecha: 2026-07-03

## Resultado local reportado

Paula ejecuto `tools/migration/tya-shopper-reference-review-summary.mjs` y pego el reporte sanitizado.

## Seguridad reportada

- Firestore writes: 0
- Imports executed: 0
- Deploy: 0
- Production: 0
- executeAllowed: false
- No plain PII in report

## Prerrequisitos encontrados

- `shopperReferenceReview.jsonl`: found
- `shopperIdentityCandidates.jsonl`: found
- `canonicalShopperMap.jsonl`: found
- `shopperDuplicateReview.jsonl`: found
- `shopperIdentityReviewManifest.json`: found

## Conteos reportados

- Reference review rows: 661
- Candidate rows: 276
- Canonical rows: 276
- Duplicate review rows: 276
- With canonicalShopperId: 661 (100.00%)
- Missing canonicalShopperId: 0 (0.00%)
- Matched known canonical: 0 (0.00%)
- Unmatched canonical: 661 (100.00%)
- Medium confidence: 661 (100.00%)
- Low/review confidence: 0 (0.00%)
- Missing identity: 0 (0.00%)
- Strict blockers: 661

## Distribucion reportada

### Por sourceType

| sourceType | count |
|---|---:|
| unknown_event_or_visit | 617 |
| postulation | 44 |

### Por identityKind

| identityKind | count |
|---|---:|
| legacy_source_id | 661 |

### Por confidence

| confidence | count |
|---|---:|
| medium | 661 |

### Por canonical match

| status | count |
|---|---:|
| unmatched_canonical | 661 |

## Decision tecnica actual

- Decision: `review_required`
- Motivo: las 661 referencias tienen `canonicalShopperId`, pero ninguno coincide contra el universo canonico conocido de shoppers.

## Interpretacion tecnica

Este resultado no significa que existan 661 shoppers adicionales.

La lectura mas probable es que las referencias de visitas/postulaciones estan generando `canonicalShopperId` a partir de un identificador de evento o de origen local de la fila, no a partir de la identidad canonica del shopper.

Soporte desde la herramienta actual:

- `tya-build-shopper-identity-review.mjs` calcula identidad con campos genericos como `sourceId`, `shopperId`, `uid`, `id`, `docId`, `legacyId`.
- Las referencias se construyen recorriendo `postulations` y `visits`.
- Si no hay email/telefono/nombre, el flujo puede caer en `legacy_source_id` usando el identificador disponible de la fila.

Soporte desde el staging preview:

- Las visitas sanitizadas, cuando no se usa PII local, conservan banderas como `hasShopperName`, `hasPhone` y `hasEmail`, pero no guardan el valor crudo.
- Las postulaciones sanitizadas conservan `sourceId` del evento/postulacion y `platformVisitKey`, pero no un `shopperSourceId` canonico visible en el preview.

## Impacto en readiness

SHOPPER_REVIEW sigue en `review_required`.

No se puede bajar todavia a `provisional_identity_allowed_for_dev_staging` hasta validar si existe un campo seguro de relacion shopper-evento o hasta ajustar la herramienta para no confundir IDs de evento con IDs de shopper.

## Siguiente bloque

Crear y ejecutar un diagnostico local sanitizado de disponibilidad de campos en referencias:

- No debe imprimir valores.
- Solo debe contar nombres de campos y presencia por tipo de fila.
- Debe ayudar a distinguir entre:
  - falta real de referencia shopper-evento;
  - campo existente pero no mapeado;
  - falso positivo de la herramienta por uso de `sourceId`/`docId` como identidad de shopper.

## Estado

- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion.
- Sin Auth real.
- Sin datos crudos en repo.
