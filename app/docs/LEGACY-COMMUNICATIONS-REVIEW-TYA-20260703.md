# Legacy communications review TyA

Fecha: 2026-07-03
Rama: `docs-tya-v6-v71-audit`
PR: #7 draft

## Objetivo

Preparar revision historica de comunicaciones/notificaciones heredadas sin activar envios reales ni flujos automaticos.

## Archivo tecnico creado

- `tools/migration/tya-build-legacy-communications-review.mjs`

## Entrada local

- `tmp/tya-sanitized-dev-candidate/candidateNotificationsHistory.jsonl`
- `tmp/tya-shopper-identity-review/shopperIdentityCandidates.jsonl`
- `tmp/tya-shopper-identity-review/canonicalShopperMap.jsonl`

## Salidas locales

En:

```text
tmp/tya-legacy-communications-review
```

Genera:

- `legacyCommunicationReview.jsonl`
- `legacyCommunicationReviewRequired.jsonl`
- `legacyCommunicationUnresolved.jsonl`
- `legacyCommunicationReviewManifest.json`
- `legacyCommunicationReviewReport.md`

## Politica aplicada

- Comunicaciones heredadas quedan como historial.
- No activar WhatsApp, correo, push, Make ni automatizaciones desde historico migrado.
- Resolver destinatario canonico solo para trazabilidad.
- Usar fingerprints hash, sin exponer PII plana.
- Los casos sin coincidencia fuerte quedan en revision.
- Los flujos activos futuros deben ejecutarse por backend server-side y reglas por tenant.

## Seguridad

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- Produccion: 0.
- activeFlow: false.
- executeAllowed: false.

## Uso local futuro

Desde la raiz del repo:

```powershell
node .\tools\migration\tya-build-legacy-communications-review.mjs
```

## Resultado esperado

Antes de cualquier escritura DEV debe existir:

- historial de comunicaciones separado,
- destinatarios mapeados cuando sea posible,
- comunicaciones sin destinatario claro en revision,
- confirmacion de que ningun evento historico activara envios reales.
