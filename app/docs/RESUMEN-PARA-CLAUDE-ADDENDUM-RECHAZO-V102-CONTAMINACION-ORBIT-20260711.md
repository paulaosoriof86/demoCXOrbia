# Resumen para Claude — rechazo del supuesto V102

La entrega anterior fue de Orbit 360 A&S, no de CXOrbia.

No usar ni adaptar:

- `orbit360-platform/`;
- `window.Orbit`;
- Aseguradoras;
- Cotizador;
- Comparativo;
- pólizas, tarifas o comisiones;
- repo `orbit360-core`;
- rama `ays/backend-tenant-lab-v99-20260703`.

Reiniciar exclusivamente desde:

- `Prototype development request CXOrbia V101.zip`;
- auditoría forense V101;
- raíz `app/`;
- namespace `window.CX` / `CX.module(...)`.

Antes de modificar, ejecutar gate de identidad. Si falta `app/index.html`, aparece `window.Orbit` o el manifest apunta a otro repo, detenerse y no entregar.

Los pendientes CXOrbia V101 siguen siendo los bloques A–F ya documentados. Snapshot, adapters, entry point Phase A, Firebase, imports y proveedores siguen fuera del carril Claude.