# REPORTE DE CORRECCIÓN — V116 (avance OLA 1 sobre V115)

Baseline: `Prototype development request CXOrbia V115.zip`.

## OLA 1 — Contrato de contexto único: PASS_COMPROBADO (parcial de OLA 1)

Se agregó `CX.data.ctx()` — objeto único
`{tenantId, projectId, periodId, countryScope, role, dataMode}` pedido en
`05-CONTRATOS-REUTILIZABLES-A-REFLEJAR.md`. Compone fuentes YA existentes sin
duplicar lógica: `CX.BRAND`/`CX.tenant` (tenantId), `currentProjectId`/
`currentPeriodId` (estado real ya separado desde V113), `scopePaises()`
(countryScope), `CX.session.effectiveRole()` (role — ya resolvía el rol
efectivo bajo shell admin desde V94), `CX.dataSource.mode` (dataMode — ya
existente desde el paquete post-empalme). Probado en runtime: devuelve los 6
campos con valores reales.

Migración de módulos individuales a consumir `ctx()` en vez de leer los
campos por separado: NO_ATENDIDO en esta ronda (es un cambio grande y de
bajo riesgo que puede hacerse incrementalmente sin romper nada, porque
`ctx()` es aditivo).

## Resto de OLA 1 (contrato de Fuente unificado, auditoría transversal de
fixtures-solo-en-demo) y OLA 2/OLA 3 completos: siguen NO_ATENDIDO — el
backlog es sustancial (ver `01-BACKLOG-COMPLETO-POR-MODULO.md`) y no se
intentó en esta ronda; se prioriza avanzar de forma verificable en vez de
declarar cobertura no comprobada.

## Gate técnico
- Sintaxis: PASS (core/data.js con el nuevo método).
- Smoke 48 módulos × 3 roles: sin error.
- Manifest V116 regenerado, 0 diffs.
