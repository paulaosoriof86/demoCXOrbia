# PENDIENTES CLAUDE ADDENDUM V63 - PROYECTOS, PERIODOS E HISTORICO

Fecha: 2026-07-01
Proyecto: CXOrbia
Base visual: V63

## Decision confirmada por Paula

El selector de Proyecto debe mostrar solo proyectos reales/operativos, no periodos historicos ni meses de ejecucion.

El periodo debe gestionarse desde otra seccion o control separado, no dentro del selector principal de Proyecto.

## Problema detectado

Al conectar Firestore DEV, el preview mostro meses historicos de Cinepolis dentro del selector de proyecto. Ejemplos del problema visual observado:

- Cinepolis ABRIL 26
- Cinepolis ABRIL 26 HN
- Cinepolis AGOSTO 25
- Cinepolis AGOSTO 25 HN
- Cinepolis DICIEMBRE 25
- Cinepolis ENERO 26
- Cinepolis FEBRERO 26
- Cinepolis JULIO 25
- Cinepolis JUNIO 25
- Cinepolis MARZO 26
- otros meses y paises

Esto no debe verse como lista de proyectos. Son periodos, rutas o cortes historicos de un mismo cliente/proyecto operativo.

## Regla funcional para Claude

Claude debe separar claramente:

1. Proyecto
   - Cliente o programa operativo principal.
   - Ejemplo conceptual: Cinepolis.
   - Debe aparecer en el selector principal de proyecto.
   - No debe duplicarse por mes.
   - No debe duplicarse por pais si pertenece al mismo programa operativo.

2. Periodo
   - Mes, ronda, quincena, ciclo o corte de ejecucion.
   - Ejemplos conceptuales: Abril 2026, Junio 2026, Q1, Q2, ronda mensual.
   - Debe seleccionarse desde una seccion o filtro separado.
   - Puede estar en Dashboard Operativo, HR, Reportes, Rutas o Configuracion del proyecto.
   - No debe contaminar el selector principal de proyecto.

3. Pais
   - Guatemala, Honduras u otros paises.
   - Debe funcionar como filtro o dimension del proyecto/periodo.
   - No debe duplicar proyectos cuando el mismo proyecto tiene varios paises.

4. Historico
   - Debe poder consultarse, comparar y reportarse.
   - No debe mostrarse como operacion activa por defecto.
   - Debe estar separado de la operacion actual.

## UX esperada

### Selector principal de Proyecto

Debe contener solo proyectos/programas, por ejemplo:

- Cinepolis
- Proyecto piloto TYA
- Otros proyectos activos reales o demo segun corresponda

No debe contener:

- Cinepolis ABRIL 26
- Cinepolis ABRIL 26 HN
- Cinepolis JUNIO 25
- Cinepolis MARZO 26 HN
- meses historicos como si fueran proyectos

### Selector de Periodo

Debe estar separado y permitir:

- periodo actual;
- periodos anteriores;
- comparativo historico;
- pais;
- quincena;
- estado del periodo: actual, cerrado, archivado, piloto, demo.

### Vista de Historico

Debe existir una forma clara de consultar historico sin mezclarlo con la operacion actual:

- historico por cliente/proyecto;
- historico por pais;
- historico por periodo;
- comparativo intermensual;
- comparativo por quincena;
- evolucion de cumplimiento;
- evolucion de visitas realizadas, cuestionarios, submitidos, liquidaciones y beneficios.

## Incidencia visual observada

Durante la prueba de backend V63, el preview mostro tres estados sucesivos del badge/backend y la pantalla titilo. Esto ocurrio porque el backend intento filtrar o corregir el alcance del proyecto despues de que la UI ya habia iniciado el render.

Esto queda prohibido como metodologia.

Claude debe saber que:

- no se debe resolver con parches visuales;
- no se debe superponer renderizaciones;
- no se debe refrescar toda la pantalla para corregir datos;
- no se debe ocultar el historico a la fuerza desde la UI;
- la UI debe recibir desde el inicio una estructura coherente: proyecto, periodo, pais e historico.

## Regla tecnica para ChatGPT/backend

El backend debe entregar a `CX.data` una estructura ya normalizada antes del primer render:

- proyectos activos en `projects`;
- periodos en una estructura separada, por ejemplo `periods` o equivalente compatible;
- visitas filtrables por projectId y periodId;
- historico consultable sin aparecer como proyectos duplicados;
- currentProjectId separado de currentPeriodId.

No se debe hacer post-render scope ni hooks que modifiquen `CX.data` despues de que los modulos ya renderizaron, porque causa titileo y cambios visuales sucesivos.

## Requerimiento para Claude en la proxima version

Claude debe ajustar el prototipo para que soporte visualmente esta separacion:

1. Selector de proyecto limpio.
2. Selector de periodo separado.
3. Filtros de pais/quincena separados.
4. Vista historica separada de operacion activa.
5. Dashboard que muestre periodo actual y permita comparar historico sin convertir meses en proyectos.
6. HR que pueda elegir periodo sin cambiar el proyecto principal.
7. Reportes que permitan comparar periodos.
8. Configuracion del proyecto con seccion de periodos/ciclos.

## Modulos impactados para Claude

Claude debe revisar al menos:

- `app/modules/dashboard.js`
- `app/modules/visitas.js`
- `app/modules/postulaciones.js`
- `app/modules/reservas.js`
- `app/modules/proyectos.js`
- `app/modules/configuracion.js`
- `app/modules/reportes` si existe o la seccion equivalente de KPIs/reportes
- componentes de topbar/selector de proyecto si estan en core visual

## Criterio de aceptacion visual

La proxima version de Claude se considera correcta si:

- el selector de Proyecto no muestra meses;
- el periodo se elige desde un control independiente;
- el historico no aparece como operacion activa por defecto;
- no hay titileo al cargar datos;
- no hay renderizaciones sucesivas que cambien el significado de la pantalla;
- las visitas disponibles pertenecen al proyecto y periodo seleccionados;
- los KPIs explican proyecto, periodo y pais;
- el usuario entiende si esta viendo operacion actual, historico o comparativo.

## Prioridad

P0 para Claude.

Este punto debe resolverse antes de pedir que el backend siga exponiendo historico completo a la UI final.
