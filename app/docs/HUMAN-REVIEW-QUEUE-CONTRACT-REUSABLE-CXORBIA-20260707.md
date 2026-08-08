# Human review queue contract reusable - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para cola de revision humana CXOrbia.

Archivo creado:

- `tools/contracts/cxorbia-human-review-queue-contract.mjs`

## Objetivo

Estandarizar como se registran, muestran y resuelven casos que no deben procesarse automaticamente.

Esto evita sobrescrituras silenciosas, deduplicaciones visuales incorrectas y activaciones reales sin revision.

## Casos que deben entrar a revision humana

- conflicto de sincronizacion;
- falta de llave estable;
- diferencia de datos entre fuentes;
- riesgo de dato sensible;
- revision de certificacion;
- revision de pago;
- anomalia de importacion;
- fallo de proveedor;
- revision de contenido Academia;
- brecha de configuracion de proyecto.

## Entidades soportadas

- asignacion;
- visita;
- shopper;
- certificacion;
- pago;
- registro de importacion;
- evento de integracion;
- contenido Academia;
- configuracion de proyecto.

## Estados permitidos

- `open`
- `assigned`
- `in_review`
- `resolved`
- `rejected`
- `escalated`
- `archived`

## Roles revisores

- superadmin;
- admin;
- ops;
- finance;
- academy_admin;
- technical_reviewer.

## Campos requeridos

- `reviewId`
- `tenantId`
- `projectId`
- `entityType`
- `entityRef`
- `issueType`
- `severity`
- `status`
- `assignedRole`
- `evidenceRefs`
- `source`
- `createdAt`

## Regla clave

Todo item debe tener llave estable de revision:

`tenantId + projectId + entityType + entityRef + issueType`

Si falta una parte de esa llave, el item no debe resolverse automaticamente.

## Clasificacion del bloque

### Reusable CXOrbia

Este contrato es reusable para cualquier cliente.

Debe aplicarse a conflictos de sync, importaciones, certificaciones, pagos, integraciones, datos sensibles, contenido Academia y configuracion.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Claude debe recibir este contrato en el proximo paquete.

Debe considerar UI reusable para:

- bandeja de revision;
- badges por severidad;
- filtros por estado, rol, entidad y proyecto;
- evidencia asociada;
- acciones resolver, rechazar, escalar y archivar;
- copy honesto: pendiente de revision, en revision, resuelto, escalado.

### Academia

Academia debe explicar:

- que significa revision humana;
- por que ciertos casos no se automatizan;
- como un admin resuelve conflictos;
- como se revisa contenido generado o actualizado;
- que hacer cuando hay brecha de configuracion.

### Sin impacto Claude

No cambia UI directamente, pero genera pendiente para paquete Claude porque define una bandeja/estado reusable de producto.

## Estado seguro

La herramienta usa fixtures sinteticos.

No hace deploy, no llama proveedores, no escribe base, no importa datos y no toca produccion.
