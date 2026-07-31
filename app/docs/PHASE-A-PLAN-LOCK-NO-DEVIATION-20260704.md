# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_STABLE_COMPOSER_CODE_PASS__LOCAL_REGRESSION_3X_PASS__PENDING_ONE_HOSTING_DEV_AUTH__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis como tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev`=DEV canónico; `tya-plataforma`=Hosting final. No crear Firebase/Hosting/rama/PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → COMPOSER IDÉMPOTENTE → REGRESSION GATE ACUMULATIVO → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → SMOKE → VALIDACIÓN ACUMULATIVA → CUTOVER`.

El prototipo manda. Un PASS técnico sin validación acumulativa estable no congela un corte.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN; histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS.
- HR live/auto-month PASS.
- Perfil completo Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe aprobados permanecen protegidos.

## 4. Lock permanente de estabilidad
Prevalece `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`.

Toda etapa nueva debe ser aditiva. Ningún overlay, candidata, refresh o proveedor puede reemplazar o degradar un slice previamente aprobado.

Ownership:
1. HR viva: periodos/visitas/auto-mes/estado operativo.
2. Firestore protegido: identidad/perfil/PII/username/pass como overlay exacto.
3. Finanzas/pagos canónicos: liquidaciones/beneficios/movimientos/pagos.
4. Auth/RBAC: acceso/scope.
5. Plataforma-origin: delta reconciliado, nunca duplicación HR.

## 5. Composer estable ya implementado
`app/adapters/tya-cumulative-read-model.js` es el composer canónico del visual DEV acumulativo:
- baseline HR inmutable por `sourceRevision`;
- match de protected visit solo por `hrRowId`, `sourceTab+sourceRow` o `visitId` exacto;
- protected visits nunca se anexan sobre HR;
- crosswalk Shopper solo por evidencia técnica;
- HR conserva estado operacional;
- perfil protegido enriquece identidad/credenciales sin reescribir HR.

`tya-dev-full-visual-bridge.js` ya usa este composer y `tya-live-source-refresh-watch.js` aplica revision gate + preservación UI.

## 6. Refresh estable
- `fresh=1` consulta en background.
- misma revisión: no apply, no overlay reapply, no rerender funcional.
- revisión distinta: un apply HR + una recomposición estable.
- rerender central se difiere mientras exista modal/form activo.
- periodo/ruta/selects/foco/scroll se preservan cuando siguen siendo válidos.
- nunca reload de documento por polling.

## 7. Identidad Shopper
Resolver solo por llaves técnicas exactas/crosswalk: `shopperId/id`, `legacyShopperId`, `visitId`, `hrRowId`, `sourceTab+sourceRow`. No nombre/teléfono/email.

Las visitas históricas se atribuyen a la identidad canónica antes de KPI/perfil. Conflictos quedan HOLD.

## 8. Regression gate ejecutado localmente
`PASS_C6_STABLE_COMPOSER_3X_IDEMPOTENCE`:
- baseline14/616/208;
-120 perfiles protegidos;
-616 protected visits con identificador alterno pero misma evidencia HR;
- tres reaplicaciones:616 visitas/208 shoppers en las tres;
- duplicateVisitKeys0;
- duplicateShopperIds0;
- protectedVisitsAppended0;
- estado HR preservado;
- perfil protegido visible.

La evidencia declara explícitamente que fue ejecución local de los mismos sources, no CI remoto.

## 9. Gate remoto pendiente
El código todavía no está publicado en Hosting DEV. La autorización anterior fue consumida.

Con autorización fresca se permite únicamente:
`1x redeploy del Hosting DEV existente cxorbia-backend-dev/cxorbia-dev`.

No Cloud Run. Después se ejecuta remote smoke y human visual con 3 refresh y validación completa. Solo PASS completo congela Corte6.

## 10. Julio/agosto
No iniciar materialización agosto mientras Corte6 no quede visualmente estable y congelado. HR live/auto-month sigue activa. Después: identificar/reconciliar fuente agosto plataforma-origin y materializar solo delta autorizado.

## 11. Claude/prototipo
El mismo regression lock aplica a toda candidata futura. Claude no reinterpreta HR/identidad/finanzas y no puede reintroducir fixtures, fallbacks o estados antiguos.

## 12. Academia
Documentar ownership, composer idempotente, crosswalk técnico, revision gate y refresh que no interrumpe al usuario. Fuente vigente: `ACADEMIA-IMPACTO-C6-STABLE-COMPOSER-ROOT-FIX-20260731.md`.

## 13. Gate vivo inmediato
`AUTORIZACIÓN FRESCA 1x HOSTING DEV → REMOTE SMOKE → HUMAN VISUAL 3x REFRESH + DASHBOARD/HISTÓRICO/SHOPPER/BENEFICIOS/FINANZAS → PASS/FAIL → FREEZE C6 → AGOSTO`.

## 14. Estado seguro
En el bloque actual: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run0; Hosting0; nuevos Firebase/Hosting0; merge=false; producción=false.
