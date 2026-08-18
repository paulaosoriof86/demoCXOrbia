# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 11:51 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01`  
**Estado:** `I3_11C_HOLD_PROVIDER_LINK_NOT_APPLICABLE__RULES_PASS_CONSUMED__STAFF_STABLE__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

Canonical state: `app/docs/CXORBIA-EXECUTION-STATE.json`.  
Source lock: `app/docs/SOURCE-LOCK-CXORBIA-TYA.md`.  
Plan: `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`.

Último HEAD técnico/evidencia previo a este sync: `528d5f0ba51e9712fee79ca0025b3dbcdf74e163`.

## Avance

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `0/25 formal` hasta cierre integral; I3.1→I3.8 PASS; I3.9/I3.10 congelados PASS.
- I4 `0/25`.
- I5 `0/15`.
- **GO-LIVE formal: 35% completado / 65% pendiente.**
- I3 integral PASS → **60%**.

## Qué sí quedó cerrado

Rules I3.11C ya no está pendiente. Run `32163552089`: `PASS_DIRECT_FIRESTORE_RULES_DEPLOY_VERIFIED`, ruleset verificado y gate consumido.

El Staff runtime posterior alcanza estado estable suficiente para discriminar el bloqueo actual:
- role `admin`;
- namespace `staff`;
- tenant `tya`;
- membership verificada;
- 15 períodos;
- 660 visitas;
- authority aplicada;
- router/view/project selector/period selector montados;
- legal provider authority activa y receipt aceptado;
- duplicados de visit keys `0`;
- duplicados shopper IDs `0`.

Por tanto, no se crea otro Admin y no se vuelve a desplegar Rules por la causa ya cerrada.

## Bloqueo vivo exacto

Evidencia: `app/docs/evidence/I3-11C-STAFF-READONLY-CLOSE-LATEST.json`.

Código: `I3_11C_EXPECTED_PROVIDER_LINK_NOT_IN_APPLICABLE_RUNTIME_SET`.

- live shopper: `shp-57d2e3769946`;
- canonical esperado: `TYA_GT_0C0BA8856E`;
- prior authoritative link: `irl_3ed1b9a65d36c5873c1306bae1621e9d`;
- provider identity links aplicables globales: `1`;
- target links: `0`;
- canonical actual target: `null`;
- agosto canonical: `0`;
- agosto residual live: `2`.

La evidencia previa prueba que el target link existió, fue provider-ACK/readback y period-independent. La evidencia actual no permite decidir todavía si fue eliminado, desactivado, re-scopeado, mutado o si continúa intacto pero quedó fuera del criterio de aplicabilidad.

## Frozen / no reproceso

Historical Shopper run `31906391682`; TARGET_B Admin; request08; I3.5B; I3.5C-2; I3.8; I3.9/I3.10; Rules I3.11C; HR 15/660; Finance V2/historical; legal V0.4 durable.

Prohibido tratar el HOLD creando otro Admin/Shopper, reseteando/releyendo credenciales históricas, reimportando HR, reconstruyendo Finance, repitiendo I3.9/I3.10 o volviendo a desplegar Rules.

## Siguiente bloque exacto

`NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES`

Objetivo único: comparar focalmente el prior target link con el único link provider aplicable actual y emitir una clasificación reproducible.

Límites: read provider focal bajo nueva autorización; todo write/deploy/merge/production `0`; Historical Shopper access `0`; no retry automático.

## Si la adjudicación demuestra drift corregible

No se abre diagnóstico general. Se solicita un gate único y exacto para corregir solo el estado canónico demostrado, seguido de readback inmediato y cierre integral I3.

PASS mínimo:
- `shp-57d2e3769946 → TYA_GT_0C0BA8856E`;
- agosto canonical `2`;
- agosto residual live `0`;
- invariantes I3 preservadas;
- I3.9/I3.10 reutilizados, no rerun.

## Lo que sigue después de I3

I4 debe producir avance visible, no infraestructura abstracta:
1. documentos/instrucciones/certificación + disponibles/postulación/asignación;
2. agenda/reprogramación/cancelación + ejecución/cuestionario/submit/review;
3. finanzas/liquidaciones/pagos + multi-proyecto/configuración;
4. roles/scopes/evidencias/Storage/HR bidireccional/integraciones, con Academia/manuales/rutas/notificaciones sincronizados.

I5: freeze sin P0 → build lock → preproducción → rollback → E2E same-build → autorización producción → cutover/smoke → baseline productivo.

## Durabilidad / anti-loop

Este checkpoint solo puede cambiar junto con el mismo `SYNC_EPOCH` en execution state, índice, source lock, plan/current docs y PR. Un gate ejecutado sin ese cierre atómico queda `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`. Una contradicción entre evidencia y fuentes canónicas detiene toda ejecución técnica con `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.

## Producto a largo plazo

TyA es primer tenant; Cinépolis primer proyecto normal configurable. La evolución queda obligada a contratos multi-tenant/no-code y adapters de fuentes, no a hardcodes. Alta objetivo de proyecto: `configurar source → mapear → dry-run → validar → activar`, con fuentes como Sheets/Excel/CSV/API/plataforma/import/link externo.
