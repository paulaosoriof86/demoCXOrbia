# CXOrbia - Seed piloto V58 parcialmente escrito por reglas pendientes

Fecha: 2026-07-01 03:27 local
Rama: `release/cxorbia-tya-rc-20260630`

## Resultado del intento

El intento de carga del seed piloto ficticio V58 validó correctamente Auth DEV y no imprimió secretos.

Validaciones OK:

- Schema validator OK.
- Seed validator OK.
- Loader validator OK.
- Credencial local validada contra Firebase Auth DEV.
- No se hizo deploy.
- No se tocó producción.
- No se tocó Orbit.
- No se cargaron datos reales.

## Escrituras realizadas

El loader logró escribir 3 de 7 documentos ficticios DEV:

- `tenants/tya/projects/julio-pilot`
- `tenants/tya/projects/julio-pilot/visits/visit-lab-001`
- `tenants/tya/shoppers/shopper-lab-001`

## Escrituras bloqueadas por reglas Firestore

Firestore devolvió `PERMISSION_DENIED` para 4 de 7 documentos:

- `tenants/tya`
- `tenants/tya/projects/julio-pilot/periods/2026-07`
- `tenants/tya/projects/julio-pilot/applications/app-lab-001`
- `tenants/tya/shopperStats/shopper-lab-001`

## Diagnóstico

La autenticación ya no es el bloqueo principal. El bloqueo actual es cobertura de reglas Firestore para el modelo V58:

- Tenant root permite escritura solo a super, pero el loader usa admin TyA.
- Falta cobertura para `periods` bajo proyecto.
- Falta cobertura para `applications` bajo proyecto.
- Falta cobertura para `shopperStats` bajo tenant.

## Siguiente paso seguro

Preparar parche de `firestore.rules` para cubrir el modelo V58 y validar estáticamente.

No publicar reglas Firestore DEV hasta autorización explícita de Paula, porque publicar reglas cuenta como deploy aunque sea solo DEV.

## Impacto frontend

Ninguno.

No se tocaron:

- `/app/modules`.
- `app/index.html`.
- `app/index-backend-dev.html`.
- UI/prototipo.
