# CAMBIOS BACKEND — PASS source/static + contrato del Laboratorio

**Fecha:** 2026-08-04  
**Estado:** `PASS_COMPOSITION_SOURCE_STATIC__PASS_LAB_SOURCE_CONTRACT__CLOUD_V7_1_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 1. Objetivo

Adelantar la validación técnica del Laboratorio Admin/Operaciones + Shopper mientras Cloud corrige exclusivamente el frontend V7.2.

No se tocaron `app/app.js` ni `app/styles/layout.css`.

## 2. Cambio realizado

Se amplió:

`tools/release/cxorbia-phase-a-complete-composition-source-static-runner.mjs`

para ejecutar en una sola corrida source-only:

1. `tools/qa/tya-phase-a-complete-composition-source-gate.mjs`;
2. `tools/qa/tya-dev-scenario-lab-source-contract-gate.mjs`.

La evidencia del segundo gate se incorpora al mismo artifact del perfil source/static.

## 3. Ejecución controlada

- request: `phase-a-composition-plus-lab-source-contract-20260804-01`;
- target HEAD inmutable: `646a05a0f54cf33236b2e1e30122d8c52f30d2a1`;
- request commit: `6d5abeb4cea8541f12a3851601dbaae681f50ab7`;
- workflow run: `30971991900`;
- job: `92198142580`;
- artifact: `8916850770`;
- artifact digest: `sha256:75953c600b68450a11cfac6667ac5b5cfa8eceea5c94a6a0856850a501e77dd8`;
- commit status: success.

Decisiones:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
PASS_TYA_DEV_SCENARIO_LAB_SOURCE_CONTRACT
```

## 4. Composición source/static

- blobs base: 53/53;
- adicionales: 4/4;
- overrides: 5/5;
- assets faltantes: 0;
- scripts duplicados: 0;
- secretos: 0;
- módulos y navegación por rol: PASS;
- ReportKit y dependencias fijadas: PASS;
- repositorio sin delta después del gate.

Advertencias ya conocidas y no bloqueantes:

- P1 overlay A+B superseded;
- P1 PDF puede omitir gráficas;
- P2 Excel básico.

## 5. Contrato del Laboratorio

PASS comprobado para:

- cinco perfiles exactos;
- orden de estados Auth→cleanup;
- política `AUDIT-*` fail-closed;
- prohibición de PII, legacy y direct DB insert;
- límites máximos de entidades temporales;
- fingerprints antes/después;
- cleanup exclusivo por IDs del mismo run;
- P0 ante fallo de cleanup;
- schema de evidencia alineado;
- marker de controlled runner;
- prohibición de falsos PASS de escenario o cleanup;
- cero secretos/PII en contratos.

Fingerprints:

- contrato runner: `abb99df067511217075307d606e4538fda9f2c1696afe894349af0deb182831d`;
- schema evidencia: `c45da08721a99da09cb8a2ee2095786498e555366b0cdab3db131aeb7201da43`.

## 6. Advertencias del mapa de rutas

No bloqueantes:

- `miperfil` usa una fuente distinta de `app/modules/shopper-perfil.js`;
- `misvisitas` usa una fuente distinta de `app/modules/shopper-extra.js`;
- `aprendizaje` usa una fuente distinta de `app/modules/aprendizaje.js`;
- `cert` usa una fuente distinta de `app/modules/certificaciones.js`.

La composición global sí comprobó que las cuatro rutas están registradas. El pendiente es corregir el mapa de archivos esperado del gate para eliminar warnings de nomenclatura antes del runtime final.

## 7. Solicitud consumida

La solicitud quedó:

- `enabled: false`;
- `status: consumed_pass`;
- `allowedExecutions: 0`.

No puede reejecutarse accidentalmente.

## 8. Estado seguro

- navegador/runtime: 0;
- credenciales: 0;
- provider reads/writes: 0;
- datos `AUDIT-*`: 0;
- Hosting/Cloud Run: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge/producción: 0.

## 9. Clasificación

- **Reusable CXOrbia:** runner combinado, schema, fingerprints y cleanup.
- **Exclusivo TyA:** release slice Admin/Operaciones + Shopper.
- **Cloud/prototipo:** sin cambios; V7.2 sigue frontend-only.
- **Academia:** evidencia reproducible del diseño de pruebas.
- **Sin impacto producción:** source-only.
