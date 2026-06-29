# RESULTADO-CARGA-PILOTO-DEV-20260629

## Resultado

Carga piloto en Firestore DEV validada por lectura posterior.

## Conteos leidos

- tenant existe: true
- clients: 2
- projects: 2
- shoppers: 26
- visits_r1: 36
- postulations_r1: 0
- questionnaires_r1: 0
- notifications: 20
- visits_by_estado: disponible 36
- visits_by_pais: GT 33, HN 3
- visits_with_shopper: 36
- visits_without_shopper: 0

## Alcance conservado

- Solo Firebase DEV.
- Sin Hosting.
- Sin merge.
- Sin produccion.
- Sin adapter global.
- Sin Storage.
- Sin cambios en app/modules.

## Observaciones

La lectura confirma que el piloto ya esta escrito en Firestore DEV. Hay 2 clients y 2 projects porque en DEV ya existia seed previo. Para validar visualmente solo el piloto se debe usar projectId r1 o limpiar DEV antes de una prueba final.
