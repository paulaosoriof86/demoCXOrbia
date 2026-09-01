# PENDIENTES PROTOTIPO - Addendum post-Claude immediate audit pack

Fecha: 2026-07-10

## Pendientes para revisar en la proxima candidata Claude

La proxima auditoria debe verificar si el prototipo representa correctamente:

- configuracion por tenant/proyecto;
- proyecto separado de periodo;
- source/HR enmascarado y source-safe;
- usuarios/personas/roles/scopes configurables;
- Academia/cursos/manuales por rol;
- certificaciones y carryover;
- shopper public refs vs protected profile;
- liquidaciones/pagos con preview/review y gate-off;
- reviewQueue y auditEvents;
- Make/Gemini/pagos sin promesas reales;
- PWA/branding/manifest dinamico;
- readiness/gates visibles;
- switch futuro `CX.data` sin romper interfaz.

## Pendientes de auditoria

- Confirmar que no se pidan a Claude cambios backend ya preparados.
- Confirmar que lo especifico de TyA quede como configuracion/seed y no como hardcode.
- Confirmar que patrones reusable CXOrbia sean configurables para otros tenants.
- Confirmar que no se marquen como faltantes elementos que si estan implementados.
- Confirmar que no se preserven regresiones solo porque fueron agregadas por Claude.

## Prioridad

P0: todo lo que bloquee conexion real TyA o cause reproceso conocido.
P1: mejoras que conviene pedir mientras Claude tenga capacidad.
