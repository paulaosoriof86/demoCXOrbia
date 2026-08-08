# CI validation — Firebase DEV clean-state read-only gate

Fecha: 2026-07-10  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: #7 draft/open/no merge

## Resultado final

El gate estático terminó en:

`GO_SAFE_FIREBASE_DEV_READ_ONLY_GATE_PREPARED_NOT_EXECUTED`

Resultado:

- hard fails: 0;
- warnings: 0;
- execution authorization: false;
- provider calls: 0;
- credenciales usadas: 0;
- Auth reads/writes: 0;
- Firestore reads/writes: 0;
- Storage reads/writes: 0;
- Functions reads/writes/invocations: 0;
- rules/Hosting deploy: 0;
- imports/producción: 0.

Run:

- `CXOrbia Firebase DEV Clean-State Read-Only Gate` — `29109059264` — success.

Artifact:

- `firebase-dev-clean-state-read-only-static-gate-report`;
- digest `sha256:76bd93467e7be39194997d7a202e66e0ae60e5b9e3cd15ee2832aeba6f31da6d`.

## Qué validó el gate estático

- contrato y configuración source-safe presentes y válidos;
- proyecto DEV esperado;
- runner con confirmación exacta;
- workflow proveedor manual-only;
- ausencia de triggers automáticos en el workflow proveedor;
- ausencia de métodos de escritura/deploy/import;
- secret fuera del workflow estático;
- credencial temporal con cleanup;
- artifact limitado al reporte sanitizado;
- decisiones clean/nonempty/inconclusive/target mismatch;
- estado inicial no autorizado y no ejecutado.

## Workflow proveedor

El workflow:

`.github/workflows/cxorbia-firebase-dev-clean-state-read-only-run.yml`

quedó creado pero no fue ejecutado. Solo puede iniciar mediante `workflow_dispatch` y confirmación exacta:

`VERIFY_FIREBASE_DEV_READ_ONLY`

La existencia y validación del workflow no equivalen a autorización de proveedor.

## Gates de continuidad

Sobre el commit técnico `1ef937999f93b7aa595298e7ef312a5ba3e47a75` terminaron en success:

- Firebase DEV Clean-State Read-Only Gate — `29109059264`;
- Auth Pre-activation Route Action Gate — `29109059292`;
- Source Lock Post-V96 Runtime Verify — `29109059488`;
- DEV Auth Firestore Readiness Post-V96 — `29109059266`;
- RC Phase A Smoke Gate — `29109059363`;
- RC Phase A Predeploy Gate — `29109059277`;
- Phase A Visual Smoke — `29109059258`;
- RC Phase A Drift Gate — `29109059327`.

El runtime source lock no cambió y conserva el SHA validado:

`86e592db3f9f8016080302a852bfd194097b2074`.

## Drift

La allowlist fue ampliada únicamente con los cuatro archivos exactos del gate:

- dos workflows;
- runner read-only;
- validator estático.

No se abrió un prefijo general para workflows o herramientas release. El drift sigue fail-closed.

## Impacto Phase A TyA

La preparación permite comprobar, antes de cualquier activación, que Firebase DEV no contiene residuos de otra app o de la plataforma vieja. Protege la futura conexión de HR, shoppers, certificaciones carryover, liquidaciones de junio, cliente multi-proyecto, reviewQueue y `CX.data`.

No se consultaron datos TyA, HR, shoppers, certificaciones, liquidaciones o evidencias.

## Clasificación

- **Reusable CXOrbia:** gate manual read-only, reporte sanitizado, no-deletion e inconcluso no es limpio.
- **Exclusivo cliente:** ninguno en la validación estática.
- **Claude/prototipo:** estados de readiness y copy honesto permanecen documentados.
- **Academia:** interpretación del gate y separación read/write.
- **Sin impacto Claude:** run IDs, digest y allowlist interna.

## Estado seguro

- sin merge;
- sin provider call;
- sin Auth, usuarios o claims;
- sin Firestore/Storage/Functions reads reales;
- sin writes/deletes;
- sin rules/Hosting deploy;
- sin import;
- sin producción;
- sin datos sensibles.

## Siguiente decisión

La ejecución read-only requiere autorización explícita separada de Paula. Un resultado limpio permitirá preparar el dry-run de identidades opacas; cualquier resultado no vacío o inconcluso detendrá el avance sin borrar ni modificar recursos.
