# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 09:54 -06:00  
**Estado:** `M9_CUTOVER_SMOKE_FAIL__ROLLBACK_PASS__PHASE_A_96__NO_FRONTEND_CHANGE`

## Estado vigente

C6/M7 y M8 siguen cerrados con PASS. M9 pre-cutover read-only también permanece PASS. La única promoción productiva autorizada se ejecutó, pero su smoke inmediato no certificó M9 y se ejecutó el rollback autorizado a la versión pre-cutover.

**Phase A certificado: 96% / restante: 4%.**

## Hallazgo M9

El smoke reutilizado pertenecía al carril DEV protegido y exigía flags DEV antes del login. En producción falló con `M8_ENTRY_LANE_FLAGS_INVALID`, por lo que no constituye evidencia válida de fallo funcional del frontend. El instrumento de cutover tuvo además un error de sintaxis en su encadenamiento automático de rollback; el rollback autorizado se ejecutó después y dio PASS.

Producción volvió a la versión pre-cutover `a9670bb8a19862cd` y no hubo segunda promoción.

## Frontend / Claude

- No se modificó `/app/modules` ni `/app/core` para resolver este bloque.
- No crear candidata nueva ni parchear UI desde backend.
- Mantener la interfaz pública exacta de `CX.data`.
- Mantener el consentimiento de confidencialidad como acción humana.
- Antes de otro cutover, backend/QA debe demostrar una entrada productiva real sin depender de flags DEV.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**Phase A=96% | restante=4%.**

## Siguiente acción exacta

Construir y ejecutar primero un smoke productivo read-only que siga la entrada real del sitio y diagnostique si el runtime productivo requiere una configuración distinta al carril DEV. Cero nuevo deploy bajo la autorización ya consumida.

## Academia

Registrar el patrón de pre-cutover, smoke independiente del entorno y rollback verificado. No incluir credenciales ni mecanismos internos de QA.
