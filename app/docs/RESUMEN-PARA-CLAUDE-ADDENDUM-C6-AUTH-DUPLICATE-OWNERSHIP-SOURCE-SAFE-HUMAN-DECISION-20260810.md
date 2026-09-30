# RESUMEN PARA CLAUDE — ADDENDUM C6 DUPLICATE OWNERSHIP

**Fecha:** 2026-08-10  
**Estado:** `HUMAN_OWNERSHIP_DECISION_REQUIRED_4`

## Backend/Auth

Auth DEV permanece en 228 usuarios. No hubo provider reads, Auth writes, deploy ni producción en este bloque.

Los cuatro grupos pendientes no pueden resolverse automáticamente con la evidencia source-safe vigente:

```text
1acdcb3782b7cf351056 = HUMAN_OWNERSHIP_DECISION_REQUIRED
2c4d19f2b066835473d3 = HUMAN_OWNERSHIP_DECISION_REQUIRED
54225792eeb65f6739c0 = HUMAN_OWNERSHIP_DECISION_REQUIRED
ae2f920fe6d9ce1fdd82 = HUMAN_OWNERSHIP_DECISION_REQUIRED
```

A–C son principals legacy/pre-import namespace `NONE`; ninguno corresponde a los principals staff canónicos importados namespace `staff`, pero no existe discriminador seguro entre los dos members de cada par. En Cliente, ambos members son históricos y el principal canónico vigente es otro principal ya materializado/validado.

## Claude/prototipo

No aplicar ningún parche frontend, selector alternativo ni relajación de roles/tenant/project scope para compensar estos duplicados. La resolución es backend/ownership y debe permanecer fuera de UI hasta decisión humana y repair posterior autorizado.

## Academia

Documentar el patrón: si dos principals resultan técnicamente equivalentes y no existe lineage única, el sistema debe escalar a revisión humana, nunca elegir por antigüedad, orden o coincidencia visual.
