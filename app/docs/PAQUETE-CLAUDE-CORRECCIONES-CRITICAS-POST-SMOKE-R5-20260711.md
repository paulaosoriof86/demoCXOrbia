# Paquete Claude — correcciones críticas post-smoke R5

Fecha: 2026-07-11
Proyecto: CXOrbia TyA
Prioridad: P0/P1 acotada

## Baseline obligatoria

Trabajar únicamente sobre la última candidata comercializable y devolverla incrementalmente corregida. La referencia de empalme es V103 Phase A R5, source lock externo:

`dbe7d7278a7e67a08822a90a9b971b6311dfef38e470a62ed845b0688783aeb5`

No trabajar sobre candidatas rechazadas ni sobre una versión anterior. No modificar contratos, adapters, importadores, datos source-safe, tools o workflows. No rediseñar módulos completos.

## Corrección 1 — P0 Portal Cliente sin resultados

Archivo principal: `app/modules/cliente.js`
Módulo: `cli_dashboard`

Hallazgo: cuando la fuente source-safe todavía no contiene sucursales puntuadas o secciones evaluadas, `R.mejorSeccion` y `R.peorSeccion` son nulos. Las referencias directas a `.sec.name` y `.val` rompen la vista.

Resultado requerido:

- Portal Cliente debe abrir aunque todavía no existan resultados;
- mostrar empty state honesto: resultados pendientes / sin secciones evaluadas;
- no generar score, NPS, brecha, recomendación IA, ranking o sucursales ficticias;
- conservar comportamiento actual cuando sí existan resultados;
- revisar también `app/modules/cliente-extra.js` por el mismo patrón nulo.

Aceptación:

- `cli_dashboard` renderiza con arreglo vacío;
- renderiza con resultados parciales;
- renderiza con resultados completos;
- cero excepción por `mejorSeccion/peorSeccion`;
- sin datos inventados.

## Corrección 2 — P0 usuarios demo fuera de demo

Archivo principal: `app/modules/configuracion.js`
Módulo: `usuarios`

Hallazgo: si no hay usuarios persistidos, inicializa `Admin Demo`, `Coordinación`, `Operaciones`, `Evaluador 01` y `Finanzas` con correos demo. En la entrada TyA/source-safe esos usuarios aparentan ser reales.

Resultado requerido:

- seeds demo solamente cuando `CX.isDemo === true` o equivalente explícito;
- fuera de demo, lista vacía o estado `pendiente Auth/backend`;
- no mostrar ni persistir `Admin Demo`, `Evaluador 01` o correos `@demo.cxorbia`;
- no crear Auth ni simular invitaciones reales;
- conservar matriz de permisos y capacidad administrativa del prototipo.

Auditar también semillas visibles en Certificaciones, Finanzas, Correo y topbar. No resolverlas con un parche global que oculte datos reales; usar gate de modo demo por fuente.

Aceptación:

- modo demo conserva sus fixtures;
- TyA/source-safe no contiene nombres/correos demo;
- usuarios vacíos muestran estado honesto;
- cero persistencia local de seeds demo al entrar en source-safe.

## Corrección 3 — P1 Histórico excluye activo por defecto

Archivo: `app/modules/historico.js`

Hallazgo: el comentario y copy dicen que Histórico no mezcla operación activa, pero `rows` se construye desde todos los periodos y el filtro inicial es `all`. Julio 2026 activo aparece en la vista inicial.

Resultado requerido:

- usar `data.historicalPeriodsForProgram(key)` cuando exista;
- fallback: filtrar `data.periodState(p.id) !== 'activo'`;
- filtro inicial muestra cerrados/archivados;
- agregar opción explícita `Incluir activo` o estado `Activo` sin activarla por defecto;
- no reconstruir periodos por nombre o tab;
- no cambiar IDs ni estados definidos por backend.

Aceptación TyA:

- vista inicial: 13 periodos / 572 visitas;
- julio 2026 no aparece inicialmente;
- al incluir activo: 14 periodos / 616 visitas;
- país y export respetan el filtro visible.

## Corrección 4 — P1 overflow móvil Shopper

Cobertura: layout/estilos y rutas del portal shopper.

Hallazgo: viewport 390 px produce `scrollWidth=516`.

Resultado requerido:

- identificar el elemento exacto que fuerza el ancho;
- corregir en la fuente del componente/estilo, no con `overflow-x:hidden` global;
- preservar scroll horizontal únicamente dentro de tablas anchas;
- tarjetas, KPIs, filtros, botones y modales deben caber en 360/390/412 px;
- no romper desktop ni Admin.

Aceptación:

- `document.documentElement.scrollWidth <= window.innerWidth` en 360, 390 y 412 px;
- todas las 11 rutas shopper abren;
- tablas anchas conservan scroll interno;
- sin recortes de botones o contenido.

## Comportamiento R5 que debe preservarse

La entrada TyA source-safe ya:

- retira 6 notificaciones demo;
- desactiva seed automático de reservas;
- marca notificaciones `pending_backend_event_source`;
- marca reservas `pending_backend_reservation_source`;
- mantiene 44 liquidaciones de junio, 0 pagos y 0 elegibles para lote;
- conserva 14 periodos, 616 visitas y 213 shoppers;
- mantiene 13 históricos + julio activo.

No reintroducir seeds demo ni reemplazarlos por datos ficticios.

## Documentación obligatoria de Claude

Actualizar en la candidata:

- changelog único;
- manifest SHA-256;
- resumen de archivos modificados;
- qué resolvió cada punto;
- qué quedó pendiente;
- impacto en Academia/manuales/rutas por rol;
- resultado de sintaxis y smoke por rol;
- evidencia de 360/390/412 px.

## Salida esperada

Entregar una única candidata incremental completa. No entregar parches sueltos. No hacer deploy, merge, Firebase, Make, Gemini, import ni producción.
