# RESUMEN PARA CLAUDE — V177 P0 HOLD → V178

## Instrucción

Trabaja sobre **V177** y entrega una única candidata **V178 incremental**. Preserva V174 y todas las correcciones válidas de V175/V176/V177. No reinicies módulos, no rediseñes y no toques backend, tools, adapters, HR Source, `CX.data`, Firebase, Make, Gemini live, pagos, lotes ni importadores.

## Delta real de V177

Solo cambiaron:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js`.

`app/app.js` y `app/styles/layout.css` son idénticos a V176. No los reescribas salvo que exista un cambio funcional real y justificado.

## Correcciones obligatorias

### 1. Periodo canónico en todo presupuesto

Elimina toda llamada `CX.finStore.pres(p.id)` sin periodo. Todas las lecturas/escrituras deben usar el mismo `tenantId + projectId + periodId` y recibir el periodo canónico explícito.

### 2. Cero cifras ficticias

Elimina el seed automático:

- Coordinación 4000;
- Software/plataforma 1200;
- Transporte 800.

Sin fuente, muestra estado vacío o `Pendiente de fuente`.

### 3. Moneda faltante fail-closed

Elimina todos los fallbacks `|| cur` en resolutores y agregadores monetarios. Una fila sin país/moneda:

- no se suma;
- no hereda Q ni L;
- muestra `Pendiente de moneda`;
- entra a revisión.

### 4. Financiamientos por moneda

No sumes todas las CxP/financiamientos y las rotules con `defCur0(p)`. Agrupa por moneda real. Sin moneda, fail-closed.

### 5. Presupuesto no asignado no es gasto real

`__unassignedBudget.total` es presupuesto planeado pendiente de asignación. No puede alimentar:

- `fijReal`;
- semáforo real vs presupuesto;
- `Total ejecutado`;
- margen;
- análisis de gasto real.

Debe mostrarse una sola vez como `Presupuesto pendiente de asignación`, sin moneda inventada.

### 6. Elimina referencias obsoletas

No uses `d.fijosPendienteAsignacion`; ese campo ya no existe por país.

### 7. Contexto suministrado

`CX.fin.porPais(data)` debe resolver el periodo desde `data`, no desde `CX.data.currentPeriodId` global. Debe funcionar cuando recibe adapters de otro periodo.

## Archivos autorizados

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`;
- `app/modules/beneficios.js` solo si la corrección requiere preservar o ajustar moneda fail-closed.

## Evidencia obligatoria

Ejecuta los gates reales del repo:

- R26;
- R27;
- R28;
- R29.

Todos deben pasar. Adjunta además:

1. Dashboard mayo con 2 revisiones GT.
2. Cambio mayo↔julio.
3. Fila sin moneda en revisión, no Q/L.
4. Presupuesto vacío sin montos de ejemplo.
5. Financiamientos separados por moneda.
6. Shopper HNL sin Q 0.
7. PDF real abierto.
8. Excel real abierto.
9. Viewport móvil.
10. Host DEV autorizado y host no autorizado.

## Conteos protegidos

- 14 periodos;
- 616 visitas;
- mayo: 44 visitas, 42 exactas, 2 revisiones GT, 32 GT, 10 HN;
- 209 vínculos;
- 207 montos;
- 0 pagos;
- 0 lotes.

## Formato de respuesta

Indica versión, archivos modificados, delta por P0, `node --check`, resultados R26/R27/R28/R29, evidencia visual, archivos prohibidos no tocados y confirmación de conteos. No declares Corte 3 cerrado ni publiques.
