# Cambios backend — corrección visible TyA R17

Fecha: 2026-07-13

## Hallazgo

El deploy Hosting DEV anterior era técnicamente válido, pero la revisión humana detectó que la interfaz no mostraba la información TyA como correspondía.

La validación previa comprobaba payload, conteos internos y rutas, pero no el contenido visible. También existía un conflicto de orden: el bridge TyA se cargaba antes de `core/data-source.js`, que después restauraba el modo demo. Los 14 periodos compartían además el mismo ID `cinepolis`.

## Cambios implementados

- Actualizado `tools/release/tya-source-safe-binding-build-r15f.mjs`.
- Generación build-only de `app/adapters/tya-phase-a-source-safe-dev-adapter.js`.
- Adapter insertado después de `core/data-source.js`.
- 14 IDs únicos de periodo `cinepolis-YYYY-MM`.
- 616 visitas vinculadas al periodo correcto.
- `CX.dataSource` queda `source_safe_preview / ready`.
- Eliminación visible de proyectos demo genéricos.
- Actualizado `tools/qa/tya-phase-a-visible-data-smoke-r17.mjs` para validar contenido visible y 13 rutas críticas por Admin, Cliente y Shopper.
- El gate distingue proyecto raíz `cinepolis` de periodo activo `cinepolis-YYYY-MM`.
- Actualizado el smoke remoto canónico para verificar proof exacto antes de validar la URL.

## Intentos y fail-closed

### Intento 1

Run `29284644200`.

- Bloqueado en drift gate antes de construir, preparar credenciales o llamar Firebase.
- Causa: los archivos temporales de autorización R17 no estaban aún en la allowlist exacta.
- Resultado seguro: sin provider call y sin deploy.

### Intento 2

Run `29284794416`.

- Source lock, predeploy, drift, build y binding pasaron.
- El smoke visible autoritativo pasó.
- El smoke heredado bloqueó porque confundía el periodo activo `cinepolis-2026-07` con el proyecto raíz `cinepolis`.
- Credencial, Hosting access y deploy fueron omitidos.
- Resultado seguro: sin provider call y sin deploy.

La corrección no relajó el gate: el nuevo smoke R17 valida explícitamente proyecto raíz, periodo activo, contenido visible y 13 rutas.

## Redeploy Hosting DEV

Run `29285177647`: SUCCESS.

- autorización exacta: PASS;
- V110 source lock: PASS;
- predeploy: PASS;
- drift: PASS;
- HR source-safe: 14 periodos / 616 visitas / 210 shoppers;
- binding visible R17: PASS;
- smoke local visible + 13 rutas: PASS;
- credencial DEV sanitizada: PASS;
- Firebase Hosting access: PASS;
- `hosting:cxorbia-dev`: DEPLOY SUCCESS;
- proof remoto exacto: PASS;
- smoke remoto visible + 13 rutas: PASS;
- cleanup de credencial temporal: PASS.

Commit desplegado:

`cf4c845722e2bbe2b401b2b332ff9f4d2f6cb803`

Build:

`tya-visible-r17-source-safe`

Artifact digest:

`sha256:756049ce4eb22e279b21f93a74e98e88541a262eb2937cb3141868a006acf9d4`

## Verificación remota independiente

Run `29285540738`: SUCCESS.

- esperó y validó el proof exacto del commit desplegado;
- login TyA / GT / HN;
- sin `Demo comercial`;
- Cinépolis como proyecto raíz;
- 14 periodos con IDs únicos;
- JUL 2026 activo;
- 616 visitas históricas y 44 del periodo activo;
- 210 shoppers;
- 0 proyectos demo genéricos;
- 13/13 rutas críticas;
- 0 blockers, warnings, errores de consola o página;
- `imported:false` y `production:false`.

Artifact digest:

`sha256:8b849b2248c2d277a2b8434035d4e2679818a89f7a630b0615fdd8fe1277b1f7`

## Hallazgos visibles no bloqueantes

- `Admin Demo` continúa como identidad temporal mientras Auth real permanezca HOLD.
- `Mi Día` puede mostrar el calendario visual en junio de 2026 aunque el periodo activo sea JUL 2026. Queda como pendiente Claude/prototipo; no cambia el contrato de datos ni los 44 registros activos.
- El gap 210/213 shoppers sigue en revisión backend sin match visual.

## Metodología corregida

No se declarará visual PASS por payload o rutas aisladas. Toda revisión visual deberá incluir URL, build, perfil, ruta, resultado esperado, límites del ambiente y formato de reporte.

## Clasificación

- **Reusable CXOrbia:** adapter build-only posterior al selector de fuente; separación proyecto raíz/periodo; smoke visible por rol.
- **Exclusivo cliente:** TyA/Cinépolis y sus conteos.
- **Claude/prototipo:** revisar calendario Mi Día vs periodo seleccionado; no hay P0 nuevo de arquitectura.
- **Academia:** validación visible por ambiente, fuente, proyecto y periodo.
- **Sin impacto Claude:** CI, Hosting, proof, hashes, credenciales temporales y cleanup.

## Estado seguro

Sin cambios directos en `/app/modules` o `/app/core`; sin Firestore/Auth/Storage writes, import, rules, Functions, Make, Gemini, pagos o producción.
