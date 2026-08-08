# Tracker Phase A — Addendum DEV Auth/Firestore post-V96

Fecha: 2026-07-10

## Bloque completado

`DEV Auth/Firestore activation readiness desde source lock post-V96` — preparación contractual y coherencia backend.

## Hecho/documentado

- Source lock post-V96 usado como base viva.
- RBAC base alineado con claims v2.
- Roles cliente Phase A incorporados al contrato backend.
- `countryRepresentative` unificado como `projectAdmin` por mínimo privilegio.
- Fail-closed backend para rol/persona/scope/ruta/módulo desconocidos.
- Orquestador y config source-safe de activation readiness creados.
- Validator safe-only creado.
- Impacto Claude y Academia documentado.

## Ya estaba hecho y no se reabrió

- CX.data adapter/bridge disabled.
- Esquema Firestore protegido.
- Reglas DEV draft.
- Protected read adapter.
- HR source-safe → protected candidates.
- reviewQueue/auditEvents.
- Shoppers históricos y certificaciones carryover.
- Liquidaciones/pagos junio.
- Make/Gemini/Storage/outbox gates.
- Module readiness y readiness buckets.

## Preparado/no ejecutado

- validación acumulada en rama completa;
- configuración futura de Firebase DEV nuevo y vacío;
- emulador/reglas read-only;
- dry-run de claims;
- protected reads por rol.

## Pendiente autorización

- crear/configurar entorno Firebase DEV;
- configurar proveedor Auth;
- crear usuarios de prueba;
- escribir claims;
- desplegar reglas;
- activar lecturas protegidas.

## Pendiente Claude/prototipo

- P1 `cli_*`/allowlist;
- unknown module fail-closed absoluto;
- copy residual;
- smoke visual por rol.

## Bloqueado por gate

- Firestore writes/import;
- `CX.data` runtime switch;
- HR writeback;
- Make/Gemini/Storage;
- pagos reales;
- producción.

## Siguiente bloque exacto

Ejecutar/encadenar validación estática acumulada y preparar el paquete de identidad/configuración externa del entorno Firebase DEV limpio, sin crear todavía el proyecto ni activar proveedores.

## Necesidad de Paula

Ninguna en este punto. Autorización explícita solo al llegar a la creación/configuración real de DEV.
