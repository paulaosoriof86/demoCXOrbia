# PLAN R19 — CIERRE MÓDULO A MÓDULO

Fecha: 2026-07-15

## Objetivo

Evitar que una corrección se pierda después de Claude o del empalme. Ningún bloque se considera cerrado por reporte, sintaxis o ausencia de errores de consola.

## Flujo obligatorio por bloque

```text
SOLICITADO
→ CLAUDE ENTREGÓ
→ AUDITORÍA DELTA PASS
→ GATES SEMÁNTICOS PASS
→ EMPALME ATÓMICO PASS
→ HOSTING DEV + SMOKE REMOTO PASS
→ VALIDACIÓN VISUAL PAULA PASS
→ FROZEN
```

Si falla cualquier etapa, no se continúa al siguiente módulo y no se repite el empalme completo. Se corrigen únicamente los gates afectados.

## Al recibir la candidata Claude

### 1. Auditoría delta focalizada

- Comparar contra V131 + hotfix R18D.
- Revisar agregados, eliminados y modificados.
- Preservar `data.project()` en Finanzas y el adapter `period()` de R18D.
- Rechazar cambios backend, datos, R11D/R14C, Firebase o herramientas.
- Si hay cambios ajenos, detener antes del empalme con lista exacta; no iniciar auditoría general.

### 2. Gates semánticos nuevos

- Fixture ortogonal de estados.
- Paridad `tileCount == detailRows.length == exportRows.length`.
- Cambio MAY/JUN/JUL en todos los módulos.
- Proyecto y periodo separados por admin/shopper/cliente.
- Visitas postulables únicamente sin shopper/no realizadas/periodo activo.
- Postulaciones del periodo activo.
- Shopper activo por visita realizada en ventana de seis meses.
- Configuración de frecuencia, medición, HR, cuestionario, países y monedas persistente.
- Dashboard Financiero sin creación ni series inventadas.
- PWA nativa en Chromium y guía solo para iOS.

### 3. Empalme atómico

- Aplicar solo el delta validado.
- Regenerar manifest/source lock.
- Mantener una única baseline activa.

### 4. Verificación DEV

- Smoke local.
- Hosting DEV con autorización separada cuando corresponda.
- Smoke remoto sobre el build exacto.

### 5. Revisión visual obligatoria

Administración:

- Dashboard Operativo y todos sus KPI/detalles.
- Visitas Disponibles.
- Postulaciones.
- Shoppers.
- Proyectos/configuración/tenant/países.
- Dashboard Financiero, Movimientos, Liquidaciones y Lotes.

Shopper:

- nombre y selector de proyecto;
- periodo separado;
- Mi Día, Visitas Disponibles, Reservas y Mis Visitas.

Cliente:

- nombre y selector de proyecto;
- periodo separado;
- Panorama y cambio de periodo.

PWA:

- Edge/Chrome Windows con prompt nativo.

### 6. Congelación

Con aprobación visual:

- registrar captura/resultado esperado;
- actualizar checkpoint, CAMBIOS, RESUMEN PARA CLAUDE, PENDIENTES, Academia y PR;
- marcar bloque `FROZEN`;
- añadir regresión automática a los gates;
- continuar al siguiente bloque operativo.

## Siguiente bloque después de R19

Solo después de R19 visual PASS:

- retomar Phase A operativa sobre datos reales y materialización controlada Firebase DEV;
- no reabrir V131, HR, R11D, R14C ni importadores sin evidencia nueva.
