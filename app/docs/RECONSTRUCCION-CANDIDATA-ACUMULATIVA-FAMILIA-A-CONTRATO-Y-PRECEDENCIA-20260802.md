# RECONSTRUCCIÓN ACUMULATIVA — FAMILIA A: CONTRATO Y PRECEDENCIA TÉCNICA

**Fecha:** 2026-08-02  
**Estado:** `FAMILY_A_TECHNICAL_CONTRACT_DEFINED__HISTORICAL_PROVENANCE_AND_VISUAL_A_PLUS_B_PENDING`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Alcance de este bloque

Este bloque no aprueba visualmente la Familia A y no modifica código funcional. Define la composición técnica que debe prevalecer para impedir que adapters y overlays posteriores conviertan la candidata en un shell distinto, una sesión paralela o una lectura contradictoria.

La validación visual de Paula se realizará en el Checkpoint Visual 1 sobre la composición acumulativa A+B, incluyendo CRM Ops Leads, Dashboard y hoja de ruta.

## 2. Contrato base de `CX.data`

La interfaz base nace en `app/core/data.js`. Debe conservar, como mínimo, estas superficies públicas observadas:

### Estado y colecciones

- `projects`;
- `shoppers`;
- `_visitas`;
- `_posts`;
- `currentProjectId`;
- `currentPeriodId`.

### Proyecto, periodo y contexto

- `period()`;
- `project()`;
- `setProject()`;
- `setCurrentProject()`;
- `setCurrentPeriod()`;
- `setProgram()`;
- `setPeriod()`;
- `program()`;
- `projectGroup()`;
- `ctx()`;
- `programBase()`;
- `programKey()`;
- `programs()`;
- `periodsForProgram()`;
- `currentProgramKey()`;
- `proyectos()`;
- `periodosDe()`;
- `proyectoActual()`;
- `clientProjects()`;
- `scopedProjects()`;
- `scopedProyectos()`.

### Operación y semántica

- `visitas()`;
- `posts()`;
- `shoppersFor()`;
- `scopePaises()`;
- `inScope()`;
- `measurementWindow()`;
- `visitFacets()`;
- `visitBucketFns`;
- `kpis()`;
- `phaseFlow()`;
- `setVisitState()`;
- `assignVisit()`;
- `payVisits()`;
- métodos Shopper y de histórico ya consumidos por módulos, incluidos `visitsForShopper()`, `shopperStats()` y equivalentes instalados por la composición canónica.

Regla final:

> Los adapters pueden hidratar, enriquecer y proteger la implementación, pero no eliminar, renombrar, reducir ni cambiar silenciosamente el significado de la interfaz pública consumida por los módulos.

## 3. Identidad canónica de tenant, proyecto y periodo

### Tenant

En modo conectado/protegido la autoridad debe ser el tenant autenticado/configurado por backend:

`tenantId = tya`

No pueden prevalecer como identidad operativa:

- el `CX.BRAND.id` generado en localStorage;
- `tenant-demo`;
- `CXOrbia` como fallback de tenant;
- una marca visual o nombre aproximado.

La marca sigue siendo visual y white-label. No sustituye la llave técnica.

### Proyecto

La identidad canónica del proyecto operativo es:

`projectId = cinepolis`

### Periodo

Cada periodo conserva su identidad propia:

`currentPeriodId = cinepolis-YYYY-MM`

Proyecto y Periodo permanecen separados. `setCurrentProject()` y `setCurrentPeriod()` deben conservar esa separación y el router no puede escribir directamente los IDs por fuera de los mutadores canónicos.

## 4. Precedencia obligatoria de fuentes y adapters

El orden lógico final queda definido así:

1. **Shell y contrato base:** `config.js`, `data-source.js`, `data.js`, `store.js`, permisos y router.
2. **Configuración técnica del tenant/proyecto:** backend config y registro por `tenantId::projectId`.
3. **HR viva:** autoridad exclusiva de periodos, visitas y estado operacional.
4. **Read model acumulativo:** composición de HR con overlays protegidos por llaves exactas.
5. **Semántica canónica:** estados y facetas posteriores al read model.
6. **Auth/claims:** principal, rol, tenant y scopes; nunca derivado de selector visual o localStorage.
7. **Firestore protegido:** solo enriquece identidad exacta, perfil, certificaciones y facetas financieras autorizadas.
8. **Configuración financiera:** materializada por llave técnica antes de normalización/render financiero.
9. **Read-only/write guards:** bloquean escrituras sin cambiar la verdad canónica.
10. **Router y módulos:** consumen una única revisión y una única interfaz.
11. **Runtime acumulativo:** solo coordina la cadena; no debe crear una segunda fuente o una segunda UI.
12. **Build-lock y service worker:** identifican exactamente la candidata ensamblada.

## 5. Decisión por dependencia de Familia A

| Dependencia | Decisión técnica | Condición |
|---|---|---|
| `app/app.js` | `PRESERVE` | Base V182 exacta; Auth integrado debe envolverla sin segunda pantalla |
| `app/styles/layout.css` | `PRESERVE_PENDING_VISUAL` | V182 exacta; responsive se valida en Checkpoint 1 |
| `app/core/config.js` | `RECONCILE` | White-label preservado; tenant operativo y modo conectado no dependen de localStorage/demo |
| `app/core/data.js` | `PRESERVE_INTERFACE_RECONCILE_AUTHORITY` | Mantener interfaz; fixtures/localStorage jamás prevalecen en carril conectado |
| `app/core/store.js` | `PRESERVE_UI_STATE_ONLY` | Bus y continuidad UI; sesión local no concede Auth, tenant, rol o scope |
| `app/core/router.js` | `PRESERVE_WITH_SCOPE_GATE` | Resolver único; roles/scopes vienen de principal autenticado |
| `app/core/backend-firebase.js` | `RECONCILE_NORMALIZERS` | Hidrata sin inventar rating, país, monto, estado o cliente |
| `app/core/backend-cxdata-read-guard.js` | `RECONCILE_OR_RETIRE_AS_AUTHORITY` | Puede normalizar forma, no redefinir estados ni sustituir semántica canónica |
| `app/core/backend-cxdata-readonly-corte4.js` | `PRESERVE_WRITE_BLOCK_ONLY` | En runtime autenticado no puede vaciar datos ni activar carril antiguo source-safe |
| `app/core/backend-protected-dev-mode.js` | `DEV_ONLY_RECONCILE` | No es contrato de producción; métodos duplicados deben delegar al read model canónico |
| `app/core/backend-protected-dev-session-continuity.js` | `DEV_ONLY` | Facilita validación DEV; no define persistencia final de producción |
| `app/adapters/tya-cumulative-read-model-v2.js` | `PRESERVE_CANONICAL` | HR manda; overlays solo por identidad/llaves exactas; conflictos a revisión |
| `app/adapters/tya-canonical-state-semantics-v2.js` | `PRESERVE_AFTER_READ_MODEL` | Separa evidencia histórica de fuera de rango y caso accionable |
| `app/adapters/tya-project-financial-model-contract-v1.js` | `PRESERVE_PRECEDENCE` | `tya::cinepolis`, delegado, localBilling false, regalía 0 |
| `app/adapters/tya-live-source-inplace-apply.js` | `RECONCILE` | Eliminar/neutralizar defaults heredados directo/ISR5/regalía10 |
| `app/adapters/tya-c6-domain-consistency-bridge.js` | `MIGRATE_LOGIC_AND_RETIRE_DOM_AUTHORITY` | No consolidar parches DOM/adapters como fuente final de Dashboard/Finanzas/Shopper |
| `app/adapters/tya-c6-unified-human-runtime-v1.js` | `PRESERVE_ORCHESTRATION_RECONCILE_PATCHES` | Una entrada, una fuente y un runtime; no duplicar login, Dashboard o Finanzas |
| `app/core/build-lock.js` | `REPLACE_AT_ASSEMBLY` | Actual V174 obsoleto |
| `app/sw.js` | `PRESERVE_NETWORK_FIRST_REBUILD_CACHE_ID` | Importa build-lock; requiere nuevo build ID para purgar caché previa |

## 6. Hallazgos de causa raíz que explican regresiones anteriores

### 6.1 Varias autoridades en memoria

La rama no contiene únicamente módulos UI. Diversos adapters redefinen métodos, estados, colecciones, Dashboard y Finanzas después de cargar los módulos. Por eso un archivo de módulo correcto podía verse incorrecto en runtime.

### 6.2 Carriles históricos coexistentes

Persisten contratos de:

- demo/localStorage;
- source-safe humano;
- Firestore vacío/fail-closed;
- runtime protegido técnico;
- runtime humano autenticado acumulativo.

La candidata final debe seleccionar un solo carril humano acumulativo y dejar los demás como fallback técnico explícito o retirarlos de la composición visible.

### 6.3 Identidad operativa y marca mezcladas

`config.js` conserva una marca/tenant visual generada localmente, mientras backend usa `tenantId=tya`. Sin precedencia explícita, `ctx()` y módulos pueden mostrar o filtrar con identidades distintas.

### 6.4 Semántica duplicada

`data.js`, read guards, read model, canonical semantics y domain bridge contienen definiciones de estados/KPIs. La autoridad final debe ser el read model + canonical semantics; los demás componentes solo compatibilizan sin redefinir.

### 6.5 Build-lock y caché desactualizados

`sw.js` deriva su caché de `CX_BUILD_ID`, pero el build-lock todavía identifica V174. Hasta reemplazarlo, un source lock actual no equivale a identidad de release acumulativa.

## 7. Gates obligatorios antes del Checkpoint Visual 1

1. **CX.data interface gate:** todas las superficies públicas requeridas existen antes y después de overlays.
2. **Single authority gate:** tenant, project, period, sourceRevision y data mode coinciden en todos los consumidores.
3. **Project/period separation gate:** proyecto `cinepolis`; periodos `cinepolis-YYYY-MM`; ningún selector mezcla ambos.
4. **No-demo authority gate:** fixtures/localStorage no gobiernan runtime autenticado.
5. **No invented normalization gate:** normalizadores no crean rating, estado, país, moneda, monto o cliente.
6. **Canonical semantics gate:** Dashboard, operación, Finanzas y portales comparten facetas.
7. **Auth continuity gate:** una entrada humana; principal Firebase; sin rol concedido por localStorage.
8. **Overlay ownership gate:** ningún bridge DOM es la única implementación de una mejora aceptada.
9. **Cache/build gate:** build-lock, manifest y `CX_CACHE` corresponden al mismo SHA funcional.
10. **Visual Checkpoint 1:** Paula valida A+B sobre el mismo build.

## 8. Qué falta para cerrar técnicamente Familia A

- recuperar la última evidencia humana/freeze específica de `config.js`, `router.js`, Proyecto/Periodo y shell responsive;
- terminar la matriz de blobs/commits para los normalizadores y bridges;
- definir el delta exacto para neutralizar autoridades duplicadas;
- crear el gate ejecutable de interfaz y precedencia;
- ensamblar Familia B sobre este contrato;
- ejecutar gates source-only;
- solicitar un único Hosting DEV para Checkpoint Visual 1 A+B.

No se requiere nueva candidata ni intervención manual de Paula durante esta fase source-only.

## 9. Siguiente bloque exacto

`RECUPERAR PROVENIENCIA HISTÓRICA RESTANTE DE FAMILIA A → INVENTARIAR FAMILIA B CRM OPS LEADS/DASHBOARD/HOJA DE RUTA → DEFINIR COMPOSICIÓN A+B → DELTA COMPLETO → GATES SOURCE-ONLY → SOLICITAR ÚNICO BUILD DEV PARA VALIDACIÓN VISUAL`

## 10. Estado seguro

- cambios funcionales: 0;
- Hosting deploy: 0;
- Cloud Run/Firestore/Auth/HR/Rules/Storage writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: false.

## 11. Clasificación

- **Reusable CXOrbia:** contrato de interfaz, precedencia de fuentes y ownership de overlays.
- **Exclusivo cliente:** `tya::cinepolis`, HR y configuración financiera.
- **Claude/prototipo:** preservar shell y mejores módulos; migrar lógica visible fuera de bridges DOM.
- **Academia:** una sola explicación de acceso, proyecto/periodo, fuente y estados.
- **Sin impacto Claude:** SHAs, gates, build-lock, service worker y caché.