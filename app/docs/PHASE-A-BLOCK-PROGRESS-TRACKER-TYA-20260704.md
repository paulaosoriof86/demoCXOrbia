# PHASE A — Tracker de avance por bloques TyA

**Actualización:** 2026-08-05  
**Estado:** `HUMAN_LOGIN_SINGLE_FORM_SOURCE_FIX_PASS__SHOPPER_IDENTITY_AUDIT_PASS_WITH_FINDINGS__IDENTITY_REPAIR_REQUIRED__NO_DEPLOY`

## Microbloques de salida

| Microbloque | Estado | Evidencia |
|---|---|---|
| 0 — Carril único | COMPLETADO | Rama viva y PR #7 preservados |
| 1 — Auditoría focalizada V7.2 | COMPLETADO | P0 selector reproducible |
| 2 — Empalme/composición acumulativa | COMPLETADO | V7.2-P0F1 empalmada |
| 3 — Root fix selector Login | COMPLETADO | `.lg2-card, .login-card` |
| 4 — Reconciliación de pins | COMPLETADO | Manifest activo reconciliado |
| 5 — Root DEV canónico | COMPLETADO | `/` redirige a `/index-backend-dev.html` |
| 6 — Validación humana Login | FAIL P0 | Doble formulario y credencial incierta |
| 7 — Bridge single-form source-only | APLICADO | Solo `#loginForm`, `#lgUser`, `#lgPass`, `#lgSubmit` |
| 8 — Source/static posterior | PASS | Run `31041288528` |
| 9 — Auditoría completa identidad Shopper | PASS CON HALLAZGOS | Run `31041406837` |
| 10 — Contrato identidad Shopper | PENDIENTE | Membership vs claims+perfil no definido |
| 11 — Reparación identidad Paula | PENDIENTE | Dos candidatas; ninguna full-ready |
| 12 — Reparación poblacional idempotente | PENDIENTE | Requiere dry-run y autorización de writes |
| 13 — Deploy del bridge single-form | NO AUTORIZADO | Cero deploy en este bloque |
| 14 — Validación humana final y freeze | BLOQUEADO | Primero cerrar identidad y desplegar con gate autorizado |
| 15 — Producción | PENDIENTE | Requiere freeze y autorización expresa |

## Resultado de identidad

```text
firestoreProfiles=340
credentialShopperRecords=109
uniqueLogins=109
authUsers=88
claimsValid=88
projectScopeValid=88
profileMapped=88
profilesWithoutCredentialMapping=252
nameDotSurnamePattern=79
nombre123PatternHash=81
passwordSignInCompatible=85
exactPasswordExceptions=4
missingAuth=21
shopperMemberships=0
```

## Paula

```text
staffCandidates=1
shopperCandidates=1
authUsers=1
claimsValid=1
membershipsValid=0
passwordSignInCompatible=0
fullReady=0
ambiguous=true
```

## Siguiente bloque exacto

`DEFINIR CONTRATO CANÓNICO DE IDENTIDAD SHOPPER → AISLAR PAULA STAFF/SHOPPER → GENERAR PLAN DRY-RUN POR POBLACIÓN → CERO WRITE HASTA NUEVA AUTORIZACIÓN`.

## Estado seguro

Hosting DEV del bloque `0`; Cloud Run `0`; Firestore/Auth/Rules/Storage/HR writes `0`; cambios/restablecimientos de contraseña `0`; Make/Gemini/pagos `0`; merge `false`; producción `false`.
