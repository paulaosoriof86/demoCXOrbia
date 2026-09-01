# CAMBIOS BACKEND — ADDENDUM CORTE 4 AUTH / REVALIDACIÓN

Fecha: 2026-07-29

## Bloque completado

- Firebase Authentication quedó inicializado desde Console en `cxorbia-tya-dev-260729-c4` y se detuvo en el panel de proveedores sin habilitar Email/Password, Google ni otro proveedor.
- Se reejecutó el bootstrap DEV read-only de forma idempotente mediante `.github/cxorbia-firebase-requests/corte4-bootstrap-execute.json`.
- Commit de disparo: `e524b968c0003c27351d5d5826e21ffcf7cbfdbe`.
- Evidencia de statuses:
  - `cxorbia/corte4-bootstrap-execute = success`;
  - `cxorbia/c4exec-BOOTSTRAP_DEV_READONLY_COMPLETED_C4 = success`;
  - `cxorbia/c4bootstrap-w0-webtrue-dbtrue-authtrue-rulestrue = success`.
- Revalidación: Web App=true, Firestore=true, Auth config=true, Rules=true, provider config writes=0.

## Impacto Phase A

Corte 4 supera el bloqueo de inicialización Auth. Provider bootstrap queda completado sin materializar datos TyA y sin crear usuarios.

## Gate siguiente demostrado

Las Rules desplegadas requieren principal autenticado con rol permitido y tenant. El proyecto conserva Auth users=0 y ningún proveedor habilitado. Por eso un smoke real de navegador no puede ejecutarse honestamente sin introducir un principal temporal.

No se crea usuario ni se habilita proveedor sin autorización específica porque el request consumido mantiene `authUserWrites=false`.

## Ruta mínima propuesta

`habilitar Email/Password DEV → crear 1 operador temporal con claims role=admin + tenantId=tya → smoke CX.data read-only sobre Firestore vacío → eliminar operador → deshabilitar Email/Password → verificar Auth users=0`.

Hosting DEV y validación visual quedan en gate separado.

## Seguridad

- Firestore document writes: 0.
- Auth users permanentes: 0.
- Storage writes: 0.
- Hosting deploy nuevo: 0.
- Imports/materialización: 0.
- HR/Make/Gemini/pagos/lotes/merge/producción: 0.

## Clasificación

- Reusable CXOrbia: principal temporal reversible para smoke protegido y bootstrap idempotente.
- Exclusivo cliente: Firebase DEV TyA y región `us-central1`.
- Claude/prototipo: sin tarea nueva salvo P0 reproducible posterior.
- Academia: separar inicialización Auth, proveedor, usuario temporal, claims y Auth/RBAC completo.
- Sin impacto Claude: provider bootstrap e IAM.
