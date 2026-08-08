# ACADEMIA — Impacto R17M no-execute

Fecha: 2026-07-29

Patrón reusable:
- migración canonical-shadow puede preservar topología previa para rollback sin usar ambas como fuente activa;
- un único read-path debe quedar activo después del smoke;
- `compare` y `write plan` no equivalen a autorización de escritura;
- shopper dedupe usa llave estable, nunca solo nombre;
- certificaciones carryover requieren fuente; no se infieren;
- liquidation control no equivale a pago.

Impacta contenidos Admin/Superadmin, arquitectura, QA y troubleshooting. Sin cambio inmediato en cursos Shopper o notificaciones.
