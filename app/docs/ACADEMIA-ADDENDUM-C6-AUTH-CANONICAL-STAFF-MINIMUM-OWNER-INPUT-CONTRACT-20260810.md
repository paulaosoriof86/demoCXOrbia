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
- la administración autorizada de usuarios debe permitir crear, editar, cambiar rol/scope y deshabilitar preservando trazabilidad;
- la deshabilitación es distinta de la eliminación física y debe enseñarse como práctica de gobierno/auditoría.

La conversación actual entregó referencias empresariales para los accesos iniciales, pero esas referencias humanas y sus correos no forman parte de Academia ni deben persistirse en documentación técnica.

**Impacto Academia:** conceptual únicamente. Manuales futuros deben reflejar la diferencia entre identidad, rol, scope, alta, edición y deshabilitación; sin PII ni detalles internos de Auth.

**Avance de cierre a producción certificado:** 72%.
