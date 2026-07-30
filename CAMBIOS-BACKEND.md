# CAMBIOS-BACKEND.md

## 2026-07-30 — Estado vigente: HR actual 208 refs + identidad 208/208 + R17N FINAL 1,406 NO EXECUTE

Fuentes prevalentes:
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-R17N-FINAL-CURRENT-HR-IDENTIDAD-20260730.md`;
- `app/docs/ADDENDUM-IDENTIDAD-REAL-SHOPPER-PII-SOURCE-SAFE-VS-PLATAFORMA-20260729.md`;
- `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`.

Estado actual:
- `cxorbia-backend-dev` = backend DEV canónico; reutilizar;
- `tya-plataforma` = legacy actual a retirar + Hosting/URL pública final;
- el snapshot HR del 13-jul (210 refs) quedó superado por la HR actual hasta julio: 208 refs, +2/-4/206 intersección;
- crosswalk actual: 201/208 reuse existing, 7 inicialmente sin match transaccional;
- reconciliación real de 7: 2 legacy-profile create +5 HR-current profile create; 0 HOLD de identidad actual;
- identidad final debe ser real en la plataforma autorizada; source-safe solo sanitiza evidencia técnica;
- legacy refresh: 149 shoppers únicos, 120 create, 22 existing update HOLD, 7 HOLD; 78 certs, 77 create +1 HOLD;
- R17N FINAL no-execute: foundation16 + legacy profiles120 + HR profiles5 + certs77 + visits616 + liquidation controls572 = **1,406 exact ready writes**;
- idempotencia offline PASS;
- tenant update, 22 existing updates, 7 legacy holds, 1 cert hold, Agosto HN, deletes/pagos quedan fuera;
- writes/imports/deploy/producción siguen en 0.

Correcciones metodológicas:
- workflow offline ahora fail-closed por `job.status`, no por presencia de artefacto viejo;
- validación `hrImports` corregida al path bajo proyecto;
- R14C financiero viejo (210 shoppers) no se fuerza: se preservan 247 filas /196 links exactos por visitId /51 reviews.

## Clasificación vigente
- **Reusable CXOrbia:** freshness gate, identidad real + evidencia sanitizada, crosswalk transaccional, fail-closed e idempotencia.
- **Exclusivo cliente:** TyA/Cinépolis, `tya-plataforma`, HR 208 refs, 120+5 perfiles create, 77 certs.
- **Claude/prototipo:** no nueva candidata; validar identidad real solo después de materialización/smoke.
- **Academia:** snapshot vs fuente viva, privacidad técnica vs identidad operativa, stable-key y review.
- **Sin impacto Claude:** workflows/read-only evidence/hashes.

## Estado seguro
Firestore/Auth/Storage/HR/legacy writes=0; deletes=0; deploy=0; merge=false; producción=false; pagos/lotes/Make/Gemini=0.

## Histórico
Addenda anteriores permanecen como trazabilidad. Estados de 210 refs/9 pendientes quedan históricos y no deben reactivarse.
