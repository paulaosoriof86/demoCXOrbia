# CAMBIOS BACKEND — C6 RECUPERACIÓN DE BASELINE ACUMULATIVA ÚNICA

**Fecha:** 2026-08-01  
**Estado:** `ROOT_FIX_CODE_APPLIED__STATIC_SOURCE_REVIEW_PASS__PENDING_READONLY_RUNTIME_GATES_AND_FRESH_DEV_DEPLOY_AUTHORIZATION`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. P0 humano que supersede el cierre anterior

La validación humana del Hosting DEV demostró que el último build no era la baseline acumulativa aprobada. La entrada directa mantenía parte de la HR, pero abría una experiencia reducida y fragmentada:

- Shopper sin identidad autenticada;
- Dashboard con julio seleccionado y agosto fabricado por reloj;
- KPIs y flujo por fases calculados por lógicas distintas;
- comparativo sin todos los periodos vivos de HR;
- perfiles, WhatsApp, credenciales y certificaciones no proyectados;
- identidades Shopper repetidas/no reconciliadas;
- Portal Cliente sin todas las mejoras ya aceptadas;
- Finanzas sin la configuración contractual correcta del proyecto en la experiencia humana.

El PASS postdeploy anterior queda conservado únicamente como evidencia técnica parcial. No congela Corte 6.

## 2. Autoridad recuperada

La recuperación no selecciona pantallas aisladas ni crea otra candidata. Parte del HEAD vivo y recompone una sola experiencia con las autoridades ya aprobadas:

| Dominio | Autoridad vigente recuperada |
|---|---|
| Login | `PASS_EXISTING_HOSTING_DEV_SINGLE_LOGIN_REMOTE_VERIFIED` · commit `c6f1638e...` |
| Histórico completo | R20 `all_verified_or_detected_hr_periods` · commit `f9e7f65b...` |
| Dominio/Finanzas/Shopper | `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE` · commit `e8cc8301...` |
| Operación | HR viva, todos los periodos detectados; nunca cifras congeladas |
| Perfil/certificación | Firestore protegido como overlay por crosswalk exacto |
| Honorarios Shopper | configuración Cinépolis: GT Q60 / HN L200 |
| Modelo financiero | Cinépolis delegado; comisión de coordinación compartida; regalías 0 |
| UI | módulos aprobados existentes; sin rediseño desde backend |

## 3. Causa raíz estructural

El índice publicado activaba dos carriles incompatibles:

1. un carril humano `source-safe` que deshabilitaba Firebase Auth y restauraba sesiones sintéticas;
2. un carril protegido separado que sí tenía identidad real y composición canónica.

Además, los adapters que corregían estados, comparativos, perfiles, certificaciones y Portal Shopper dependían de un token visual oculto. La URL normal de Paula no los activaba.

Por eso los archivos correctos podían existir en la rama y, simultáneamente, no formar parte de la experiencia humana publicada.

Se detectó además una regresión documental y de configuración financiera: Cinépolis había quedado descrito como proyecto directo con regalías, aunque el modelo ya aprobado era delegado.

## 4. Delta focal aplicado

### `app/index-backend-dev.html`

- La entrada humana normal se normaliza como `authenticated-human-canonical`.
- Activa el runtime protegido y los adapters canónicos en la misma URL.
- Conserva el carril E2E técnico solo cuando existe su token explícito.
- Elimina del build humano el cargado de:
  - `adapters/tya-dev-entry-auth-gate-v1.js`;
  - `adapters/tya-dev-full-visual-bridge.js`.
- Carga `adapters/tya-project-financial-model-contract-v1.js` después de la configuración del proyecto y antes del motor financiero.
- Conserva dominio, Portal Shopper, Finanzas y módulos frontend vigentes.
- Sustituye conteos congelados por el contrato dinámico de todos los periodos y visitas de HR.

### `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`

- valida fuente HR source-safe y no vacía;
- acepta cualquier cantidad vigente de periodos, visitas y shoppers;
- exige llaves completas y únicas;
- conserva exactamente los periodos y visitas de la revisión;
- prohíbe append protegido y duplicados;
- permite incorporar agosto cuando exista realmente en HR;
- no usa 14/616/208 como invariantes permanentes.

### `app/adapters/tya-project-financial-model-contract-v1.js`

Nuevo contrato reusable que:

- normaliza proyectos existentes;
- envuelve `CX.data.addProject` para preservar la selección realizada al crear cada proyecto;
- distingue `directo/local_invoicing` de `delegado/delegated_coordination`;
- permite regalías únicamente en proyectos facturados localmente;
- fuerza `regalias=0` y `royaltyApplicable=false` en proyectos delegados;
- clasifica Cinépolis como delegado;
- registra la compensación delegada como `coordination_commission_shared`;
- conserva monto, participantes y porcentajes del reparto como configuración pendiente, sin inventarlos;
- no ejecuta writes de proveedor ni producción.

### `app/core/tya-phase-a-source-safe-preview.js`

Se corrigió la fuente de configuración de Cinépolis:

- `modelo:'delegado'`;
- `billingModel:'delegated_coordination'`;
- `localBilling:false`;
- `regalias:0`;
- `royaltyApplicable:false`;
- `compensationModel:'coordination_commission_shared'`;
- honorarios Shopper GT Q60 / HN L200;
- comisión y reparto configurables, sin valores inventados;
- tratamiento tributario no inferido automáticamente.

No se modificó la HR ni se registró un monto de comisión inexistente.

### `app/adapters/tya-c6-unified-human-runtime-v1.js`

- mantiene Auth/claims, HR viva y comparativo histórico completo;
- aplica Q60/L200 cuando HR no repite el honorario del shopper;
- expone Cinépolis como delegado;
- elimina la metadata incorrecta `model:'directo' / royalty:10`;
- publica `royaltyApplicable:false`, `royalty:0` y comisión compartida configurable;
- no sobrescribe montos financieros exactos.

### `app/adapters/tya-dev-technical-auth-e2e-v1.js`

- solo se activa con token técnico;
- preserva Auth/claims staff/shopper;
- no se ejecuta en la ruta humana;
- no reintroduce el override de roles;
- no contiene credenciales ni habilita writes.

### `tools/qa/tya-c6-unified-cumulative-runtime-gate.mjs`

El gate exige ahora:

- una sola entrada humana autenticada;
- HR dinámica completa;
- E2E técnico aislado;
- selector directo/delegado existente al crear proyectos;
- carga del contrato financiero antes del motor de Finanzas;
- Cinépolis delegado;
- regalías Cinépolis 0;
- comisión compartida sin valores inventados;
- cálculo de ISR/regalías únicamente cuando `modelo==='directo'`;
- ausencia de agosto sin fuente;
- cero writes y producción.

## 5. Archivos preservados

- `app/modules/proyecto-wizard.js`: preservado; ya contenía la selección directo/delegado y muestra regalías solo en el bloque directo.
- resto de `app/modules/*`: sin cambios.
- `app/core/data.js`, `app.js`, `backend-browser-auth.js`: sin reescritura.
- HR, Firestore, Auth, Rules, Storage, Cloud Run, Make, Gemini, pagos: cero writes.
- Hosting DEV: cero deploys en este bloque.
- Producción `tya-plataforma`: intacta.
- Merge: false.

## 6. Validación alcanzada y pendiente

Alcanzado por revisión de fuentes en GitHub:

- contrato de modelo financiero aplicado;
- orden de carga corregido;
- configuración Cinépolis corregida;
- metadata runtime corregida;
- gate estático actualizado;
- contradicciones documentales principales corregidas.

No se afirma todavía ejecución de runtime/browser ni PASS remoto. El HEAD no tiene un workflow ejecutado para este bloque.

Secuencia siguiente:

`STATIC GATE EXECUTION → LOCAL/READ-ONLY RUNTIME → AUTH REAL STAFF/CLIENT/SHOPPER → HR ALL PERIODS → KPI=PHASE=DRILL → COMPARATIVE ALL PERIODS → PROFILE/CERT/HISTORY → CLIENT → FINANCE SOURCE + PROJECT MODEL → 3 RELOADS → EVIDENCE`.

Solo con PASS corresponde solicitar autorización fresca para un único deploy del Hosting DEV existente.

## 7. Clasificación

- **Reusable CXOrbia:** runtime único, ownership de fuente dinámico y contrato de modelo financiero por proyecto.
- **Exclusivo TyA:** Cinépolis delegado, Q60/L200 y comisión de coordinación compartida.
- **Claude/prototipo:** preservar selector y consumir el contrato; no recalcular regalías por pantalla.
- **Academia:** trazabilidad, no regresión acumulativa y diferenciación facturación local/delegada.
- **Sin impacto proveedor:** cero deploy y cero writes.
