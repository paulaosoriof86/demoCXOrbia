# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-14 14:00 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_RESET2_CONSUMED__HISTORICAL_AUTH_REACHED__NAV_GATE_STOP_RETRY__LEGAL_GATE_AWARE_HARNESS_PASS__GO_LIVE_35__PROVIDER_GATE_REQUIRED`

## Autoridad vigente

- Auditoría forense: `app/docs/AUDITORIA-FORENSE-INTEGRAL-PREPRODUCCION-CXORBIA-TYA-20260814.md`
- Plan durable actualizado: `app/docs/ADDENDUM-MAESTRO-PLAN-CORRECCION-RAIZ-GO-LIVE-Y-DURABILIDAD-CXORBIA-TYA-VIGENTE.md`
- I2 PASS: `app/docs/SOURCE-LOCK-ITERATION2-CANONICAL-PERSISTENCE-PASS-20260814.md`
- I3 pointer blocker histórico/cerrado: `app/docs/SOURCE-LOCK-ITERATION3-STOP-RETRY-POST-CREDENTIAL-RECOVERY-ADMIN-LOGIN-POINTER-20260814.md`
- I3 harness durability PASS: `app/docs/SOURCE-LOCK-ITERATION3-HARNESS-DURABILITY-PASS-20260814.md`
- I3 legal-gate-aware harness PASS: `app/docs/SOURCE-LOCK-ITERATION3-HISTORICAL-LEGAL-GATE-AWARE-HARNESS-PASS-20260814.md`
- Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`

No volver a diagnóstico general, nueva candidata, rama/PR ni Auth rebuild.

## Repo / rama / PR

- Repo: `paulaosoriof86/demoCXOrbia`
- Candidata única: `docs-tya-v6-v71-audit`
- PR #7: draft/open/no merge
- Base: `release/cxorbia-tya-rc-20260630`

## I1 / I2 — cerradas

I1 PASS 15/15. I2 PASS 20/20. No reprocesar Firebase Auth owner, exact identity, Staff membership, HR live/protected overlay, cumulative read model, `CX.data` command boundary, provider ACK, Mis Visitas arrays/facets/ACK ni firewall fail-closed.

## I3 — último provider run consumido

Run `31835742956`, job `94881540163`.

La autorización durable `cxorbia-i3-shopper-persistence-20260814-03` se consumió una única vez.

PASS alcanzados antes del STOP_RETRY:

- checkout exacto del SHA de evento;
- mismo único Shopper histórico exacto;
- un credential reset exacto autorizado;
- UID/claims/shopperId/profile/history preservados;
- otras identidades modificadas `0`;
- membership/crosswalk reconciliation PASS;
- proxy del source exacto PASS;
- login Firebase Shopper avanzó hasta contexto autenticado exacto;
- `CX_PROTECTED_AUTH_HR_AUTHORITY.applied===true` fue alcanzado.

STOP_RETRY:

`tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` agotó 15 s esperando que `#nav-aprendizaje` fuera visible. El flujo Admin/new Shopper no comenzó; provider de comandos, alta/edición, readback y login del nuevo Shopper quedaron SKIPPED.

El checkpoint histórico no fue materializado (`historicalLoginCheckpointPassed=false`) porque el harness exigía las rutas antes de declarar PASS del subgate.

## Causa de contrato source localizada

`CX.app.enter()` no garantiza que `CX.router.mount()` ocurra inmediatamente después de Auth: si `CX.confidencialidad.pending(CX.session.role)` está activo, el producto muestra primero el gate legal y monta el workspace solo después de la aceptación humana.

El E2E histórico no conocía ese gate y exigía siempre `#nav-aprendizaje` / `#nav-cert` antes de cerrar Auth/HR/historia. Eso hacía posible un falso negativo de navegación aunque identidad y autoridad ya hubieran sido alcanzadas.

No se afirma que el run fallido haya confirmado visualmente un NDA pendiente — el run no capturó ese estado. Lo probado es el conflicto de contrato source: el producto puede diferir el router y el harness no lo contemplaba.

## Corrección source-only cerrada

`tools/qa/cxorbia-p0-shopper-real-auth-e2e.mjs` fue corregido para:

1. validar y fallar/cerrar primero el subgate de Auth exacto + identity + reviewQueue + HR authority + historia;
2. consultar después `CX.confidencialidad.pending('shopper')`;
3. si está pendiente, exigir contrato y diálogo legal visible, preservar el principal y marcar `workspaceState=legal-gate-pending`;
4. diferir Academia/Certificación sin declararlas PASS;
5. si no está pendiente, mantener Academia/Certificación obligatorias;
6. nunca aceptar/firmar/guardar el NDA automáticamente;
7. cero force-click y cero write APIs.

Gate source: `PASS_I3_HISTORICAL_LEGAL_GATE_AWARE_SOURCE` + `node --check` PASS.

## Seguridad

En el provider run consumido:

- un password reset exacto del mismo Shopper histórico;
- otras identidades `0`;
- membership/crosswalk reconciliation PASS;
- Shopper nuevo `NO`;
- Admin/new Shopper `NO EJECUTADO`;
- HR/Rules/Storage/Make/Gemini/pagos `0`;
- deploy `0`; merge=false; production=false;
- no automatic retry.

Después del run: únicamente source/docs, cero nuevos provider writes.

## Porcentaje

**35% completado / 65% pendiente.** I3 mantiene 0/25 hasta cierre completo.

## Siguiente gate exacto

`PAULA_REVIEW_REQUIRED_FOR_I3_LEGAL_GATE_AWARE_HISTORICAL_CHECKPOINT_AND_ADMIN_NEW_SHOPPER_RESUME`.

Una nueva autorización, si Paula decide darla, debe limitarse a un único reset adicional del mismo UID histórico exacto, validar inmediatamente Auth/HR/historia con el harness legal-gate-aware y congelar el checkpoint sanitizado antes de continuar con Admin/new Shopper. Cero aceptación legal automatizada, otras identidades, fuzzy matching, providers prohibidos, deploy, merge o producción.
