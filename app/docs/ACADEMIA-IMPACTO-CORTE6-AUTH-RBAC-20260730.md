# Academia — impacto Corte 6 Auth/RBAC + continuidad de credenciales

**Fecha:** 2026-07-30  
**Estado:** `CREDENTIAL_CONTINUITY_NAMESPACED_DRYRUN91_PASS__WAITING_PROVIDER_AUTHORIZATION`; no producción.

## Objetivo
Registrar aprendizajes reutilizables del gate real de identidad, permisos y continuidad de acceso sin convertir detalles técnicos del proveedor en la experiencia normal del usuario.

## Resultado real que debe quedar reflejado
- Firebase Auth y claims son la autoridad backend; el selector visual de rol no concede permisos.
- El producto no debe obligar a mostrar un email técnico para autenticar.
- TyA conserva `Usuario + Contraseña` como contrato visible.
- El acceso visible distingue `Administración / Coordinación` y `Shopper / Evaluador` para resolver namespaces `staff` y `shopper`.
- Firebase usa un identificador interno determinístico no visible.
- La migración de credenciales se hace por export/import controlado; nunca conectando la base legacy al runtime nuevo.
- Dedupe de acceso no puede hacerse por username global: perfiles distintos pueden compartir username. Se deduplica dentro del namespace y solo con identidad estable/credencial compatible.
- Conflictos o falta de vínculo exacto quedan HOLD.

## Evidencia de migración de identidad
Inventario source-safe:
- shopper source282;
- safe credential groups109;
- exact duplicate records collapsed93;
- ambiguous groups18 /records77 HOLD;
- staff4.

Dry-run provider read-only:
- eligible91 = shopper88 + super1 + coordinador2;
- shopper exact legacy match88;
- HOLD21 por ausencia de match canónico exacto;
- HOLD1 demo role;
- collisions0;
- provider writes0.

## Contenido obligatorio por rol
### Admin / Operativo
- autenticación real detrás del acceso del producto;
- usuario visible no tiene por qué ser email;
- seleccionar el tipo de acceso correcto;
- tenant/proyecto autorizados;
- diferencia entre usuario operativo, identidad provider y perfil persona/shopper;
- conflicto de acceso = revisión, no ampliación automática.

### Shopper
- ingreso con su usuario y contraseña existentes cuando el adapter esté materializado;
- tipo de acceso `Shopper / Evaluador`;
- provider interno invisible;
- vínculo por `shopperId` exacto;
- solo historial/proyectos/visitas permitidos;
- si el acceso no mapea, solicitar revisión: no crear identidad duplicada.

### Cliente
- Auth real y alcance por proyecto continúan como patrón reusable;
- usuario de acceso no equivale necesariamente al correo de contacto;
- recuperación/cambio debe ser controlado y no ampliar scopes.

### Superadmin
- namespaces de identidad;
- mapping `usuario operativo ↔ identidad provider`;
- claims tenant/project/role;
- conflictos/holds;
- mínimo privilegio;
- export/import idempotente y readback.

## Aprendizajes técnicos convertibles a Academia
1. **Auth real ≠ selector de rol.**
2. **Usuario ≠ email obligatorio.**
3. **Perfil/tipo de acceso forma parte de la identidad.** Un mismo username en namespaces diferentes no es automáticamente duplicado.
4. **Credencial de contacto ≠ credencial de acceso.**
5. **Continuidad de credenciales es parte de la migración.**
6. **Dedupe de identidad requiere llave estable.** No nombre ni username global aislado.
7. **Claims con scopes canónicos.** tenant/proyecto/rol/persona.
8. **ShopperId exacto.** No inferir acceso por coincidencia visual.
9. **Fail-closed.** Conflicto/ausencia → HOLD/revisión.
10. **Export/import, no conexión legacy.**
11. **Import no equivale a éxito sin readback.**
12. **Proveedor oculto tras adapter.** La UX no debe enseñar detalles técnicos innecesarios.

## Manuales/checklists a actualizar
1. Manual de acceso: Tipo de acceso + Usuario + Contraseña.
2. Manual de recuperación/cambio de contraseña.
3. Manual de roles/permisos y scopes.
4. Manual Shopper: identidad única, historial propio y disponibles.
5. Checklist soporte: namespace, usuario, identity provider, rol, tenant, proyecto, shopperId.
6. Errores frecuentes: namespace equivocado, usuario en HOLD, perfil sin vínculo, cuenta sin proyecto, sesión expirada.
7. Validación: conflicto → revisión humana.
8. Manual técnico/admin: export seguro, dedupe, hash import, no-overwrite, readback.

## Notificaciones / rutas
- Admin/Ops: acceso seguro + troubleshooting.
- Shopper: ingreso, recuperación, disponibilidad y conflicto de identidad.
- Cliente: ingreso y alcance.
- Superadmin: namespaces, adapter, claims/scopes, holds y readback.
- No anunciar producción antes de cutover aprobado.

## Reusable vs TyA
- **Reusable CXOrbia:** Auth detrás de adapter, username visible, namespaces, mínimo privilegio, scopes, hash import, no-overwrite y fail-closed.
- **Exclusivo TyA:** credenciales legacy, proyecto `cinepolis`, Agosto HN HOLD.
- **Claude/prototipo:** login/registro focalizado; provider/email técnico no visible.
- **Sin impacto Claude:** inventarios source-safe, cifrado, import/readback y gates.

## Estado seguro
Corte6 previo: claim writes5 + Rules release1 + Hosting DEV1/1. Bloque credential-continuity actual: Auth imports0; password resets0; deletes0; Firestore data0; Rules0; Hosting adicional0; Storage/HR/legacy/payments/Make/Gemini0; merge=false; producción=false; credenciales crudas0.
