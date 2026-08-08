# REGLA PREVALENTE — VALIDACIÓN VISUAL DESPUÉS DE CADA CORTE

Fecha: 2026-07-20
Estado: ACTIVA, OBLIGATORIA Y NO OMITIBLE

## Regla

Después de cada corte de Phase A, Paula debe realizar una revisión visual del build exacto publicado en DEV antes de permitir el freeze y el inicio del corte siguiente.

Secuencia obligatoria:

```text
FUENTE Y REGLA
-> MAPPING / ADAPTER
-> GATES DE DATOS Y SEMÁNTICA
-> BUILD EXACTO
-> HOSTING DEV / SMOKE REMOTO CUANDO CORRESPONDA
-> REVISIÓN VISUAL DE PAULA
-> CORRECCIÓN FOCALIZADA SOLO SI EXISTE DIFERENCIA REPRODUCIBLE
-> APROBACIÓN EXPLÍCITA
-> FREEZE DEL CORTE
-> SIGUIENTE CORTE
```

## Prohibiciones

- No declarar un corte cerrado solo por PASS técnico.
- No convertir un runtime en `ACTIVE_BASELINE` sin revisión visual y aprobación explícita de Paula.
- No iniciar el corte siguiente antes del freeze del corte anterior.
- No sustituir la revisión visual por screenshots automáticos, gates, smoke remoto o afirmaciones de un agente.
- No pedir una nueva candidata ni reabrir metodología cuando las diferencias sean P1/P2 no bloqueantes; se documentan y se asignan al corte correcto.

## Formato de cierre humano

Paula responderá con una de estas salidas:

- `APROBADO`;
- `APROBADO CON OBSERVACIONES NO BLOQUEANTES`;
- `DIFERENCIA: rol / ruta / acción / esperado / observado`;
- `ERROR: acción / resultado`.

## Aplicación inmediata

- Corte 0B: revisado y aprobado con observaciones no bloqueantes; V161C congelada.
- Corte 1: no podrá cerrar ni dar paso a Corte 2 sin una nueva revisión visual de Paula.
- La misma regla se repite para Cortes 2, 3, 4, 5, 6, 7 y 8.
