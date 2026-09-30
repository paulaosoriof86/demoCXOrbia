# CXOrbia - Smoke read-only seed piloto V58 DEV

Fecha: 2026-07-01
Rama: `release/cxorbia-tya-rc-20260630`

## Archivo preparado

- `firebase/client-write-tools/smoke-cxorbia-v58-pilot-seed-read-dev.mjs`

## Objetivo

Validar en modo solo lectura que el seed piloto ficticio V58 quedó disponible en Firestore DEV después de publicar reglas V58 y reintentar la carga.

## Alcance

El smoke:

- Usa Auth DEV con credencial local ignorada.
- No imprime secretos.
- Lee los 7 documentos del seed `cxorbia-v58-julio-pilot-ficticio`.
- Verifica que todos respondan HTTP 200.
- No escribe Firestore.
- No elimina documentos.
- No toca Hosting.
- No toca producción.
- No toca Orbit.
- No usa datos reales.

## Documentos esperados

- `tenants/tya`
- `tenants/tya/projects/julio-pilot`
- `tenants/tya/projects/julio-pilot/periods/2026-07`
- `tenants/tya/projects/julio-pilot/visits/visit-lab-001`
- `tenants/tya/projects/julio-pilot/applications/app-lab-001`
- `tenants/tya/shoppers/shopper-lab-001`
- `tenants/tya/shopperStats/shopper-lab-001`

## Impacto frontend

Ninguno.

No se tocaron:

- `/app/modules`.
- `app/index.html`.
- `app/index-backend-dev.html`.
- UI/prototipo.

## Siguiente paso

Ejecutar PowerShell local con runner seguro que recupere credencial DEV sin imprimirla y corra el smoke read-only.
