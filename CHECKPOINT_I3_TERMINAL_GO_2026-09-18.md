# CHECKPOINT TERMINAL I3 CUMULATIVO — CXORBIA RECOVERY — GO-LIVE

**Fecha:** 2026-09-18  
**Iteración:** I3 — Functional Closure  
**Estado:** **GO**  
**Autoridad durable:** `CXORBIA_I3_TERMINAL_CUMULATIVE_LOCK_2026-09-18.json`  
**SHA-256 del lock:** `8e6a70fe381b47c9c59f17cddc90d3e9514240b064cd12332eb1c598cf6a202d`

## Cierre material

I3 queda cerrado sobre una sola candidata acumulativa de Fase A, una sola source de producto, un solo build y un solo artifact certificado.

- Product source: `f836f38dc0ce3a48034ed8968220d5dece9d6629`
- Product tree: `5f860258fc74dd443379a8e2cdc28ae08962d41f`
- Control HEAD de certificación: `5ed9807f7b2b242c4bc4d1b13d4a2d5ee0a667c1`
- Control tree de certificación: `c72c52d2a59766821e73854476e5bd7bee28950a`
- Run terminal: **181**, ID `35342539795`, conclusión **success**
- Producción tocada: **NO**

La `MODULE_TRUTH_MATRIX` exhaustiva quedó en PASS con **20 dominios**, `allModulesMatch=true` y SHA-256 `babf4f3842869899a144f26a0c2a5185504c7c649041d4a0f1215207dea1d6d5`. El gate verifica blobs aprobados, presencia de owners cargados, ausencia de scripts duplicados, load order crítico y preservación de librerías no autoritativas.

## Cierre funcional I3

En el mismo run y sobre la misma source/build:

- HR fresh: **PASS**
- Regla de credenciales shopper `nombre.apellido / Nombre123*`: **PASS**
- Human lane real, no técnico: **PASS**
- Persistencia focal shopper: **PASS**, ACK remoto + fresh readback + replay idempotente
- Persistencia financiera focal: **PASS**, ACK remoto + fresh readback + replay idempotente
- Cleanup sintético: **PASS**
- Gate 20 visual: **PASS**
- Gate 20 semántico Shopper: **PASS**
- Gate 21 same-artifact fingerprint: **PASS**

Las excepciones de identidad sin evidencia exacta permanecen fail-closed por shopper y no bloquearon HR global, conforme al addendum prevalente de convergencia.

## Artifact certificado

- Artifact ID: `10545626714`
- Artifact name: `cxorbia-recovery-i3-single-source-certification-35342539795`
- GitHub digest: `sha256:e16144c78c5883e8254cf517f0054457b800fef913629e8937583ac34fb933e8`
- Source TAR SHA-256: `fd9eebe99d46c8ba18da079bee1eaf78186177df62891315dbe3885b1cea4d23`
- Build count: `1`
- Rebuild after certification: `false`

Gate 21:
- Artifact ID: `10546141659`
- Artifact name: `cxorbia-recovery-i3-gate21-35342539795`
- GitHub digest: `sha256:8590eef0d32e3f0f54ed6a2f1f24586cc8bd4e09fd7918c99a60c9e900574d16`
- Gate21 manifest SHA-256: `e2f5c93e62185e9df00f076629ca13e3af5e2c6f98c344b987c1d44b4667f4d7`

## DEV certificado

- Hosting release: `sites/cxorbia-backend-dev/channels/live/releases/1789733082019000`
- Hosting version: `sites/cxorbia-backend-dev/versions/00b425303930a46e`
- Hosting release time: `2026-09-18T12:04:42.019Z`
- Runtime revision: `cxorbia-live-hr-dev-00119-5jf`
- Runtime image digest: `sha256:502d2fecec771eb2eebb0d99c5dc91312d292f06808861b09eb904930a57b92e`
- Immutable runtime image: `gcr.io/cxorbia-backend-dev/cxorbia-live-hr-dev@sha256:502d2fecec771eb2eebb0d99c5dc91312d292f06808861b09eb904930a57b92e`

## Multiproyecto

La candidata certificada mantiene selección de proyecto explícita, `projectId` independiente del período, `routeSource`/`operationalSource` configurable y durable, ausencia de default global Cinépolis y capacidad contractual para crear el siguiente proyecto mediante configuración sin cambio de source. Cinépolis permanece únicamente como proyecto explícito de validación.

## Precedencia

Este checkpoint sustituye como autoridad de **current state** al checkpoint/lock terminal del 17-09, que permanece válido únicamente para su release histórica exacta `b94911a...`. También incorpora la corrección anti-desync Gate20/Gate21 y la integridad modular acumulativa del 18-09.

No reabrir I0, I1, I2 ni I3 salvo drift nuevo, concreto y reproducible.

## Siguiente acción exacta

**I4 — Immutable Production Replacement.**

Antes de tocar `https://tya-plataforma.web.app/` se requiere **una autorización explícita de Paula**. Con esa autorización:

1. promover exactamente el artifact certificado anterior, sin rebuild ni recomposición;
2. usar exactamente la imagen runtime inmutable certificada;
3. verificar Hosting/version, runtime/revision/digest, HR live, Admin E2E, Shopper E2E, postulación, asignación, KPIs, DOM/visual markers y ausencia de duplicados;
4. crear `PRODUCTION_LOCK`.

No se autoriza ningún build nuevo entre este checkpoint y producción.
