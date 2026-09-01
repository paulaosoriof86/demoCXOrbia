# Shopper reference field audit TyA

Fecha: 2026-07-03

## Archivo creado

- `tools/migration/tya-shopper-reference-field-audit.mjs`

## Proposito

Diagnosticar por que las 661 referencias de `shopperReferenceReview` quedaron con `canonicalShopperId` no reconocido contra los 276 shoppers canonicos.

El objetivo no es importar ni corregir datos productivos. El objetivo es distinguir si el bloqueo viene de:

- una falta real de relacion shopper-evento;
- un campo existente pero no mapeado;
- un falso positivo de auditoria causado por usar `sourceId`, `docId` o `sourceRef.sourceKey` de visitas/postulaciones como si fueran identidad de shopper.

## Entradas locales esperadas

En `tmp/tya-sanitized-dev-candidate`:

- `candidateVisits.jsonl`
- `candidatePostulations.jsonl`
- `candidateShoppersSanitized.jsonl`

En `tmp/tya-shopper-identity-review`:

- `shopperReferenceReview.jsonl`
- `canonicalShopperMap.jsonl`
- `shopperIdentityCandidates.jsonl`

## Salidas locales

En `tmp/tya-shopper-reference-field-audit`:

- `shopperReferenceFieldAudit.json`
- `shopperReferenceFieldAudit.md`

## Comando local

```powershell
node .\tools\migration\tya-shopper-reference-field-audit.mjs
```

## Politica de privacidad

El reporte no imprime valores de campos.

Solo imprime:

- nombres de campos;
- conteos de presencia;
- clasificacion de disponibilidad de identidad;
- conteos por tipo.

## Clasificaciones esperadas

- `explicit_identity_available`: existe un campo directo de identidad shopper en filas sanitizadas.
- `only_identity_presence_flags_available`: solo existen banderas tipo `hasEmail`, `hasPhone`, `hasShopperName`, sin valores.
- `only_generic_event_or_source_keys_available`: solo hay IDs de evento/origen, no identidad shopper.
- `no_identity_signal_available`: no hay senal util.

## Estado

- Revision local.
- Sin deploy.
- Sin produccion.
- Sin escritura Firestore.
- Sin importacion.
- Sin valores crudos.
