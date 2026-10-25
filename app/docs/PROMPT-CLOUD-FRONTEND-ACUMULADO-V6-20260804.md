# Prompt para Cloud — Frontend acumulado V6

Trabajá directamente sobre el paquete V5 entregado. No reconstruyas desde cero, no entregues otra versión parcial y no detengas el trabajo después del primer hallazgo.

Tu responsabilidad es exclusivamente frontend:

- diseño visual;
- layout y responsive;
- componentes presentacionales;
- accesibilidad;
- copy visible;
- exportaciones y formato visual;
- evidencia reproducible.

No trabajes sobre Firebase, Auth, claims, memberships, bases de datos, `CX.data`, HR, APIs, backend, GitHub, deploy, producción, Make, Gemini, pagos ni reglas de negocio.

## 1. Login desktop

Usá la captura de Emergent como benchmark de proporción, jerarquía, densidad y balance; no copies su código.

Para `1440×900`:

- panel oscuro: 48–50 %;
- panel del formulario: 50–52 %;
- formulario útil: 420–460 px;
- órbita: 390–430 px;
- eliminar la escala actual `min(72vh, 540px)`;
- evitar una órbita gigante, grandes vacíos y scroll vertical prolongado.

Para `1920×1080`:

- órbita máxima aproximada: 460–480 px;
- formulario máximo aproximado: 470–500 px;
- mantener proporción; no escalar toda la interfaz indiscriminadamente.

## 2. Encabezado

Preferencia desktop:

- `Gravicentra CX` integrado arriba en el panel oscuro;
- tenant identificado de forma compacta en el panel del formulario;
- idioma arriba a la derecha.

Alternativa: franja común limpia de 52–60 px como máximo.

No repetir la marca ni crear un tercer bloque visual dominante.

## 3. Órbita

Mantener:

- CLIENTES;
- TECNOLOGÍA;
- PERSONAS;
- OPERACIÓN;
- PROCESOS;
- INFORMACIÓN.

Corregir:

- núcleo y marca central más pequeños;
- anillos y radios más finos;
- labels y nodos más sutiles;
- glow más contenido;
- tagline más próximo a la composición;
- animación delicada y compatible con `prefers-reduced-motion`.

La órbita debe acompañar el Login, no dominarlo.

## 4. Formulario

- chips de país de 32–36 px de alto;
- tarjetas de perfil de 66–72 px;
- gaps verticales de 12–16 px;
- bordes y radios más ligeros;
- título y subtítulo contenidos;
- controles coherentes y táctiles;
- preservar foco, teclado, loading, error y ES/EN.

No implementes autenticación.

## 5. Responsive

Generá capturas reales y pruebas en:

- `1920×1080`;
- `1440×900`;
- `768×1024`;
- `412×915`;
- `390×844`.

En tablet y móvil:

- conservar la órbita como hero compacto;
- no ocultarla con `display:none`;
- no recortar labels;
- no generar scroll horizontal general;
- permitir scroll horizontal solo en países cuando sea indispensable;
- mantener controles legibles y táctiles.

## 6. Países y branding

Preservar:

- `tenantBranding` por props;
- producto y tenant separados;
- todos los países recibidos, con bandera y nombre;
- orden recibido;
- escenarios de 1, 2, 8 y 12 países;
- sin hardcodear países;
- sin `+N`;
- sin multiselect;
- sin selección obligatoria de país.

Eliminar:

- comentario `fidelity v4`;
- HEAD histórico `3be7763`;
- afirmaciones de integración.

Usar únicamente:

`TARGET_HEAD_RESOLVED_BY_CHATGPT_AT_INTEGRATION_TIME`.

## 7. Pendientes frontend acumulados

Además del Login, incluir un directorio `frontend-pending-delta/` con deltas localizados para:

### Responsive P1

- tablas, fichas, tarjetas, modales, filtros, topbar y breadcrumb;
- aprovechar el ancho útil;
- wrappers de tabla con scroll horizontal visible;
- conservar encabezados y primera columna;
- pista accesible “Desliza para ver más” cuando aplique;
- modales utilizables en móvil;
- sin rediseño general ni cambio de navegación.

### PDF P1

- exportar solo el reporte seleccionado;
- ocultar navegación, botones y paneles;
- incluir tenant, proyecto, periodo, alcance, fuente y fecha;
- incluir la gráfica visible cuando ya exista una gráfica válida;
- no fabricar métricas o gráficas;
- conservar las mismas filas y filtros de la vista.

### Excel P2

- hojas `Resumen` y `Datos`;
- título y metadatos;
- encabezados diferenciados;
- autofiltro;
- encabezado congelado;
- anchos útiles;
- formatos de fecha, porcentaje, número y moneda por fila;
- no sumar monedas distintas;
- no convertir ausencia en cero.

### Wizard de proyectos

Agregar visualmente:

- Directo / Local;
- Delegado;
- Regional.

No definir reglas financieras ni lógica interna.

### Copy financiero delegado

Comunicar:

- coordinación delegada;
- remuneración configurada por proyecto;
- reparto configurable cuando corresponda;
- regalía local no aplicable cuando el proyecto no es local.

No calcular ni inventar porcentajes.

### Ficha Shopper

Convertir `docs/ESPEC-FICHA-SHOPPER.md` en componente portable responsive con datos mock:

- nombre, usuario, correo, país y estado de acceso;
- certificaciones;
- teléfono, documento y cuenta enmascarados;
- callbacks visuales de activación y restablecimiento.

Nunca mostrar contraseña, hash, documento completo o cuenta completa. No implementar persistencia ni permisos reales.

## 8. Entrega obligatoria

Un único ZIP V6 con:

1. `login-portable-v6/`;
2. `frontend-pending-delta/`;
3. `docs/REPORTE-DE-CAMBIOS.md`;
4. `docs/REPORTE-RESPONSIVE.md`;
5. `docs/REPORTE-TOKENS.md`;
6. `docs/COMPARACION-VISUAL-V5-V6.md`;
7. capturas reales de los cinco viewports;
8. escenarios de 1, 2, 8 y 12 países;
9. `MANIFEST.json` con todos los archivos, incluidas las imágenes, path, bytes y SHA-256.

## 9. Criterio de aceptación

La entrega queda lista para auditoría cuando:

- el desktop se ve equilibrado, limpio y profesional;
- la órbita no domina el panel;
- la composición se acerca o mejora la referencia;
- el formulario cabe correctamente;
- tablet y móvil no tienen recortes;
- las capturas tienen dimensiones reales y están en el manifest;
- no quedan residuos V4 ni HEAD históricos;
- el ZIP contiene Login y pendientes frontend acumulados;
- no contiene backend ni afirmaciones de integración.

Realizá directamente todo el bloque y devolvé el ZIP completo, sin pedir autorizaciones intermedias.
