# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `LAB_SOURCE_CONTRACT_PASS__CLOUD_V7_1_HOLD__NO_EMPALME__NO_DEPLOY__NO_PRODUCTION`

## Cloud V7.1

P0:

- `#login` mantiene flex/centrado/padding bajo 900 px;
- clipping lateral y controles fuera del scroll real;
- evidencia de viewports incompleta.

V7.1 no se envía a Codex.

## Laboratorio

PASS source-only:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

Run `30971991900`, artifact `8916850770`.

Pendiente no bloqueante: actualizar cuatro source paths esperados del mapa de rutas.

## Secuencia

```text
CLOUD V7.2
→ AUDITORÍA FINAL
→ GO SIN P0
→ CODEX SOLO EMPALME
→ SOURCE/STATIC FINAL + GATE LAB
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP
→ VALIDACIÓN HUMANA
```

## Estado seguro

- empalme: 0;
- runtime/datos AUDIT: 0;
- deploy/producción: 0.
