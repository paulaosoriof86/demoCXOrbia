# CAMBIOS-BACKEND.md

**Última actualización:** 2026-08-16 10:38 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_CONSUMED__LEGAL_DURABLE_SOURCE_PASS__LEGAL_V0_4_INTERIM_GOLIVE__MATERIALIZATION_PROVIDER_SOURCE_PASS__COUNSEL_DEFERRED_NONBLOCKING__GO_LIVE_35__NO_PRODUCTION_YET`

## Preservado

I1 PASS 15/15 e I2 PASS 20/20. Histórico I3 congelado desde run `31906391682`; reset histórico único consumido; toda continuación `passwordResets=0`; sin acceso/reconcile/recovery histórico.

Request08 run `31909354336` / job `95071998299`: STOP fail-closed `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo ni Auth/Firestore writes. Request consumido, no rerun.

## Autoridad legal durable previa

Source durable `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Aceptación exact-identity/versioned/human-only/provider-ACK/fail-closed preparada. Bridge no activado. Provider/Auth/Firestore/legal writes reales `0`.

Patrón no-code:
`tenantLegalProfile mutable → snapshot público inmutable → render UTF-8/LF → SHA-256 post-render → receipt humano por legalVersion/contentDigest`.

## Bloque 2026-08-16 — counsel diferido / V0.4 interina

Paula indicó que la plataforma no puede detenerse por indisponibilidad temporal del abogado. Se documentó counsel GT/HN como **diferido post-go-live**, sin afirmar revisión jurídica inexistente.

Archivos:
- `app/docs/DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md` — commit `66d1d99f19e32ae411fbf7ab1ed49c16a00ee296`.
- `app/docs/CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md` — commit `9eeea214a34a840b66c5ce1ba5fd2fb163b0abc1`.
- `app/docs/PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md` — commit `5032347c3cb54d2eb70c2e0e6d527feedd960546`.

Los códigos `GT-01..GT-08`, `HN-01..HN-06`, `X-01..X-06` permanecen vivos post-go-live. V0.4 no muestra marcadores internos al usuario ni afirma counsel, suficiencia universal de clic/firma, inexistencia de obligaciones HN o arbitraje universal individual.

## Bloque 2026-08-16 — materialización provider V0.4 SOURCE PASS

### Archivos creados/tocados

1. `backend/runtime/cxorbia-legal-publication-provider-v1.mjs` — commit `2c4f383868a41246677559790cfbb0ae2b12beb7`.
2. `tools/qa/verify-i3-legal-v04-materialization-source-only.mjs` — commit `211230564576478204101c60da2d17df3a268063`.
3. `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json` — commit `d17de93b0d858608d5c4f2f3b2f7e630e0fe5ef7`.
4. `.github/workflows/cxorbia-phase-a-live-checkpoint.yml` extendido, sin workflow nuevo — commit `27e220c78efa1198d92c2aa33a6c9d1978c060e5`.
5. `app/adapters/cxorbia-command-adapter-v1.js` — fix self-scoped de `legal.acceptance.record`, commit `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`.
6. `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md` — nuevo lock técnico.

### Presupuesto del futuro bootstrap DEV

Una sola ejecución create-only en `cxorbia-backend-dev`:
- Firestore `4`;
- legalProfile `1`;
- legalProvider registry `1`;
- legalContent/version `2`;
- legalAcceptance `0`;
- Auth `0`;
- passwordResets `0`;
- historical access/reconcile `0`;
- HR/Rules/Storage/Make/Gemini/pagos `0`;
- automaticAcceptance `false`;
- humanAcceptanceRequired `true`.

El provider source rechaza placeholders, marcadores internos residuales, falso counsel, domicilio restringido público, budget drift y colisiones. El readback provider queda preparado. Los valores TyA iniciales podrán viajar en el request exacto autorizado, pero después del ACK la autoridad será Firestore/provider no-code, no el request ni constantes runtime.

### Hallazgo/corrección de command boundary

El command adapter bloqueaba por rol a Shopper/Cliente antes de llegar a `legal.acceptance.record`. Se corrigió únicamente ese comando self-scoped, exigiendo `humanConfirmed=true`, `humanAcceptanceRequired=true` y `automaticAcceptanceForbidden=true`. La identidad efectiva continúa derivándose del Firebase ID token verificado por el provider. No se abrieron otros writes de Shopper/Cliente.

### Gate canónico

HEAD técnico `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`: `CXOrbia Phase A Live Execution Checkpoint` run `31959900456`, job `95196342385`, `SUCCESS`, incluido `Verify I3 V0.4 interim materialization provider source contract`.

## Infraestructura existente revisada

`CXOrbia Phase A Firestore Materialization Executor` existe, pero su ejecución actual está deliberadamente limitada a emulator. No se declarará DEV materializado usando ese carril sin extenderlo bajo gate exacto. No se creará workflow nuevo y no se reutilizará request08.

## No-code / datos TyA

Operador, identificación tributaria, contactos, dirección pública, países, retención, controversias, proveedores, branding/licenciante y evidencia por proyecto vivirán como configuración provider-authoritative editable. No se hardcodearon en el runtime.

## Claude / prototipo

No se modificó `/app/modules` ni `/app/core`. Sigue documentado:
- `configuracion.js`: Legal y cumplimiento no-code, perfil mutable vs versiones publicadas;
- `administrabilidad.js`: auditoría y retiro de autoridad local/demo tras provider real;
- proyectos: Evidencias y privacidad;
- integraciones: Provider Registry;
- marca/white-label: nombre visible/estado registral/licenciante separados;
- gate legal: texto completo, versión, casillas no premarcadas y acción humana.

## Seguridad / efectos reales del bloque

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; password resets `0`; historical access/reconcile `0`; HR/Rules/Storage/Make/Gemini/pagos `0`; product entrypoint activation `0`; deploy `0`; merge=false; producción=false; automaticAcceptance=false.

## Pendiente real

Siguiente gate:
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

Debe autorizar explícitamente el bootstrap V0.4 DEV de cuatro writes y el wiring/runtime DEV necesario. La aceptación seguirá siendo exclusiva del humano autenticado. Después se crea nueva continuación I3 Admin/new Shopper; request08 no se reutiliza.

## Clasificación

- **Reusable CXOrbia / sucesor de marca:** provider de publicación create-only, budget exacto, counsel diferido explícito, perfil mutable → snapshot → digest → receipt.
- **Exclusivo TyA:** V0.4 interina y valores iniciales que serán materializados como config, no runtime constants.
- **Claude/prototipo:** superficies futuras documentadas; cero parche UI desde backend en este bloque.
- **Academia:** counsel pendiente vs aprobación; aceptación humana/versionada; no-code vs versión inmutable.
- **Sin impacto Claude inmediato:** provider source, verificador, contrato, CI/source lock.

## Porcentaje

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**
