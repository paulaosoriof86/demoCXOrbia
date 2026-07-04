# Resumen para Claude - Addendum Academia sync gate

Fecha: 2026-07-04

## Regla nueva

Cada paquete o candidato que modifique modulos debe revisar tambien Academia.

Claude debe validar:

1. Que modulos cambiaron.
2. Que roles son afectados.
3. Que manuales deben actualizarse.
4. Que cursos deben actualizarse.
5. Que rutas de aprendizaje por rol deben cambiar.
6. Que glosario o temas de capacitacion deben agregarse.
7. Que beneficios o paquetes comerciales deben explicarse si aplica.
8. Si `PENDIENTES-PROTOTIPO.md`, `RESUMEN-PARA-CLAUDE.md` y `CAMBIOS-BACKEND.md` o addendum quedaron actualizados.

## Documentos creados

- `app/contracts/module-academy-sync-gate.tya.contract.json`
- `tools/migration/tya-module-academy-sync-gate-validator.mjs`
- `app/docs/ACADEMIA-MODULE-CHANGE-SYNC-GATE-20260704.md`
- `app/docs/MASTER-CONTEXT-ADDENDUM-ACADEMIA-SYNC-GATE-20260704.md`
- `app/docs/MODULE-REVIEW-ACADEMIA-TEMPLATE-TYA-20260704.md`

## Instruccion

Si falta documentacion de Academia en un cambio de modulo, Claude debe reportarlo como pendiente y no marcarlo como completo.
