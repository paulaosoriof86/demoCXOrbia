# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_CUMULATIVE_HOSTING_PASS__WAITING_HUMAN_VISUAL_CUMULATIVE__31_HOLD__NO_PRODUCTION`

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
Agregar una fuente/capa nueva nunca puede reemplazar una fuente ya aprobada. Precedencia Phase A:
1. HR viva: periodos, periodo activo, visitas operativas, auto-mes y refresh.
2. Firestore protegido: perfil/PII/username/pass legacy materializado + facetas/histórico, como overlay por identidad técnica exacta.
3. Finanzas/pagos canónicos: autoridad de liquidaciones, beneficios, movimientos y pagos históricos.

Si una capa nueva hace desaparecer datos previos, es FAIL/P0 de composición.

## 6. Resultado Human full visual previo
Acceso sin credenciales PASS; composición acumulativa FAIL reproducida: Dashboard0, watcher HR deshabilitado, aliases/fixtures visibles, perfil/histórico parcial y Beneficios/Finanzas vacíos.

## 7. Fix acumulativo publicado PASS
Autorización `chat-20260731-c6-cumulative-human-visual-hosting-01` consumida.

- 1 redeploy del Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- Cloud Run redeploys0;
- decisión `PASS_EXISTING_HOSTING_DEV_CUMULATIVE_HR_PROFILE_FINANCE_REMOTE_READY`.

Preflight/remote smoke:
- HR fresh/runtimeRead/sourceSafe PASS;
- 616 visitas preservadas;
- auto-discovery mensual PASS;
- Firestore como overlay exacto por identidad técnica;
- alias legacy solo por `legacyShopperId` exacto;
- finance asset canónico preservado;
- full-profile fail-closed401;
- `/app/modules/*` intacto.

El primer disparo falló antes de provider mutation por validación textual frágil. Se corrigió el gate a marcador semántico real y se reejecutó la misma autorización con deploy count0. No hubo deploy duplicado.

## 8. Human visual objetivo inmediato
Una sola prueba acumulativa debe validar simultáneamente:
- Dashboard JUL + HR viva + auto-mes;
- Shoppers identidad/perfil/username/pass/PII/histórico;
- portal Shopper con la misma identidad;
- Beneficios con verdad financiera aprobada;
- Finanzas Admin con datos canónicos.

La sesión visual temporal existente es válida hasta `2026-08-02T00:29:13Z`; no requiere otro deploy.

## 9. 31 identity HOLD
No resueltos por legacyShopperId, llaves técnicas exactas/únicas ni Auth claim. No crear/deduplicar por nombre/teléfono/email.

## 10. Julio/agosto
No iniciar materialización agosto mientras Corte6 siga abierto. HR live/auto-month debe seguir activo. Después del freeze: identificar/reconciliar fuente agosto plataforma-origin y materializar solo delta autorizado.

## 11. Claude/prototipo
No rediseñar ni reescribir módulos por este P0. Si después del overlay acumulativo persiste un gap frontend reproducible, documentar archivo/módulo exacto para Claude.

## 12. Academia
Documentar composición acumulativa de fuentes, precedencia, exact identity overlays y gates semánticos reutilizables.

## 13. Gate vivo inmediato
`HUMAN VISUAL ACUMULATIVA → PASS/FAIL → 31 HOLD → FREEZE C6 → AGOSTO`.

## 14. Estado seguro
Durante el gate acumulativo: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run0; Hosting1 autorizado; nuevos Firebase/Hosting0; merge=false; producción=false.
