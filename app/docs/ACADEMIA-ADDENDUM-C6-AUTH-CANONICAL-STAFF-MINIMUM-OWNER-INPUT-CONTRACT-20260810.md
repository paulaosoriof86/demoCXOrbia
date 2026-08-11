# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Este bloque no cambia cursos, rutas, certificaciones ni UI de Academia.

Patrones reutilizables a conservar como principios internos de seguridad y operación:

- identidad empresarial, rol técnico y scope son dimensiones separadas;
- una cuenta histórica no se vuelve canónica por ser la única con un rol;
- el alcance debe venir de autorización empresarial explícita y convertirse a scope técnico exacto;
- `TyA completo` no equivale a un wildcard silencioso: el sistema debe mantener entitlement auditable;
- credenciales nuevas se manejan como secretos efímeros y nunca como contenido de documentación;
- fingerprints, claims internos y detalles de repair no deben exponerse a shoppers/clientes;
- los usuarios staff iniciales son **bootstrap de datos vivos**, no constantes de código;
- la administración autorizada de usuarios debe permitir crear, editar, cambiar rol/scope, deshabilitar y reactivar preservando trazabilidad;
- la deshabilitación es distinta de la eliminación física y debe enseñarse como práctica de gobierno/auditoría.

El contrato source-only de administración viva quedó materializado en `backend/contracts/c6-live-user-admin-v1.json`: Firebase Auth como autoridad, documento vivo de usuario por tenant y audit trail, sin PII real en repo.

La conversación actual entregó referencias empresariales para los accesos iniciales, pero esas referencias humanas y sus correos no forman parte de Academia ni deben persistirse en documentación técnica.

**Impacto Academia:** conceptual únicamente. Manuales futuros deben reflejar la diferencia entre identidad, rol, scope, alta, edición, deshabilitación y reactivación; sin PII ni detalles internos de Auth.

**Avance de cierre a producción certificado:** 73%.
