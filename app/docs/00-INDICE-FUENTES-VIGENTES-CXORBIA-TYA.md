# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `SOURCE_STATIC_PASS__CLIENT_ROUTE_SOURCE_STATIC_PASS__RUNTIME_RETRY_NOT_AUTHORIZED__CLOUD_V5_HOLD__NO_PRODUCTION`

## 0. Lock prevalente

La única baseline válida continúa sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge.

No crear candidata, shell, rama, PR, Firebase, Hosting o metodología paralela. Producción `tya-plataforma` permanece intacta.

## 1. Leer primero y en este orden

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-C6-CLIENT-ROUTE-SOURCE-STATIC-20260804.md`;
3. `CAMBIOS-BACKEND-ADDENDUM-CLIENT-ACCESS-RUNTIME-20260804.md`;
4. `app/docs/evidence/CORTE6-CLIENT-ACCESS-RUNTIME-FAILURE-LATEST.json`;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `AUDITORIA-FOCAL-CLOUD-LOGIN-PORTABLE-V5-20260804.md`;
7. `PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`;
8. `ACADEMIA-IMPACTO-CLOUD-V5-Y-CLIENT-RUNTIME-20260804.md`;
9. `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
10. `COMPARACION-SHAS-PHASE-A-BLOQUE4-AUTORIDADES-Y-COMPOSICION-20260804.md`;
11. `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`;
12. `RESUMEN-PARA-CLAUDE.md`;
13. `PENDIENTES-PROTOTIPO.md`;
14. reglas maestras/addenda activos;
15. PR #7 y HEAD vivo.

Fuentes superseded solo para trazabilidad:

- `MANIFEST-PHASE-A-COMPLETA-INVENTARIO-VIVO-20260803.json`;
- `MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`;
- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`;
- `PROMPT-CLAUDE-CORRECCION-LOGIN-PORTABLE-V4-20260804.md`.

## 2. Autoridades preservadas

- RC Phase A smoke técnico y visual/consola PASS;
- M1/Corte 1 FROZEN/APROBADO;
- Corte 2A/V174 FROZEN/APROBADO;
- Corte 3/V182 `FROZEN_ACTIVE_BASELINE`;
- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- gate source/static PASS con 53/53 blobs críticos;
- HR dinámica, Staff, Shopper, Finanzas y Reservas preservados.

## 3. Autoridad HR viva

Última ejecución runtime:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

Queda prohibido usar `616` o `2026-07` como invariantes runtime.

## 4. Reejecución final Cliente previa

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Fallo observado:

`client_assertions → CLIENT_PORTAL_INVALID`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

El estado proveedor quedó restaurado.

## 5. Correctivo source-only del gate Cliente — PASS

Causa raíz:

- login Cliente sin navegación explícita;
- dependencia de vista inicial y copy;
- aserción compuesta sin aislar módulo, ruta, render y bloqueo;
- etapa original sobrescrita por `rollback_after_failure`.

Correctivo:

- navegación explícita a `cli_dashboard`;
- espera de `CX.session.view`, navegación activa y marker `#view .ph`;
- evidencia separada `clientModule`, `route`, `panorama`, `blocked`;
- errores específicos por capa;
- `failedStageBeforeRollback` preservado.

Gate:

- commit `5caca10137250d2a70308dd995262e368f981322`;
- run `30936681878`;
- job `92084479259`;
- `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- gate interno `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`;
- blockers 0;
- warnings 0;
- provider reads 0;
- runtime 0;
- writes 0.

## 6. Cloud V5/V6

V5:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

No aplicar V5. La fuente frontend vigente es:

`PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`.

## 7. Overlay superseded controlado

`app/adapters/tya-ab-cumulative-composition-v1.js`

Clasificación:

`P1_SUPERSEDED_LOADED_OVERLAY__NOT_P0_PROVEN`.

No retirar sin gate de no pérdida.

## 8. DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No hubo deploy nuevo.

## 9. Siguiente bloque exacto

El bloque source-only quedó cerrado. Solo con nueva autorización:

```text
SNAPSHOT CLIENTE
→ MEMBERSHIP IDEMPOTENTE
→ READBACK
→ RUNTIME MULTIROL CON GATE DE RUTA CORREGIDO
→ CONSERVAR SOLO CON PASS / ROLLBACK SI FAIL
```

En paralelo:

```text
CLOUD V6 FRONTEND ACUMULATIVA
→ AUDITORÍA FOCAL DELTA
→ APPLY_DELTA_DIRECTLY SOLO CON GO
```

## 10. Estado seguro

- cambios funcionales `app/`: 0;
- provider reads en el bloque source-only: 0;
- Auth/Firestore/membership writes: 0;
- deploy nuevo: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
