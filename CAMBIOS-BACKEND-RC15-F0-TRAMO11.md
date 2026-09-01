# CAMBIOS-BACKEND — RC15 F0 TRAMO 11 · RUNTIME DESPLEGADO + WRITERS HISTÓRICOS DE SOURCE

**Fecha:** 2026-08-22  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Resultado medible

Se continuó F0 exclusivamente en lectura/auditoría/documentación. El avance de este tramo es:

- hallazgos clasificados: **119 → 125**;
- HOLD/P0 descubiertos acumulativamente: **26 → 28**;
- contenidos: CP093 + CP119 = **2**;
- HOLD/P0 residuales: **24 → 26**;
- exhaustividad global: **2/4**; no se falsea cierre mientras falten requests/config y provider-write entrypoints globales;
- subdominio HTTP mutativo del Cloud Run actual: **3/3 routers clasificados y cerrado**;
- `backend/runtime/hr-live-service`: **8/8 archivos clasificados por rol de ejecución**;
- `tools/production`: **2/2**;
- `tools/dev`: **1/1**;
- `tools/backend`: **4/4**;
- scripts ejecutables top-level de `tools/empalme`: **2/2**.

No hubo provider write, data write, deploy, G2-B, merge ni cambio funcional frontend.

## RC15-CP-120 — user-admin productivo

`backend/runtime/hr-live-service/user-admin.mjs` es un provider-write entrypoint productivo intencional, no un control-plane P0. POST/DELETE sobre `/api/tenants/{tenantId}/admin/users/{uid}` puede modificar Firebase Auth y los perfiles Firestore correspondientes, pero exige ID token Firebase válido, tenant del token igual al tenant de URL y rol `super`; también limita el catálogo de roles permitido.

Clasificación: `PASS_CURRENT_PRODUCT_PROVIDER_WRITE_ENTRYPOINT_TENANT_AND_SUPER_GUARDED`.

F2 debe mantener separadas la autorización de producto por acción humana y la autoridad de release/deploy. No corresponde poner continuity-lock a cada operación administrativa de producto.

## RC15-CP-121 — cierre del HTTP mutation surface desplegado

`server.mjs` enruta mutaciones HTTP únicamente a tres handlers:
1. user-admin → CP120, activo y tenant/super guarded;
2. legal-runtime → CP119, contenido; el proveedor actual devuelve 423 antes de auth;
3. g2b-synthetic-runtime → superficie G2-B ya conocida, gated por env/gate/request exactos y actualmente sin sus env vars en la revisión `00011-f2f`.

Cualquier otro método no GET cae en `405 METHOD_NOT_ALLOWED`.

Decisión: `PASS_DEPLOYED_HTTP_MUTATION_SURFACE_BOUNDED_AND_CLASSIFIED`.

## RC15-CP-122 — tools/production

El directorio contiene exactamente:
- `cxorbia-hosting-rest-deploy.mjs`: primitive real de Firebase Hosting REST; en ejecución real necesita access token provisto por el caller; su `dry-run` no escribe.
- `validate-production-promotion-gates.js`: validator local/read-only fail-closed.

No se considera que el primitive sea por sí solo autoridad de ejecución. F2 debe impedir que reciba credencial/token salvo desde un caller canónico autorizado.

## RC15-CP-123 — tools/dev + tools/backend

`tools/dev` contiene solo el preview server local `127.0.0.1`, de lectura de archivos. `tools/backend` contiene scanners/contract checks y wrappers, sin provider mutation. Ambos subdominios quedan clasificados PASS/read-only.

## RC15-CP-124 — HOLD nuevo

`tools/empalme/tya-apply-post-v96-source-lock.sh` es un writer histórico de source todavía ejecutable. Puede restaurar runtime desde V96/delta sobre `app/core`, `app/modules` y otros archivos, crear commit y ejecutar `git push` directamente a `docs-tya-v6-v71-audit`.

No valida master plan vigente, continuity lock, consumed ledger ni autorización actual. Solo comprueba rama y artefactos históricos.

Clasificación: `HOLD_HISTORICAL_UNGATED_SOURCE_MUTATION_AND_PUSH_TOOL`.

No se ejecuta ni se inertiza parcialmente en F0. F1 debe hacerlo inerte conservando evidencia.

## RC15-CP-125 — HOLD nuevo

`tools/empalme/tya-apply-v105-internal-v106-runtime.sh` sigue aceptando `backend/config/phase-a-v105-v106-empalme-request.source-safe.json`, que conserva `authorized=true`, `authorizedBy=Paula`, fecha 2026-07-11 y no tiene estado terminal consumed/expired.

Con ese request histórico + `CXORBIA_CONFIRM`, el script puede reemplazar 70 rutas runtime y aplicar un delta histórico de 18 archivos en el working tree de la rama viva. No hace push/provider write por sí mismo, pero conserva autoridad histórica de materialización de source fuera del plan/lock actual.

Clasificación: `HOLD_HISTORICAL_SOURCE_MATERIALIZER_WITH_STALE_AUTHORIZED_REQUEST`.

F1 debe terminalizar el request y hacer inerte su autoridad de materialización, preservando evidencia.

## Reconciliaciones para no duplicar hallazgos

- legal acceptance provider → CP119, no hallazgo nuevo;
- G2-B synthetic runtime/provider → G2-B existente, no duplicado;
- shopper provider → request CP110 consumed/fail-closed;
- visit lifecycle provider → gate I4B consumido ya clasificado;
- C6 direct trusted runner → provider-read-only.

## Seguridad y alcance

En Tramo 11:
- provider writes = 0;
- Firestore/Auth/Storage/HR writes = 0;
- Cloud Build/Cloud Run/Hosting = 0;
- Rules/Make/Gemini/pagos = 0;
- G2-B/recovery/synthetic = 0;
- merge = false;
- `/app/modules` y `/app/core` = sin cambios;
- frontend funcional = 0.

## Clasificación obligatoria

- **Reusable CXOrbia:** separación product-write vs release authority; inventario de mutation routers; primitives no autónomos; detección de source writers históricos.
- **Exclusivo TyA:** scripts de empalme históricos V96 y V105/V106, provider/rutas de este tenant.
- **Claude/prototipo:** no hay cambio funcional; los scripts históricos que pueden reescribir prototipo quedan señalados para F1, no se aplican.
- **Academia:** sin impacto funcional.
- **Sin impacto Claude:** matriz/evidence/documentación F0.

## Pendiente real

Los dos flags globales siguen abiertos:
- `allRequestsClassified=false`;
- `allProviderWriteEntrypointsClassified=false`.

Siguiente exacto: continuar `backend/config`, execute markers/aliases/ledgers dispersos y tooling/provider entrypoints restantes. No iniciar F1 hasta 4/4. No tocar G2-B.
