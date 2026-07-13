# Cambios backend — DEV Hosting source-safe R17

Fecha: 2026-07-13

## Resultado operativo

Se desplegó y verificó la build source-safe R15F/R16D en Firebase Hosting DEV:

- URL: `https://cxorbia-backend-dev.web.app`
- proyecto: `cxorbia-backend-dev`
- target: `cxorbia-dev`
- build: `tya-source-safe-r15f-r16d`
- commit desplegado: `bc00636885342a077aabb52ab950b01d17288fc6`
- workflow run: `29279724120`

El deploy fue exclusivamente Hosting. No ejecutó writes Firestore/Auth/Storage, imports, rules, Functions ni producción.

## Gates previos al deploy

- V110 source lock: PASS, 1,426/1,426, 0 faltantes, 0 diferencias y aggregate SHA válido.
- Predeploy: `GO_WITH_WARNINGS_PREDEPLOY_NOT_DEPLOY_AUTHORIZATION`, 0 hard fails.
- Drift: `GO_V110_LOCKED_BACKEND_SOURCE_SAFE_ONLY_AFTER_VALIDATION`, 0 bloqueos.
- Credencial DEV: proyecto y dominio de service account verificados.
- HR source-safe build: PASS.
- Binding `CX.data` R15F: PASS.
- Firebase Hosting access: PASS.
- Deploy `hosting:cxorbia-dev`: PASS.
- Proof remoto del build: PASS.

Evidencia deploy:

- artifact: `authorized-dev-hosting-deploy-once-report`
- digest: `sha256:05dd57b6df6c07764cb961b8b7fa0a67280e480f92a78f381c55595e946e3ce2`

El job aparece globalmente como `failure` únicamente porque fallaron dos pasos auxiliares de comentario en PR. Los pasos de autorización, gates, build, deploy y verificación remota finalizaron `success`.

## Smoke remoto DEV

Se ejecutó Playwright directamente contra la URL desplegada.

Decisión: `PASS_WITH_REVIEW_SOURCE_SAFE_VISUAL_SMOKE`.

- 14 periodos;
- 616 visitas;
- 210 shoppers live source-safe;
- GT: 476;
- HN: 140;
- junio: 44/44 con evidencia de ejecución;
- 13/13 rutas renderizadas;
- Admin: 7/7;
- Cliente: 2/2;
- Shopper: 4/4;
- 0 errores de consola;
- 0 errores de página;
- 0 blockers;
- única advertencia: gap shopper `210/213`.

Evidencia smoke:

- workflow run: `29280074465`
- artifact: `phase-a-dev-remote-smoke-report`
- digest: `sha256:e91048c30ec5ff06a452e398a72639998ce3c25978a393fc0955813c0b973de7`

## Limpieza y seguridad

Los workflows y marcadores temporales de una sola ejecución fueron eliminados después de completar cada bloque. El workflow canónico de deploy quedó manual-only.

## Corrección metodológica

Se evita repetir el patrón de múltiples artifacts y provider reads por commit:

- proveedor solo manual-only;
- un objetivo operativo por bloque;
- una validación final por bloque;
- documentación después del resultado técnico;
- fallos informados por etapa exacta;
- no reabrir V110, R15F, R16D ni smoke remoto ya aprobados.

## Siguiente bloque exacto

`R16E — MANUAL READ-ONLY PROVIDER COMPARISON AFTER FIRESTORE QUOTA AVAILABILITY`.

Debe clasificar `create/update/noop/review` contra el Firestore DEV existente y preparar R17 de autorización, sin materializar ni escribir.

## Clasificación

- **Reusable CXOrbia:** deploy Hosting-only, proof remoto, smoke por rol y separación deploy/data.
- **Exclusivo cliente:** TyA/Cinépolis y conteos 616/210/213.
- **Claude/prototipo:** sin P0 nuevo; conservar estados honestos.
- **Academia:** explicar DEV Hosting vs backend materializado vs producción.
- **Sin impacto Claude:** service account sanity, artifacts, hashes y workflows temporales.
