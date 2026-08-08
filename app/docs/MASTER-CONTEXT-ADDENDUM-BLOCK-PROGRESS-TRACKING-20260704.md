# Master context addendum - Block progress tracking CXOrbia TyA

Fecha: 2026-07-04

## Objetivo

Agregar una regla operativa permanente: despues de cada bloque backend debe quedar visible hasta donde avanzo el plan, que queda pendiente, que se agrego como bloque intermedio y cual es el siguiente paso seguro.

## Regla nueva

Al cerrar cada bloque, ChatGPT/Codex debe reportar:

1. Bloque completado.
2. Archivos creados o modificados.
3. Estado seguro: sin runtime, sin deploy, sin produccion, sin escritura real, si aplica.
4. Que parte del plan Phase A avanza.
5. Pendientes backend derivados.
6. Pendientes prototipo/Claude derivados.
7. Impacto Academia/manuales/cursos.
8. Bloques intermedios agregados por hallazgos de Paula o auditoria.
9. Siguiente bloque recomendado del arbol.
10. Preguntas o insumos necesarios, solo si realmente bloquean el avance.

## Tracker vivo requerido

Debe existir un documento tipo tracker que liste:

- bloques completados;
- bloques en progreso;
- bloques pendientes;
- bloques agregados durante la revision;
- gates apagados;
- riesgos abiertos;
- siguiente bloque exacto.

## Ubicacion documental sugerida

- `app/docs/PHASE-A-BLOCK-PROGRESS-TRACKER-TYA-20260704.md`
- addenda de `CAMBIOS-BACKEND` por bloque;
- addenda de `RESUMEN-PARA-CLAUDE` por bloque;
- addenda de `PENDIENTES-PROTOTIPO` por bloque;
- documentos de impacto Academia por bloque.

## Criterio

Si se identifica un tema no contemplado inicialmente, no se ignora ni se mezcla silenciosamente: se documenta como bloque intermedio agregado, se vincula a Phase A/Phase B segun impacto y se actualiza Academia.

## Estado

Regla documental agregada. No cambia frontend ni runtime.
