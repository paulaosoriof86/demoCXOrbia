# RESUMEN PARA CLAUDE — C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION

**Fecha:** 2026-08-10

No hay cambio frontend.

Backend confirma:

- A `1acd...`: faltan owner anchor y entitlement exacto; no reutilizar el `super` canónico por unicidad de rol.
- B `2c4d...`: faltan owner anchor, entitlement exacto y credencial canónica nueva efímera.
- C `542...`: faltan owner anchor, entitlement exacto y credencial canónica nueva efímera.
- D permanece `REPAIR_PLAN_READY` y no se reabre.
- Nunca mostrar fingerprints, selector de duplicados, fallback legacy ni copy técnico al usuario.
- No relajar RBAC ni inferir `cinepolis` para staff A–C.

**Claude/prototipo:** sin cambios.  
**Academia:** sin pantalla/curso nuevo; conservar el principio de least privilege y canonicalización segura.
