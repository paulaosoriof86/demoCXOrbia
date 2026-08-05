# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO  
**Estado vivo:** `V7_2_P0_PROVEN__V7_2_P0F1_PREPARED__PENDING_FOCUSED_REAUDIT__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `AUDITORIA-FOCALIZADA-V7-2-P0-CREDENCIALES-20260804.md`;
3. `CAMBIOS-BACKEND-ADDENDUM-V7-2-P0-CREDENCIALES-P0F1-20260804.md`;
4. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`;
6. `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
7. `CODEX-EXECUTION-TASK-V7-2-20260804.md`;
8. `RESUMEN-PARA-CLAUDE-ADDENDUM-V7-2-P0F1-20260804.md`;
9. `PENDIENTES-PROTOTIPO-ADDENDUM-V7-2-P0F1-20260804.md`;
10. `ACADEMIA-IMPACTO-V7-2-P0-CREDENCIALES-20260804.md`;
11. contratos/schema/matriz del Laboratorio;
12. `AGENTS.md`;
13. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice, el checkpoint y el lock de empalme directo. Los estados anteriores de “Codex handoff ready”, C6, Hosting o candidatas previas son evidencia histórica.

## 2. Estado verificado

- `EXECUTION_LANE_READY`: confirmado por Codex;
- auditoría focalizada V7.2: ejecutada;
- decisión: `P0_PROVEN`;
- HEAD auditado: `da42e818c626e8bba56407869f5f3b32b61f49eb`;
- V7.2 aplicada: no;
- worktree final: limpio;
- deploy/producción: 0.

## 3. P0 V7.2

V7.2 reintrodujo exposición visible de contraseñas en `app/app.js` mediante:

- `${CX.CREDS.passExample()}`;
- `${CX.CREDS.pass(f,l)}`;
- `${s.pass}`.

El HEAD vivo preserva la credencial inicial como protegida y no muestra valores.

## 4. Correctivo vigente

Revisión corregida de la misma V7.2:

- `Prototype development request V7.2-P0F1.zip`;
- SHA-256 `09606d1cc133a1e1e138be76bd8c6aadeb1f70d7967d506aae3f81bf5e9c6fce`;
- alcance `app/app.js`, `app/styles/layout.css`;
- CSS responsive preservado;
- tres exposiciones eliminadas;
- `node --check`: PASS;
- UTF-8 sin BOM: PASS.

P0F1 todavía requiere auditoría focalizada; no es GO ni está empalmada.

## 5. Secuencia única

```text
MISMO WORKSPACE CODEX
→ ACTUALIZAR RAMA VIVA
→ EXECUTION_LANE_READY
→ AUDITORÍA FOCALIZADA V7.2-P0F1
→ GO SIN P0
→ APPLY_DELTA_DIRECTLY
→ COMMIT/PUSH ATÓMICO
→ MANIFEST/BUILD-LOCK/VERIFICADOR
→ SOURCE/STATIC + COMPOSICIÓN CANÓNICA + CONTRATO LAB
→ DETENER ANTES DE DEPLOY
```

## 6. Prohibiciones antirretroceso

- no auditoría general;
- no V7.3;
- no nueva rama/PR;
- no shell reducido ni composición paralela;
- no Contents API, blobs/trees o workflows como transporte de empalme;
- no PowerShell ni trabajo manual de Paula;
- no segundo método;
- no deploy en este bloque;
- no reabrir módulos protegidos sin regresión reproducible.

## 7. Estado seguro

- P0F1 aplicada: no;
- empalme: 0;
- runtime/datos AUDIT: 0;
- Hosting/Cloud Run: 0;
- Firestore/Auth/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
