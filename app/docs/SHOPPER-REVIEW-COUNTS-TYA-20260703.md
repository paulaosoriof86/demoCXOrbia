# Shopper review counts TyA

Fecha: 2026-07-03

## Archivo creado

- `tools/migration/tya-shopper-review-counts.mjs`

## Proposito

Generar un resumen local de conteos para revisar el bloque SHOPPER_REVIEW sin pegar datos crudos.

## Salidas locales

En `tmp/tya-shopper-review-counts`:

- `shopperReviewCounts.json`
- `shopperReviewCounts.md`

## Comando local

```powershell
node .\tools\migration\tya-shopper-review-counts.mjs
```

## Estado

- Revision local.
- Sin deploy.
- Sin produccion.
