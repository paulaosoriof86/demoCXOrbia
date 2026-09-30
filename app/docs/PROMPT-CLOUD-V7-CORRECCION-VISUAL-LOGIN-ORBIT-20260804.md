# CLOUD V7 — CORRECCIÓN VISUAL EXACTA DEL LOGIN YA EMPALMADO

## Estado

`V6_EMPALMED__VISUAL_HOLD__NO_DEPLOY`

## Objetivo único

Corregir únicamente el Login/órbita V6 ya empalmado para que en escritorio se vea igual o mejor que la referencia de Emergent y use la disciplina visual de Orbit 360.

No reconstruir la aplicación. No tocar backend, autenticación, datos, permisos, rutas, Finanzas, Shoppers, laboratorio, exportaciones, GitHub ni deploy.

## Archivos permitidos

- `app/app.js`
- `app/styles/layout.css`

Solo un tercer archivo frontend si es estrictamente indispensable y se justifica expresamente.

## Fuente visual obligatoria

1. Emergent es la autoridad de composición, proporción, densidad y jerarquía.
2. Orbit 360 es la autoridad de estilo orbital: órbita compacta, elegante, con centro fuerte y panel de acceso limpio.
3. La V6 empalmada es el estado que debe corregirse, no una referencia para rediseñar.

## Qué debe desaparecer del login canónico

- logo grande `CXOrbia`;
- `Field Operations Platform`;
- `Selecciona un perfil para entrar al demo`;
- `Accesos de validación`;
- botones Operativo / Coordinador / Aliado;
- `Desarrollado por CXOrbia`;
- `Instalar como app`;
- `Demo comercial · datos ficticios`;
- patrones de usuario o contraseña;
- textos técnicos DEV.

No eliminar la lógica subyacente si se necesita fuera del login; simplemente no mostrarla en la pantalla canónica.

## Panel izquierdo

- 49–50 % del ancho;
- fondo azul muy oscuro con retícula fina;
- `Gravicentra CX` arriba a la izquierda;
- órbita centrada visualmente;
- diámetro de 380–410 px en `1440×900`;
- máximo 440–460 px en `1920×1080`;
- tres anillos finos;
- seis conceptos: CLIENTES, TECNOLOGÍA, PERSONAS, OPERACIÓN, PROCESOS e INFORMACIÓN;
- nodos exteriores pequeños;
- máximo dos o tres satélites secundarios;
- radios muy sutiles;
- centro compacto `Gravicentra CX`, núcleo rojo mínimo y `CORE` discreto;
- tagline inferior `FIELD OPERATIONS INTELLIGENCE` y la frase aprobada;
- animación lenta con `prefers-reduced-motion`.

## Panel derecho

Orden exacto:

1. `INGRESO`;
2. `Iniciá sesión`;
3. `Accedé con tu cuenta corporativa para gestionar operaciones de campo.`;
4. países del tenant;
5. `PERFIL`;
6. Administración / Coordinación;
7. Portal del Cliente;
8. Shopper / Evaluador;
9. Usuario o correo corporativo;
10. Contraseña;
11. botón `Ingresar`;
12. `¿Sos evaluador nuevo? Registrate acá →`.

El contenido empieza cerca de la parte superior. No centrarlo como portada.

## Países

- todos los configurados para el tenant;
- orden recibido;
- bandera + nombre;
- sin `+N`;
- sin multiselect;
- sin selección obligatoria;
- chips rectangulares compactos de 30–34 px;
- probar 1, 2, 8 y 12 países.

## Tarjetas

- 70–76 px de alto;
- radio 6–8 px;
- borde gris fino;
- gap 8–10 px;
- ícono 44–48 px;
- estado seleccionado con borde azul fino.

## Formulario

- ancho 410–440 px en `1440×900`;
- inputs y botón de 46–50 px;
- gaps de 10–14 px;
- conservar callbacks y comportamiento actual;
- no crear autenticación paralela.

## Responsive

Entregar capturas reales:

- `1920×1080`;
- `1440×900`;
- `768×1024`;
- `412×915`;
- `390×844`.

Conservar órbita compacta en tablet/móvil, sin `display:none`, sin recortes y sin scroll horizontal general.

## Entrega

Un único ZIP `CLOUD-V7-LOGIN-ORBIT-VISUAL-DELTA` con:

- `app/app.js`;
- `app/styles/layout.css`;
- reporte de cambios;
- capturas de cinco viewports;
- comparación V6/V7 en `1440×900`;
- escenarios 1/2/8/12 países;
- manifest con path, bytes y SHA-256 de todos los archivos e imágenes.

No entregar aplicación paralela ni otros módulos.

## Aceptación

La captura V7 `1440×900` debe colocarse junto a Emergent y demostrar la misma proporción, jerarquía y densidad; órbita compacta estilo Orbit; campos visibles; todos los países configurados; cero textos de demo o validación; acabado corporativo.
