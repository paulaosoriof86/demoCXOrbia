# PENDIENTES PROTOTIPO — R18D PREVIEW VISIBLE V131

Fecha: 2026-07-15

## P0 único y bloqueante para revisión visual

Archivo:

```text
app/core/finanzas-core.js
```

Función:

```text
CX.fin.serieMensual(p,c)
```

Problema: el adapter local enviado a `porPais()` implementa `project()` y `visitas()`, pero no `period()`. `CX.liq.forProject(data)` requiere `data.period()` y el módulo Financiero falla con:

```text
TypeError: data.period is not a function
```

Corrección: agregar `period: () => p` al adapter local, sin modificar otros archivos ni la semántica proyecto/periodo general.

## No reabrir

- V131;
- HR y 14 periodos;
- 616 visitas;
- 216 shoppers;
- R11D;
- R14C y sus 196 enlaces exactos;
- 92 casos financieros;
- importadores;
- certificaciones carryover pendientes de fuente;
- módulos visuales ajenos;
- backend, tools o workflows.

## Criterio de cierre

- Financiero renderiza sin errores.
- R18D conserva 196 controles pendientes de revisión, 92 casos de review, cero pagos confirmados y certificaciones en HOLD.
- No hay cambios ajenos al fix focalizado.