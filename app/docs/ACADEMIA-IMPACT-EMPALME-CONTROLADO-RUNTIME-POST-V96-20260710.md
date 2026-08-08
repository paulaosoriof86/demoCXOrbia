# Impacto Academia — empalme controlado runtime post-V96

Fecha: 2026-07-10

## Cambio que debe reflejar Academia

El runtime operativo de continuidad dejó de ser una combinación histórica y quedó alineado exactamente con el source lock post-V96. Esto cambia la referencia desde la cual deben mantenerse manuales, cursos, rutas por rol, checklists, glosario y notificaciones.

## Contenido obligatorio por rol

### Superadmin/Admin

- diferencia entre source lock, runtime validado, DEV, deploy y producción;
- lectura de gates y advertencias;
- permisos por tenant, proyecto, país y scope;
- revisión de conflictos antes de claims/imports;
- deploy manual-only y autorizaciones separadas;
- no tratar un smoke visual como autorización de producción.

### Coordinador/Aliado/Project Admin

- alcance exacto de `Admin del proyecto`;
- módulos y acciones permitidas;
- acciones que requieren escalamiento a admin tenant/superadmin;
- interpretación de acceso denegado;
- operación multi-proyecto sin exceder scope.

### Custom

- permisos derivados de matriz/allowlist;
- comportamiento fail-closed;
- cómo solicitar ampliación de acceso;
- diferencia entre ver shell/botones y poder ejecutar una acción.

### Cliente

- selector multi-proyecto;
- proyecto activo;
- reportes/datos aprobados según scope;
- ausencia de acceso a administración interna.

### Shopper

- flujo operativo visible;
- límites de lectura de sus propias visitas/evidencias/beneficios;
- copy honesto de comunicaciones manuales y pagos.

## Manuales y cursos que deben actualizarse

- navegación y permisos por rol;
- proyectos, periodos y multi-proyecto;
- HR Source y estados de conexión;
- Diagnóstico/Readiness;
- Auth/Firestore: preparado versus activado;
- outbox, Make, WhatsApp y correo;
- liquidaciones/pagos de junio como control administrativo;
- certificaciones carryover;
- revisión humana y conflictos;
- operación segura ante un gate bloqueado.

Cada contenido debe explicar botones, pasos, datos, validación, errores frecuentes, acciones de recuperación y consecuencias operativas.

## Patches Academia preservados

Se preservaron:

- `app/modules/academia-admin-actions.js`;
- `app/modules/academia-create-ai-stable.js`.

No están cargados automáticamente por el `index.html` del source lock. Deben revisarse para consolidación futura sin perder:

- creación/edición administrable;
- estados draft/review/published/archived;
- motivo y audit trail;
- copy honesto de Gemini pendiente;
- revisión humana antes de publicación.

## Notificaciones de Academia

Pendiente preparar notificaciones source-safe para:

- cambio de permisos por rol;
- manual actualizado por cambio de runtime;
- curso actualizado por módulo;
- contenido pendiente de revisión humana;
- nueva versión de curso/checklist;
- capacitación requerida por cambio de acceso.

No enviar notificaciones reales hasta activar outbox/proveedor mediante gate.

## Validación Academia

Antes de Auth real debe existir al menos:

1. matriz rol → módulos → acciones;
2. checklist de smoke por rol;
3. lección sobre scopes y fail-closed;
4. guía de lectura de gates;
5. explicación de preview/DEV/producción;
6. tratamiento de datos sensibles;
7. flujo de revisión humana;
8. guía de liquidaciones/pagos como control, no pago automático.

## Clasificación

- **Reusable CXOrbia:** Academia sincronizada con runtime, permisos, gates y cambios de módulo.
- **Exclusivo cliente:** ejemplos operativos TyA/Cinépolis, HR y junio.
- **Claude/prototipo:** consolidación visual/interactiva de acciones y rutas por rol.
- **Academia:** impacto directo y obligatorio.
- **Sin impacto Claude:** hashes y detalles internos de empaquetado, salvo explicación conceptual para admins.

## Estado seguro

Documento únicamente. No activa Gemini, notificaciones, Auth, Firestore, deploy, import, Storage, HR writeback ni pagos.
