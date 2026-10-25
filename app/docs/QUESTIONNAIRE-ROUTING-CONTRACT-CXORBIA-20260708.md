# Questionnaire routing contract - CXOrbia Phase A

Fecha: 2026-07-08

## Bloque completado

Se creo contrato preview-only para ruteo configurable de cuestionarios por tenant, proyecto y visita.

Archivo creado:

- `tools/contracts/cxorbia-questionnaire-routing-contract.mjs`

## Objetivo Phase A

Phase A requiere que el cuestionario sea configurable por proyecto/visita y no quede hardcodeado a un unico flujo.

El contrato permite validar, sin backend real, rutas como:

- formulario CXOrbia;
- TyAOnline;
- plataforma externa;
- referencia general opaca;
- referencia HR por visita.

## Que valida

El contrato valida:

- `tenantId`;
- `projectId`;
- `visitId` cuando aplica;
- `action` soportada;
- `actorRole` permitido;
- `auditRef` obligatorio;
- `reason` para cambios solicitados;
- `route.type` soportado;
- `routeRef` opaco sin URL cruda;
- bloqueo de `execute: true`.

## Acciones soportadas

- `preview_project_default`;
- `preview_visit_route`;
- `request_project_default_change`;
- `request_visit_override`;
- `request_route_pause`;
- `request_route_restore`;
- `export_route_report`.

## Roles permitidos

- `superadmin`;
- `admin`;
- `ops`;
- `academy_admin`;
- `technical_reviewer`.

## Estados resultantes

- `preview_ready`;
- `review_required`;
- `report_ready`;
- `blocked_gate`.

## Reglas de seguridad

El contrato no ejecuta:

- deploy;
- produccion;
- proveedor externo;
- escritura de base;
- importacion;
- uso de URL cruda en repo.

## Por que importa

Evita que Cinépolis/TyAOnline quede como unica arquitectura. Para clientes futuros, la fuente del cuestionario puede ser CXOrbia, un link general, un link por visita, HR, una plataforma externa o un formulario propio.

## Pendientes Claude/prototipo

Claude debe reflejar este patron en UI sin conectar proveedor real:

- configuracion de cuestionario por proyecto;
- override por visita;
- badge de fuente del cuestionario;
- estado `pendiente gate` o `pendiente revision`;
- razon obligatoria para cambios;
- historial/auditoria visible para admin;
- texto honesto: no decir `cuestionario enviado` si solo esta preparado o completado.

## Academia

Academia debe explicar:

- diferencia entre ruta de cuestionario, cuestionario completado y submitido;
- quien puede cambiar la ruta;
- cuando una visita usa default de proyecto;
- cuando una visita usa override;
- que una referencia HR no significa sync real hasta gate;
- errores frecuentes: URL cruda, ruta vencida, ruta equivocada, cambio sin razon.

## Clasificacion

### Reusable CXOrbia

Si. Es patron reusable para cualquier tenant/proyecto.

### Exclusivo cliente

No. TyAOnline queda como opcion, no como arquitectura unica.

### Claude/prototipo

Si. Requiere UI de configuracion, badges y copy honesto.

### Academia

Si. Afecta manuales, cursos, rutas por rol y glosario operativo.

### Sin impacto Claude

No aplica.

## Estado seguro

Sin runtime app, sin deploy, sin produccion, sin proveedores reales, sin base real, sin imports reales y sin datos sensibles.
