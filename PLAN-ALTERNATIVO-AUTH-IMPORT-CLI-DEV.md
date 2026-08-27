# PLAN-ALTERNATIVO-AUTH-IMPORT-CLI-DEV.md

## Motivo

El flujo con Google Cloud SDK / Application Default Credentials se volvió poco práctico para Paula por pasos de autenticación y manejo de credenciales locales.

Se prepara una alternativa sin mover archivos manualmente, sin service account y sin `gcloud`.

## Método alternativo

Usar Firebase CLI autenticado localmente para importar usuarios DEV ficticios con `auth:import` y `customAttributes`.

## Ventajas

- No requiere mover archivos manualmente.
- No requiere descargar service account.
- No requiere `gcloud`.
- Usa `firebase.cmd`, que ya funcionó para publicar reglas DEV.
- Mantiene la ejecución limitada a Firebase DEV `cxorbia-backend-dev`.

## Herramienta creada

```text
firebase/auth-dev-tools/auth-import-dev-users.cjs
```

La herramienta:

- genera usuarios ficticios DEV;
- genera un password DEV temporal local;
- genera hash SHA256 para importación Auth;
- agrega `customAttributes` equivalentes a claims (`role`, `tenantId`, `projectIds`, `shopperId` cuando aplica);
- ejecuta `firebase.cmd auth:import` contra `cxorbia-backend-dev`;
- escribe reporte local dentro de `firebase/auth-dev-tools/output/`.

La carpeta `output/` está excluida del repo.

## Alcance permitido

- Crear usuarios ficticios DEV.
- Asignar customAttributes/claims DEV.
- No crear usuarios reales.
- No cargar seed.
- No activar adapter.
- No publicar Hosting.
- No tocar producción.
- No modificar `/app/modules`.

## Usuarios DEV esperados

- `super.dev@cxorbia-dev.example.com`
- `admin.tya.dev@cxorbia-dev.example.com`
- `ops.tya.dev@cxorbia-dev.example.com`
- `shopper.eval01.dev@cxorbia-dev.example.com`
- `cliente.tya.dev@cxorbia-dev.example.com`
- `externo.otro.dev@cxorbia-dev.example.com`

## Criterio de cierre

El gate se considera completado si PowerShell muestra:

```text
== Auth import DEV finalizado ==
```

Después debe registrarse el resultado en:

- `RESULTADO-USUARIOS-CLAIMS-DEV.md`
- `CAMBIOS-BACKEND.md`
- `ESTADO-GATES-PR1.md`
- `RESUMEN-PARA-CLAUDE.md`
- addendum para Claude

## Bloqueos posteriores

Aunque el import termine correctamente, siguen bloqueados:

- seed ficticio Firestore DEV;
- activación del adapter;
- Hosting deploy;
- producción;
- merge PR #1;
- base buena T&A.
