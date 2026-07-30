# RESUMEN-PARA-CLAUDE-ADDENDUM-20260628-PREVIEW-CONTROLADO-ADAPTER-DEV.md

## Contexto

Proyecto: CXOrbia — Backend y migración a producción.

Repo: `paulaosoriof86/demoCXOrbia`.

Rama: `feat/firebase-backend-dev-config-20260627`.

PR #1: draft.

Firebase DEV: `cxorbia-backend-dev`.

Producción: no tocada.

## Gate validado

Preview local controlado del adapter Firebase DEV.

URL local usada:

```text
http://127.0.0.1:5177/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV
```

## Resultado visible confirmado por Paula

- El preview abrió correctamente.
- Se mostró la insignia `Preview backend DEV`.
- Administración / Coordinación cargó sin pantalla en blanco.
- Portal del Cliente cargó sin pantalla en blanco.
- Shopper / Evaluador cargó sin pantalla en blanco.
- Se visualizaron datos ficticios del prototipo.
- Paula confirmó que el funcionamiento visible corresponde al prototipo.
- No se reportaron datos reales ni mezcla con producción.

## Observación clave para Claude

En el preview visual Paula observó los 3 proyectos ficticios del prototipo:

- `Proyecto Retail`.
- `Proyecto Banca`.
- `Proyecto Restaurantes`.

Esto no coincide con el seed Firestore DEV cargado, que tiene 1 cuenta, 1 proyecto, 4 shoppers, 8 visitas, 3 postulaciones y 1 cuestionario.

Interpretación:

- El gate visual confirma que el preview controlado no rompe la UI y no mezcla producción.
- No debe tomarse todavía como validación final de render exclusivo con seed Firestore DEV.
- La validación headless del adapter contra Firestore DEV sí fue correcta antes de este gate.
- Cuando Claude actualice el prototipo/base frontend, debe revisarse el punto único de conexión y repetir la validación visual con datos Firestore DEV.

## Pendientes de frontend/prototipo reportados por Paula

- `Configuración` no funciona correctamente.
- Hay módulos todavía incompletos o pendientes de desarrollo.
- Esas correcciones corresponden a Claude/prototipo, no al PR backend.

## Restricciones conservadas

- No modificar `/app/modules` desde este PR backend.
- No rediseñar ni parchar UI desde ChatGPT.
- No hacer merge.
- No desplegar Hosting.
- No tocar producción.
- No cargar datos reales.
- No activar adapter globalmente.
- Mantener `CX.BACKEND.enabled` principal en `false` hasta autorización expresa.

## Siguiente recomendación

Antes de avanzar a base real T&A o producción:

1. Claude debe actualizar/corregir el prototipo/frontend pendiente.
2. Confirmar si `main` es la nueva base frontend aprobada.
3. Reconciliar PR #1 con esa base sin perder los archivos backend ni el punto único de conexión.
4. Repetir validación visual del adapter DEV con datos Firestore DEV.
5. Solo después pedir/cargar export limpio de la base buena T&A.
