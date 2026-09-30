# Resumen para Claude — baseline viva V103 empalmada

Claude no pudo ejecutar el último paquete. V103 fue aceptada por Paula como baseline incremental de trabajo y empalmada con Phase A.

## No reabrir

- navegación, branding y arquitectura modular;
- indicador único de datos;
- outbox y separación requested/configured;
- permisos fail-closed y namespacing tenant;
- workflow base de Academia y soft-delete;
- PWA network-first;
- adapters/snapshot/entry point TyA, que son backend-only.

## Pendientes acumulados

1. Manifest/build lock interno reproducible.
2. Smoke real de seis perfiles, desktop/móvil y consola.
3. Cero datos inventados fuera de demo en Portal Cliente, Dashboard, Finanzas, Certificación y topbar.
4. Separar liquidación de pago.
5. Certificación preview no habilita visitas.
6. Contexto de permisos multipaís por entidad.
7. Academia: permiso/contexto exacto en cada control y handler.
8. Copy/manuales honestos; cero API keys o proveedores activos en navegador.
9. Reemplazar hard-delete de visita por archivo/cancelación auditada.

## Contratos backend nuevos

- `backend/contracts/phase-a-liquidation-payment-control-v1.json`.
- `backend/contracts/phase-a-certification-carryover-control-v1.json`.

La próxima intervención de Claude debe partir de V103 como baseline vigente y no tocar backend-only.
