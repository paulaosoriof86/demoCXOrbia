# GO-LIVE PROGRESS TRACKER — ROOT CAUSE · CXORBIA TyA

**Fecha de actualización:** 2026-08-17 13:01 -06:00  
**Método:** una iteración solo suma su peso cuando cierra integralmente PASS; subgates parciales no inflan el porcentaje. Un subgate PASS se congela y no se reprocesa.

| Iteración | Peso | Estado | Evidencia vigente |
|---|---:|---|---|
| I1 — Auth/authority/source correction | 15 | PASS 15/15 | Gate vigente conservado; NO REPROCESAR |
| I2 — canonical persistence/transversal | 20 | PASS 20/20 | `SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`; NO REPROCESAR |
| I3 — Shopper persistence + real Auth continuity | 25 | 0/25, EN CURSO | Histórico Shopper PASS congelado; TARGET_B Admin sign-in PASS; human login/legal UI ejecutado; authority/composition regression source fix aplicado; runtime validation pendiente |
| I4 — Phase A operational flows | 25 | 0/25, PENDIENTE | Activar después de cerrar los invariantes I3 sin repetir subgates; reutilizar HR/Finance/KPI ya construidos |
| I5 — final go-live validation | 15 | 0/15, PENDIENTE | exact build + preproducción + go-live bajo gates |

**GO-LIVE formal: 35% completado / 65% pendiente.** El porcentaje no refleja como puntos los subgates I3 ya cerrados hasta PASS integral; tampoco autoriza volver a ejecutarlos.

## I3 — congelado / no repetir

- Historical Shopper run `31906391682`: PASS, identidad exacta + membership + profile + crosswalk + historia E2E. Reset único consumido. Continuación `passwordResets=0`; no credential access/reconcile/recovery.
- Request08 `31909354336` / `95071998299`: consumido/no rerun.
- Bootstrap V0.4 y deploy legal anterior: consumidos/no retry.
- TARGET_B Admin run `32049054855`: Firebase password sign-in real PASS; Auth writes/passwordChanges/passwordResets `0`. Paula logró ingresar. No crear/rotar/reemplazar Admin.
- I1/I2: no repetir.

## Interacción humana legal

Paula informó que realizó la aceptación desde la UI y que el acuerdo apareció dos veces. La duplicidad queda P1 no bloqueante mientras no impida sesión/rutas. No automatizar aceptación. El receipt/provider readback durable de esa interacción todavía requiere evidencia antes de declararlo cerrado.

## Hallazgo de regresión actual — no es pérdida de candidata

La candidata viva conserva los adapters V2 canónicos de Shopper, Finance, cumulative read model, protected HR authority y state semantics. El hallazgo está en composición/compatibilidad:

- membership usa `cinepolis` como proyecto raíz/programa y helpers heredados lo comparaban contra IDs de periodo `cinepolis-YYYY-MM`, dejando selectores vacíos;
- HR live adapter generaba `hr-post-*` desde asignaciones y los contaminaba como postulaciones;
- HR viva = 660 visitas / 15 periodos hasta AGO 2026; protected overlay observado = 616; diferencia exacta = las 44 visitas de agosto. No reimportar ni reprocesar 616.

Source lock prevalente:
`SOURCE-LOCK-PHASE-A-CANONICAL-AUTHORITY-REGRESSION-ROOT-CAUSE-SOURCE-PASS-20260817.md`.

## Delta source-only aplicado

- `app/adapters/tya-phase-a-authority-compat-v1.js` — separa assignment/postulation y compatibiliza scope proyecto raíz/periodo.
- `app/index-backend-dev.html` — wiring antes de protected HR composition.
- commits base: `8a0fa58105644b81e3e27f59a98774b025fded1f`, `6594ef961177ede87dfabb0945f8dcc39c8920c8`.
- combined status observado para `6594ef...`: success en `cxorbia/c6-skip13-auth-access-adjudication/overall`.

Este delta **no está desplegado todavía**. No se declara corregido en navegador.

## Qué se reutiliza, no se reconstruye

- Shopper portal V2 + exact identity contract.
- Finance V2 + financial source-safe + historical payments.
- HR live all-periods.
- state semantics V2 y KPI estructurales ya verificados.
- Auth Admin/historical Shopper ya cerrados.

## Ruta crítica restante

1. `PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_NO_REPROCESS` sobre el mismo HEAD;
2. DEV deploy exacto solo bajo gate;
3. Proyecto + 15 periodos + agosto visible;
4. Postulaciones persistidas separadas de asignaciones HR;
5. `identityReviewQueue`/crosswalk exacto de agosto reutilizando identidades existentes, sin histórico reset/reconcile;
6. Mi Perfil/Histórico Shopper;
7. Finanzas mayo/junio/histórico existentes y aislamiento únicamente de fuente realmente faltante de agosto;
8. KPI derivados contra HR/state semantics;
9. Phase A E2E; luego I4/I5 sin volver a Auth Admin.

## Acción actual

`PHASE_A_AUTHORITY_COMPAT_RUNTIME_VALIDATION_NO_REPROCESS`.

No nueva candidata/rama/PR, no reimport HR, no reconstruir Shoppers/Finance, no merge/producción sin gate.
