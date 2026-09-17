# ADDENDUM PREVALENTE — I3 EXECUTION FAST LANE

**Fecha:** 2026-09-16  
**ID:** `CXORBIA-I3-EXECUTION-FAST-LANE-20260916`  
**Estado:** `FROZEN_PREVALENT_UNTIL_I3_TERMINAL_LOCK`

## 1. Evidencia que obliga el cambio
I3 ha sufrido pausas repetidas sin avance de gate aun cuando el producto y la candidata ya estaban focalizados. La causa demostrada es de ejecución/orquestación, no una regresión funcional general: el chat estaba actuando como motor secuencial de múltiples llamadas y Gate 21 seguía mezclando fuentes históricas incompatibles con el `CXORBIA_RELEASE_INTEGRITY_LOCK_2026-09-16`.

En el HEAD observado `96252d56c3e4a794d6d58e53ad49050a82bd97df`, el workflow `.github/workflows/cxorbia-recovery-i3-gate21-artifact-fingerprint.yml` conserva `FUNCTIONAL_SOURCE_SHA=53683d0e7bb62e90de3ca4b8063db9e85f5d40ee` y `GATE20_SOURCE_SHA=bd2a519db5ebd08f17d47827997056db795c8c09`, aunque la fuente única I3 ya fue congelada en `b94911a4748c03c2e604415e8a97ee091da96218`.

Clasificación: `RELEASE_COMPOSITION_FAILURE` del control plane.

## 2. Cambio prevalente de ejecución
Desde este addendum y hasta el lock terminal de I3:

1. **GitHub Actions es el motor transaccional de I3.** El chat inicia, inspecciona y certifica resultados; no encadena manualmente una larga secuencia de operaciones como autoridad de estado.
2. **Una fuente, un build, un artefacto.** `I3_CERTIFICATION_SOURCE_SHA=b94911a4748c03c2e604415e8a97ee091da96218` permanece como única fuente de producto para el intento vigente, salvo drift de producto nuevo y demostrado.
3. **Un solo carril existente.** Se reutiliza y corrige el workflow canónico de certificación I3 existente. No se crea otro workflow paralelo, candidata, rama, overlay, materializador o reconstrucción.
4. **Cierre server-side continuo.** El workflow canónico debe ejecutar en servidor el camino pendiente: build determinista único -> artefacto certificado -> gates funcionales pendientes -> Gate 20 -> Gate 21 -> manifest/checkpoint terminal. Gate 21 consume el mismo artefacto; no hace checkout/build de otra fuente de producto.
5. **Gate 21 queda reducido a integridad.** Fingerprint, manifest, lineage del mismo artefacto y equivalencia con Gate 20. No puede reintroducir `FUNCTIONAL_SOURCE_SHA`, `GATE20_SOURCE_SHA` o cualquier SHA de producto histórico distinto de `I3_CERTIFICATION_SOURCE_SHA`.
6. **Interrupción del chat no es FAIL.** Una interrupción de UI/conector no cambia el estado del run GitHub. La reanudación parte del `run_id`, job y artifact ya persistidos, sin reabrir diagnóstico ni repetir gates PASS.
7. **FAIL pequeño.** `ENVIRONMENT_FAILURE` permite reintentar exclusivamente el job fallido sobre el mismo artefacto. Cualquier otro FAIL se corrige solo en su owner probado. Ningún FAIL abre auditoría general.
8. **Preflight una vez por transacción.** HEAD/tree/expectedParent se resuelven antes del write focal. No se repiten entre llamadas de la misma transacción si no aparece drift verificable.
9. **Readback una vez por write.** Commit, parent, tree, diff y HEAD remoto se validan inmediatamente después del commit; luego se ejecuta el workflow. No se vuelve a reconstruir lineage completo.
10. **Estado durable fuera del chat.** El run, artifacts, manifest y checkpoint GitHub son la autoridad de reanudación. La conversación nunca será el único lugar donde exista el “siguiente paso”.

## 3. Qué no cambia
- I0, I1 e I2 permanecen cerradas.
- No se reabre identidad/membership/login shopper sin drift reproducible.
- No se cambian contratos P0 ni gates I3.
- No se crea I5.
- No se toca producción antes de `I3=GO` + autorización expresa de Paula.
- No se reimportan datos.
- No se usa `main` como autoridad.

## 4. Acción inmediata autorizada por este addendum
Corregir exclusivamente el control plane de I3 para eliminar bindings históricos de Gate 21 y hacer que el cierre pendiente consuma la fuente/artefacto únicos ya congelados. Después: readback focal -> ejecución server-side -> Gate 20 -> Gate 21 -> manifest/checkpoint -> `I3=GO` o FAIL clasificado.

## 5. Terminación
Este addendum deja de mandar cuando exista un lock terminal de I3 que registre `GO`, `HOLD` o `NO_GO`, o cuando un addendum posterior demuestre una premisa inválida.
