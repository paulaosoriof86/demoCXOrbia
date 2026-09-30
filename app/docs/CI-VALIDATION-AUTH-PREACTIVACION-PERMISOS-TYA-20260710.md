# CI validation — Auth preactivación por permisos

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Resultado final

El gate nuevo terminó en:

`GO_SAFE_AUTH_PREACTIVATION_COMPLETE_NO_PROVIDER_CALLS`

Resultado:

- hard fails: 0;
- warnings: 0;
- activation blockers documentados: 6;
- llamadas Firebase/Auth: 0;
- usuarios creados: 0;
- claims escritos: 0;
- Firestore reads/writes: 0;
- rules deploy: 0;
- imports: 0;
- deploy/producción: 0.

Run final:

- `CXOrbia Auth Pre-activation Route Action Gate` — `29108361738` — success.

Artifact:

- `auth-preactivation-route-action-report`;
- digest `sha256:abcd157b7d198afe94b044c73d4065fec1e25a45d06c96ef38c6561554152622`.

## Incidencia técnica corregida

La primera ejecución falló por una referencia histórica de nombre de archivo:

- esperado incorrectamente: `.github/workflows/cxorbia-rc-phase-a-dev-root-deploy.yml`;
- workflow real vigente: `.github/workflows/cxorbia-rc-phase-a-staging-deploy.yml`;
- el contenido del workflow real se llama `CXOrbia RC Phase A DEV Root Deploy` y permanece manual-only.

No fue un fallo de permisos, runtime, Firebase ni seguridad. Se corrigió únicamente el validador para leer el archivo vigente. No se duplicó ni reactivó el workflow de deploy.

## Drift

El drift gate se amplió solo con allowlist explícita para:

- `.github/workflows/cxorbia-auth-preactivation-route-action.yml`;
- `tools/release/tya-auth-preactivation-route-action-validate.mjs`.

No se habilitó un prefijo amplio de workflows o release tools. La política continúa fail-closed.

Run:

- `CXOrbia RC Phase A Drift Gate` — `29108361927` — success.

## Gates de continuidad

Sobre el head técnico del bloque también terminaron en success:

- Source Lock Post-V96 Runtime Verify — `29108361739`;
- DEV Auth Firestore Readiness Post-V96 — `29108361834`;
- RC Phase A Smoke Gate — `29108361800`;
- RC Phase A Predeploy Gate — `29108361722`;
- Phase A Visual Smoke — `29108361716`;
- RC Phase A Drift Gate — `29108361927`.

El runtime post-V96 no cambió y conserva su SHA validado:

`86e592db3f9f8016080302a852bfd194097b2074`.

## Activation blockers conservados

1. `RBAC_PROJECT_ADMIN_TOO_BROAD`.
2. `FRANCHISE_OWNER_TENANTADMIN_REQUIRES_PERSONA_BUNDLE_RESTRICTION`.
3. `CLIENT_ROLES_MISSING_FROM_CLAIMS_SEED_V1`.
4. `CUSTOM_ROLE_EXPLICIT_MAPPING_REQUIRED`.
5. `ACTION_LEVEL_BACKEND_ENFORCEMENT_NOT_CONNECTED`.
6. `FIREBASE_DEV_CLEAN_STATE_NOT_EXTERNALLY_VERIFIED`.

Estos blockers no invalidan la preparación estática; impiden la activación prematura.

## Clasificación

- **Reusable CXOrbia:** gate estático y drift allowlist explícita.
- **Exclusivo cliente:** ninguno en la ejecución CI; los scopes TyA siguen fuera del repo.
- **Claude/prototipo:** blockers de UX/permisos permanecen documentados.
- **Academia:** resultado y lectura de blockers deben incorporarse a manuales administrativos.
- **Sin impacto Claude:** nombres de workflow, run IDs, digest y corrección de ruta interna.

## Estado seguro

Sin merge, deploy nuevo, producción, Auth, usuarios, claims, Firestore, rules deploy, import, HR writeback, Make, Gemini, Storage ni pagos reales.
