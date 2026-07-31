# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_P0_COMPOSITION_REGRESSION__PERMANENT_STABILITY_LOCK_ACTIVE__NO_DEPLOY__NO_PRODUCTION`

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

Ownership obligatorio:
1. HR viva: periodos/visitas/auto-mes/estado operativo.
2. Firestore protegido: identidad/perfil/PII/username/pass como overlay exacto.
3. Finanzas/pagos canónicos: liquidaciones/beneficios/movimientos/pagos.
4. Auth/RBAC: acceso/scope, no datos operativos.
5. Plataforma-origin: delta propio reconciliado, nunca duplicación HR.

## 5. Regla de composición
Todo composer debe ser idempotente: `compose(base,overlay) === compose(compose(base,overlay),overlay)`.

La base es una copia inmutable de la revisión HR vigente. No se permite usar arrays ya compuestos como nueva base.

## 6. Refresh estable
- `fresh=1` puede consultar en background.
- revisión igual: no apply, no overlay, no rerender funcional.
- revisión distinta: una sola aplicación.
- preservar periodo, ruta, filtros, modal y scroll.
- nunca reload de documento por polling.

## 7. Identidad Shopper
Resolver solo por llaves técnicas exactas y crosswalk auditado: `shopperId/id`, `legacyShopperId`, `visitId`, `hrRowId`, `sourceTab+sourceRow`. No nombre/teléfono/email.

Las visitas históricas deben atribuirse a la identidad canónica antes de KPI/perfil. Conflictos pasan a HOLD.

## 8. P0 actual
La visual acumulativa posterior al último Hosting DEV mostró:
-88→44 visitas durante estabilización;
- badge1,232 visitas/546 shoppers;
- scroll movido por refresh;
- duplicados Shopper;
- perfil/credenciales/histórico divididos;
- comparativo histórico incompleto;
- estados variables entre render inicial y refresh.

La HR viva sí está accesible; julio actual sigue siendo34 GT +10 HN. El P0 es de composición no idempotente.

## 9. Regression gate obligatorio antes de cada etapa/deploy
Debe validar conjuntamente:
- fuente HR actual vs read model;
- uniqueVisitKeys==visitCount;
- 3 reaplicaciones consecutivas sin crecimiento;
- identidad Shopper única por crosswalk exacto;
- histórico/KPI iguales antes y después de refresh;
- estados canónicos coherentes en Dashboard/Visitas/histórico;
- comparativo conserva meses anteriores;
- Beneficios y Finanzas conservan su fuente canónica;
- portal Shopper/Admin comparten identidad;
- `/app/modules/*` intacto desde backend;
- writes/proveedores solo según gate exacto autorizado.

PASS parcial = FAIL del corte.

## 10. Julio/agosto
No iniciar materialización agosto mientras Corte6 tenga este P0. HR live/auto-month sigue siendo requerida. Tras freeze: identificar/reconciliar fuente agosto plataforma-origin y materializar solo delta autorizado.

## 11. Claude/prototipo
El mismo regression lock aplica a toda candidata futura. Claude no reinterpreta HR/identidad/finanzas en módulos y no puede reintroducir fixtures o fallbacks superados.

## 12. Academia
Documentar ownership de fuentes, composer idempotente, crosswalk técnico, no-regresión y refresh que no interrumpe al usuario.

## 13. Gate vivo inmediato
`ROOT FIX IDEMPOTENTE + CROSSWALK TÉCNICO + UI STATE STABILITY → REGRESSION GATE 3x + HISTÓRICO + SHOPPER + BENEFICIOS + FINANZAS → solo si PASS 1x DEV DEPLOY → HUMAN VISUAL → FREEZE C6 → AGOSTO`.

## 14. Estado seguro
En el bloque actual: Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos writes0; Cloud Run0; Hosting0; nuevos Firebase/Hosting0; merge=false; producción=false.
