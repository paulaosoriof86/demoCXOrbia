# RESUMEN PARA CLAUDE — R18D PREVIEW VISIBLE V131

Fecha: 2026-07-15

## Estado

V131 continúa como baseline activa. Backend no solicita una auditoría general, rediseño, reconstrucción de Finanzas ni cambios en otros módulos.

R18D verificó correctamente los datos y gates visibles:

- 14 periodos;
- 616 visitas;
- 216 shoppers;
- 196 controles financieros exactos pendientes de revisión;
- 92 casos financieros en revisión;
- certificaciones en HOLD;
- cero pagos, lotes o certificaciones confirmadas.

## Único P0 frontend

`app/core/finanzas-core.js`, función `serieMensual(p,c)`, crea un adapter parcial con `project()` y `visitas()`, pero `CX.liq.forProject()` requiere también `period()`.

Corrección focalizada:

```js
period: () => p
```

Debe agregarse al objeto que `serieMensual()` envía a `porPais()`.

No modificar `app/core/liquidacion.js`, `app/modules/finanzas.js` ni archivos ajenos.

## Fuente de trabajo

Usar:

```text
app/docs/PAQUETE-EXCLUSIVO-CLAUDE-R18D-P0-FINANZAS-PERIOD-20260715.md
```

## Academia

No se requiere cambio de contenido por este fix técnico. Mantener conceptos ya documentados: control financiero no equivale a pago, reviewQueue requiere revisión humana y certificación pendiente de fuente no debe solicitarse nuevamente automáticamente.