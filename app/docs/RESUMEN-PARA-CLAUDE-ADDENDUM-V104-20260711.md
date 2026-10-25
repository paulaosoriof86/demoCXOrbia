# Resumen para Claude — addendum V104

## Baseline

Claude trabaja solo sobre V104 frontend genérica. R5 no se importa: ChatGPT/Codex harán el empalme posterior.

## Estado neto

### Hecho — preservar

- identidad CXOrbia correcta;
- estructura y 49 módulos estables;
- Histórico excluye activo por defecto;
- soft-delete inicial de visitas;
- no fecha de realización como fecha de pago;
- primer guard null-safe de Portal Cliente;
- primer guard de seeds demo;
- eliminación de `countries[0]` en contexto.

### Parcial — completar

- Portal Cliente sigue fabricando datos desde `core/cliente-data.js`;
- aislamiento de fixtures no limpia persistencia ni memoria al cambiar modo;
- `paymentSourceRef` solo sigue siendo insuficiente;
- certificación preview/pending_backend aún puede habilitar operación;
- contexto multipaís sin país no falla cerrado;
- mobile no tiene evidencia real.

### Pendiente acumulado

- manifest y smoke reproducibles;
- Dashboard/Finanzas sin KPIs o cálculos sintéticos;
- restaurar historial visible de visita;
- copy/manuales honestos;
- Academia profunda, administrable y autorizada;
- UI de dry-run/reviewQueue/materialización HOLD;
- rutas por rol y notificaciones alineadas.

## Patrón reusable que Claude debe representar

Frontend compatible con modo único de datos, proyecto/periodo separados, estados de fuente, llaves estables, revisión humana, liquidación/pago separados, certificación por workflow, dry-run antes de materialización, outbox honesto, permisos por entidad, soft-delete y multi-tenant.

## No tocar

Backend, tools, workflows, snapshot/adapters TyA, Firebase, Make/Gemini, imports y datos reales.
