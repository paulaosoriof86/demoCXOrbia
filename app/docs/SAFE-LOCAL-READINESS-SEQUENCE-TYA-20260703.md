# Safe local readiness sequence TyA

Fecha: 2026-07-03

## Archivo creado

- `tools/migration/tya-run-safe-local-readiness-sequence.mjs`

## Proposito

Ejecutar en local la secuencia de reportes seguros para evitar correr cada script manualmente.

## Secuencia

- plan canonico,
- candidato sanitizado,
- identidad shopper,
- comunicaciones heredadas,
- candidatos operativos,
- readiness consolidado.

## Salidas locales

En `tmp/tya-safe-local-readiness-sequence`:

- `safeLocalReadinessSequence.json`
- `safeLocalReadinessSequence.md`

## Estado

- Sin escritura.
- Sin importacion.
- Sin deploy.
- Sin produccion.

## Uso local futuro

```powershell
node .\tools\migration\tya-run-safe-local-readiness-sequence.mjs
```
