# ADDENDUM PREVALENTE — I3 B1 HUMAN FAIL / TRANSVERSAL SHOPPER FINDINGS — 2026-10-06

**ID:** `CXORBIA-I3-B1-HUMAN-FAIL-TRANSVERSAL-SHOPPER-20261006`
**Estado:** `FROZEN_PREVALENT_FOR_CURRENT_B1_REMEDIATION`
**Iteración:** `I3 — FUNCTIONAL CLOSURE`
**Bloque activo:** `B1`
**Zona horaria operativa:** `America/Guatemala (UTC-06:00)`
**Producción:** `DO_NOT_TOUCH`

## 1. Decisión humana

Paula emitió **FAIL B1** mediante revisión viva autenticada en DEV. El FAIL no abre B2 ni una nueva metodología. B1 permanece activo hasta corregir sus owners probados y repetir el carril exigido.

## 2. Corrección de alcance de la evidencia técnica

Run 1280 fue un **representative same-artifact live reproof** de identidades/superficies/read models, no un E2E completo de acciones. Probó Julissa Flores, Priscila López y Paula Osorio como representantes y verificó ausencia de cross-bleed, pero no ejecutó las acciones Agendar, lectura/ACK de Instructivo, Reprogramar ni su persistencia post-reload. Queda prohibido describir ese run como prueba funcional exhaustiva del shopper.

## 3. Hallazgos humanos preservados

### B1-HF-01 — FUNCTIONAL_DEFECT
- Autoridad existente: `OBS-09`, `OBS-10`, `VRM-144`, `VRM-165`
- Scope: `B1`
- Owner(s): `app/modules/midia.js`
- Evidencia/causa: Mi Día Agendar/Instructivo/Reprogramar all render data-cgo=misvisitas and the generic binder only calls router.nav(), so three distinct actions collapse to one navigation for every shopper.
- Acción: Replace navigation-only placeholders with state-aware action handoff/reuse of canonical Mis Visitas action owner; no duplicate business logic.

### B1-HF-02 — FUNCTIONAL_DEFECT
- Autoridad existente: `OBS-11`, `VRM-125`, `VRM-168`
- Scope: `B3_RETAINED_BLOCKS_B1_ACCEPTANCE`
- Owner(s): `app/modules/misvisitas.js`, `app/modules/documentos.js`, `app/core/backend-resources.js`
- Evidencia/causa: Instructivo lookup reads backendResources.list synchronously; when cache is not ready it returns no document and routes to Recursos. Reading is only persisted by the explicit 'Confirmo que lo he leído' ACK flow inside Mis Visitas; merely opening/closing Recursos cannot set instructiveReadAt. Julissa Agendar stays disabled while instructiveReadAt/cert state is incomplete.
- Acción: Make resource readiness deterministic, expose explicit read-ACK path, and real action E2E across representative shoppers.

### B1-HF-03 — FUNCTIONAL_DEFECT
- Autoridad existente: `OBS-11`, `VRM-168`
- Scope: `B3_RETAINED_BLOCKS_B1_ACCEPTANCE`
- Owner(s): `app/modules/misvisitas.js`, `app/modules/midia.js`
- Evidencia/causa: Scheduled state in Mis Visitas exposes Marcar realizada immediately and Mi Día does not show scheduled date nor switch its primary action by state. HR/platform scheduled date must be visible and Agendar must not remain the primary action once scheduled.
- Acción: Derive state/date from canonical visit facets; show scheduled date; use Reprogramar as applicable action; gate 'Visita realizada' by configured execution window/date rather than merely scheduled status.

### B1-HF-04 — FUNCTIONAL_DEFECT
- Autoridad existente: `OBS-14`, `OBS-15`, `VRM-036`, `VRM-171`
- Scope: `B4_RETAINED`
- Owner(s): `app/modules/cert.js`, `app/data/tya-certification-carryover-source-safe.js`
- Evidencia/causa: Julissa renders historical carryover as vigente while Priscila renders no published bank/no validated certification. This may be identity-specific evidence, but the UI wording and authority must be proven per shopper/project; no global Julissa assumption is allowed.
- Acción: Reprove carryover and bank authority for multiple shoppers, including Priscila, before declaring cross-shopper certification behavior.

### B1-HF-05 — VISUAL_DEFECT
- Autoridad existente: `OBS-18`, `OBS-19`, `OBS-20`, `VRM-165`, `VRM-174`
- Scope: `B5_RETAINED`
- Owner(s): `app/modules/beneficios.js`
- Evidencia/causa: Human checkpoint still shows weak hierarchy versus approved direction; historical rows are static and not drillable; deterministic oldest-to-newest ordering is not explicitly enforced.
- Acción: Recover approved benefits hierarchy, deterministic chronological ordering, and row detail drilldown.

### B1-HF-06 — FUNCTIONAL_DEFECT
- Autoridad existente: `OBS-41`, `VRM-151`, `VRM-174`
- Scope: `B5_B8_RETAINED`
- Owner(s): `app/modules/beneficios.js`, `app/adapters/tya-canonical-finance-read-model-v2.js`, `app/adapters/tya-financial-canonical-source-safe-adapter.js`
- Evidencia/causa: Human evidence shows rows at or before July 2026 still rendered pending/pendiente submitir and August 2026 pending, contradicting frozen historical financial cut.
- Acción: Apply frozen historical cut only from durable evidence; through Jul paid/conciled, Aug paid 2026-10-02, Sep only proven paid subset, Oct+ live.

### B1-HF-07 — VISUAL_DEFECT
- Autoridad existente: `OBS-05`, `OBS-06`, `OBS-23`, `VRM-054`, `VRM-099`, `VRM-165`
- Scope: `B2_RETAINED`
- Owner(s): `app/modules/operacion-extra.js`, `app/modules/shoppers.js`
- Evidencia/causa: Mi Perfil remains the simpler grid/card implementation rather than the requested recovered hierarchy/direction; historical records/detail behavior is not consistently drillable across shopper/admin.
- Acción: Recover approved profile hierarchy while preserving editable identity/country/banking governance; make applicable historical records open detail.

### B1-HF-08 — FUNCTIONAL_DEFECT
- Autoridad existente: `OBS-45`, `VRM-168`
- Scope: `TRANSVERSAL`
- Owner(s): `tools/qa/cxorbia-i3-phasea-representative-live-reproof.mjs`
- Evidencia/causa: Run1280 was representative/read-only: it sampled Julissa, Priscila, Paula and Admin but did not click/commit Agendar, Instructivo read ACK, Reprogramar, resource open/read, or verify post-action reload. It was over-described as full E2E.
- Acción: Replace acceptance wording and add real action E2E with provider ACK/readback/reload/cleanup on multiple shopper identities.

### B1-HF-09 — FUNCTIONAL_DEFECT
- Autoridad existente: `OBS-45`
- Scope: `TRANSVERSAL_PERFORMANCE`
- Owner(s): `app/adapters/tya-protected-auth-hr-authority-bridge-v2.js`, `app/adapters/tya-live-source-refresh-watch-v2.js`
- Evidencia/causa: Protected HR bridge can retry up to BOOT_MAX_ATTEMPTS=180 with delays capped at 2s, and backend.refresh invalidates authority then schedules full HR recomposition. Human checkpoint repeatedly remained on synchronization for many seconds/minutes.
- Acción: Bound and instrument revalidation, avoid unnecessary full recomposition after writes, preserve fail-closed semantics and exact HR authority.


## 4. Regla anti-pérdida

Estos hallazgos se anexan a las observaciones/findings ya existentes. **No consumen VRM-260** porque las causas materiales ya pertenecen a observaciones/VRM abiertos o reabiertos. Ningún bloque posterior podrá declararse PASS sin cerrar sus items retenidos.

## 5. Transversalidad

El fix de identidad B1 en `router.js/midia.js` consume el resolver canónico y no está hardcodeado a Julissa; sin embargo, la prueba ejecutada fue representativa, no exhaustiva de todos los shoppers. Toda nueva corrección de acciones debe ser genérica por `shopperId + projectId + periodId + visitId` y validarse en múltiples identidades, sin lógica especial de Julissa.

## 6. Siguiente acción exacta

`FIX_B1_TRANSVERSAL_MI_DIA_ACTION_SEMANTICS_AND_SYNC_GUARD__REAL_MULTI_SHOPPER_ACTION_E2E`

Primero corregir solamente los owners B1/cross-B1 demostrados. Después: source proof → DEV exacto → E2E de acciones real multi-shopper → checkpoint humano B1. Los hallazgos B2–B5/B8 quedan congelados y se consumen en su bloque natural; no desaparecen.

No producción.
