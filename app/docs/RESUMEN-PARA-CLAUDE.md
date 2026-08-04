# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `PHASE_A_FINAL_COMPOSITION_MANIFEST_SOURCE_COMPLETE__STATIC_GATE_PENDING_EXECUTION__NO_PRODUCTION`

## 1. Baseline única

Continuar exclusivamente sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- HEAD source-only vigente posterior a los commits de manifest/gate;
- árbol funcional `app/` exacto al source lock C6 desplegado `b908daa8c9cce0bd1c06cb05e3aceb9ff1b98beb`.

No crear otra candidata, shell, rama, PR, Firebase, Hosting o metodología.

## 2. Corrección metodológica vinculante

El checkpoint A+B centrado en CRM/Clientes/Comercial/Marketing quedó anulado.

La única candidata válida es la composición Phase A completa con:

- entrada/contexto/navegación;
- Dashboard, Mi Día, Histórico y refresh;
- Visitas, Ficha, Revisión, Postulaciones y Reservas;
- Shoppers y experiencia por perfiles;
- Finanzas completa;
- Portal Cliente y Portal Shopper;
- Reportes Admin/Cliente/Shopper y exportaciones;
- smoke multirol, recarga y nueva pestaña.

CRM Ops Leads, Clientes comerciales, Comercial y Marketing se preservan como trabajo posterior.

## 3. Autoridades ya cerradas

Autoridades históricas preservadas:

- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 frozen/aprobado;
- Corte 2A/V174 frozen/aprobado;
- Corte 3/V182 frozen active baseline;
- C6 entrada por perfiles, HR, Staff, Shopper, Cliente, Finanzas y Reservas técnicamente PASS.

Resultado de recuperación por blobs:

`29_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED`.

También quedaron cerradas:

- Ficha de visita;
- Revisión Admin;
- Documentos;
- Costos;
- `cliente-data.js`.

No restaurar versiones anteriores completas ni reescribir módulos aprobados.

## 4. Manifest final y gate

Fuentes nuevas obligatorias:

- `COMPARACION-SHAS-PHASE-A-BLOQUE4-AUTORIDADES-Y-COMPOSICION-20260804.md`;
- `MANIFEST-PHASE-A-COMPLETA-FINAL-COMPOSICION-20260804.json`;
- `CAMBIOS-BACKEND-ADDENDUM-PHASE-A-MANIFEST-FINAL-Y-GATE-SOURCE-STATIC-20260804.md`;
- `ACADEMIA-IMPACTO-PHASE-A-MANIFEST-FINAL-Y-GATE-COMPOSICION-20260804.md`;
- `tools/qa/tya-phase-a-complete-composition-source-gate.mjs`.

El gate valida blobs, archivos locales, orden de carga, módulos, navegación, report kit, dependencias, secrets y warnings de exportación.

Estado real:

`SOURCE_STATIC_GATE_CREATED_NOT_EXECUTED`.

No afirmar PASS hasta ejecutarlo sobre un checkout autenticado del HEAD exacto.

## 5. Report kit y exportadores

Proveedor:

`app/modules/cliente-extra.js` → `CX.reportKit`.

Consumidores:

- Admin `informes`: `app/modules/operacion-extra.js`;
- Shopper `mireportes`: `app/modules/operacion-extra.js`;
- Cliente `cli_reportes`: `app/modules/cliente-extra.js`;
- Finanzas: `app/modules/finanzas.js`.

Formatos:

- PDF;
- XLSX;
- PPTX.

Pendientes no bloqueantes:

- algunas gráficas no aparecen en ciertas rutas PDF;
- Excel conserva presentación básica.

## 6. Overlay superseded

El entrypoint todavía carga:

`app/adapters/tya-ab-cumulative-composition-v1.js`.

Clasificación:

`P1_SUPERSEDED_LOADED_OVERLAY__NOT_P0_PROVEN`.

No eliminar ni modificar sin que el gate acumulativo pruebe que el delta no pierde autoridad o comportamiento Phase A.

## 7. Trabajo permitido para Claude

No tocar la rama canónica ni módulos actuales.

Trabajo portable separado permitido:

- Login React presentacional;
- tokens CSS;
- i18n ES/EN;
- órbita y branding;
- FAB comercial accesible;
- selector multi-país;
- mockup de ficha shopper;
- inventario de rebranding visible.

Prohibido:

- Auth real;
- JWT/localStorage;
- PII/rol en URL;
- backend;
- `data.js`;
- HR adapter;
- módulos legacy;
- nueva candidata;
- deploy.

## 8. DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No solicitar todavía capturas ni aprobación visual.

## 9. Siguiente bloque exacto

`OBTENER CHECKOUT AUTENTICADO → EJECUTAR GATE SOURCE/STATIC SOBRE HEAD EXACTO → SI PASS, EJECUTAR RUNTIME MULTIROL; SI FAIL, APLICAR UN SOLO DELTA PROBADO`.

Después:

- único DEV solo si cambia `app/`;
- `CHECKPOINT_VISUAL_PHASE_A_COMPLETA`;
- freeze;
- agosto/disponibles/postulaciones;
- cutover autorizado.

## 10. Estado seguro

- archivos funcionales modificados en este bloque: 0;
- deploy: 0;
- Firestore/Auth/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
