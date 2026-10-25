# Impacto Academia — Auth preactivación por permisos

Fecha: 2026-07-10

## Cambio transversal

La futura autenticación de CXOrbia no puede enseñarse ni documentarse únicamente como una lista de roles. La operación real necesita distinguir:

- rol técnico;
- persona operativa;
- tenant;
- país/proyecto asignado;
- bundles de permisos;
- versión de permisos;
- ruta visible;
- acción protegida;
- gate de proveedor.

Academia debe dejar claro que ver un módulo no equivale a poder ejecutar todas sus acciones.

## Rutas de aprendizaje por persona

### Dueño de tenant

- configuración global del tenant;
- usuarios y permisos;
- proyectos y países;
- auditoría y conflictos;
- diferencia entre DEV, deploy y producción;
- ampliación/revocación de permisos con motivo.

### Dueño de franquicia / aliado

- alcance limitado a países y proyectos asignados;
- significado de `Admin del Proyecto`;
- qué puede operar y qué debe escalar;
- por qué `tenantAdmin` técnico no implica dueño global;
- restricciones de finanzas, proveedores y datos sensibles.

### Representante de país / coordinador

- scope por país/proyecto;
- visitas, postulaciones, asignaciones, agenda y conflictos;
- configuración de proyecto permitida;
- acciones no autorizadas por defecto;
- manejo de acceso denegado sin buscar atajos.

### Coordinador de operaciones / representante de campo

- operación diaria y revisión humana;
- preparación de notificaciones sin envío real;
- diferencias entre preparar, aprobar y ejecutar;
- límites de datos protegidos.

### Operador de finanzas

- liquidaciones y pagos de junio como control administrativo;
- lotes y cambios de estado auditados;
- prohibición de banco crudo en claims/manuales/logs;
- pago preparado versus pago ejecutado.

### Operador de certificación

- intentos, carryover y bancos de preguntas;
- Gemini como borrador sujeto a revisión humana;
- publicación y excepciones con motivo;
- límites por proyecto.

### Cliente admin y cliente visor

- diferencia entre administrar preferencias aprobadas y solo consultar;
- portal por proyecto;
- reportes aprobados;
- ausencia de acceso a administración interna.

### Shopper

- perfil propio;
- visitas y agenda propias;
- certificaciones propias;
- beneficios/liquidaciones propias;
- prohibición de acceso a otros shoppers.

### Rol custom

- fail-closed;
- necesidad de mapeo explícito;
- solicitud de acceso con alcance, motivo y revisión;
- vigencia y versión del permiso.

## Manuales obligatorios

1. Rol técnico versus persona operativa.
2. Tenant, país, proyecto y alcance propio.
3. Menú visible versus acción autorizada.
4. `Admin del Proyecto` sin privilegio global.
5. Acceso denegado, escalamiento y recuperación.
6. Cambios de permisos y audit trail.
7. Custom roles y fail-closed.
8. Cliente admin versus viewer.
9. Proveedores apagados y copy honesto.
10. Auth/Firestore preparado versus conectado.

Cada manual debe incluir pasos, ejemplos, errores frecuentes, validaciones, límites, consecuencias operativas y ruta de escalamiento.

## Checklists

### Antes de conceder acceso

- persona confirmada;
- tenant confirmado;
- país/proyecto confirmado;
- bundles mínimos;
- versión de permisos;
- motivo;
- aprobador;
- ausencia de datos sensibles en claims;
- rollback preparado.

### Ante acceso denegado

- no cambiar de rol informalmente;
- revisar persona/scope/bundle;
- confirmar proyecto activo;
- documentar motivo;
- escalar al responsable correcto;
- no compartir credenciales;
- no ampliar permisos sin auditoría.

## Notificaciones de Academia

Preparar, pero no enviar todavía:

- cambio de rol/persona/scope;
- acceso concedido o revocado;
- permiso pendiente de revisión;
- capacitación obligatoria por ampliación de privilegios;
- manual actualizado;
- versión de permisos cambiada;
- acceso denegado con ruta de soporte.

Todas permanecen source-safe y provider-off hasta activar outbox/proveedor con gate independiente.

## Impacto en cursos existentes

Todo curso asociado a proyectos, HR, shoppers, certificaciones, liquidaciones, integraciones o administración debe indicar:

- quién puede ver;
- quién puede ejecutar;
- en qué scope;
- qué requiere revisión humana;
- qué requiere proveedor real;
- qué genera auditoría;
- qué nunca debe incluir PII o datos bancarios crudos.

## Validación mínima antes de Auth real

- matriz persona → rol → scope → bundles publicada internamente;
- lección de route vs action aprobada;
- manual de acceso denegado;
- checklist de cambios de permisos;
- contenidos por aliado, coordinador, cliente, finanzas, certificación y shopper;
- copy de proveedor apagado;
- referencias opacas en ejemplos;
- prueba de comprensión para perfiles con privilegios.

## Clasificación

- **Reusable CXOrbia:** Academia sincronizada con RBAC granular y versiones de permisos.
- **Exclusivo cliente:** ejemplos TyA por país/proyecto, HR y liquidaciones de junio.
- **Claude/prototipo:** rutas visuales, estados de acceso y ayuda contextual.
- **Academia:** impacto directo y obligatorio.
- **Sin impacto Claude:** detalles internos del validator/CI.

## Estado seguro

Documento únicamente. No crea usuarios, no escribe claims, no lee/escribe Firestore, no despliega reglas, no activa notificaciones, Make, Gemini, Storage, HR writeback, pagos, deploy ni producción.
