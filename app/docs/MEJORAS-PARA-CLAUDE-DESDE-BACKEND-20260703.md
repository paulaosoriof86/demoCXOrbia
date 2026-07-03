# Mejoras para Claude desde backend

Fecha: 2026-07-03

Este documento separa las mejoras detectadas o implementadas desde backend que Claude debe reflejar en el prototipo visual sin revertir avances.

## HR Source

- Mantener el modulo HR Source como configuracion visual por proyecto.
- No persistir URL completa de Google Sheets o Excel en localStorage/sessionStorage.
- Mostrar solo referencia enmascarada o `sourceRef` opaco entregado por backend.
- Renderizar respuesta backend de `test`, `preview` y `sync-request`.
- Mostrar tabs/conteos de HR viva cuando backend devuelva `periodsDetected` y `counts.liveTabs`.
- No asumir que todos los periodos vienen de datos demo/localStorage.

## Estados honestos

- La UI debe diferenciar claramente:
  - preview disponible.
  - warning.
  - bloqueado por seguridad.
  - pendiente backend.
  - importacion no autorizada.
- Nunca mostrar una sincronizacion como ejecutada cuando backend responda `canImport=false` o `status=blocked`.

## Importacion TyA

- El frontend puede mostrar contrato/plan de importacion como vista informativa.
- No debe habilitar botones de escritura real hasta que backend entregue autorizacion explicita.
- Si hay blockers, debe mostrar mensaje claro y no permitir accion destructiva.

## Matriz de gates

- Agregar una vista o estado visual que separe DEV preview, DEV import, staging y produccion.
- Mostrar gates cumplidos, pendientes y bloqueados sin permitir saltos de fase.
- Mostrar que produccion requiere base nueva limpia, permisos validados, autorizacion y smoke multi-tenant.
- El usuario no debe interpretar un preview como una carga real.

## Seguridad y SaaS

- Mantener enfoque multi-tenant por `tenantId` y `projectId`.
- No exponer rutas internas, URLs completas, credenciales ni datos crudos.
- Todo flujo de importacion debe ser por solicitud backend y con rollback/documentacion.

## Aplicacion en el proximo prototipo

Claude debe incorporar estas reglas como mejoras del prototipo visual y no como parches locales temporales. Si entrega nueva version, se auditara como RC incremental y se empalmara sobre backend sin reiniciar trabajo.
