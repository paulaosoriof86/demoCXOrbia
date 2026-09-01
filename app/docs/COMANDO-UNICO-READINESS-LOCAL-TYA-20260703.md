# Comando unico readiness local TyA

Fecha: 2026-07-03

## Objetivo

Reducir operacion manual a un solo comando local para generar reportes de readiness.

## Requisito previo

Debe existir localmente el reporte de HR private full flow:

```text
tmp/hr-source-private-full-flow/hrSourcePrivateFullFlow.json
```

## Comando unico

Desde la raiz del repo:

```powershell
node .\tools\migration\tya-run-safe-local-readiness-sequence.mjs
```

## Que genera

- `tmp/tya-canonical-staging/tyaCanonicalStagingPlan.md`
- `tmp/tya-sanitized-dev-candidate/sanitizedDevCandidateReport.md`
- `tmp/tya-shopper-identity-review/shopperIdentityReviewReport.md`
- `tmp/tya-legacy-communications-review/legacyCommunicationReviewReport.md`
- `tmp/tya-liq-candidate-review/liqCandidateReviewReport.md`
- `tmp/tya-readiness-consolidated/readinessConsolidated.md`
- `tmp/tya-safe-local-readiness-sequence/safeLocalReadinessSequence.md`

## Estado seguro

- Sin escritura.
- Sin importacion.
- Sin deploy.
- Sin produccion.

## Que pegar en ChatGPT

Pegar solamente el contenido de:

```text
tmp/tya-readiness-consolidated/readinessConsolidated.md
```

No pegar URLs privadas ni datos crudos.
