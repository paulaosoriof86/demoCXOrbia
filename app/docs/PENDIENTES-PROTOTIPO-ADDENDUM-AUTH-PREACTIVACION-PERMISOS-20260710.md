# PENDIENTES-PROTOTIPO addendum — Auth preactivación por permisos

Fecha: 2026-07-10

## P0 antes de Auth real

### Scope visible y honesto

- `Admin del Proyecto` debe indicar país/proyecto asignado.
- Coordinador no debe verse como tenant admin global.
- Aliado/franquiciado no debe heredar privilegios de dueño de tenant.
- Custom sin configuración explícita debe quedar fail-closed.

### Ruta versus acción

- Ver el módulo no autoriza todas sus acciones.
- Botones protegidos deben ocultarse o quedar disabled con motivo.
- No simular ejecución cuando backend, rol, scope o provider gate la bloquean.

### Cliente

- Separar Admin de marca y Visor de marca.
- Ambos limitados a proyectos/reportes aprobados.
- Sin rutas administrativas internas.

### Shopper

- Perfil, visitas, certificaciones y beneficios propios solamente.
- Ningún acceso a datos de otros shoppers.

## P1 de UX y administrabilidad

- Pantalla/matriz de persona + rol + scope + bundles + versión.
- Flujo de solicitud/ampliación/revocación de permisos.
- Motivo obligatorio y referencia de auditoría.
- Mensaje de acceso denegado con ruta de escalamiento.
- Indicador de permiso temporal/versionado.
- Filtros por tenant, país y proyecto.
- Estados provider-off honestos.

## P1 de copy

Usar mensajes como:

- `Acceso limitado al proyecto y país asignados.`
- `Esta acción requiere permiso adicional y revisión.`
- `El rol permite ver el módulo, pero no ejecutar esta acción.`
- `Permiso pendiente de configuración explícita.`
- `Proveedor apagado · acción preparada, no ejecutada.`

Evitar:

- `Acceso total` para coordinador/aliado;
- `Sincronizado`, `enviado`, `pagado` o `importado` sin confirmación backend;
- presentar `tenantAdmin` técnico como dueño global por defecto.

## Pendientes backend que no debe resolver el frontend

- reducir alcance efectivo de `projectAdmin` mediante persona/bundles;
- enforcement de acciones protegidas;
- incorporar clientAdmin/clientViewer al seed definitivo;
- verificar clean-state Firebase DEV;
- crear usuarios/claims/rules solo con gates separados.

## Impacto Academia

- rol vs persona vs scope;
- ruta vs acción;
- Admin del Proyecto;
- acceso denegado y escalamiento;
- cambios auditados;
- cliente admin/viewer;
- datos sensibles fuera de claims;
- provider-off.

## Validación de candidata

- probar coordinador, aliado, custom, cliente admin, cliente viewer y shopper;
- probar ruta y acción, no solo menú;
- verificar scopes cruzados entre países/proyectos;
- comprobar unknown modules y custom fail-closed;
- confirmar ausencia de promesas falsas de provider/sync/pago/import.

## Clasificación

- **Reusable CXOrbia:** UX de permisos granular y fail-closed.
- **Exclusivo cliente:** asignaciones reales TyA por país/proyecto.
- **Claude/prototipo:** impacto directo.
- **Academia:** impacto directo.
- **Sin impacto Claude:** validators y CI.
