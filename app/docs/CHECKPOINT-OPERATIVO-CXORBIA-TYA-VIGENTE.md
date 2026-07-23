# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-07-23  
**Estado:** `V174_R20_M1_CORTE2A_FUNCTIONAL_PASS_SOURCE_LOCK_CLOSURE_PENDING_NO_DEPLOY`

## 1. Repositorio y seguridad

- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama obligatoria: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Base: `release/cxorbia-tya-rc-20260630`.
- No nueva rama, PR, `main` ni force push.
- No Hosting DEV nuevo, deploy productivo, producción, imports ni writes reales.

## 2. V174 aplicada y preservada

- Package SHA-256: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- Commit funcional V174: `b21e494d127fb4b902de5576e3fab0292362b097`.
- Commit documental inicial: `1703d36252cb957387fac6bcf348cf06ff22a5ef`.
- Corrección focalizada V174: `0acdc6772f2d4a7743dea0992a4279241dcb79d7`.
- Delta V174: seis módulos frontend exactos.
- Backend, adapters live, contratos operativos, overlays y `CX.data`: preservados.
- Finanzas: `0` confirmado permanece `0`; ausencia permanece `null`.

## 3. R20 remoto cerrado funcionalmente

Causa raíz corregida:

`R20_INVENTORY_BUILDER_NOT_USING_CANONICAL_HEADER_VARIANT_RESOLVER`

El builder remoto vigente usa el contrato R20 para:

- `full_identity`;
- `tab_scoped_compact`;
- país desde columna o nombre del tab según variante;
- identidad de fila cuando `ID CINEMA` está ausente;
- `contextualMissingAllowedIn`;
- `coalesce_equal_or_single_nonempty`;
- bloqueo de ambigüedad o conflicto;
- verificación de inventario y cache-busting por GID antes de publicar identidad de fuente.

No se usa un hardcode mensual para aceptar `JULIO 26`.

## 4. Evidencia read-only reproducible

- Workflow: `CXORBIA_READONLY_POST_GATES_RUNNER`.
- Perfil: `V174_R20_M1_CORTE2A`.
- Run: `30016360952`.
- Job: `89237272004`.
- Artifact: `8567304475`.
- Digest: `sha256:b7b65933e1f81002dfac8ca65a2b1415d57e1158b87e755e9bd7706253dede57`.
- Source HEAD: `96bf7db74a144a3ddb27635933d3860658198719`.
- Request commit: `0c7002c30ff88e8863b86acce56e72d9f1ba772c`.
- Entorno: Ubuntu 24.04, Node 24, Playwright 1.55.0 y Chromium efímero.
- Permisos observados: contents read, issues/statuses write; cero permisos de escritura de contenido.

## 5. Inventario HR actual

- Periodos: 14, desde junio 2025 hasta julio 2026.
- Tabs: 28.
- Visitas: 616.
- GT: 476.
- HN: 140.
- Shoppers source-safe: 209.
- Nonces únicos: 28, uno por GID.
- Access mode: `public_gviz_gid_verified_inventory`.
- History scope: `all_verified_hr_periods`.
- `JULIO 26`: `full_identity` observado actualmente.
- `JULIO 26 HN`: `full_identity` observado actualmente.
- Soporte contractual de `tab_scoped_compact`: preservado y fail-closed.

Totales históricos actuales:

- asignadas: 615;
- sin asignar: 1;
- programadas: 614;
- realizadas: 600;
- cuestionarios: 597;
- submitidas: 533;
- candidatas de liquidación pendientes de fuente financiera: 533;
- liquidaciones confirmadas: 0;
- pagos confirmados: 0;
- reviewRequired: 0.

## 6. Julio 2026 observado por navegador

- total: 44;
- GT/HN: 34/10;
- asignadas: 43;
- sin asignar: 1;
- programadas: 43;
- realizadas: 29;
- cuestionarios completados: 28;
- cuestionario pendiente: 1;
- submitidas: 20;
- pendientes de submitir: 8;
- candidatas de liquidación: 20;
- liquidaciones confirmadas: 0;
- pagos confirmados: 0.

Los valores provienen de la HR leída durante el run; no son fixtures ni constantes del producto.

## 7. Lectura viva protegida

`PASS_TYA_LIVE_HR_INPLACE_REFRESH_GATE`:

- `documentReload=false`;
- `freshBypassesTtl=true`;
- `projectionRebuilt=true`;
- `snapshotAppliedInMemory=true`;
- `sourceRevision=rev-new` en el gate controlado.

Archivos de lectura viva no modificados por R20:

- `backend/runtime/hr-live-service/server.mjs`;
- `app/adapters/tya-live-source-inplace-apply.js`.

No se modificaron módulos V174 ni `CX.data`.

## 8. Gates del run 30016360952

PASS:

1. `tya-v174-r20-source-lock-proposal`;
2. `node-check-builder`;
3. `tya-hr-header-variants-r20-gate`;
4. `tya-build-live-hr-source-safe-r20-inventory`;
5. `tya-source-safe-binding-build-r18a`;
6. `tya-live-hr-inplace-refresh-gate`;
7. `tya-corte1-context-history-reports-gate`;
8. `tya-corte1-report-frontend-runtime-gate`;
9. `tya-project-period-kpi-history-gate-r20`;
10. `tya-corte2a-shopper-operation-canonical-gate`;
11. `tya-corte1-m1-regression-lock`.

HOLD único:

- `tya-v174-corte2a-empalme-directo-verify`: manifest/build-lock anteriores no representaban aún la corrección R20, el payload generado y la documentación viva actualizada.

La aplicación, HR, periodos, visitas, KPIs, reportes, Corte 2A y M1 no tienen HOLD funcional.

## 9. Source lock y cierre técnico

La primera propuesta produjo:

- file count: `1890`;
- aggregate: `cdce7c1026a78d639ed887f19151e43ba142397359cbcab5b6ce93676a6c4123`.

Ese aggregate corresponde al app del run antes de esta reconciliación documental. Debido a que los documentos vivos se incluyen en el lock, debe regenerarse después de cerrar índice/checkpoint/CAMBIOS/RESUMEN/PENDIENTES/Academia.

Condición automática de transición:

- si el source lock final se aplica sobre el HEAD documental exacto;
- y el perfil read-only vuelve a dejar todos los gates, incluido el verificador, en PASS;
- el estado pasa a `TECHNICAL_PASS_PENDING_VISUAL` sin reabrir V174, R20, Corte 2A o M1.

## 10. Phase A

- M1/Corte 1: preservado y gate compuesto PASS.
- V174/Corte 2A: empalmada y gate canónico PASS.
- HR/histórico/visitas: lectura técnica PASS con 616 visitas y cambio de periodo validado.
- Source lock final: en cierre.
- Hosting DEV: aún no autorizado en este bloque.
- Validación visual: siguiente etapa después del PASS técnico final.
- Producción: solo después de DEV, visual, freeze y cutover controlado.

## 11. Clasificación

- **Reusable CXOrbia:** resolver de encabezados por contrato, inventario verificable y runners controlados.
- **Exclusivo cliente:** lectura TyA GT/HN y conteos actuales de la HR.
- **Claude/prototipo:** sin nueva candidata; V174 se preserva.
- **Academia:** fuente viva, identidad de filas, ausencia distinta de cero y evidencia de gates.
- **Sin impacto Claude:** GitHub Actions, Playwright/Chromium, source lock y telemetry.

## 12. Siguiente bloque exacto

1. completar documentación viva;
2. regenerar manifest/build-lock final;
3. reejecutar R20 + M1 + Corte 2A + verificador contra el lock;
4. declarar `TECHNICAL_PASS_PENDING_VISUAL` si todo pasa;
5. solicitar autorización separada de Hosting DEV;
6. ejecutar `fresh=1`, smoke remoto y validación visual;
7. freeze Phase A;
8. preparar cutover de producción.

## 13. Estado seguro

Cero Hosting DEV nuevo, deploy productivo, merge, producción, imports, Firestore/Auth/Storage/HR writes, Make/Gemini, pagos y conexión a la base vieja.
