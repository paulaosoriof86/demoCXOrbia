# ACADEMIA — ADDENDUM C6 AUTH UPDATE-UNIVERSE BATCH PLAN V4 PASS

## Impacto académico

Este bloque aporta un patrón reutilizable de control de identidad para documentación técnica y formación interna:

- evitar resolución reactiva perfil por perfil cuando existe una clase de riesgo sistémica;
- clasificar el universo completo antes de mutar un plan;
- separar anclas target-specific de señales de colisión compartidas;
- exigir unicidad global de principal y candidate;
- congelar counts/digest después de la clasificación completa;
- mantener PREWRITE y writes como gates separados.

Caso TyA resultante:

```text
UPDATE universe=45
candidateCount0=36
candidateCount1=9
candidateCount>1=0
unresolved=0
plan v4 HOLD=0
```

No enseñar ni documentar datos personales, UID, emails, passwords, hashes o salts. Solo fingerprints y métricas source-safe.

## Rutas/manuales

No hay cambio funcional visible todavía para cursos por rol porque Auth DEV no fue ejecutado. Los manuales de Admin/Operaciones, Shopper y Cliente se actualizan únicamente después de la futura activación Auth y smoke acumulativo PASS.
