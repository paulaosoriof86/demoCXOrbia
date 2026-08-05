# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO  
**Estado vivo:** `V7_2_RECEIVED_PREFLIGHT__EXECUTION_LANE_NOT_READY_FOR_FINAL_AUDIT_APPLY__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## 1. Fuentes activas y orden de prevalencia

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CAMBIOS-BACKEND-ADDENDUM-RECUPERACION-PLAN-CANONICO-V7-2-20260804.md`;
4. `CAMBIOS-BACKEND-ADDENDUM-LAB-SOURCE-CONTRACT-PASS-20260804.md`;
5. `AUDITORIA-REAL-CANDIDATA-CLOUD-V7-1-20260804-HOLD.md`;
6. `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
7. contratos/schema/matriz del Laboratorio;
8. `RESUMEN-PARA-CLAUDE.md`;
9. `PENDIENTES-PROTOTIPO.md`;
10. PR #7 y HEAD vivo.

Ante conflicto, mandan este índice y el checkpoint vigente. Los estados antiguos de C6, Hosting o candidatas previas son evidencia histórica, no el bloqueo actual.

## 2. Estado recuperado de la conversación anterior

La conversación bloqueada sí dejó avances en repo:

- composición source/static PASS;
- contrato del Laboratorio PASS;
- run `30971991900` y artifact `8916850770`;
- auditoría V7.1 HOLD por P0 responsive e evidencia incompleta;
- handoff frontend V7.2;
- cero empalme, deploy o producción.

## 3. Composición canónica

Existe una única composición source-only:

`CXORBIA-TYA-PHASE-A-COMPLETE-CANONICAL-COMPOSITION-20260804`.

Preserva las mejores autoridades por archivo/módulo, pero todavía no es candidata activa porque falta empalme V7.2, gates finales, Hosting DEV, Laboratorio real, cleanup y validación humana.

## 4. V7.2

Paquete recibido y extraíble:

- SHA-256 `d3b7551b3b0b30e1b071dfc74beb20009c9c523c2955cce760148da6b8727686`;
- 23,243 bytes;
- 4 entradas;
- delta declarado en `app/app.js` y `app/styles/layout.css`;
- correctivo CSS responsive presente;
- capturas contractuales ausentes.

Estado: `PREFLIGHT_ONLY`. No es GO y no está empalmada.

## 5. Carril

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
REPO_AND_BRANCH_VERIFIED=true
GITHUB_ADMIN_ACCESS=true
REPO_CHECKOUT_COLOCATED_WITH_ZIP=false
AUTHENTICATED_DIRECT_APPLY_FROM_CHECKOUT=false
EXECUTION_LANE_READY=false
```

No auditar extensamente ni aplicar hasta que el mismo workspace tenga ZIP extraído, checkout autenticado y rama viva.

## 6. Secuencia única

```text
EXECUTION_LANE_READY
→ AUDITORÍA FINAL FOCALIZADA V7.2
→ GO SIN P0
→ APPLY_DELTA_DIRECTLY
→ MANIFEST / BUILD-LOCK / VERIFICADOR
→ SOURCE/STATIC FINAL + GATE LAB
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
→ ACTIVE_CANONICAL_BASELINE
→ CUTOVER AUTORIZADO
```

## 7. Prohibiciones antirretroceso

- no auditoría general nueva;
- no nueva candidata si V7.2 queda GO;
- no shell reducido ni composición por módulos;
- no nueva rama/PR;
- no Contents API archivo por archivo para empalme;
- no blobs/trees o workflow como transportador;
- no PowerShell ni tareas manuales para Paula;
- no segundo deploy DEV;
- no reabrir bloques protegidos sin regresión reproducible.

## 8. Estado seguro

- V7.2 aplicada: no;
- empalme: 0;
- runtime/datos AUDIT: 0;
- deploy/producción: 0;
- merge: false.
