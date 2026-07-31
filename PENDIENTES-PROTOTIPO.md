# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__PROTECTED_HOSTING_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_IDENTITY_HOLD__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.

## 2. Perfil completo — PASS
120 Firestore docs exactos actualizados;118 field-change +2 marker-only;329 valores; readback120/329; mismatches0. Autorización consumida.

## 3. Protected Hosting DEV — PASS
Un único redeploy protegido quedó ejecutado/verificado. No hubo otros provider writes/deploys. Autorización consumida.

## 4. P0 visual — gate actual
Validar ahora:
- Admin/Coordinación con datos completos, username/password legacy real cuando exista y teléfonos/WhatsApp;
- KPI de shoppers con detalle;
- histórico completo por shopperId incluyendo `submitida`;
- Shopper autenticado con shopperId real y módulos propios.

URL protegida: `https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV`.

## 5. 31 perfiles sin canonical — HOLD probado
No resolvibles hoy por legacy exacto, llaves técnicas o Auth determinístico+claim. No emparejar por nombre/teléfono/email. Requieren alta/conciliación explícita.

## 6. Fuente/precedencia
Export vigente manda para perfil actual.616 visitas y77 certificaciones canónicas siguen siendo autoridad. Firebase Auth sigue siendo autoridad del login.

## 7. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 8. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6.

## 9. Siguiente bloque
`HUMAN VISUAL ADMIN+SHOPPER → PASS/FAIL → si PASS, ALTA/CONCILIACIÓN31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
