# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-29  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `CORTE3_FROZEN_ACTIVE_BASELINE__CORTE4_NEW_EMPTY_FIREBASE_VERIFIED_PASS__PROVIDER_BOOTSTRAP_AUTHORIZATION_PENDING_NO_PRODUCTION`

## 1. Repositorio

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- Producción, merge, imports, pagos y writes de datos reales: 0.

## 2. Orden de lectura vigente

1. este índice;
2. reglas maestras vigentes;
3. addendum de empalme directo/carril file-aware;
4. addenda de Academia, patrones y antidesvío;
5. `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
6. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
7. `app/docs/ACTIVE-BASELINE-CORTE3-V182-20260729.json`;
8. `app/docs/FREEZE-CORTE3-V182-APPROVED-20260729.md`;
9. contrato/gates Corte 4;
10. CAMBIOS, Claude, PENDIENTES, Academia y tracker;
11. PR #7 y HEAD vivo.

## 3. Corte 3 — fuente congelada

- `FROZEN_ACTIVE_BASELINE`.
- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no V183/R33.
- 14 periodos / 616 visitas.
- Mayo: 44 pagadas / 0 pendientes / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Run `30416875149`, job `90468374816`: SUCCESS.

P1/P2 de reportes no reabren Corte 3.

## 4. Corte 4 — fuentes activas

Objetivo: Firebase nuevo/vacío, `CX.data` read-only y cero writes de datos.

- `backend/contracts/cxdata-firestore-readonly-corte4-v1.json`;
- `app/core/backend-config.js`;
- `app/core/backend-config-preview-dev.js`;
- `app/core/backend-firebase.js`;
- `app/core/backend-cxdata-read-guard.js`;
- `app/core/backend-cxdata-readonly-corte4.js`;
- `app/index-backend-dev.html`;
- `backend/rules/firestore.corte4-readonly.rules`;
- `tools/qa/cxdata-firestore-readonly-corte4-gate.mjs`;
- `tools/release/cxorbia-probe-firebase-project-identity-corte4.mjs`;
- `tools/release/cxorbia-verify-new-empty-firebase-dev-corte4.mjs`;
- `.github/workflows/cxorbia-corte4-verify-new-empty-firebase-dev.yml`.

Reglas:

- interfaz `CX.data` preservada;
- readOnly=true / writeMode=disabled;
- backend vacío visible como vacío;
- error de lectura fail-closed;
- no fallback mock/localStorage;
- no base legacy/preexistente;
- no activación antes de identidad, vacío y Rules.

## 5. Estado del proveedor — gates 1 y 2 PASS

`NEW_EMPTY_FIREBASE_DEV_VERIFIED_C4`

- `cxorbia-backend-dev` continúa excluido por no ser nuevo/vacío.
- Firebase nuevo: `cxorbia-tya-dev-260729-c4` / `CXOrbia TyA DEV Clean Corte 4`.
- Paula creó el proyecto y otorgó únicamente `Viewer` a la service account de lectura del runner.
- Re-probe de identidad: commit `b18f0b6cf74afb8b3ac770a73231c6cf1353b37c` → `TARGET_PROJECT_IDENTITY_VERIFIED_C4` PASS.
- Verificación integral de vacío: commit `7b0e40f8607b80a4f37238314a66064af35c5e6d` → SUCCESS.
- Estado sanitizado: identidad=1, vacío=1, checks no disponibles=0, señales no vacías=0, apps=0, Auth users=0, Firestore databases=0, Storage buckets=0.
- Hosting muestra 1 sitio `DEFAULT_SITE` administrado por Firebase y 0 señales de despliegue/usuario; no se trata como contaminación.
- Provider writes durante los probes/verificación: 0.
- Rules deploy/provider activation: false.

## 6. Correcciones de causa raíz del verificador

Durante la verificación integral se demostraron y corrigieron dos defectos del gate, no del Firebase nuevo:

1. la consulta de inventario Auth usaba una forma inválida para count-only; se corrigió a `accounts:query` sin límite cuando `returnUserInfo=false`;
2. el gate trataba el `DEFAULT_SITE` de Hosting provisionado por Firebase como dato contaminante; ahora distingue infraestructura provider-default de sitios/release creados por usuario.

Hubo además un typo intermedio de `grant_type` al endurecer el runner; fue detectado y corregido en `a11191177d0c91c63c273dc731675772f5d0f5c9` **antes de disparar ese intento**, por lo que no produjo provider call ni write.

## 7. Gate vivo pendiente

Los gates 1–2 del Corte 4 están cerrados:

1. identidad nueva confirmada: PASS;
2. vacío verificado: PASS.

Pendiente, con autorización separada antes de provider writes:

3. registrar/configurar Web App DEV sin secretos en repo;
4. inicializar únicamente el backend DEV mínimo necesario para lectura (Firestore/Auth bootstrap) y desplegar Rules read-only;
5. activar solo lectura DEV;
6. smoke `CX.data`: `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada, writes=0;
7. validación visual y freeze Corte 4.

No se requiere PowerShell, nueva candidata, ZIP ni datos TyA.

## 8. Claude/prototipo y Academia

- Claude: Corte 3 congelado; no tocar backend/contracts/adapters y no preparar nueva candidata por Corte 4.
- Academia: documentar credencial/IAM, identidad, vacío real, infraestructura provider-default, Web App, Auth bootstrap, Firestore, Rules, lectura y escritura como gates distintos.

## 9. Backlog no bloqueante

- PDF sin gráfica visible.
- Excel con formato básico.
- reportKit transversal.
- copy de fuentes.
- registry/gate R20 antes de producción.

## 10. Siguiente bloque exacto

`AUTORIZAR BOOTSTRAP DEV READ-ONLY → WEB APP DEV SIN SECRETOS EN REPO → FIRESTORE/AUTH BOOTSTRAP MÍNIMO → RULES READ-ONLY → ACTIVAR LECTURA DEV → SMOKE CX.data → VALIDACIÓN VISUAL → FREEZE CORTE 4`.
