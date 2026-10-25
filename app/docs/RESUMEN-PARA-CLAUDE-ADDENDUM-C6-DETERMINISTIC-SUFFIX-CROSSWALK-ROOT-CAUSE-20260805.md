# RESUMEN PARA CLAUDE — Corrección Crosswalk C6 Deterministic Suffix

**Fecha:** 2026-08-05  
**Impacto visual:** ninguno

## Estado prevalente

El contrato `DETERMINISTIC_TECHNICAL_SUFFIX` pasó source/static, pero el plan provider no es final porque el planner perdió 13 mapeos de credencial respecto al clasificador estable.

```text
estable=101 mapped / 8 unmapped
planner=88 mapped / 21 unmapped
causa=TECH_KEYS de fuentes enlazadas no propagadas a relationIndex
```

## Implicación frontend

No usar todavía las cifras 65 grupos, 142 identidades o 90 sufijos como configuración de producto. Son resultados provisionales de un plan con crosswalk incompleto.

No modificar:

- Login;
- módulos Shopper;
- `CX.data`;
- aliases visibles;
- credenciales o textos de manual.

El frontend nunca debe calcular el sufijo. Solo consumirá el alias final cuando backend complete paridad, revalide provider y materialice Auth con autorización.

## Siguiente bloque backend

Root fix source-only del crosswalk, fixture 101/8 y gate estático. Sin provider read, deploy ni impacto Claude.
