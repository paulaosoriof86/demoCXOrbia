# SOURCE LOCK — ITERATION 3 · LEGAL V0.3 COUNSEL REVIEW + IMMUTABLE NO-CODE SNAPSHOT SOURCE-ONLY PASS · 2026-08-15

**Estado:** `PASS_I3_LEGAL_V0_3_COUNSEL_PACKAGE_AND_PUBLICATION_SNAPSHOT_SOURCE_ONLY__HUMAN_REVIEW_PENDING__NO_PROVIDER_IO__GO_LIVE_35`

## 1. Carril y autoridad

Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`.

Este lock complementa y preserva el source lock técnico:
`SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.

No reabre I1/I2 ni el histórico I3 congelado.

## 2. Histórico y request08 preservados

Historical exact Shopper: run `31906391682`, PASS congelado. Reset histórico único ya consumido. Toda continuación: `passwordResets=0`; cero credential access/reconcile/recovery histórico.

Request08: run `31909354336`, job `95071998299`, STOP fail-closed `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; request consumido y no se reejecuta.

## 3. Delta source-only de este bloque

Cadena de commits:

- `3c60a280c25b7651f091bc9007863dc1cd887f55` — `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`.
- `17d992115765ee1616cec199141dd911155c27e8` — `tools/qa/verify-i3-legal-publication-snapshot-source-only.mjs`.
- `e7b7dc00b75d79b78a0016377a5a3fea73e70d48` — `app/docs/CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`.
- `64266aa3e8be726a2e896163069827be652af1ce` — `app/docs/PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`.
- `768a1b43c10a054a254cfc2bd295aacdeae64c92` — extensión focal del workflow canónico para verificar el snapshot legal no-code/inmutable.

No se creó workflow nuevo.

## 4. Resolución estructural no-code

Se cerró la tensión entre configuración legal editable y evidencia contractual inmutable mediante tres capas:

1. **Perfil legal mutable no-code** — `tenantLegalProfile` conserva valores administrables por tenant/proyecto bajo autoridad provider y auditoría.
2. **Snapshot de publicación inmutable** — al publicar, se resuelven únicamente valores públicos aprobados y se congelan junto con la revisión del perfil/proveedores/proyecto aplicables.
3. **Contenido y aceptación inmutables** — se renderiza el documento canónico UTF-8/LF, se calcula SHA-256 después del render y el receipt humano referencia `legalVersion + contentDigest`.

Consecuencias:
- cambiar correo, nombre visible u otra configuración no reescribe silenciosamente un acuerdo ya aceptado;
- un cambio material puede producir nueva versión y reaceptación;
- el rebranding no destruye evidencia histórica;
- placeholders sin resolver nunca son publicables;
- el domicilio residencial registrado restringido nunca se autopublica;
- proveedores deshabilitados nunca se presentan como receptores actuales.

## 5. V0.3 jurídica consolidada

`CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md` sustituye V0.1/V0.2 **solo como candidata de revisión**, manteniéndolos como antecedentes documentales.

Estado V0.3:
`COUNSEL_REVIEW_CANDIDATE__NOT_APPROVED__NOT_PUBLISHED__NO_PROVIDER_MATERIALIZATION__NO_ACCEPTANCE__NO_PRODUCTION`.

No contiene valores específicos TyA como constantes runtime ni publica NIT, correo o domicilio privado. Los placeholders representan campos que deberán resolverse desde el snapshot provider-authoritative únicamente después de revisión jurídica, aprobación humana y gate de materialización.

Los marcadores `LEGAL_REVIEW_REQUIRED` son intencionales. Hasta su cierre V0.3 no es publicable ni provider-authoritative.

## 6. Paquete profesional GT/HN

`PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md` concentra preguntas codificadas:
- Guatemala `GT-01` a `GT-08`;
- Honduras `HN-01` a `HN-06`;
- transversales `X-01` a `X-06`.

El abogado puede responder `APROBADO SIN CAMBIO`, `CAMBIO REQUERIDO`, `NO APLICA` o `REQUIERE DOCUMENTO/HECHO ADICIONAL`, evitando revisión genérica sin acción concreta.

## 7. Gate canónico

HEAD source verificado: `768a1b43c10a054a254cfc2bd295aacdeae64c92`.

`CXOrbia Phase A Live Execution Checkpoint`:
- run `31921002582`;
- job `95100754570`;
- conclusión `SUCCESS`;
- nuevo paso `Verify I3 immutable no-code legal publication snapshot source contract`: `SUCCESS`;
- I1/I2/frozen-I3/overlay-aware/durable-legal/current-checkpoint: `SUCCESS`.

Decisión del nuevo verificador:
`PASS_I3_LEGAL_PUBLICATION_SNAPSHOT_NOCODE_IMMUTABLE_SOURCE_ONLY`.

## 8. Efectos reales

Provider credentials/reads/writes: `0/0/0`.
Firestore/Auth/legalContent/legalAcceptance writes: `0/0/0/0`.
Historical credential access/reset/reconcile: `0/0/0`.
HR/Storage/Rules/Make/Gemini/pagos: `0`.
`/app/modules` cambios: `0`.
`/app/core` cambios: `0`.
Product entrypoint activation: `0`.
Deploy: `0`.
Merge: `false`.
Producción: `false`.

## 9. Estado jurídico vigente

La investigación oficial usada para preparar la revisión confirma como referencias de trabajo, sujetas a interpretación profesional:
- Guatemala: Decreto 47-2008; Decreto 67-95; Decreto 57-2000; Código de Comercio art. 382; Iniciativa 6464 aún tratada como iniciativa en discusión en julio de 2026.
- Honduras: Decreto 149-2013; Acuerdo Ejecutivo 41-2014; Decreto 161-2000; Ley sobre Justicia Constitucional/habeas data; fuentes IAIP que aún identifican la protección general de datos como anteproyecto.

Estas referencias no convierten el borrador en opinión legal ni sustituyen abogado local.

## 10. Clasificación

- **Reusable CXOrbia / sucesor de marca:** perfil mutable no-code → snapshot inmutable → digest post-render → receipt humano por versión/digest.
- **Exclusivo TyA:** hechos del Operador, GT/HN, política inicial de retención y decisiones contractuales; valores no hardcodeados.
- **Claude/prototipo:** futuro UI debe editar perfil/proyecto y publicar mediante flujo controlado; no parcheado en este bloque.
- **Academia:** deberá enseñar diferencia entre configuración editable y versión legal publicada/inmutable, sin exponer detalles técnicos internos.
- **Sin impacto Claude inmediato:** verificador, CI, source lock y paquete jurídico.

## 11. Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**GO-LIVE 35% completado / 65% pendiente.** Este PASS source-only no suma I3 porque no existe todavía texto jurídicamente aprobado, publicación provider, aceptación humana ni E2E Admin/new Shopper.

## 12. Siguiente gate exacto

Primero:
`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.

Solo después de cerrar todos los marcadores jurídicos, generar versión publicable, snapshot/digest final y obtener aprobación humana podrá abrirse:
`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.

No request09/provider write/acceptance/deploy/merge/production antes de esos gates.
