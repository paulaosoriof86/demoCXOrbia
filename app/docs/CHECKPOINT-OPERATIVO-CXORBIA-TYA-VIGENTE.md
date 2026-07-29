# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_STATIC_GATE_PASS_NEW_FIREBASE_GATE_RUNNING_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos ejecutados y Firestore/Auth/Storage/HR writes: 0.

## 2. Corte 3 — FROZEN / ACTIVE_BASELINE

Paula autorizó el cierre con `Procede` en la conversación vigente.

- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Baseline head: `1b34c3998625a3f2402ceeada283ab57b56ffbf6`.
- Manifest: `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`.
- Freeze: `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`.
- V182 empalmada; no V183/R33.
- R26–R32: 135/135 PASS.
- R24, HR remota y smoke de pagos: PASS.
- Run `30416875149`, job `90468374816`: SUCCESS.
- Mayo: 44 pagadas / 0 pendientes / 42 exactas / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / `JUNIO 26!2`, `JUNIO 26!6` / Q451-L0.
- Pagos y lotes ejecutados por CXOrbia: 0.

Backlog P1/P2 no reabre Corte 3: PDF, Excel, reportKit, copy de fuentes y registry R20.

## 3. Corte 4 — objetivo

`CX.data READ-ONLY → Firebase nuevo y vacío → misma interfaz → cero writes`.

## 4. Proyecto existente excluido

La evidencia provider read-only vigente confirma que `cxorbia-backend-dev` NO es nuevo ni vacío:

- 17 usuarios Auth ficticios de DEV;
- 1 colección raíz esperada;
- tenant `tya` existente;
- 3 clientes;
- 29 proyectos;
- 215 shoppers;
- 20 notificaciones;
- 572 beneficios shopper.

Fuente: `backend/config/phase-a-firebase-existing-dev-provenance-r15c-result.source-safe.json`.

Decisión:

- `cxorbia-backend-dev` queda excluido para Corte 4;
- no se conecta, no se copia y no se reutiliza;
- `.firebaserc` continúa apuntando allí únicamente como configuración histórica existente y no se modifica antes de verificar el candidato nuevo.

## 5. Candidato nuevo

- Project ID solicitado: `cxorbia-tya-dev-260729-c4`.
- Display name: `CXOrbia TyA DEV Clean Corte 4`.
- Solicitud: `.github/cxorbia-firebase-requests/corte4-new-empty.json`.
- Reutilización de proyecto existente: false.
- Conexión/copia legacy: false.
- Únicos provider writes autorizados en el gate: crear proyecto y agregar Firebase.
- Billing, Auth, Firestore, Storage, Rules, Hosting, Functions, imports y migración: false.

## 6. Hardening read-only aplicado

- `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`.
- `app/core/backend-config.js`: candidato nuevo, disabled, read-only, writes disabled, proyecto existente excluido.
- `app/core/backend-config-preview-dev.js`: preview DEV solo lectura.
- `app/core/backend-cxdata-readonly-corte4.js`:
  - conserva interfaz pública `CX.data`;
  - bloquea persistencia y acciones operativas;
  - backend vacío se representa vacío;
  - error de lectura falla cerrado;
  - no fallback a mock/localStorage.
- `backend/rules/firestore.corte4-readonly.rules`: candidato no desplegado; todo create/update/delete denegado.
- `firestore.rules` actual no es compatible con Corte 4 porque contiene writes por rol.

## 7. Gate estático Corte 4

Resultado vigente:

- request `corte4-cxdata-firestore-readonly-hardening-20260729-03`;
- target `3e4e88f06b6d0d517b5055d9955e8353eed5916c`;
- request commit `8b002f935535e623665ea7d5a8d04639267d25b8`;
- run `30421675166`;
- job `90479605890`: SUCCESS;
- artifact `8712131903`;
- digest `sha256:4b6599e5a1b792d8939faec54b9dc208a48c29972d26cc382fb0c5fc8fff8aa8`;
- status `PASS_READONLY_POST_GATES`;
- interfaz `CX.data` preservada;
- readOnly=true / writeMode=disabled;
- fail-closed=true;
- fallback mock/localStorage=false;
- providerReads=false / providerWrites=false / dataWrites=false;
- Rules candidate preparado y no desplegado;
- activación=false.

## 8. Gate provider nuevo/vacío

Workflow existente endurecido para:

- validar una solicitud exacta;
- publicar status observable al iniciar;
- usar creación atómica como guard de no reutilización;
- verificar identidad/fecha/estado y vacío con conteos sanitizados;
- publicar evidencia en PR #7;
- no revelar credenciales ni PII.

Solicitud observable vigente:

- commit `836f8bec4f2aeb4fb03f696837bf415cb4d5c438`;
- status `cxorbia/corte4-new-empty-firebase`: pending;
- resultado final todavía no documentado ni asumido.

Mientras permanezca pending:

- provider identity=false;
- empty baseline=false;
- Rules deploy=false;
- provider activation=false.

## 9. Claude/prototipo y Academia

- Claude: Corte 3 congelado; no tocar backend/contracts/adapters desde candidata; no reintroducir persistencia ni fallback mock.
- Academia: enseñar backend vacío real, fail-closed, interfaz estable, exclusión de base existente y diferencia entre crear proyecto, agregar Firebase, desplegar Rules y activar lectura.

## 10. Siguiente bloque exacto

`OBSERVAR RESULTADO ATÓMICO → si PASS verificar vacío → preparar config web DEV sin secretos → autorizar/desplegar Rules read-only → activar solo lectura DEV → smoke CX.data source=firestore, empty=true, fallbackUsed=false, writes=0`.

## 11. Estado seguro

Sin producción, merge, provider activation, Rules deploy, Firestore/Auth/Storage/HR writes, imports, pagos, lotes reales, Make ni Gemini live.
