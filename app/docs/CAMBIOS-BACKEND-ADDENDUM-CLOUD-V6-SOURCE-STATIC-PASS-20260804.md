# CAMBIOS BACKEND — Cloud V6 source/static PASS

**Fecha:** 2026-08-04  
**Estado:** `PASS_CLOUD_V6_SOURCE_STATIC_WITH_DOCUMENTED_WARNINGS__VISUAL_HOLD__NO_DEPLOY__NO_PRODUCTION`

## 1. Alcance ejecutado mientras Cloud prepara V7

Se continuó el macrobloque `CORE-OPERATIONS-SHOPPER-RELEASE-CANDIDATE` sin esperar el delta visual Cloud V7 y sin invadir su alcance frontend.

Se ejecutó exclusivamente el perfil controlado:

`PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC`.

No se usaron navegador, credenciales, provider reads/writes, deploy, merge o producción.

## 2. Primera ejecución y causa exacta

- request: `cloud-v6-source-static-rebase-20260804-01`;
- commit de solicitud: `782026e524d66addad41ef0f78fd3b30e3af1422`;
- run: `30955103361`;
- resultado: FAIL con un único blocker.

Blocker:

`DEV_LAB_SOURCE_CONTRACT_INVALID:controlledRunnerEvidenceRequired`.

Causa:

El laboratorio generaba correctamente el código mediante template string:

`BLOCKED_${state}_AWAITING_CONTROLLED_RUNNER`

pero el gate source/static exigía observar literalmente:

`BLOCKED_SCENARIO_EXECUTED_AWAITING_CONTROLLED_RUNNER`.

Clasificación: `TEST_HARNESS_OR_GOVERNANCE`; no fue fallo funcional del producto.

## 3. Correctivo

Se modificó `app/core/dev-scenario-lab.js` para declarar y utilizar una constante literal observable:

`CONTROLLED_RUNNER_REQUIRED_CODE='BLOCKED_SCENARIO_EXECUTED_AWAITING_CONTROLLED_RUNNER'`.

El laboratorio continúa fail-closed:

- no inventa ejecución;
- no inventa cleanup;
- no crea datos;
- exige evidencia del runner controlado;
- conserva fingerprints y contrato de ingestión.

También se actualizó el blob exacto en:

`app/docs/MANIFEST-PHASE-A-COMPLETE-COMPOSITION-V6-OVERLAY-20260804.json`.

Commits:

- código: `d2e08d16971fe1065ced06a34e7fbab58bb93c9f`;
- manifest: `b9050ad4c46b0356095e670ba677c47b214b287d`.

## 4. Reejecución comprobada

- request: `cloud-v6-source-static-marker-fix-20260804-02`;
- request commit: `c10e112d4fea4d05bed9873abcefee7f3d4a1c60`;
- target HEAD inmutable: `b9050ad4c46b0356095e670ba677c47b214b287d`;
- workflow run: `30955339976`;
- artifact: `8910775999`;
- artifact digest: `sha256:81bdb9e161e16f0239ec30f10aa42948b6b81892ec4ed6d65b0c1e1b09d7bacc`;
- commit status: success.

Decisiones:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
```

## 5. Verificaciones PASS

- manifest base: 53/53 blobs exactos;
- archivos adicionales V6: 4/4 blobs exactos;
- overrides V6: 5 exactos;
- assets locales faltantes: 0;
- scripts duplicados: 0;
- load order: PASS;
- módulos y navegación Admin/Shopper/Cliente: PASS;
- ReportKit PDF/XLSX/PPTX: PASS source contract;
- dependencias Firebase/SheetJS/Mammoth fijadas: PASS;
- secretos detectados: 0;
- laboratorio visible: PASS source contract;
- falsa ejecución de escenario: ausente;
- falso cleanup: ausente;
- delta del repositorio después del gate: 0.

## 6. Advertencias no bloqueantes

1. `P1_SUPERSEDED_AB_OVERLAY_LOADED`;
2. `P1_PDF_CHART_EXPORT_DEBT`;
3. `P2_XLSX_PRESENTATION_DEBT`.

No existe P0 source/static.

## 7. Qué sigue en paralelo

Mientras Cloud termina V7 se puede preparar, sin ejecutar todavía:

- contrato del runner real de escenarios;
- matriz de acciones UI Admin/Operaciones y Shopper;
- fingerprint ampliado;
- cleanup exacto;
- schema de evidencia y capturas;
- gate de ingestión del laboratorio.

El deploy permanece bloqueado hasta que el delta visual V7 sea auditado, aprobado y empalmado. Después será obligatorio actualizar el overlay y volver a ejecutar source/static sobre el HEAD visual final.

## 8. Estado seguro

- Hosting/Cloud Run: 0;
- navegador/runtime: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 9. Clasificación

- **Reusable CXOrbia:** marcador observable, manifest overlay y gate source/static.
- **Exclusivo TyA:** composición V6 y release slice Admin/Operaciones + Shopper.
- **Cloud/prototipo:** V7 visual pendiente.
- **Academia:** diferencia entre comportamiento dinámico correcto y observabilidad estática verificable.
- **Sin impacto producción:** no deploy ni provider interaction.
