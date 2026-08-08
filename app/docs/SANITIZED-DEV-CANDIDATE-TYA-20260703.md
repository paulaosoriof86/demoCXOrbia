# Sanitized DEV candidate TyA

Fecha: 2026-07-03
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Reducir bloqueantes criticos sin escribir datos, preparando un candidato DEV sanitizado para revision.

## Archivo tecnico creado

- `tools/migration/tya-build-sanitized-dev-candidate.mjs`

## Entradas locales

- `tmp/tya-staging-preview`
- `tmp/tya-canonical-staging/tyaCanonicalStagingPlan.json`

## Salidas locales

En:

```text
tmp/tya-sanitized-dev-candidate
```

Genera:

- `candidateVisits.jsonl`
- `candidateSubmitidos.jsonl`
- `candidateShoppersSanitized.jsonl`
- `candidatePostulations.jsonl`
- `candidateNotificationsHistory.jsonl`
- `candidateLiquidationOnly.jsonl`
- `candidateIssueResolution.jsonl`
- `sanitizedDevCandidateManifest.json`
- `removedSensitiveFields.audit.json`
- `sanitizedDevCandidateReport.md`

## Politicas aplicadas

- `questionnaire_marks` no se importa como fuente independiente si duplica postulaciones.
- Shoppers se preparan en version sanitizada, eliminando campos sensibles detectados por nombre.
- Notificaciones quedan como historial hasta resolver destinatario canonico.
- Liquidaciones quedan como candidatas, no deuda/pago final.
- Periodos en preparacion o revision no se tratan como importacion final.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.
- canImport: false.
- executeAllowed: false.

## Uso local futuro

Desde la raiz del repo:

```powershell
node .\tools\migration\tya-build-sanitized-dev-candidate.mjs
```

## Lo que todavia falta antes de escribir DEV

- Revisar conteos del candidato contra conteos esperados.
- Confirmar clasificacion de `JUNIO 26`, `JUNIO 26 HN` y `JULIO 26`.
- Definir dedupe/canonicalShopperId.
- Validar reglas Firestore/Auth/Storage.
- Crear runner de escritura separado solo con autorizacion explicita y rollback probado.
