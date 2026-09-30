# RESUMEN PARA CLAUDE — CORTE 0B R21

Fecha: 2026-07-18  
Estado: `R21_TECHNICAL_PASS_FRONTEND_DELTA_REQUIRED`  
Baseline: V159 empalmada en `docs-tya-v6-v71-audit`  
Commit técnico validado: `287cd0729c14ef9dfe63ce566c6bc2ff8604f2a0`  
Gates: run `29669735189`, éxito

No generar candidata general, no reinterpretar la HR y no modificar contratos/backend.

## Verdad contractual ya resuelta

R21 entrega:

- `unassigned`: visita sin shopper;
- `available`: oportunidad publicable;
- `eligibilityBlocked`: dependencia o disponibilidad pendiente;
- proyecto y periodo como identidades distintas;
- franja y ventana de medición normalizadas;
- perfil del tenant para roles, países, banderas, Cliente y autorregistro.

Julio 2026: 44 visitas, 39 asignadas, 5 sin asignar, 4 publicables y una bloqueada: MC. Santa Clara Q2 por `P1Q`.

Contratos disponibles:

- `CX.data.visitFacets(visit)`;
- `CX.data.availableVisits(pool?)`;
- `CX.data.postulationEligibility(visit, proposedDate)`;
- `CX.tenantProfile`;
- `CX.data.currentProjectId`;
- `CX.data.currentPeriodId`.

## 1. Proyecto y periodo separados

Archivo principal: `app/core/router.js`.

Problema: Shopper y Cliente muestran el nombre completo del registro de periodo como proyecto y vuelven a mostrar el periodo por separado. Tampoco existe selector de proyectos activos/autorizados.

Implementación requerida:

1. El rótulo de proyecto usa la identidad base del programa/proyecto, no `period.name` completo.
2. El rótulo de periodo usa únicamente la etiqueta del periodo activo.
3. Shopper recibe proyectos activos y elegibles para su perfil.
4. Cliente recibe únicamente proyectos asignados.
5. Cambiar proyecto recalcula sus periodos, elige el vigente o último autorizado y emite el evento contractual existente.
6. Cambiar periodo no modifica la identidad del proyecto.
7. Con un solo proyecto puede mostrarse un selector de una opción o rótulo no editable, pero nunca mezclar proyecto y periodo.
8. No hardcodear Cinépolis, fechas, países o roles.

Aceptación:

- Proyecto visible: `Cinépolis`.
- Periodo visible: `JUL 2026`.
- Cambiar periodo altera los datos y no el proyecto.
- Otro tenant funciona desde configuración sin cambios de código.

## 2. Ficha y envío de postulación

Archivo principal: `app/modules/visita-detalle.js`.

Problemas: se mostró `null`, WKND aceptó un día entre semana, no existía control Q1/Q2 y podía mostrarse éxito con una fecha inválida.

Implementación requerida:

1. Consultar `data.visitFacets(v)` al abrir la ficha.
2. Si `available !== true`, deshabilitar `Postularme` y mostrar un mensaje funcional.
3. Nunca mostrar `null`, `undefined` ni tokens técnicos.
4. Mostrar `measurementWindowLabel`, rango de medición y franja normalizada.
5. En cada cambio de fecha y al enviar ejecutar:

```js
const result = data.postulationEligibility(v, proposedDate);
```

6. Solo continuar cuando `result.ok === true`.
7. No volver a codificar WK/WKND, Q1/Q2, fecha mínima o dependencia previa dentro del módulo.
8. Mapear motivos:
   - `visit_already_assigned`: visita ya asignada;
   - `blocked_previous_measurement_window`: pendiente de la ventana anterior;
   - `blocked_missing_availability`: aún no habilitada;
   - `available_from_missing_or_invalid`: disponibilidad pendiente de validación;
   - `before_available_from`: fecha anterior a la habilitación;
   - `before_measurement_window` / `after_measurement_window`: fuera del periodo de medición;
   - `requires_weekend`: requiere sábado o domingo;
   - `requires_weekday`: requiere lunes a viernes;
   - `proposed_date_invalid`: seleccionar fecha válida.
9. El atributo HTML `min` es apoyo visual, no reemplaza el contrato.
10. No mostrar éxito ni crear postulación cuando `ok:false`.
11. Mantener source-safe; no agregar persistencia falsa.

Aceptación:

- 4 tarjetas disponibles, no 5.
- MC. Santa Clara Q2 no aparece como oferta.
- Plaza Américas Q2 rechaza fecha anterior al 25 de julio, día entre semana y fecha fuera de Q2; acepta fin de semana válido.
- Carchá, Altara y Juticalpa WK rechazan sábado/domingo.
- No aparece `null`.

## 3. Login configurable por tenant

Archivo principal: `app/app.js`.

Implementación requerida:

1. Usar `CX.tenantProfile.visibleLoginRoles`.
2. DEV muestra Admin, Cliente, Shopper, Operativo, Coordinador y Aliado.
3. El rótulo técnico es `Accesos de validación`.
4. Con `showRoleTestArea:false`, ocultar bloque técnico y separador.
5. Producción TyA parte de Admin, Operativo y Shopper, modificable desde configuración.
6. Banderas derivadas de países del tenant o proyectos activos.
7. `clientPortalVisible:false` oculta Cliente sin borrar su implementación.
8. `allowShopperRegistration:false` oculta autorregistro.
9. No mostrar `Probar acceso por rol (matriz de permisos)` en producción.
10. No modificar Auth ni claims.

Aceptación: DEV permite probar todos los roles; producción puede ocultarlos sin tocar código; países/proyectos activos gobiernan banderas.

## 4. Academia del Cliente

Revisar:

- `app/core/router.js`;
- `app/modules/cliente-extra.js`;
- `app/modules/academia.js`;
- permisos y menú Cliente.

Regla: `Capacitación por brechas` y `Academia` son objetos distintos.

Implementación requerida:

1. Mantener `cli_capacitacion` para recomendaciones por brechas.
2. Exponer Academia cuando perfil/permisos la habiliten.
3. Reutilizar cursos, progreso, evaluaciones y manuales existentes.
4. Mostrar estado vacío honesto si no hay contenido autorizado.
5. Respetar tenant, proyecto y rol.

## Reglas transversales

- Conservar exactamente la interfaz pública de `CX.data`.
- No mover lógica backend a UI.
- No agregar llamadas directas a hojas, Firebase, Make o Gemini.
- No usar localStorage como fuente operativa.
- UTF-8 sin BOM y sin PII.
- No rediseñar módulos no relacionados.

## Clasificación

- Reusable CXOrbia: selectores por alcance, login configurable, elegibilidad y Academia Cliente.
- Exclusivo TyA: GT/HN, Cinépolis, Q1/Q2 y token fuente `P1Q`.
- Claude/prototipo: los cuatro cambios anteriores.
- Academia: disponibilidad, ventanas, franjas, dependencias y accesos por tenant.
- Sin impacto Claude: motor, adapter, contratos, gates y evidencia.

## Entrega esperada

Candidata incremental que modifique únicamente los archivos necesarios para estos cuatro hallazgos, con lista exacta de archivos y pruebas. No rehacer la plataforma ni incluir backend.
