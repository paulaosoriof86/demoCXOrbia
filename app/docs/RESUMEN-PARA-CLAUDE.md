# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLOUD_V7_1_HOLD__DO_NOT_SEND_TO_EMPALME__V7_2_REQUIRED`

## 1. Alcance correcto

No existe empalme V6 aprobado/completado.

Cloud trabaja únicamente frontend. No tocar backend, core, módulos de negocio, autenticación, datos, laboratorio, gates, GitHub, deploy o producción.

## 2. V7.1 auditada

- ZIP: `Prototype development request V 7.1.zip`;
- SHA-256: `649b9d50ae8f80cf4e0b4fcb303e60b35e8fda1b7de1215ae716b7be6f4355ca`;
- alcance recibido: `app/app.js` y `app/styles/layout.css` más reporte, manifest y una captura;
- decisión: `HOLD_NO_SEND_TO_EMPALME`.

## 3. Qué sí está bien y debe preservarse

- paquete estrecho;
- composición desktop;
- órbita y seis conceptos;
- países dinámicos 1/2/8/12, en orden y sin `+N`;
- tres perfiles;
- usuario, contraseña, botón y registro;
- doce países accesibles en 1440×900;
- copy técnico/demo ausente;
- sintaxis y secret scan PASS.

## 4. Defecto responsive exacto

La corrección de `.lg2` no basta porque la regla legacy de `#login` sigue activa:

```css
#login{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:24px;
}
```

En móvil, el Login queda centrado como un flex item más ancho que el viewport.

Resultado real en 390×844:

- aside/main x = -81 px y width = 552 px;
- card x = -65 px y width = 520 px;
- strip top = -191.30 px;
- registro bottom = 1011.30 px;
- document scrollHeight = 844 px.

## 5. Corrección frontend V7.2

Modificar únicamente:

- `app/app.js` solo si es estrictamente necesario;
- `app/styles/layout.css`.

Bajo `max-width:900px`, anular expresamente el flex heredado:

```css
#login{
  display:block;
  padding:0;
  align-items:initial;
  justify-content:initial;
  overflow:auto;
}
.lg2{
  width:100%;
  min-height:100vh;
}
.lg2-body,
.lg2-aside,
.lg2-main{
  width:100%;
}
.lg2-card{
  width:100%;
  max-width:520px;
}
```

Criterios geométricos:

- `strip.top >= 0`;
- `aside.left >= 0`;
- `main.left >= 0`;
- `main.width <= viewportWidth`;
- `documentElement.scrollWidth == viewportWidth`;
- `documentElement.scrollHeight >= goReg.bottom`.

## 6. Evidencia obligatoria real

Entregar PNG reales:

- `1920×1080`;
- `1440×900`;
- `768×1024`;
- `412×915`;
- `390×844`;
- comparación antes/después 1440×900;
- escenarios 1/2/8/12 países.

`MANIFEST.json` debe registrar path, bytes y SHA-256 de cada archivo y captura.

## 7. Paquete exacto

```text
app/app.js
app/styles/layout.css
REPORTE-V7-2-CORRECCION-RESPONSIVE.md
MANIFEST.json
capturas/
```

No incluir `index.html`, core, módulos, backend, documentación histórica ni archivos del laboratorio.

## 8. Trabajo paralelo de ChatGPT — sin tarea para Cloud

El contrato source-only del Laboratorio obtuvo PASS remoto:

```text
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

Esto no requiere ningún cambio de Cloud. No incluir ni modificar archivos del laboratorio, contratos, gates o runner.

## 9. Estado seguro

- V7.1 enviada a empalme: no;
- archivos V7.1 aplicados: 0;
- deploy: 0;
- producción intacta.
