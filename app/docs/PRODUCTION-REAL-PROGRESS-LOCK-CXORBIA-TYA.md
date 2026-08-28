# CXOrbia TyA — Progreso hacia producción real

**Fecha de baseline vigente:** 2026-08-27  
**Métrica canónica:** `PRODUCTION_REAL_READINESS`  
**Estado actual:** `95/100`  
**PHASE_A:** `100/100`  
**MASTER_PLAN_VERSION:** `1.1.0`  
**PLAN_CHANGE_REQUEST:** `PCR-20260826-PRODUCTION-ACCELERATION-01`

## Gates cerrados

- `69 → 74`: M3 terminal PASS.
- `74 → 76`: F3 mecanismo provider + recovery lane PASS.
- `76 → 81`: F4 recovery PASS.
- `81 → 86`: F5 live synthetic acceptance + cleanup + residue cero PASS.
- `86 → 90`: F6 release Phase A inmutable PASS.
- `90 → 95`: F7 integral readiness `GO_WITH_WARNINGS`, P0=0.

## F8 — avance causal sin cambio porcentual

El intento temporal IAM automatizado anterior demostró que el principal DEV disponible carece de `resourcemanager.projects.setIamPolicy`; no hubo grant, metadata readback ni provider writes y su autorización quedó consumida.

La nueva evidencia del proyecto exacto identifica una identidad humana con `roles/owner`, cerrando la hipótesis de ausencia total de una ruta administrativa. Sin embargo, el carril actual no dispone de un puente seguro automatizado hacia esa sesión: no se encontró GitHub OIDC/WIF existente ni conector GCP/IAM utilizable.

Por tanto F8 avanza causalmente de `REQUIRE_IAM_CAPABLE_PROVIDER_ROUTE` a `REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`, pero **no aumenta porcentaje**. No existe autorización de provider mutation y no se solicita acción manual en este corte.

El porcentaje solo mueve `95 → 98` cuando F8 cutover quede terminal y reconciliado.

## Escalera restante

- actual `95/100`;
- `95 → 98`: F8 cutover exacto;
- `98 → 100`: F9 aceptación postproducción.

## Siguiente gate

`F8_REQUIRE_SECURE_OWNER_EXECUTION_BRIDGE`.

Release F6 intacto; provider/IAM/data/deploy writes=0.
