# RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA — MATRIZ MAESTRA VIVA

**Inicio:** 2026-08-02  
**Estado:** `A_PLUS_B_SOURCE_ASSEMBLED__PRECHECK_PASS__EXACT_CHECKOUT_GATE_PENDING__NO_DEPLOY__NO_PRODUCTION`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD anterior al delta funcional A+B:** `754639e0c0682c638cc799fd26bfcd2c744b0b6a`

## 1. Propósito prevalente

Reconstruir una sola candidata acumulativa con la mejor versión demostrable de cada módulo y todas sus dependencias. La selección se basa en aprobación, origen, SHA y compatibilidad; nunca en número nominal, último deploy o memoria informal.

Hasta aprobar visualmente A+B quedan suspendidos:

- diagnósticos C6 aislados;
- shells reducidos;
- candidatas/ramas/PR paralelos;
- expansión a familias posteriores sin P0 transversal;
- deploy, freeze, merge y producción.

## 2. Autoridades recuperadas

### M1 / Corte 1

- build visual aprobado: `67c0943260f076f5686284ac509458ed5fd34dbd`;
- estado: `CORTE_1_M1_APROBADO_CON_P1_P2_DOCUMENTADOS`;
- fuente: `VALIDACION-VISUAL-Y-LOCK-ANTI-REGRESION-CORTE1-M1-20260722.md`.

### Corte 2A / V174

- estado documentado: `FROZEN/APROBADO`;
- el delta V174 no modificó los módulos A+B;
- `build-lock.js` V174 quedó obsoleto después de bloques posteriores y no prueba la composición actual.

### Corte 3 / V182

- baseline: `CXORBIA-TYA-CORTE3-V182-20260729`;
- A+B preserva exactamente:
  - `app/app.js` blob `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36`;
  - `app/styles/layout.css` blob `2cea8372cad099cb4610b93744824e4596b04adc`.

### Fixes C6 posteriores

Se preservan como dependencias técnicas, no como sustituto de validación visual:

- entrada humana autenticada;
- HR viva de 14 periodos y 616 visitas;
- identidad Shopper exacta;
- Cliente `tya/cinepolis`;
- modelo financiero delegado, localBilling false, regalía 0, Q60/L200.

## 3. Contrato Familia A

Precedencia:

`SHELL/CX.DATA → TENANT/PROYECTO → HR VIVA → READ MODEL → SEMÁNTICA CANÓNICA → AUTH/OVERLAYS EXACTOS → CONFIGURACIÓN FINANCIERA → WRITE GUARDS → ROUTER/MÓDULOS → BUILD-LOCK/SW`.

Identidades:

- tenant técnico: `tya`;
- proyecto: `cinepolis`;
- periodos: `cinepolis-YYYY-MM`;
- marca visual separada de la llave técnica;
- localStorage no concede Auth, rol, tenant ni scope;
- Firestore solo enriquece por llaves exactas;
- HR gobierna estado operacional.

## 4. Matriz A+B cerrada por SHA

| Superficie | Git blob objetivo | Origen | Estado | Acción |
|---|---|---|---|---|
| `app/index.html` | `3855486bdddcfcdc2c702f08b2a640d99717d980` | M1 aprobado | `APPROVED_AND_PRESENT` | preservar |
| `app/index-backend-dev.html` | `b9a4aaf063d97305c3f4f53eba8f02b526d61761` | runtime C6 + composición A+B | `BEST_TECHNICAL_PENDING_VISUAL` | gate + visualizar |
| `app/app.js` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | V182 frozen | `APPROVED_BASE_PRESENT` | preservar + revalidar runtime |
| `app/styles/layout.css` | `2cea8372cad099cb4610b93744824e4596b04adc` | V182 frozen | `APPROVED_AND_PRESENT` | preservar |
| `app/core/config.js` | `0bf7b6c1daded062806d90e03ba2c5d67ac1fe63` | M1 | `APPROVED_AND_PRESENT` | preservar + validar scopes |
| `app/core/router.js` | `fdd3c91c1428d49413fb305ed464dffdc6ea3e13` | M1 | `APPROVED_AND_PRESENT` | preservar + validar navegación |
| `app/core/store.js` | `c6921e26773c866ba0b0ac0b725f4660e47742a5` | M1 | `APPROVED_AND_PRESENT` | UI state, no Auth authority |
| `app/core/data.js` | `3a679020205617e44126ec586e0022edc70b0512` | M1 | `APPROVED_INTERFACE_PRESENT` | preservar interfaz `CX.data` |
| `app/core/data-source.js` | `6149dff1d91b83af007badbaafdef63f00c34d1f` | M1 | `APPROVED_AND_PRESENT` | preservar + overlay conectado |
| `app/core/permissions.js` | `bedc4f8bbc80dba9f03e34ec6bbcf9cfeeb2a1d5` | M1 | `APPROVED_AND_PRESENT` | validar claims |
| `app/modules/dashboard.js` | `e879fc3f1dd5a7486762b197346cadd086e1d99d` | M1 | `APPROVED_UI_PRESENT_RUNTIME_RECONCILIATION_REQUIRED` | preservar módulo; validar composición |
| `app/modules/crm.js` | `6a6ff1c964eff4f25ecaf33b028335bfc62810ee` | ancestro M1 sin cambios | `BEST_TECHNICAL_PENDING_VISUAL` | preservar UI; ocultar fixtures |
| `app/modules/clientes.js` | `9c3c98605f4fb2e22d66b241607c9dd70c45d159` | ancestro M1 sin cambios | `BEST_TECHNICAL_PENDING_VISUAL` | preservar UI; retirar sintéticos |
| `app/modules/comercial.js` | `61aaee6432e4a4206b07f8633d158b8d2b2c2271` | ancestro M1 sin cambios | `BEST_TECHNICAL_PENDING_VISUAL` | preservar herramienta; validar contrato/copy |
| `app/modules/marketing.js` | `6bfe1b4e3dbed12ead8a88404cdb495dbf1b8e83` | ancestro M1 sin cambios | `BEST_TECHNICAL_PENDING_VISUAL` | preservar UI; ocultar fixtures/gatear integraciones |
| `app/modules/rutas.js` | `1da95ce4a808dafd7553ad9082056da7009e4920` | ancestro M1 sin cambios | `BEST_TECHNICAL_PENDING_VISUAL` | HR viva + acciones gateadas |
| `app/adapters/tya-ab-cumulative-composition-v1.js` | `9c0d76382531b8393cc0866ec694935a2a5e25a6` | reconstrucción A+B | `NEW_SOURCE_PRECHECK_PASS` | ejecutar gate exacto |
| `app/adapters/tya-c6-domain-consistency-bridge.js` | `81f1e5807dfe18e0f53a348813b98fe353eeb7a1` | C6 | `RECONCILIATION_REQUIRED_VISUAL_DEPENDENCY` | preservar para checkpoint, validar resultado |
| `app/adapters/tya-c6-unified-human-runtime-v1.js` | `7c00752d9a34209366f3c328ea3e5f5fddb4e1db` | C6 | `TECHNICAL_PASS_VISUAL_REVALIDATION_REQUIRED` | preservar + validar |
| `app/adapters/tya-project-financial-model-contract-v1.js` | `333f5fd204cba2c53eefe8f98acb27a4502da166` | root fix financiero | `REMOTE_TECHNICAL_PASS` | preservar |
| `app/core/build-lock.js` | `717dd4a40e3a24c380089cf22596e04fc8c25da1` | V174/R20 | `REPLACE_AFTER_SOURCE_GATES` | no congelar todavía |

La autoridad ejecutable completa está en:

`app/docs/MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`.

## 5. Delta A+B aplicado sobre la rama viva

### Nuevo adapter

`app/adapters/tya-ab-cumulative-composition-v1.js`

Commits:

- `b8c5323b9887fc97375f805cec9320dfc8b9afa7`;
- corrección de mutabilidad: `4c5f0d829efe0094707235fab1472539d950b81e`.

Responsabilidad:

- carril humano autenticado canónico únicamente;
- no reescribe módulos frontend;
- elimina en memoria los dos prospectos sintéticos conocidos;
- elimina contactos placeholder sin proveniencia;
- oculta fixtures CRM y Marketing;
- conserva registros creados por usuario con proveniencia `platform_user`;
- alinea Marketing al periodo activo;
- conserva HR, `CX.data`, Auth y contrato financiero;
- cero localStorage destructive writes y cero provider writes.

### Entrada DEV

`app/index-backend-dev.html`

Commit: `90d6c045c9ad7aaee284ad69bbbb146fbbd09326`.

Carga el adapter una sola vez después de los módulos y antes de los bridges C6.

## 6. Gates

### Unit gate

`tools/qa/tya-ab-cumulative-composition-unit.mjs`

Resultado ejecutado sobre copia exacta del Git blob del adapter:

`PASS` — 23 verificaciones.

### Source gate integral

`tools/qa/tya-ab-cumulative-candidate-source-gate.mjs`

Valida:

- manifest y Git blobs;
- orden/carga única;
- sintaxis;
- ausencia de llamadas a proveedores;
- unit gate;
- estado honesto por módulo;
- build-lock todavía no congelado.

Estado honesto:

`READY_NOT_EXECUTED_IN_CURRENT_CONNECTOR_SESSION`.

La sesión actual no ofrece checkout autenticado ni dispatch de workflow. Debe ejecutarse sobre el HEAD exacto antes de cualquier deploy. No se afirma PASS integral todavía.

Evidencia:

`EVIDENCE-A-B-CUMULATIVE-SOURCE-PRECHECK-20260802.json`.

## 7. Scope lock

Diferidos sin cambios durante A+B:

- Operación/Shopper → C/D;
- Finanzas completa → E;
- Portal Cliente, reportes e Insights → F;
- administración, integraciones y Academia → G.

Solo un P0 transversal demostrado permite abrirlos.

## 8. Checkpoint Visual 1

Paula revisará el mismo build acumulativo:

- login/shell/tenant/proyecto/periodo/fuente/navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

Ningún PASS técnico sustituye esta revisión.

## 9. Pendiente real

1. ejecutar source gate y gates estáticos/cumulativos sobre checkout exacto;
2. detener con `STOP_RETRY` ante cualquier fallo;
3. solo con PASS, solicitar autorización para un único Hosting DEV;
4. validar visualmente A+B;
5. corregir sobre la misma candidata;
6. generar build-lock/freeze únicamente después de PASS visual.

## 10. Estado seguro

- módulos frontend reescritos: 0;
- Hosting deploy: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: false.

## 11. Clasificación

- **Reusable CXOrbia:** manifest SHA, composición por proveniencia y supresión de fixtures.
- **Exclusivo cliente:** TyA/Cinépolis, HR y contrato delegado.
- **Claude/prototipo:** UI preservada y pendiente de validación visual.
- **Academia:** actualización posterior al Checkpoint Visual 1.
- **Sin impacto Claude:** gates, evidence, hashes y continuidad.
