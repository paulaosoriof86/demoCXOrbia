# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_LIVE_HR_AUTHORITY_SOURCE_ROOT_FIX_APPLIED__PROVIDER_TRIGGER_NOT_OBSERVED__STOP_RETRY__IDENTITY_HOLD_0__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-20260806.md`;
3. `app/docs/evidence/LIVE-HR-AUTHORITY-TRIGGER-NOT-OBSERVED-LATEST.json`;
4. `.github/cxorbia-firebase-requests/live-hr-current-reconcile.json`;
5. `.github/workflows/cxorbia-live-hr-current-reconcile.yml`;
6. `tools/hr-source/tya-live-provider-registry-identity-dev.mjs`;
7. `tools/hr-source/tya-enforce-live-tab-registry.mjs`;
8. `tools/qa/tya-live-hr-authority-contract.mjs`;
9. `tools/qa/tya-hr-country-tab-consistency-current.mjs`;
10. `tools/qa/cxorbia-august-delta-readonly-plan.mjs`;
11. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
12. `app/docs/evidence/CORTE6-SHOPPER-AUTH-SKIP13-SOURCE-ONLY-PASS-LATEST.json`;
13. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker;
15. `AGENTS.md`, PR #7 y HEAD vivo.

Los documentos que describan recuperación de los 13 perfiles como pendiente quedan superados. Los documentos que describan agosto como confirmado también quedan superados: el source root fix está aplicado, pero falta evidencia provider observable.

## 2. Identidades Shopper

```text
profiles=340
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

Los 13 perfiles residuales quedaron fuera de repair Auth, con historia preservada. No bloquean el avance.

## 3. Root fix HR viva aplicado

Se corrigieron las causas source:

- periodo calendario y tabs derivados de metadata provider;
- registry fijo degradado a contingencia, no autoridad;
- reconstrucción desde una sola revisión viva;
- gate de mutación histórica y `sourceRevision` estable;
- país/pestaña sobre la misma revisión;
- planner sin `34/10`, `616`, `684` ni `1406` como constantes.

Commits fuente:

```text
e961fd4322007a5a64eee60f00f2d6fa7b9392f6
4aa7ced4b0728709f4d620aec748056f0234b439
6bc1c0f94a36d717f56c5b2776a5713416eeb66b
fefb41b76f56aef1bab9f3f185711f9392f10fe3
daa7db23d6a8eebb71e0c14105631587dede5b11
05bf22938c346bf1abd489f742ac72a7a47a3122
31f4af0f7501b23b4e72b1a5f8457669a5f91c77
```

## 4. Trigger provider no observado

```text
authorizationId=chat-20260806-live-hr-authority-current-period-01
sourceCommit=31f4af0f7501b23b4e72b1a5f8457669a5f91c77
requestCommit=4e404f2db48ff8b07430d7ac7505eff6c040458a
workflow timeout=20 minutos
nuevo evidence=NO
status publicado=NO
resultado provider=NO DISPONIBLE
provider read consumido=DESCONOCIDO
```

Se aplica `STOP_RETRY`. No se afirma que el read haya ocurrido ni que no haya ocurrido. No se emite segundo trigger sin autorización fresca.

## 5. Regla de datos prevalente

Toda operación e histórico debe derivarse de HR viva y una `sourceRevision` común. Firestore, snapshots y archivos estáticos son materialización, cache o last-known-good; nunca autoridad permanente. Cualquier corrección histórica debe reflejarse en la siguiente revisión viva.

## 6. Estado seguro

```text
provider/Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 7. Siguiente bloque exacto

```text
CONTROL-PLANE READ-ONLY DIAGNOSIS DEL REQUEST 4e404f2d
→ recuperar run/job/log/artifact si existe
→ o probar providerReads=0
→ solo entonces autorizar una única lectura viva corregida
→ confirmar periodo 2026-08 GT/HN, cambio histórico y sourceRevision transversal
→ preparar repair Auth con HOLD=0
```
