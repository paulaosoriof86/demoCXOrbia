# Academia — impacto Corte 6 Auth/RBAC + continuidad de credenciales

**Fecha:** 2026-07-30  
**Estado:** Corte6 técnico PASS; `P0_PROVEN_C6_CREDENTIAL_CONTINUITY_GAP`; no producción.

## Objetivo
Registrar aprendizajes reutilizables del gate real de identidad, permisos y continuidad de acceso sin convertir detalles técnicos del proveedor en la experiencia normal del usuario.

## Resultado real que debe quedar reflejado
- Firebase Auth real y claims sustituyen al selector visual de rol como autoridad de acceso.
- 5 cuentas existentes fueron normalizadas fail-closed: cliente2 + shopper3 con vínculo exacto.
- Shopper sin vínculo exacto no se corrigió por inferencia.
- Rules canónicas de visita disponible usan `status` y conservan compatibilidad `estado` legacy.
- Hosting DEV fue desplegado una sola vez sobre el sitio existente y verificado.
- El formulario técnico DEV `Correo + Contraseña` no debe convertirse en el contrato final del producto.
- Inventario read-only demostró que las credenciales legacy `Usuario + Contraseña` todavía no están materializadas en el backend canónico.
- No se crea un Gmail nuevo para resolver una ausencia de migración de identidad.

## Contenido obligatorio por rol
### Admin / Operativo
- autenticación real detrás del acceso del producto;
- usuario visible no tiene por qué ser un email;
- tenant y proyecto autorizados;
- cómo identificar conflicto de acceso sin ampliar permisos;
- diferencia entre identidad Auth, usuario operativo, perfil shopper y referencia HR.

### Shopper
- ingreso con su usuario operativo y contraseña cuando el adapter quede activado;
- el proveedor Auth puede usar un identificador interno no visible;
- vínculo de identidad por `shopperId` sin exponer IDs técnicos;
- solo aparecen proyectos/visitas permitidos;
- si falta acceso, solicitar revisión; nunca crear otra identidad para “hacer que funcione”.

### Cliente
- ingreso autenticado con credencial asignada por la plataforma;
- visibilidad limitada al proyecto autorizado;
- no confundir usuario de acceso con correo de contacto;
- recuperación/cambio de contraseña por flujo controlado.

### Superadmin
- scopes tenant/proyecto;
- mapping `usuario operativo ↔ identidad provider`;
- revisión de conflictos;
- mínimo privilegio;
- nunca inferir permisos por nombre/email/coincidencia visual;
- migración de credenciales solo por export/import controlado.

## Aprendizajes técnicos convertibles a material de Academia
1. **Auth real ≠ selector de rol.** El rol visual no autoriza al proveedor.
2. **Usuario ≠ email obligatorio.** El producto puede conservar un username mientras el adapter resuelve el identificador provider internamente.
3. **Credencial de contacto ≠ credencial de acceso.** Un correo del perfil no debe convertirse automáticamente en login.
4. **Continuidad de credenciales es parte de la migración.** Datos operativos completos no significan identidad migrada.
5. **Claims con scopes canónicos.** tenant/proyecto/rol deben representar el modelo real.
6. **Identidad shopper exacta.** `shopperId` evita permisos por coincidencia de nombre.
7. **Fail-closed.** Conflicto o ausencia de fuente de identidad → HOLD/revisión, no credencial nueva improvisada.
8. **Export/import, no conexión legacy.** La base vieja no se convierte en dependencia runtime.
9. **CLI vs API.** Separar permisos realmente requeridos de dependencias extra de una herramienta.
10. **Verificación por evidencia.** Import/deploy no equivale a éxito sin readback.

## Manuales/checklists a actualizar
1. Manual de acceso/login: `Usuario + Contraseña` visible con Auth provider detrás.
2. Manual de recuperación/cambio de contraseña.
3. Manual de roles/permisos: tenant/proyecto determinan alcance.
4. Manual Shopper: identidad única, historial propio y disponibles autorizadas.
5. Checklist soporte: usuario, identidad provider, rol, tenant, proyecto y vínculo shopper.
6. Errores frecuentes: usuario no migrado, conflicto de username, cuenta sin proyecto, shopper sin vínculo exacto, sesión expirada.
7. Validación: conflicto → revisión humana, nunca ampliación automática.
8. Manual técnico/admin: import idempotente, hash-type, readback, mínimos permisos.

## Notificaciones / rutas
- Ruta Admin/Ops: acceso seguro + troubleshooting.
- Ruta Shopper: ingreso, cambio/recuperación y disponibilidad de visitas.
- Ruta Cliente: ingreso y alcance por proyecto.
- Superadmin: identidad provider, adapter, claims/scopes y conflictos.
- Novedad de producto solo después de cierre del P0 y aprobación; no anunciar producción antes del cutover.

## Reusable vs TyA
- **Reusable CXOrbia:** Auth real detrás de adapter, username visible, mínimo privilegio, scopes, import idempotente, fail-closed.
- **Exclusivo TyA:** fuente legacy de credenciales, proyecto `cinepolis` y Agosto HN HOLD.
- **Claude/prototipo:** ajuste focalizado login/registro; no nueva candidata.
- **Sin impacto Claude:** inventarios source-safe, import/readback y gates provider.

## Estado seguro
Corte6: Auth claim writes5 ya autorizados; usuarios nuevos/password changes/deletes0; Firestore data writes0; Rules release1; Hosting DEV1/1; inventario credential-continuity provider writes0; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false; credenciales crudas0.
