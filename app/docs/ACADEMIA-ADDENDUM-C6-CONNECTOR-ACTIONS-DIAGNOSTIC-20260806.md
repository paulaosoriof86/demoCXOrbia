# ACADEMIA — Addendum C6 conector / GitHub Actions

**Fecha:** 2026-08-06

## Patrón reusable

Un commit válido no demuestra por sí mismo que un workflow run haya sido creado. El control plane debe distinguir estas capas:

1. credencial que realiza el write;
2. commit aceptado por GitHub;
3. evento `push` generado o suprimido;
4. workflow habilitado y coincidente;
5. scheduler que crea el run;
6. job que cruza la frontera provider;
7. evidencia terminal.

## Hallazgo metodológico

El mismo autor/committer visible puede corresponder a credenciales técnicas distintas. Por eso no es válido inferir el tipo de token únicamente desde el nombre mostrado en el commit.

La regla de supresión de eventos generados por `GITHUB_TOKEN` solo puede aplicarse cuando el tipo de token está demostrado. En este bloque el conector no expuso esa atribución.

## Resultado

```text
rootCauseProven=false
observabilityGapProven=true
STOP_RETRY=true
providerBoundaryReached=false
```

## Impacto en cursos y manuales

Incorporar:

- matriz commit/evento/workflow/run/job;
- evidencia mínima para atribución de credenciales;
- diferencia entre ausencia de evidencia y evidencia de ausencia;
- gate obligatorio de observabilidad antes de operaciones de ejecución única;
- STOP_RETRY cuando el scheduler no puede auditarse.

No hay cambios de interfaz, rutas por rol, notificaciones operativas ni contenido funcional de Academia.
