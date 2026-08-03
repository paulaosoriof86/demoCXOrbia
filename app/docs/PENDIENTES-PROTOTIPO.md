# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `A_PLUS_B_SOURCE_ASSEMBLED__PRECHECK_PASS__EXACT_CHECKOUT_GATE_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 1. Bloqueante actual único

La fuente A+B está ensamblada. El bloqueo real ya no es recuperar módulos ni definir SHAs.

Pendiente:

1. ejecutar `tools/qa/tya-ab-cumulative-candidate-source-gate.mjs` sobre checkout exacto;
2. ejecutar gates estáticos/cumulativos sin proveedores;
3. aplicar `STOP_RETRY` si aparece cualquier fallo;
4. solo con PASS, autorizar un único Hosting DEV;
5. Paula valida visualmente el Checkpoint 1.

## 2. Cerrado en este bloque

- proveniencia M1/Corte 1, Corte 2A y V182;
- matriz SHA A+B;
- manifest de 23 archivos;
- adapter de composición;
- orden de carga;
- supresión de fixtures identificados;
- preservación de registros creados por usuario;
- unit gate PASS con 23 verificaciones;
- evidencia source-only preliminar.

## 3. Archivos funcionales vigentes

### Adapter

`app/adapters/tya-ab-cumulative-composition-v1.js`

Blob:

`9c0d76382531b8393cc0866ec694935a2a5e25a6`.

### Entrada DEV

`app/index-backend-dev.html`

Blob:

`b9a4aaf063d97305c3f4f53eba8f02b526d61761`.

### Módulos preservados sin reescritura

- Dashboard;
- CRM;
- Clientes;
- Comercial;
- Marketing;
- Hojas de Ruta.

## 4. Pendientes del Checkpoint Visual 1

### Shell y contexto

- entrada humana única;
- tenant `tya`;
- proyecto `cinepolis`;
- periodo separado;
- fuente HR viva;
- navegación completa por rol;
- ausencia de Demo comercial/usuarios sintéticos.

### Dashboard

- tile ↔ fase ↔ comparativo ↔ drilldown;
- misma semántica canónica;
- cero métricas fabricadas;
- revisión del impacto de bridges C6.

### CRM Ops Leads

- suite completa visible;
- estado vacío/pending-source honesto sin backend CRM;
- alta local preservada con proveniencia;
- cero fixtures.

### Clientes

- solo clientes derivados/configurados o creados con proveniencia;
- cero prospectos/contactos placeholder;
- relación por IDs estables.

### Comercial

- validar que se percibe como herramienta de planificación, no como dato contractual confirmado;
- modelo delegado/regalía 0 preservado;
- IA/web/plantillas gateadas.

### Marketing

- cero contenido/métricas ficticias;
- mes correcto;
- nuevas piezas con proveniencia;
- Make/Gemini inactivos.

### Hojas de Ruta

- HR viva y periodo correcto;
- acciones de importación/sincronización/IA no activadas sin gate.

## 5. Scope diferido

No abrir ahora salvo P0 transversal:

- Operación e histórico;
- Shopper y certificaciones;
- Finanzas completa;
- Portal Cliente/reportes/Insights;
- administración e integraciones;
- Academia.

## 6. Cerrado y protegido

No reabrir sin regresión reproducible:

- 14 periodos y 616 visitas;
- Staff/Shopper/Cliente remoto estable;
- identidad Shopper exacta y `ownVisits=1`;
- `tya::cinepolis` delegado;
- localBilling false;
- regalía 0;
- Q60 GT / L200 HN;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones;
- producción intacta.

## 7. Criterio de salida A+B

- source gate exacto PASS;
- static/cumulative gates PASS;
- un solo build/URL DEV;
- validación visual de Paula módulo por módulo;
- correcciones sobre la misma candidata;
- build-lock/freeze solo después del PASS visual.

## 8. Siguiente bloque exacto

`EXACT CHECKOUT A+B SOURCE GATE → STATIC/CUMULATIVE GATES → STOP_RETRY SI FALLA → SOLO SI PASS, AUTORIZACIÓN DE UN HOSTING DEV → CHECKPOINT VISUAL 1`.

## 9. Prohibiciones

- no nueva candidata, rama, PR o metodología;
- no expansión a C–G;
- no seeds/métricas falsas;
- no deploy antes del gate;
- no merge ni producción antes de aprobación visual.
