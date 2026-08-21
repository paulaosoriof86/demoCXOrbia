# CAMBIOS-BACKEND.md

**Fecha:** 2026-08-21  
**SYNC_EPOCH de producto:** `CXORBIA-20260821-I5-G2B-FORENSIC-PROVIDER-LANE-READY-50`  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## 2026-08-21 — RC15 F0 · TRAMO 5: LEGACY LINKS, PROVIDER READERS Y CANONICAL STATE WRITERS

### Qué se hizo
- Se resolvió el HEAD vivo y se verificó que el master plan continúa congelado: Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, fase `F0_SYSTEMIC_AUDIT`, `providerMutationAuthorizedNow=false`.
- Se continuó el inventario sobre carriles de credenciales, materialization read-only, identidad shopper, legacy refresh, profile handoffs, canonical backend probes e inventarios.
- La matriz RC15 avanzó de **44 a 68 hallazgos clasificados**.
- Los HOLD confirmados avanzaron de **9 a 18**. No representa regresión de producto: son superficies históricas latentes que F0 está haciendo visibles antes de tocar proveedor.

### Nuevos HOLD de causa raíz
- `RC15-CP-045` — **HOLD**: C6 hold-profile conserva request `enabled=true/consumed=false` que declara `providerReadsAuthorizedMax=0`, pero el workflow no hace cumplir ese budget y puede leer provider, consumir request y hacer commit de evidence. Es un desajuste interno de autorización + writer de estado.
- `RC15-CP-055` — **HOLD**: remaining-shopper identity conserva request histórico activo y el script asociado hace `fetch` directo al RTDB `tya-plataforma`, además de leer HR/canonical y publicar evidence. Esto contradice el contrato vigente: legacy solo mediante export/import controlado, nunca conexión directa a la base vieja.
- `RC15-CP-056` — **HOLD**: visit identity crosswalk mantiene request `enabled=true` sin semántica terminal; provider-read + writer de evidence al tocar el request.
- `RC15-CP-058` — **HOLD**: live-HR provider capability preflight se dispara por cambios en varios workflow/tool paths, hace provider forensic reads y luego commit/push de evidence, pero **no valida ni consume el request histórico** y tampoco consulta primero el continuity lock. Es un bypass de autoridad demostrado.
- `RC15-CP-059` — **HOLD**: legacy shoppers/certifications refresh conserva request `enabled=true`, conecta directamente `https://tya-plataforma-default-rtdb.firebaseio.com` y hace commit de evidence. Debe quedar inertizado y el acceso legacy directo debe prohibirse estructuralmente.
- `RC15-CP-063` — **HOLD**: profile-extra conserva `enabled=true/consumed=false`; la llegada del bundle cifrado puede activar provider-read + consumo de request + commit/push.
- `RC15-CP-066` — **HOLD**: canonical backend anomaly probe mantiene request `enabled=true`; lee provider y publica evidence canónico.
- `RC15-CP-067` — **HOLD**: canonical backend Phase A gap mantiene request `enabled=true`; es writer repetible de evidence aunque no llame provider.
- `RC15-CP-068` — **HOLD**: canonical backend readonly inventory mantiene request `enabled=true`; lee provider/Auth readiness y publica evidence canónico.

### Carriles adicionales demostrados seguros/fail-closed
- Credential handoff key y encrypted dry-run: requests consumidos/disabled; no replay actual.
- R16C source alignment, R16/R16E provider compare y R16D financial plan: `contents:read`, read-only/offline/artifacts-only.
- `cxorbia-c6-live-domain-readonly-audit.yml`: nombre histórico engañoso — sí contenía un Hosting deploy real; el request actual está `enabled=false/consumed=true/STOP_RETRY`, por lo que hoy falla cerrado.
- Credential continuity, auth mapping, full-profile V2 e identity bridge V3: requests consumidos y fail-closed.
- M10 final smoke: artifact `enabled=true` pero source-bound a parent antiguo y exact-one-file; hoy falla cerrado antes de provider read.
- I4A consumed guard y offline credential tool gate: read-only/inertes.
- Corte4 Firebase project identity probe: provider-read only, `contents:read`, artifacts/status/comment only; queda para política F1, no es HOLD write-capable.

### Causa raíz — precisión de mecanismo
El defecto sistémico ya no es solo “quedaron workflows viejos”. F0 demuestra cuatro fallas de gobierno que explican el bucle: (1) terminalización heterogénea de autoridad histórica provider/source/state; (2) carriles llamados read-only que sí mutan estado canónico del repo; (3) al menos un workflow de provider-read que no hace cumplir su propio request/continuity authority; y (4) rutas históricas que todavía conectan directamente la base legacy pese al contrato export/import-only. F1 debe tombstonear todas estas autoridades juntas; F2 debe imponer master plan + continuity lock + consumed ledger antes de provider access, legacy access o repository-state mutation.

### Incidente de herramienta documentado
Durante este tramo se creó accidentalmente un archivo inerte `dummy` mediante el conector y se eliminó inmediatamente en el siguiente commit. La comparación `d38953e1...01607dc2` devuelve `files=[]`: el árbol final volvió exactamente al estado anterior. No hubo provider/data/deploy side effects. Se registra porque ninguna mutación fallida o accidental debe ocultarse.

### Seguridad
Provider writes=0; Cloud Build=0; Cloud Run deploy=0; Hosting deploy=0; Firestore/Auth/Storage/HR/Rules/pagos/Make/Gemini writes=0; recovery=0; synthetic stage=0; merge=false. Las únicas mutaciones del bloque son documentación/control-plane y el incidente inerte ya revertido sin delta neto.

### Clasificación
- **Reusable CXOrbia:** enforcement de autoridad previa a reads/writes, tombstone histórico, prohibición estructural de legacy live connectivity.
- **Exclusivo TyA:** requests/workflows históricos sobre `tya-plataforma`, HR y Firebase DEV TyA.
- **Claude/prototipo:** sin cambio UI, `/app/modules` ni `/app/core`.
- **Academia:** sin cambio funcional; requisito transversal preservado.
- **Sin impacto Claude:** auditoría/control-plane/evidence/docs.

### Siguiente
Continuar F0 sobre las superficies restantes hasta poder probar `allWorkflowsClassified`, `allRequestsClassified`, `allWorkflowDispatchClassified` y `allProviderWriteEntrypointsClassified=true`. No iniciar F1 parcialmente y no tocar G2-B todavía.

## 2026-08-21 — RC15 F0 · TRAMO 4: SOURCE WRITERS, PREFLIGHTS READ-ONLY Y CARRILES CONGELADOS

### Qué se hizo
- Se resolvió nuevamente el HEAD vivo antes de mutar: `05c5f3618ee2ef12cf46619f2858924f4d046244`; PR #7 seguía draft/open/unmerged.
- Se replicó la validación del master plan congelado: Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`, SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`, fase `F0_SYSTEMIC_AUDIT`, `providerMutationAuthorizedNow=false`.
- Se enumeró el árbol real `.github/workflows` desde el tree vivo y se continuó la clasificación sobre workflows aún no cubiertos.
- La matriz RC15 avanzó de **27 a 44 hallazgos clasificados**.
- Se clasificaron source writers históricos, revalidaciones postdeploy, reconciliación HR, materialization-plan/read-only workflows, source-safe import validators, preflights Corte4 y varios workflows retirados/frozen.

### Nuevos HOLD de causa raíz
- `RC15-CP-028` — **HOLD**: `cxorbia-c6-shopper-deterministic-suffix-crosswalk-rootfix-source-only.yml` conserva un request histórico `enabled=true/consumed=false/authorized_execute_once`. Aunque hoy falla por `targetHeadSha` antiguo y no toca provider, el workflow tiene `contents:write` y puede parchear fuente + commit/push si la autoridad vieja se revive mediante request. Es una superficie de **mutación de producto/fuente**.
- `RC15-CP-029` — **HOLD**: `cxorbia-corte6-postdeploy-readonly-revalidation.yml` conserva request `enabled=true/consumed=false`. Provider es read-only, pero el workflow puede consumir el request, escribir PASS/FAIL evidence y hacer push al branch; además cambios al workflow/request/tool son trigger paths. Es otra superficie de **drift de estado canónico**.
- `RC15-CP-030` — **HOLD**: `cxorbia-canonical-plan-refresh-offline.yml` tiene request histórico `enabled=true` sin semántica terminal de consumo. No llama provider, pero puede regenerar y hacer push repetidamente de evidence/planes canónicos al tocar el request.
- `RC15-CP-031` — **HOLD**: `cxorbia-live-hr-current-reconcile.yml` conserva request `enabled=true/consumed=false`; hoy el `sourceCommit` antiguo lo hace fallar cerrado, pero conserva autoridad histórica para provider-read + commit de registry/evidence si se reactiva. No consulta primero el continuity lock RC15.

Los HOLD confirmados pasan de **5 a 9**. El patrón sistémico ya cubre tres planos de mutación histórica: **provider**, **estado/evidence canónico** y **fuente/producto**.

### Superficies clasificadas como seguras/inertes en este tramo
- `cxorbia-phase-a-live-checkpoint.yml`: validator, `contents:read`, sin provider/repo write.
- `cxorbia-phase-a-r18a-canonical-assets-integration.yml`: build/source/browser validation local, `contents:read`, sin push/provider write.
- `cxorbia-phase-a-live-hr-runtime-predeploy.yml`: provider-read predeploy, `contents:read`, sin deploy ni push.
- `cxorbia-phase-a-firestore-materialization-plan.yml`: genera plan solo en artifacts, sin materialización Firestore.
- `cxorbia-phase-a-source-safe-importers.yml`: valida importadores/fixtures, no importa al provider.
- Corte4 provider-credential preflight y bootstrap preflight: requests históricos siguen activos, pero los contratos auditados son provider-calls=0 o provider-read-only; solo statuses/comments. Se revisarán en F1 por política de inertización histórica.
- Cinco workflows C6 retirados/frozen quedaron comprobados como `echo`/sin implementación ejecutable sensible.
- C6 Human Login Shopper Identity Audit quedó fail-closed por request `enabled=false/consumed=true/allowedExecutions=0`.

### Causa raíz — precisión nueva
La evidencia ya no apunta únicamente a “workflows viejos”. El defecto metodológico estructural es que **la terminación histórica no fue homogénea entre provider-authority, repository/source-authority y canonical-state-authority**. Algunas rutas fueron correctamente consumidas o congeladas; otras conservaron `enabled=true`, autorización vieja o capacidad de commit/push. F1 debe tombstonear todo el residuo en un único bloque y F2 debe impedir que cualquier ejecutor actúe sin master plan + continuity lock + consumed ledger vigentes.

### Seguridad
Provider writes=0; Cloud Build=0; Cloud Run deploy=0; Hosting deploy=0; Firestore/Auth/Storage/HR/Rules/pagos/Make/Gemini writes=0; recovery=0; synthetic stage=0; merge=false.

### Clasificación
- **Reusable CXOrbia:** taxonomía provider/state/source authority, inertización histórica y binding canónico único.
- **Exclusivo TyA:** requests y workflows Corte4/Corte6/HR históricos del tenant TyA.
- **Claude/prototipo:** sin cambio UI, `/app/modules` ni `/app/core`.
- **Academia:** sin cambio funcional; requisito transversal preservado.
- **Sin impacto Claude:** auditoría/control-plane/evidence/docs.

### Siguiente
Continuar F0 con los workflows/requests restantes, especialmente todo `workflow_dispatch`, provider/source writers y writers de estado canónico aún no clasificados. F1 no inicia hasta demostrar exhaustividad.

## 2026-08-21 — RC15 F0 · TRAMO 3: PROVIDER, DATA, HOSTING Y STATE WRITERS REPETIBLES

### Qué se hizo
- Se resolvió nuevamente el HEAD vivo antes de continuar: `c41f459728b613d3de3c71eb48fe08fd22030ab7`; PR #7 seguía draft/open/unmerged.
- Se mantuvo el master plan FROZEN y la prohibición de provider/data/deploy/recovery/synthetic writes durante F0.
- Se amplió la matriz RC15 de 18 a **27 hallazgos clasificados**.
- Se revisaron específicamente rutas históricas de Hosting, I4B synthetic writes, Firestore materialization, post-V96 source empalme, postdeploy read-only y verificadores Corte4.

### Hallazgo nuevo que profundiza la causa raíz
`RC15-CP-025` queda **HOLD**: `.github/workflows/cxorbia-c6-p0-postdeploy-readonly-recheck.yml` es manualmente despachable y, aunque no escribe proveedor/datos, acepta artefactos ya consumidos y puede volver a modificar request/execute/evidence en la rama viva. Esto demuestra una segunda clase del problema: además de autoridad histórica capaz de escribir proveedor, existen writers históricos repetibles capaces de cambiar el **estado canónico** sin consultar primero el continuity lock vigente.

Los HOLD vigentes confirmados ascienden a **5**:
1. `RC15-CP-005` — Corte4 bootstrap, `enabled=true` + `providerConfigWrites=true`.
2. `RC15-CP-011` — Corte4 protected smoke, `enabled=true`, configuración Auth + usuario temporal.
3. `RC15-CP-014` — G2-B synthetic preflight con snapshot histórico `enabled=true/consumed=false` capaz de alterar state/evidence.
4. `RC15-CP-017` — R24 Corte4 new-empty con `projectCreate=true` + `firebaseAdd=true`.
5. `RC15-CP-025` — C6 postdeploy read-only recheck repetible capaz de reescribir estado/evidence canónico.

### Superficies peligrosas ya demostradas fail-closed
- R15G Hosting postdeploy: one-shot consumido; no nuevo deploy.
- Corte6 cumulative Hosting: request + execute `enabled=false/consumed=true`, deploy ya consumido.
- I4B synthetic lifecycle: request Retry2 consumido PASS; workflows Retry1 ya no satisfacen contrato y fallan antes del proveedor.
- I3 exact Shopper write: request consumido/STOP_RETRY.
- Corte6 profile Firestore V2: request consumido PASS y autorización de writes revocada.
- Firestore materialization multi-job: requests Legal V0.4, I3.5B e I3.5C-2 todos consumidos; manual dispatch es validation-only.
- Gate read-only actual: consumido y no replay.

### Causa raíz — estado actual
Ya no se trata de perseguir síntomas separados. RC15 está demostrando un patrón único: **artefactos y triggers históricos sobrevivieron más allá de su uso terminal con semánticas de autoridad heterogéneas**. Algunos fallan cerrados correctamente; otros todavía quedan materialmente invocables. F1 eliminará/inertizará el residuo completo en un solo bloque y F2 obligará a los ejecutores restantes a consultar una autoridad canónica única antes de cualquier acceso sensible.

### Seguridad
Provider writes=0; Cloud Build=0; Cloud Run deploy=0; Hosting deploy=0; Firestore/Auth/Storage/HR/Rules/pagos/Make/Gemini writes=0; recovery=0; synthetic stage=0; merge=false.

### Clasificación
- **Reusable CXOrbia:** modelo de autoridad terminal, inventario de triggers, inertización histórica F1 y binding único F2.
- **Exclusivo TyA:** targets/requests Corte4, Corte6, I3/I4B y G2-B del tenant TyA.
- **Claude/prototipo:** sin cambio UI, `/app/modules` ni `/app/core`.
- **Academia:** sin cambio funcional; requisito transversal preservado.
- **Sin impacto Claude:** workflows/control-plane/evidence/docs.

### Siguiente
Continuar F0 sobre las superficies restantes hasta que `allWorkflowsClassified`, `allRequestsClassified`, `allWorkflowDispatchClassified` y `allProviderWriteEntrypointsClassified` puedan pasar a true con evidencia. No ejecutar F1 parcialmente y no tocar G2-B todavía.

## 2026-08-21 — RC15 F0 · EXPANSIÓN FORENSE DE SUPERFICIES WRITE-CAPABLE

### Qué se hizo
- Se revalidó la identidad del plan maestro congelado contra Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`, lock F0 y `providerMutationAuthorizedNow=false`.
- Se amplió `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json` de 5 a 18 hallazgos clasificados.
- Se auditaron rutas activables por `workflow_dispatch`, `push` y `pull_request synchronize`, requests históricos, execute markers, permisos y consumo one-shot.
- Se confirmó que varias rutas históricas sí están correctamente cerradas por `enabled=false` + `consumed=true`, incluyendo I3 visible-login, C6 client materialization, R3-C Hosting, Corte6 Auth/RBAC, Corte6 session-continuity Hosting y credential import.

### Nuevos hallazgos de causa raíz
- `RC15-CP-011` — **HOLD**: `cxorbia-corte4-protected-smoke-temp-operator.yml` conserva `workflow_dispatch`/push y su request histórico sigue `enabled=true`; permite toggle de Email/Password y crear/claim/delete un usuario Auth temporal.
- `RC15-CP-014` — **HOLD**: el request histórico G2-B synthetic permanece `enabled=true`, `consumed=false`. Su preflight actual no hace provider writes, pero sí puede consumir el snapshot y alterar evidencia/estado canónico del branch sin consultar primero el continuity lock vigente.
- `RC15-CP-017` — **HOLD**: `cxorbia-r24-new-empty-firebase-dev.yml` conserva `workflow_dispatch`/push y `corte4-new-empty.json` sigue `enabled=true` con `projectCreate=true` y `firebaseAdd=true`; es una superficie histórica capaz de intentar creación de proyecto/Firebase.
- Se mantiene `RC15-CP-005` — **HOLD** previamente confirmado: bootstrap Corte4 con `workflow_dispatch` + `enabled=true` + `providerConfigWrites=true`.

Esto demuestra que la causa del bucle no era únicamente el antiguo `job-level if` de G2-B. Persistieron múltiples superficies históricas con autoridad vieja aún materializada. RC15 está identificando ese problema como sistema para cerrarlo de una sola vez en F1/F2, antes de volver a tocar proveedor.

### Nota de continuidad
Se produjo previamente el commit `ce93b44b41adb4383d416b4db498e17105f1a418` como checkpoint readback del evidence F0 sin cambio de contenido. No produjo provider/data/deploy writes ni cambia el estado formal. El avance material de esta ronda comienza con la ampliación de la matriz RC15 posterior a ese checkpoint.

### Seguridad
- Provider writes: 0.
- Cloud Build / Cloud Run / Hosting deploy: 0.
- Firestore / Auth / Storage / HR / Rules / pagos / Make / Gemini: 0.
- Recovery G2-B: 0.
- Synthetic stage: 0.
- Merge: false.

### Clasificación
- **Reusable CXOrbia:** inventario sistémico de superficies históricas, separación entre evento histórico y autoridad actual, futura inertización F1 y binding F2.
- **Exclusivo TyA:** requests/targets históricos Corte4, Corte6 y G2-B del tenant TyA.
- **Claude/prototipo:** sin cambio de UI, `/app/modules` ni `/app/core`.
- **Academia:** sin cambio funcional; requisito transversal preservado.
- **Sin impacto Claude:** auditoría de workflows, requests, control-plane y evidence.

### Siguiente
Continuar F0 hasta clasificar **todas** las superficies capaces de mutar proveedor, datos, producto o estado canónico. No se ejecuta F1 todavía y no se toca G2-B hasta que la matriz sea exhaustiva.

## 2026-08-21 — RC15 · CONGELAMIENTO DEL PLAN MAESTRO + INICIO AUDITORÍA SISTÉMICA

### Qué se hizo
- Se consolidó un único plan F0–F10 hacia producción y postproducción en `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`.
- El plan queda congelado con SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475` y Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.
- `cxorbia-phase-a-continuity-lock.json` incorpora `masterPlan`, fase/cursor y política `PLAN_CHANGE_REQUEST_ONLY_EXPLICIT_PAULA_ATOMIC`.
- Se agregó `tools/continuity/validate-cxorbia-master-plan-freeze.js`.
- Se creó `app/docs/evidence/RC15-MASTER-PLAN-FREEZE-LATEST.json`.
- Se inició F0 con `app/docs/evidence/RC15-SYSTEMIC-AUDIT-CONTROL-PLANE-LATEST.json`.

### Hallazgo inicial F0
`RC15-CP-005`: `.github/workflows/cxorbia-corte4-bootstrap-readonly-execute.yml` conserva `workflow_dispatch` y `.github/cxorbia-firebase-requests/corte4-bootstrap-execute.json` conserva `enabled=true` + `providerConfigWrites=true`. Es una superficie histórica write-capable latente. No fue disparada por este bloque. Debe quedar inertizada en F1, después de completar el inventario exhaustivo de F0.

### Seguridad
Este bloque es exclusivamente repo/control-plane/documentación: Cloud Build=0, Cloud Run deploy=0, Hosting deploy=0, Firestore/Auth/Storage/HR/payment/Rules/Make/Gemini writes=0, recovery=0, synthetic stage=0, merge=false.

### Clasificación
- **Reusable CXOrbia:** master-plan hash lock, change-control y auditoría exhaustiva de superficies.
- **Exclusivo TyA:** baseline G2-B y hallazgo histórico Corte4 dentro del repo TyA.
- **Claude/prototipo:** sin cambio de UI, `/app/modules` o `/app/core`.
- **Academia:** sin cambio funcional; sigue siendo requisito transversal del plan.
- **Sin impacto Claude:** control-plane, docs, validator y evidence.

### Siguiente
`F0_RC15_SYSTEMIC_AUDIT_CONTINUE`: ampliar el inventario a todos los workflows write-capable, `workflow_dispatch`, requests/execute markers, permisos, replay, concurrency y fan-out. Ninguna provider mutation antes del cierre de F0.
