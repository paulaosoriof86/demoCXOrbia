# ACADEMIA — C6 AUTH CANONICAL STAFF MINIMUM OWNER INPUT CONTRACT

**Actualización:** 2026-08-11

Este bloque no cambia cursos, rutas, certificaciones ni UI de Academia.

Patrones reutilizables a conservar como principios internos de seguridad y operación:

- identidad empresarial, rol técnico y scope son dimensiones separadas;
- una cuenta histórica no se vuelve canónica por ser la única con un rol;
- el alcance debe venir de autorización empresarial explícita y convertirse a scope técnico exacto;
- `TyA completo` no equivale a un wildcard silencioso;
- credenciales nuevas se manejan como secretos efímeros;
- los usuarios staff iniciales son bootstrap de datos vivos, no constantes de código;
- la administración autorizada de usuarios debe permitir crear, editar, cambiar rol/scope, deshabilitar y reactivar preservando trazabilidad;
- la deshabilitación es distinta de la eliminación física.

El contrato source-only de administración viva está materializado en `backend/contracts/c6-live-user-admin-v1.json`: Firebase Auth como autoridad, documento vivo de usuario por tenant y audit trail, sin PII real en repo.

## HR viva — impacto conceptual

La HR fue leída directamente el 2026-08-11 y M6 quedó cerrado. La lección reutilizable para manuales/Academia es distinguir:

- **fuente viva/mapeada**;
- **observabilidad de una ejecución técnica**;
- **smoke runtime del build final**.

Un fallo de observabilidad no debe presentarse como si la fuente de negocio estuviera desconectada. Tampoco debe inducir a repetir mapeos o pedir nuevamente información al operador.

Datos operativos agregados del cierre: periodo actual 2026-08, 34 GT + 10 HN = 44. No se incorporan nombres, teléfonos, correos, URL o ID crudo de la fuente a materiales de Academia.

**Impacto Academia:** conceptual únicamente. Sin nueva pantalla/lección obligatoria antes de producción.

**Avance de cierre a producción certificado:** 78%.