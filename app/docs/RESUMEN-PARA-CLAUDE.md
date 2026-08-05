# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLOUD_V7_1_HOLD__V7_2_REQUIRED__DO_NOT_SEND_TO_EMPALME`

## Alcance

Cloud modifica únicamente frontend. No tocar backend, core, módulos, autenticación, datos, laboratorio, gates, GitHub, deploy o producción.

## V7.1

- SHA-256 `649b9d50ae8f80cf4e0b4fcb303e60b35e8fda1b7de1215ae716b7be6f4355ca`;
- decisión `HOLD_NO_SEND_TO_EMPALME`.

Preservar desktop, órbita, países 1/2/8/12, perfiles y formulario.

## Corrección V7.2

Bajo 900 px anular expresamente en `#login`:

```css
display:flex;
align-items:center;
justify-content:center;
padding:24px;
```

Aplicar flujo vertical real, ancho 100 %, cero coordenadas negativas y scroll hasta el registro.

Criterios:

- strip.top >= 0;
- aside.left >= 0;
- main.left >= 0;
- main.width <= viewportWidth;
- scrollWidth == viewportWidth;
- scrollHeight >= goReg.bottom.

## Evidencia

PNG reales 1920×1080, 1440×900, 768×1024, 412×915 y 390×844; comparación y escenarios 1/2/8/12 países; manifest con path, bytes y SHA-256.

## Paquete

```text
app/app.js
app/styles/layout.css
REPORTE-V7-2-CORRECCION-RESPONSIVE.md
MANIFEST.json
capturas/
```

El Laboratorio backend ya obtuvo PASS source-only. Cloud no debe modificarlo.
