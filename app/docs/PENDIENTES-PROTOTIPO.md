# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `RECONSTRUCTION_ACTIVE__A_PLUS_B_SCOPE_LOCKED__TARGET_SHAS_AND_DELTA_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 1. Bloqueante actual

Falta cerrar la composición objetivo A+B con:

- última aprobación/commit por módulo;
- SHA objetivo por archivo;
- dependencias reconciliadas;
- delta completo;
- gates source-only.

No se publicará un nuevo build antes de ese cierre.

## 2. Familia A

- recuperar aprobación/commit de shell, config, router y Proyecto/Periodo;
- neutralizar tenant/identidad local en modo conectado;
- preservar interfaz completa `CX.data`;
- retirar/delegar read guards y bridges duplicados;
- neutralizar defaults directo/ISR5/regalía10;
- reemplazar build-lock V174 y cache ID al ensamblar;
- crear gates de interfaz, precedencia, no-demo, Auth y caché.

## 3. Familia B

### Dashboard

- una sola semántica para tiles, fases, comparativo y drilldowns;
- cero históricos, márgenes, porcentajes o scores fabricados;
- no depender de bridge DOM como autoridad.

### CRM Ops Leads

- recuperar mejor aprobación visual;
- preservar suite completa;
- pending-source honesto sin backend CRM real;
- no fixtures en conectado;
- no writes backend todavía.

### Clientes

- retirar contactos, correos, prospectos y scores sintéticos;
- conservar Cliente→Proyecto por IDs estables.

### Comercial

- modelo financiero por proyecto;
- Cinépolis delegado, regalía 0, localBilling false, Q60/L200;
- IA/web/plantillas gateadas.

### Marketing

- retirar mes/contenido/métricas ficticias en conectado;
- Gemini/Make inactivos hasta su bloque real;
- conservar UI y pending-source.

### Hojas de Ruta

- proyecto/periodo correcto;
- HR viva;
- IA/import/Google Sheets y writes gateados.

## 4. Scope lock

No abrir ahora:

- `operacion-extra.js` y experiencia Shopper → Familia D;
- `cliente-extra.js`, reportes/exportaciones → Familias F/G;
- `cliente-insights.js`, Portal Cliente/benchmark → Familia F;
- Finanzas completa;
- Academia;
- integraciones.

Solo una dependencia transversal P0 demostrada permite tocar estos módulos durante A+B.

## 5. Cerrado y protegido

No reabrir sin regresión nueva:

- Staff/Shopper/Cliente remoto estable;
- Shopper nueva pestaña e identidad exacta;
- `ownVisits=1`;
- 14 periodos y 616 visitas;
- `tya::cinepolis` delegado;
- facturación local false;
- regalía 0;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones;
- producción intacta.

## 6. Checkpoint Visual 1

Paula revisará sobre un solo build:

- acceso, shell, tenant, proyecto, periodo, fuente y navegación;
- CRM Ops Leads;
- Dashboard;
- Hojas de Ruta;
- Clientes;
- Comercial;
- Marketing;
- indicadores y drilldowns.

## 7. Criterios de cierre A+B

- cero dependencias `UNKNOWN`;
- SHA objetivo por archivo;
- una sola fuente/semántica;
- delta completo contra HEAD;
- gates source-only PASS;
- manifest/build-lock/SW coherentes;
- una sola URL DEV;
- aprobación visual de Paula.

## 8. Siguiente bloque exacto

`PROVENIENCIA/APROBACIONES A+B → SHAS OBJETIVO → DELTA Y GATES SOURCE-ONLY`.

## 9. Prohibiciones

- no deploy durante inventario;
- no nueva candidata, rama, PR, Firebase o Hosting;
- no expansión a familias posteriores;
- no seeds ni métricas falsas;
- no parche UI desde backend;
- no merge ni producción antes de composición y aprobación visual.
