# RESUMEN PARA CLAUDE — ADDENDUM V159 VISUAL NO APROBADO

Fecha: 2026-07-18

## Decisión

V159 no fue aprobada visualmente. No solicitar nueva candidata ni rediseño general. Backend corregirá primero la semántica de estados y el contrato configurable.

## No corresponde a Claude

- Mapping HR mayo/junio/julio.
- Reglas de asignación, agenda, realizada, cuestionario, submitido, liquidación y pago.
- Motor canónico y reconciliación de conteos.
- Fuente real/source-safe, adapters, contratos, gates o backend.

## Ajustes frontend focalizados después del contrato backend

1. `app/modules/dashboard.js`
   - Consumir exclusivamente facets/buckets canónicos.
   - Eliminar cálculos directos duplicados por `v.estado` en fases y listados.
   - Mostrar quincena/periodo de medición en tablas operativas.
   - Comparativo trimestral debe consumir histórico real del adapter.

2. `app/modules/finanzas.js` y vistas relacionadas
   - Consumir estados explícitos `questionnaireState`, `submissionState`, `liquidationState`, `paymentState`.
   - Nunca inferir pago desde `liquidada`.

3. `app/modules/visitas.js`, portal Shopper y portal Cliente
   - Proyecto y periodo como selectores separados.
   - Listar solo proyectos activos y autorizados por scope.
   - Shopper ve solo sus periodos históricos y visitas elegibles.

4. `app.js` / login
   - Renderizar roles desde `tenant.login.visibleRoles`, no desde botones hardcodeados.
   - Renderizar banderas desde configuración del tenant/proyectos activos.
   - TyA debe poder mostrar solo Admin, Operativo y Shopper si así se configura.

5. `app/modules/academia.js` y manuales
   - Exponer Academia al Cliente cuando exista contenido/permiso.
   - Separar objetos Manual y Curso.
   - Manuales como documentos/instructivos CXOrbia profundos, consultables/descargables, no lecciones breves disfrazadas de manual.

## Validación esperada

Claude no debe declarar resuelto hasta que:

- cada KPI coincida con fases y listados;
- mayo/junio/julio coincidan con la tabla de verdad del backend;
- shopper vea las visitas disponibles correctas;
- cliente vea Academia cuando corresponda;
- login muestre únicamente roles configurados;
- proyecto y periodo estén separados en todos los roles.

## Archivos protegidos

Claude no toca `backend/`, `tools/`, contratos, gates, workflows, providers, secretos, datos reales ni integraciones live.
