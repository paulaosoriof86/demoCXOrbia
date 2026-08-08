# CAMBIOS BACKEND — C6 Shopper Identity Resolution HOLD

**Fecha:** 2026-08-05  
**Clasificación:** Reusable CXOrbia · Exclusivo TyA · Sin impacto visual Claude

## Archivos creados

- `tools/qa/cxorbia-c6-shopper-identity-resolution-review.mjs`;
- `app/docs/evidence/CORTE6-SHOPPER-IDENTITY-SOURCE-SAFE-RESOLUTION-HOLD-LATEST.json`.

## Archivos modificados

- `tools/qa/cxorbia-c6-human-login-shopper-identity-audit.mjs`: agrega modo `source_safe_resolution_review`;
- `app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`: pins del dispatcher y resolver;
- `.github/cxorbia-gate-requests/request.json`: source/static PASS consumido;
- `backend/config/corte6-human-login-shopper-identity-audit.json`: revisión consumida con HOLD;
- checkpoint, índice, PR #7 y addenda obligatorios.

## Source/static

```text
run=31055889684
job=92473179280
artifact=8950210279
digest=sha256:7d78d480b15b836ab98ded284a2bfca2b0ebe2517531c36825bc77159de915dd
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## Revisión read-only

```text
run=31056005286
job=92473531087
artifact=8950260575
digest=sha256:28bcefd758c53efa4357d0d4766488662c3b0701ce2ccfce551816c92d7edb88
HOLD_C6_SHOPPER_IDENTITY_RESOLUTION_REVIEW
```

## Resultado

- 340 perfiles revisados;
- 109 credenciales legacy;
- 101 mapeadas y 8 sin mapear;
- 21 Auth faltantes reconciliados como 13 mapeados + 8 sin mapear;
- plan primario no superpuesto de 340 filas;
- 110 holds generados por el resolver, de los cuales 109 son falsos `canonical_name_incomplete` por una base de apellido demasiado restrictiva;
- 1 colisión Auth real pendiente;
- Paula: 1 candidata Staff y 2 Shopper, todavía sin resolución técnica.

## Causa raíz

`RESOLVER_CANONICAL_NAME_BASIS_TOO_RESTRICTIVE`: después de enlazar por `shopperId`, el resolver no utilizó los campos de nombre completo o login técnico del perfil exacto. No es correcto interpretar los 109 holds como datos incompletos reales.

## Seguridad

Cero Auth/password/membership/Firestore/Rules/Storage/HR writes, deploy, Cloud Run, Make, Gemini, pagos, merge o producción. Sin PII, UID, tokens o credenciales exportadas.
