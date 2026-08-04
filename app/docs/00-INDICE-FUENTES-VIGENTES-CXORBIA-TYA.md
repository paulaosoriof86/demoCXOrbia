# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-04  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `SOURCE_STATIC_PASS__CLIENT_ROUTE_SOURCE_STATIC_PASS__RUNTIME_RETRY_NOT_AUTHORIZED__CLOUD_V5_HOLD__NO_PRODUCTION`

## 0. Lock prevalente

Única baseline válida:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge.

Producción `tya-plataforma` intacta. No crear candidata, shell, rama, PR, Firebase, Hosting o metodología paralela.

## 1. Fuentes activas — orden obligatorio

1. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `CAMBIOS-BACKEND-ADDENDUM-C6-CLIENT-ROUTE-SOURCE-STATIC-20260804.md`;
3. `CAMBIOS-BACKEND-ADDENDUM-CLIENT-ACCESS-RUNTIME-20260804.md`;
4. `app/docs/evidence/CORTE6-CLIENT-ACCESS-RUNTIME-FAILURE-LATEST.json`;
5. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `AUDITORIA-FOCAL-CLOUD-LOGIN-PORTABLE-V5-20260804.md`;
7. `PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`;
8. `ACADEMIA-IMPACTO-CLOUD-V5-Y-CLIENT-RUNTIME-20260804.md`;
9. `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
10. `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md`;
11. `RESUMEN-PARA-CLAUDE.md`;
12. `PENDIENTES-PROTOTIPO.md`;
13. reglas maestras/addenda activos;
14. PR #7 y HEAD vivo.

## 2. Autoridades preservadas

- RC Phase A smoke PASS;
- M1/Corte 1, Corte 2A/V174 y Corte 3/V182 preservados;
- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- source/static PASS con 53/53 blobs;
- HR dinámica, Staff, Shopper, Finanzas y Reservas preservados.

## 3. HR viva

- 15 periodos;
- 660 visitas;
- 209 shoppers.

No usar `616` ni `2026-07` como invariantes runtime.

## 4. Runtime Cliente previo

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Rollback:

`PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`.

Provider prestate restaurado.

## 5. Gate Cliente source/static — PASS

Causa corregida:

- faltaba navegación explícita a `cli_dashboard`;
- la aserción mezclaba módulo, ruta, render y bloqueo;
- rollback sobrescribía la etapa original.

Correctivo:

- navegación explícita;
- ruta y nav activas;
- marker `#view .ph`;
- `clientModule`, `route`, `panorama`, `blocked` separados;
- errores específicos;
- `failedStageBeforeRollback` preservado.

Ejecución:

- commit `5caca10137250d2a70308dd995262e368f981322`;
- run `30936681878`;
- job `92084479259`;
- `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- interno `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`;
- blockers 0;
- warnings 0;
- provider reads/runtime/writes 0.

## 6. Cloud

V5 sigue HOLD. Fuente vigente:

`PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`.

## 7. DEV

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No hubo deploy nuevo.

## 8. Siguiente bloque exacto

Solo con nueva autorización:

```text
SNAPSHOT CLIENTE
→ MEMBERSHIP IDEMPOTENTE
→ READBACK
→ RUNTIME MULTIROL CON GATE CORREGIDO
→ CONSERVAR SOLO CON PASS / ROLLBACK SI FAIL
```

En paralelo:

```text
CLOUD V6
→ AUDITORÍA FOCAL
→ APPLY_DELTA_DIRECTLY SOLO CON GO
```

## 9. Estado seguro

- cambios funcionales `app/`: 0;
- provider reads: 0;
- Auth/Firestore/membership writes: 0;
- deploy: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
