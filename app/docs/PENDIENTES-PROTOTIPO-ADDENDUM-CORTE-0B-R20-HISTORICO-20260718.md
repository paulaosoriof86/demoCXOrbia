# PENDIENTES PROTOTIPO — CORTE 0B R20 HISTÓRICO

Fecha: 2026-07-18  
Estado: pendientes frontend localizados; no solicitar nueva candidata hasta cerrar gates R20.

## P0 — Consumidores de estado

Los módulos no deben volver a filtrar directamente por `v.estado` cuando exista contrato canónico.

Revisar después de los gates:

- Dashboard KPI;
- flujo por fases;
- tablas de control;
- Visitas;
- Visitas Disponibles;
- Mis Visitas;
- Beneficios;
- Liquidaciones;
- Dashboard Financiero;
- comparativo histórico.

Criterio: mismo periodo y misma fuente producen exactamente los mismos conteos en KPI, fase, listado y finanzas.

## P0 — Proyecto y periodo por rol

- Proyecto y periodo son selectores separados.
- Shopper y Cliente no muestran `Cinépolis Julio 2026` como proyecto fijo.
- Selector de proyecto lista solo proyectos activos y permitidos.
- Selector de periodo lista periodos del proyecto.
- Histórico de Shopper se limita a sus propias visitas.
- Cliente se limita a proyectos/sucursales autorizados.

## P0 — Login configurable

- El login se genera desde `tenant.login.visibleRoles`.
- TyA muestra inicialmente Admin, Operativo y Shopper.
- Portal Cliente, Coordinador y Aliado quedan ocultos salvo configuración.
- Autorregistro Shopper depende del tenant.
- Banderas muestran países del tenant o proyectos activos.
- No exponer accesos de prueba en tenant real.
- La visibilidad no reemplaza Auth/RBAC.

## P0 — Visitas disponibles

- Una visita sin shopper y elegible debe aparecer disponible.
- Una visita con shopper no aparece disponible.
- Shopper ve únicamente países/proyectos/periodos elegibles para su scope.
- Conflictos de asignación no se publican hasta revisión.

## P1 — Comparativo histórico

- Usar periodos reales de `CX.data.recentPeriodKpis()` o contrato equivalente.
- No usar fecha actual del navegador para nombrar meses de otro periodo.
- No fabricar históricos por porcentajes.
- `—` cuando la métrica no tenga fuente.

## P1 — Quincena / periodo de medición

Agregar a tablas operativas y detalle:

- quincena;
- periodo de medición configurable;
- país;
- periodo mensual;
- fuente/referencia cuando el rol tenga permiso.

## P1 — Cliente y Academia

- Cliente ve Academia solo si portal/rol/contenido están habilitados.
- Contenido creado para Cliente debe ser accesible desde su menú o ruta.
- Capacitación no debe quedar como módulo vacío o sin propósito.

## P1 — Manual vs Curso

- `Manual` es documento/instructivo versionado, consultable e imprimible.
- `Curso` tiene lecciones, progreso y evaluación.
- No presentar un manual como curso breve.
- Manual Shopper debe cubrir certificación, disponibilidad, postulación, agenda, ejecución, evidencias, cuestionario, submitido, beneficios, pagos, conflictos y soporte.

## Regla de activación

Estos pendientes no justifican V160 ni un paquete general. Primero se ejecutan builder/gates R20. Solo se entrega a Claude el subconjunto que continúe fallando con evidencia reproducible y archivo/módulo localizado.

## Estado seguro

Sin cambios UI ejecutados por este documento, sin deploy, producción, providers, writes ni datos sensibles.
