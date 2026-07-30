# Academia — impacto Corte 6 P0 doble login

**Fecha:** 2026-07-30  
**Estado:** `P0_PROVEN_SINGLE_LOGIN_REQUIRED`

## Cambio de criterio operativo
La validación humana demostró que no debe enseñarse un gate Firebase separado antes del acceso normal del producto.

La experiencia correcta para Academia/manuales es:
1. el usuario ve **un solo acceso CXOrbia/TyA**;
2. Firebase Auth, provider email y claims permanecen detrás del adapter;
3. una sesión válida se restaura sin pedir autenticación repetida;
4. logout sí cierra la sesión;
5. los errores visibles distinguen credencial inválida de alcance/rol sin exponer detalles sensibles;
6. los namespaces `staff/shopper` son una implementación interna y no una carga técnica innecesaria para el usuario.

## Material a actualizar
- manual de acceso Admin/Coordinación;
- manual de acceso Shopper/Evaluador;
- troubleshooting de credenciales;
- recuperación/cambio de contraseña;
- explicación de roles/scopes;
- checklist de validación de sesión y logout.

## No cambiar
Auth91/91, dedupe, claims, scopes, shopperId exacto y política fail-closed siguen vigentes.

## Estado seguro
Documento únicamente. No runtime, deploy, Auth/Firestore/Rules/Storage/HR/Make/Gemini/pagos/producción.
