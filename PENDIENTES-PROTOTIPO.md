# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__NO_CREDENTIAL_FULL_VISUAL_REDEPLOY_PASS__WAITING_HUMAN_VISUAL_ADMIN_SHOPPER__31_HOLD__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Human full visual Cloud Run + Hosting DEV redeploy PASS.

## 2. Regla human visual corregida
Paula no debe usar credenciales técnicas Firebase para QA. Auto-entry del prototipo permanece como flujo humano; Auth/claims/Rules son gate técnico separado.

## 3. Validación visual pendiente
Con enlace temporal DEV validar:
- Admin/Coordinación: perfil completo, username/password legacy real cuando exista, teléfonos/WhatsApp, DPI y demás campos materializados;
- KPI shopper con drill/detail;
- histórico completo por shopperId incluyendo `submitida`;
- Shopper/Evaluador: picker DEV de identidad real y módulos propios, sin credenciales Firebase visibles.

## 4. 31 perfiles sin canonical — HOLD probado
No resolvibles por legacy exacto, llaves técnicas ni Auth determinístico+claim. No emparejar por nombre/teléfono/email. Requieren alta/conciliación explícita.

## 5. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 6. Agosto
No ejecutar delta agosto hasta cerrar/freeze Corte6.

## 7. Siguiente bloque
`HUMAN VISUAL ADMIN+SHOPPER SIN CREDENCIALES → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
