# RECONSTRUCCIÓN ACUMULATIVA — FAMILIA B: INVENTARIO INICIAL CRM OPS LEADS

**Fecha:** 2026-08-02  
**Estado:** `FAMILY_B_INVENTORY_ACTIVE__SOURCE_ONLY__NO_DEPLOY`  
**Rama única:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Prioridad

Familia B prepara el primer checkpoint visual acumulativo A+B. La prioridad indicada por Paula es recuperar el mejor estado de:

- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

No se selecciona por cantidad de funciones ni por número de versión. Se selecciona la composición que mantenga el mejor diseño aceptado, use una sola fuente canónica y no fabrique datos.

## 2. Inventario físico actual

| Módulo | Ruta | Blob actual | Estado inicial |
|---|---|---|---|
| Dashboard | `app/modules/dashboard.js` | `e879fc3f1dd5a7486762b197346cadd086e1d99d` | `RECONCILIATION_REQUIRED` |
| CRM Ops Leads | `app/modules/crm.js` | `6a6ff1c964eff4f25ecaf33b028335bfc62810ee` | `BEST_TECHNICAL_PENDING_SOURCE_AND_VISUAL` |
| Clientes | `app/modules/clientes.js` | `9c3c98605f4fb2e22d66b241607c9dd70c45d159` | `RECONCILIATION_REQUIRED_FAKE_SEEDS` |
| Comercial/Propuestas | `app/modules/comercial.js` | `61aaee6432e4a4206b07f8633d158b8d2b2c2271` | `RECONCILIATION_REQUIRED_FINANCIAL_CONTRACT` |
| Marketing | `app/modules/marketing.js` | `6bfe1b4e3dbed12ead8a88404cdb495dbf1b8e83` | `RECONCILIATION_REQUIRED_DEMO_AND_INTEGRATION_GATES` |
| Hojas de Ruta | `app/modules/rutas.js` | `1da95ce4a808dafd7553ad9082056da7009e4920` | `PRESERVE_UI_RECONCILE_SOURCE_AND_ACTION_GATES` |

Los estados son técnicos provisionales. Ninguno equivale a aprobación visual.

## 3. Dashboard — hallazgos

### Fortalezas a preservar

- KPIs clickeables con drilldown;
- desglose por país;
- exclusión de archivados;
- uso de `visitBucketFns` para los tiles principales;
- búsqueda y contacto desde detalle;
- soporte multipaís y multi-periodo;
- protección previa contra históricos inventados en parte del comparativo.

### Contradicciones

1. El módulo calcula sus tiles con `data.visitBucketFns`, pero define otro `phaseFlow()` local con estados legacy.
2. La cadena C6 agrega después un domain bridge/unified runtime que vuelve a modificar fases, comparativos y DOM.
3. Por tanto, la fuente visible final no es exclusivamente `dashboard.js` ni exclusivamente el read model.
4. La comparación histórica debe provenir de todos los periodos HR, no de porcentajes derivados del mes actual.
5. Cualquier margen/score sin fuente exacta debe mostrarse como pendiente, nunca como número calculado desde fixtures.

### Decisión

`RECONCILIAR DASHBOARD CON READ MODEL + CANONICAL SEMANTICS`.

La lógica correcta hoy alojada en bridges debe migrarse al módulo o a un servicio de datos canónico reutilizable. El bridge DOM no puede ser la única implementación final.

## 4. CRM Ops Leads — hallazgos

### Fortalezas a preservar

- pipeline configurable;
- oportunidades/leads;
- cuentas;
- contactos;
- actividades y tareas;
- ficha 360;
- correos/documentos vinculados;
- metas y reportes;
- gates de edición y trazabilidad incorporados en mutadores.

### Contrato actual

- almacenamiento principal en memoria/localStorage;
- fixtures de oportunidades, cuentas y contactos solo cuando `showFixtures()` permite demo;
- fuera de demo, las listas pueden quedar vacías;
- todavía no existe adapter backend canónico para CRM real;
- no debe presentarse la ausencia de datos reales como pérdida funcional ni reemplazarse con prospectos ficticios.

### Decisión

`PRESERVAR LA EXPERIENCIA MÁS COMPLETA, FAIL-CLOSED SIN FUENTE REAL`.

Para el Checkpoint Visual 1:

- la UI debe conservar pipeline, vistas y formularios;
- el modo conectado debe mostrar estado vacío/pending-source honesto si aún no existe dataset CRM real;
- los fixtures solo se permiten en modo demo explícito;
- no se activa write backend ni Make/Gemini;
- las acciones de edición permanecen bloqueadas o locales según el gate autorizado, sin prometer sincronización real.

## 5. Clientes — hallazgo crítico

`clientes.js` construye clientes a partir de los proyectos actuales y además agrega:

- un contacto sintético `Contacto Principal`;
- un correo fabricado basado en slug;
- dos prospectos adicionales ficticios;
- persistencia local paralela;
- mutaciones directas sobre `D.projects` para agregar `clientId`.

Estas semillas no están completamente protegidas por el gate general de fixtures. En un runtime conectado podrían verse como clientes/prospectos reales.

### Decisión

`RECONCILIATION_REQUIRED_FAKE_SEEDS`.

La candidata A+B debe:

- derivar clientes solo de configuración/proyectos reales o backend autorizado;
- no inventar contactos, correos, prospectos, scores ni fechas;
- mantener la ficha y navegación del módulo;
- usar estados honestos cuando falte información;
- conservar la relación Cliente → Proyecto sin deduplicar por nombre visual.

## 6. Comercial y propuestas — hallazgos

- propuestas almacenadas en localStorage;
- calculadora con inputs editables de regalías, ISR y costos;
- puede generar valores que contradigan el contrato `tya::cinepolis` si usa defaults generales;
- flujo de propuesta y plantillas es útil, pero no debe tomar honorario Shopper como ingreso ni aplicar regalías globales;
- carga de plantillas, IA e investigación web son superficies que requieren gates reales.

### Decisión

`RECONCILIAR CON CONTRATO FINANCIERO POR PROYECTO`.

Para Cinépolis debe partir de:

- delegado;
- facturación local false;
- regalía 0;
- honorario GT Q60 / HN L200;
- comisión/reparto pendiente de configuración exacta;
- cero valores inventados.

Comercial no bloquea la operación Phase A si permanece fail-closed, pero no puede mostrar como real un pricing derivado de defaults genéricos.

## 7. Marketing — hallazgos

- store en memoria;
- mes fijo inicial `2026-06`;
- contenido, alcance, interacciones y leads ficticios cargados siempre por `seed()`;
- UI ofrece Gemini, Make, redes e importación sin que esas integraciones estén activadas;
- el módulo puede resultar visualmente completo pero operacionalmente falso.

### Decisión

`PRESERVAR UI / RETIRAR AUTORIDAD DEMO EN MODO CONECTADO / GATEAR INTEGRACIONES`.

En la candidata acumulativa:

- fixtures solo en demo explícito;
- mes derivado del contexto real;
- métricas vacías/pending-source cuando no haya fuente;
- Gemini y Make solo cuando llegue su bloque y exista autorización;
- ninguna promesa de publicación automática sin integración activa.

Marketing es P1 no bloqueante para Phase A, salvo que sus datos ficticios contaminen Dashboard, CRM o la percepción de producción.

## 8. Hojas de Ruta — hallazgos

### Fortalezas

- vista de fuente activa;
- preview de filas;
- concepto de HR viva;
- explicación de doble vía y deduplicación;
- botones para importación, Google Sheets y creación.

### Riesgos

- consume `data.project()`; debe comprobarse que recibe proyecto padre y no periodo disfrazado;
- acciones IA/import/conexión requieren gates y no pueden ejecutar writes;
- el texto de sincronización no puede prometer una integración todavía no activada;
- HR viva existente debe seguir siendo la autoridad real de TyA.

### Decisión

`PRESERVE_UI_RECONCILE_SOURCE_AND_ACTION_GATES`.

## 9. Causa raíz transversal de Familia B

Los módulos no están en una sola madurez de datos:

- Dashboard usa HR real pero depende de overlays posteriores;
- CRM es feature-rich pero local/demo;
- Clientes mezcla proyectos reales con contactos/prospectos sintéticos;
- Comercial puede contradecir el modelo financiero por proyecto;
- Marketing es completamente demo y promete integraciones futuras;
- Hojas de Ruta combina fuente real con acciones todavía no conectadas.

Por eso no bastaba escoger “la versión más nueva”. La candidata debe conservar la mejor UI de cada módulo y reemplazar únicamente la autoridad falsa, duplicada o no gateada.

## 10. Composición objetivo provisional A+B

1. Familia A provee una sola identidad, fuente, semántica y `CX.data`.
2. Dashboard consume read model + canonical semantics directamente.
3. Hojas de Ruta consume proyecto/periodo y HR viva sin mutadores no autorizados.
4. CRM conserva toda su experiencia, pero queda pending-source o local seguro hasta backend real.
5. Clientes deriva solo entidades reales; cero prospectos/contactos inventados.
6. Comercial consume configuración financiera por llave técnica y falla cerrado si falta pricing.
7. Marketing conserva UI, pero sin seeds ni integraciones falsas en modo conectado.
8. Paula valida cada módulo sobre el mismo build A+B.

## 11. Gate source-only requerido

Antes de ensamblar:

- detector de fixtures visibles en modo conectado;
- detector de localStorage como autoridad final;
- detector de métricas/fechas hardcodeadas;
- detector de botones Make/Gemini/web sin gate;
- comparación Dashboard tile ↔ drilldown ↔ facetas canónicas;
- proyecto/periodo correctos en Hojas de Ruta;
- contrato financiero aplicado en Comercial;
- CRM/Clientes con estado vacío honesto cuando no exista fuente.

## 12. Pendientes de proveniencia

- recuperar capturas/aprobaciones humanas de las últimas visualizaciones aceptadas de Dashboard, CRM, Clientes, Comercial, Marketing y Hojas de Ruta;
- revisar commits posteriores a V174/V182 que tocaron estos módulos o sus overlays;
- identificar si existe un módulo/overlay posterior de CRM Ops Leads no cargado por las rutas actuales;
- comparar `operacion-extra.js`, `cliente-insights.js` y adapters que puedan alterar Dashboard/CRM;
- definir SHAs objetivo finales.

## 13. Próximo bloque exacto

`RECUPERAR PROVENIENCIA B → INSPECCIONAR OVERLAYS/EXTRAS DE DASHBOARD-CRM-CLIENTES → MATRIZ SHA A+B → DELTA COMPLETO Y GATES SOURCE-ONLY`.

## 14. Estado seguro

- cambios funcionales: 0;
- deploy: 0;
- provider writes: 0;
- Make/Gemini: 0;
- merge: false;
- producción: false.

## 15. Clasificación

- **Reusable CXOrbia:** fail-closed por fuente y separación UI/autoridad.
- **Exclusivo cliente:** HR, `tya::cinepolis` y datos reales TyA.
- **Claude/prototipo:** mejor UI de Dashboard/CRM/Clientes/Comercial/Marketing/Rutas.
- **Academia:** lectura de CRM, KPIs, fuentes, rutas y estados pending-source.
- **Sin impacto Claude:** blobs, gates y proveniencia.