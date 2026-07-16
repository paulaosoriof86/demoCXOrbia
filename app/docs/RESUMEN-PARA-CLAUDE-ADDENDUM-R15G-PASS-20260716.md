# RESUMEN PARA CLAUDE — R15G PASS

Fecha: 2026-07-16

## Estado que Claude debe preservar

- Un solo proyecto padre: `cinepolis`.
- Periodos mensuales con ID estable `cinepolis-YYYY-MM`.
- `currentProjectId` y `currentPeriodId` son distintos.
- Cambiar periodo actualiza Dashboard, Histórico, Hoja de ruta, Visitas, Postulaciones, Finanzas y Liquidaciones.
- 14 periodos, 616 visitas, 216 shoppers y 44 visitas por periodo.
- Submitido no equivale a liquidado ni pagado.
- Fechas HR se consumen normalizadas a ISO.
- Admin, Cliente y Shopper pasaron smoke sin errores.

## No corresponde a Claude

No recrear ni modificar en módulos UI:

- bridge HR source-safe;
- IDs de proyecto/periodo;
- normalizador de fechas/estados;
- gates R15G;
- manifests/source locks;
- importadores, Firestore, Make, Gemini o pagos.

Claude debe consumir `CX.data` y respetar `{tenantId, projectId, periodId}`.

## Próxima candidata

La próxima entrega debe partir exclusivamente de V156 o de la baseline activa que resulte de su promoción. No usar V131 como fuente de nuevas correcciones visuales.

## Academia

Conservar contenido por rol sobre proyecto vs periodo, KPI histórico, submitido/liquidación/pago y verificación del contexto activo.

## Estado seguro

Sin deploy, producción, imports o writes.