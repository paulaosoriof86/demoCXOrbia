# RESULTADO-AUTH-IMPORT-CLI-DEV-INTENTO-2-FALLIDO.md

## Fecha

2026-06-28

## Resultado

Intento fallido antes de crear usuarios.

## Causa

El archivo local de importación fue generado correctamente y Firebase CLI quedó disponible, pero `firebase.cmd auth:import` rechazó la configuración de hash porque faltó indicar `--rounds` para `SHA256`.

Salida visible:

```text
Error: Must provide valid rounds(1..8192) for hash algorithm SHA256
```

## Impacto

- No se crearon usuarios.
- No se asignaron claims/customAttributes.
- No se cargó seed.
- No se activó adapter.
- No se tocó producción.
- No se modificaron módulos de la app.

## Corrección

Repetir la importación directa con:

```text
--hash-algo=SHA256 --rounds=1
```

Mantener el alcance únicamente sobre Firebase DEV `cxorbia-backend-dev`.
