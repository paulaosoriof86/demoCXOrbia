# AUDITORÍA CLAUDE V108 — SOLO PROTOTIPO

Fecha: 2026-07-12

## Decisión

La candidata `Prototype development request CXOrbia V108.zip` no se empalma todavía.

Contiene mejoras reales que deben preservarse, pero conserva dos fallas P0 y una corrección parcial:

1. Academia: scope/contexto y actores por identidad estable.
2. Finanzas: lotes multi-país/multi-moneda e IDs no aleatorios.
3. Portal Cliente: score finito y umbral único.

No se agregan a Claude tareas de backend, Firebase, Auth real, Storage, Make, Gemini, HR, migración, importadores, gates, workflows, deploy o producción.

## Cambios V107 → V108

- 10 archivos modificados.
- 4 archivos agregados.
- 1 manifest anterior retirado del ZIP.
- 67 archivos JS/MJS pasan validación de sintaxis.
- 48 módulos cargan.

## Verificado como resuelto

### Responsive

Prueba independiente con viewports superiores reales:

- 360×800;
- 390×844;
- 412×915.

Módulos:

- Dashboard;
- Finanzas;
- Postulaciones;
- Reservas;
- Academia.

Resultado: 15/15 sin overflow horizontal del documento y sin errores de consola/página.

### Manifest

`node app/docs/verify-manifest.mjs`:

- 129 archivos;
- 0 faltantes;
- 0 hashes distintos;
- aggregate real `610149225b10678d0e6712b664ef6d78b564afb2747874134e42d01e7b71442b`;
- exit code 0.

El reporte V108 declara otro aggregate, por lo que la evidencia narrativa debe corregirse en V109.

### Portal sin scores

Caso real-mode/sin fixtures:

- 44 sucursales sin cuestionario confirmado;
- 0 críticas;
- 44 pendientes de evaluación.

La causa principal de `score:null` quedó corregida.

## Fallas comprobadas

### P0 — Academia

V108 fuerza `tenantId:[CX.BRAND.id]` al crear cursos, pero el contexto usado por `visibleFor()` no entrega ese tenant de forma canónica para shopper.

Prueba dinámica:

- curso creado para shopper;
- curso recibe tenant automático;
- contexto shopper entrega `tenantId:null` y proyecto `retail`;
- `visibleFor()` devuelve `false`;
- el curso asignado queda invisible.

Resultado por eje:

- tenant: FAIL;
- proyecto: PASS;
- país: FAIL;
- módulo: FAIL;
- nivel: FAIL;
- paquete: FAIL.

Módulo, nivel y paquete deben tratarse como taxonomía/filtros, no como atributos obligatorios de sesión.

Los actores `creador`, `revisadoPor` y `aprobadoPor` continúan guardándose/comparándose por nombre. El prototipo sí posee usuarios invitados en `cx_users`; deben utilizarse IDs locales estables o mantener el flujo deshabilitado como preview.

### P0 — Finanzas/lotes

`payVisits()` genera un único lote aleatorio por llamada y lo asigna a todas las visitas seleccionadas. La vista prioriza ese `loteId` antes de país/moneda.

Prueba dinámica:

- GT/GTQ, monto 130;
- HN/HNL, monto 270;
- misma llamada a `payVisits()`.

Resultado incorrecto:

- un solo lote;
- dos visitas;
- total mostrado `GTQ 400`;
- mezcla de monedas.

También existe fallback aleatorio cuando falta país/moneda.

### P1 — Portal Cliente

`typeof score === 'number'` acepta `NaN` e `Infinity`.

Los umbrales no coinciden:

- distribución crítico `<65`;
- KPI/modal crítico `<70`.

Con scores 64 y 69:

- KPI/modal críticos: 2;
- distribución crítica: 1.

## Qué debe conservarse

- responsive V108;
- corrección principal de score nulo;
- KPIs derivados de `visibleCourses`;
- Beneficios sin fallback a otro shopper;
- copy honesto de certificaciones;
- cache demo/real;
- mecanismo de manifest/verificador;
- navegación y shell.

## Siguiente entrega Claude

La nueva candidata debe ser V109 y limitarse a:

1. scope/contexto/actores de Academia;
2. lotes homogéneos e IDs determinísticos;
3. score finito y bandas únicas;
4. evidencia V109 coherente con pruebas Admin/Cliente/Shopper.

## Estado seguro

- no empalme;
- no cambios runtime del repo;
- no merge;
- no deploy;
- no servicios reales;
- no datos sensibles.