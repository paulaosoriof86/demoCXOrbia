# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__LAB_SOURCE_CONTRACT_PASS__CLOUD_V7_1_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- baseline acumulativa única;
- producción intacta.

## 1. Fuentes activas

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-LAB-SOURCE-CONTRACT-PASS-20260804.md`;
3. `AUDITORIA-REAL-CANDIDATA-CLOUD-V7-1-20260804-HOLD.md`;
4. contratos y schema del Laboratorio;
5. matriz Admin/Operaciones + Shopper;
6. plan Phase A;
7. resumen para Cloud;
8. pendientes;
9. PR #7 y HEAD vivo.

## 2. Laboratorio

PASS remoto source-only:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

- run `30971991900`;
- artifact `8916850770`;
- digest `sha256:75953c600b68450a11cfac6667ac5b5cfa8eceea5c94a6a0856850a501e77dd8`.

## 3. Cloud V7.1

`HOLD_NO_SEND_TO_EMPALME`.

P0: flex/centrado/padding heredados de `#login` recortan tablet/móvil. Evidencia incompleta.

## 4. Secuencia

```text
CLOUD V7.2
→ AUDITORÍA FINAL
→ GO SIN P0
→ CODEX SOLO EMPALME
→ SOURCE/STATIC FINAL + GATE LAB
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
```

## 5. Estado seguro

- empalme: 0;
- navegador/runtime: 0;
- datos `AUDIT-*`: 0;
- deploy/producción: 0.
