# ADDENDUM MAESTRO — PLAN UNIFICADO PHASE A · NO DESVIACIÓN · CXORBIA TyA

**Plan original:** 2026-08-17  
**Última sincronización:** 2026-08-18 21:11 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-I4A-PROVIDER-HOLD-SYNC-20`  
**Estado:** `ACTIVO__PREVALENTE__I3_PASS_FROZEN__GO_LIVE_60__I4A_PROVIDER_HOLD_CONSUMED__DEDICATED_TEST_IDENTITY_AUTH_NEXT`

## 0. Regla

Continúa el mismo camino I1→I5. No reinicia metodología. Canonical State + Atomic Gate Close + circuit breaker prevalecen. Un resultado provider válido no depende de que GitHub logre publicar comentario/status.

## 1. Estado formal

Repo `paulaosoriof86/demoCXOrbia`; rama única `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; DEV `cxorbia-backend-dev`.

I1 `15/15 PASS`; I2 `20/20 PASS`; I3 `25/25 PASS FROZEN`; I4 `0/25 IN_PROGRESS_NOT_SCORED`; I5 `0/15 NOT_STARTED` = **60% completado / 40% pendiente**.

## 2. Frozen

I1/I2/I3 integral; Historical Shopper; TARGET_B Admin; Rules/Hosting/Staff final I3; HR `15/660`; Finance V2/historical; legal V0.4. No rerun/rebuild/reimport/reset salvo regresión nueva reproducible que invalide expresamente el PASS.

## 3. I4-A — Shopper lifecycle

Alcance: documentos/instrucciones; certificaciones históricas/nuevas; disponibles; postulación; asignación; perfiles/roles/scopes; notificaciones; histórico.

Ya probado en source/cierre previo: portal canónico Shopper read-only, membership/roles/scopes exactos fail-closed, contrato protegido de administración Shopper y autoridad de postulación/asignación proveniente de I3.

La búsqueda de una identidad test/no histórica desde evidencia congelada quedó agotada. Luego la lectura provider/Auth autorizada run `32208829234` inspeccionó metadata/custom claims: `232` principals, `211` Shopper y `0` candidatos con provenance explícita segura. Decisión `HOLD_I4A_TEST_SHOPPER_IDENTITY_NOT_PROVEN__PROVIDER_READONLY_NO_LOGIN`.

El fallo de publicación de comentario PR ocurrió después de la clasificación y no la invalida. La lectura provider queda consumida y no se repite.

### I4-A — siguiente secuencia

1. `NEW_AUTH_REQUIRED_I4A_CREATE_DEDICATED_NONHISTORICAL_DEV_TEST_SHOPPER__PROTECTED_CONTRACT_NO_LOGIN`: crear una sola identidad DEV sintética/no histórica con tenant/proyecto/role/membership/provenance explícitos. Sin login, HR, shoppers históricos, deploy, merge o producción.
2. Tras PASS de creación: `NEW_AUTH_REQUIRED_I4A_SINGLE_VISIBLE_DEV_SHOPPER_LIFECYCLE_SMOKE`: una sola observación visible DEV usando exclusivamente esa identidad; validar documentos/instrucciones, disponibles, estado/control de postulación, notificaciones y superficie de certificación nueva. Las acciones mutantes adicionales solo se abren si son indispensables para cerrar evidencia y con gate explícito.
3. Cerrar I4-A sin reauditar lo ya probado.

## 4. I4-B — visita

Agenda; reprogramación; cancelación; ventanas/reglas; ejecución; evidencias; cuestionario; submit; review/auditoría; estados dinámicos. Primero se reutiliza evidencia/implementación existente; solo se corrige defecto reproducible.

## 5. I4-C — HR bidireccional

Plataforma→HR y HR→Plataforma con `tenantId`, `projectId`, `visitId/hrRowId`, `shopperId`, `assignmentSource`, `assignmentSyncStatus`, `lastSyncedAt`; no duplicación; conflictos a revisión. Make solo bajo gate.

## 6. I4-D — Finanzas

Histórico preservado; liquidaciones; pagos; junio real; honorarios/reembolsos configurables; trazabilidad tenant/proyecto/visita/shopper. No reconstruir Finance V2 ya frozen.

## 7. I4-E — multi-proyecto/no-code

País/moneda/timezone/locale; source + mapping; cuestionario/provider/link; documentos/reglas/certificación; agenda; pagos; roles/notificaciones; integraciones; privacidad/evidencias. Cinépolis es proyecto normal, nunca lógica global.

## 8. I4-F — Academia

Cursos/manuales/rutas/notificaciones/instrucciones/certificaciones se actualizan junto con cada comportamiento operacional visible. No declarar cambio académico por un gate interno sin efecto visible.

## 9. I5 — producción

Freeze sin P0 → SHA/manifest/build-lock/verifier → preproducción → rollback → same-build E2E → revisión P0/P1/P2 → autorización expresa de Paula → cutover → smoke → baseline productivo.

## 10. Control de avance

El 60% es el porcentaje formal y no se infla. Para evitar la falsa sensación de inmovilidad, cada cierre reportará además el subbloque I4 exacto cerrado/pendiente, sin convertir preparación documental en puntos Phase A.

## 11. Circuit breaker definitivo

- `SYNC_EPOCH` único para documentos canónicos y evidencia vigente.
- Gate ejecutado se sincroniza antes del siguiente gate.
- Artifact/resultado operativo manda sobre un fallo posterior de comentario/status.
- Provider consumido no se reintenta por `PIPELINE_MECHANISM_FAILURE`.
- Verifier PASS obligatorio antes de avanzar.
- Dos repeticiones sin reducción causal => `FORENSIC_STOP`.

## 12. Definition of Done por bloque

Objetivo/resultado reproducible, efectos provider, safety, proven/disproven/unknown, clasificación reusable/tenant/project, impacto Claude/Academia, documentación canónica sincronizada, verifier PASS y un único siguiente bloque exacto.
