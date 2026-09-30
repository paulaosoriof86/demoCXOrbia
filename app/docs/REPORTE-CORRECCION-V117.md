# REPORTE DE CORRECCIÓN — V117 (avance OLA 1 sobre V116)

Baseline: `Prototype development request CXOrbia V116.zip`.

## OLA 1 — Fixtures solo en demo: gap real encontrado y corregido

Auditoría transversal de `showFixtures()` en todos los módulos: 13+
ubicaciones ya gateadas correctamente (cert, correo, soporte, finanzas,
cliente, reservas, configuración, dashboard, notif, topbar, data.js). Un
módulo NO estaba gateado: `modules/crm.js` sembraba oportunidades/cuentas/
contactos con nombres, correos y teléfonos de empresas ficticias
(Cadena Norte, Grupo Vértice, Banca del Istmo, FarmaPlus) SIN gate de modo
demo — visibles también fuera de demo. Corregido al mismo patrón usado en
el resto de la plataforma (`seed()`/`cuentasSeed()`/`contactosSeed()`
devuelven `[]` fuera de demo).

Probado en runtime: modo demo → 4 oportunidades; `source_safe_preview` → 0.
48/48 módulos × 3 roles sin error.

`meta()` (metas comerciales mensual/trimestral, valores numéricos genéricos
de configuración, no datos de cliente) se dejó sin cambio — no es un
fixture de cliente ficticio, es un default de configuración razonable.

## Resto de OLA 1/OLA 2/OLA 3: sigue NO_ATENDIDO (backlog sustancial, ver
`01-BACKLOG-COMPLETO-POR-MODULO.md`).

## Gate técnico
- Sintaxis: PASS. Smoke 48×3: sin error. Manifest V117 regenerado, 0 diffs.
