# SOURCE LOCK CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-20  
**SYNC_EPOCH:** `CXORBIA-20260820-I5-EXISTING-CLEAN-PROJECT-PROMOTION-RESTORED-42`

## Destino canónico

- Repo: `paulaosoriof86/demoCXOrbia`
- Rama viva: `docs-tya-v6-v71-audit`
- PR: `#7` existente, draft/open/no merge
- Ref documental/operativa: HEAD vivo de la rama; no `main`, no nueva rama, no nuevo PR.

## Source lock funcional

Producto funcional validado:

`f9802fdd498934a8e7729fa5c7d18341bec1cd71`

I1–I4 permanecen `PASS/FROZEN`. Los commits I5 posteriores son QA/request/documentación y no sustituyen esta build.

## Contrato de promoción productiva vigente

Autoridad: `backend/config/cxorbia-production-promotion-contract.json` + `app/docs/SOURCE-LOCK-C6-PRODUCTION-PROMOTION-PASS-20260806.md`.

Topología autorizada:

- `strategy=PROMOTE_EXISTING_CLEAN_PROJECT`;
- proyecto: `cxorbia-backend-dev`;
- Hosting target: `cxorbia-dev`;
- Hosting site: `cxorbia-backend-dev`;
- URL aceptada para producción futura: `https://cxorbia-backend-dev.web.app`;
- Cloud Run: `cxorbia-live-hr-dev`, `us-central1`;
- `acceptCurrentIdentifiersAndUrlAsProduction=true`;
- `requiresSeparateProdFiles=false`;
- legacy como backend nuevo: prohibido.

El gate source-only histórico cerró `PASS_PRODUCTION_PROMOTION_CONTRACT_EXISTING_CLEAN_PROJECT`.

## Identidad de ambientes

`app/core/backend-config.js` fija:

- `canonicalBackendProjectId=cxorbia-backend-dev`;
- `migrationTargetProjectId=cxorbia-backend-dev`;
- `validationSandboxProjectId=cxorbia-tya-dev-260729-c4`;
- `newCleanProjectRequired=false`.

Por tanto `cxorbia-tya-dev-260729-c4` no es destino Phase A y `tya-plataforma` es legacy preservado hasta cutover.

## Evidencia Hosting exacta preservada

Run `32328316954`, artifact `9392151808`:

- `PASS_I3_11C_R3C_DEV_HOSTING_MATERIALIZATION_REMOTE_PARITY`;
- source exacto `f9802fdd498934a8e7729fa5c7d18341bec1cd71`;
- remoto `https://cxorbia-backend-dev.web.app`;
- `remoteExactByteParity=true`;
- 1 Hosting deploy;
- 0 provider/data/Auth/HR/Storage/Make/Gemini/payment writes.

## PREPROD adicional — NO CANÓNICO / NO EJECUTAR

`cxorbia-preprod-20260819` nunca fue creado. El request que lo introdujo queda consumido como evidencia histórica del desvío, pero no gobierna la continuación.

No crear ese proyecto, no solicitar Project Creator, no continuar `USER_AUTHENTICATED_PREPROD_PROJECT_CREATION_HANDOFF`.

## Frente vigente

`I5_EXISTING_PROJECT_PRECUTOVER_EVIDENCE_RECONCILIATION`

Reconciliar contra evidencia existente los seis gates del contrato de promoción. No reejecutar gates frozen salvo brecha terminal demostrada.

## Seguridad

0 recursos PREPROD adicionales creados; 0 deploy adicional en este bloque; 0 provider/data/HR/Auth/Firestore/Storage/Make/Gemini/payment writes; 0 merge; 0 producción. Legacy permanece intacto.
