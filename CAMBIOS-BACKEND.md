# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-16 11:12 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_V0_4_DEV_MATERIALIZATION_PASS__RUNTIME_SOURCE_WIRED__GO_LIVE_35__NO_DEPLOY_NO_PRODUCTION`

## Preservado

I1 PASS `15/15`; I2 PASS `20/20`. Historical I3 run `31906391682` PASS congelado; reset histórico único consumido; toda continuación `passwordResets=0`; sin credential access/reconcile/recovery histórico.

Request08 run `31909354336` / job `95071998299` consumido/no rerun. Counsel GT/HN sigue `deferred_post_golive`, no aprobado.

Patrón no-code:
`tenantLegalProfile mutable → snapshot publicado inmutable → render UTF-8/LF → SHA-256 → receipt humano por identidad/version/digest`.

## Bloque autorizado — materialización REAL V0.4 en Firebase DEV

Gate humano recibido:
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

### Carril/executor

Archivos creados/tocados:
1. `tools/migration/tya-i3-legal-v04-materialize-dev.mjs` — commit `1865af59781dd17c0053b1a7bd1b05680d5880b6`.
2. `tools/migration/tya-i3-legal-v04-request-control.mjs` — commit `b2ed739504af1227b8768fe69fc92b79531f7ff6`.
3. `.github/workflows/cxorbia-phase-a-firestore-materialization-executor.yml` — carril existente extendido/corregido, commit canónico pre-request `1545807324ae71df0ae31a863797243afd45b7c9`; **no workflow nuevo**.
4. `backend/requests/i3-legal-v04-materialization-dev.json` — request one-shot `i3-legal-v04-dev-20260816-01`, creación commit `5813cf50dbc8a2fd0cc69b18ecbc44caec45e64d`; luego consumido.
5. `app/docs/evidence/ITERATION3-LEGAL-V04-MATERIALIZATION-DEV-LATEST.json` — evidencia sanitizada.
6. `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-DEV-PASS-20260816.md` — lock técnico prevalente.

### Incidente declarado

Commit `491042ba6eef90701799fa0f8eed2a1b7c66a1c8`, run `31961173013`: `FAILURE`, cero jobs, por YAML inválido antes de request/provider. Efecto: provider IO `0`, Firestore/Auth `0`, deploy `0`. Se corrigió la causa antes de crear el request.

Pre-ejecución corregida: run `31961226214`, jobs `95199402826` y `95199402954`, SUCCESS; sin request todavía, por lo que ejecución provider correctamente omitida.

### Ejecución real

Run `31961266066`; job materialización `95199496314`; job validación `95199496265`; SUCCESS.

Evidencia:
- `status=PASS_COMMITTED_READBACK`;
- providerAttempted/providerAck/committed/readbackReady = true;
- Firestore writes `4` exactos create-only;
- legalProfile `1`;
- Provider Registry `1`;
- legalContent/version `2`;
- legalContentId `tya-platform-master-terms`;
- legalVersion `tya-legal-bundle-v0.4-interim-golive-20260816`;
- digest `58d16a736495065a7244f8018d95a1faa87eae9a00e36d7ffc65a41edd58f58d`;
- legalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance=false;
- deploy `0`, merge=false, producción=false;
- request consumido/noAutomaticRetry.

No volver a ejecutar este bootstrap.

## Runtime DEV provider-backed — SOURCE wired, sin deploy

Archivos:
- `backend/runtime/hr-live-service/legal-runtime.mjs` — provider current/read model + endpoint humano, hardening commit `aa33d746657c5e3e2b63fd1d3e9f5ca93e559db3`;
- `backend/runtime/hr-live-service/server.mjs` — routing dentro del servicio DEV existente, commit `2c91301ee5201e8aeb8d868af0de30c7021dd4b0`;
- `app/adapters/cxorbia-legal-runtime-http-v1.js` — bridge browser DEV, commit `8c579d707d9b16c42baab92d8ed6ca1237a84a9a`;
- `tools/qa/verify-i3-legal-acceptance-durable-source-only.mjs` — verificador runtime-aware, commit `90cd767da441e9ce1dc2ca84e67141c20a0ff0f9`;
- `app/index-backend-dev.html` — wiring solo DEV protegido, commit `c6e1e55d581f3eb15fc5bf430de4adb2de4e51ca`.

Reglas preservadas:
- Firebase ID token exacto; identidad derivada del provider;
- current legal/version/digest leídos de Firestore;
- fail-closed;
- no localStorage/sessionStorage como autoridad legal;
- texto legal completo;
- dos casillas no premarcadas + clic explícito;
- no aceptación automática;
- endpoint de receipt bloqueado por env gate hasta deploy autorizado;
- production `app/index.html` no tocado;
- `/app/modules` cambios `0`;
- `/app/core` cambios `0`.

## Gate canónico posterior al wiring

Run push `31961999583` sobre `c6e1e55d...`: I1/I2/frozen I3/durable legal/immutable publication/V0.4 materialization source PASS. Único FAIL: `DURABLE_PLAN_NOT_INDEXED` en current checkpoint, por omisión documental del addendum durable en el índice reducido. Se restauró la fuente en `00-INDICE...`; no implica reejecución provider.

## Claude/prototipo

No se parcheó UI de módulos. El comportamiento legal se montó mediante adapter y entrypoint DEV autorizado. Sigue pendiente para frontend/no-code definitivo:
- `configuracion.js`: Legal y cumplimiento provider-authoritative;
- proyectos: Evidencias y privacidad;
- integraciones: Provider Registry;
- marca: displayName/estado registral/licenciante;
- auditoría legal sin datos restringidos.

## Academia

Actualizar cuando el runtime DEV esté desplegado y probado: configuración vs versión publicada, aceptación humana/versionada, reaceptación material, counsel pendiente/completado, evidencias por proyecto y rebranding neutral.

## Seguridad / efectos reales acumulados del bloque

Único provider write autorizado ejecutado: Firestore `4` create-only. LegalAcceptance/Auth/passwordResets/historical/HR/Rules/Storage/Make/Gemini/pagos `0`. No secretos en repo. No domicilio residencial publicado. Deploy `0`; merge=false; producción=false.

## Pendiente real

Gate siguiente:
`PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME`.

Después: deploy DEV → readback browser autenticado → aceptación humana de Paula → 1 receipt exacto provider ACK → reload/new-tab → continuación I3 Admin/new Shopper.

## Clasificación

- **Reusable CXOrbia / sucesor de marca:** provider publication/read model, one-shot request, human receipt exacto, no-code/versionado.
- **Exclusivo TyA:** valores V0.4 materializados en tenant `tya`, no constantes globales.
- **Claude/prototipo:** entrypoint DEV + adapter; módulos sin parche.
- **Academia:** actualización futura al cerrar runtime real.
- **Sin impacto Claude:** executor, evidence, locks, request consumption.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**
