# Academia project rules sync contract reusable - CXOrbia

Fecha: 2026-07-07

## Bloque completado

Se agrego contrato reusable para sincronizar reglas de proyecto con contenido Academia.

Archivo creado:

- `tools/contracts/cxorbia-academia-project-rules-sync-contract.mjs`

## Objetivo

Evitar que Academia quede como contenido estatico o superficial cuando cambian reglas operativas del proyecto.

Cada regla importante de proyecto debe mapearse a contenido de aprendizaje, manual, checklist, FAQ, glosario o notificacion cuando afecte a un rol.

## Reglas que deben mapearse a Academia

- fuente de datos;
- cuestionario;
- evidencias;
- certificacion;
- agendamiento;
- pagos;
- gates de integracion;
- revision humana.

## Tipos de contenido soportados

- manual;
- curso;
- leccion;
- checklist;
- FAQ;
- glosario;
- notificacion.

## Roles considerados

- superadmin;
- admin;
- ops;
- shopper;
- cliente;
- academy_admin.

## Estados permitidos

- `missing`: falta contenido.
- `draft`: borrador.
- `human_review_required`: requiere revision humana.
- `approved`: aprobado.
- `published`: publicado.
- `archived`: archivado.

## Reglas clave

- Si una certificacion es obligatoria, debe existir contenido para shopper.
- Si una regla esta publicada, debe poder generar notificacion si afecta a roles.
- Si falta contenido, no se debe considerar Academia cubierta.
- Si el contenido requiere revision humana, no debe publicarse automaticamente.

## Clasificacion del bloque

### Reusable CXOrbia

Este contrato es reusable para todos los clientes.

Conecta configuracion de proyecto, gates, revision humana, certificacion, pagos, evidencias y cuestionario con Academia.

### Exclusivo cliente

No contiene reglas exclusivas del cliente actual.

### Claude/prototipo

Claude debe recibir este contrato en el proximo paquete.

Debe considerar UI o estructura para:

- relacionar reglas de proyecto con cursos/manuales/checklists;
- mostrar contenido faltante;
- marcar contenido en revision humana;
- notificar cambios por rol;
- evitar que Academia quede desconectada de configuracion por tenant/proyecto.

### Academia

Impacto directo en Academia.

Este bloque convierte Academia en parte transversal del producto y no solo en texto informativo.

### Sin impacto Claude

No cambia UI directamente, pero genera pendiente claro para Claude por estructura Academia/prototipo.

## Estado seguro

La herramienta usa fixtures sinteticos.

No hace deploy, no llama proveedores, no escribe base, no importa datos y no toca produccion.
