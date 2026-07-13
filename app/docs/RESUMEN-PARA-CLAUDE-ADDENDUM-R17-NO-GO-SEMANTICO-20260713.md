# RESUMEN PARA CLAUDE — addendum R17 NO-GO semántico

Fecha: 2026-07-13

## Estado obligatorio

R17 no está visualmente aprobado. La revisión humana de Paula detectó regresiones ya reportadas y defectos de empalme de datos.

Decisión vigente:

`NO_GO_VISIBLE_TYA_R17_SEMANTIC_DATA_MAPPING`

No crear una candidata nueva desde cero y no reabrir el diseño general V110. Trabajar sobre la última candidata/source lock y corregir exclusivamente los puntos visibles descritos aquí, preservando las mejoras ya empalmadas.

## P0 Claude/prototipo

### Un único periodo canónico

- El selector del sidebar modifica `CX.data.currentProjectId` y actualmente es el control real.
- El selector mensual de Dashboard no modifica datos; solo cambia texto/toast.
- Mi Día mantiene un mes independiente hardcodeado.
- Dashboard, Visitas, Mi Día, Periodos, Histórico y Finanzas deben leer el mismo periodo activo.
- Si un selector duplica la función del sidebar, debe enlazarse al periodo canónico o retirarse; nunca puede ser cosmético.

### Mi Día

- Derivar el mes del calendario del periodo canónico.
- Al cambiar periodo, cambiar título, KPIs, calendario y eventos.
- No usar `2026-06` ni `2026-06-21` hardcodeados.
- Fechas inválidas o pendientes de backend no deben crear eventos falsos.

### Login y marca

- Sin logo: nombre del tenant una sola vez y título funcional una sola vez.
- Con logo: logo + título funcional; no repetir nombre del tenant.
- La presencia/ausencia del logo no debe cambiar arbitrariamente la estructura del título.
- Mantener CXOrbia en el lugar de plataforma/desarrollador acordado.

### Países y banderas

- No fijar GT/HN desde una build TyA.
- Renderizar países habilitados desde configuración tenant/proyecto.
- Cuando exista alcance o país activo, reflejar ese estado claramente.
- No confundir países disponibles con selección activa del usuario.

### Shoppers protegidos

- No mostrar rating uniforme, perfil completo, estado activo u honorario estándar si esos atributos no vienen de una fuente real.
- Usar estado honesto: referencia protegida, perfil pendiente de fuente, certificación pendiente/materializada, revisión requerida.
- No inventar los tres shoppers faltantes ni fusionar por nombre.

### KPIs

- Definir si cada KPI representa fase exclusiva o atributo acumulativo.
- Etiqueta, conteo y drill deben usar la misma definición.
- No presentar `asignadas` como fase exclusiva si incluye realizadas/liquidadas/fuera de rango.

## Backend que Claude no debe resolver desde UI

- normalización de fechas seriales Excel;
- mapeo canónico de estados HR;
- separación submitido/liquidación/pago;
- runtime sync HR;
- Firestore/Auth/Storage;
- imports, Make, Gemini, reglas o Functions;
- shoppers reales y certificaciones carryover.

Para esos puntos, Claude debe consumir el contrato/backend y mostrar estado pendiente honesto. No parchear datos desde módulos.

## Evidencia visual recibida

- Dashboard: sidebar JUN 2026 y selector interno JUL 2026 simultáneos.
- Mi Día: periodo JUL 2026 y calendario junio; julio manualmente vacío.
- Visitas: fechas `45851.0`, `46215.0`, `46208.0`, `783` visibles.
- Login: `TyA` duplicado sin logo; duplicación desaparece al cargar logo.
- Shoppers: 210 filas uniformes con rating 4.3 y atributos aparentes no respaldados.

## No tocar

- No reescribir backend dentro de módulos.
- No borrar fixes V110 ya cerrados.
- No regresar a versiones anteriores.
- No afirmar HR runtime live, liquidación/pago real, Auth real o producción.
- No cambiar Cinépolis a lógica global; sigue siendo proyecto TyA configurable.

## Academia

Actualizar manuales/rutas por rol para explicar proyecto versus periodo, snapshot versus runtime, estados operativos versus financieros, fechas en revisión y alcance por país.
