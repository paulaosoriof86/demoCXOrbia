# ACADEMIA — C6 AUTH DUPLICATE CANONICAL TARGET INPUT RESOLUTION

**Fecha:** 2026-08-10

Sin cambios de cursos, manuales, rutas, certificaciones ni UI.

Patrón reusable interno:

- identidad del owner no se deduce por rol;
- entitlement se prueba de forma explícita para evitar expansión silenciosa de acceso;
- credenciales nuevas se generan/reciben solo de forma efímera y nunca se documentan;
- una identidad canónica debe validarse antes de retirar históricos;
- retiro reversible `DISABLE_ONLY_NO_DELETE`.

No exponer fingerprints, claims internos ni decisiones de canonicalización en contenido visible a shoppers o clientes.
