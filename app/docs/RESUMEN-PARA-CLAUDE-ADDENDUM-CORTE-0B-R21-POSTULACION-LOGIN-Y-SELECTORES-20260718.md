# RESUMEN PARA CLAUDE — CORTE 0B R21

Fecha: 2026-07-18  
Estado: `R21_TECHNICAL_PASS_FRONTEND_DELTA_REQUIRED`  
Baseline: V159 empalmada en `docs-tya-v6-v71-audit`  
Commit técnico validado: `287cd0729c14ef9dfe63ce566c6bc2ff8604f2a0`  
Gates: run `29669735189`, éxito  
Regla: no generar candidata general, no reinterpretar HR y no modificar contratos/backend.

## Contexto vinculante

La validación visual R20 no fue aprobada. R21 ya entrega una única verdad contractual:

- `unassigned`: visita sin shopper;
- `available`: oportunidad publicable;
- `eligibilityBlocked`: dependencia o disponibilidad pendiente;
- proyecto y periodo como identidades distintas;
- perfil del tenant y roles visibles;
- franja y ventana de medición normalizadas.

Julio 2026 confirma 5 visitas sin shopper, 4 publicables y una bloqueada: MC. Santa Clara Q2 por `P1Q`. No reconstruir esta semántica en los módulos.

Contratos disponibles:

- `CX.data.visitFacets(visit)`;
- `CX.data.availableVisits(pool?)`;
- `CX.data.postulationEligibility(visit, proposedDate)`;
- `CX.tenantProfile`;
- `CX.data.currentProjectId`;
- `CX.data.currentPeriodId`.

## Cambio 1 — proyecto y periodo separados

Archivo: `app/core/router.js`.

Implementación:

1. Mostrar nombre base del proyecto, no el nombre del registro de periodo.
2. Mostrar el periodo activo en un control independiente.
3. Shopper ve proyectos activos/elegibles para su perfil.
4. Cliente ve únicamente proyectos asignados.
5. Cambiar proyecto recalcula sus periodos y no colapsa `currentProjectId` con `currentPeriodId`.
6. Cambiar periodo no altera la identidad del proyecto.
7. No hardcodear Cinépolis, fechas, países o roles.

Aceptación: Proyecto `Cinépolis`; Periodo `JUL 2026`; otro tenant funciona desde configuración.

## Cambio 2 — ficha y envío de postulación

Archivo: `app/modules/visita-detalle.js`.

Implementación:

1. Consultar `data.visitFacets(v)` al abrir.
2. Si `available !== true`, deshabilitar postulación y mostrar mensaje funcional.
3. Nunca mostrar `null`, `undefined` ni tokens técnicos.
4. Mostrar ventana de medición y franja normalizadas.
5. En cambio de fecha y al enviar ejecutar:

```js
const result = data.postulationEligibility(v, proposedDate);
```

6. Solo continuar con `result.ok === true`.
7. No volver a codificar WK/WKND, Q1/Q2, fecha mínima o dependencia previa dentro del módulo.
8. Mapear motivos a mensajes comprensibles:
   - `visit_already_assigned`: visita ya asignada;
   - `blocked_previous_measurement_window`: pendiente de ventana anterior;
   - `blocked_missing_availability`: aún no habilitada;
   - `available_from_missing_or_invalid`: disponibilidad pendiente de validación;
   - `before_available_from`: fecha anterior a la habilitación;
   - `before_measurement_window` / `after_measurement_window`: fuera del periodo de medición;
   - `requires_weekend`: requiere sábado o domingo;
   - `requires_weekday`: requiere lunes a viernes;
   - `proposed_date_invalid`: seleccionar fecha válida.
9. No mostrar éxito ni crear postulación cuando `ok:false`.
10. Mantener el estado source-safe; no agregar persistencia falsa.

Aceptación:

- 4 tarjetas disponibles, no 5.
- MC. Santa Clara Q2 no es oferta publicable.
- Plaza Américas Q2 rechaza fecha anterior al 25, día entre semana y fecha fuera de Q2; acepta fin de semana válido.
- Carchá, Altara y Juticalpa WK rechazan sábado/domingo.

## Cambio 3 — login configurable por tenant

Archivo: `app/app.js`.

Implementación:

1. Usar `CX.tenantProfile.visibleLoginRoles`.
2. DEV muestra Admin, Cliente, Shopper, Operativo, Coordinador y Aliado.
3. El rótulo técnico es `Accesos de validación`.
4. Con `showRoleTestArea:false` ocultar bloque y separador.
5. Producción TyA parte de Admin, Operativo y Shopper, modificable desde configuración.
6. Banderas derivadas de países del tenant o proyectos activos.
7. `clientPortalVisible:false` oculta Cliente sin borrar su implementación.
8. `allowShopperRegistration:false` oculta el autorregistro.
9. No mostrar `Probar acceso por rol (matriz de permisos)` en producción.
10. No modificar Auth ni claims.

## Cambio 4 — Academia del Cliente

Revisar:

- `app/core/router.js`;
- `app/modules/cliente-extra.js`;
- `app/modules/academia.js`;
- permisos y menú Cliente.

Regla: `Capacitación por brechas` y `Academia` son objetos distintos.

Implementación:

1. Mantener `cli_capacitacion` para recomendaciones por brechas.
2. Exponer Academia cuando el perfil/permisos del tenant la habiliten.
3. Reutilizar cursos, progreso, evaluaciones y manuales existentes.
4. Mostrar estado vacío honesto si no hay contenido autorizado.
5. Respetar tenant, proyecto y rol.

## Reglas transversales

- Conservar exactamente la interfaz pública de `CX.data`.
- No mover lógica backend a UI.
- No agregar llamadas directas a fuentes, Firebase, Make o Gemini.
- No usar localStorage como fuente operativa.
- UTF-8 sin BOM.
- No exponer PII.
- No rediseñar módulos no relacionados.

## Clasificación

- Reusable CXOrbia: selectores por alcance, login configurable, elegibilidad y Academia Cliente.
- Exclusivo TyA: GT/HN, Cinépolis, Q1/Q2 y token fuente `P1Q`.
- Claude/prototipo: los cuatro cambios anteriores.
- Academia: disponibilidad, ventanas, franjas, dependencias y accesos por tenant.
- Sin impacto Claude: motor, adapter, contratos, gates y evidencia.

## Entrega esperada

Candidata incremental que modifique únicamente los archivos necesarios para estos cuatro hallazgos, con lista exacta de archivos y pruebas. No rehacer la plataforma ni incluir backend.
