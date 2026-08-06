# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-06  
**Estado:** ACTIVO Y RECONCILIADO  
**Estado vivo:** `C6_13_HOLD_PROFILES_FINGERPRINTED__NAMES_PENDING_PRIVATE_RECOVERY__LIVE_HR_AUGUST_AUTHORITY_P0__STOP_RETRY__NO_WRITES__NO_DEPLOY__NO_PRODUCTION`

## 1. Orden de prevalencia

1. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. `app/docs/SOURCE-LOCK-C6-HOLD-PROFILES-LIVE-HR-AUGUST-20260806.md`;
3. `app/docs/evidence/CORTE6-SHOPPER-EQUIVALENT-UNIVERSE-PROVIDER-V22-HOLD-LATEST.json`;
4. `app/docs/SOURCE-LOCK-C6-EQUIVALENT-UNIVERSE-PROVIDER-READONLY-V22-20260806.md`;
5. `app/docs/evidence/LIVE-HR-TAB-REGISTRY-ENFORCEMENT-LATEST.json`;
6. `app/docs/evidence/LIVE-HR-CURRENT-RECONCILIATION-LATEST.json`;
7. `backend/runtime/hr-live-service/server.mjs`;
8. `tools/hr-source/tya-build-live-hr-source-safe-r20.mjs`;
9. `tools/hr-source/tya-enforce-live-tab-registry.mjs`;
10. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
11. addenda vigentes de CAMBIOS, Claude, Pendientes, Academia y tracker de este bloque;
12. `AGENTS.md`, PR #7 y HEAD vivo.

Los estados previos que describan V7.2 como pendiente principal, provider v2.2 como no ejecutado o agosto como inexistente quedan superados.

## 2. Revalidación provider v2.2 cerrada

```text
run=31104541809
job=92626188022
artifact=8968941587
profiles=340
referenceGroups=65
plannerGroups=65
exactMatch=true
HOLD=13
providerReads=1
providerWrites=0
secondAttempt=0
```

El antiguo `+1/-0` quedó cerrado como comparación entre universos diferentes.

## 3. Perfiles HOLD

- 12 perfiles: `AUTHORITATIVE_SURNAME_SOURCE_ENRICHMENT_REQUIRED`.
- 1 perfil: `SOURCE_SAFE_ACCOUNT_ADJUDICATION_REQUIRED` por empate multi-Auth.
- Los 13 fingerprints exactos están en el source lock vigente.
- Los nombres todavía no están confirmados: el probe privado terminó `error` durante el empaquetado de salida y quedó congelado sin rerun.

La disposición permitida por decisión de Paula es `ARCHIVE_LEGACY_NO_AUTH`, conservando historia, visitas, certificaciones y liquidaciones.

## 4. Autoridad HR viva y agosto

La evidencia vigente demuestra:

```text
builder bruto=30 tabs / 15 periodos / 684 visitas
registry aceptado=28 tabs / 14 periodos / 616 visitas
AGOSTO 26 y AGOSTO 26 HN=rechazadas
provider metadata=403
autoDiscovery=false
```

Por tanto, julio no es una verdad vigente de HR; es el último registro aceptado por un registry desactualizado. Agosto ya existe según Paula y debe confirmarse directamente desde metadata/provider vivo.

## 5. Regla de datos

Toda operación e histórico debe derivarse de la HR viva y una `sourceRevision` común. Los snapshots, archivos estáticos y materializaciones Firestore son únicamente bootstrap, cache o last-known-good; nunca autoridad permanente. Una modificación histórica en HR debe reflejarse en la siguiente revisión viva.

## 6. Estado seguro

```text
Auth/password/membership writes=0
Firestore/Rules/Storage/HR writes=0
Hosting/Cloud Run deploys=0
Make/Gemini/payments=0
merge=false
production=false
```

## 7. Siguiente bloque exacto

```text
RECUPERAR NOMBRES DE LOS 13 HOLD SIN INFERENCIA
→ DECISIÓN PAULA CONSERVAR O ARCHIVAR SIN AUTH
→ CORREGIR METADATA PROVIDER/AUTODISCOVERY
→ CONFIRMAR AGOSTO Y MUTACIÓN HISTÓRICA DESDE HR VIVA
→ REGENERAR PLAN AUTH SIN HOLD OPERATIVO
→ VALIDACIÓN ACUMULATIVA
→ CUTOVER CON AUTORIZACIÓN EXPRESA
```
