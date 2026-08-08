# CXOrbia TyA — Corte 3: diagnóstico de causa raíz y corrección focalizada

**Fecha:** 2026-07-24  
**Estado:** `ROOT_CAUSE_DIAGNOSED_CORRECTION_CONTRACT_READY_P0_HOLD`  
**Baseline preservada:** V174  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Objetivo del bloque

Cerrar la causa raíz de los siete P0 demostrados por la validación móvil de Paula sin reabrir V174, M1, Corte 1 o Corte 2A, sin modificar datos reales y sin convertir diferencias financieras en inferencias.

Este bloque no autoriza producción, merge, pagos, lotes, imports, Firestore/Auth/Storage/HR writes, Make ni Gemini live.

## 2. Diagnóstico por hallazgo

### P0-1 — Agregación multimoneda inválida

**Causa raíz comprobada**

- `app/modules/finanzas.js`, módulo `movimientos`, fija `cur=p.currency[p.countries[0]]`.
- Luego suma movimientos, CxP y liquidaciones de todo el proyecto sin agrupar por moneda.
- El total combinado queda rotulado con la moneda del primer país.
- `app/modules/beneficios.js` repite el patrón: toma la moneda del primer país y muestra con ella los totales del shopper.

**Corrección requerida**

- Agrupar toda cifra financiera por `moneda` y país.
- Mostrar un KPI/tarjeta por moneda cuando existan monedas distintas.
- No producir total consolidado salvo que exista tasa, fecha, fuente y moneda base explícitas.
- Beneficios debe usar la moneda real de cada liquidación y agrupar los totales por moneda.

### P0-2 — Liquidación presentada como pago

**Causa raíz comprobada**

- `app/core/finanzas-core.js` llama `honPaga` a la suma de todos los honorarios de las liquidaciones, aunque ninguna tenga pago confirmado.
- `app/modules/finanzas.js` reutiliza ese campo como “Honorarios pagados” y también en los análisis.
- La fuente canónica mantiene `0 pagos confirmados`.

**Corrección requerida**

Separar expresamente:

- `honorarioDevengado`: visita/liquidación válida;
- `honorarioPorPagar`: devengado sin pago confirmado;
- `honorarioPagado`: únicamente `paymentConfirmed=true` con fuente de pago;
- `paymentSourceRef`: referencia de la fuente que confirma el pago.

No usar `honPaga` como nombre de una suma que contiene obligaciones no pagadas.

### P0-3 — Conciliación de reembolsos fabricada

**Causa raíz comprobada**

`app/modules/finanzas.js` calcula `reembolsado=Math.round(d.reemb*0.85)` y presenta el 15 % restante como diferencia financiera real. No existe fuente confirmada de reintegro del cliente.

**Corrección requerida**

- Eliminar por completo la regla del 85 %.
- Si no existe `reimbursementConfirmed`/fuente equivalente, mostrar `Pendiente de fuente`.
- No mostrar diferencia, conciliado o faltante como cifra operativa sin valor confirmado.
- Cuando llegue una fuente real, conservar monto, moneda, fecha, referencia y trazabilidad.

### P0-4 — Periodo financiero desconectado

**Causa raíz comprobada**

- El Dashboard usa `CX.finStore.periods(p.id)`.
- Movimientos usa `CX.finStore.periods(pid())`.
- Ese almacén solo conoce periodos con movimientos/presupuesto local y no los 14 periodos canónicos HR.
- Por eso la UI puede mostrar únicamente `2026-07` aunque el contexto central esté en mayo.

**Corrección requerida**

- Usar el mismo contexto canónico de proyecto/periodo de `CX.data`.
- El cambio de periodo debe actualizar KPI, movimientos, liquidaciones, revisiones, exportación y Beneficios.
- No mantener un segundo selector independiente que pueda divergir del sidebar.
- Si se conserva un selector dentro de Finanzas, debe leer y escribir exactamente el contexto central.

### P0-5 — Exportación no validada realmente

**Causa raíz comprobada**

El gate R25 interceptó `CX.reportKit.openReport` y verificó únicamente la especificación en memoria. No descargó, abrió ni comprobó los archivos. La revisión humana mostró PDF vacío/incorrecto y Excel no generado.

**Corrección requerida**

- Deshabilitar exportación cuando la vista no tenga filas.
- Descargar y abrir PDF y Excel reales en el gate remoto.
- Comprobar nombre, tamaño mayor que cero, columnas, filas, títulos, monedas y gráfica cuando aplique.
- El reporte financiero no puede reutilizar por error el contenido de Movimientos/Tesorería con cero filas.

### P0-6 — Review queue sin superficie operativa

**Causa raíz comprobada**

Las dos filas fail-closed existen en el adapter y en los conteos, pero Finanzas no expone una bandeja para localizarlas. No se muestran `visitId`, `hrRowId`, shopper, país, sucursal, motivo ni estado de fuente.

**Corrección requerida**

Crear una bandeja visible de revisión financiera con:

- país y moneda;
- visita/sucursal;
- shopper;
- `visitId`;
- `hrRowId`;
- `financialSourceStatus`;
- motivo;
- campos faltantes;
- estado de revisión;
- cero acciones de pago/lote mientras permanezca fail-closed.

### P0-7 — Shopper no validable desde el flujo visible

**Causa raíz comprobada**

En live/DEV, el botón Shopper deja `shopperId=null`. El gate R25 inyectó una sesión directamente con JavaScript, por lo que no validó el acceso que Paula debía recorrer.

**Corrección requerida**

- Mantener el guard fail-closed de Beneficios.
- Agregar en DEV una identidad Shopper controlada y seleccionable desde el flujo visible.
- No presentar esa selección como Auth real.
- No usar inyección oculta del gate como sustituto de la ruta visible.
- Auth/RBAC real permanece para su corte correspondiente.

## 3. P1 vinculados que deben corregirse en la misma candidata

- tablas con wrapper móvil y pista visible de desplazamiento;
- primera columna y encabezados accesibles;
- modal responsive;
- topbar y breadcrumbs sin truncamiento funcional;
- separación clara entre Dashboard Financiero y Movimientos/Tesorería;
- exportación inactiva sin filas;
- reemplazar `IA · hallazgos & estrategias` y “Con IA conectada (Gemini)” por un estado honesto de análisis determinístico/local.

## 4. Gate nuevo

Se agregó:

`tools/qa/tya-corte3-p0-source-contract-r26-gate.mjs`

El gate es fail-closed y bloquea una candidata mientras permanezcan los patrones fuente de los P0. No sustituye los gates posteriores de runtime, descarga real, móvil y sesión visible Shopper.

## 5. Reglas que deben permanecer intactas

- V174/M1/Corte 1/Corte 2A no se reabren.
- 14 periodos y 616 visitas.
- Mayo: 44 visitas HR, 42 filas exactas y 2 revisiones fail-closed.
- 32 exactas GT y 10 HN.
- 209 vínculos exactos y 207 montos canónicos listos.
- 0 pagos confirmados.
- 0 lotes.
- `paymentConfirmed=false` hasta fuente real.
- Cinépolis no se hardcodea como lógica global.
- `CX.data` conserva exactamente su interfaz pública.

## 6. Gates obligatorios después de la candidata

1. `node --check` de todos los JS modificados.
2. Gate fuente R26 PASS.
3. Gate semántico multimoneda y estados de pago.
4. Empalme directo si la candidata queda GO y sin otro P0.
5. Hosting DEV del mismo build.
6. Prueba móvil real.
7. Cambio mayo/julio desde una sola fuente de periodo.
8. Bandeja de dos revisiones visible.
9. Shopper controlado accesible desde login DEV.
10. PDF y Excel descargados, abiertos y validados.
11. `APROBADO` de Paula.
12. Freeze de Corte 3.

## 7. Clasificación

- **Reusable CXOrbia:** multimoneda, estados devengado/por pagar/pagado, review queue, exportación real y sesión visible por rol.
- **Exclusivo cliente:** cifras TyA/Cinépolis y las dos filas de mayo.
- **Claude/prototipo:** Finanzas, Movimientos, Beneficios, reportes, responsive, periodo y copy de IA.
- **Academia:** monedas, liquidación vs pago, revisión financiera, exportación y acceso por rol.
- **Sin impacto Claude:** gate fuente R26 y documentación contractual.

## 8. Siguiente acción exacta

`CLAUDE APLICA PAQUETE FOCALIZADO SOBRE V174 → ENTREGA CANDIDATA → EXECUTION_LANE_READY → AUDITORÍA DELTA → R26 + GATES → APPLY_DELTA_DIRECTLY SI GO → HOSTING DEV → REVALIDACIÓN MÓVIL → APROBADO → FREEZE CORTE 3`.
