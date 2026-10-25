# Shopper identity review TyA

Fecha: 2026-07-03
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Preparar la politica de identidad y deduplicacion de shoppers antes de cualquier escritura DEV.

## Archivo tecnico creado

- `tools/migration/tya-build-shopper-identity-review.mjs`

## Entrada local

- `tmp/tya-sanitized-dev-candidate/candidateShoppersSanitized.jsonl`
- `tmp/tya-sanitized-dev-candidate/candidatePostulations.jsonl`
- `tmp/tya-sanitized-dev-candidate/candidateVisits.jsonl`

## Salidas locales

En:

```text
tmp/tya-shopper-identity-review
```

Genera:

- `shopperIdentityCandidates.jsonl`
- `canonicalShopperMap.jsonl`
- `shopperDuplicateReview.jsonl`
- `shopperReferenceReview.jsonl`
- `shopperIdentityReviewManifest.json`
- `shopperIdentityReviewReport.md`

## Politica aplicada

- No fusionar shoppers automaticamente.
- Crear `canonicalShopperId` como candidato de mapeo.
- Usar fingerprints hash para email/telefono/nombre/sourceId, sin exponer PII en reportes.
- Identidades por email: alta confianza.
- Identidades por telefono o legacy id: confianza media.
- Identidades solo por nombre o sin datos: revision requerida.
- Referencias de visitas/postulaciones sin identidad fuerte quedan en revision.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.
- executeAllowed: false.
- Sin PII plana en reportes; solo fingerprints.

## Uso local futuro

Desde la raiz del repo:

```powershell
node .\tools\migration\tya-build-shopper-identity-review.mjs
```

## Resultado esperado

Antes de cualquier escritura DEV se debe tener:

- lista de shoppers canonicos candidatos,
- duplicados o bajas confianzas separados,
- referencias de visitas/postulaciones con shopper claro,
- decision manual sobre casos ambiguos.
