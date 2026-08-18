# SOURCE LOCK CXORBIA TyA — ESTABLE Y VIGENTE

**Última sincronización:** 2026-08-18 11:51 -06:00  
**SYNC_EPOCH:** `CXORBIA-20260818-ROOT-CAUSE-RECOVERY-01`  
**Estado:** `LOCKED__I3_11C_IDENTITY_LINK_APPLICABILITY_HOLD__NO_REPROCESS__NO_PRODUCTION`

## Propósito

Este archivo reemplaza el patrón de usar un source lock fechado como puntero operativo. A partir de este sync, **este nombre estable** es el source lock operativo. Los source locks fechados permanecen como evidencia histórica y quedan `SUPERSEDED_DO_NOT_EXECUTE`, salvo activación explícita desde `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

## Identidad del carril

- repo: `paulaosoriof86/demoCXOrbia`
- rama viva: `docs-tya-v6-v71-audit`
- PR: `#7` draft/open/no merge
- base: `release/cxorbia-tya-rc-20260630`
- DEV: `cxorbia-backend-dev`
- último HEAD técnico/evidencia previo al sync: `528d5f0ba51e9712fee79ca0025b3dbcdf74e163`
- canonical state: `app/docs/CXORBIA-EXECUTION-STATE.json`
- plan vigente: `app/docs/ADDENDUM-MAESTRO-PLAN-UNIFICADO-PHASE-A-NO-DESVIACION-CXORBIA-TYA-20260817.md`

## Estado congelado

Formal **35% / 65%**. I3 integral sigue 0/25 hasta PASS; I3 integral PASS lleva a 60%.

No reprocesar:
- I1/I2;
- I3.1→I3.8;
- I3.9/I3.10, congelados PASS;
- Historical Shopper run `31906391682`;
- TARGET_B Admin existente/PASS: no recrear;
- request08;
- I3.5B/I3.5C-2/I3.8;
- HR 15 períodos / 660 visitas: no reimport;
- Finance V2/historical: no rebuild;
- legal V0.4 durable: no autoaccept;
- Rules I3.11C run `32163552089`: PASS/verificado/consumido, no redeploy por la causa cerrada.

## Único blocker vivo

`I3_11C_EXPECTED_PROVIDER_LINK_NOT_IN_APPLICABLE_RUNTIME_SET`

Target:
- source/live shopper: `shp-57d2e3769946`;
- canonical esperado: `TYA_GT_0C0BA8856E`;
- prior link probado: `irl_3ed1b9a65d36c5873c1306bae1621e9d`;
- links provider aplicables globales actuales: `1`;
- links aplicables target: `0`;
- canonical actual: `null`;
- agosto canonical: `0`;
- agosto residual live: `2`.

Evidencia principal: `app/docs/evidence/I3-11C-STAFF-READONLY-CLOSE-LATEST.json`.

La causa actual **no** es Rules DEV, ausencia de Admin/Staff, membership Staff, bridge provider ni readiness amplio. Falta adjudicar si el link target fue eliminado, desactivado, re-scopeado, mutado o quedó intacto pero no aplicable.

## Frontera exacta

`NEW_AUTH_REQUIRED_FOCAL_PROVIDER_IDENTITY_LINK_READONLY_ADJUDICATION_NO_WRITES`

No se ejecuta sin autorización exacta nueva. Alcance permitido cuando exista dicha autorización:
- leer focalmente el prior target link y el único link aplicable actual;
- clasificar su estado y producir evidencia reproducible;
- writes `0` en Auth, usuarios, passwords, claims, Firestore data, Rules, HR, Storage, Make, Gemini y pagos;
- deploys Hosting/Cloud Run/Rules `0`;
- Historical Shopper access `0`;
- merge/production `false`;
- retry automático `false`.

## Circuit breaker de bucle

1. Ningún PASS consumido se vuelve a ejecutar salvo regresión nueva, reproducible y que invalide explícitamente ese PASS.
2. Cada intento debe registrar `proven`, `disproven`, `unknown` y cómo redujo el espacio causal.
3. Si el mismo blocker reaparece dos veces sin nueva evidencia que lo estreche, se activa `FORENSIC_STOP`; se prohíbe un tercer retry de la misma forma.
4. Si evidencia/HEAD y documentación canónica no coinciden, el estado obligatorio es `SOURCE_TRUTH_MISMATCH__STOP_TECHNICAL_EXECUTION`.
5. Si un gate se ejecutó pero no se sincronizaron todas las fuentes canónicas, queda `EXECUTED_UNSYNCED_DO_NOT_ADVANCE`.

## Atomic Gate Close — regla obligatoria y duradera

Un gate no está cerrado para continuidad solo porque el proveedor devolvió PASS. El cierre continuable exige, dentro del mismo bloque:

1. evidencia sanitizada;
2. `CXORBIA-EXECUTION-STATE.json`;
3. índice vigente;
4. este source lock;
5. checkpoint vigente;
6. `CAMBIOS-BACKEND.md`;
7. `RESUMEN-PARA-CLAUDE.md`;
8. `PENDIENTES-PROTOTIPO.md`;
9. PR #7 body;
10. verificación de sincronización.

Los nueve puntos documentales deben compartir el mismo `SYNC_EPOCH`. Si falta uno, no se abre el siguiente gate.

## Antidesvío de producto

- TyA = primer tenant de validación, no arquitectura global.
- Cinépolis = primer proyecto configurable, no condición global.
- `tenantId` y `projectId` obligatorios.
- Identidad/deduplicación exacta; jamás por coincidencia visual/nombre/email únicamente.
- CX.data conserva exactamente su interfaz; backend no rediseña módulos.
- No-code/comercializable: nuevas operaciones deben expresarse como configuración/adapters reusable antes que hardcode tenant/project.
- Alta futura de proyecto: `configurar source → mapping → dry-run → validate → activate`.
- Toda mejora se clasifica como `Reusable CXOrbia`, `Exclusivo tenant`, `Exclusivo proyecto`, `Claude/prototipo`, `Academia` y/o `Sin impacto Claude`.

## Empalme frontend

Para candidata auditada GO sin P0 demostrado, solo `APPLY_DELTA_DIRECTLY` sobre la rama viva, tras demostrar `EXECUTION_LANE_READY` en la misma sesión. Prohibido sustituirlo por nueva rama/PR/workflow/ZIP/incoming/copia manual/re-auditoría.

## Producción y continuidad posterior

El go-live no invalida este lock. I5 creará/fijará un baseline productivo por SHA/manifest/build-lock/verificador. Después de producción, cada cambio sigue usando canonical state + atomic gate close + source truth verifier antes de avanzar al siguiente bloque.
