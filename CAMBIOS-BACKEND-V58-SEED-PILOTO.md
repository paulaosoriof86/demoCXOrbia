# CXOrbia - Cambios backend V58 seed piloto julio

Fecha: 2026-07-01

## Registro

Se preparo seed piloto ficticio minimo para validar el modelo V58 de HR/proyectos/postulaciones antes de cargar datos reales TyA.

## Archivos creados

- `firebase/seeds/cxorbia-v58-tya-julio-pilot-seed.json`
- `firebase/client-write-tools/validate-cxorbia-v58-pilot-seed.mjs`

## Alcance

El seed incluye estructura ficticia para:

- tenant TyA DEV;
- proyecto piloto julio;
- periodo julio 2026;
- una visita ficticia;
- una postulacion ficticia;
- un shopper ficticio;
- estadisticas ficticias del shopper.

## Restricciones respetadas

- No se cargaron datos reales.
- No se hizo deploy.
- No se toco produccion.
- No se toco Orbit.
- No se versionaron secretos.

## Proximo paso

Sincronizar repo local y ejecutar:

```bash
node firebase/client-write-tools/validate-cxorbia-v58-pilot-seed.mjs
```

Despues, si valida OK, preparar carga DEV/LAB controlada del seed ficticio.
