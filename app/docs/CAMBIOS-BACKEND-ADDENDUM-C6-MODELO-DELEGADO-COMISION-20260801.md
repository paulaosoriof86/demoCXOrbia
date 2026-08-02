# CAMBIOS BACKEND — C6 MODELO DELEGADO Y COMISIÓN DE COORDINACIÓN

**Fecha:** 2026-08-01  
**Estado:** `CODE_APPLIED__SOURCE_REVIEW_PASS__STATIC_AND_RUNTIME_EXECUTION_PENDING`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Corrección prevalente

Las regalías no son una regla global. Solo pueden aplicar a proyectos con facturación local y configuración explícita.

Los proyectos delegados no tienen regalías locales. Su ingreso corresponde a una comisión de coordinación que se distribuye según la configuración del proyecto. No se inventan monto, participantes, porcentajes ni tratamiento tributario.

Cinépolis está configurado como proyecto delegado. Esta clasificación proviene de su `projectConfig`; no se hardcodea por nombre en el contrato reusable.

## 2. Hallazgo adicional de causa raíz

Aunque el motor existente ya calculaba ISR y regalías solo para `modelo==='directo'`, `CX.fin.honRecibe()` usaba el honorario del shopper como fallback cuando `honRecibe` no estaba configurado.

En un proyecto delegado eso podía convertir indebidamente el honorario pagado al shopper en ingreso recibido y producir margen falso.

## 3. Delta aplicado

### `app/adapters/tya-project-financial-model-contract-v1.js`

- La clasificación se obtiene exclusivamente de la configuración del proyecto.
- Soporta `directo`, `delegado` y `regional`.
- `delegado` y `regional` quedan con:
  - `localBilling=false`;
  - `regalias=0`;
  - `royaltyApplicable=false`;
  - comisión/distribución configurable;
  - cero valores inventados.
- Envuelve `CX.data.addProject` para preservar y normalizar el modelo seleccionado.
- Cinépolis no se reconoce por nombre; su fuente vigente ya declara `modelo:'delegado'`.

### `app/adapters/tya-delegated-coordination-finance-guard-v1.js`

Nuevo guard reusable que:

- elimina el fallback de ingreso delegado desde el honorario del shopper;
- obtiene la comisión únicamente de configuración explícita por periodo/país, país, total o tarifa por visita declarada;
- conserva `honRecibe` solo cuando existe como configuración explícita;
- fija ISR y regalías locales en cero para delegado/regional;
- mantiene honorarios y reembolsos del shopper como obligaciones separadas;
- calcula margen solo cuando comisión y monto distribuido tienen fuente exacta;
- si falta alguna fuente, marca `financialReviewRequired` y no fabrica margen;
- nunca infiere participantes ni porcentajes.

### `app/index-backend-dev.html`

Carga el guard después del read model financiero canónico y antes de los módulos UI.

### `tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`

El gate exige ahora:

- clasificación por configuración, no por nombre;
- soporte backend Local/Delegado/Regional;
- Cinépolis delegado desde su fuente de proyecto;
- regalías 0 para no locales;
- ausencia del fallback honorario Shopper → ingreso;
- margen delegado solo con comisión y distribución exactas;
- cero valores inventados;
- orden de carga correcto.

El gate registra como warnings frontend, sin parchar UI desde backend:

1. agregar `Regional` en `app/modules/proyecto-wizard.js`;
2. cambiar el texto de Finanzas delegado que todavía dice “honorario recibido menos pagado al shopper” por comisión de coordinación y reparto configurable.

## 4. Archivos preservados

- `app/modules/*`: sin cambios en este bloque.
- HR, Auth, Firestore, Rules, Storage, Make, Gemini, pagos y producción: cero writes.
- Hosting DEV: cero deploys.
- Merge: false.

## 5. Gate siguiente

`EXECUTE STATIC GATE → READ-ONLY RUNTIME → AUTH STAFF/CLIENT/SHOPPER → HR ALL PERIODS → KPI=PHASE=DRILL → COMPARATIVE → PROFILE/CERT/HISTORY → CLIENT → FINANCE PROJECT MODEL/COMMISSION → 3 RELOADS → EVIDENCE`.

No se afirma todavía PASS Node, browser, remoto ni humano.

## 6. Clasificación

- **Reusable CXOrbia:** modelo financiero configurable y guard de comisión delegada.
- **Exclusivo TyA:** Cinépolis delegado y Q60/L200 al shopper.
- **Claude/prototipo:** opción Regional y copy financiero por archivo, sin reimplementar cálculo.
- **Academia:** diferencia entre ingreso de coordinación y obligación al shopper.
- **Sin impacto proveedor:** cero deploy y cero writes.
