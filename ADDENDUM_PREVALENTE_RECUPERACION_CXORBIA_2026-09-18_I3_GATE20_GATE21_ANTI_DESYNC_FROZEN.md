# ADDENDUM PREVALENTE — I3 GATE 20 / GATE 21 ANTI-DESYNC

**Fecha:** 2026-09-18  
**ID:** `CXORBIA-I3-GATE20-GATE21-ANTI-DESYNC-20260918`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_GO_OR_NEWER_EXPLICIT_SUPERSESSION`  
**Iteración:** `I3 — FUNCTIONAL CLOSURE`

## 1. Motivo y causa raíz
La desincronización entre Gate 20 y Gate 21 reapareció después de haber sido identificada el 2026-09-16. La causa no fue un nuevo defecto funcional del producto: fue un defecto estructural del mecanismo de certificación. Gate 20/certificación y Gate 21 podían conservar o recibir identidades de source/tree por carriles separados.

El addendum `ADDENDUM_I3_RELEASE_COMPOSITION_CORRECTION_2026-09-16.md` ya prohibía que Gate 20, Gate 21 o cualquier gate terminal definiera un `PRODUCT_SOURCE_SHA` independiente. Sin embargo, la implementación posterior todavía duplicó la identidad de release: la certificación mantenía `I3_CERTIFICATION_SOURCE_SHA/TREE` y el caller volvía a copiar esos mismos valores hacia Gate 21 mediante `workflow_call inputs`. Run 171 demostró el riesgo al ejecutar Gate 21 con un lock histórico distinto de la source certificada viva.

**Conclusión causal:** sincronizar punteros por copia manual es insuficiente. La corrección debe eliminar la segunda autoridad, no volver a editarla.

## 2. AFTER — regla mecánica obligatoria
1. **Única autoridad de source antes del build.** La source/tree certificable se define una sola vez en el workflow principal de I3 mediante `I3_CERTIFICATION_SOURCE_SHA` y `I3_CERTIFICATION_SOURCE_TREE`.
2. **Único handoff hacia Gate 21.** Después de Gate 20 y del empaquetado, `i3-certification-manifest.json` / `result.json` del artifact del mismo run es la única autoridad de source/tree/control para Gate 21.
3. **Gate 21 no recibe source/tree por parámetros.** Quedan prohibidos `certification_source_sha`, `certification_source_tree`, hardcodes de source/tree o locks locales equivalentes dentro de Gate 21.
4. **Gate 21 deriva, no redefine.** Gate 21 descarga el artifact del mismo `github.run_id`, lee `i3CertificationSourceSha`, `i3CertificationSourceTree` y `controlHeadSha` del manifest y sólo entonces verifica el repositorio, lineage y ausencia de product drift.
5. **Misma evidencia Gate 20.** Gate 21 verifica los hashes de `gate20-browser-visual.json` y `gate20-semantic-shopper.json` declarados en el manifest. No puede sustituirlos por un Gate 20 histórico distinto.
6. **Mismo artifact.** Gate 21 recalcula el SHA-256 del TAR certificado y exige igualdad con el manifest y su `.sha256`. No rebuild, no recomposición y no redeploy dentro de Gate 21.
7. **Un mismatch no se “sincroniza”.** Si source/tree, Gate 20 o artifact no coinciden, el resultado es `RELEASE_COMPOSITION_FAILURE`. La corrección autorizada es encontrar el owner causal; nunca editar un segundo puntero para hacerlo coincidir.
8. **Baseline visual histórico explícito.** Los campos antes llamados `LOCKED_GATE20_BASELINE_*` pasan a llamarse `HISTORICAL_GATE20_BASELINE_*`. Ese SHA histórico sólo demuestra una baseline visual anterior y nunca es release source, Gate 21 source ni autorización de promoción.

## 3. Precedencia documental anti-desync
- `CHECKPOINT_I3_TERMINAL_GO_2026-09-17.md` y `CXORBIA_I3_TERMINAL_LOCK_2026-09-17.json` son evidencia histórica válida exclusivamente para la release exacta `b94911a...` certificada ese día.
- Esa evidencia **NO representa el current state de I3 desde que apareció drift reproducible posterior el 2026-09-18**. No autoriza I4 hoy.
- El current state se rige por `ADDENDUM_PREVALENTE_RECUPERACION_CXORBIA_2026-09-18_I3_CANONICAL_CONVERGENCE_FROZEN.md` y por este addendum anti-desync, más la evidencia viva del run canónico posterior.
- `CXORBIA_RELEASE_INTEGRITY_LOCK_2026-09-16` permanece como evidencia histórica de la falla de composición original, nunca como puntero vivo.
- Una conversación futura no puede elegir el checkpoint/lock más optimista por fecha o nombre; debe aplicar precedencia y drift posterior demostrado.

## 4. Identidad actual protegida
La candidata funcional continúa siendo:
- source: `6d4dbdc098348500ba62161d8136458e8b1016ad`
- tree: `669a1c8c12e8eef24e26ba410b8d50d0bf58fb97`

Este addendum no modifica producto. Modifica únicamente el control de certificación y la precedencia documental necesaria para impedir otra desincronización Gate 20/Gate 21.

## 5. Criterio de cierre
I3 sólo puede volver a `GO` cuando un único run demuestre, sobre la misma source/build/artifact: HR fresh PASS, credenciales PASS, human lane PASS, persistencia PASS, Gate 20 visual PASS, Gate 20 semántico PASS, artifact único y Gate 21 derivado exclusivamente del manifest de ese mismo artifact.

## 6. Mutabilidad y producción
Este archivo es FROZEN y no se edita. Cualquier cambio futuro exige addendum posterior con BEFORE/AFTER, causa, evidencia y hash. Producción `https://tya-plataforma.web.app/` continúa `DO_NOT_TOUCH` hasta `I3=GO` nuevo y autorización explícita de Paula para I4.
