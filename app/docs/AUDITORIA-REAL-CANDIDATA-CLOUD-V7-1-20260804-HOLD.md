# Auditoría real — candidata Cloud V7.1

**Fecha:** 2026-08-04  
**Paquete:** `Prototype development request V 7.1.zip`  
**SHA-256:** `649b9d50ae8f80cf4e0b4fcb303e60b35e8fda1b7de1215ae716b7be6f4355ca`  
**Decisión:** `HOLD_NO_SEND_TO_EMALME`

## 1. Alcance recibido

El ZIP es estrecho y contiene cinco entradas:

- `app/app.js`;
- `app/styles/layout.css`;
- `REPORTE-V7-1-CORRECCION-RESPONSIVE.md`;
- `MANIFEST.json`;
- `capturas/02-desktop-1440x900.png`.

Esto corrige el problema de alcance del paquete V7 anterior: no incluye core, módulos, backend ni documentación histórica.

## 2. Verificaciones source PASS

- ZIP sin rutas inseguras;
- JavaScript `node --check`: PASS;
- UTF-8 sin BOM: PASS;
- secretos, private keys, JWT y API keys: 0;
- manifest coincide con los cuatro archivos que lista;
- `app.js` cambia frente a V7 únicamente el tratamiento visual del logo de tenant en la franja;
- `layout.css` cambia frente a V7 únicamente logo y reglas responsive;
- países dinámicos 1, 2, 8 y 12 renderizados en orden y sin `+N`;
- tres perfiles, usuario, contraseña, botón y registro presentes;
- copy técnico/demo no aparece en el Login canónico;
- escritorio `1920×1080` y `1440×900`: visualmente correcto;
- `1440×900` con 12 países: botón y registro siguen accesibles.

## 3. P0 reproducible — responsive continúa roto

La candidata no corrige completamente el problema móvil.

### Causa source exacta

`layout.css` conserva dos reglas acumuladas para `#login`:

1. la regla legacy mantiene:
   - `display:flex`;
   - `align-items:center`;
   - `justify-content:center`;
   - `padding:24px`;
2. la regla V7 posterior cambia posición, fondo y overflow, pero no anula esas cuatro propiedades.

En `max-width:900px`, `.lg2` pasa a flujo normal, pero continúa siendo un flex item centrado dentro de un contenedor fixed con padding. El resultado real es:

- ancho de composición aproximado de 552 px dentro de viewport de 390/412 px;
- coordenadas negativas;
- recorte lateral aunque el documento reporte `overflow-x:hidden`;
- franja superior fuera del viewport;
- contenido final por debajo del viewport sin que el documento expanda correctamente su scrollHeight.

### Evidencia geométrica `390×844`

- viewport: 390 px;
- `.lg2-aside`: x = -81 px, width = 552 px;
- `.lg2-main`: x = -81 px, width = 552 px;
- `.lg2-strip`: top = -191.30 px;
- formulario: x = -65 px, width = 520 px;
- botón `Ingresar`: bottom = 985.30 px;
- enlace de registro: bottom = 1011.30 px;
- `documentElement.scrollHeight`: 844 px.

Esto prueba que el contenido está recortado y parte del formulario queda fuera del área desplazable real.

### Resultado por viewport

- `768×1024`: no hay superposición aside/main, pero la franja superior queda cortada y el cierre del formulario queda fuera del viewport inicial;
- `412×915`: encabezado y contenido izquierdo aparecen recortados lateralmente;
- `390×844`: título, subtítulo, países, tarjetas e inputs pierden su margen izquierdo y parte del contenido queda fuera del área navegable.

## 4. Evidencia contractual inválida/incompleta

La única captura entregada se llama `02-desktop-1440x900.png`, pero sus dimensiones reales son `924×540` y su formato interno es JPEG.

Faltan:

- `1920×1080`;
- `768×1024`;
- `412×915`;
- `390×844`;
- comparación antes/después;
- capturas entregadas de 1, 2, 8 y 12 países.

El reporte reconoce que no entregó esas evidencias. Por tanto, el paquete tampoco cumple el contrato de entrega visual solicitado.

## 5. Correctivo frontend exacto requerido

Bajo `max-width:900px`, Cloud debe anular expresamente el layout flex heredado de `#login`:

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
.lg2-main,
.lg2-card{
  width:100%;
  max-width:100%;
}
```

Puede conservar un `max-width` interno del formulario, pero debe aplicarlo dentro de un padre que mida realmente el viewport, sin coordenadas negativas ni clipping.

Debe comprobar:

- `strip.top >= 0`;
- `aside.left >= 0`;
- `main.left >= 0`;
- `main.width <= viewportWidth`;
- `documentElement.scrollHeight >= goReg.bottom`;
- cero recorte lateral;
- todos los elementos accesibles mediante scroll vertical natural.

## 6. Decisión de empalme

```text
V7_1_GO = false
SEND_TO_EMPALME = false
```

No enviar a Codex. Codex solo puede empalmar después de una candidata GO, un delta exacto aprobado y un source HEAD inmutable.

## 7. Estado seguro

- archivos V7.1 aplicados: 0;
- empalme: 0;
- deploy DEV: 0;
- provider reads/writes: 0;
- producción/merge: 0.

## 8. Clasificación

- **Reusable CXOrbia:** auditoría geométrica real por viewport y validación de evidencia.
- **Exclusivo TyA:** identidad visual Gravicentra CX y países del tenant.
- **Cloud/prototipo:** corrección responsive V7.2 requerida.
- **Academia:** capturas finales pendientes de candidata aprobada.
- **Sin impacto producción:** no se aplicó ni desplegó nada.
