# CXOrbia - Loader seed piloto V58 DEV

Fecha: 2026-07-01

## Registro

Se preparo un loader controlado para el seed piloto ficticio V58.

## Archivos creados

- `firebase/client-write-tools/load-cxorbia-v58-pilot-seed-dev.mjs`
- `firebase/client-write-tools/validate-cxorbia-v58-pilot-loader-static.mjs`

## Controles

- Por defecto corre en dry-run y no escribe en Firestore.
- Para escribir exige `CXORBIA_SEED_MODE=write`.
- Para escribir exige autorizacion exacta `CXORBIA_LOAD_V58_PILOT_SEED=YES_PAULA_LOAD_V58_PILOT_SEED_DEV`.
- Solo acepta seed `dev-no-real-data`.
- Solo acepta rutas bajo `tenants/tya`.
- No borra documentos.

## Restricciones respetadas

- No se ejecuto carga.
- No se hizo deploy.
- No se toco produccion.
- No se cargaron datos reales.
- No se toco Orbit.

## Proximo paso

Sincronizar local, validar loader y ejecutar dry-run. La escritura real del seed ficticio requiere autorizacion explicita posterior.
