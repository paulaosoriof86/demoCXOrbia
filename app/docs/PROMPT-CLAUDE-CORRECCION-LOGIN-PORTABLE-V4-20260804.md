# Prompt para Claude · corrección frontend-only del Login portable v4

Trabajá únicamente sobre el último paquete portable `gravicentra-login-portable` que ya entregaste.

No reconstruyas desde cero y no generes otro frontend. Conservá todo lo que ya funciona y corregí acumulativamente los puntos indicados aquí.

## Objetivo

Entregar una nueva versión portable del Login de **Gravicentra CX** con:

- fidelidad visual cercana a la referencia aprobada;
- órbita visible en desktop, tablet y móvil;
- branding dinámico del tenant;
- banderas de todos los países configurados para ese tenant;
- responsive real;
- tokens CSS completos;
- evidencia visual reproducible.

Tu responsabilidad en este bloque es exclusivamente frontend visual y presentacional.

## 1. Archivos que podés modificar

Trabajá solamente sobre:

- `src/Login.jsx`;
- `src/Login.css`;
- `src/gravicentra-tokens.css`;
- `src/i18n.js`;
- `src/flags.jsx`;
- `adapters/cliente-preview-button.js`;
- `docs/ESPEC-FICHA-SHOPPER.md`;
- `docs/INVENTARIO-REFERENCIAS-MARCA.md`;
- `README.md`;
- previews, pruebas y manifest del propio paquete.

No toques módulos ni archivos externos a este paquete portable.

## 2. Datos que recibe el componente

El Login debe recibir la identidad visual del tenant mediante `props`, por ejemplo:

```js
tenantBranding: {
  name,
  logo,
  subtitle,
  countries,
  theme
}
```

Cada elemento de `countries` puede tener una forma equivalente a:

```js
{
  id: 'GT',
  name: 'Guatemala',
  flagCode: 'GT'
}
```

No decidas qué países tiene un tenant. Renderizá únicamente los que reciba el componente.

## 3. Banderas de países

Las banderas del Login representan los países en los que trabaja el tenant.

Implementá lo siguiente:

- mostrar todos los países recibidos en `tenantBranding.countries`;
- mostrar bandera y nombre;
- conservar el orden recibido;
- no hardcodear Guatemala, Honduras ni ningún listado global;
- no ocultar países mediante `+N`;
- no convertir las banderas en multiselect;
- no exigir seleccionar un país para iniciar sesión;
- no usar las banderas como permisos;
- mantenerlas visibles en desktop, tablet y móvil.

### Comportamiento responsive de las banderas

- con pocos países: chips visibles en una o varias filas;
- con muchos países: reducir espaciado y permitir varias filas;
- en móvil puede usarse scroll horizontal solo dentro del contenedor de banderas cuando sea necesario;
- no debe existir scroll horizontal general en la página;
- ningún país puede quedar oculto permanentemente.

## 4. Responsive real

La evidencia móvil anterior no fue válida porque `preview-mobile.png` tenía dimensiones horizontales.

Generá evidencia real en:

- `390 × 844`;
- `412 × 915`;
- `768 × 1024`;
- `1440 × 900`.

### Desktop

- layout de dos columnas;
- órbita en el panel izquierdo;
- formulario en el panel derecho;
- franja superior integrada.

### Tablet vertical

- franja superior visible;
- órbita visible como hero;
- formulario debajo o en composición adaptativa;
- banderas visibles.

### Móvil

- franja superior compacta;
- órbita visible arriba;
- banderas visibles;
- formulario debajo;
- no usar `display:none` para ocultar la órbita;
- no recortar la órbita;
- no generar solapamientos;
- no cortar textos;
- mantener controles táctiles y accesibles.

## 5. Fidelidad visual de la órbita

Conservá y afiná la dirección visual aprobada:

- fondo navy profundo;
- grid técnico fino;
- anillos orbitales equilibrados;
- núcleo central con `Gravicentra CX`;
- acento coral;
- nodos alrededor;
- texto `FIELD OPERATIONS INTELLIGENCE`;
- tagline inferior.

Mantener los nodos:

- CLIENTES;
- TECNOLOGÍA;
- PERSONAS;
- OPERACIÓN;
- PROCESOS;
- INFORMACIÓN.

La órbita debe:

- verse más cercana a la referencia entregada;
- mantener proporción estable;
- permanecer centrada;
- no quedar recortada;
- adaptarse mediante CSS/SVG/HTML;
- no convertirse en una imagen raster fija;
- respetar los colores definidos por tokens.

## 6. Tokens CSS

`Login.css` usa `--gcx-navy-2`, pero el token no está definido.

Corregí ese problema y asegurá que todos los tokens usados existan.

Mantener o definir tokens equivalentes a:

```css
--gcx-tenant-strip-bg
--gcx-tenant-strip-text
--gcx-orbit-bg
--gcx-orbit-grid
--gcx-orbit-grid-strong
--gcx-orbit-ring
--gcx-orbit-node
--gcx-orbit-core
--gcx-orbit-brand
--gcx-orbit-accent
--gcx-panel-right-bg
--gcx-country-chip-bg
--gcx-country-chip-border
--gcx-country-chip-text
```

Los colores principales deben salir de tokens para que puedan cambiar según `theme`.

Agregá una prueba simple que falle cuando un `var(--gcx-*)` usado no esté definido.

## 7. Marca producto y marca tenant

Mantener esta separación:

- producto: `Gravicentra CX`;
- tenant: logo, nombre, subtítulo, países y paleta recibidos por `props`.

No hagas reemplazos globales de nombres técnicos.

En el inventario de marca distinguí:

- marca portable ya actualizada;
- marca dinámica del tenant;
- referencias visuales pendientes fuera del paquete;
- identificadores técnicos que no deben tocarse.

## 8. Formulario y accesibilidad

Mantener:

- usuario como `type="text"`;
- contraseña como `type="password"`;
- loading state;
- error state;
- ES/EN;
- selección visual de perfil;
- labels asociados;
- focus visible;
- navegación completa por teclado;
- envío mediante callback.

El componente puede exponer callbacks equivalentes a:

```js
onSubmit({ username, password, roleHint })
onSignup()
onLanguageChange(locale)
```

No implementes autenticación ni navegación real. Entregá únicamente el componente visual y presentacional.

## 9. README

Eliminá cualquier HEAD fijo del repositorio.

Usá:

```text
TARGET_HEAD_RESOLVED_BY_CHATGPT_AT_INTEGRATION_TIME
```

El README debe indicar solamente que:

- es un paquete frontend portable;
- todavía no está integrado;
- la integración será realizada posteriormente;
- esta entrega contiene diseño, responsive, branding, banderas y callbacks visuales.

## 10. Entregables

Devolvé un único ZIP acumulativo con:

- archivos frontend corregidos;
- `MANIFEST.json` con path, bytes y SHA-256;
- capturas reales de los cuatro viewports;
- prueba con tenants de 1, 2, 8 y 12 países;
- reporte breve de responsive;
- reporte de tokens usados y definidos;
- inventario de archivos modificados;
- resumen por archivo de qué cambió.

## 11. Criterio de aceptación

La entrega debe cumplir todo esto:

1. la órbita se ve en desktop, tablet y móvil;
2. la órbita no queda recortada;
3. las capturas corresponden realmente a los viewports declarados;
4. todas las banderas recibidas se muestran;
5. no hay países hardcodeados;
6. no hay `+N`, multiselect ni selección obligatoria de país en el Login;
7. no hay scroll horizontal general;
8. todos los tokens usados están definidos;
9. el formulario es usable por teclado y táctilmente;
10. el README no fija un HEAD histórico;
11. el manifest de hashes coincide;
12. el paquete sigue siendo frontend portable y acumulativo.

Realizá directamente las correcciones y devolvé el ZIP completo con la evidencia. No esperes una nueva autorización.
