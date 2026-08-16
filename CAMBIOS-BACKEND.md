# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-16 10:10 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_SOURCE_PASS__LEGAL_V0_3_COUNSEL_SNAPSHOT_SOURCE_PASS__PRECOUNSEL_PRIMARY_SOURCE_VERIFICATION_PASS__GO_LIVE_35__NO_PRODUCTION`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`; reset histórico único consumido; toda continuación `passwordResets=0`; sin acceso/reconcile/recovery histórico.

Request08 run `31909354336` / job `95071998299`: STOP fail-closed `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Request consumido, no rerun.

## Autoridad legal durable previa

Cadena técnica preservada:
- `c3f8fc362a4b2dddb0a19fa3327170f87b5f9eed`;
- `09092fec7e95d6ccc33aefb780bffdc0b81ff1a0`;
- `0602d6ca0f64280222a4b1522b36f3be77c65c87`.

Gate `31913700755` / `95082399402` SUCCESS; gate PR `31913704247` SUCCESS. Aceptación exact-identity/versioned/human-only/provider-ACK/fail-closed preparada; bridge no activado; provider/Auth/Firestore/legal writes reales `0`.

## V0.3 consolidada + publicación legal inmutable

Archivos vigentes:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`;
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`;
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json`;
- `tools/qa/verify-i3-legal-publication-snapshot-source-only.mjs`;
- `app/docs/CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`;
- `app/docs/PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`;
- `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md`.

Regla estructural:
`tenantLegalProfile mutable no-code → snapshot de publicación inmutable → render canónico UTF-8/LF → SHA-256 post-render → receipt humano ligado a legalVersion + contentDigest`.

Gate source V0.3/snapshot: HEAD `768a1b43c10a054a254cfc2bd295aacdeae64c92`, run `31921002582`, job `95100754570`, SUCCESS. Reconciliación posterior HEAD `1bf82ad949be12ac6bc2327eed0b2f40c38985b3`, run `31921159197`, job `95101127823`, SUCCESS.

## Bloque 2026-08-16 — pre-counsel primary-source verification

### Archivos creados

1. `app/docs/MATRIZ-PRE-REVISION-JURIDICA-TYA-V0.3-FUENTES-PRIMARIAS-20260816.md`  
   Commit `8c3d03b610494b343d8fe0848a8779598eaa3134`.

2. `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.3-PRECOUNSEL-PRIMARY-SOURCE-VERIFICATION-PASS-20260816.md`  
   Commit `7f923b7929f755313ce44918eaae330e29603e62`.

### Objetivo

Reducir hechos que el abogado no necesita redescubrir sin usar investigación como sustituto de opinión profesional. La matriz clasifica todos los códigos `GT-01..GT-08`, `HN-01..HN-06`, `X-01..X-06` en:
- `SOURCE_CONFIRMED_FACT`;
- `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED`;
- `COUNSEL_DECISION_REQUIRED`.

### Hallazgo adicional

Fuente oficial del Tribunal Superior de Cuentas de Honduras confirma **Decreto 149-2014, Ley sobre Comercio Electrónico**. Se incorpora como referencia adicional de `HN-02`, junto con Decreto 149-2013 y Reglamento 41-2014. No se declara que la existencia de esas normas haga suficiente automáticamente la mecánica de aceptación UI.

### Búsqueda read-only previa a pedir trabajo manual

- Google Drive: no se recuperó dictamen/revisión profesional V0.3 GT/HN.
- Gmail: búsqueda TyA/T&A + abogado/legal/contrato/NDA/confidencialidad/términos/revisión, excluyendo GitHub, no recuperó respuesta de counsel sobre la candidata vigente.

Por tanto el gate de revisión profesional sigue abierto.

### Interpretación de autorización

`autorizado, continuemos` autoriza este bloque source-only. No se registra como aprobación legal final de V0.3, consentimiento, provider materialization, request09, Admin/new Shopper, deploy, merge o producción.

## Claude / prototipo

No se modificó UI desde backend. Futuro bloque frontend autorizado debe empalmar:
- `configuracion.js`: Legal y cumplimiento provider-authoritative; perfil mutable separado de versiones publicadas;
- `administrabilidad.js`: auditoría de cambios sin datos restringidos y retiro de demo/local solo tras provider real;
- proyectos: Evidencias y privacidad;
- integraciones: Provider Registry;
- marca/white-label: displayName/estado registral separado de IP/licenciante;
- gate legal visible: texto completo, versión, casillas no premarcadas, nunca `#bnOk` como aceptación.

## Seguridad / efectos reales

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; password resets `0`; historical access/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; `/app/modules` cambios `0`; `/app/core` cambios `0`; product entrypoint activation `0`; deploy `0`; merge=false; producción=false.

## Pendiente real

Counsel GT/HN/X debe resolver los códigos del paquete; después se incorporan cambios, se eliminan marcadores, se genera versión publicable y Paula aprueba humanamente el texto final. Solo entonces podrá abrirse provider materialization/aceptación y Admin → único Shopper nuevo.

## Clasificación

- **Reusable CXOrbia / sucesor de marca:** matriz de revisión primaria y patrón perfil mutable → snapshot inmutable → digest → receipt.
- **Exclusivo TyA:** hechos/decisiones GT/HN del tenant; valores no hardcodeados.
- **Claude/prototipo:** sin cambio frontend en este bloque; superficies futuras documentadas.
- **Academia:** impacto editorial diferido hasta provider legal real.
- **Sin impacto Claude inmediato:** verificación normativa, búsquedas read-only, source lock y documentación.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

Gate vigente:
`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.
