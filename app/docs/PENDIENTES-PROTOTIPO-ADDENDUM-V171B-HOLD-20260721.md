# PENDIENTES PROTOTIPO — ADDENDUM V171b HOLD

Fecha: 2026-07-21

## P0 — aislamiento de identidad Shopper

- [Claude/CX] `app/modules/misvisitas.js`: eliminar `shopperId || 'sh1'`.
- [Claude/CX] Sin `shopperId`, Mis Visitas debe mostrar cero filas y bloquear acciones.
- [Claude/CX] Sin `CX.data.visitsForShopper`, usar `[]`; nunca caer a `CX.data.visitas()`.
- [Claude/CX] `app/modules/reservas.js`: eliminar fallback `sh1`; cero lectura/creación/aprobación sin identidad.
- [Claude/CX] `app/modules/midia.js`: Mi Día y próxima visita deben filtrar exclusivamente por shopperId; no ampliar por estado.
- [Claude/CX] `app/app.js`: el seed `sh1` solo puede existir bajo guard demo explícito; live/real falla cerrado.

## Gates obligatorios

- [QA] Shopper A ve solo A.
- [QA] Shopper B ve solo B.
- [QA] Sesión sin identidad ve cero datos privados.
- [QA] Visita agendada de B no aparece en Mi Día de A.
- [QA] Sin `visitsForShopper`, Mis Visitas queda vacío.
- [QA] Cero acciones privadas sin identidad.
- [QA] Búsqueda global de `sh1`: únicamente semillas demo con guard explícito.
- [QA] Las siete correcciones V170 continúan pasando.

## P1/P2

- [Claude/CX] Corregir el campo `bytes` de manifiesto/inventario para contar bytes UTF-8 reales o renombrarlo como caracteres.
- [QA] Validación visual final de legibilidad y equivalencia PDF/XLSX/PPTX después de resolver el P0.

## Preservar

- V164 y Corte 1A.
- HR viva read-only.
- Cloud Run y Hosting DEV.
- ReportKit, reportes multiformato, branding, gráficas, multiproyecto, Panorama, add-ons y Novedades de V171b.

## Cierre pendiente

`CANDIDATA V171B CORREGIDA → EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL → FREEZE CORTE 1`
