# Phase A RC smoke gate post V89 - CXOrbia TyA

Fecha: 2026-07-06

## Bloque completado

Se agregó un gate local reproducible para decidir si la rama puede avanzar a RC Phase A controlada antes de cualquier producción real.

## Archivo creado

- `tools/migration/tya-phase-a-rc-smoke-gate.mjs`

## Objetivo

Reducir trabajo manual y validar lo mínimo crítico antes de preparar salida controlada:

- `index.html` existe y mantiene charset UTF-8.
- Todos los scripts locales referenciados existen.
- `core/production-copy-guard.js` está cargado después de `core/ui.js` y antes de los módulos.
- Todos los JS de `app/` pasan `node --check`.
- Documentos obligatorios post V89 están presentes.
- Academia mantiene IDs únicos y conserva cursos requeridos.
- Residuos de textos P0 en fuente quedan reportados como warnings si están mitigados por el guard.

## Cómo se ejecuta

Desde la raíz del repo:

```bash
node tools/migration/tya-phase-a-rc-smoke-gate.mjs --out .tmp/phase-a-rc-smoke
```

## Salidas

Si se usa `--out`, crea:

- `.tmp/phase-a-rc-smoke/phase-a-rc-smoke-report.json`
- `.tmp/phase-a-rc-smoke/phase-a-rc-smoke-report.md`

## Criterio de decisión

### GO_CONDICIONADO_RC_PHASE_A

Puede avanzar a RC Phase A controlada si:

- No hay hard fails.
- El guard está cargado en orden correcto.
- No faltan scripts locales.
- JS pasa sintaxis.
- Academia no tiene IDs duplicados.

### NO_GO

No debe avanzar si:

- Falta `index.html`.
- Falta algún script local referenciado.
- Falta el guard.
- El guard carga antes de `core/ui.js` o después de módulos.
- Algún JS tiene error de sintaxis.
- Academia tiene IDs duplicados o faltan cursos requeridos.

## Pendientes que no bloquean RC pero sí producción real

- Aplicar patch permanente por archivo para reemplazar residuos de fuente.
- Smoke visual real en navegador o hosting temporal.
- Validar consola.
- Validar navegación en Dashboard, Postulaciones, Reservas, Automatizaciones, Cuestionario shopper, Finanzas y Academia.
- Confirmar que cursos `a_backend_prepared` y `a_ops_conflicts_route` abren bien.
- Activar gates reales por bloque solo cuando corresponda.

## Impacto Academia

Este gate conserva la regla de Academia post V89: cada bloque funcional debe documentar impacto en cursos, manuales, checklist, glosario, rutas por rol y notificaciones.

## Estado seguro

Sin deploy, sin producción, sin merge, sin Firestore/Auth/Storage reales, sin HR writes reales, sin Make/Gemini/mensajería/correo real y sin datos sensibles.
