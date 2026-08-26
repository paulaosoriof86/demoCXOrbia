# CXOrbia TyA — Progreso hacia producción real

**Fecha de baseline:** 2026-08-26  
**Métrica canónica:** `PRODUCTION_REAL_READINESS`  
**Estado inicial:** `68/100`

Esta métrica sustituye como indicador ejecutivo el uso aislado de `PHASE_A 98/100`. Phase A se conserva como métrica técnica interna, pero no representa por sí sola estar a 2 puntos del go-live real.

## Baseline 68/100

El 68 reconoce el producto funcional y el trabajo técnico ya demostrado, pero descuenta explícitamente lo que todavía separa a CXOrbia de producción estable: cierre del control-plane, recovery G2-B, E2E sintético integral, release inmutable, readiness preproducción, cutover y aceptación postproducción.

## Escalera congelada restante

- `68 → 69`: M3-0 quiescence/single-authority barrier `CLOSED_PASS`.
- `69 → 74`: M3/F1-F2 cola finita completamente cerrada y autoridad histórica inertizada.
- `74 → 76`: F3 revalidación read-only G2-B `PASS`.
- `76 → 81`: F4 recovery G2-B one-shot `RECOVERY_PASS_FULL`.
- `81 → 86`: F5 aceptación sintética integral real `PASS`, cleanup y readback.
- `86 → 90`: F6 release Phase A inmutable congelado con manifest completo.
- `90 → 95`: F7 readiness integral preproducción `GO` o `GO_WITH_WARNINGS` sin P0.
- `95 → 98`: F8 cutover de producción exacto + smoke por rol/flujo + rollback disponible.
- `98 → 100`: F9 aceptación postproducción después de ventana estable y reconciliación.

## Regla de movimiento

El porcentaje solo aumenta cuando el gate indicado queda cerrado con evidencia reproducible. Diagnóstico, documentación, reintentos, pasos preparatorios o reparaciones parciales no inflan el porcentaje.

Un P0 nuevo puede bloquear el avance, pero no borra trabajo previamente demostrado salvo evidencia de que invalida un gate ya cerrado.
