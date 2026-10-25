# ACADEMIA — Impacto Corte 4 visual P0 proven

Fecha: 2026-07-29

## Aprendizaje reusable

Un smoke técnico de lectura puede pasar y, aun así, el build visual publicado puede caer a una fuente heredada si la ruta de autenticación del runtime difiere de la del smoke.

El caso Corte 4 demuestra que el gate visual debe comprobar simultáneamente:

1. fuente efectiva;
2. estado de autenticación;
3. fallback usado o no usado;
4. conteos efectivos visibles;
5. comportamiento de backend vacío;
6. ausencia de writes.

## Patrón reusable CXOrbia

`AUTH NO DISPONIBLE + BACKEND REAL SELECCIONADO => FAIL-CLOSED VACÍO/BLOQUEADO`, nunca `demo/localStorage` silencioso.

## Separación de responsabilidades

- Provider smoke: demuestra acceso protegido y reglas.
- Hosting proof: demuestra que el build correcto fue desplegado.
- Validación visual: demuestra que el runtime publicado usa realmente la fuente esperada.
- Producción: gate posterior e independiente.

## Impacto por rol/manuales

Sin cambio de rutas, cursos ni manuales todavía. El P0 debe cerrarse antes de documentar Corte 4 como patrón aprobado.