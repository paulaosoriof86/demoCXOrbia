# RESUMEN PARA CLAUDE — CORTE 0B R21

Fecha: 2026-07-18  
Estado: `CORRECCION_FRONTEND_LOCALIZADA_REQUERIDA`  
Baseline: V159 empalmada en `docs-tya-v6-v71-audit`  
Regla: no generar candidata general, no reinterpretar HR y no modificar contratos/backend.

## 1. Contexto vinculante

La validación visual R20 no fue aprobada. El backend/adapter R21 ya separa:

- visita sin shopper (`unassigned`);
- oportunidad publicable (`available`);
- visita bloqueada por dependencia o falta de disponibilidad (`eligibilityBlocked`);
- proyecto y periodo como identidades distintas;
- perfil del tenant y roles visibles;
- ventana de medición y franja normalizadas.

La HR julio 2026 confirma 5 visitas sin shopper, pero solo 4 publicables. `MC. Santa Clara` Q2 tiene `P1Q` y debe quedar bloqueada por visita/ventana previa. No se debe volver a derivar esta semántica en los módulos.

Contratos disponibles en runtime:

- `CX.data.visitFacets(visit)`;
- `CX.data.availableVisits(pool?)`;
- `CX.data.postulationEligibility(visit, proposedDate)`;
- `CX.tenantProfile`;
- `CX.data.currentProjectId`;
- `CX.data.currentPeriodId`;
- helpers existentes de proyecto/programa y periodos.

## 2. Cambio 1 — proyecto y periodo por separado

### Archivo principal

`app/core/router.js`

### Problema reproducible

En Shopper y Cliente el rail usa el nombre del registro de periodo, por lo que muestra `Cinépolis Julio 2026` como proyecto y vuelve a mostrar `JUL 2026` como periodo. Además, no hay selector de proyectos activos/autorizados.

### Implementación requerida

1. El rótulo de proyecto debe usar la identidad de programa/proyecto base, no `period.name` completo.
2. El rótulo de periodo debe usar únicamente la etiqueta del periodo activo.
3. Shopper debe recibir como opciones solo proyectos activos y elegibles para su perfil/scope.
4. Cliente debe recibir únicamente proyectos asignados al cliente.
5. Al cambiar proyecto:
   - actualizar `currentProjectId` mediante el contrato existente;
   - recalcular los periodos del proyecto;
   - elegir el periodo vigente o el último autorizado;
   - emitir el evento contractual existente;
   - rerenderizar sin recargar la aplicación.
6. Al cambiar periodo, no modificar la identidad del proyecto.
7. Con un solo proyecto puede mostrarse selector de una opción o rótulo no editable, pero nunca mezclar proyecto y periodo.
8. No introducir literales `Cinépolis`, `Julio 2026`, `JUL 2026`, GT o HN.

### Aceptación

- Proyecto visible: `Cinépolis`.
- Periodo visible: `JUL 2026`.
- Cambiar periodo altera datos y no cambia el proyecto.
- Otro tenant/proyecto se alimenta de su configuración sin cambios de código.

## 3. Cambio 2 — ficha y envío de postulación

### Archivo principal

`app/modules/visita-detalle.js`

### Problemas reproducibles

- se imprime `v.disponibleDesde` aunque sea `null`;
- se compara `v.franja` con textos locales y no con el contrato canónico;
- una visita WKND aceptó una fecha entre semana;
- no existe control de Q1/Q2;
- el envío puede mostrar éxito aunque la elegibilidad real falle.

### Implementación requerida

1. Al abrir la ficha, consultar `data.visitFacets(v)`.
2. Si `available` no es verdadero:
   - no habilitar `Postularme`;
   - mostrar un mensaje funcional según `availabilityState`;
   - nunca mostrar `null`, `undefined` ni tokens técnicos al shopper.
3. La fecha visible debe tomarse de `v.disponibleDesde` únicamente cuando sea ISO válida.
4. Mostrar `measurementWindowLabel` y, cuando corresponda, el rango de medición de forma comprensible.
5. En cada cambio de fecha y nuevamente al enviar, ejecutar:

```js
const result = data.postulationEligibility(v, proposedDate);
```

6. El resultado del contrato es vinculante:
   - `result.ok === true`: puede continuar;
   - `result.ok === false`: bloquear envío y presentar motivos legibles.
7. No volver a codificar WK/WKND, Q1/Q2, fecha mínima o dependencia previa dentro del módulo como una segunda verdad.
8. Mapeo visual mínimo de motivos:
   - `visit_already_assigned` → visita ya asignada;
   - `blocked_previous_measurement_window` → pendiente de completar/validar la ventana anterior;
   - `blocked_missing_availability` → aún no habilitada por el proyecto;
   - `available_from_missing_or_invalid` → fecha de disponibilidad pendiente de validación;
   - `before_available_from` → fecha anterior a la habilitación;
   - `before_measurement_window` / `after_measurement_window` → fecha fuera del periodo de medición;
   - `requires_weekend` → requiere sábado o domingo;
   - `requires_weekday` → requiere lunes a viernes;
   - `proposed_date_invalid` → seleccionar fecha válida.
9. El atributo HTML `min` puede apoyar la experiencia, pero no sustituye la validación contractual al enviar.
10. No emitir toast de éxito ni crear postulación cuando `ok:false`.
11. Mantener read-only/source-safe mientras los writes permanezcan bloqueados; no agregar persistencia local falsa.

### Aceptación

- Julio: 4 tarjetas disponibles, no 5.
- MC. Santa Clara Q2 no aparece como oferta publicable.
- Plaza Américas Q2 rechaza fecha anterior al 25 de julio y un día entre semana; acepta una fecha de fin de semana dentro de Q2.
- Carchá/Altara/Juticalpa WK rechazan sábado/domingo.
- Cualquier fecha fuera de Q2 se rechaza.
- No aparece `null`.

## 4. Cambio 3 — login configurable por tenant

### Archivo principal

`app/app.js`

### Contrato vigente

Usar `CX.tenantProfile` para decidir:

- roles visibles;
- bloque de accesos de validación;
- autorregistro shopper;
- Portal del Cliente;
- países/banderas.

### Implementación requerida

1. Generar/filtrar los accesos desde `visibleLoginRoles`, sin hardcodear el tenant.
2. En DEV R21 mostrar Admin, Cliente, Shopper, Operativo, Coordinador y Aliado.
3. Cambiar el rótulo técnico a `Accesos de validación`.
4. Cuando `showRoleTestArea === false`, ocultar por completo el bloque técnico y su separador.
5. En producción TyA, el perfil inicial previsto es Admin, Operativo y Shopper, pero debe poder modificarse desde la configuración del tenant.
6. Las banderas se derivan de países del tenant o proyectos activos, excluyendo proyectos inactivos; no mostrar catálogo global.
7. `clientPortalVisible:false` debe ocultar Cliente sin eliminar su implementación.
8. `allowShopperRegistration:false` debe ocultar el enlace de registro.
9. No mostrar al usuario final `Probar acceso por rol (matriz de permisos)`.
10. No modificar Auth ni claims en este cambio visual.

### Aceptación

- DEV permite probar todos los roles.
- Producción puede ocultar roles sin tocar código.
- Agregar país/proyecto activo cambia las banderas según configuración.
- No hay doble nombre del tenant ni copy técnico en producción.

## 5. Cambio 4 — Academia del Cliente

### Archivos/rutas a revisar

- `app/core/router.js`;
- `app/modules/cliente-extra.js`;
- `app/modules/academia.js`;
- configuración de permisos/menú del rol Cliente.

### Regla

`Capacitación por brechas` y `Academia` son objetos distintos.

### Implementación requerida

1. Mantener `cli_capacitacion` como recomendaciones derivadas de brechas/resultados.
2. Exponer una ruta real de Academia para Cliente cuando `CX.tenantProfile`/permisos la habiliten.
3. La Academia debe consumir cursos, progreso, evaluaciones y manuales según el contrato existente, no duplicar contenido dentro de Cliente.
4. Si no hay contenido autorizado, mostrar estado vacío honesto, no ocultar silenciosamente la capacidad.
5. Respetar alcance por tenant, proyecto y rol.

### Aceptación

- Cliente ve `Academia` y `Capacitación` como opciones distintas cuando ambas están habilitadas.
- Deshabilitar Academia para Cliente la oculta sin afectar Capacitación.

## 6. Reglas transversales

- Conservar exactamente la interfaz pública de `CX.data`.
- No mover lógica backend a módulos UI.
- No introducir llamadas directas a Google Sheets, Firebase, Make o Gemini desde estos archivos.
- No agregar localStorage como fuente operativa.
- No hardcodear Cinépolis, TyA, países, quincenas ni roles.
- Mantener UTF-8 sin BOM.
- No exponer PII ni tokens técnicos.
- Preservar responsive y accesibilidad de selects, mensajes y botones.
- No rediseñar módulos no relacionados.

## 7. Clasificación

### Reusable CXOrbia

- selectores proyecto/periodo por scope;
- configuración de login y banderas;
- contrato único de elegibilidad;
- motivos de rechazo funcionales;
- Academia Cliente separada de capacitación.

### Exclusivo tenant TyA

- valores configurados: países GT/HN;
- roles previstos para producción TyA;
- proyecto activo Cinépolis;
- `P1Q` recibido desde la HR y normalizado por adapter.

### Claude/prototipo

Los cuatro cambios de UI localizados indicados arriba.

### Academia

Actualizar materiales sobre disponibilidad, ventanas, franjas, dependencias previas y configuración de acceso por tenant.

### Sin impacto Claude

Motor canónico, contratos, adapter, gates, evidencia source-safe y persistencia futura.

## 8. Entrega esperada de Claude

Entregar una candidata incremental que modifique únicamente los archivos necesarios para estos cuatro hallazgos, con lista exacta de archivos y prueba funcional. No rehacer la plataforma ni incluir backend.
