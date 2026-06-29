# CAMBIOS-BACKEND-ADDENDUM-20260628-MIGRACION-TYA-REAL.md

## Fecha

2026-06-28

## Objetivo

Preparar la ruta segura para migrar T&A a Firestore DEV desde un export limpio, sin subir el export al repo, sin tocar producción, sin publicar Hosting, sin hacer merge y sin modificar `/app/modules`.

## Archivos creados/modificados

### `.gitignore`

- Tipo: modificado.
- Cambio: se agregaron exclusiones para entradas y salidas locales privadas de migración:
  - `firebase/private-input/`
  - `firebase/private-output/`
  - `firebase/client-write-tools/output/`
- Motivo: evitar que el export operativo, transformaciones o reportes locales se suban a GitHub.
- Impacto frontend: ninguno.
- Riesgo: ninguno si Paula guarda el export únicamente en esas rutas locales.

### `firebase/client-write-tools/validate-tya-real-export.mjs`

- Tipo: nuevo.
- Cambio: validador local del export limpio T&A.
- Motivo: revisar estructura, conteos, duplicados, encoding y alertas antes de transformar o escribir Firestore.
- Impacto frontend: ninguno.
- Riesgo: requiere que el archivo local exista en `firebase/private-input/tya-export-real.json` o ruta definida por `CXORBIA_TYA_EXPORT_PATH`.

### `firebase/client-write-tools/transform-tya-real-export.mjs`

- Tipo: nuevo.
- Cambio: transformador local del export limpio al modelo Firestore `/tenants/tya`.
- Motivo: generar archivo transformado local sin escribir Firestore todavía.
- Impacto frontend: ninguno.
- Riesgo: al no conocer todavía la estructura exacta del export real, puede requerir ajustes de mapeo después de la primera validación local.

### `firebase/client-write-tools/load-tya-real-pilot-firestore-dev-sdk.mjs`

- Tipo: nuevo.
- Cambio: cargador de piloto real limitado en Firestore DEV por Firebase Web SDK.
- Motivo: permitir una primera carga controlada de T&A, limitada por proyecto y número máximo de visitas.
- Impacto frontend: ninguno directo; luego se debe validar lectura y preview.
- Riesgo: requiere autorización explícita de Paula antes de escribir en Firestore DEV.

### `PLAN-MIGRACION-TYA-REAL-DEV.md`

- Tipo: nuevo.
- Cambio: plan operativo de validación, transformación y carga piloto DEV de T&A.
- Motivo: dejar documentado el orden seguro antes de cargar datos operativos.
- Impacto frontend: ninguno.
- Riesgo: ninguno.

### `MIGRACION-BASE-BUENA-TYA.md`

- Tipo: modificado.
- Cambio: se actualizó el estado del gate para indicar que ya corresponde preparar/validar el export limpio y avanzar por piloto DEV, no carga total.
- Motivo: ya se completaron reglas, Auth DEV, claims, seed, lectura, adapter headless y preview local controlado.
- Impacto frontend: ninguno.
- Riesgo: la validación visual todavía debe repetirse porque el preview mostró datos ficticios del prototipo.

## Confirmaciones de seguridad

- No se subió ningún export real.
- No se escribió Firestore con base real.
- No se activó adapter global.
- No se publicó Hosting.
- No se hizo merge.
- No se tocó producción.
- No se modificó `/app/modules`.

## Siguiente paso operativo

Paula debe tener el export limpio de T&A en JSON UTF-8 sin BOM. Primero se validará localmente. La carga piloto en Firestore DEV requiere autorización separada y explícita.
