# RESUMEN-PARA-CLAUDE.md

**Estado frontend:** `CLOUD_V7_1_HOLD__V7_2_REQUIRED`

Cloud solo corrige frontend.

## Preservar

- desktop;
- órbita;
- países dinámicos 1/2/8/12;
- perfiles y formulario.

## Corregir

Bajo 900 px, anular en `#login` flex, centrado y padding heredados. Garantizar ancho 100 %, cero clipping y scroll hasta el registro.

Criterios:

- strip.top >= 0;
- aside.left >= 0;
- main.left >= 0;
- main.width <= viewportWidth;
- scrollWidth == viewportWidth;
- scrollHeight >= goReg.bottom.

## Entrega

- `app/app.js`;
- `app/styles/layout.css`;
- reporte V7.2;
- manifest;
- PNG reales de cinco viewports, comparación y escenarios 1/2/8/12.

El Laboratorio backend ya obtuvo PASS source-only. No tocar contratos, gates, runner, backend o producción.
