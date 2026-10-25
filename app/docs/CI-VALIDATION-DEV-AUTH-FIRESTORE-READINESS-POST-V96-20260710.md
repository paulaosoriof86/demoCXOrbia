# Validación CI — DEV Auth/Firestore readiness post-V96

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Workflow safe-only creado

Archivo:

- `.github/workflows/cxorbia-dev-auth-firestore-readiness-post-v96.yml`

El workflow no recibe secretos, no llama Firebase, no configura Auth, no lee/escribe Firestore, no despliega reglas, no importa datos y no toca producción.

Ejecuta:

1. JSON syntax.
2. `tya-auth-rbac-contract-validate.mjs`.
3. `tya-role-taxonomy-org-scope-validate.mjs`.
4. `tya-auth-dev-claims-taxonomy-seed-validate.mjs`.
5. `tya-dev-auth-firestore-activation-readiness-post-v96-validate.mjs`.
6. Artifact local de reportes.

## Resultado sobre head validado

Head: `3ed196813af0ffb2edb47e8539be658bd0303a9e`

Workflow: `CXOrbia DEV Auth Firestore Readiness Post-V96`, run 2.

Resultado: `success`.

Todos los pasos quedaron en success:

- JSON syntax;
- RBAC contract;
- role taxonomy;
- claims taxonomy seed;
- accumulated post-V96 readiness;
- artifact upload.

## Veredictos de artifact

- RBAC: `GO_SAFE_AUTH_RBAC_CONTRACT_NOT_CONNECTED`.
- Taxonomía: `GO_SAFE_ROLE_TAXONOMY_NOT_CONNECTED`.
- Claims: `GO_SAFE_AUTH_CLAIMS_TAXONOMY_SEED_NOT_CONNECTED`.
- Readiness acumulado: `READINESS_PREPARED_NOT_ACTIVATED`.

Resultado acumulado:

- hard fails: 0;
- warnings: 0;
- blockers de activación conservados: 11.

Los blockers conservan apagados Firebase DEV, Auth, usuarios, claims, rules deploy, protected reads, writes, `CX.data`, import, smoke humano final y producción.

## Otros gates del mismo head

- RC Phase A Predeploy Gate: success.
- Phase A RC Smoke Gate: success.
- Phase A Visual Smoke: success.
- RC Phase A Drift Gate: failure.
- DEV Root Deploy: failure porque el paso Drift Gate falló; pasos de secreto, build, Firebase CLI, deploy y verificación URL quedaron skipped.

Por tanto, no hubo deploy.

## Diagnóstico del drift gate

La falla no nació en este bloque:

- head anterior al bloque (`752a7609...`): `NO_GO_DRIFT`, 28 archivos bloqueados;
- head del bloque antes del workflow: `NO_GO_DRIFT`, 30 archivos bloqueados;
- diferencia agregada por este bloque: exactamente dos archivos safe-only:
  - `backend/config/phase-a-dev-auth-firestore-activation-readiness-post-v96.source-safe.json`;
  - `tools/release/tya-dev-auth-firestore-activation-readiness-post-v96-validate.mjs`.

El drift gate todavía compara contra el runtime validado histórico `489b0420...` y acumula cambios posteriores. No se debe resolver allowlisteando ciegamente los 28 archivos heredados ni moviendo el SHA sin comprobar qué runtime representa el source lock post-V96.

## Decisión segura

- Readiness Auth/Firestore queda validado en CI.
- Drift/deploy permanecen NO GO.
- No se autoriza deploy ni conexión real.
- Se agrega un bloque intermedio antes de configurar Firebase DEV: reconciliar el drift gate con el source lock post-V96, separando runtime real de contratos/config source-safe/validators.

## Siguiente bloque exacto

Auditar y actualizar de forma controlada el baseline del drift gate:

1. identificar el último commit runtime que corresponde al prototipo vivo post-V96 o documentar que el ZIP source lock aún no está empalmado al repo;
2. separar paths runtime de source-safe backend;
3. permitir únicamente contracts/configs `.source-safe.json`, rules `.draft` y validators safe-only;
4. mantener bloqueados provider activation, writes, imports y runtime no revalidado;
5. reejecutar drift, predeploy, smoke, visual y readiness;
6. no ejecutar DEV root deploy mientras drift siga en NO GO.

## Estado seguro

Sin merge, deploy, producción, Firebase/Auth/Firestore real, import, pagos, proveedores o datos sensibles.
