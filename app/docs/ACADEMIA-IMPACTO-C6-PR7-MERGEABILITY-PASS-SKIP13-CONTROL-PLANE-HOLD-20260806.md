# ACADEMIA — Impacto C6 PR #7 mergeability PASS / SKIP13 control-plane HOLD

**Fecha:** 2026-08-06

## Aprendizaje reusable

Este bloque documenta que tres estados técnicos distintos no deben confundirse:

1. **Mergeabilidad Git:** capacidad de combinar dos historiales sin conflicto.
2. **Ejecución GitHub Actions:** creación observable de un run y sus jobs.
3. **Consumo provider:** lectura efectiva de Auth, claims y memberships.

Resolver el primer nivel no prueba automáticamente los otros dos.

## Caso aplicado

La no-mergeabilidad se redujo a un conflicto `add/add` sobre un workflow V156. La eliminación de la copia obsoleta en la rama viva permitió verificar `mergeable=true` sin tocar lógica funcional.

Después se emitió un request read-only SKIP13, pero no existieron run, job, artifact ni status. La clasificación correcta fue fail-closed:

```text
mergeability=PASS
providerRun=NOT_OBSERVED
providerReadConsumption=UNKNOWN
functionalAccessDecision=NOT_AVAILABLE
```

## Controles demostrados

- diagnóstico por merge-base y delta exclusivo de base;
- resolución mínima de un conflicto de source-control;
- preservación del árbol funcional;
- separación entre evento y ejecución;
- request de una sola ejecución lógica;
- desactivación fail-closed ante ausencia de evidencia terminal;
- prohibición de convertir ausencia de run en PASS funcional.

## Impacto en Academia profunda

Este patrón debe incorporarse en contenidos sobre:

- trazabilidad DevSecOps;
- control de cambios;
- idempotencia;
- fail-closed;
- evidencia terminal;
- segregación entre source control y proveedor cloud;
- gestión de autorizaciones acotadas.

## Sin cambios de producto

No cambian cursos por rol, rutas, manuales, notificaciones ni componentes de Academia dentro de la plataforma.
