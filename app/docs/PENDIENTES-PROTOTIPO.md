# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 09:54 -06:00  
**Estado:** `M9_ROLLBACK_PASS__PHASE_A_96__NEXT_PRODUCTION_COMPATIBLE_READONLY_SMOKE`

## Estado vivo

M1–M8 permanecen cerrados. M9 sigue abierto en 0/3.

La primera tentativa M9 consumió la única promoción autorizada. El smoke inmediato no fue válido para certificar producción porque el runner usado pertenecía al carril DEV. El rollback autorizado posterior quedó verificado y no hubo segundo intento de promoción.

## Pendiente inmediato

Preparar un smoke productivo read-only independiente del runner DEV y validar la entrada real del sitio sin modificar datos ni desplegar nuevamente.

Solo después de ese cierre técnico podría evaluarse un futuro gate productivo separado. La autorización anterior ya fue consumida y no permite otra promoción.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**96% certificado | 4% restante.**

## Frontend / Academia

Sin cambios frontend. Mantener pendientes heredados separados. Academia puede documentar el patrón de smoke por entorno y rollback verificado.
