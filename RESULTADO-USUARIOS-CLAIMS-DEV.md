# RESULTADO-USUARIOS-CLAIMS-DEV.md

## Fecha

2026-06-28

## Gate autorizado

```text
Autorizo crear usuarios DEV ficticios y asignar claims en Firebase DEV, sin usuarios reales, sin datos reales, sin activar adapter y sin tocar producción.
```

## Resultado final

Gate completado mediante alternativa Firebase CLI Auth Import.

PowerShell mostró:

```text
Starting importing 6 account(s).
Imported successfully.
```

## Proyecto afectado

```text
cxorbia-backend-dev
```

## Método usado

Se usó importación directa con Firebase CLI:

```text
firebase.cmd auth:import <archivo-local-output> --hash-algo=SHA256 --rounds=1 --project cxorbia-backend-dev
```

El archivo de importación fue generado localmente por:

```text
firebase/auth-dev-tools/auth-import-dev-users.cjs
```

## Usuarios DEV ficticios importados

- `super.dev@cxorbia-dev.example.com`
- `admin.tya.dev@cxorbia-dev.example.com`
- `ops.tya.dev@cxorbia-dev.example.com`
- `shopper.eval01.dev@cxorbia-dev.example.com`
- `cliente.tya.dev@cxorbia-dev.example.com`
- `externo.otro.dev@cxorbia-dev.example.com`

Cada usuario fue importado con `customAttributes` equivalentes a los claims DEV planificados: `role`, `tenantId`, `projectIds` y, para shopper, `shopperId`.

## Confirmaciones

- No se crearon usuarios reales.
- No se usaron correos reales.
- No se cargó seed Firestore.
- No se activó adapter.
- No se publicó Hosting.
- No se tocó producción.
- No se hizo merge.
- No se modificó `/app/modules`.

## Archivos locales sensibles

La herramienta generó archivos locales dentro de:

```text
firebase/auth-dev-tools/output/
```

Esa carpeta está excluida del repo. Puede contener password DEV temporal y no debe subirse, pegarse ni adjuntarse.

## Estado posterior

Siguiente gate posible, no autorizado todavía: seed ficticio en Firestore DEV para validar reglas y adapter con datos piloto.
