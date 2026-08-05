# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `CODEX_EXECUTION_HANDOFF_READY__AWAITING_CODEX_WORKSPACE_WITH_V7_2__NO_AUDIT__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## 1. Carril

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- producción intacta;
- candidata canónica activa: no.

## 2. Composición canónica source-only

Existe el manifiesto:

`CXORBIA-TYA-PHASE-A-COMPLETE-CANONICAL-COMPOSITION-20260804`.

Fija una sola rama/candidata y las mejores autoridades por archivo/módulo. No es todavía `ACTIVE_CANONICAL_BASELINE` porque falta empalme V7.2, visual, Laboratorio real, cleanup y aprobación humana.

## 3. Laboratorio y gates ya PASS

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

- run `30971991900`;
- artifact `8916850770`;
- digest `sha256:75953c600b68450a11cfac6667ac5b5cfa8eceea5c94a6a0856850a501e77dd8`;
- composición: 53/53 base, 4/4 adicionales, 5/5 overrides, 0 faltantes, 0 duplicados, 0 secretos;
- contrato: cinco perfiles, `AUDIT-*`, fingerprints, cleanup exacto y fail-closed.

## 4. V7.1

`HOLD_NO_SEND_TO_EMPALME`.

P0 reproducible: Login responsive recortado por flex/centrado/padding heredados. Evidencia visual incompleta. V7.1 aplicada: no.

## 5. V7.2 recibida

- paquete `Prototype development request V7.2.zip`;
- SHA-256 `d3b7551b3b0b30e1b071dfc74beb20009c9c523c2955cce760148da6b8727686`;
- 23,243 bytes;
- 4 entradas;
- delta declarado: `app/app.js` y `app/styles/layout.css`;
- correctivo CSS responsive presente;
- PNG contractuales: ausentes.

Estado: preflight de recepción, no auditoría final y no GO.

## 6. Intento de carril en la conversación actual

Se intentó materializar el checkout file-aware en el runtime de esta conversación.

Comprobado:

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
GIT_CLIENT_AVAILABLE=true
REPO_AND_BRANCH_VERIFIED_THROUGH_CONNECTOR=true
GITHUB_ADMIN_ACCESS=true
```

El acceso Git nativo falló por ausencia de red del runtime:

```text
git ls-remote https://github.com/paulaosoriof86/demoCXOrbia.git
→ fatal: Could not resolve host: github.com
```

El artifact `8916850770` fue recuperado e inspeccionado. Confirma PASS y worktree limpio del run anterior, pero contiene reportes y no un checkout completo.

Resultado:

```text
NATIVE_GITHUB_NETWORK_AVAILABLE=false
REPO_CHECKOUT_COLOCATED_WITH_ZIP=false
AUTHENTICATED_DIRECT_APPLY_FROM_CHECKOUT=false
EXECUTION_LANE_READY=false
```

Owner del bloqueo anterior: runtime de esta conversación.

## 7. Carril Codex preparado

Para evitar repetir el bloqueo y mantener auditoría+aplicación en la misma sesión:

- `AGENTS.md` fue reconciliado con el lock prevalente;
- se eliminó la autorización contradictoria de blobs/trees por conectores;
- se creó `app/docs/CODEX-EXECUTION-TASK-V7-2-20260804.md`;
- la tarea Codex exige checkout autenticado, ZIP V7.2 extraído, HEAD vivo, worktree limpio y capacidad de commit/push antes de auditar;
- con GO sin P0 obliga a `APPLY_DELTA_DIRECTLY` en la misma tarea;
- no permite rama, PR, workflow, PowerShell, deploy, writes, merge o producción.

Commits de preparación:

- `7a9cfc9ef955c4866476de1f81f791648c245557` — `AGENTS.md`;
- `0173773fb109123ec91be860337e3fc7f84fbaea` — tarea Codex;
- `b82c127db7a8115950cb946be4ae61a03196fbf0` — addendum del carril Codex.

La herramienta Codex no está expuesta como invocación dentro de esta conversación. La tarea ya quedó preparada en el repositorio para ejecutarse desde un workspace Codex conectado al mismo repo y rama.

## 8. Siguiente acción exacta obligatoria

En Codex, seleccionar el repositorio y rama existentes, adjuntar el mismo ZIP V7.2 y ejecutar:

```text
Lee AGENTS.md y ejecuta íntegramente
app/docs/CODEX-EXECUTION-TASK-V7-2-20260804.md.
No crees rama ni PR. Detente antes de cualquier deploy.
```

Secuencia obligatoria:

```text
CODEX WORKSPACE + ZIP V7.2 + CHECKOUT AUTENTICADO
→ EXECUTION_LANE_READY
→ AUDITORÍA FINAL FOCALIZADA V7.2
→ GO SIN P0
→ APPLY_DELTA_DIRECTLY
→ MANIFEST / BUILD-LOCK / VERIFICADOR
→ SOURCE/STATIC FINAL + GATE LAB
→ TECHNICAL_PASS_PENDING_DEV_VISUAL
```

No se abre auditoría general, nueva candidata, shell reducido ni composición paralela.

## 9. Pendientes Phase A reales

1. iniciar tarea Codex con el ZIP V7.2;
2. audit/apply V7.2 en la misma tarea;
3. único deploy DEV del mismo HEAD, en bloque posterior y con autorización;
4. Laboratorio real Admin/Operaciones + Shopper;
5. evidencia sanitizada y cleanup con fingerprints iguales;
6. validación humana de una única URL;
7. freeze canónico;
8. resolver solo deltas actuales de datos sin repetir histórico;
9. producción con rollback y autorización expresa.

Portal Cliente continúa sobre la misma candidata en paralelo; no crea rama o build alterno.

## 10. Estado seguro

- tarea Codex iniciada: no;
- auditoría final V7.2: no iniciada;
- empalme: 0;
- navegador/runtime funcional: 0;
- Hosting/Cloud Run: 0;
- Firestore/Auth/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
