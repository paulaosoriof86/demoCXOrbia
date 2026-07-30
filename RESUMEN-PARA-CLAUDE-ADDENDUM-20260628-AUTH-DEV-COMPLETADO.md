# RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-AUTH-DEV-COMPLETADO.md

## Contexto

Se completó el gate de usuarios DEV ficticios y claims/customAttributes para Firebase DEV `cxorbia-backend-dev`.

## Resultado

PowerShell mostró:

```text
Starting importing 6 account(s).
Imported successfully.
```

## Método final usado

No se usó `gcloud` ni service account. Se usó Firebase CLI Auth Import:

```text
firebase.cmd auth:import <archivo-local-output> --hash-algo=SHA256 --rounds=1 --project cxorbia-backend-dev
```

El archivo fue generado por:

```text
firebase/auth-dev-tools/auth-import-dev-users.cjs
```

## Usuarios DEV importados

- `super.dev@cxorbia-dev.example.com`
- `admin.tya.dev@cxorbia-dev.example.com`
- `ops.tya.dev@cxorbia-dev.example.com`
- `shopper.eval01.dev@cxorbia-dev.example.com`
- `cliente.tya.dev@cxorbia-dev.example.com`
- `externo.otro.dev@cxorbia-dev.example.com`

Los usuarios se importaron con `customAttributes` equivalentes a claims DEV.

## Qué NO se hizo

- No se crearon usuarios reales.
- No se usaron correos reales.
- No se cargó seed.
- No se activó adapter.
- No se publicó Hosting.
- No se tocó producción.
- No se hizo merge.
- No se modificó `/app/modules`.

## Pendiente local

La carpeta local de Paula quedó con archivos `A` y `M` por el uso de `git checkout` y `npm install`. Debe sincronizarse con la rama remota y revisar que `firebase/auth-dev-tools/output/` no se suba. Esa carpeta puede contener password DEV temporal y está ignorada por `.gitignore`.

## Siguiente gate sugerido

Seed ficticio Firestore DEV para validar reglas y adapter con datos piloto. No ejecutar sin autorización separada de Paula.
