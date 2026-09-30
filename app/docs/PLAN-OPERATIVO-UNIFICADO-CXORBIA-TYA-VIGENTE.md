# PLAN OPERATIVO UNIFICADO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-19  
**SYNC_EPOCH:** `CXORBIA-20260819-PHASEA-PROTECTED-RUNTIME-CONVERGENCE-37`  
**Frontera:** `I4_PROTECTED_RUNTIME_CONVERGENCE_AND_REAL_PHASE_A_E2E`

## Objetivo

Salir del ciclo de reauditoría y cerrar Phase A sobre una sola autoridad runtime real, sin reconstruir funcionalidad ya existente.

## Secuencia única activa

### I4.1 — CANONICAL_CONTINUITY_RECONCILIATION
Reconciliar índice, execution state, source lock, checkpoint, plan, CAMBIOS, RESUMEN y PENDIENTES sobre la rama viva. Cierre solo con commit/push/readback.

### I4.2 — PROTECTED_RUNTIME_SINGLE_AUTHORITY
Partir de `app/index-backend-dev.html` y seguir su bootstrap real. Probar que Auth/claims/membership, identidad, perfil protegido, HR viva, overlays y `CX.data` convergen en una sola autoridad. Corregir únicamente el punto de conexión autorizado si existe autoridad paralela o fallback silencioso demostrado. No tocar módulos UI.

### I4.3 — REAL_PHASE_A_E2E
Sobre la misma build protegida, validar Admin y Shopper reales y las rutas Phase A críticas ya construidas. No repetir auditorías source cerradas.

### I4.4 — I4_GATES_AND_FREEZE
Cerrar I4 únicamente si identidad/RBAC, Shopper, Finanzas, fuente actual y E2E visible pasan sin demo fallback. Al cerrar I4 el score formal pasa de 60% a 85%.

### I5 — PREPRODUCTION_AND_GO_LIVE
Sobre la misma build: regresión transversal, scopes, seguridad, datos limpios, rollback/checkpoint, validación final y gate de deploy/producción. Deploy/producción solo con autorización específica. Cierre I5 = 100%.

## Prohibiciones antirregresión

- No reabrir I1/I2/I3 ni PASS cerrados I4-A/B/C/D/E.
- No reprocesar Shopper/Auth/Finanzas por defecto.
- No nueva candidata, rama, PR, metodología ni transportador.
- No reconstruir módulos existentes.
- No confundir demo/source-safe con runtime provider-backed.
- No puntuar avance por documentación.
- No activar provider writes, Make/Gemini, pagos, merge, deploy o producción antes de su gate.

## Verdad financiera a preservar

- Mayo 2026: 44/44 pagadas.
- Junio 2026: 2/44 pagadas, 42 pendientes, Q451 confirmado.
- `liquidada != pagada`.

## Cierre operativo de cada iteración

Toda iteración debe producir evidencia o declarar un bloqueo exacto. Después de un PASS no se vuelve a diagnosticar el mismo bloque sin insumo nuevo.
