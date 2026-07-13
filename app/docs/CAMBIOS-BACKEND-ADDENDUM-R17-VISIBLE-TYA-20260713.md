# Cambios backend — corrección visible TyA R17

Fecha: 2026-07-13

## Hallazgo

El deploy Hosting DEV anterior era técnicamente válido, pero la revisión humana detectó que la interfaz no mostraba la información TyA como correspondía.

La validación previa comprobaba payload, conteos internos y rutas, pero no el contenido visible. También existía un conflicto de orden: el bridge TyA se cargaba antes de `core/data-source.js`, que después restauraba el modo demo. Los 14 periodos compartían además el mismo ID `cinepolis`.

## Cambios

- Actualizado `tools/release/tya-source-safe-binding-build-r15f.mjs`.
- Generación build-only de `app/adapters/tya-phase-a-source-safe-dev-adapter.js`.
- Adapter insertado después de `core/data-source.js`.
- 14 IDs únicos de periodo `cinepolis-YYYY-MM`.
- 616 visitas vinculadas al periodo correcto.
- `CX.dataSource` queda `source_safe_preview / ready`.
- Eliminación visible de proyectos demo genéricos.
- Agregado `tools/qa/tya-phase-a-visible-data-smoke-r17.mjs`.
- El gate visual ahora revisa textos, marca, proyecto, periodos, conteos y ausencia de datos demo.

## Validación

Run `29283637827`: SUCCESS.

- visible TyA data smoke: PASS;
- legacy route inventory: PASS;
- 14 periodos y 14 IDs únicos;
- 616 visitas totales;
- 44 visitas en JUL 2026;
- 210 shoppers;
- proyecto visible Cinépolis;
- login visible TyA / GT / HN;
- 0 proyectos demo genéricos;
- 0 writes, imports, deploy o producción.

Artifact digest:

`sha256:cfcdaa7cbbc2a66d9f52d3d3071459634192c6ccfc92a3e28bcf20ab7b07d1a1`

## Estado de la URL

La URL pública DEV aún sirve la build anterior. La corrección está validada en CI y requiere un nuevo deploy Hosting-only antes de pedir otra revisión a Paula.

## Metodología corregida

No se declarará visual PASS por payload o rutas. Toda revisión visual deberá incluir URL, perfil, ruta, resultado esperado, límites del ambiente y formato de reporte.

## Clasificación

- **Reusable CXOrbia:** adapter build-only posterior al selector de fuente y smoke de contenido visible.
- **Exclusivo cliente:** TyA/Cinépolis y sus conteos.
- **Claude/prototipo:** sin cambio en módulos/core y sin P0 de diseño.
- **Academia:** validación visible por ambiente y fuente.
- **Sin impacto Claude:** CI, Hosting, hashes y adapter generado.

## Estado seguro

Sin cambios directos en `/app/modules` o `/app/core`, sin Firestore/Auth/Storage writes, import, rules, Functions, Make, Gemini, pagos o producción.
