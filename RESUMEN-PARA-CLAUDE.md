# RESUMEN-PARA-CLAUDE.md

**Fecha:** 2026-08-27  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_VERSION:** `1.1.0` / `FROZEN`  
**F5:** `CLOSED_PASS_CONSUMED_ZERO_RESIDUE`  
**F6:** `CLOSED_PASS_IMMUTABLE`  
**F7:** `GO_WITH_WARNINGS_NO_P0`  
**F8:** `IN_PROGRESS_READONLY_PRECHECKS`  
**PHASE_A:** `100/100`  
**PRODUCTION_REAL_READINESS:** `95/100`

## Conectado y preservado

El release F6 permanece congelado y no fue reconstruido ni redeployado. F7 permanece terminal `GO_WITH_WARNINGS`. El subbloque F8 de identidad Shopper resolvió una falla del harness, no del frontend ni del producto.

El intento multirol `33107287460` se detuvo en `HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194`: existían identidad exacta, perfil e historia, pero no una contraseña actual rederivable. La causa quedó demostrada como lifecycle de credencial efímera: la recuperación humana histórica había generado una contraseña aleatoria one-shot y limpiado el material privado después del PASS.

La recertificación fresca `33109500671` pasó sin resetear contraseña ni escribir Auth: principal exacto, claims, perfil, membership, crosswalk, usuario habilitado, 6 visitas propias, runtime browser autenticado y HR viva 15 períodos / 30 hojas / 660 visitas / 214 shoppers. El gate de confidencialidad aparece pendiente y visible; la prueba no lo acepta automáticamente.

## Para Claude / prototipo

**No hay cambio frontend que Claude deba implementar por este bloque.** No se modificó `/app/modules`, `/app/core` ni la UI. No inferir pantallas, flujos ni decisiones visuales desde este arreglo de backend/harness.

Preservar únicamente estas reglas funcionales cuando corresponda documentarlas o reflejarlas en UX ya aprobada:
- el Shopper autenticado debe quedar vinculado a su identidad exacta y su historia, no por nombre visual;
- si existe conflicto de identidad, debe ir a revisión y no sobrescribirse silenciosamente;
- el gate legal/confidencialidad debe mostrarse al Shopper cuando corresponda y **su aceptación es humana**, nunca un efecto automático de QA;
- recuperación/reset de contraseña no debe mostrarse ni tratarse como dato persistente del producto: el secreto de recuperación es efímero.

## Academia

Cuando se actualicen manuales/cursos por rol, explicar de forma coherente con el producto real: autenticación Shopper, preservación de histórico, resolución segura de identidad, gate de confidencialidad y carácter efímero de credenciales de recuperación. No automatizar ni simular aceptación legal en material de QA.

## Pendiente técnico que no corresponde a Claude

F8 sigue abierto en 95/100. Faltan provider IAM/secrets/cuotas read-only fresco, carga/cuotas/failure injection acotado, backup/export + restore verificable, assessment/smoke fresco Staff/Admin y Client, y solo después —con autorización expresa de mutación— deployment exacto del manifest y readbacks/rollback. Alert/runbook y profundidad Academia siguen P2.

Evidencia: `app/docs/evidence/RC15-F8-SHOPPER-HARNESS-RECOVERY-LATEST.json`.
