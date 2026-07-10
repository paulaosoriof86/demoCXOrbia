# Resumen para Claude — Auth preactivación por permisos

Fecha: 2026-07-10

## Estado que Claude debe respetar

- Runtime post-V96 empalmado y validado.
- Auth/Firestore real siguen apagados.
- No existen usuarios o claims reales creados por este bloque.
- La matriz backend se preparó sin tocar módulos frontend.

## Regla visual principal

La UI no debe representar un rol técnico como permiso total.

Autorización real futura:

`rol técnico + persona + tenant + país/proyecto + bundles + versión de permisos`.

Ver un menú o una pantalla no equivale a poder ejecutar una acción protegida.

## Pendientes para prototipo

### Coordinador

- Mostrar que administra únicamente los proyectos/países asignados.
- `Admin del Proyecto` no debe confundirse con configuración global del tenant.
- Finanzas, proveedores, usuarios y SaaS deben permanecer ocultos/denegados salvo allowlist explícita.

### Aliado / franquiciado

- Puede operar y administrar proyecto/país dentro de su franquicia/scope.
- Aunque backend use `tenantAdmin`, la UI no debe presentarlo como dueño global del tenant.
- Expansiones a finanzas/configuración requieren permiso explícito y motivo.

### Custom

- Estado default: acceso mínimo/denegado.
- Mostrar “requiere configuración explícita” y no heredar permisos por shell o categoría desconocida.
- Toda ampliación debe mostrar scope, módulos, acciones, versión, motivo y revisión.

### Cliente

- Separar claramente `Admin de marca` y `Visor de marca`.
- Ambos limitados a proyectos y reportes aprobados.
- No mostrar administración interna del tenant.

### Acciones protegidas

- Un botón visible debe poder quedar deshabilitado con explicación de rol/scope/gate.
- No simular que una acción se ejecutó si backend la deniega o el proveedor está apagado.
- Finanzas, claims, import, HR writeback, mensajes y Gemini requieren gates independientes.

## Copy sugerido

- `Acceso limitado al proyecto y país asignados.`
- `Esta acción requiere permiso adicional y revisión.`
- `El rol permite ver el módulo, pero no ejecutar esta acción.`
- `Permiso pendiente de configuración explícita.`
- `Proveedor apagado · acción preparada, no ejecutada.`

## No tocar

- contratos backend;
- validators/workflows;
- Firebase/Auth/Firestore;
- secrets;
- datos reales;
- claims;
- rules;
- imports.

## Validación esperada de Claude

- coordinador/aliado/custom no obtienen finanzas/configuración por error;
- módulos desconocidos permanecen fail-closed;
- cliente admin/viewer no salen de su portal;
- shopper no ve datos de otros shoppers;
- expansión de permisos requiere confirmación/motivo;
- Academia explica rol/persona/scope y acceso denegado.

## Clasificación

- **Reusable CXOrbia:** patrón de permisos granular.
- **Exclusivo cliente:** nombres/asignaciones TyA fuera del prototipo genérico.
- **Claude/prototipo:** impacto directo.
- **Academia:** impacto directo.
- **Sin impacto Claude:** ejecución del validator CI.
