# RESUMEN PARA CLAUDE — V176 HOLD → V177 CORRECTIVA

## Estado que debes usar

V176 no fue aplicada. La baseline viva sigue siendo V174. Debes trabajar **incrementalmente sobre V176**, conservar lo válido de V175/V176 y entregar una única V177.

No reinicies módulos, no rediseñes y no toques backend, tools, contratos, adapters, HR Source, la interfaz pública de `CX.data`, Firebase, Make, Gemini live, pagos, lotes o importadores.

## Archivos autorizados

1. `app/core/finanzas-core.js`
2. `app/modules/finanzas.js`
3. `app/modules/beneficios.js`
4. `app/app.js`, solo para preservar el acceso Shopper DEV ya corregido.
5. `app/styles/layout.css`, solo si falta una pista móvil real.

## Correcciones obligatorias

### 1. Periodo canónico completo

- Elimina toda llamada de UI a `CX.finStore.crearMesSiguiente()`.
- “Mes siguiente” debe crear/seleccionar un periodo canónico mediante la API autorizada de `CX.data` o permanecer deshabilitado con copy honesto.
- Movimientos, presupuesto, exportación y metadatos deben resolver el mismo `periodId/periodKey` central.
- No dejes `period:per` ambiguo en reportes; usa una variable explícita como `canonicalPeriodLabel`.

### 2. Multimoneda en todas las superficies

Elimina estos patrones y equivalentes:

- `ui.money(cur,Math.abs(m.monto))`;
- `ui.money(cur,val)` en ingresos por tipo;
- `ui.money(cur,r.saldo)` en CxP;
- cualquier fallback que asigne la primera moneda a una fila sin país/moneda.

Cada movimiento, CxP, CxC, financiamiento, presupuesto y modal conserva su moneda real. Los resúmenes se agrupan por moneda y nunca suman Q + L.

### 3. Beneficios sin moneda primaria del proyecto

- Elimina `const cur = _benCurSet[0]` como base de cálculo.
- Elimina acumulados y barras filtrados por esa moneda.
- “Honorarios vs reembolsos”, conceptos en especie, modales y beneficio total deben mostrarse por cada moneda real del shopper.
- Un shopper solo HNL no puede ver Q 0 en ninguna sección.

### 4. Presupuesto con una sola llave canónica

- Usa una llave coherente derivada de `tenantId + projectId + periodId`.
- Todas las lecturas y escrituras deben pasar el periodo canónico explícito.
- No leas `CX.finStore.pres(p.id)` sin periodo.
- No mezcles `data.project().id` con `data.period().id`.

### 5. Presupuesto pendiente sin duplicación

- Un presupuesto sin distribución por país/moneda existe una sola vez fuera de `out[c]`.
- No adjuntes `fijosPendienteAsignacion` completo a cada país.
- No lo rotules con la primera moneda.
- No lo uses en margen hasta tener asignación confirmada.

### 6. Gates vigentes

La entrega debe ejecutar los archivos reales del repo, no una lista propia de tokens:

- `tools/qa/tya-corte3-p0-source-contract-r26-gate.mjs`;
- `tools/qa/tya-corte3-v175-residual-p0-r27-gate.mjs`;
- `tools/qa/tya-corte3-v176-semantic-residual-p0-r28-gate.mjs`.

Los tres deben quedar PASS.

Para R26 incluye implementaciones/identificadores reconocibles de agrupación por moneda, contrato de fuente de reembolso y wrappers con pista visible `Desliza para ver más`.

## Evidencia obligatoria

Entrega capturas reales y distintas de:

1. Dashboard Financiero mayo.
2. Bandeja con exactamente dos revisiones GT.
3. Cambio mayo ↔ julio desde el selector canónico.
4. Movimientos con Q y L, incluidos drill, ingresos por tipo y CxP.
5. Beneficios de shopper HNL sin ningún Q 0.
6. Login DEV con selector controlado.
7. Host no autorizado sin selector DEV.
8. PDF real abierto.
9. Excel real abierto.
10. Viewport móvil real.

## Datos protegidos

Debes conservar:

- 14 periodos;
- 616 visitas;
- mayo: 44 visitas, 42 exactas, 2 revisiones GT, 32 GT y 10 HN;
- 209 vínculos exactos;
- 207 montos canónicos;
- 0 pagos confirmados;
- 0 lotes.

No afirmes que las dos revisiones funcionan solo porque el demo devuelve cero. Debes validarlas contra el checkout canónico TyA.

## Formato de entrega

- versión exacta V177;
- lista exacta de archivos;
- delta por cada corrección;
- `node --check` 4/4 para JavaScript;
- R26, R27 y R28 PASS con sus reportes;
- capturas y exportaciones reales;
- confirmación de archivos prohibidos no tocados;
- limitaciones honestas restantes.
