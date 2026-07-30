# CAMBIOS-BACKEND.md

## 2026-07-29 — Estado vigente: legacy refresh PASS + visit identity crosswalk 201/210 + identidad real bloqueada como requisito de producto

La lectura vigente y prevalente de este archivo es:

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-LEGACY-R17N-20260729.md`;
- `app/docs/ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

Estado actual resumido:
- `cxorbia-backend-dev` es el backend DEV canónico y se reutiliza;
- `tya-plataforma` es el legacy actual a retirar y Hosting/URL a preservar para cutover;
- refresh legacy shoppers/certificaciones read-only: PASS, leído directamente del proyecto Firebase actual `tya-plataforma`, writes=0;
- 149 shoppers únicos / 78 certificaciones útiles;
- visit-identity crosswalk autorizado contra `cxorbia-backend-dev`: 201/210 refs HR resueltas; 9 pendientes; 571/616 visitas con identidad exacta; 45 sin evidencia histórica exacta; 0 conflictos;
- el primer 0/210 fue falso negativo del gate por rechazar espacios en `sourceSheet/hrRowId`; causa raíz corregida y rerun v2 PASS;
- `source-safe` protege repo/log/evidencia, pero la plataforma final debe conservar y mostrar identidad real a roles autorizados;
- R17N previo debe reconstruirse con el crosswalk 201/210 antes de solicitar writes;
- writes/imports/deploy/producción continúan en 0.

El bloque histórico de “Firebase nuevo/vacío Corte 4” queda conservado en addenda como trazabilidad, pero no es la ruta activa de materialización.

## Clasificación vigente
- **Reusable CXOrbia:** separación PII-backend vs artefacto source-safe, stable-key migration, evidencia transaccional, RBAC, no-overwrite y review de conflictos.
- **Exclusivo cliente:** TyA `tya-plataforma`, HR Cinépolis, 210 refs → 201 resueltas / 9 pendientes.
- **Claude/prototipo:** sin nueva candidata; no reabrir V182; al existir perfil real canónico, UI autorizada no debe mantener `Shopper protegido` como identidad permanente.
- **Academia:** privacidad por rol ≠ anonimización; perfil real, HR reference, Auth y certificación son capas distintas.
- **Sin impacto Claude:** workflows/read-only evidence/hashes.

## Estado seguro
Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; merge=false; producción=false; pagos/lotes/Make/Gemini=0.

## Histórico
La trazabilidad detallada de bloques previos permanece en `app/docs/CAMBIOS-BACKEND-ADDENDUM-*.md`, commits y PR #7. Los estados históricos que excluían `cxorbia-backend-dev` quedaron superados por la corrección arquitectónica vigente.
