# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_IDENTITY_HOLD__NO_PRODUCTION`

## 1. No reabrir
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91; claims5/5; Rules PASS.
- HR live/auto-month PASS.
- PR#7 draft/open/no merge; producción intacta.

## 2. Perfil completo Firestore — PASS
120 perfiles exactos materializados bajo one-shot consumido:118 con cambios +2 marker-only;329 valores; readback120 docs/329 campos; mismatches0. Los31 sin canonical quedan HOLD.

## 3. Protected Hosting DEV — PASS
Un único redeploy del Hosting DEV existente quedó ejecutado bajo autorización separada consumida. Protected runtime/Auth bridge/Firestore adapter/profile bridge/history KPI remoto PASS; carril source-safe por defecto preservado.

No hubo Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys en este redeploy.

## 4. Contrato visual vigente
No rediseñar. Validar la UI existente con el carril protegido:
- Admin/Coordinación: perfil completo real del shopper, incluidos datos personales, username y password legacy real cuando exista;
- teléfono/WhatsApp y demás datos actuales;
- KPI con drill/detail;
- histórico completo por shopperId incluyendo `submitida`;
- Shopper: Auth + custom claims + shopperId real y acceso solo a su propio alcance.

Si el adapter entrega el dato y la UI no lo muestra, documentar el ajuste por archivo para Claude; no reescribir módulos desde backend.

## 5. URL protegida
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`

## 6. 31 identity HOLD
No resueltos por llaves técnicas ni Auth determinístico+claim. No usar nombre/teléfono/email como identidad. Requieren alta/conciliación explícita.

## 7. Siguiente gate
`HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → si PASS, ALTA/CONCILIACIÓN31 HOLD → FREEZE C6 → AGOSTO`.
