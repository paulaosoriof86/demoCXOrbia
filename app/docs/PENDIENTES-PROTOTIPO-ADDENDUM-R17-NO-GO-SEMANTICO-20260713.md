# PENDIENTES PROTOTIPO — addendum R17 NO-GO semántico

Fecha: 2026-07-13

## P0 reabiertos por evidencia humana

Estos puntos ya habían sido reportados en paquetes previos, pero la build visible demuestra que no quedaron cerrados. No deben marcarse como nuevos ni reprocesarse desde cero.

### P0-1 — Periodo único y sincronizado

- Sidebar es actualmente el selector real.
- Dashboard tiene selector mensual cosmético.
- Mi Día tiene calendario independiente.
- Unificar el estado de periodo y sus eventos en todos los módulos.

Criterio de cierre:

1. seleccionar JUN 2026 en cualquier control;
2. sidebar, Dashboard, Visitas, Mi Día, Histórico y Finanzas muestran JUN 2026;
3. seleccionar JUL 2026;
4. todos cambian a JUL 2026;
5. no queda texto, KPI o calendario del mes anterior.

### P0-2 — Login sin título duplicado

- Corregir la estructura con logo y sin logo.
- No repetir el nombre del tenant.
- La carga del logo no debe ser la condición que elimina el duplicado.

### P0-3 — Mi Día sin hardcodes de junio

- Eliminar estado/calendario fijo de junio.
- Derivar mes, hoy y eventos del contexto real.
- Julio debe mostrar eventos cuando existan fechas normalizadas.

### P0-4 — Países/banderas configurables

- Países habilitados por tenant/proyecto.
- País/alcance activo por sesión cuando aplique.
- No hardcodear GT/HN dentro de un adapter de cliente.

### P0-5 — Shoppers sin atributos ficticios

- No usar rating 4.3 uniforme.
- No mostrar perfil completo/activo/estándar sin fuente.
- Representar referencia protegida y pendientes de fuente/revisión.

### P0-6 — Estados y fases visibles honestos

- No mostrar submitido como liquidado.
- No mezclar fase operativa, cuestionario, submitido, liquidación y pago.
- Definir tarjetas exclusivas o acumulativas.

## Pendiente backend asociado — no Claude

- convertir seriales Excel a fechas ISO;
- enviar fechas inválidas a reviewQueue;
- crear mapper canónico TyA por periodo;
- conectar snapshot/runtime HR según gate;
- materializar Firestore y Auth bajo autorización separada;
- integrar fuente financiera/certificaciones.

## Bloqueo de aceptación

R17 no puede considerarse aprobada mientras exista cualquiera de estos casos:

- dos periodos visibles simultáneamente;
- selector que no cambia datos;
- calendario distinto al periodo activo;
- serial numérico visible como fecha;
- título tenant duplicado;
- atributos shopper uniformes inventados;
- estado `liquidada` inferido únicamente por submitido;
- afirmación de HR live cuando solo existe snapshot de build.

## Clasificación

- **Reusable CXOrbia:** periodo canónico, login/branding, país/alcance, KPIs honestos.
- **Exclusivo cliente:** mapeo TyA y reglas Cinépolis.
- **Claude/prototipo:** todos los P0 visuales anteriores.
- **Academia:** manual de validación y significado de estados.
- **Sin impacto Claude:** parser XLSX, CI, provider y materialización.
