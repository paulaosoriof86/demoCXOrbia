# CAMBIOS-BACKEND.md

## 2026-07-29 — Estado vigente: canonical backend recuperado + legacy refresh/R17N PASS

La lectura vigente y prevalente de este archivo es:

- `app/docs/CAMBIOS-BACKEND-ADDENDUM-LEGACY-R17N-20260729.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

Estado actual resumido:
- `cxorbia-backend-dev` es el backend DEV canónico y se reutiliza;
- `tya-plataforma` es legacy a retirar y Hosting/URL a preservar para cutover;
- refresh legacy shoppers/certificaciones read-only: PASS, writes=0;
- 149 shoppers únicos / 78 certificaciones útiles;
- R17N no-execute + idempotencia: PASS;
- 210 refs HR siguen HOLD porque stable ID/code crosswalk contra shoppers existentes dio 0/210; nombre está prohibido como dedupe;
- siguiente gate: crosswalk read-only por identidad exacta de visita ya materializada, sin leer visitas legacy.

El bloque histórico de “Firebase nuevo/vacío Corte 4” queda conservado en sus addenda como trazabilidad, pero **no es la ruta activa de materialización**.

## Clasificación vigente
- **Reusable CXOrbia:** stable-key migration, source mirrors dedupe, fill-missing-only, transactional identity crosswalk, idempotence antes de writes.
- **Exclusivo cliente:** TyA legacy `tya-plataforma`, HR Cinépolis y sus 210 refs protegidas.
- **Claude/prototipo:** sin nueva candidata; no reabrir V182; no solucionar identidad desde UI.
- **Academia:** perfil vs referencia HR vs Auth vs certificación; conflictos a review.
- **Sin impacto Claude:** workflows/read-only evidence/R17N hashes.

## Estado seguro
Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; merge=false; producción=false; pagos/lotes/Make/Gemini=0.

## Histórico
La trazabilidad detallada de bloques previos permanece en `app/docs/CAMBIOS-BACKEND-ADDENDUM-*.md`, commits y PR #7. Los estados históricos que afirmaban que `cxorbia-backend-dev` debía excluirse quedaron superados por `ADDENDUM-CORRECCION-ARQUITECTURA-LEGACY-VS-CXORBIA-BACKEND-DEV-20260729.md` y no deben reactivar la ruta de Firebase nuevo/vacío.
