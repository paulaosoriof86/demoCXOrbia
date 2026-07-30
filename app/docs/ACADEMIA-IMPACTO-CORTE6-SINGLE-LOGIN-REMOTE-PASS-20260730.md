# Academia — impacto Corte 6 single-login remoto PASS

**Fecha:** 2026-07-30  
**Estado:** `SINGLE_LOGIN_REMOTE_PASS__PENDING_HUMAN_VISUAL`

## Patrón reusable que queda documentado
1. El usuario debe ver un único acceso CXOrbia/TyA.
2. Firebase Auth, provider email y custom claims permanecen detrás del adapter.
3. Usuario + contraseña se integran en el mismo flujo visible del producto cuando la sesión no puede restaurarse.
4. Una sesión Firebase válida se restaura silenciosamente durante la sesión del navegador.
5. Logout invalida Auth y la sesión CXOrbia.
6. Namespaces `staff/shopper` son internos y evitan colisiones sin exponer complejidad técnica.
7. Los errores visibles distinguen credencial inválida de scope/rol sin revelar información sensible.
8. Los gates de release deben bloquear regresiones hacia un segundo login paralelo.

## Evidencia de ejecución
El Hosting DEV existente pasó precheck, deploy único y smoke remoto con `singleVisibleLogin=true` y `parallelAuthGate=false`. Se preservaron las 91 identidades legacy ya importadas y no hubo Auth/Firestore/Rules/Storage/HR/legacy/payments/Functions writes adicionales ni producción.

## Manuales/cursos a mantener sincronizados
- acceso Admin/Coordinación;
- acceso Shopper/Evaluador;
- recuperación/cambio de contraseña;
- tenant/proyecto/rol y shopperId exacto;
- sesión/refresh/logout;
- troubleshooting de credenciales y scope;
- gates anti-regresión de autenticación.

## Siguiente actualización
Después de la validación visual humana y FREEZE Corte6, registrar el flujo aprobado final y continuar con Agosto delta sin reabrir histórico.
