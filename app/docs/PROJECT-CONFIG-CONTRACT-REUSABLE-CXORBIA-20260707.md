# Project config contract reusable - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable de configuracion tenant/proyecto para futuros clientes CXOrbia.

Archivo creado:

- `tools/contracts/cxorbia-project-config-contract.mjs`

## Objetivo

Preparar el backend y el prototipo para que cada cliente/proyecto pueda configurarse sin hardcodear reglas TyA, Cinépolis, HR, pagos o certificaciones como si fueran producto base.

## Alcance del contrato

Cada proyecto debe declarar:

- tenant y proyecto;
- pais y moneda;
- fuente externa o plataforma;
- modo de cuestionario;
- evidencias;
- certificacion y ruta Academia;
- reglas de agendamiento, reprogramacion y cancelacion;
- pagos;
- integraciones;
- impacto Academia por rol.

## Modos soportados como patron reusable

### Fuente

- `hr_sheet`
- `google_sheet`
- `csv_import`
- `api_external`
- `manual_platform`
- `mixed`

### Cuestionario

- `cxorbia`
- `external_general_link`
- `external_visit_link`
- `third_party_platform`
- `disabled`

### Gates

- `off`
- `preview`
- `ready_for_gate`
- `active`

## Reglas importantes

- Si pagos estan activos, la moneda de pagos debe coincidir con la moneda del proyecto.
- Si certificacion es obligatoria, debe existir ruta Academia.
- Si agendamiento esta activo, debe existir ruleset.
- Todo proveedor se expresa como gate, no como llamada directa desde UI.
- Las fuentes externas se referencian por ref opaco o enmascarado, no con secretos en repo.

## Clasificacion del bloque

### Reusable CXOrbia

Este contrato es reusable para futuros clientes.

Debe quedar como base de configuracion por tenant/proyecto.

### Exclusivo cliente

No contiene reglas exclusivas TyA.

No hardcodea Cinépolis, HR TyA, Q1/Q2, liquidaciones TyA ni certificaciones especificas.

### Claude/prototipo

Claude debe considerar este contrato para:

- vistas o badges de configuracion por tenant/proyecto;
- copy honesto para gates por integracion;
- evitar hardcodes de cliente en modulos reutilizables;
- preparar pantallas para mostrar fuente, cuestionario, evidencias, certificacion, pagos e integraciones como configurables.

### Academia

Academia queda vinculada al contrato por:

- `certification.academyRouteId`;
- `academy.manualsRequired`;
- `academy.roleRoutes`;
- `academy.notificationsLinked`.

Cualquier proyecto con certificacion obligatoria debe tener ruta Academia definida.

### Sin impacto Claude

No hay cambio UI directo en este bloque.

Pero si genera pendiente para paquete Claude porque define configuracion reusable del producto.

## Estado seguro

La herramienta usa configuraciones sinteticas.

No hace deploy, no llama proveedores, no escribe base, no importa datos y no toca produccion.
