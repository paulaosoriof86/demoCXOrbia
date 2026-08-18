# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Última sincronización:** 2026-08-18 17:41 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4-SCOPE-SOURCE-GAP-16`  
**Estado:** `I3_INTEGRAL_PASS_FROZEN__GO_LIVE_60__I4_SCOPE_SOURCE_GAP__NO_I4_EXECUTION`

## Carril vivo

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- DEV: `cxorbia-backend-dev`.

## Avance formal

- I1 `15/15 PASS`.
- I2 `20/20 PASS`.
- I3 `25/25 PASS` — frozen.
- I4 `0/25` — no iniciado.
- I5 `0/15` — no iniciado.
- **60% completado / 40% pendiente.**

## I3 — congelado / no reabrir

Final Staff/Admin run `32196648462`, job `95901931320`, artifact `9346121436`, digest `sha256:b3ccc4d9e45a6d42b6ab8a0dcb4cf8e9cfbe6b6ea8409c72524347c7df02189d`.

PASS: identityMap `shp-57d2e3769946 -> TYA_GT_0C0BA8856E`; agosto canonical `2`; residual `0`; duplicados `0/0`; reload/nueva pestaña estables; Historical Shopper y writes/deploys prohibidos `0`; merge/production false. Request final consumido en `0ea4bb6d58ba547db2337bd367f10c32f2540e8b`.

## Bloque I4 scope recovery — resultado

Se ejecutó únicamente recuperación documental/read-only. No se ejecutó I4 ni ningún gate de provider/producto.

### Evidencia

- El estado vivo formaliza I4 como `0/25` dentro del esquema I1–I5 `15/20/25/25/15`.
- El índice/plan Phase A disponible y declarado canónico usa nomenclatura `CORTE 0B` + `CORTES 1–8`.
- Ese plan incluye un `CORTE 4`, pero ninguna fuente activa recuperada declara `CORTE 4 == I4` ni define los subgates del I4 actual.
- Búsqueda dirigida en fuentes activas, `app/docs`, commits y PR #7 sin definición semántica autoritativa de I4.

### Bloqueo exacto

`ACTIVE_SOURCE_GAP__I1_I5_PERCENT_WEIGHTS_PRESENT_BUT_I4_SEMANTIC_SCOPE_NOT_MATERIALIZED`

No es un bug de producto demostrado. Es una brecha de fuente activa que impide definir/ejecutar I4 sin inventar metodología.

## No hacer

- No mapear `CORTE 4` legado a I4 por coincidencia numérica.
- No usar la etiqueta histórica `corte4` como contrato semántico.
- No reabrir I3.
- No provider/Auth/Firestore/Rules/HR/Storage/Make/Gemini/payment writes.
- No deploy, merge ni producción.
- No nueva rama/PR/candidata/metodología.

## Siguiente bloque exacto

`MATERIALIZE_CANONICAL_I4_SCOPE_FROM_APPROVED_SOURCE__NO_EXECUTION`

Necesidad única: recuperar la fuente aprobada que definió I1–I5 `15/20/25/25/15` y el alcance/subgates de I4, o materializar una instrucción vigente explícita equivalente. Solo después se fija el primer gate; este checkpoint no lo inventa.

## Claude / Academia

Sin parche frontend ni cambio funcional de Academia. Sin cambios de manuales, cursos, rutas por rol ni notificaciones en este bloque.
