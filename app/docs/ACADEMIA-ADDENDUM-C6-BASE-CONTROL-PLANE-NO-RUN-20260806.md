# ACADEMIA — Addendum C6 base control-plane no-run

**Fecha:** 2026-08-06

## Patrón reusable

Este bloque documenta cinco fronteras diferentes que no deben confundirse:

1. autorización humana;
2. emisión source-control del request;
3. creación del workflow run;
4. cruce de la frontera provider;
5. evidencia terminal y clasificación.

La existencia de un workflow y un request no demuestra que un run haya comenzado. La ausencia de status o artifact tampoco demuestra por sí sola que hubo cero provider reads; el resultado honesto es `consumption unknown` hasta contar con evidencia terminal.

## Aplicación CXOrbia

- request único source-locked;
- conjunto exacto de 13 fingerprints;
- cero HR reads autorizadas;
- cero writes autorizados;
- limpieza en orden seguro: workflow primero, request después;
- STOP_RETRY sin segundo intento.

## Impacto en manuales y cursos

Agregar al material de gates y automatizaciones:

- diferencia entre trigger emitido y run creado;
- claim observable antes de provider;
- fail-close ante ausencia de run;
- prohibición de inferir PASS, consumo cero o causa raíz sin logs.

No hay cambios de rutas por rol, interfaz, notificaciones operativas ni contenido funcional de Academia.
