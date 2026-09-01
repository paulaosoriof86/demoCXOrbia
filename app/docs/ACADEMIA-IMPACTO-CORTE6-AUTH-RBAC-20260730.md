# Academia — impacto Corte 6 Auth/RBAC + continuidad de credenciales

**Fecha:** 2026-07-30  
**Estado:** `AUTH91_READBACK_PASS__P0_SINGLE_LOGIN_REQUIRED`; no producción.

## Objetivo
Registrar aprendizajes reutilizables del gate real de identidad y permisos sin convertir detalles técnicos del proveedor en una segunda experiencia de acceso.

## Backend/Auth preservado
- Firebase Auth y claims son la autoridad backend.
- Import legacy:91/readback91/91 PASS.
- shopper88 + super1 + coordinador2.
- Auth users17→108.
- password resets0, deletes0, overwrite0.
- namespaces internos `staff/shopper`.
- provider/email interno no visible.
- migración por export/import controlado; nunca conexión legacy runtime.
- conflictos/falta de vínculo exacto → HOLD.

## Hallazgo visual posterior — P0
La validación humana de Paula demostró que la integración actual agregó una pantalla `Acceso seguro` separada antes del login normal del producto.

Academia **no debe enseñar dos autenticaciones**. El P0 está documentado en `CORTE6-P0-DOBLE-LOGIN-AUTH-DEV-20260730.md`.

## Experiencia canónica que debe enseñar Academia
1. El usuario ve **un solo acceso CXOrbia/TyA**.
2. Firebase Auth/provider/claims permanecen detrás del adapter.
3. Una sesión válida se restaura silenciosamente.
4. Si se requieren credenciales reales, se solicitan dentro del mismo flujo normal del producto.
5. Logout sí cierra Auth; refresh no exige reautenticación innecesaria.
6. Recuperación/cambio de contraseña se presenta desde el producto.
7. Errores visibles distinguen credencial inválida de rol/namespace/scope sin exponer información sensible.
8. Los namespaces `staff/shopper` son una regla interna; el usuario no debe atravesar un paso técnico adicional por ellos.

## Contenido por rol
### Admin / Operativo
- ingreso único;
- usuario visible no tiene por qué ser email;
- tenant/proyecto autorizados;
- diferencia entre usuario operativo, identidad provider y perfil;
- conflicto de acceso = revisión, no ampliación automática.

### Shopper
- ingreso con usuario/contraseña existentes dentro del mismo acceso del producto;
- vínculo por `shopperId` exacto;
- solo historial/proyectos/visitas permitidos;
- ausencia de mapping → revisión, no identidad duplicada.

### Cliente
- Auth real y alcance por proyecto;
- usuario de acceso no equivale necesariamente al correo de contacto;
- recuperación/cambio no amplía scopes.

### Superadmin
- namespaces de identidad;
- mapping usuario operativo ↔ provider;
- claims tenant/project/role;
- conflictos/HOLD;
- mínimo privilegio;
- export/import idempotente + readback.

## Manuales/checklists a actualizar
1. Manual de **acceso único**.
2. Recuperación/cambio de contraseña.
3. Roles/permisos/scopes.
4. Shopper: identidad única e historial propio.
5. Checklist soporte: usuario, namespace interno, provider, rol, tenant, proyecto, shopperId.
6. Errores frecuentes: credencial, namespace, HOLD, perfil sin vínculo, cuenta sin proyecto, sesión expirada.
7. Validación: conflicto → revisión humana.
8. Manual técnico/admin: export seguro, dedupe, hash import, no-overwrite y readback.

## Reusable vs TyA
- **Reusable CXOrbia:** Auth detrás de un único login, sesión restaurable, namespaces, mínimo privilegio, scopes, hash import, no-overwrite y readback.
- **Exclusivo TyA:** credenciales legacy, proyecto `cinepolis`, Agosto HN HOLD.
- **Claude/prototipo:** corrección focalizada single-login ya demostrada P0.
- **Sin impacto Claude:** inventarios source-safe, cifrado e import/readback ya cerrados.

## Gate pedagógico pendiente
`FIX SINGLE-LOGIN → VALIDACIÓN VISUAL → FREEZE CORTE6`.

## Estado seguro
Desde el P0 visual: Auth writes0; Firestore data0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false.
