# CAMBIOS-BACKEND.md

## 2026-07-30 — Corte 5 post-materialización: provider/identidad PASS + P0 CX.data period model

Estado: `CORTE3_FROZEN__R17N_FINAL_DEV_MATERIALIZED_1406__PROVIDER_COMPARE_IDENTITY_PASS__P0_C5_CXDATA_PERIOD_MODEL__RUNTIME_FIX_AUTH_PENDING__NO_PRODUCTION`.

### Archivos creados/tocados en este bloque
- `tools/qa/tya-r17n-post-materialization-readonly-smoke.mjs`: wrapper del gate hardened.
- `tools/qa/tya-r17n-post-materialization-readonly-smoke-v2.mjs`: post-compare proveedor + identidad + smoke exacto CX.data, read-only.
- `.github/workflows/cxorbia-r17n-post-materialization-readonly.yml`: ejecución controlada read-only, sin contents write/provider write.
- `.github/cxorbia-firebase-requests/r17n-post-materialization-readonly.json`: request consumido/frozen después del diagnóstico.
- `app/docs/evidence/R17N-POST-MATERIALIZATION-READONLY-SMOKE-LATEST.json`: evidencia sanitizada del P0.
- índice/checkpoint/Phase A/CAMBIOS/Claude/PENDIENTES/Academia/tracker/PR actualizados.

### Resultado de proveedor
Run `30514060348`, artifact `8748181730`:
- 1,406/1,406 rutas R17N presentes;
- 0 missing;
- 0 authorization drift;
- 0 `production=true`;
- tenant sin update R17N;
- project parent `cinepolis` presente;
- 14 periodos canónicos;
- 616 visitas;
- 572 controles de liquidación;
- 77 certificaciones;
- payments/lots 0/0.

### Resultado identidad
- 208/208 referencias HR exactas;
- 194/194 perfiles canónicos únicos esperados según mapping;
- 616/616 visitas con nombre real y shopper existente;
- 194/194 perfiles referenciados con nombre real;
- 77/77 certificaciones con shopper existente;
- placeholders demo 0.

El primer intento del harness esperaba erróneamente 208 perfiles canónicos únicos. La evidencia R17N demuestra que 208 referencias HR pueden converger determinísticamente a 194 targets canónicos; se corrigió el gate para comparar el set exacto del mapping, no asumir unicidad 1:1. Ese intento fue read-only y tuvo cero writes.

### P0 reproducible
`P0_PROVEN_C5_CXDATA_PERIOD_MODEL_MISMATCH`.

`app/core/backend-firebase.js` aún implementa el modelo pre-canónico:
- lee todos los docs de `tenants/tya/projects`;
- deriva `CX.data.periods` con `buildPeriods(allProjects, activeProjects)`;
- no lee la subcolección `tenants/tya/projects/cinepolis/periods`.

Smoke exacto del adapter con snapshot Firestore real en memoria:
- `source=firestore`;
- `fallbackUsed=false`;
- interfaz `CX.data` preservada;
- readOnly/writeMode disabled preservados;
- parent project `cinepolis` cargado;
- visits 616;
- **periods 30**, esperado 14;
- **currentPeriodId=cinepolis**, esperado uno de los 14 IDs canónicos.

No se aplicó runtime fix porque el lock exige autorización expresa de Paula ante P0 demostrado.

### Clasificación
- **Reusable CXOrbia:** provider post-compare, target-set identity semantics, adapter canonical parent/period contract, fail-closed.
- **Exclusivo cliente:** TyA/Cinépolis, 14 periodos/616 visitas/208 refs/194 targets.
- **Claude/prototipo:** sin nueva candidata; no tocar módulos UI por este P0.
- **Academia:** proyecto padre vs periodo; referencia HR vs perfil canónico; readback vs runtime consumption.
- **Sin impacto Claude:** workflow/request/artifact/hashes.

### Estado seguro
R17N previo: 1,406 writes ya autorizados/materializados. Este bloque: provider reads únicamente; Firestore/Auth/Storage/HR/legacy writes=0; deletes/pagos/deploy/merge/producción=0; PII cruda en repo/artifact=0.

### Siguiente bloque exacto
`AUTORIZACIÓN P0-C5-CXDATA-PERIOD-MODEL → PATCH BACKEND ADAPTER FOCALIZADO → RE-SMOKE READ-ONLY → VALIDACIÓN OPERATIVA → FREEZE CORTE 5`.

---

## 2026-07-30 — R17N FINAL materialización DEV exacta PASS
- 1,406 Firestore writes autorizados y ejecutados.
- Readback 1,406/1,406; mismatch 0.
- Foundation16 + legacy profiles120 + HR profiles5 + certs77 + visits616 + liquidation controls572.
- HR identity 208/208; existing canonical 201/201 con nombre real visible.
- Tenant/update22/holds/agosto/deletes/pagos/Auth/Storage/HR/deploy/merge/producción excluidos.
- Evidencia: `app/docs/evidence/R17N-FINAL-DEV-MATERIALIZATION-LATEST.json`.

## Histórico protegido
Los addenda previos permanecen como trazabilidad. Los estados de 210 refs/9 pendientes y R17N NO EXECUTE son históricos y no deben reactivarse.
