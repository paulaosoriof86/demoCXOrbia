# Impacto en Academia — Cloud V5 y acceso Cliente runtime

**Fecha:** 2026-08-04  
**Estado:** `DOCUMENTADO__ACTUALIZACION_DE_CONTENIDO_POSTERIOR_AL_GO`

## 1. Login y white-label

Después del GO de Cloud V6, Academia debe explicar:

- diferencia entre marca producto y marca tenant;
- países del tenant como información visual, no como permisos;
- composición responsive en desktop, tablet y móvil;
- accesibilidad mediante teclado, foco y reducción de movimiento;
- evidencia real por viewport y manifest de hashes.

Mientras V5 permanezca HOLD, no actualizar capturas de cursos o manuales como si fueran definitivas.

## 2. Auth Cliente

Los materiales técnicos deben separar:

1. identidad existente en Firebase Auth;
2. claims de rol, tenant y proyecto;
3. membership canónica en `tenants/{tenantId}/users/{uid}`;
4. sign-in válido;
5. transición visual al Portal Cliente;
6. autorización efectiva de datos.

Un usuario autenticado no equivale por sí solo a una membership válida ni a una ruta visual funcional.

## 3. Gates

Registrar como patrón reusable:

- autoridad HR dinámica;
- no congelar conteos o último periodo;
- validar nombres reales de módulos registrados;
- no corregir la UI para compensar un test desactualizado;
- snapshot y rollback exactos antes de conservar cambios de proveedor.

## 4. Estado actual

- Cloud V5: no aprobado;
- Cloud V6: pendiente de entrega;
- acceso Cliente: preestado restaurado después del HOLD;
- gate semántico: corregido en fuente;
- actualización definitiva de cursos/manuales: pendiente del PASS runtime y GO frontend.

## 5. Clasificación

- **Reusable CXOrbia:** white-label, responsive, claims/membership y gates dinámicos.
- **Exclusivo TyA:** ejemplos `tya/cinepolis`.
- **Cloud/prototipo:** capturas y componentes V6.
- **Academia:** actualización pendiente tras los gates.
- **Sin impacto proveedor:** este documento no ejecuta writes.
