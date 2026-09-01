# RESUMEN PARA CLAUDE — C6 autoridad HR viva

**Fecha:** 2026-08-06  
**Estado:** `SOURCE_ROOT_FIX_APPLIED__LIVE_PROVIDER_RESULT_NOT_OBSERVED__STOP_RETRY`

## Backend conectado/preparado

- El periodo activo ya no se define con un mes fijo.
- Metadata de Google Sheets es la autoridad para descubrir tabs mensuales.
- El registry solo puede actuar como último estado válido cuando metadata no está disponible; no sustituye a HR viva.
- Todos los periodos se reconstruyen desde la misma revisión source-safe.
- Un cambio histórico debe alterar `sourceRevision`.
- Un cambio únicamente de timestamp no debe alterar la revisión.
- País/pestaña y planner del periodo actual usan la misma revisión.
- Se eliminaron conteos contractuales fijos de HR del planner.

## Ajustes frontend por preservar

No se modificó `/app/modules/*` ni se solicita nueva candidata. Claude debe preservar:

1. `sourceRevision` como identificador único de la lectura transversal.
2. Dashboard, Histórico, Visitas, Finanzas, Cliente y Shopper deben mostrar datos de la misma revisión.
3. No fijar julio, agosto, 616, 684, 34/10 ni cualquier otro conteo HR.
4. Archivos source-safe estáticos son bootstrap/cache, nunca autoridad.
5. Un refresh con misma revisión no debe provocar rerender agresivo.
6. Un cambio real actual o histórico debe invalidar proyecciones derivadas.

## Estado del provider

El request `4e404f2db48ff8b07430d7ac7505eff6c040458a` no generó evidencia, status ni nuevo head observable dentro del timeout. No declarar que agosto está confirmado ni que el read no ocurrió. Se aplica `STOP_RETRY`.

## Sin impacto Claude

- Disposición SKIP13 continúa cerrada con `HOLD=0`.
- Auth, Finanzas, Portales, Reservas, Academia y composición visual permanecen preservados.
- No hay deploy ni cambio visible de plataforma en este bloque.
