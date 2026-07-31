# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_HUMAN_VISUAL_FAIL_PARTIAL__CUMULATIVE_HR_PROFILE_FINANCE_FIX_PREPARED__HOSTING_GATE_WAITING_AUTH__31_HOLD__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN ACUMULATIVA → CUTOVER`.

El prototipo manda. Un PASS técnico sin validación visual acumulativa no congela un corte.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN; histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe aprobados permanecen protegidos.

## 4. Regla human visual — prevalente
La validación humana no requiere credenciales técnicas Firebase. Human visual DEV usa auto-entry del prototipo; Firebase Auth/claims/Rules permanece como gate técnico/provider separado.

## 5. Regla de acumulación — prevalente
Agregar una fuente/capa nueva **nunca puede reemplazar una fuente ya aprobada**. Para TyA Phase A la precedencia es:
1. HR viva: periodos, periodo activo, visitas operativas, auto-mes y refresh.
2. Firestore protegido: perfil/PII/username/pass legacy materializado + facetas/histórico, como overlay por identidad técnica exacta.
3. Finanzas/pagos canónicos: autoridad de liquidaciones, beneficios, movimientos y pagos históricos.

Toda visual/gate debe conservar simultáneamente lo ya aprobado. Si una capa nueva hace desaparecer datos previos, es FAIL/P0 de composición.

## 6. Resultado Human full visual no-credential
El acceso sin credenciales quedó PASS, pero la prueba humana acumulativa quedó FAIL:
- Dashboard JUL2026 mostró0 visitas aunque el baseline conserva616;
- watcher HR viva estaba deshabilitado;
- listado Shopper mezclaba reales con fixtures/aliases/referencias técnicas;
- datos completos/histórico no se reflejaban consistentemente;
- Beneficios y Finanzas aparecían vacíos.

## 7. Fix acumulativo preparado
Sin provider mutation:
- full visual ahora superpone Firestore sobre HR viva, no reemplaza `CX.data`;
- unión solo por `id/shopperId/legacyShopperId`, nunca nombre/teléfono/email;
- stale alias solo se suprime por vínculo exacto `legacyShopperId`;
- fixtures demo y refs técnicas sin identidad operacional no se agregan como personas nuevas;
- histórico protegido se superpone por `visitId` y conserva period/project mapping HR;
- watcher HR sigue activo con `fresh=1`, polling/focus/visibility y reaplica overlay;
- finanzas/pagos canónicos no se reemplazan;
- `/app/modules/*` intacto.

## 8. Próximo gate provider
Request Hosting acumulativo preparado disabled. Solo con autorización nueva:
- máximo1 Hosting DEV redeploy existente;
- Cloud Run0;
- Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0;
- sin nuevo proyecto/Hosting, merge ni producción.

Preflight antes de mutation debe confirmar HR runtime read,616 visitas, auto-discovery y full-profile fail-closed401.

## 9. Human visual objetivo
Una sola prueba acumulativa posterior al deploy debe validar Dashboard HR, Shoppers/perfil/histórico, portal Shopper, Beneficios y Finanzas. No volver a validar capas parciales aisladas.

## 10. 31 identity HOLD
No resueltos por legacyShopperId, llaves técnicas exactas/únicas ni Auth claim. No crear/deduplicar por nombre/teléfono/email.

## 11. Julio/agosto
No iniciar materialización agosto mientras Corte6 siga abierto. HR live/auto-month debe seguir activo. Después del freeze: identificar/reconciliar fuente agosto plataforma-origin y materializar solo delta autorizado.

## 12. Claude/prototipo
No rediseñar ni reescribir módulos por este P0. La corrección es backend/adapters DEV. Si después del overlay acumulativo persiste un gap frontend reproducible, documentar archivo/módulo exacto para Claude.

## 13. Academia
Documentar composición acumulativa de fuentes, precedencia y exact identity overlays.

## 14. Gate vivo inmediato
`AUTORIZACIÓN 1x HOSTING DEV ACUMULATIVO → READ-ONLY PREFLIGHT → DEPLOY/SMOKE → HUMAN VISUAL ACUMULATIVA → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

## 15. Estado seguro
Fix solo en repo. Desde la visual fallida no hay nuevos provider writes/deploys; merge=false; producción=false.
