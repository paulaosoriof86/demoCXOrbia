# CAMBIOS BACKEND — Corrección arquitectura legacy vs backend canónico

**Fecha:** 2026-07-29  
**Estado:** `ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_READONLY_INVENTORY_ACTIVE`

## Qué se corrigió
- Se corrigió la interpretación que trataba `cxorbia-backend-dev` como “base vieja/excluida”.
- La base/plataforma legacy a retirar es TyA Consultores actual; de ella solo se recuperan datos útiles limpios.
- `cxorbia-backend-dev` queda clasificado como backend DEV canónico de CXOrbia con TyA como primer tenant.
- `cxorbia-tya-dev-260729-c4` queda clasificado como sandbox técnico Corte 4, no destino de materialización.
- Se preserva el Hosting público actual para el cutover final; no se cambia URL por rutina.

## Archivos creados/tocados
- `app/docs/ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md`.
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`.
- `app/docs/PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`.
- `app/core/backend-config.js`: se elimina la exclusión errónea de `cxorbia-backend-dev`, se identifica backend canónico vs sandbox y se mantiene `enabled=false`/writes deshabilitados.
- `tools/qa/cxorbia-canonical-backend-readonly-inventory.mjs`.
- `.github/workflows/cxorbia-canonical-backend-readonly-inventory.yml`.
- `.github/cxorbia-firebase-requests/canonical-backend-readonly-inventory.json`.
- evidencia `app/docs/evidence/CANONICAL-BACKEND-READONLY-INVENTORY-LATEST.*`.

## Evidencia ya obtenida
Primer inventario read-only:
- projectId `cxorbia-backend-dev`;
- Auth users=17;
- custom claims existentes: `isDev`, `projectId`, `projectIds`, `role`, `shopperId`, `tenantId`, `tenantIds`, `tenants`;
- Firestore root `tenants`=1;
- provider writes=0;
- sin valores sensibles exportados.

El inventario se amplió para recorrer subcolecciones antes de concluir qué entidades ya están materializadas en Firestore.

## Impacto Phase A
- Evita reconstruir TyA en otro Firebase.
- Corte 5 pasa a ser materialización **incremental de faltantes**, no recreación completa.
- Refresh legacy se limita a shoppers/certificaciones nuevas o actualizadas; visitas continúan HR-first.

## Seguridad
- Firestore/Auth/Storage/HR writes: 0.
- Hosting/deploy: 0 en este bloque.
- Producción/merge: false.
- Make/Gemini/pagos: 0.

## Clasificación
- Reusable CXOrbia: sí.
- Exclusivo TyA: identidades de proyectos/legacy/Hosting.
- Claude/prototipo: preservar fixes core; no nueva candidata.
- Academia: estrategia de migración incremental y cutover.
- Sin impacto Claude: inventario provider read-only.

## Siguiente gate
`INVENTARIO READ-ONLY RECURSIVO → MAPA YA EXISTE/FALTA → DELTA LEGACY SHOPPERS+CERTIFICACIONES → CONTINUAR PHASE A`.
