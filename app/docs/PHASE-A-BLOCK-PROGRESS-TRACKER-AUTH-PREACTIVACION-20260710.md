# Tracker Phase A — Auth preactivación por permisos

Fecha: 2026-07-10

## Bloque

`Auth/Firestore DEV limpio — preactivación focalizada por permisos`.

## Estado

**Completado en modo source-safe/provider-off.**

No equivale a conexión Firebase, creación de usuarios, claims, protected reads, rules deploy, import, deploy o producción.

## Ya estaba hecho y no se reabrió

- source lock post-V96 empalmado;
- runtime 67/67 validado;
- smoke técnico/visual y drift verdes;
- contratos RBAC, taxonomía y claims seed existentes;
- Firestore schema/rules draft;
- protected reads preview;
- `CX.data` adapter/switch preparado;
- HR source-safe, shoppers, certificaciones carryover, liquidaciones junio y reviewQueue documentados;
- Level 0/1 y metodología no reiniciados.

## Hecho en este bloque

- reconciliación de permisos frontend post-V96 con RBAC backend;
- definición ruta vs acción;
- interpretación segura de `Admin del Proyecto`;
- coordinador limitado a país/proyecto;
- aliado/franquiciado limitado por persona/scope/bundles aunque use `tenantAdmin`;
- custom default deny;
- separación `clientAdmin` / `clientViewer`;
- templates source-safe para once personas Phase A;
- verificador estático de matriz, scopes, deploy manual-only y safe state;
- workflow CI provider-off;
- documentación Claude, Academia, cambios y tracker.

## Avance Phase A real

La futura conexión Auth podrá proteger correctamente:

- HR operacional por tenant/proyecto/país;
- shoppers históricos y datos protegidos;
- certificaciones preservadas;
- visitas/asignaciones/conflictos;
- liquidaciones y pagos de junio;
- cliente multi-proyecto;
- Cinépolis como proyecto configurable;
- auditoría y revisión humana.

## Hallazgos pendientes por carril

### Backend real

- reducir el alcance efectivo de `projectAdmin` mediante persona/bundles antes de claims;
- impedir que `franchiseOwner` herede privilegios de `tenantOwner`;
- incorporar cliente admin/viewer al seed vigente;
- conectar enforcement por acción en backend protegido;
- verificar externamente que Firebase DEV continúa limpio.

### Claude/prototipo

- copy visible de alcance de `Admin del Proyecto`;
- acceso denegado con motivo y escalamiento;
- custom “requiere configuración explícita”;
- cliente admin/viewer diferenciados;
- botones protegidos sin simulación de ejecución.

### Academia

- rol/persona/scope/bundles;
- ruta vs acción;
- límites por perfil;
- cambios de permisos auditados;
- proveedor apagado;
- datos sensibles fuera de claims/manuales.

## Conectado

- runtime post-V96;
- gates estáticos;
- nueva matriz source-safe en repo;
- validator/CI provider-off.

## Preparado/no ejecutado

- identidad DEV source-safe;
- templates de claims;
- Auth config;
- Firestore rules/protected reads;
- usuarios de prueba opacos;
- auditoría de cambios de acceso.

## Bloqueado

- llamadas Firebase/Auth;
- creación de usuarios;
- escritura de claims;
- lecturas/escrituras Firestore;
- rules deploy;
- importación legacy o real;
- HR writeback;
- Make/Gemini/Storage;
- pagos reales;
- merge/deploy/producción.

## Activación blockers registrados

1. `projectAdmin` demasiado amplio en RBAC v1.
2. `franchiseOwner` requiere restricción por persona/bundles.
3. cliente admin/viewer faltan en seed v1.
4. custom requiere mapeo explícito.
5. enforcement por acción aún no conectado.
6. clean-state Firebase DEV aún no verificado externamente.

## Clasificación

- **Reusable CXOrbia:** autorización por rol/persona/scope/bundles y fail-closed.
- **Exclusivo cliente:** asignaciones reales TyA y configuración de proyectos.
- **Claude/prototipo:** UX/copy de permisos y acciones.
- **Academia:** formación completa por perfil y scope.
- **Sin impacto Claude:** validator y workflow provider-off.

## Siguiente bloque exacto

`Firebase DEV clean-state + Auth configuration read-only gate`:

1. crear contrato/verificador read-only;
2. mantenerlo bloqueado hasta autorización explícita de llamada al proveedor;
3. comprobar identidad del proyecto y conteos sin extraer PII;
4. confirmar Auth/Firestore/Storage/Functions vacíos o clasificar cualquier hallazgo;
5. no crear usuarios, claims, reglas o documentos;
6. después preparar dry-run de identidades opacas.

## Necesidad de Paula

No se requieren HR, shoppers, certificaciones, liquidaciones ni pasos manuales.

Para ejecutar el siguiente gate que consulte Firebase, sí será necesaria autorización explícita separada porque implicará una llamada read-only al proveedor, aunque no escriba nada.
