# Cambios backend addendum - smoke gate RC Phase A

Fecha: 2026-07-06

## Bloque completado

Se agregó un smoke gate local para preparar la salida RC Phase A controlada sin depender de Claude.

## Archivos creados

- `tools/migration/tya-phase-a-rc-smoke-gate.mjs`
- `app/docs/PHASE-A-RC-SMOKE-GATE-POST-V89-20260706.md`
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-SMOKE-GATE-RC-PHASE-A-20260706.md`

## Qué valida

- Existencia de documentos post V89 obligatorios.
- `app/index.html` y charset UTF-8.
- Existencia de scripts locales referenciados.
- Orden correcto del guard `core/production-copy-guard.js`.
- Sintaxis JS de archivos en `app/`.
- IDs únicos en Academia.
- Presencia de cursos `a_backend_prepared` y `a_ops_conflicts_route`.
- Residuos de fuente como warnings mitigados por el guard.

## Decisión técnica

El gate separa hard fails de warnings. Esto permite avanzar rápido a RC Phase A controlada si lo estructural está limpio, sin ocultar la deuda de reemplazos permanentes por archivo.

## Comando

```bash
node tools/migration/tya-phase-a-rc-smoke-gate.mjs --out .tmp/phase-a-rc-smoke
```

## Estado seguro

Sin deploy, sin producción, sin merge, sin Firestore/Auth/Storage reales, sin HR writes, sin Make/Gemini/mensajería/correo real y sin datos sensibles.
