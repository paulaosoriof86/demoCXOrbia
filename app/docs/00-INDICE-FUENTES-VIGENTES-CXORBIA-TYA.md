# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_SKIP13_AUTH_DISPOSITION_SOURCE_ONLY_PASS__IDENTITY_HOLD_0__LIVE_HR_AUGUST_P0_REMAINS__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-SKIP13-AUTH-DISPOSITION-20260806.md`;
3. `app/docs/evidence/CORTE6-SHOPPER-AUTH-SKIP13-SOURCE-ONLY-PASS-LATEST.json`;
4. `backend/config/corte6-shopper-auth-skip13-disposition-v1.json`;
5. `tools/qa/cxorbia-c6-shopper-auth-skip-disposition-source-only.mjs`;
6. `app/docs/SOURCE-LOCK-C6-HOLD-PROFILES-LIVE-HR-AUGUST-20260806.md` — antecedente de los HOLD y P0 HR;
7. `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-LATEST.json` — fuente del plan original;
8. `app/docs/evidence/LIVE-HR-TAB-REGISTRY-ENFORCEMENT-LATEST.json`;
9. `app/docs/evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.json`;
10. `backend/runtime/hr-live-service/server.mjs`;
11. `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs`;
12. `tools/hr-source/tya-enforce-live-tab-registry.mjs`;
13. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
14. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker de este bloque;
15. `AGENTS.md`, PR #7 y HEAD vivo.

Los estados previos que describan los 13 perfiles como decisión pendiente o bloqueo Auth quedan superados.

## 2. Disposición de los 13 perfiles

Paula autorizó omitir los 13 perfiles HOLD del repair Auth. La transformación source-only validó coincidencia exacta del conjunto y produjo:

```text
rows=340 unique
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
identityHoldsRemaining=0
```

Política:

```text
SKIP_AUTH_REPAIR_PRESERVE_HISTORY
doNotCreateAuth=true
doNotUpdateAuth=true
preserveHistory/visits/certifications/liquidations=true
futureManualReactivationAllowed=true
```

No hubo hard delete ni cambios proveedor.

## 3. Trazabilidad

```text
providerRun=31104541809
artifact=8968941587
planDigestBefore=acc93da842d1a5d3244327680f88539f0651cb101bae09dd231fd8b5008bea92
planDigestAfter=6060f406a33d4ba926c982871513f8e86ba2b10f44c2da00ab43bd2a409f721b
sourceOnlyDecision=PASS_C6_SKIP13_AUTH_DISPOSITION_SOURCE_ONLY
```

## 4. Autoridad HR viva y agosto

La evidencia vigente demuestra:

```text
builder bruto=30 tabs / 15 periodos / 684 visitas
registry aceptado=28 tabs / 14 periodos / 616 visitas
AGOSTO 26 y AGOSTO 26 HN=rechazadas
provider metadata=403
autoDiscovery=false
```

Agosto ya existe según Paula y fue detectado por el builder, pero un registry desactualizado lo rechazó. Este es el bloqueo principal vigente.

## 5. Regla de datos

Toda operación e histórico debe derivarse de la HR viva y una `sourceRevision` común. Snapshots, archivos estáticos y materializaciones Firestore son únicamente bootstrap, cache o last-known-good; nunca autoridad permanente.

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
LIVE HR PROVIDER METADATA/AUTODISCOVERY ROOT FIX
→ confirmar AGOSTO 26 + AGOSTO 26 HN desde HR viva
→ reconstruir todos los periodos e histórico
→ validar cambio histórico y sourceRevision transversal
→ preparar repair Auth con identity HOLD=0
→ autorización separada para writes/deploy/cutover
```
