# VALIDACIÓN VISUAL V159 — NO APROBADO

Fecha: 2026-07-18  
Proyecto: CXOrbia TyA  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama: `docs-tya-v6-v71-audit`  
PR: `#7` draft/open/no merge

## 1. Decisión

Paula concluyó y autorizó registrar:

`NO_APROBADO / HOLD_VISUAL_SEMANTIC_P0_PROVEN`

V159 permanece empalmada y desplegada en Hosting DEV, pero no se congela como `ACTIVE_BASELINE` y no avanza al Corte 1 hasta corregir y volver a validar el mismo build corregido.

No se reabre auditoría estructural ni empalme. Se abre una corrección focalizada de semántica de datos, configuración de tenant/login y exposición por rol.

## 2. Evidencia visual reproducible

### 2.1 Estados operativos e histórico

- Mayo y junio muestran conteos incorrectos de `cuestionario pendiente` y `sin submitir` respecto de la HR histórica TyA.
- Los KPI superiores y el tablero inferior del Dashboard no coinciden para el mismo periodo y la misma fuente.
- El comparativo trimestral no expone mayo/junio aunque existen periodos históricos.
- Falta quincena/periodo de medición en tablas operativas para identificar correctamente cada visita.

### 2.2 Liquidaciones y pagos

- Liquidaciones hereda estados `Pend. cuestionario` desde una clasificación operativa incorrecta.
- Junio no llega de forma consistente a `pendiente de pago` aunque todas las visitas están ejecutadas y lo pendiente es el control financiero.
- Hasta mayo debe reflejarse pagado únicamente donde la fuente de movimientos lo confirme.

### 2.3 Julio, asignación y portal shopper

- Julio aparece con 44 asignadas y 0 sin asignar, aunque la operación real conserva visitas sin shopper.
- El portal shopper muestra 0 visitas disponibles cuando todavía existen visitas elegibles pendientes de asignación.
- `Hojas de Ruta` muestra origen/plataforma y sincronizado de forma que no demuestra lectura live de HR; el badge `Source-safe (preview)` debe conservarse honesto.

### 2.4 Proyecto, periodo y roles

- Admin separa proyecto y periodo; Shopper y Cliente muestran `Cinépolis Julio 2026` como una sola unidad fija.
- Shopper y Cliente requieren selector de proyectos activos autorizados y selector independiente de periodo, limitado por rol/scope.
- Los proyectos deben poder activarse/inactivarse según vigencia y frecuencia.
- El cliente no ve Academia aunque el catálogo admin contiene cursos con rol Cliente.

### 2.5 Academia y manuales

- Los manuales se presentan como secuencia de curso breve, no como documento/instructivo CXOrbia profundo, descargable/consultable y accionable.
- El contenido no cumple todavía profundidad operativa, pasos, decisiones, errores, validaciones y alcance por rol.

## 3. Causa raíz técnica localizada

La inspección de V159 muestra una causa de arquitectura de estado, no un único texto visual:

1. `app/core/data.js` contiene `visitFacets()` y `visitBucketFns` como intento de fuente canónica.
2. `app/modules/dashboard.js` usa esos buckets en los KPI superiores, pero conserva otra lógica duplicada en `phaseFlow()` basada directamente en `v.estado`.
3. El tablero inferior del mismo módulo vuelve a usar filtros directos (`estado==='realizada'`, `estado==='cuestionario'`, `estado==='asignada'`, etc.).
4. `app/core/liquidacion.js` deriva la liquidación principalmente desde `v.estado` y `v.submit`; cuando el mapping HR produce un estado incorrecto, Finanzas hereda el error.
5. La fuente source-safe actual no demuestra HR runtime live y el mapping de asignación/cuestionario/submitido no está validado campo por campo contra la HR vigente.

Resultado: existen varias interpretaciones del mismo ciclo de visita dentro del runtime. Los gates anteriores comprobaron estructura, conteos generales y cambio de periodo, pero no verificaron igualdad semántica entre KPI, fases, listados y liquidaciones para cada visita.

## 4. Responsabilidad por carril

### ChatGPT/Codex/backend — responsabilidad principal

- Definir un único motor canónico de estado de visita.
- Mapear correctamente HR a campos explícitos: shopper asignado, fecha programada, realizada, cuestionario realizado, submitido/revisión, liquidación y pago.
- Separar `assignmentState`, `scheduleState`, `executionState`, `questionnaireState`, `submissionState`, `liquidationState` y `paymentState`.
- Hacer que Dashboard, Visitas, Shopper y Finanzas consuman el mismo resultado canónico.
- Implementar contrato de configuración de tenant, países, proyectos activos, roles visibles en login y scopes.
- Crear gates por visita y reconciliación cruzada entre KPI, fases, listados y Finanzas.

### Claude/prototipo — responsabilidad focalizada

- Renderizar el contrato canónico sin volver a calcular lógica de negocio dentro de módulos.
- Mostrar selectores independientes de proyecto y periodo para Shopper/Cliente según scope.
- Hacer configurable la visibilidad de opciones del login.
- Exponer Academia al Cliente cuando su rol tenga contenido y permiso.
- Convertir manuales en documentos/instructivos CXOrbia profundos; cursos y manuales deben seguir siendo objetos distintos.

No se enviará a Claude una lista general hasta localizar archivo/módulo y contrato exacto. Las correcciones de lógica y datos no se delegan a Claude.

## 5. Tenant, países, banderas y login — estado actual

- El tenant actual no tiene todavía una ficha única de onboarding productiva.
- En el prototipo, la configuración está fragmentada entre `Configuración`, `Identidad de Marca`, `Proyectos`, `Usuarios & Permisos` e `Integraciones`.
- `CX.BRAND.id` se genera/persiste localmente y no es todavía un registro backend productivo.
- Los países del login se toman de `CX.BRAND.countries`; si está vacío, se derivan de los países de proyectos.
- Las opciones principales del login (`admin`, `cliente`, `shopper`) y las opciones de prueba (`ops`, `coordinador`, `aliado`) están codificadas en `app.js`; la matriz de permisos actual controla acceso posterior, no qué botones se ven en login.

Contrato reusable requerido:

```text
tenant.login.visibleRoles[]
tenant.login.allowSelfRegistration
tenant.login.showCountryFlags
tenant.login.countrySource = tenant | activeProjects
tenant.enabledCountryIds[]
tenant.enabledProjectIds[]
tenant.defaultProjectId
tenant.branding
role.scope.projectIds[]
role.scope.countryIds[]
role.modulePermissions[]
role.actionPermissions[]
```

Para TyA, la configuración esperada del login es administrable y puede quedar, por ejemplo, con solo `admin`, `ops` y `shopper` visibles, sin exponer Cliente u otros perfiles si Paula no los activa.

## 6. Corrección metodológica para futuras candidatas

La evidencia visual actual constituye P0 reproducible porque impide Phase A: ciclo shopper sin visitas disponibles, estados históricos inconsistentes y Finanzas contaminada.

Por autorización expresa de Paula, se incorpora un gate previo al empalme para candidatas que toquen módulos Phase A críticos:

```text
EXECUTION_LANE_READY
→ AUDITORÍA DELTA ESTRUCTURAL
→ COMPOSITE TEMPORAL candidata + backend/overlays vigentes
→ GATES SEMÁNTICOS CON SNAPSHOT REAL/SOURCE-SAFE
→ VISUALIZACIÓN PRE-EMPALME DEL COMPOSITE EXACTO
→ APROBACIÓN/HOLD DE PAULA
→ APPLY_DELTA_DIRECTLY DEL MISMO HASH APROBADO
→ COMMIT/PUSH ATÓMICO
→ GATES POST-EMPALME DE IDENTIDAD
→ FREEZE
```

No se volverá a invertir una semana en empalmar una candidata que todavía no demostró semántica visual. El composite temporal no crea rama/PR nuevo, no modifica `main` y no transporta el ZIP archivo por archivo.

## 7. Siguiente bloque exacto

`CORTE 0B — MOTOR CANÓNICO DE ESTADOS + CONFIGURACIÓN TENANT/LOGIN`

1. Congelar la evidencia visual NO APROBADA.
2. Verificar mapping HR vigente por campos y periodos mayo/junio/julio.
3. Crear tabla de verdad por visita y estado.
4. Eliminar derivaciones duplicadas del runtime mediante adapter/facets canónicos.
5. Corregir liquidaciones para consumir `questionnaireState`, `submissionState`, `liquidationState` y `paymentState`.
6. Definir y conectar contrato de tenant/login/roles/países/proyectos activos.
7. Crear gates de reconciliación cruzada.
8. Desplegar Hosting DEV corregido bajo autorización vigente de validación.
9. Repetir visual Admin, Shopper, Cliente y Academia.

## 8. Clasificación

- **Reusable CXOrbia:** motor canónico de estados, contrato tenant/login/roles, proyectos activos, gate composite visual pre-empalme y reconciliación cruzada.
- **Exclusivo TyA/Cinépolis:** reglas y columnas HR, mayo/junio/julio, 44 visitas, GT/HN y corte financiero histórico.
- **Claude/prototipo:** selectores y render por rol, login configurable, Academia Cliente y formato visual de manuales.
- **Academia:** manuales documentales profundos, rutas por rol, estados canónicos y explicación tenant/proyecto/periodo.
- **Sin impacto Claude:** mappings, adapters, gates, contratos y validadores internos.

## 9. Estado seguro

- PR #7 draft/open/no merge.
- V159 no es `ACTIVE_BASELINE`.
- Hosting DEV se conserva solo como evidencia NO APROBADA.
- Sin producción, import real, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
- Sin conexión a base vieja y sin datos sensibles crudos nuevos.
