# ACADEMIA — Addendum C6 one-target password rollback snapshot read-only

**Fecha:** 2026-08-07

Este bloque no cambia cursos, pantallas ni rutas por rol. Sí aporta un patrón técnico reutilizable para documentación avanzada de operación segura:

1. identidad actual y claims objetivo son conceptos distintos;
2. si un claim será corregido, no debe usarse como único ancla para decidir qué cuenta modificar;
3. un rollback de credenciales requiere primero ligar inequívocamente el target actual y luego capturar el estado restaurable;
4. `STOP_RETRY` antes de writes es un resultado correcto cuando la reversibilidad no puede demostrarse;
5. evidencia source-safe debe registrar estados y conteos, nunca UID, correo, login, password, hash, salt o PII.

No se debe publicar contenido técnico de credenciales para Shopper/Cliente. Este patrón corresponde a manuales internos de administración/operación avanzada y seguridad.

Estado: sin cambio funcional de Academia; contenido conceptual pendiente de incorporar cuando se consolide la ruta Auth/RBAC de Phase A.
