# Staging deploy execution status - RC Phase A

Fecha: 2026-07-07

## Bloque revisado

Paula autorizo proceder con preview/staging controlado con integraciones apagadas.

Se preparo el workflow:

- `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`

Tambien se corrigio el allowlist del drift gate para permitir cambios release/staging sin tratarlo como runtime de app.

## Estado tecnico confirmado

En el ultimo commit revisado del PR:

- PR #7 sigue abierto.
- PR #7 sigue draft.
- PR #7 sigue mergeable.
- No hay merge final.
- No hay produccion real.

Checks visibles asociados al flujo de PR siguen en verde:

- `CXOrbia Phase A RC Smoke Gate`: success.
- `CXOrbia Phase A Visual Smoke`: success.
- `CXOrbia RC Phase A Predeploy Gate`: success.
- `CXOrbia RC Phase A Drift Gate`: success.

## Estado del deploy staging

No se confirma URL de staging todavia desde esta revision.

El workflow de staging esta configurado para:

- correr por `workflow_dispatch`;
- correr por push cuando se modifica `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`;
- bloquear antes de Firebase si falta `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`;
- desplegar solo Hosting preview channel si el secret existe.

## Secret requerido

- `FIREBASE_SERVICE_ACCOUNT_CXORBIA_BACKEND_DEV`

Si el secret no existe o no esta disponible para Actions, el deploy queda bloqueado de forma segura antes de llamar a Firebase.

## Accion pendiente

Revisar el run de `CXOrbia RC Phase A Staging Deploy` en GitHub Actions.

Resultados posibles:

1. Success: tomar URL de preview channel `rc-phase-a`, ejecutar smoke visual post-staging y documentar.
2. Failure en `Secret availability check`: agregar/autorizar secret y repetir workflow.
3. Failure en gate: corregir causa puntual antes de intentar deploy.
4. Failure en Firebase Hosting: revisar permisos del service account o target hosting.

## Claude

No hay pendiente nuevo importante para Claude.

Solo se notificara a Claude si el preview/staging revela regresion visual real, pantalla critica rota o incoherencia fuerte de Academia.

## Estado seguro

Sin produccion real, sin merge final, sin reglas, sin proveedores reales, sin imports y sin datos sensibles.
