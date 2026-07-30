# Academia — impacto Corte 6 Auth/RBAC

**Fecha:** 2026-07-30  
**Estado:** documental; no provider writes ni producción.

## Objetivo
Registrar qué debe enseñar Academia a partir del gate real de identidad y permisos sin convertir seguridad técnica en copy interno para el usuario final.

## Contenido obligatorio por rol
### Admin / Operativo
- autenticación real vs selección visual de rol;
- tenant y proyecto autorizados;
- cómo identificar un conflicto de acceso sin ampliar permisos manualmente;
- diferencia entre usuario Auth, perfil shopper y referencia HR;
- validación esperada: el usuario solo opera dentro de su alcance.

### Shopper
- ingreso con cuenta autorizada;
- vínculo de identidad por `shopperId` administrado por plataforma, sin exponer IDs técnicos en el curso normal;
- por qué solo aparecen proyectos/visitas permitidos;
- visita disponible no equivale a visita asignada;
- qué hacer si no aparece una visita que esperaba: solicitar revisión, no crear otra identidad ni cambiar rol localmente.

### Cliente
- ingreso autenticado;
- visibilidad limitada a proyectos autorizados;
- no confundir acceso de cliente con acceso administrativo;
- escalamiento cuando falte acceso.

### Superadmin
- scopes tenant/proyecto;
- revisión de claims y conflictos;
- principio de mínimo privilegio;
- nunca inferir permisos por nombre/email ni por coincidencia visual.

## Manuales/checklists a actualizar
1. Manual de acceso/login: Firebase Auth como identidad real; selector local no es autorización.
2. Manual de roles y permisos: tenant/proyecto determinan alcance.
3. Manual Shopper: identidad única, visitas propias y disponibles autorizadas.
4. Checklist soporte: confirmar cuenta, rol, tenant, proyecto y vínculo shopper antes de escalar.
5. Errores frecuentes: cuenta válida sin proyecto, shopper sin vínculo exacto, sesión expirada, permiso insuficiente.
6. Validación: si existe conflicto, pasa a revisión humana; nunca ampliar acceso automáticamente.

## Notificaciones / rutas
- Ruta Admin/Ops: agregar microlección de acceso seguro y troubleshooting.
- Ruta Shopper: agregar ingreso seguro + disponibilidad de visitas.
- Ruta Cliente: agregar alcance por proyecto.
- Novedad de producto solo cuando el flujo quede validado en DEV y aprobado; no anunciar como producción antes del cutover.

## Reusable vs TyA
- Reusable CXOrbia: Auth real, mínimo privilegio, scopes tenant/proyecto, conflicto a review.
- Exclusivo TyA: ejemplo operativo de proyecto Cinépolis; no hardcodear en contenido reusable.

## Estado seguro
Documento únicamente. Auth/Firestore/Rules/Hosting/Storage/HR writes=0; producción=false; merge=false.
