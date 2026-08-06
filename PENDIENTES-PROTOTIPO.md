# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-06  
**Estado vivo:** `C6_LIVE_HR_V4_REQUEST_EMITTED__30M_NO_RUN_JOB_CHECKPOINT_EVIDENCE__CONSUMPTION_UNKNOWN__STOP_RETRY__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-LIVE-HR-V4-REQUEST-30M-NO-RUN-EVIDENCE-20260806.md`;
4. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- universo Shopper 65/65;
- SKIP13: `HOLD=0`, historia preservada;
- Login, Auth/RBAC source-only, Finanzas, Portales y Reservas;
- root fixes de HR viva;
- diagnóstico de v2/v3 cancelados antes de steps y consumo cero probado;
- request v4 emitido una sola vez;
- segundo trigger prohibido y no ejecutado.

## 3. Estado del request v4

```text
sourceCommit=a1f11483153aa2576bb284b9b2f6ed178dbe528d
requestCommit=ac2032ec224e6d56bf087788b949691b6690c437
ventana observada=1820 segundos
runId recuperado=false
jobId recuperado=false
steps recuperados=false
providerReadConsumption=UNKNOWN_NO_RUN_JOB_OR_CHECKPOINT_EVIDENCE
STOP_RETRY=true
```

No se recuperó evidencia para clasificar lectura cero o consumida.

## 4. P0 único actual

Reconciliar cualquier evidencia tardía del request v4 exacto. Mientras no exista evidencia terminal:

- no emitir otro request;
- no reabrir sintaxis, registro, trigger, rama o path;
- no ejecutar Auth ni avanzar a cutover.

## 5. Orden hacia producción

1. Resolver evidencia terminal del request v4.
2. Confirmar HR viva `2026-08`, tabs GT/HN, mutación histórica y `sourceRevision`.
3. Con PASS, ejecutar Auth SKIP13 mediante gate separado.
4. Smoke acumulativo Admin/Operaciones, Shopper y Cliente.
5. Validación humana, source lock, rollback y autorización específica de producción.
6. Único cutover.

## 6. No hacer

- No emitir segundo trigger.
- No inferir ausencia de run desde ausencia de status.
- No hardcodear periodos o conteos.
- No reabrir SKIP13 ni 65/65.
- No pedir nueva candidata, rama o PR.
- No ejecutar Auth, deploy, merge o producción sin gate separado.

## 7. P1/P2

PDF con gráficas, presentación Excel y mejoras no bloqueantes permanecen documentadas, pero no sustituyen el P0 operativo de HR viva.

## 8. Seguridad

```text
request modificado después de emisión=false
segundo trigger=0
provider reads ejecutados por observador=0
HR/Firestore/Auth/Rules/Storage writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
