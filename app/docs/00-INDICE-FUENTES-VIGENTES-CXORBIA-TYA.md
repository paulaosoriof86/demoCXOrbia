# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `P0_DATOS_DIRECT_ROLE_ROOT_FIX_APPLIED_PENDING_CUMULATIVE_GATES_AND_SINGLE_DEV_REDEPLOY__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge.
- Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: intacta; no tocar sin gate y autorización específicos.

## 2. Fuentes obligatorias vigentes
1. maestros y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. `ADDENDUM-MAESTRO-C6-BASELINE-CANONICA-UNICA-Y-CUTOVER-20260801.md`;
6. `CAMBIOS-BACKEND-ADDENDUM-C6-P0-DATOS-SEPARACION-CARRILES-20260801.md`;
7. evidencia nueva del gate P0 14/616/208 cuando termine el workflow autorizado;
8. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR #7 y HEAD vivo.

## 3. P0 humano comprobado
La validación humana del build anterior demostró una regresión bloqueante:
- la entrada directa abría Administración;
- inmediatamente después, `CX.data` quedaba vacío;
- la pantalla mostraba “Sin proyectos disponibles”, “Sin periodos disponibles” y “Sin proyecto asignado”.

El PASS anterior queda supersedido. No se congela Corte 6 y no se avanza a agosto o producción mientras este P0 no cierre.

## 4. Causa raíz
La URL humana mezclaba `cxProtectedRuntime` y `cxHumanFullVisual`. Eso provocaba que:
- el carril protegido tomara ownership del runtime;
- el watcher HR se desactivara;
- el bridge visual rechazara la combinación;
- el guard read-only interpretara que esperaba Firestore protegido y vaciara proyectos, visitas, shoppers y contexto;
- el smoke anterior aprobara solo el cascarón de entrada sin comprobar datos posteriores.

## 5. Root fix aplicado en rama viva
El delta focal:
- normaliza la entrada humana a `source-safe-human-visual` sin `cxProtectedRuntime`;
- conserva `protected-technical-e2e` únicamente con el token técnico explícito;
- marca el carril humano como `humanVisualSourceSafe=true` antes del montaje;
- preserva la baseline canónica 14 periodos/616 visitas/208 shoppers;
- mantiene el watcher activo en humano y lo desactiva solo en E2E técnico;
- conserva HR source-safe si el overlay protegido falta, expira o falla;
- reemplaza el smoke parcial por un gate browser acumulativo con tres recargas.

No se modificaron `app/modules/*`. No hay writes de datos, Auth, Rules, Cloud Run, HR, merge ni producción.

## 6. Autorización vigente exacta
Paula autorizó:
`AUTORIZO P0 DATOS: aplicar el root fix de separación de carriles, ejecutar gates acumulativos y, solo con PASS 14/616/208 y entrada directa, realizar un único redeploy del Hosting DEV existente cxorbia-backend-dev; sin writes de datos/Auth/Rules/Cloud Run, sin merge y sin producción.`

La autorización es one-shot, limitada al Hosting DEV existente y solo puede consumirse después de PASS local acumulativo.

## 7. Gate vivo
`LOCAL 14/616/208 + ENTRADA DIRECTA + 3 RELOADS + GATES CANÓNICOS + E2E TÉCNICO → 1 DEPLOY DEV → PARIDAD REMOTA + MISMO GATE → EVIDENCIA PASS/FAIL`.

Invariantes mínimas:
- 14 periodos;
- 616 visitas;
- 208 shoppers;
- proyecto y periodo activos;
- datasource `ready`;
- cero shell vacío;
- cero formulario técnico en entrada humana;
- conteos idénticos tras tres recargas;
- Auth técnico staff/shopper aislado;
- cero writes y producción intacta.

## 8. Después del PASS
Solo después de evidencia remota PASS corresponde validación humana acumulativa y eventual `APROBADO C6 → FREEZE`.
Después del freeze: fuente exacta agosto → reconciliación → disponibles → postulaciones → gate multirol → autorización específica de writes/cutover → producción.
