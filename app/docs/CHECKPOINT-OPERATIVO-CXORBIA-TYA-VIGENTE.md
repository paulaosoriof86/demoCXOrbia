# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `V6_EMPALMED__SOURCE_STATIC_PASS_WITH_WARNINGS__VISUAL_HOLD__CLOUD_V7_PENDING__NO_DEPLOY__NO_PRODUCTION`

## 1. Carril vigente

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- baseline acumulativa única;
- producción `tya-plataforma` intacta.

## 2. División de responsabilidades

- **Cloud:** frontend visual.
- **Codex:** únicamente empalme mecánico del delta exacto aprobado.
- **ChatGPT:** auditoría, gates, deploy DEV, runtime, laboratorio, cleanup, documentación y decisión de cutover.

## 3. V6 empalmada

- HEAD previo: `a2ccfb0c3709cad6f5e6a9c16dcb7f9293532d6e`;
- commit funcional: `f961253f18c388ae04619bb5175269015c8349c3`;
- SHA-256 candidata: `0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`;
- push a la rama viva: confirmado;
- deploy: 0.

Archivos V6 acumulados incluyen Login, responsive, export helper, wizard Regional, Ficha Shopper y shell visible del laboratorio.

## 4. Decisión visual

`HOLD_FRONTEND_VISUAL`.

La captura de escritorio no replica la referencia Emergent:

- el panel derecho se convirtió en portada/demo;
- aparecen marca CXOrbia, título genérico, accesos de validación y pie técnico;
- faltan campos de acceso en la composición visible;
- las tarjetas tienen exceso de altura/radio;
- la órbita es más rígida y pesada;
- no existe equivalencia visual binaria con Emergent.

Cloud V7 está trabajando un delta exclusivamente visual con:

- Emergent como autoridad visual;
- Orbit 360 como autoridad de estilo orbital;
- alcance principal limitado a `app/app.js` y `app/styles/layout.css`.

## 5. Gate posterior al empalme — cerrado PASS

El primer FAIL se explicó por:

1. blobs históricos modificados legítimamente por V6;
2. ausencia de `app/core/backend-dev-auth.local.js`;
3. falso positivo de secreto sobre el código de un scanner;
4. un marker de laboratorio construido dinámicamente que no era observable de forma literal por el gate.

Correctivos:

- manifest overlay V6 sin borrar la autoridad histórica;
- placeholder Auth local fail-closed sin secretos;
- secret scan diferenciado para archivos que definen patrones;
- source gate rebasado a manifest base + overlay;
- marker literal `BLOCKED_SCENARIO_EXECUTED_AWAITING_CONTROLLED_RUNNER`.

Reejecución:

- request `cloud-v6-source-static-marker-fix-20260804-02`;
- target `b9050ad4c46b0356095e670ba677c47b214b287d`;
- request commit `c10e112d4fea4d05bed9873abcefee7f3d4a1c60`;
- run `30955339976`;
- artifact `8910775999`;
- status success.

Decisiones:

```text
PASS_READONLY_POST_GATES
PASS_PHASE_A_COMPLETE_COMPOSITION_SOURCE_STATIC_GATE_WITH_DOCUMENTED_WARNINGS
```

Comprobado:

- base 53/53;
- adicionales V6 4/4;
- overrides V6 5/5;
- assets faltantes 0;
- scripts duplicados 0;
- secretos 0;
- módulos, navegación, ReportKit y pins PASS;
- contrato source del laboratorio PASS;
- repositorio intacto tras gates.

Advertencias no bloqueantes:

- overlay A+B superseded;
- PDF puede omitir gráficas;
- Excel mantiene formato básico.

## 6. Laboratorio

El shell V6 ya no marca `SCENARIO_EXECUTED` ni `CLEANUP_VERIFIED` sin ejecución real.

Actualmente:

- muestra `BLOCKED_AWAITING_CONTROLLED_RUNNER`;
- no inventa PASS;
- acepta evidencia únicamente por `CX.devScenarioLab.ingest(report)`;
- exige fingerprints y cleanup reales.

Mientras Cloud termina V7 se continúa source-only con:

- runner real;
- matriz de acciones UI Admin/Operaciones y Shopper;
- fingerprint ampliado;
- cleanup exacto;
- evidencia y capturas.

No se ejecutará runtime antes del único deploy DEV de la candidata visual final.

## 7. Estrategia de salida

Primer corte:

`ADMIN/OPERACIONES + SHOPPER`.

Portal Cliente queda en carril paralelo.

## 8. Siguiente secuencia

```text
PREPARAR RUNNER/LAB SOURCE-ONLY EN PARALELO
+ CLOUD V7
→ AUDITORÍA VISUAL CHATGPT
→ CODEX SOLO EMPALME
→ ACTUALIZAR SOURCE LOCK
→ SOURCE/STATIC PASS FINAL
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP EXACTO
→ VALIDACIÓN HUMANA
→ CUTOVER AUTORIZADO
```

## 9. Estado seguro

- provider changes: 0;
- Hosting/Cloud Run: 0;
- producción/merge: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0.

## 10. Clasificación

- **Reusable CXOrbia:** manifest overlay, scanner sin self-match, marker observable y laboratorio honesto.
- **Exclusivo TyA:** release slice Admin/Operaciones + Shopper.
- **Cloud/prototipo:** V7 visual pendiente.
- **Academia:** diferencia entre observación, ejecución real y observabilidad estática.
- **Sin impacto producción:** producción intacta.
