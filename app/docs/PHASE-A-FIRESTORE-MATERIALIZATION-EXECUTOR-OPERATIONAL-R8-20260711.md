# Phase A — executor Firestore hard-disabled R8

El executor convierte un plan R6 validado en una ruta futura de creación `create-only`, pero permanece apagado por defecto.

## Modos

- `preflight`: valida plan y attestation, 0 writes;
- `execute/emulator`: solo con attestation vigente, `writesAuthorized=true`, host Emulator y cuatro gates de entorno;
- `dev_clean`: bloqueado en v1 hasta autorización separada y evidencia de base nueva/vacía;
- producción: prohibida.

## Protecciones

- plan `dry_run` obligatorio;
- operaciones `create` y precondición `exists=false`;
- paths únicos;
- attestation ligada a `planId` y `planSha256`;
- autorización con expiración;
- lectura previa de todos los paths;
- si un documento existe, se bloquea todo el plan;
- lotes máximo 400;
- reporte sin datos crudos;
- no rollback automático.

## Validación

Cinco controles PASS:

1. preflight válido;
2. ejecución sin gates bloqueada;
3. intento `dev_clean` bloqueado;
4. plan alterado bloqueado;
5. 0 writes en todos los casos.

## Estado

Preflight operativo. Emulator writes, dev-clean, materialización, deploy y producción en HOLD. No usar la Firebase DEV no limpia.
