# Academia — impacto Corte 6 Auth/RBAC + Rules + Hosting DEV

**Fecha:** 2026-07-30  
**Estado:** Corte6 técnico PASS; pendiente validación visual humana autenticada; no producción.

## Objetivo
Registrar aprendizajes reutilizables del gate real de identidad, permisos y publicación DEV sin exponer seguridad técnica innecesaria en la UI normal.

## Resultado real que debe quedar reflejado
- Firebase Auth real y claims sustituyen al selector visual de rol como autoridad de acceso.
- 5 cuentas existentes fueron normalizadas de forma fail-closed: cliente2 + shopper3 con vínculo exacto.
- Shopper sin vínculo exacto no se corrigió por inferencia.
- Rules canónicas de visita disponible usan `status` y conservan compatibilidad `estado` legacy.
- Hosting DEV fue desplegado una sola vez sobre el sitio existente y verificado en `/index-backend-dev.html`.
- No se creó nuevo Firebase/Hosting y no hubo Firestore data writes en Corte6.

## Contenido obligatorio por rol
### Admin / Operativo
- autenticación real vs selección visual de rol;
- tenant y proyecto autorizados;
- cómo identificar conflicto de acceso sin ampliar permisos silenciosamente;
- diferencia entre usuario Auth, perfil shopper y referencia HR;
- validación esperada: operar solo dentro del alcance autorizado.

### Shopper
- ingreso con cuenta autorizada;
- vínculo de identidad por `shopperId`, sin exponer IDs técnicos en curso normal;
- por qué solo aparecen proyectos/visitas permitidos;
- visita disponible no equivale a visita asignada;
- si falta una visita: solicitar revisión, no crear otra identidad ni cambiar rol localmente.

### Cliente
- ingreso autenticado;
- visibilidad limitada al proyecto autorizado;
- no confundir acceso cliente con acceso administrativo;
- escalamiento cuando falte acceso.

### Superadmin
- scopes tenant/proyecto;
- revisión de claims y conflictos;
- mínimo privilegio;
- nunca inferir permisos por nombre/email/coincidencia visual;
- diferencias entre permiso real del API y dependencias adicionales de una herramienta CLI.

## Aprendizajes técnicos convertibles a material de Academia
1. **Auth real ≠ selector de rol.** El rol visual puede cambiar la experiencia, pero no autoriza al proveedor.
2. **Claims con scopes canónicos.** `tenantId` y `projectId/projectIds` deben representar el modelo real; un alias viejo no es equivalente.
3. **Identidad shopper exacta.** El vínculo `shopperId`/perfil evita deduplicaciones o permisos por nombre.
4. **Fail-closed.** Una cuenta incompleta queda en revisión; no se amplía acceso para “hacer que funcione”.
5. **CLI vs API.** Un CLI puede requerir permisos adicionales para prechecks. Antes de ampliar IAM, separar dependencia de herramienta de permiso realmente requerido por el servicio.
6. **Hosting exact-static vs rewrite.** Firebase Hosting atiende contenido estático exacto antes del rewrite; por eso un entrypoint explícito puede ser correcto aunque `/` sirva otro archivo estático.
7. **Verificación por evidencia.** Deploy no equivale a éxito hasta comprobar release/version, estado FINALIZED y contenido remoto esperado.

## Manuales/checklists a actualizar
1. Manual de acceso/login: Firebase Auth como identidad real; selector local no es autorización.
2. Manual de roles/permisos: tenant/proyecto determinan alcance.
3. Manual Shopper: identidad única, historial propio y disponibles autorizadas.
4. Checklist soporte: cuenta, rol, tenant, proyecto y vínculo shopper antes de escalar.
5. Errores frecuentes: cuenta válida sin proyecto, shopper sin vínculo exacto, sesión expirada, permiso insuficiente.
6. Validación: conflicto → revisión humana, nunca ampliación automática.
7. Manual técnico/admin: distinguir dependencia CLI de permiso proveedor; preferir mínima superficie de permisos.
8. Manual DEV: usar el entrypoint canónico validado y no convertir alias raíz en P0 si la ruta oficial funciona.

## Notificaciones / rutas
- Ruta Admin/Ops: microlección de acceso seguro y troubleshooting.
- Ruta Shopper: ingreso seguro + disponibilidad de visitas.
- Ruta Cliente: alcance por proyecto.
- Superadmin: claims/scopes, IAM mínimo, diagnóstico fail-closed.
- Novedad de producto solo después de validación DEV humana y aprobación; no anunciar producción antes del cutover.

## Estado operativo para Academia
URL técnico de validación DEV documentado internamente:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProjectId=cinepolis`

No incluir emails/passwords/tokens en manuales, capturas públicas o chat.

## Reusable vs TyA
- **Reusable CXOrbia:** Auth real, mínimo privilegio, scopes tenant/proyecto, shopperId exacto, conflicto a review, CLI vs API, exact-static vs rewrite y verificación remota.
- **Exclusivo TyA:** tenant `tya`, proyecto `cinepolis`, scopes viejos `tya`/`tya-piloto`, Agosto HN HOLD.
- **Claude/prototipo:** no requiere cambio hasta que la visual autenticada pruebe P0.
- **Sin impacto Claude:** runners, requests, release/version IDs y evidencia source-safe.

## Estado seguro
Corte6: Auth claim writes5 sobre usuarios existentes; usuarios nuevos/password/deletes0; Firestore data writes0; Rules release1 verificada; Hosting DEV1/1; Storage/HR/legacy0; pagos/Make/Gemini0; merge=false; producción=false; PII/secrets crudos0.
