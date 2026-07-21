# Resumen para Claude — Addendum V170 HOLD

Fecha: 2026-07-21

## Lo conectado y preservado

- HR viva read-only confirmada.
- Cloud Run DEV y Hosting DEV operativos.
- Corte 1A y adapters live preservados.
- La candidata V170 amplía reportes, diseño, gráficas, multiproyecto y add-ons.

## Lo que impide aplicar V170

1. router `super` solo protegido en `buildRail`, no en `mount`/`nav`;
2. reportes Shopper usan fallback `sh1`;
3. selector multiformato puede guardar XLSX/PPTX con extensión `.pdf`;
4. Panorama redefine estados y cuenta submitido sin confirmación explícita;
5. Reportes Admin redefine estados y puede incluir archivadas;
6. add-ons usan una clave global no aislada por tenant/proyecto;
7. geo-checkin no guarda la foto, no persiste y permite declarar evidencia sin GPS;
8. `mireportes` no está en NAV Shopper;
9. rol Admin de geo-checkin no tiene consumidor real;
10. equivalencia visual multiformato aún requiere gates.

## Fuente vinculante

- `AUDITORIA-CANDIDATA-V170-CORTE1B-20260721.md`;
- `PAQUETE-CORRECCION-CLAUDE-V170-CORTE1B-20260721.md`.

## Regla

Corregir sobre V170, no rehacer desde V164. Preservar todas las mejoras que pasan auditoría. No modificar backend, `CX.data`, adapters live, contratos, IAM, Hosting ni producción.

## Siguiente bloque

`CANDIDATA V170 CORREGIDA → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY → GATES → HOSTING DEV → VALIDACIÓN VISUAL`