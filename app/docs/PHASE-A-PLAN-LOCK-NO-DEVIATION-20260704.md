# CXOrbia TyA — PLAN PHASE A SIN DESVIACIÓN

**Fecha original:** 2026-07-04  
**Actualización prevalente:** 2026-08-06  
**Estado:** `C6_LIVE_HR_RUN_REGISTRATION_PROVEN__V2_V3_CANCELLED_BEFORE_STEPS__PROVIDER_READS_0_PROVEN__DIAGNOSTIC_LOOP_CLOSED__IDENTITY_HOLD_0__NO_PRODUCTION`

## 1. Objetivo operativo

Cerrar una única baseline acumulativa sobre `docs-tya-v6-v71-audit` y llevar Phase A a producción sin reabrir módulos preservados, crear carriles paralelos ni sustituir HR viva por snapshots o datos fijados.

## 2. Preservado

- frontend acumulativo y navegación multirol;
- Dashboard, Histórico, Visitas, Postulaciones y Reservas;
- Finanzas, Liquidaciones, Portales y reportes;
- `CX.data`, Firebase DEV, Auth/RBAC y contratos;
- multi-tenant, multi-proyecto y Cinépolis configurable;
- Academia y composición canónica única;
- PR #7 draft/open/no merge.

## 3. Identidades Shopper

```text
profiles=340
crosswalk=101/8 PASS
reference/planner=65/65 exact match
CREATE_AUTH=81
UPDATE_AUTH=46
NO_OP=73
HOLD=0
PRESERVE_NO_AUTH=140
```

SKIP13 permanece cerrado con historia preservada.

## 4. Causa raíz del control-plane HR

Los requests v2 y v3 sí produjeron runs. Los dos jobs fueron cancelados antes de ejecutar cualquier step:

```text
v2 run=31117638647 job=92671263961 cancelled steps=0 providerReads=0 PROVEN
v3 run=31123402722 job=92688738677 cancelled steps=0 providerReads=0 PROVEN
```

Por tanto quedan cerradas las dudas sobre registro del workflow, trigger `push`, rama y path. La ausencia del status inicial no significaba ausencia de run: ese status depende de un runner que nunca empezó a ejecutar steps.

Se agregó un clasificador determinístico de run/job/steps para impedir que esta falsa inferencia vuelva a generar rondas de autorización.

## 5. Cadena única restante

### Bloque A — Una lectura HR viva

Con autorización fresca separada:

1. emitir un único request ligado al HEAD exacto;
2. observar run, job, steps y journal;
3. confirmar metadata/autodiscovery;
4. confirmar `2026-08`, tabs GT/HN y conteos vivos;
5. validar mutación histórica y `sourceRevision` transversal;
6. cero writes, deploy, merge o producción.

No se reabre el diagnóstico de reconocimiento de GitHub Actions. Si el job vuelve a cancelar con cero steps, se clasifica de inmediato y se detiene sin nuevas rondas metodológicas.

### Bloque B — Auth y validación acumulativa

1. Materializar plan Auth SKIP13 con `HOLD=0`.
2. Ejecutar únicamente con autorización separada, snapshot, idempotencia, readback y rollback.
3. Smoke Admin/Operaciones, Shopper y Cliente.
4. Tres recargas, nueva pestaña y estabilidad.

### Bloque C — Cutover

Source lock, rollback probado, smoke integral, autorización específica y único cutover.

## 6. Circuit breakers

- No reabrir SKIP13 o 65/65.
- No volver a interpretar ausencia de status como ausencia de run.
- No pedir nueva candidata, rama o PR.
- No ejecutar Auth sin gate separado.
- No hardcodear periodos o conteos HR.
- No repetir import histórico por conteo.
- No convertir la anotación externa no recuperada en otra cadena de diagnóstico previa a la siguiente lectura.

## 7. Estado seguro

```text
nuevo trigger=0
provider reads del bloque=0
provider writes=0
Auth/data/HR writes=0
Hosting/Cloud Run deploys=0
merge=false
production=false
```
