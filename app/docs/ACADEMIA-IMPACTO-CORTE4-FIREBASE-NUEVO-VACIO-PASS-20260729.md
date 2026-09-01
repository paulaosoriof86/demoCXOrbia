# Academia — impacto Corte 4 Firebase nuevo/vacío PASS

**Fecha:** 2026-07-29  
**Estado:** `NEW_EMPTY_FIREBASE_DEV_VERIFIED_C4`

## Qué debe enseñar Academia

Corte 4 permite explicar con un caso real que estos conceptos son gates diferentes y no deben confundirse:

1. **Proyecto creado:** existe una identidad Google Cloud/Firebase nueva.
2. **IAM:** una credencial válida no puede leer un proyecto si no tiene permiso sobre ese recurso.
3. **Identidad verificada:** el runner confirma projectId/display name/estado mediante lectura provider.
4. **Vacío verificado:** no basta ver una consola vacía; se comprueban apps, Auth, Firestore, Storage y Hosting de forma source-safe.
5. **Infraestructura provider-default:** Firebase puede provisionar recursos propios como un Hosting `DEFAULT_SITE`; eso no equivale a datos de negocio ni a un deploy del usuario.
6. **Web App:** registrar una app web es un gate de configuración separado y todavía pendiente.
7. **Auth bootstrap:** una identidad temporal DEV para probar lectura protegida no equivale al Auth/RBAC completo del producto.
8. **Firestore:** crear/inicializar la base es distinto de materializar documentos de TyA.
9. **Rules read-only:** deben autorizar lectura y bloquear create/update/delete.
10. **Smoke `CX.data`:** debe demostrar `source=firestore`, `empty=true`, `fallbackUsed=false`, interfaz preservada y writes=0.
11. **Materialización:** ocurre después, en Corte 5, con dry-run/idempotencia y no forma parte de este PASS.

## Errores y diagnóstico para manuales

### Credencial válida ≠ permiso IAM

La service account era estructuralmente válida, pero no podía ver el proyecto nuevo hasta recibir rol `Viewer`.

### Consola vacía ≠ vacío integral probado

La captura visual confirmó cero apps, pero el gate independiente verificó además Auth, Firestore, Storage y Hosting.

### `DEFAULT_SITE` ≠ contaminación

El verificador inicialmente trató el sitio Hosting administrado por Firebase como una señal no vacía. La corrección separa infraestructura provider-default de `USER_SITE` y releases/deployments reales.

### Gate defectuoso ≠ backend contaminado

La consulta Auth count-only inicial era incompatible con el contrato del endpoint. El hallazgo se corrigió en el verificador y no se atribuyó falsamente al proyecto.

## Resultado que debe aparecer en material académico

- proyecto nuevo: `cxorbia-tya-dev-260729-c4`;
- identidad verificada: PASS;
- vacío integral: PASS;
- apps: 0;
- Auth users: 0;
- Firestore databases: 0;
- Storage buckets: 0;
- Hosting: 1 `DEFAULT_SITE` provider-managed, sin señal de contenido/despliegue;
- provider writes de probes/verificación: 0;
- producción: no;
- materialización: no.

## Rutas por rol

- **Admin técnico:** entender gates de proyecto/IAM/configuración/Rules y cuándo detenerse.
- **Admin operativo:** entender que backend vacío/verificado no significa que los datos TyA ya estén importados.
- **Shopper/Cliente:** sin cambio de ruta todavía; Corte 4 no debe mostrarles integraciones como activas antes del smoke/read-only real.

## Notificaciones y copy

- No mostrar “Firebase conectado” solo porque proyecto e IAM estén listos.
- No mostrar “datos migrados” porque el backend esté vacío/verificado.
- Mostrar estados honestos: `proyecto verificado`, `vacío verificado`, `configuración pendiente`, `lectura pendiente`, `materialización pendiente`.

## Clasificación

- **Reusable CXOrbia:** patrón de verificación nueva/vacía y distinción infraestructura provider-default vs datos/materialización.
- **Exclusivo cliente:** projectId de TyA y su secuencia de activación.
- **Claude/prototipo:** sin cambio funcional inmediato; solo copy/UX si el smoke visual posterior demuestra un hallazgo.
- **Academia:** este documento.
- **Sin impacto Claude:** verifier, workflow y estados sanitizados internos.

## Siguiente contenido académico

Después del siguiente gate documentar: Web App DEV, Auth bootstrap temporal, creación Firestore, Rules read-only, smoke `CX.data`, rollback y diferencia entre lectura activa y materialización de Corte 5.
