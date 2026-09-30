# RESUMEN PARA CLAUDE — Addendum C6 runner HR

**Fecha:** 2026-08-06

## Estado corregido

```text
v2 run=31117638647 job=92671263961 cancelled steps=0 providerReads=0 PROVEN
v3 run=31123402722 job=92688738677 cancelled steps=0 providerReads=0 PROVEN
```

El workflow sí está registrado, habilitado y responde al `push` de la rama/path configurados. No modificar frontend ni crear un carril paralelo.

## Regla técnica

La ausencia de `WORKFLOW_STARTED_PROVIDER_READS_0` no significa ausencia de run. Ese status depende de que un runner ejecute el step. Primero debe revisarse run → job → steps con `tools/qa/cxorbia-live-hr-run-consumption-classifier.mjs`.

## Frontend

- conservar la baseline acumulativa;
- no modificar `/app/modules/*` ni `/app/core/*` por este bloque;
- no mostrar estados de GitHub Actions al usuario final;
- `2026-08`, GT/HN y `sourceRevision` siguen sin validación viva.

## Siguiente bloque real

Nueva lectura HR viva controlada, únicamente con autorización fresca. No repetir diagnóstico de registro/trigger.
