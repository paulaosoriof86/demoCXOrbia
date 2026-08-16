# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-16 12:18 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_MATERIALIZATION_PASS__RUNTIME_AND_HOSTING_DEV_DEPLOY_PASS__HUMAN_ACCEPTANCE_PENDING__GO_LIVE_35__NO_PRODUCTION`

## Preservado

I1 PASS `15/15`; I2 PASS `20/20`. Historical I3 run `31906391682` PASS congelado; reset histórico único consumido; toda continuación `passwordResets=0`; sin credential access/reconcile/recovery histórico.

Request08 run `31909354336` / job `95071998299` consumido/no rerun. Counsel GT/HN sigue `deferred_post_golive`, no aprobado.

Patrón no-code:
`tenantLegalProfile mutable → snapshot publicado inmutable → render UTF-8/LF → SHA-256 → receipt humano por identidad/version/digest`.

## Bloque previo — materialización REAL V0.4 en Firebase DEV

Gate: `PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Run `31961266066`; job materialización `95199496314`; validación `95199496265`; `PASS_COMMITTED_READBACK`.

Resultado exacto:
- Firestore `4` create-only;
- legalProfile `1`;
- Provider Registry `1`;
- legalContent/version `2`;
- legalContentId `tya-platform-master-terms`;
- legalVersion `tya-legal-bundle-v0.4-interim-golive-20260816`;
- digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`;
- legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- request `i3-legal-v04-dev-20260816-01` consumido/no retry;
- merge=false; producción=false.

Evidencia: `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json`.

Incidente previo ya cerrado: commit `491042ba6eef90701799fa0f8eed2a1b7c66a1c8`, run `31961173013`, YAML inválido antes de request/provider, cero jobs y cero writes. Se corrigió antes de ejecutar la materialización real.

## Bloque 2026-08-16 — deploy REAL runtime legal + Hosting DEV

### Autorización exacta

Gate recibido:
`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Alcance: actualizar/desplegar únicamente `cxorbia-live-hr-dev` y Hosting DEV de `cxorbia-backend-dev`; habilitar máximo `1` futuro receipt `legalAcceptance` solo después del clic humano de Paula; Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`; no bootstrap V0.4, request08, identidad histórica, autoaceptación, merge ni producción.

### Causa raíz detectada antes de desplegar

`backend/runtime/hr-live-service/server.mjs` ya importaba el runtime legal, pero el `Dockerfile` existente no copiaba `backend/runtime/hr-live-service/legal-runtime.mjs` ni `backend/runtime/cxorbia-legal-acceptance-provider-v1.mjs`. Desplegar así habría producido una imagen sin el handler legal requerido.

Corrección aplicada antes del build:
- `backend/runtime/hr-live-service/Dockerfile` — commit `54741f3d7cef9c601db2c77e2b5d1d778cc25c27`.

No se tocó `/app/modules`, `/app/core` ni production entrypoint.

### Carril reutilizado

No se creó workflow nuevo. Se reutilizó `.github/workflows/cxorbia-phase-a-live-hr-runtime-deploy-dev.yml` y se recondujo al gate I3, commit `9adc72ad573bc8a813b8b8ed4b63fdb9bb9f7e6a`.

Archivos de control:
- `backend/config/i3-legal-v04-runtime-deploy-dev-request.json` — request `i3-legal-v04-runtime-dev-20260816-01`, preparado commit `275cf08fe1711698921ea89e76b0abb9888a7913`, luego consumido;
- `backend/config/i3-legal-v04-runtime-deploy-dev-execute.json` — execute marker commit `bfe762da8afa0c46dc4e7bd09ec8183dac01b089`;
- `app/docs/evidence/ITERATION3-LEGAL-V04-RUNTIME-DEPLOY-DEV-LATEST.json` — evidencia sanitizada;
- `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-DEV-RUNTIME-DEPLOY-PASS-HUMAN-ACCEPTANCE-PENDING-20260816.md` — lock técnico vigente.

### Ejecución real PASS

Workflow: `CXOrbia I3 Legal V0.4 DEV Runtime Deploy`.

Run `31963932862`; job `95206055703`; `SUCCESS`.

Todos los pasos pasaron: gate one-shot, provider preflight read-only, build, update Cloud Run, smoke fail-closed sin aceptación, Hosting deploy, smoke del rewrite legal, provider post-readback y consumo del request.

Resultado:
- Cloud Run service `cxorbia-live-hr-dev` actualizado una vez;
- revision `cxorbia-live-hr-dev-00010-n78`;
- Hosting DEV desplegado una vez;
- DEV root `https://cxorbia-backend-dev.web.app`;
- V0.4/version/digest preservados;
- legalAcceptance writes durante deploy `0`;
- acceptance count `0 → 0`;
- futuro budget humano `1`;
- Auth writes `0`;
- passwordResets `0`;
- historicalCredentialAccess/reconciliation `0/0`;
- HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- merge=false;
- producción=false.

El request de deploy quedó `enabled=false`, `consumed=true`, `noAutomaticRetry=true`. **No rerun.**

### Runtime humano activo en DEV

Cloud Run quedó con:
- `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_ENABLED=true`;
- `CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_GATE=PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

El browser bridge del entrypoint DEV usa provider authority, Firebase ID token exacto, versión/digest Firestore, contenido completo, dos casillas no premarcadas y clic explícito. Sin acción humana no existe write. `localStorage/sessionStorage` no son autoridad legal.

## Claude/prototipo

No se parcheó ningún módulo UI desde backend. Sigue pendiente para el frontend/no-code definitivo:
- `configuracion.js`: Legal y cumplimiento provider-authoritative;
- `administrabilidad.js`: auditoría legal sin datos restringidos;
- proyectos: Evidencias y privacidad;
- integraciones: Provider Registry;
- marca: displayName/estado registral/licenciante;
- gate legal definitivo: versión completa + confirmaciones humanas.

El runtime DEV ya está operativo; Claude no debe duplicar esa lógica ni mover autoridad a localStorage.

## Academia

El contenido futuro debe distinguir claramente: materialización, deploy del runtime y aceptación humana son tres hechos diferentes. El deploy PASS no equivale a consentimiento. La aceptación sigue pendiente hasta que Paula actúe en UI y exista provider ACK/readback del receipt.

## Seguridad / efectos acumulados

Materialización previa: Firestore `4` exactos. Deploy actual: Cloud Run `1`, Hosting `1`, Firestore writes `0`. LegalAcceptance total sigue `0` antes del clic humano. Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`. No secretos ni domicilio restringido en repo. Production intacta. Merge=false.

## Pendiente real

Siguiente acción exacta:
`HUMAN_PAULA_LEGAL_ACCEPTANCE_UI_CLICK`.

Después: provider ACK/readback del único receipt autorizado → reload/new-tab → continuación I3 Admin/new Shopper sin request08 → Auth/claims/membership/profile/shopper/crosswalk exactos → login/reload/new-tab/segundo contexto.

## Clasificación

- **Reusable CXOrbia / sucesor de marca:** packaging seguro del runtime, gate humano exacto, deploy one-shot, provider readback, aceptación versionada/idempotente.
- **Exclusivo TyA:** V0.4, tenant `tya`, versión/digest y counsel diferido.
- **Claude/prototipo:** superficies no-code futuras documentadas; módulos sin parche.
- **Academia:** materialización ≠ deploy ≠ aceptación; aceptación humana/versionada.
- **Sin impacto Claude inmediato:** Cloud Run/Hosting executor, request consumption, evidence y source lock.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**
