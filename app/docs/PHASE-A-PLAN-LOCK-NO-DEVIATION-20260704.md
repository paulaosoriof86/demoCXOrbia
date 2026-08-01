# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-31  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__CANONICAL_DOMAIN_FIX_CODE_PASS__LIVE_HR_ROW_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Objetivo/arquitectura
TyA/Cinépolis es el primer tenant/proyecto configurable de CXOrbia. `cxorbia-backend-dev` es DEV canónico y `tya-plataforma` el Hosting final. No crear Firebase, Hosting, rama o PR por rutina.

## 2. Secuencia obligatoria
`FUENTE VIVA/ORIGEN PLATAFORMA → EXISTENCIA/FRESCURA → MAPPING/IDENTIDAD → READ MODEL CANÓNICO → REGRESSION GATE SEMÁNTICO → WRITE PLAN → DRY-RUN → WRITE EXACTO AUTORIZADO → READBACK → REMOTE SMOKE → VALIDACIÓN HUMANA ACUMULATIVA → CUTOVER`.

Un asset-smoke o prueba sintética aislada no congela un corte. Todo gate futuro debe comprobar igualdad entre KPIs, detalles, perfiles, portal Shopper, Finanzas y periodos.

## 3. Cortes protegidos
- Corte1/2A/3 FROZEN; histórico14 periodos/616 visitas hasta julio.
- R17N1,406/1,406; no repetir.
- Corte5 CX.data PASS.
- Auth91/91, claims5/5 y Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe aprobados permanecen protegidos.

## 4. Ownership canónico
1. HR viva: periodos, visitas, auto-mes y estado operativo.
2. Firestore protegido: identidad, perfil, PII, credenciales y certificación solo como overlay exacto.
3. Finanzas/pagos canónicos: liquidaciones, movimientos, beneficios y pagos.
4. Auth/RBAC: acceso y scope, no fuente operativa.
5. Plataforma-origin: delta reconciliado, nunca duplicación HR.

## 5. Human visual P0 — estado actual
El Hosting anterior pasó paridad de assets e idempotencia sintética, pero falló la validación humana transversal:
- Dashboard superior correcto y flujo por fases incorrecto;
- comparativo sin histórico;
- refresh moviendo contenido/sidebar;
- identidades Shopper divididas y conteos 210/219;
- perfiles completos sin mínimos, credenciales, WA, certificación o histórico;
- portal Shopper y Beneficios sin el histórico de Admin;
- periodo visible separado del contenido financiero;
- Movimientos/Liquidaciones/Beneficios fragmentados.

Corte6 no está congelado. El remote smoke anterior se conserva como evidencia técnica, no como release PASS.

## 6. Read model canónico v2
`app/adapters/tya-cumulative-read-model-v2.js`:
- compone desde HR, nunca desde arrays ya compuestos;
- protected visits solo hacen overlay por llave técnica exacta;
- perfiles sin crosswalk no se anexan a operación y pasan a review queue;
- no dedupe por nombre/teléfono/email;
- identidad, certificación, histórico y completitud se calculan desde evidencia real;
- genera resumen por periodo y facetas canónicas.

`app/adapters/tya-canonical-state-semantics-v2.js` separa:
- evidencia histórica fuera de rango;
- estado fuera de rango actualmente accionable.

## 7. Refresh estable v2
`app/adapters/tya-live-source-refresh-watch-v2.js`:
- usa firma de contenido sin timestamps volátiles;
- mismo contenido = cero trabajo funcional;
- cambio real = un apply + un compose + un render;
- preserva `.content`, `#rail`, periodo, proyecto y vista;
- nunca restaura valores DOM aparte de `CX.data`;
- modal/form activo difiere el render.

## 8. Consistencia transversal DEV
`app/adapters/tya-c6-domain-consistency-bridge.js` adapta el prototipo sin tocar módulos/core:
- Dashboard, fases, detalle y Visitas comparten facetas;
- portal Shopper usa histórico completo;
- Admin ve certificación y completitud real;
- credenciales se derivan con el patrón configurable solo para identidad exacta y sin writes;
- Finanzas usa periodo/identidad canónicos y proyecta historia source-safe read-only.

Este bridge es el carril DEV de validación. Claude debe incorporar el patrón de producto; no copiarlo como parche permanente de UI.

## 9. Gates actuales
### Local
`PASS_C6_CANONICAL_DOMAIN_CONSISTENCY` cubre identidad, historial, facetas, perfil, scroll, periodo y finanzas.

### HR viva real
`PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`:
-14 periodos/616 visitas/208 shoppers;
-JUL44 = GT34+HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-fuera de rango accionable1;
-evidencia histórica fuera de rango7;
-duplicados de llaves0.

## 10. Identidad y materialización
En lectura puede derivarse username/password según el patrón configurable cuando existe vínculo canónico exacto. WhatsApp debe provenir de una fuente real.

Crear/complementar shoppers, persistir contacto/credenciales/certificación/histórico o crear Auth requiere:
`INVENTARIO EXACTO → WRITE PLAN → DRY-RUN → AUTORIZACIÓN ESPECÍFICA → WRITE → READBACK`.

No hacerlo por similitud ni bajo una autorización de Hosting.

## 11. Gate de publicación DEV
El nuevo código está en GitHub, no desplegado. La autorización anterior está consumida.

Secuencia exacta:
`GATES ESTÁTICOS FINALES PASS → AUTORIZACIÓN FRESCA 1x HOSTING DEV EXISTENTE → REMOTE SMOKE SEMÁNTICO → HUMAN VISUAL COMPLETA → FREEZE C6`.

No Cloud Run previsto. Si la visual falla, no se añade otro parche: se corrige el contrato/gate que permitió la regresión.

## 12. Julio/agosto
No iniciar materialización agosto hasta congelar Corte6. Después:
- identificar fuente exacta de agosto plataforma-origin;
- reconciliar con HR cuando aparezcan tabs;
- materializar únicamente delta bajo autorización fresca de data write;
- no repetir histórico 1,406.

## 13. Claude/prototipo
Claude debe incorporar como contratos reutilizables:
- máquina de estados única;
- perfil completo calculado por campos;
- identity review queue;
- historial Shopper completo;
- certificación visible por rol;
- periodo canónico único;
- gate transversal que compara tile, drill, listado y portal.

## 14. Academia
Fuente vigente: `ACADEMIA-IMPACTO-C6-DOMINIO-CANONICO-Y-ESTADOS-ACCIONABLES-20260731.md`.

## 15. Estado seguro
Bloque correctivo actual: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
