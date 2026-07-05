# Matriz decisiones Phase A

Fecha: 2026-07-05

| Decision | Estado | Condicion para avanzar |
| --- | --- | --- |
| P0 textos operativos | Pendiente | Corregir o auditar intervencion frontend |
| Readiness local | Pendiente | GO explicito y repo local confirmado |
| Source lock | Bloqueado | P0 cerrado y auditoria aprobada |
| Produccion | Bloqueada | Source lock, readiness, rollback y decision Paula |
| Import real | Bloqueado | Produccion/control y autorizacion posterior |
| Providers reales | Bloqueado | Configuracion, gates y autorizacion |
| Academia P0 | Pendiente | Revisar impacto tras cambio frontend |
| Multi-proyecto | Pendiente backend real | Mantener proyecto configurable |

## Regla

Ninguna decision bloqueada puede saltarse por tener documentacion avanzada.
