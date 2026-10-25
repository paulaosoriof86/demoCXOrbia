# Predeploy gate success after backend config fix

Fecha: 2026-07-07

## Bloque completado

Se corrigio el bloqueo del predeploy gate causado por una Firebase Web API key literal en `app/core/backend-config.js`.

## Resultado original

El artifact `rc-phase-a-predeploy-report` reporto:

- Veredicto: `NO_GO_PREDEPLOY`
- Failure: `sensitive_or_secret_pattern_found`
- Archivo: `app/core/backend-config.js`
- Patron: `google_api_key_literal`

## Correccion aplicada

Archivo modificado:

- `app/core/backend-config.js`

Cambios:

- `apiKey` quedo en `null`.
- `messagingSenderId`, `appId` y `measurementId` quedaron en `null`.
- `enabled` se mantiene en `false`.
- Se agrego `configSource: 'repo-placeholder'`.
- Se reforzo comentario de seguridad: no guardar API keys, secretos ni credenciales reales en repo.

## Resultado posterior

Despues de la correccion:

- `CXOrbia RC Phase A Predeploy Gate`: success.
- `CXOrbia Phase A RC Smoke Gate`: success.

El `CXOrbia Phase A Visual Smoke` quedo corriendo al momento de este documento porque el cambio fue runtime y debe revalidarse visualmente.

## Drift gate

El `CXOrbia RC Phase A Drift Gate` fallo de forma esperada porque detecto un cambio runtime posterior al SHA previamente validado.

Accion correcta:

- esperar `Visual Smoke` del nuevo runtime;
- si pasa, actualizar el SHA validado del drift gate al commit runtime que removio la API key literal;
- si falla, corregir causa puntual antes de mover cutover.

## Impacto operativo

La app debe seguir funcionando porque backend real continua desactivado.

Este cambio reduce riesgo de exposicion de configuracion real antes de activar backend por gates.

## Impacto Claude

No hay pendiente importante para Claude en este bloque.

Es un ajuste de seguridad backend/release. No requiere rediseño ni correccion UX.

## Estado seguro

Sin deploy, sin produccion real, sin merge final, sin proveedores reales, sin imports y sin datos sensibles.
