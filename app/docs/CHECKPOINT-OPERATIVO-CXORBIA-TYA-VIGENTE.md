# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-02  
**Estado:** `C6_CANONICAL_HEAD_DEPLOYED__SHOPPER_ROOT_FIX_REMOTE_PASS__FINANCE_CANONICAL_PRECEDENCE_FAIL_STOP_RETRY__NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- HEAD documental posterior a evidencia: `bb357056d0fac00cb86971c41bc9bdb435d1186d`.
- Source lock runtime/QA: `69afc8227762cbb16ac5a3af87072c2f1cc88198`.
- Producción `tya-plataforma` permanece intacta.
- Agosto 2026 todavía no existe en HR.

## 2. Source lock canónico comprobado

El macro-bloque autorizado creó y verificó un source lock exacto:

- `app` tree bloqueado y actual: `729c5638fd8a37e7f3afaaa461b3d2c1b9932440`;
- `tools/qa` tree bloqueado y actual: `2425f54ad099e1295084589cb1b04008261c65cb`;
- 2,297 archivos en el manifiesto de `app`;
- runtime y QA sin drift frente al HEAD autorizado;
- configuración raíz `firebase.deploy.json` validada;
- cero provider writes antes del deploy.

Evidencia:

- `app/docs/evidence/CORTE6-CANONICAL-HEAD-SOURCE-LOCK-LATEST.json`;
- `app/docs/evidence/CORTE6-CANONICAL-HEAD-DEV-DEPLOY-GATES-FAILURE-LATEST.json`.

## 3. Gates estáticos predeploy

PASS:

- `PASS_C6_UNIFIED_CUMULATIVE_RUNTIME_STATIC_GATE`;
- `PASS_C6_SHOPPER_NEW_TAB_AUTHORITY_ROOT_FIX_STATIC_GATE`;
- sintaxis de gates de paridad, Auth, Cliente, Finanzas, portales y Reservas.

## 4. Único deploy Hosting DEV

El request `c6-canonical-head-dev-deploy-gates-20260802-07` ejecutó exactamente un deploy:

- Hosting DEV: 1 intento / 1 release exitosa;
- 2,296 archivos publicados desde `app`;
- target `cxorbia-dev`;
- site `cxorbia-backend-dev`;
- URL: `https://cxorbia-backend-dev.web.app`;
- segundo deploy automático: 0.

## 5. Gates remotos aprobados

### Paridad y HR viva

- paridad SHA-256 exacta de assets críticos;
- endpoint HR remoto PASS;
- 14 periodos, junio 2025–julio 2026;
- 616 visitas;
- source-safe y runtime read activos.

### Staff

- Auth humana protegida PASS;
- 14 periodos y 616 visitas;
- tres recargas estables;
- nueva pestaña estable.

### Shopper — P0 anterior cerrado remotamente

- Auth Shopper PASS;
- identidad exacta resuelta;
- 14 periodos, 616 visitas y 208 shoppers;
- `ownVisits=1`;
- tres recargas estables;
- nueva pestaña estable;
- overlay protegido aplicado.

El P0 `RESTORED_SESSION_NEW_TAB_PROTECTED_AUTHORITY_RECONCILIATION_NOT_RESILIENT` queda corregido y demostrado remotamente.

### Cliente

- Auth Cliente existente PASS;
- alcance exclusivo `cinepolis`;
- 14 periodos y 616 visitas;
- tres recargas y nueva pestaña estables;
- cero cambios de contraseña y cero writes Auth.

## 6. Fallo nuevo y STOP_RETRY

El macro-bloque se detuvo correctamente en:

`remote_domain_finance_portals_reservations`

Decisión:

`FAIL_C6_REMOTE_GATES_AFTER_SINGLE_DEV_HOSTING_DEPLOY_STOP_RETRY`

La captura financiera demostró una contradicción de autoridad:

- objetos canónicos `period/project`: `modelo=directo`, `billingModel=local_invoicing`, `localBilling=true`, `royaltyApplicable=true`, `regalias=10`;
- configuración vigente de proyecto: `modelo=delegado`, `billingModel=delegated_coordination`, `localBilling=false`, `royaltyApplicable=false`, `royalty=0`;
- guard de coordinación delegada: listo, sin usar honorario Shopper como ingreso y sin inventar reparto.

El gate semántico se detuvo antes de persistir su evidencia final porque la primera aserción financiera exige que los objetos canónicos materialicen el modelo delegado y regalías cero.

## 7. Causa raíz localizada

Clasificación:

`PROJECT_FINANCIAL_CONFIGURATION_METADATA_NOT_MATERIALIZED_IN_CANONICAL_PROJECTS_BEFORE_NORMALIZATION`

En `app/adapters/tya-c6-unified-human-runtime-v1.js`, `applyProjectFinancialConfiguration()`:

1. llama a `CX.projectFinancialModel.normalizeAll()` sobre proyectos que todavía traen el modelo directo/local y regalía 10;
2. publica después un marcador global delegado/0;
3. aplica honorarios a visitas/postulaciones cuando faltan;
4. no materializa primero la configuración del proyecto en cada objeto canónico de periodo/proyecto.

Resultado: dos verdades simultáneas — objetos canónicos directos/10 y marcador de configuración delegado/0.

## 8. Correctivo requerido

El siguiente bloque debe ser focalizado y source-only antes de cualquier nuevo deploy:

1. materializar la configuración financiera explícita del proyecto en todos los periodos canónicos por llave `tenantId/projectId/parentProjectId/program`, nunca por nombre visual;
2. ejecutar después `normalizeAll()`;
3. garantizar que `d.period()`, `d.project()`, Finanzas y el marcador global reporten la misma verdad;
4. agregar gate predeploy de consistencia que falle si el objeto canónico y la configuración divergen;
5. repetir gates estáticos/locales sin provider writes;
6. solo con PASS solicitar un único deploy DEV nuevo.

## 9. Estado seguro

- Hosting deploys de este macro-bloque: 1.
- Segundo deploy: 0.
- Cloud Run/Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos: 0.
- Password changes/resets: 0.
- Credenciales/tokens expuestos: 0.
- Merge: false.
- Producción: false.
- `STOP_RETRY`: activo.
