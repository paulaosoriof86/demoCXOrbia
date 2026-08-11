# RESUMEN PARA CLAUDE — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Fecha:** 2026-08-10

No hay cambio frontend autorizado ni requerido.

Backend deja fijado:

- A–C se resuelven por owner empresarial + entitlement exacto, nunca por fingerprint/keeper legacy.
- Paula solo debe responder titular del rol y si el acceso es TyA completo o proyectos específicos.
- No exponer preguntas técnicas, claims, fingerprints, UID, emails internos ni estrategias de credencial en UI.
- `authNamespace=staff` continúa como contrato para `super`, `admin` y `ops`.
- `projectIds` debe representar entitlement exacto; no hardcodear Cinépolis ni copiar scope histórico.
- A puede reutilizar un `super` canónico únicamente si el owner binding independiente coincide.
- B/C usarán credencial nueva efímera durante una futura ejecución backend autorizada; no construir pantallas especiales para ello.
- D sigue `REPAIR_PLAN_READY` y no se reabre.

**Claude/prototipo:** sin cambios.
**Academia:** conservar únicamente el principio conceptual de least privilege; no convertir esta resolución interna en flujo visible para usuarios.
