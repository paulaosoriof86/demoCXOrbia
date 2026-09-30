# RESUMEN-PARA-CLAUDE addendum — Auth preactivación por permisos

Fecha: 2026-07-10

## Estado actual

- Runtime post-V96 empalmado y validado.
- Matriz Auth preactivación validada con 0 hard fails y 0 warnings.
- Auth/Firestore real continúan apagados.
- No se crearon usuarios, claims, reglas, documentos ni datos reales.

## Regla que Claude debe aplicar

Un permiso no se determina solo por el nombre del rol. Debe representarse como:

`rol técnico + persona + tenant + país/proyecto + bundles + versión de permisos`.

Ver una ruta no equivale a poder ejecutar su acción protegida.

## Cambios requeridos en futura candidata

### `Admin del Proyecto`

- Explicar visualmente que el alcance es proyecto/país asignado.
- No presentar coordinador o aliado como dueño global del tenant.
- No mostrar finanzas/configuración/proveedores por defecto.

### Coordinador

- Operación, proyecto y Academia dentro del scope.
- Denegar tenant global, SaaS, proveedores y finanzas salvo permiso explícito.

### Aliado / franquiciado

- Operación y configuración de proyecto dentro de su franquicia/país.
- Aunque el rol técnico sea `tenantAdmin`, no heredar privilegios de `tenantOwner`.

### Custom

- Default deny.
- Mostrar “requiere configuración explícita”.
- Exigir persona, rol, scope, módulos/acciones, versión, motivo y aprobación.

### Cliente

- Separar `clientAdmin` de `clientViewer`.
- Limitar ambos al portal y proyectos aprobados.

### Acciones protegidas

- Permitir estado visible/disabled con explicación.
- No simular envío, pago, sync, import, claims o provider action.
- Mostrar escalamiento y motivo cuando el acceso sea insuficiente.

## Pendientes que siguen abiertos

- 36 coincidencias históricas de copy P1;
- consolidación selectiva de 27 extras preservados;
- enforcement backend por acción todavía no conectado;
- Firebase DEV clean-state no verificado externamente;
- UX de acceso denegado y permisos versionados;
- Academia profunda por rol/persona/scope.

## No tocar desde Claude

- contratos/adapters backend;
- validators/workflows;
- Firebase/Auth/Firestore;
- secrets;
- datos reales;
- claims/rules/imports;
- lógica de scopes ya definida sin una decisión explícita documentada.

## Validación esperada

- coordinador/aliado/custom no escalan privilegios;
- cliente admin/viewer permanecen en portal;
- shopper solo ve datos propios;
- botones protegidos no fingen ejecución;
- unknown module/custom siguen fail-closed;
- Academia y ayuda contextual reflejan route vs action.

## Clasificación

- **Reusable CXOrbia:** modelo granular de permisos.
- **Exclusivo cliente:** datos/asignaciones TyA no van en fixtures genéricos.
- **Claude/prototipo:** impacto directo.
- **Academia:** impacto directo.
- **Sin impacto Claude:** CI y nombres internos de archivos.
