# RESUMEN PARA CLAUDE — Corte 4 read-only — 2026-07-29

## Estado

- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Corte 4: read-only hardening aplicado; proveedor todavía no activado.
- No V183. No R33.

## Backend que debe preservarse

- `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`.
- `app/core/backend-cxdata-readonly-corte4.js`.
- `backend/rules/firestore.corte4-readonly.rules`.
- `tools/qa/cxdata-firestore-readonly-corte4-gate.mjs`.

## Reglas obligatorias para frontend

- No escribir lógica Firebase en módulos UI.
- No llamar Firestore directamente.
- No reintroducir persistencia en `CX.data`.
- No tratar backend vacío como datos demo.
- No ocultar errores de lectura detrás de mock/localStorage.
- Mantener `CX.data` como interfaz pública estable.
- No habilitar botones/acciones de escritura desde una candidata frontend.

## Rules

Las Rules actuales del repo permiten writes por rol y no son válidas para activar Corte 4 read-only. El candidato `backend/rules/firestore.corte4-readonly.rules` no está desplegado y no debe tocarse desde candidata.

## Pendientes frontend no bloqueantes preservados

- PDF sin gráfica visible al imprimir.
- Excel con formato básico.
- Mejora transversal de `reportKit`.
- Copy “Pendiente de fuente” por tipo de fuente.

Cualquier ajuste futuro debe registrarse por archivo/módulo, sin reabrir Corte 3 ni cambiar contratos backend.
