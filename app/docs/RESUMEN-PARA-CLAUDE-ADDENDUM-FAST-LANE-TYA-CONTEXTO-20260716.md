# RESUMEN PARA CLAUDE — FAST-LANE Y CONTEXTO TYA

Fecha: 2026-07-16

## Decisión de baseline

- V131 + R18D sigue únicamente como rollback físico mientras se termina la promoción atómica.
- V156 es la única candidata frontend vigente.
- No se solicita otra candidata por este incidente.
- Una próxima correctiva debe partir siempre de la baseline activa que resulte de la promoción V156, nunca de V131 ni de una mezcla.

## Corrección backend/conexión ya realizada

Backend corrigió el bridge TyA source-safe para que:

- `projectId = cinepolis` represente el proyecto padre;
- cada mes tenga un `periodId` estable y único `cinepolis::<YYYY-MM>`;
- las visitas y postulaciones pertenezcan al periodo correcto;
- cambiar periodo cambie Histórico, KPI, Finanzas, Hoja de ruta, Visitas, Postulaciones y Liquidaciones;
- `currentProjectId` y `currentPeriodId` no vuelvan a colapsarse.

Claude no debe recrear esta lógica dentro de módulos UI ni llamar la fuente HR directamente. Debe consumir el contrato `CX.data` y respetar el contexto único `{tenantId, projectId, periodId}`.

## Validación obligatoria antes de una nueva candidata

Cada corrección futura debe conservar:

1. Proyecto y periodo como identidades distintas.
2. Selector de proyecto que agrupa periodos.
3. Selector de periodo que cambia los datos visibles.
4. KPI calculados solo con el periodo activo.
5. MAY/JUN/JUL con snapshots operativos distintos.
6. Junio con cero visitas pendientes de realizar y pendientes de pago/liquidación visibles.
7. HR TyA como fuente operacional source-safe, no data demo.
8. 14 periodos, 616 visitas y 44 visitas por periodo.
9. País/moneda derivados del proyecto/visita.
10. Shoppers históricos y certificaciones preservadas.

## Archivos que Claude no debe tocar

- `backend/**`
- `tools/**`
- `.github/workflows/**`
- `app/core/tya-phase-a-source-safe-preview.js`
- `app/core/build-lock.js`
- manifests/source locks
- datos TyA source-safe
- reglas, secrets, importadores o integraciones reales

## Impacto Academia

Actualizar o mantener contenido sobre:

- diferencia Proyecto vs Periodo;
- cómo cambia el contexto al seleccionar periodo;
- lectura histórica y KPI;
- junio como ejecución cerrada y pagos pendientes;
- validación del contexto antes de operar;
- estados source-safe, DEV, producción y revisión humana.

## Estado seguro

Sin deploy, producción, import real, writes, Make/Gemini live ni pagos.