# ACADEMIA — ADDENDUM C6 AUTH DIGEST PASS + PHASE2 SYSTEMIC UPDATE RISK

**Fecha:** 2026-08-07

Lección reusable para cursos/manuales: un gate por fila puede parecer correcto y aun así permitir alias de identidad entre filas. La validación robusta debe incluir invariantes globales y evaluar el universo completo antes de mutar.

Caso CXOrbia:

- principal uniqueness global corregido;
- digest canónico v3 PASS;
- PREWRITE real detectó un segundo `UPDATE_AUTH` con candidateCount=0 antes del write boundary;
- análisis source-only demostró que existen 36 filas UPDATE dentro del mismo patrón estructural suffixado/shared-baseLogin;
- metodología corregida: batch revalidation de las 45 UPDATE antes de volver a ejecutar Auth.

Impacto Academia: actualizar material de arquitectura/QA para explicar `fail-closed`, invariantes globales, prevención de loops y separación entre evidencia source-safe y provider. Sin cambios en rutas, cursos o UI de Academia en este bloque.
