# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO  
**Estado vivo:** `CODEX_EXECUTION_HANDOFF_READY__AWAITING_CODEX_WORKSPACE_WITH_V7_2__NO_AUDIT__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CAMBIOS-BACKEND-ADDENDUM-RECUPERACION-PLAN-CANONICO-V7-2-20260804.md`;
4. `CAMBIOS-BACKEND-ADDENDUM-CODEX-EXECUTION-LANE-V7-2-20260804.md`;
5. `CODEX-EXECUTION-TASK-V7-2-20260804.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-LAB-SOURCE-CONTRACT-PASS-20260804.md`;
7. `AUDITORIA-REAL-CANDIDATA-CLOUD-V7-1-20260804-HOLD.md`;
8. `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
9. contratos/schema/matriz del Laboratorio;
10. `RESUMEN-PARA-CLAUDE.md`;
11. `PENDIENTES-PROTOTIPO.md`;
12. `AGENTS.md`;
13. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint y el lock de empalme directo vigente. Los estados antiguos de C6, Hosting o candidatas previas son evidencia histórica, no el bloqueo actual.

## 2. Estado recuperado

- composición source/static PASS;
- contrato del Laboratorio PASS;
- run `30971991900` y artifact `8916850770`;
- auditoría V7.1 HOLD por P0 responsive;
- V7.2 recibida en preflight;
- cero empalme, deploy o producción.

## 3. Composición canónica

Existe una única composición source-only:

`CXORBIA-TYA-PHASE-A-COMPLETE-CANONICAL-COMPOSITION-20260804`.

Preserva las mejores autoridades por archivo/módulo, pero todavía no es candidata activa porque falta empalme V7.2, gates finales, Hosting DEV, Laboratorio real, cleanup y validación humana.

## 4. V7.2

- SHA-256 `d3b7551b3b0b30e1b071dfc74beb20009c9c523c2955cce760148da6b8727686`;
- 23,243 bytes;
- 4 entradas;
- delta declarado en `app/app.js` y `app/styles/layout.css`;
- correctivo CSS responsive presente;
- capturas contractuales ausentes.

Estado: `PREFLIGHT_ONLY`. No es GO y no está empalmada.

## 5. Carril anterior bloqueado

La conversación comprobó ZIP, Git cliente, repo/rama e identidad administrativa. El checkout nativo no pudo materializarse porque el runtime no tenía salida de red hacia GitHub.

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
GITHUB_ADMIN_ACCESS=true
NATIVE_GITHUB_NETWORK_AVAILABLE=false
REPO_CHECKOUT_COLOCATED_WITH_ZIP=false
AUTHENTICATED_DIRECT_APPLY_FROM_CHECKOUT=false
EXECUTION_LANE_READY=false
```

El artifact `8916850770` confirma PASS y worktree limpio del run anterior, pero contiene reportes y no sustituye un checkout.

## 6. Carril Codex vigente

El repositorio ya quedó preparado para ejecutar la siguiente acción en Codex sin reiniciar metodología:

- `AGENTS.md` reconciliado con el lock prevalente;
- eliminado el permiso contradictorio de blobs/trees vía conectores;
- tarea ejecutable `CODEX-EXECUTION-TASK-V7-2-20260804.md` creada;
- addendum del carril Codex creado;
- checkpoint actualizado.

Secuencia única:

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

La tarea debe leer `AGENTS.md` y ejecutar íntegramente `CODEX-EXECUTION-TASK-V7-2-20260804.md`. No puede crear rama, PR, workflow, deploy o writes.

## 7. Prohibiciones antirretroceso

- no auditoría general nueva;
- no nueva candidata si V7.2 queda GO;
- no shell reducido ni composición por módulos;
- no nueva rama/PR;
- no Contents API archivo por archivo para empalme;
- no blobs/trees o workflow como sustituto del checkout;
- no PowerShell ni copias manuales de código;
- no reconstrucción desde V182;
- no segundo deploy DEV;
- no reabrir bloques protegidos sin regresión reproducible.

## 8. Estado seguro

- tarea Codex iniciada: no;
- auditoría final V7.2: no iniciada;
- V7.2 aplicada: no;
- empalme: 0;
- runtime/datos AUDIT: 0;
- deploy/producción: 0;
- merge: false.
