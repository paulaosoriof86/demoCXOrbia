# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `C6_FINANCE_ROOT_FIX_REMOTE_PASS__SEMANTIC_GATE_STOP_RETRY_EXACT_ASSERTION_PENDING__NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- HEAD con evidencia STOP_RETRY: `2ddb84aa3bc1f68f1ba6f9e8614b66338808298b`.
- Source lock runtime/QA revalidado: `aad5caed269fd7156b786775cc7e35c8108e00ca`.
- Producción `tya-plataforma` intacta.
- Agosto 2026 todavía no existe en HR.

## 2. Macro-bloque de revalidación ejecutado

Request:

`c6-finance-root-fix-remote-revalidation-20260802-08`

Resultado predeploy:

- source lock exacto de `app` y `tools/qa`;
- 2,302 archivos en el manifiesto de `app`;
- gate acumulativo estático PASS;
- gate Shopper nueva pestaña PASS;
- root fix financiero source-only previamente PASS;
- configuración raíz `firebase.deploy.json` preservada.

## 3. Único deploy Hosting DEV

Se ejecutó exactamente un deploy:

- Hosting DEV: 1 intento / 1 release exitosa;
- 2,301 archivos publicados;
- target `cxorbia-dev`;
- site `cxorbia-backend-dev`;
- segundo deploy: 0.

## 4. PASS remoto acumulado

### Paridad y HR

- paridad SHA-256 de assets críticos;
- endpoint HR vivo source-safe;
- 14 periodos, junio 2025–julio 2026;
- 616 visitas.

### Staff

- rol `coordinador`, namespace `staff`;
- tres recargas estables;
- nueva pestaña estable.

### Shopper

- namespace `shopper`;
- 208 shoppers;
- identidad exacta;
- `ownVisits=1`;
- tres recargas estables;
- nueva pestaña estable.

### Cliente

- rol `cliente`, tenant `tya`;
- scope exclusivo `cinepolis`;
- tres recargas estables;
- nueva pestaña estable;
- cero cambios de contraseña y cero Auth writes.

## 5. Root fix financiero cerrado remotamente

El diagnóstico remoto demuestra una sola verdad en `period`, `project` y `currentById`:

- modelo delegado;
- `delegated_coordination`;
- facturación local false;
- regalía 0;
- Q60 GT / L200 HN;
- comisión y reparto configurables;
- valores no inventados;
- honorario Shopper no usado como ingreso delegado.

Contrato acumulado:

- 14 delegados;
- 0 directos;
- 0 sin configurar;
- 0 violaciones de regalías.

La causa raíz queda cerrada remotamente:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`.

## 6. STOP_RETRY actual

El bloque se detuvo en:

`remote_domain_finance_portals_reservations`

Decisión:

`FAIL_C6_REMOTE_GATES_AFTER_SINGLE_DEV_HOSTING_DEPLOY_STOP_RETRY`

La evidencia persistida contiene `semantic=null`. El script combinado falló antes de escribir su evidencia final y el flujo no copió su stdout/stderr al repositorio. La aserción exacta posterior no está demostrada todavía.

No corresponde atribuir este fallo nuevamente a Finanzas canónicas, porque el diagnóstico financiero remoto obtuvo PASS material.

## 7. Estado no cerrado

Pendiente de evidencia exacta:

- dominio semántico final;
- salida financiera por país;
- Portal Cliente;
- Portal Shopper;
- Reservas;
- validación visual humana;
- freeze C6.

## 8. Siguiente bloque exacto

Read-only, sin deploy:

`PERSISTIR LOG Y CHECKPOINT POR ASERCIÓN DEL GATE SEMÁNTICO → EJECUTAR CONTRA HOSTING DEV VIGENTE → IDENTIFICAR ASERCIÓN EXACTA → EVIDENCIA → DOCUMENTACIÓN → STOP`

No existe autorización para otro deploy.

## 9. Estado seguro

- Hosting deploys del macro-bloque: 1.
- Segundo deploy: 0.
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0.
- Password changes/resets: 0.
- Credenciales/tokens expuestos: 0.
- Merge: false.
- Producción: false.
- `STOP_RETRY`: activo.
