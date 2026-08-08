# Academia — impacto Corte 6 P0 doble login

**Fecha:** 2026-07-30  
**Estado:** `SINGLE_LOGIN_FIX_APPLIED_STATIC_PASS__PENDING_DEV_VISUAL`

## Cambio de criterio operativo
La validación humana demostró que no debe enseñarse un gate Firebase separado antes del acceso normal del producto. El fix ya está aplicado en la rama y pasó gate estático; falta publicarlo en DEV y validarlo visualmente.

La experiencia correcta para Academia/manuales es:
1. el usuario ve **un solo acceso CXOrbia/TyA**;
2. Firebase Auth, provider email y claims permanecen detrás del adapter;
3. si hacen falta credenciales, se solicitan dentro del mismo acceso normal;
4. una sesión válida se restaura sin pedir autenticación repetida;
5. logout sí cierra la sesión;
6. los errores visibles distinguen credencial inválida de alcance/rol sin exponer detalles sensibles;
7. los namespaces `staff/shopper` son implementación interna, no un paso visible adicional.

## Material a actualizar
- manual de acceso Admin/Coordinación;
- manual de acceso Shopper/Evaluador;
- troubleshooting de credenciales;
- recuperación/cambio de contraseña;
- explicación de roles/scopes;
- checklist de validación de sesión, refresh y logout.

## Gate pedagógico
No publicar capturas ni instrucciones definitivas del acceso hasta que el redeploy DEV corregido pase smoke remoto y Paula apruebe visualmente el single-login.

## No cambiar
Auth91/91, dedupe, claims, scopes, shopperId exacto y política fail-closed siguen vigentes.

## Estado seguro
Documentación actualizada. Corrección P0 hasta ahora sin Hosting deploy, Auth/Firestore/Rules/Storage/HR/Make/Gemini/pagos/producción.
