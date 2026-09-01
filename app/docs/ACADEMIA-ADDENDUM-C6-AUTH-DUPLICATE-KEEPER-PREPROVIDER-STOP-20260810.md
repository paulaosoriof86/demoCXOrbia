# ACADEMIA — ADDENDUM C6 DUPLICATE KEEPER PRE-PROVIDER STOP

**Fecha:** 2026-08-10

Caso reusable de troubleshooting: un gate estático puede producir un falso positivo cuando busca una palabra prohibida por substring y esa misma palabra aparece dentro de un flag que demuestra precisamente que la conducta está desactivada. En este bloque, `creationTimeUsed:false` y `lastSignInTimeUsed:false` fueron confundidos con uso de metadatos temporales.

La práctica correcta es comprobar el acceso técnico real al selector prohibido, no la mera presencia de la palabra. El fail-close ocurrió antes de cualquier lectura provider, por lo que la evidencia de Auth DEV no cambió y no se introdujo riesgo operacional.

**Impacto Academia:** documentar diferencia entre validación semántica y coincidencia textual, y preservar el patrón source gate → provider gate → write gate separado.
