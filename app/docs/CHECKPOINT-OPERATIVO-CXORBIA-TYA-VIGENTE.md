# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-29  
**Estado:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_NEW_EMPTY_FIREBASE_VERIFIED_PASS__PROVIDER_BOOTSTRAP_AUTHORIZATION_PENDING_NO_PRODUCTION`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos ejecutados y Firestore/Auth/Storage/HR data writes: 0.

## 2. Corte 3 — FROZEN / ACTIVE_BASELINE

- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- Baseline head: `1b34c3998625a3f2402ceeada283ab57b56ffbf6`.
- V182 empalmada; no V183/R33.
- R26–R32: 135/135 PASS.
- R24, HR remota, Hosting DEV y smoke de pagos: PASS.
- Mayo: 44 pagadas / 0 pendientes / 42 exactas / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Pagos y lotes ejecutados por CXOrbia: 0.

Backlog P1/P2 de PDF, Excel, reportKit y copy no reabre Corte 3.

## 3. Corte 4 — objetivo

`CX.data READ-ONLY → Firebase nuevo y vacío → misma interfaz → cero writes`.

## 4. Base existente excluida

`cxorbia-backend-dev` no es nueva ni vacía y permanece excluida como destino de Corte 4. No se conecta, copia o reutiliza.

## 5. Firebase nuevo y limpio

Proyecto:

- Project ID: `cxorbia-tya-dev-260729-c4`;
- Display name: `CXOrbia TyA DEV Clean Corte 4`;
- creado manualmente por Paula;
- IAM otorgado posteriormente solo como `Viewer` a la service account de lectura ya existente;
- no se reutilizó la base DEV histórica.

## 6. Hardening read-only completado

- contrato `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
- backend desactivado por defecto;
- `readOnly=true` y `writeMode=disabled`;
- interfaz pública `CX.data` preservada;
- persistencia y acciones operativas bloqueadas;
- backend vacío se representa como vacío;
- errores de lectura fallan cerrado;
- no fallback a mock/localStorage;
- Rules candidate `backend/rules/firestore.corte4-readonly.rules` preparado y no desplegado.

Gate estático:

- request `corte4-cxdata-firestore-readonly-hardening-20260729-03`;
- commit `8b002f935535e623665ea7d5a8d04639267d25b8`;
- run `30421675166`, job `90479605890`: SUCCESS;
- decisión `PASS_READONLY_POST_GATES`;
- providerReads=0 / providerWrites=0 / dataWrites=0.

## 7. Gate 1 — identidad nueva: PASS

La cadena inicial IAM falló de forma segura hasta que Paula otorgó `Viewer` al runner.

Re-probe final:

- request `corte4-probe-project-identity-20260729-03`;
- commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c`;
- status `cxorbia/corte4-project-identity-existing_dev_service_account-TARGET_PROJECT_IDENTITY_VERIFIED_C4 = success`;
- status `cxorbia/corte4-project-identity = success`;
- provider writes=0.

## 8. Gate 2 — vacío integral: PASS

### 8.1 Primer diagnóstico

El primer verificador integral no pudo cerrar vacío por dos defectos del propio gate:

- Auth inventory count-only usaba una forma inválida;
- un `DEFAULT_SITE` de Firebase Hosting se contaba como contaminación.

Diagnóstico sanitizado previo: identidad=1, vacío=0, unavailable=1, nonempty=1, apps=0, Auth=0, Firestore=0, Storage=0, Hosting=1.

### 8.2 Correcciones de raíz

- Auth se corrige a query count-only válida con `returnUserInfo=false` sin límite incompatible.
- Hosting distingue sitio `DEFAULT_SITE` administrado por Firebase de `USER_SITE` y releases/deployments.
- El default site provider-managed no cuenta como dato/materialización.
- Un typo intermedio de OAuth `grant_type` fue detectado y corregido en `a11191177d0c91c63c273dc731675772f5d0f5c9` antes de disparar ese intento; no produjo provider call ni write.

### 8.3 Resultado final

- request `corte4-verify-new-empty-firebase-dev-20260729-05`;
- commit `7b0e40f8607b80a4f37238314a66064af35c5e6d`;
- `cxorbia/corte4-verify-new-empty-firebase = success`;
- diagnóstico `id1-e1-u0-n0-a0-au0-f0-s0-h1-xnone-rnone = success`;
- identidad nueva=true;
- vacío verificado=true;
- checks no disponibles=0;
- señales no vacías=0;
- apps=0;
- Auth users=0;
- Firestore databases=0;
- Storage buckets=0;
- Hosting sites=1 provider-default, sin señal de user site/release;
- provider writes=0.

Estado exacto:

`NEW_EMPTY_FIREBASE_DEV_VERIFIED_C4`

## 9. Qué queda de Corte 4

Gates cerrados:

1. identidad nueva confirmada: PASS;
2. vacío verificado: PASS.

Gates pendientes:

3. Web App DEV/config sin secretos en repo;
4. autorización separada para provider bootstrap DEV mínimo: inicialización Firestore + Auth bootstrap temporal + Rules read-only;
5. activación solo lectura DEV;
6. smoke `CX.data`: `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada y writes=0;
7. validación visual;
8. freeze Corte 4.

El bootstrap Auth de Corte 4 solo sirve para probar lectura protegida y no sustituye Auth/RBAC completo de Corte 6.

## 10. Autorización pendiente

No se ejecutarán los provider writes de Web App/Firestore/Auth/Rules hasta autorización expresa de Paula en la conversación vigente.

La autorización de este bloque NO incluirá:

- import/materialización de datos;
- Storage;
- Hosting deploy;
- Functions;
- HR writes;
- Make/Gemini;
- pagos/lotes;
- merge o producción.

## 11. Claude/prototipo y Academia

- Claude: sin nueva candidata; Corte 3 congelado; no tocar backend/contracts/adapters.
- Academia: separar credencial, IAM, identidad, vacío, infraestructura provider-default, Web App, Auth bootstrap, Firestore, Rules, lectura y escritura/materialización.

## 12. Siguiente bloque exacto

`AUTORIZAR BOOTSTRAP DEV READ-ONLY → WEB APP DEV → FIRESTORE/AUTH BOOTSTRAP MÍNIMO → RULES READ-ONLY → ACTIVAR LECTURA DEV → SMOKE CX.data → VALIDACIÓN VISUAL → FREEZE CORTE 4`.

## 13. Estado seguro

PR #7 draft/open/no merge. Sin producción, merge, Rules deploy, Firestore/Auth/Storage/HR data writes, imports, pagos, lotes reales, Make ni Gemini live. Los probes/verificadores posteriores al IAM fueron read-only.
