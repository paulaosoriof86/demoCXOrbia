# RECONSTRUCCIÓN DE CANDIDATA ACUMULATIVA — MATRIZ MAESTRA VIVA

**Inicio:** 2026-08-02  
**Estado:** `RECONSTRUCTION_ACTIVE__FAMILY_A_CONTRACT_DEFINED__FAMILY_B_INVENTORY_ACTIVE__NO_DEPLOY__NO_PRODUCTION`  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge  
**HEAD de arranque:** `c646af04b8fba0ca8685fa4d6ce0a46e62221276`

## 1. Propósito vinculante

Reconstruir una sola candidata acumulativa con la mejor versión demostrable de cada módulo y todas sus dependencias. La selección no se hace por número nominal, último deploy ni estado actual del HEAD. Cada módulo debe quedar conectado a evidencia de proveniencia, aprobación, SHA, fuente y compatibilidad.

Hasta cerrar A+B quedan suspendidos los diagnósticos C6 aislados, nuevos deploys, nuevas candidatas, shells reducidos, ramas/PR paralelos y correcciones de síntomas no vinculadas a la composición acumulativa.

## 2. Estados permitidos

- `APPROVED_AND_PRESENT`;
- `BEST_APPROVED_RESTORE`;
- `RECONCILIATION_REQUIRED`;
- `BEST_TECHNICAL_PENDING_VISUAL`;
- `RETIRED_BY_EXPLICIT_DECISION`.

No se permite estado final `UNKNOWN`.

## 3. Campos mínimos por módulo

1. módulo funcional;
2. ruta principal;
3. core/estilos/adapters relacionados;
4. SHA/blob actual;
5. candidata/commit de origen;
6. última evidencia humana/freeze;
7. dependencias;
8. estado de proveniencia;
9. acción;
10. SHA objetivo;
11. gate técnico;
12. gate visual.

## 4. Familias

- **A:** shell, login, tenant, navegación, `CX.data`, HR, Auth, Proyecto/Periodo, build y caché.
- **B:** CRM Ops Leads, Dashboard, Hojas de Ruta, Clientes, Comercial y Marketing.
- **C:** operación e histórico.
- **D:** experiencia Shopper.
- **E:** Finanzas.
- **F:** portales y reportes.
- **G:** administración, integraciones y Academia.

Academia se documenta, pero no bloquea CRM Ops Leads/Phase A salvo P0 demostrado.

## 5. Anclas preservadas

### V182 incremental

| Archivo | Blob V182 | Blob actual | Decisión |
|---|---|---|---|
| `app/app.js` | `d509d08bd20dd2e44fa414e0b4d2819dd18f7c36` | igual | preservar |
| `app/modules/beneficios.js` | `73e200e57530479637792c89c644fcfdf78b6799` | igual | preservar |
| `app/styles/layout.css` | `2cea8372cad099cb4610b93744824e4596b04adc` | igual | preservar pendiente visual |
| `app/core/finanzas-core.js` | `ca1811366180eedbc910f2fbf8cfb2a75a242997` | `6d3f46f003f3319f96cfd759b8b5ed52afc6a125` | reconciliar fixes posteriores |
| `app/modules/finanzas.js` | `42a3394065fcf8853450d29fba4c90e6ded397be` | `623fab9ba1e06c39f83beda610bb771e23910a07` | reconciliar fixes posteriores |

### PASS técnicos

- 14 periodos y 616 visitas;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- `tya::cinepolis` delegado;
- localBilling false;
- regalía 0;
- Q60/L200;
- 14 delegados, 0 directos, 0 sin configurar, 0 violaciones.

## 6. Familia A — contrato definido

Fuente detallada:

`RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-A-CONTRATO-Y-PRECEDENCIA-20260802.md`.

### Precedencia

`SHELL/INTERFAZ CX.DATA → TENANT/PROYECTO → HR VIVA → READ MODEL → SEMÁNTICA CANÓNICA → AUTH/OVERLAYS EXACTOS → FINANZAS → WRITE GUARDS → ROUTER/MÓDULOS → BUILD-LOCK/SW`.

### Identidades

- tenant: `tya`;
- proyecto: `cinepolis`;
- periodo: `cinepolis-YYYY-MM`;
- marca visual separada de la llave técnica.

### Decisiones principales

| Componente | Estado |
|---|---|
| `app/app.js` | `PRESERVE` |
| `app/styles/layout.css` | `PRESERVE_PENDING_VISUAL` |
| `app/core/config.js` | `RECONCILE_TENANT_BRAND_DATA_MODE` |
| `app/core/data.js` | `PRESERVE_INTERFACE_RECONCILE_AUTHORITY` |
| `app/core/store.js` | `PRESERVE_UI_STATE_ONLY` |
| `app/core/router.js` | `PRESERVE_WITH_SCOPE_GATE` |
| `backend-firebase.js` | `RECONCILE_NORMALIZERS` |
| `backend-cxdata-read-guard.js` | `RECONCILE_OR_RETIRE_AS_AUTHORITY` |
| `backend-cxdata-readonly-corte4.js` | `PRESERVE_WRITE_BLOCK_ONLY` |
| protected DEV overlays | `DEV_ONLY_RECONCILE` |
| cumulative read model | `PRESERVE_CANONICAL` |
| canonical state semantics | `PRESERVE_AFTER_READ_MODEL` |
| finance contract | `PRESERVE_PRECEDENCE` |
| live source legacy defaults | `RECONCILE` |
| domain consistency bridge | `MIGRATE_LOGIC_AND_RETIRE_DOM_AUTHORITY` |
| unified runtime | `PRESERVE_ORCHESTRATION_RECONCILE_PATCHES` |
| build-lock V174 | `REPLACE_AT_ASSEMBLY` |
| `sw.js` | `PRESERVE_NETWORK_FIRST_REBUILD_CACHE_ID` |

## 7. Familia B — inventario inicial

Fuente detallada:

`RECONSTRUCCION-CANDIDATA-ACUMULATIVA-FAMILIA-B-INVENTARIO-INICIAL-20260802.md`.

| Módulo | Blob actual | Estado provisional | Acción |
|---|---|---|---|
| Dashboard | `e879fc3f1dd5a7486762b197346cadd086e1d99d` | `RECONCILIATION_REQUIRED` | unificar fases/comparativos con semántica canónica |
| CRM | `6a6ff1c964eff4f25ecaf33b028335bfc62810ee` | `BEST_TECHNICAL_PENDING_SOURCE_AND_VISUAL` | preservar suite; pending-source sin backend CRM |
| Clientes | `9c3c98605f4fb2e22d66b241607c9dd70c45d159` | `RECONCILIATION_REQUIRED_FAKE_SEEDS` | retirar contactos/prospectos ficticios en conectado |
| Comercial | `61aaee6432e4a4206b07f8633d158b8d2b2c2271` | `RECONCILIATION_REQUIRED_FINANCIAL_CONTRACT` | consumir modelo financiero por proyecto |
| Marketing | `6bfe1b4e3dbed12ead8a88404cdb495dbf1b8e83` | `RECONCILIATION_REQUIRED_DEMO_AND_INTEGRATION_GATES` | no fixtures ni Gemini/Make sin gate |
| Hojas de Ruta | `1da95ce4a808dafd7553ad9082056da7009e4920` | `PRESERVE_UI_RECONCILE_SOURCE_AND_ACTION_GATES` | HR viva y proyecto/periodo canónicos |

## 8. Causa raíz transversal A+B

- varias autoridades redefinen datos y métodos después de cargar módulos;
- Dashboard puede depender de bridges para corregir su propia semántica;
- CRM/Comercial son localStorage-first;
- Clientes/Marketing contienen seeds que parecen reales;
- Hojas de Ruta mezcla fuente real con acciones no activadas;
- build-lock/caché no identifican el estado acumulativo actual.

La composición objetivo debe conservar la mejor UI y eliminar únicamente la autoridad falsa, duplicada o no gateada.

## 9. Checkpoint Visual 1

Paula revisará sobre un solo build A+B:

- login, shell, tenant, proyecto, periodo, fuente y navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No se avanza a C+D sin aprobación visual del build exacto.

## 10. Gates source-only A+B

- interfaz completa `CX.data`;
- una sola autoridad tenant/proyecto/periodo/fuente;
- no-demo/no-fixtures en modo conectado;
- no normalización inventada;
- tile ↔ drilldown ↔ semántica canónica;
- contrato financiero en Comercial;
- integraciones Make/Gemini/web gateadas;
- Hojas de Ruta con HR viva;
- build-lock/manifest/SW mismo build ID.

## 11. Pendientes inmediatos

- recuperar aprobaciones/commits históricos A+B;
- inspeccionar `operacion-extra.js`, `cliente-insights.js` y overlays que alteran Dashboard/Cliente/CRM;
- identificar mejoras posteriores no cargadas o reemplazadas;
- fijar SHA objetivo por archivo;
- producir delta completo y gates.

## 12. Secuencia vigente

`OVERLAYS/EXTRAS B → PROVENIENCIA/APROBACIONES → SHAS OBJETIVO A+B → DELTA COMPLETO → GATES SOURCE-ONLY → ÚNICO DEV → CHECKPOINT VISUAL 1`.

## 13. Estado seguro

- cambios funcionales: 0;
- Hosting deploy: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: false.

## 14. Clasificación

- **Reusable CXOrbia:** matriz por SHA, autoridad única y fail-closed por fuente.
- **Exclusivo cliente:** TyA/Cinépolis, HR y configuración financiera.
- **Claude/prototipo:** mejor UI por módulo y retiro de autoridad demo/bridge.
- **Academia:** contenido alineado al build visualmente aprobado.
- **Sin impacto Claude:** hashes, gates, manifest, build-lock y caché.
