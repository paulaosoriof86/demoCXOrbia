# CXOrbia admin tools

## Objetivo

Herramientas locales de validación para preparar usuarios DEV, claims y seed ficticio sin escribir en Firebase.

## Comandos

```powershell
cd firebase\admin-tools
npm run validate:seed
npm run plan:claims
```

O ejecutar todo:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-admin-dry-checks.ps1
```

## Qué hace

```text
valida estructura del seed ficticio
valida referencias básicas shopper/visit/postulation
imprime rutas Firestore previstas
valida plan de claims DEV con correos placeholder .invalid
```

## Qué no hace

```text
no escribe Firestore
no crea usuarios
no asigna claims
no usa credenciales
no activa adapter
no toca producción
```

## Gates posteriores

```text
publicar reglas DEV
crear usuarios DEV ficticios
asignar claims DEV
cargar seed ficticio DEV
activar adapter DEV controlado
```

Cada gate requiere autorización separada.
