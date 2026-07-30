# Academia — impacto Corte 6 Auth/RBAC + continuidad de credenciales

**Fecha:** 2026-07-30  
**Estado:** `CREDENTIAL_CONTINUITY_AUTH91_READBACK_PASS__HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL`; no producción.

## Objetivo
Registrar aprendizajes reutilizables del gate real de identidad, permisos y continuidad de acceso sin convertir detalles técnicos del proveedor en la experiencia normal del usuario.

## Resultado real que debe quedar reflejado
- Firebase Auth y claims son la autoridad backend; el selector visual de rol no concede permisos.
- TyA conserva `Tipo de acceso + Usuario + Contraseña` como contrato visible.
- El acceso distingue `Administración / Coordinación` y `Shopper / Evaluador` para resolver namespaces `staff` y `shopper`.
- Firebase usa un identificador interno determinístico no visible.
- La migración de credenciales se hizo por export/import controlado; nunca conectando la base legacy al runtime nuevo.
- Dedupe de acceso no puede hacerse por username global: perfiles distintos pueden compartir username.
- Conflictos o falta de vínculo exacto quedan HOLD.

## Evidencia de migración de identidad
Inventario source-safe:
- shopper source282;
- safe credential groups109;
- exact duplicate records collapsed93;
- ambiguous groups18 /records77 HOLD;
- staff4.

Provider activation:
- Auth eligible/imported/readback91/91;
- shopper88 + super1 + coordinador2;
- Auth users17→108;
- password resets0;
- deletes0;
- overwrite0;
- Hosting DEV ejecutado solo después del readback PASS;
- browserAuth/entrypoint/proof/namespaced login remoto PASS;
- nuevo Firebase/Hosting0;
- Firestore/Rules/Storage/HR/legacy/payments/functions/Make/Gemini0.

## Contenido obligatorio por rol
### Admin / Operativo
- autenticación real detrás del acceso del producto;
- usuario visible no tiene por qué ser email;
- seleccionar el tipo de acceso correcto;
- tenant/proyecto autorizados;
- diferencia entre usuario operativo, identidad provider y perfil persona/shopper;
- conflicto de acceso = revisión, no ampliación automática.

### Shopper
- ingreso con su usuario y contraseña existentes;
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
- export/import idempotente, readback y evidencia.

## Aprendizajes técnicos convertibles a Academia
1. **Auth real ≠ selector de rol.**
2. **Usuario ≠ email obligatorio.**
3. **Perfil/tipo de acceso forma parte de la identidad.**
4. **Credencial de contacto ≠ credencial de acceso.**
5. **Continuidad de credenciales es parte de la migración.**
6. **Dedupe de identidad requiere llave estable.** No nombre ni username global aislado.
7. **Claims con scopes canónicos.** tenant/proyecto/rol/persona.
8. **ShopperId exacto.** No inferir acceso por coincidencia visual.
9. **Fail-closed.** Conflicto/ausencia → HOLD/revisión.
10. **Export/import, no conexión legacy.**
11. **Import no equivale a éxito sin readback.** El caso real cerró 91/91.
12. **Provider oculto tras adapter.** La UX no enseña detalles técnicos innecesarios.
13. **Deploy condicionado.** Hosting solo se ejecuta después del gate de identidad requerido.
14. **Evidencia remota.** Deploy no equivale a cierre sin browser-auth, entrypoint y proof verificados.

## Manuales/checklists a actualizar
1. Manual de acceso: Tipo de acceso + Usuario + Contraseña.
2. Manual de recuperación/cambio de contraseña.
3. Manual de roles/permisos y scopes.
4. Manual Shopper: identidad única, historial propio y disponibles.
5. Checklist soporte: namespace, usuario, identity provider, rol, tenant, proyecto, shopperId.
6. Errores frecuentes: namespace equivocado, usuario en HOLD, perfil sin vínculo, cuenta sin proyecto, sesión expirada.
7. Validación: conflicto → revisión humana.
8. Manual técnico/admin: export seguro, dedupe, hash import, no-overwrite, readback y deploy condicionado.
9. Caso práctico Corte6: 91 identidades importadas/readback y un Hosting DEV one-shot remoto PASS.

## Notificaciones / rutas
- Admin/Ops: acceso seguro + troubleshooting.
- Shopper: ingreso, recuperación, disponibilidad y conflicto de identidad.
- Cliente: ingreso y alcance.
- Superadmin: namespaces, adapter, claims/scopes, holds y readback.
- No anunciar producción antes de cutover aprobado.

## Gate pedagógico pendiente
El cierre técnico ya pasó. Falta validación visual humana con credenciales TyA existentes; solo después se documenta Corte6 como FROZEN/APROBADO.

## Reusable vs TyA
- **Reusable CXOrbia:** Auth detrás de adapter, username visible, namespaces, mínimo privilegio, scopes, hash import, no-overwrite, readback y deploy condicionado.
- **Exclusivo TyA:** credenciales legacy, proyecto `cinepolis`, Agosto HN HOLD.
- **Claude/prototipo:** login/registro focalizado solo si aparece P0 visual reproducible; provider/email técnico no visible.
- **Sin impacto Claude:** inventarios source-safe, cifrado, import/readback y gates/provider evidence.

## Estado seguro
Corte6 previo: claim writes5 + Rules release1 + Hosting DEV1/1. Continuidad: Auth imports91/readback91; password resets0; deletes0; Firestore data0; Rules0; Hosting adicional1; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false; credenciales crudas0.
