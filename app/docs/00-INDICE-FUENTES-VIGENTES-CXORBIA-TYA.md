# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `V6_DERIVED_FILES_PROVISIONALLY_MATERIALIZED__EMPALME_NOT_COMPLETED__LAB_SOURCE_CONTRACT_PASS__CLOUD_V7_1_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 0. Lock vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- baseline acumulativa única;
- producción `tya-plataforma` intacta.

No existe empalme V6 aprobado/completado. Codex solo puede empalmar un delta exacto después de GO sin P0.

## 1. Fuentes activas — orden obligatorio

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-LAB-SOURCE-CONTRACT-PASS-20260804.md`;
3. `AUDITORIA-REAL-CANDIDATA-CLOUD-V7-1-20260804-HOLD.md`;
4. `CAMBIOS-BACKEND-ADDENDUM-V7-1-AUDIT-HOLD-20260804.md`;
5. `backend/contracts/tya-dev-scenario-lab-runner-v1.json`;
6. `backend/contracts/tya-dev-scenario-lab-evidence-schema-v1.json`;
7. `MATRIZ-EJECUCION-LABORATORIO-ADMIN-SHOPPER-20260804.md`;
8. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
9. `RESUMEN-PARA-CLAUDE.md`;
10. `PENDIENTES-PROTOTIPO.md`;
11. contratos y addenda activos;
12. PR #7 y HEAD vivo.

## 2. Laboratorio — source contract PASS

Ejecución controlada:

- request `phase-a-composition-plus-lab-source-contract-20260804-01`;
- target `646a05a0f54cf33236b2e1e30122d8c52f30d2a1`;
- request commit `6d5abeb4cea8541f12a3851601dbaae681f50ab7`;
- run `30971991900`;
- artifact `8916850770`;
- artifact digest `sha256:75953c600b68450a11cfac6667ac5b5cfa8eceea5c94a6a0856850a501e77dd8`.

Decisiones:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

Comprobado:

- composición base 53/53;
- adicionales 4/4;
- overrides 5/5;
- assets faltantes 0;
- scripts duplicados 0;
- secretos 0;
- cinco perfiles del Laboratorio;
- estados Auth→cleanup;
- política `AUDIT-*` fail-closed;
- fingerprints;
- cleanup exacto;
- schema de evidencia;
- cero falsos PASS.

Advertencias no bloqueantes:

- overlay A+B superseded;
- PDF puede omitir gráficas;
- Excel básico;
- cuatro rutas del Laboratorio tienen source path esperado desactualizado, aunque su registro global sí está comprobado.

La solicitud quedó consumida y deshabilitada.

## 3. Auditoría Cloud V7.1

- paquete `Prototype development request V 7.1.zip`;
- SHA-256 `649b9d50ae8f80cf4e0b4fcb303e60b35e8fda1b7de1215ae716b7be6f4355ca`;
- decisión `HOLD_NO_SEND_TO_EMPALME`.

P0:

- `#login` conserva flex/centrado/padding heredados bajo 900 px;
- clipping lateral y contenido fuera del scroll real en 390/412 px;
- evidencia de viewports incompleta e inválida.

## 4. Carril

```text
V7_1_GO = false
SEND_TO_EMPALME = false
EXECUTION_LANE_READY_FOR_APPLY = false
```

## 5. Siguiente secuencia

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

## 6. Estado seguro

- V7.1 aplicada: no;
- empalme: 0;
- navegador/runtime: 0;
- datos `AUDIT-*`: 0;
- Hosting/Cloud Run: 0;
- provider writes: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.
