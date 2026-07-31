# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_PROFILE_WRITE_PASS__HUMAN_VISUAL_AUTH_DESVIO_CONFIRMED__NO_CREDENTIAL_FULL_VISUAL_FIX_PREPARED__WAITING_1X_CLOUD_RUN_1X_HOSTING_AUTH__31_HOLD__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → PROVIDER COMPARE/CONCILIACIÓN → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN → CUTOVER`.

El prototipo manda. Un PASS técnico sin validación visual no congela un corte.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN; histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.

## 4. Regla human visual — prevalente
La validación humana de Paula **no requiere credenciales técnicas Firebase**. Se preserva el contrato previo:
- human visual DEV = auto-entry del prototipo;
- Firebase Auth/claims/Rules = gate técnico/provider separado.

No volver a pedir a Paula username/password Firebase para cada visualización ni usar protected browser-auth como requisito humano.

## 5. Fix no-credential full visual preparado
Sin provider mutation:
- proxy Firestore server-side read-only sobre `cxorbia-live-hr-dev` con token temporal opaco y fail-closed401;
- bridge `tya-dev-full-visual-bridge.js` carga perfil completo en memoria;
- auto-entry Admin y picker DEV de shopper real ya existentes se preservan;
- watcher HR no pisa CX.data en ese carril;
- `/app/modules/*` intactos.

## 6. Gate de provider pendiente
Solo bajo autorización nueva:
- máximo1 Cloud Run DEV redeploy existente;
- máximo1 Hosting DEV redeploy existente;
- cero Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes;
- sin nuevo proyecto/Hosting, merge ni producción.

## 7. Human visual objetivo
Después del gate:
- Admin/Coordinación entra sin credenciales Firebase visibles;
- perfil shopper completo con username/password legacy real cuando exista, teléfonos/WhatsApp, DPI y demás datos materializados;
- KPI/drill e histórico completo por shopperId incluido `submitida`;
- Shopper/Evaluador usa picker DEV de identidad real existente y navega módulos propios.

## 8. 31 identity HOLD
Investigados por legacyShopperId, llaves técnicas exactas/únicas y Auth determinístico+claim:0 resueltos. No crear/deduplicar por nombre/teléfono/email.

## 9. Julio/agosto
No iniciar materialización agosto mientras Corte6 siga abierto. Después del freeze: refresh HR → resolver agosto HN si corresponde → materializar solo delta agosto.

## 10. Claude/prototipo
No rediseñar ni reescribir login/módulos por este P0. La corrección es backend/core/adapters DEV. Mantener UI aprobada.

## 11. Academia
Documentar separación entre human QA auto-entry y provider Auth, token visual temporal, server-side read-only, one-shot deploy, smoke y validación humana.

## 12. Gate vivo inmediato
`AUTORIZACIÓN 1x CLOUD RUN DEV + 1x HOSTING DEV NO-CREDENTIAL VISUAL → REMOTE SMOKE → HUMAN VISUAL ADMIN+SHOPPER → 31 HOLD → FREEZE C6 → AGOSTO`.

## 13. Estado seguro
Fix preparado únicamente en repo. Desde el último deploy: provider writes/deploys0; merge=false; producción=false.
