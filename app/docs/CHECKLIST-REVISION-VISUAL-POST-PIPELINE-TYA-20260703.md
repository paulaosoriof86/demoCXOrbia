# Checklist revision visual post-pipeline TyA

Fecha: 2026-07-03

## Objetivo

Definir que revisar visualmente despues de ejecutar el pipeline local seguro TyA.

Este checklist no autoriza importacion, escritura ni deploy. Sirve para validar que el prototipo muestre estados correctos y no confunda preview con operacion real.

## Antes de revisar pantalla

Confirmar que el pipeline termino con:

- Firestore writes: 0.
- Imports executed: 0.
- Deploy: 0.
- canImport=false.
- executeAllowed=false.

Confirmar que existen reportes locales:

- `tmp/hr-source-private-flow-check/`
- `tmp/hr-source-private/multitab-preview/`
- `tmp/tya-dev-import-contract/`
- `tmp/tya-dev-import-contract-validation/`
- `tmp/tya-production-gates-matrix/`

## Pantalla HR Source

Revisar:

- Se muestra el proyecto correcto: Cinépolis.
- La fuente aparece como referencia enmascarada o sourceRef opaco.
- No aparece URL completa de Google Sheets o Excel.
- El boton de probar fuente muestra respuesta backend.
- El preview muestra tabs o periodos detectados cuando backend los devuelva.
- Si backend devuelve warning, la UI muestra warning.
- Si backend devuelve blocked, la UI muestra bloqueado.
- Si backend devuelve pendiente backend, la UI muestra pendiente backend.

No debe ocurrir:

- Guardar URL completa en localStorage o sessionStorage.
- Mostrar importacion como ejecutada.
- Activar sincronizacion real si canImport=false.

## Pantalla de importacion / contrato

Revisar:

- El contrato DEV aparece como informativo o bloqueado.
- Se ve que no hay escritura autorizada.
- Se muestran blockers principales si existen.
- La UI no ofrece accion destructiva.
- La UI no oculta PII/data blockers.

Mensajes esperados:

- Preview disponible.
- Bloqueado por seguridad.
- Importacion no autorizada.
- Pendiente resolver gates.

## Matriz de gates

Revisar que el prototipo separe:

- DEV preview.
- DEV import.
- Staging.
- Produccion.

Revisar que cada fase muestre:

- Gates listos.
- Gates pendientes.
- Gates bloqueados.
- Siguiente accion.
- Responsable si aplica.

No debe ocurrir:

- Saltar de preview a produccion.
- Mostrar produccion como lista.
- Ocultar que hace falta autorizacion de Paula.

## Dashboard / modulos relacionados

Revisar que no haya regresiones en:

- Navegacion principal.
- Proyecto Cinépolis.
- Finanzas/liquidaciones como candidatas, no finales.
- CRM/ficha 360 sin romper tabs.
- Modulo HR Source disponible.
- No aparecen errores JS visibles.

## Seguridad visual

Revisar que no se exponga:

- URL completa de HR.
- Credenciales.
- IDs privados innecesarios.
- Datos crudos sensibles.
- DPI u otros datos PII.

## Resultado esperado

La revision visual es correcta si:

- El sistema muestra preview y gates.
- La importacion sigue bloqueada.
- Los mensajes son claros.
- No hay acciones destructivas disponibles.
- No hay datos sensibles expuestos.
- El usuario entiende que todavia no se importo nada.

## Si algo falla

Registrar en `PENDIENTES-PROTOTIPO.md` si es visual/frontend.
Registrar en `CAMBIOS-BACKEND.md` si corresponde a backend/integracion.
Registrar en `RESUMEN-PARA-CLAUDE.md` si Claude debe corregirlo en el prototipo.
