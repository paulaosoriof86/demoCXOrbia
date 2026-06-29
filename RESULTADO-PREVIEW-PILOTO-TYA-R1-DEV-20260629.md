# RESULTADO-PREVIEW-PILOTO-TYA-R1-DEV-20260629

## Resultado

Paula confirmó que el preview local del piloto T&A `r1` quedó funcionando correctamente después de usar acceso local ágil sin cuadro manual de clave.

## Estado validado

- Preview local abrió correctamente.
- Piloto T&A `r1` ya estaba cargado y leído desde Firestore DEV.
- Se mantuvo `Preview backend DEV` como flujo local controlado.
- No se reportó error visible en la última validación.

## Conteos Firestore DEV previos confirmados por lectura

- tenant `tya`: existe.
- clients: 2.
- projects: 2.
- shoppers: 26.
- visits_r1: 36.
- postulations_r1: 0.
- questionnaires_r1: 0.
- notifications: 20.
- visits_by_estado: `disponible` 36.
- visits_by_pais: GT 33, HN 3.
- visits_with_shopper: 36.
- visits_without_shopper: 0.

## Alcance conservado

- No se hizo deploy de Hosting.
- No se hizo merge.
- No se tocó producción.
- No se activó adapter global.
- No se cargó Storage/evidencias.
- No se modificó `/app/modules`.

## Observaciones

- La vista está validada como preview local DEV, no como publicación productiva.
- El estado de todas las visitas transformadas quedó `disponible`; para migración final se debe mejorar el mapeo de estados históricos si se requiere conservar el flujo exacto anterior.
- Firestore DEV contiene seed previo y piloto `r1`; si se necesita una validación final limpia, debe limpiarse DEV o aislarse por tenant/proyecto antes de cargar todo.
