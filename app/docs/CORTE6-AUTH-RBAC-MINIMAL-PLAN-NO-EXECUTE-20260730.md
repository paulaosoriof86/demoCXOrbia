# Corte 6 — Auth/RBAC minimal plan — NO EXECUTE

Fecha: 2026-07-30

## Estado
`PREPARED_NO_PROVIDER_WRITES`.

Este plan existe porque el preflight de Corte 5 demostró que no es seguro publicar PII real en el Hosting DEV sin Firebase Auth/RBAC. No crea otro Firebase ni Hosting y no consume el redeploy ya autorizado.

## Evidencia ya conocida
- Backend canónico: `cxorbia-backend-dev`.
- Auth inventory previo: 17 usuarios.
- Claim keys agregadas observadas: `isDev`, `projectId`, `projectIds`, `role`, `shopperId`, `tenantId`, `tenantIds`, `tenants`.
- Las keys Phase A actuales `personaType`, `scope`, `permissionsVersion` no aparecen en ese inventario agregado; por tanto no existe evidencia de usuarios ya alineados al shape nuevo.
- `firestore.rules` vigente usa roles históricos `super/admin/ops/coordinador/cliente|client/shopper`.
- Taxonomía Phase A nueva usa `tenantAdmin/projectAdmin/financeAdmin/certificationAdmin/clientAdmin/clientViewer/shopper` + `personaType/scope/permissionsVersion`.
- `app/app.js` maneja roles visuales/sesión local; no ejecuta Firebase sign-in.
- `backend-config-preview-dev.js` exige Firebase Auth para el preview protegido.

## Riesgo a evitar
No activar solo una parte. Es inseguro:
- escribir claims nuevos mientras Rules siguen interpretando solo roles viejos;
- desplegar Rules nuevas mientras los usuarios siguen con claims incompatibles;
- exponer PII a un selector de rol local;
- incrustar contraseña/token/service account en Hosting;
- crear usuarios duplicados si los 17 existentes corresponden a personas válidas.

## Secuencia mínima propuesta
1. **Inventario Auth read-only sanitizado**: conteos por provider/role/tenant/shape, sin UID/email/nombre en repo.
2. **Matriz de reconciliación en memoria**: usuario existente → persona real → rol técnico Phase A → tenant/project/country/shopper scope. Conflictos a HOLD; nunca por nombre solamente.
3. **Rules Phase A exactas** para las colecciones canónicas realmente materializadas: tenant, shoppers, project parent, periods, visits, certifications, liquidations y demás rutas Phase A; writes siguen bloqueados salvo acciones autorizadas por corte posterior.
4. **Claims exactos** solo para identidades confirmadas; reutilizar usuarios existentes cuando corresponda.
5. **Login Firebase real**: Auth del proveedor gobierna la sesión; la UI traduce claims a persona/rol visible. Sin principal válido → fail-closed.
6. **Protected-read smoke por rol** antes del Hosting: Admin/Operativo, Shopper propio y Cliente scope; lectura ajena debe fallar.
7. **Reutilizar el mismo Hosting DEV** `cxorbia-backend-dev.web.app` y consumir el único redeploy ya autorizado solo después del protected-read PASS.
8. **Validación visual humana con datos reales**.
9. Freeze y continuación a sync/evidencias; producción sigue aparte.

## Política de compatibilidad
La taxonomía nueva es la dirección canónica. Cualquier compatibilidad temporal con roles históricos debe ser explícita, acotada a DEV, auditada y con fecha de retiro; no se mantiene por inercia.

## Pendiente de resultado read-only
El refresh read-only Auth fue solicitado mediante el inventario canónico ampliado. Al momento de crear este documento no existe todavía un run/status observable; no se inventan conteos nuevos.

## Qué requiere futura autorización
Solo cuando el plan exacto esté cerrado:
- cambios reales de Firebase Auth/claims;
- deploy de Rules si corresponde;
- integración/login runtime si implica cambio funcional;
- después, usar el **redeploy Hosting DEV ya autorizado y aún no consumido**.

No se debe volver a pedir autorización para crear Hosting/Firebase ni repetir datos.

## Estado seguro
Auth writes=0; Rules deploy=0; Hosting deploy=0; Firestore data writes=0; Storage/HR/legacy writes=0; pagos=0; merge=false; producción=false; PII cruda repo/artifacts=0.
