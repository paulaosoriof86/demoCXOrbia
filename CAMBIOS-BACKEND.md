# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-15 20:05 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_SOURCE_ONLY_PASS__LEGAL_V0_3_COUNSEL_PACKAGE_SNAPSHOT_SOURCE_ONLY_PASS__GO_LIVE_35__NO_PRODUCTION`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`; reset histórico único consumido; toda continuación `passwordResets=0`; sin acceso/reconcile/recovery histórico.

Request08 run `31909354336` / job `95071998299`: STOP fail-closed `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Request consumido, no rerun.

## Autoridad legal durable previa

Cadena técnica preservada:
- `c3f8fc362a4b2dddb0a19fa3327170f87b5f9eed`;
- `09092fec7e95d6ccc33aefb780bffdc0b81ff1a0`;
- `0602d6ca0f64280222a4b1522b36f3be77c65c87`.

Gate `31913700755` / `95082399402` SUCCESS; gate PR `31913704247` SUCCESS. Aceptación exact-identity/versioned/human-only/provider-ACK/fail-closed preparada; bridge no activado; provider/Auth/Firestore/legal writes reales `0`.

## V0.2 no-code / rebrand-safe preservada

Vigentes como antecedentes y decisiones humanas:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`;
- `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md`;
- `app/docs/DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md`;
- base V0.1.

No hardcode de datos TyA/país/proyecto/rebrand/contactos/proveedores/evidencias. Domicilio registrado residencial recuperado permanece restringido y separado de `publicLegalAddress`.

## Bloque 2026-08-15 — V0.3 consolidada + publicación legal inmutable

### Nuevos archivos

1. `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`  
   Commit `3c60a280c25b7651f091bc9007863dc1cd887f55`.

2. `tools/qa/verify-i3-legal-publication-snapshot-source-only.mjs`  
   Commit `17d992115765ee1616cec199141dd911155c27e8`.

3. `app/docs/CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`  
   Commit `e7b7dc00b75d79b78a0016377a5a3fea73e70d48`.

4. `app/docs/PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`  
   Commit `64266aa3e8be726a2e896163069827be652af1ce`.

5. `.github/workflows/cxorbia-phase-a-live-checkpoint.yml` extendido, sin crear workflow nuevo.  
   Commit `768a1b43c10a054a254cfc2bd295aacdeae64c92`.

6. Source lock del bloque:
   `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md`.

### Regla estructural nueva

Se separan explícitamente:

`tenantLegalProfile mutable no-code`
→ `snapshot de publicación inmutable con solo valores públicos aprobados`
→ `render canónico UTF-8/LF`
→ `SHA-256 después del render`
→ `receipt humano ligado a legalVersion + contentDigest`.

Así, editar datos no-code no reescribe contratos/aceptaciones históricas. Un cambio material se evalúa y puede generar nueva versión/reaceptación. El rebranding conserva evidencia histórica. Placeholders sin resolver no pueden publicarse. Domicilio registrado restringido y proveedores deshabilitados no entran al documento público automáticamente.

### V0.3 jurídica

V0.3 consolida V0.1+V0.2 como una única candidata de revisión profesional. Mantiene marcadores `LEGAL_REVIEW_REQUIRED` por GT/HN/transversales y está explícitamente `NOT_APPROVED / NOT_PUBLISHED`.

El paquete de abogado concentra:
- Guatemala `GT-01..GT-08`;
- Honduras `HN-01..HN-06`;
- transversales `X-01..X-06`;
con respuestas esperadas `APROBADO SIN CAMBIO`, `CAMBIO REQUERIDO`, `NO APLICA` o `REQUIERE DOCUMENTO/HECHO ADICIONAL`.

## Gate técnico

HEAD fuente `768a1b43c10a054a254cfc2bd295aacdeae64c92` pasó `CXOrbia Phase A Live Execution Checkpoint`:
- run `31921002582`;
- job `95100754570`;
- conclusión `SUCCESS`;
- paso nuevo de snapshot legal no-code/inmutable `SUCCESS`.

Decisión: `PASS_I3_LEGAL_PUBLICATION_SNAPSHOT_NOCODE_IMMUTABLE_SOURCE_ONLY`.

## Investigación legal de soporte

Se verificaron únicamente fuentes oficiales/primarias como base de revisión: Decreto 47-2008, Decreto 67-95, Decreto 57-2000 y Código de Comercio art. 382 en Guatemala; la Iniciativa 6464 continuaba en discusión en julio de 2026. Para Honduras: Decreto 149-2013, Acuerdo Ejecutivo 41-2014, Decreto 161-2000, Ley sobre Justicia Constitucional/habeas data y fuentes IAIP que siguen identificando protección general de datos como anteproyecto. Esto no sustituye revisión profesional.

## Seguridad / efectos reales

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; password resets `0`; historical access/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; `/app/modules` cambios `0`; `/app/core` cambios `0`; product entrypoint activation `0`; deploy `0`; merge=false; producción=false.

## Clasificación

- **Reusable CXOrbia / sucesor de marca:** perfil legal mutable → snapshot público inmutable → digest post-render → receipt por versión/digest.
- **Exclusivo TyA:** contenido/decisiones GT/HN y valores del tenant, sin hardcodearlos.
- **Claude/prototipo:** futura superficie no-code de publicación legal, perfiles, proveedores y evidencias; no parcheada desde backend.
- **Academia:** debe diferenciar configuración editable de documento publicado/inmutable cuando el provider real quede activo.
- **Sin impacto Claude inmediato:** CI/verificador/source lock/paquete jurídico.

## Porcentaje y pendiente

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

Siguiente gate humano:
`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.

Solo después podrá abrirse:
`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.
