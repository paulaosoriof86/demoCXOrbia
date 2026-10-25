# RESUMEN PARA CLAUDE — CORTE 0B R20 HISTÓRICO

Fecha: 2026-07-18  
Estado: backend/adapter implementado; gates y nueva visualización pendientes.

## 1. No reinterpretar la lógica de negocio

Claude no debe volver a calcular estados mediante `v.estado`, textos visibles o filtros locales. Backend entrega una verdad canónica por visita y por periodo.

Campos/funciones disponibles en el composite source-safe:

- `canonicalFacets.assigned`
- `canonicalFacets.scheduled`
- `canonicalFacets.realized`
- `canonicalFacets.questionnaire`
- `canonicalFacets.submitted`
- `canonicalFacets.liquidationCandidate`
- `canonicalFacets.liquidationConfirmed`
- `canonicalFacets.paymentConfirmed`
- `assignmentState`
- `schedulingState`
- `executionState`
- `questionnaireState`
- `submissionState`
- `liquidationState`
- `paymentState`
- `operationalState`
- `reviewRequired`
- `reviewReasons`
- `CX.data.visitFacets(v)`
- `CX.data.visitBucketFns`
- `CX.data.periodKpis(periodRef)`
- `CX.data.recentPeriodKpis(limit)`

La misma regla se aplica a todos los periodos HR detectados. Mayo, junio y julio son pruebas de regresión, no reglas especiales.

## 2. Regla de representación

- Sin shopper: sin asignar/disponible según elegibilidad.
- Shopper sin agenda: pendiente de programar.
- Agendada no realizada: pendiente de realizar.
- Realizada sin cuestionario: pendiente de cuestionario.
- Cuestionario sin submitido: pendiente de submitido.
- Submitido: completo operativamente y candidato a liquidación.
- Submitido sin cruce financiero: pendiente de pago/cruce financiero.
- No mostrar liquidada/pagada sin evidencia financiera.
- Contradicciones de fuente: revisión requerida, nunca sobrescritura silenciosa.

## 3. Archivos frontend que Claude debe auditar cuando se entregue tarea focalizada

- `app/modules/dashboard.js`
- `app/modules/visitas.js`
- `app/modules/misvisitas.js`
- `app/modules/beneficios.js`
- `app/modules/finanzas.js`
- `app/app.js`
- `app/modules/academia.js`
- módulos Cliente que definen menú y Academia.

No realizar todavía cambios libres ni rediseños. La tarea frontend solo se activa después de que builder/gates R20 identifiquen qué consumidores siguen fallando en el composite.

## 4. Requisitos reutilizables del producto

### Proyecto y periodo

- Nunca concatenarlos como una sola entidad.
- Proyecto se selecciona entre proyectos activos permitidos por scope.
- Periodo se selecciona dentro del proyecto.
- Un proyecto puede activarse/inactivarse sin perder histórico.
- Shopper y Cliente solo ven proyectos/períodos autorizados.

### Login configurable por tenant

El tenant TyA debe poder mostrar únicamente:

- Admin;
- Operativo;
- Shopper.

El Cliente puede permanecer oculto hasta habilitación. Coordinador y aliado no deben aparecer por defecto.

Ocultar un botón no es seguridad: Auth/RBAC sigue siendo obligatorio en su corte.

### Países y banderas

- Mostrar solo países configurados para el tenant o derivados de proyectos activos.
- No mostrar catálogo global.
- Un proyecto inactivo no añade bandera.
- Cambios deben persistir cuando exista backend real.

### Histórico

- Comparativos usan periodos reales de la fuente.
- No inventar meses previos mediante porcentajes.
- Un dato sin fuente permanece `—`/pendiente de fuente.

## 5. Pendientes frontend confirmados

1. Selectores separados proyecto/periodo en Shopper y Cliente.
2. Menú/selector de proyectos activos según scope.
3. Login generado desde perfil del tenant, no botones hardcodeados.
4. Cliente ve Academia únicamente si portal, permiso y contenido están habilitados.
5. Manual debe ser objeto/documento distinto de Curso.
6. Manuales profundos, versionados, consultables/imprimibles y vinculados al rol/proyecto.
7. Tablas operativas deben mostrar quincena/periodo de medición.
8. Los módulos deben consumir estados canónicos y eliminar filtros duplicados.

## 6. Lo que Claude no debe tocar

- `tools/hr-source/**`
- `tools/qa/**`
- `tools/release/**`
- `backend/contracts/**`
- `backend/config/**` salvo instrucción explícita
- workflows
- Firebase, Auth, Firestore, Storage, Make, Gemini
- datos reales o sensibles
- lógica Q1/Q2 o financiera para reinterpretarla.

## 7. Validación esperada de una futura corrección Claude

- mismo hash/base aprobado;
- Dashboard, fases y listados coinciden;
- Liquidaciones no confunde submitido con pagado;
- visitas disponibles coinciden con `unassigned` elegible;
- proyecto/periodo separados por rol;
- login muestra roles del tenant;
- Cliente/Academia respeta configuración;
- sin promesas falsas de sync/proveedores;
- Academia y manuales actualizados.

## 8. Estado seguro

Documento de sincronización. No autoriza cambio frontend, deploy, producción, proveedores, writes ni pagos.
