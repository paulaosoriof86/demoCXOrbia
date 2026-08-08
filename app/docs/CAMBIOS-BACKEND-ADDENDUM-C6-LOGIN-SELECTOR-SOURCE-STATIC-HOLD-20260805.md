# CAMBIOS BACKEND — Addendum C6 Login selector source/static HOLD

Fecha: 2026-08-05

## Bloque ejecutado

Macrobloque P0 autorizado de corrección del Login.

## Archivos source modificados

1. `app/core/backend-browser-auth.js`
   - Cambio: `loginRoot.querySelector('.login-card')` por `loginRoot.querySelector('.lg2-card, .login-card')`.
   - Commit: `d5cd7741dafd032138bd4f61d2f0500e9c68e64a`.

2. `app/adapters/tya-c6-unified-human-runtime-v1.js`
   - Cambio: `loginRoot.querySelector('.login-card')` por `loginRoot.querySelector('.lg2-card, .login-card')`.
   - Commit: `9e59fcb81290c80e43233e5202356983a340bf4b`.

No se modificaron `app/app.js`, CSS, credenciales, Auth, memberships, HR ni módulos de negocio.

## Gate ejecutado

- Request: `c6-login-container-selector-root-fix-source-static-20260805-01`.
- Run: `31023829902`.
- Artifact: `8937732266`.
- Digest: `sha256:59442b8fa74ec77ab61c655a3380134ddbd91feec7c99c17bbe09128ef1df0f8`.

Resultados:

- `PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT`;
- `HOLD_READONLY_POST_GATES`;
- `FAIL_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE`.

## Causa del HOLD

El manifiesto acumulativo todavía fija los blobs anteriores de los mismos dos archivos corregidos. Los únicos mismatches son:

- `app/core/backend-browser-auth.js`;
- `app/adapters/tya-c6-unified-human-runtime-v1.js`.

No es un nuevo defecto del Login ni una regresión de módulos. Es una inconsistencia de source lock provocada por no reconciliar los dos blob pins después del cambio autorizado.

## Seguridad

- Segundo Hosting DEV: `0`;
- Cloud Run: `0`;
- Firestore/Auth/Rules/Storage/HR writes del bloque: `0`;
- Make/Gemini/pagos: `0`;
- merge: `false`;
- producción: `false`.

## Clasificación

- Reusable CXOrbia: selector acumulativo compatible con markup nuevo y legacy; gate exacto por blobs.
- Exclusivo cliente: ninguno.
- Claude/prototipo: no requiere rediseño; preservar `.lg2-card`.
- Academia: sin cambio funcional de contenido; acceso sigue pendiente de validación remota.
- Sin impacto Claude: reconciliación de manifiesto/build-lock.

## Siguiente bloque exacto

Reconciliar únicamente los dos blob pins activos, ejecutar un nuevo source/static y, solo con PASS, continuar con el segundo Hosting DEV correctivo y gates remotos acumulativos.
