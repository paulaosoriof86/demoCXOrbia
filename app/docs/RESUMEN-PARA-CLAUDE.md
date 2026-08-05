# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLOUD_V7_1_HOLD__DO_NOT_SEND_TO_EMPALME__V7_2_REQUIRED`

## 1. Alcance correcto

No existe empalme V6 aprobado/completado.

Cloud trabaja únicamente frontend. No tocar backend, core, módulos de negocio, autenticación, datos, laboratorio, gates, GitHub, deploy o producción.

## 2. V7.1 auditada

- ZIP: `Prototype development request V 7.1.zip`;
- SHA-256: `649b9d50ae8f80cf4e0b4fcb303e60b35e8fda1b7de1215ae716b7be6f4355ca`;
- decisión: `HOLD_NO_SEND_TO_EMPALME`.

## 3. Preservar

- composición desktop;
- órbita y seis conceptos;
- países dinámicos 1/2/8/12 en orden y sin `+N`;
- tres perfiles;
- usuario, contraseña, botón y registro;
- doce países accesibles en 1440×900;
- copy técnico/demo ausente.

## 4. Defecto responsive exacto

La regla legacy de `#login` sigue activa:

```css
#login{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
}
```

En 390×844:

- aside/main x = -81 px y width = 552 px;
- card x = -65 px y width = 520 px;
- strip top = -191.30 px;
- registro bottom = 1011.30 px;
- document scrollHeight = 844 px.

## 5. Corrección frontend V7.2

Modificar solo `app/app.js` si fuera estrictamente necesario y `app/styles/layout.css`.

Bajo `max-width:900px` anular flex/centrado/padding de `#login` y garantizar:

- `strip.top >= 0`;
- `aside.left >= 0`;
- `main.left >= 0`;
- `main.width <= viewportWidth`;
- `documentElement.scrollWidth == viewportWidth`;
- `documentElement.scrollHeight >= goReg.bottom`.

## 6. Evidencia

Entregar PNG reales:

- 1920×1080;
- 1440×900;
- 768×1024;
- 412×915;
- 390×844;
- comparación antes/después;
- escenarios 1/2/8/12 países.

## 7. Paquete exacto

```text
app/app.js
app/styles/layout.css
REPORTE-V7-2-CORRECCION-RESPONSIVE.md
MANIFEST.json
capturas/
```

## 8. Trabajo paralelo sin tarea para Cloud

El contrato source-only del Laboratorio obtuvo:

`PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT`.

No incluir ni modificar laboratorio, contratos, gates o runner.

## 9. Estado seguro

- V7.1 aplicada: no;
- empalme: no;
- deploy: 0;
- producción intacta.
