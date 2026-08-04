# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `V6_EMPALMED__SOURCE_GATE_ROOT_FIX_MATERIALIZED__VISUAL_HOLD__CLOUD_V7_PENDING__NO_DEPLOY__NO_PRODUCTION`

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

Se emitió un delta Cloud V7 con:

- Emergent como autoridad visual;
- Orbit 360 como autoridad de estilo orbital;
- alcance principal limitado a `app/app.js` y `app/styles/layout.css`.

## 5. Gate posterior al empalme

El gate completo quedó en FAIL por:

1. blobs históricos de cinco archivos legítimamente modificados por V6;
2. ausencia de `app/core/backend-dev-auth.local.js`;
3. falso positivo de secreto sobre el código de un scanner.

Correctivos aplicados:

- manifest overlay V6 sin borrar la autoridad histórica;
- placeholder local Auth fail-closed sin secretos;
- secret scan separado para archivos que definen patrones;
- source gate rebasado a manifest base + overlay.

No se afirma PASS hasta ejecutar el gate actualizado.

## 6. Laboratorio

Se detectó un defecto metodológico real: el shell V6 marcaba `SCENARIO_EXECUTED` y `CLEANUP_VERIFIED` aunque no ejecutaba operaciones.

Quedó corregido para:

- mostrar `BLOCKED_AWAITING_CONTROLLED_RUNNER`;
- no inventar PASS;
- aceptar evidencia únicamente por `CX.devScenarioLab.ingest(report)`;
- exigir fingerprints y cleanup reales.

El runner operativo real sigue pendiente y se ejecutará aquí, no en Codex ni Cloud.

## 7. Estrategia de salida

Primer corte:

`ADMIN/OPERACIONES + SHOPPER`.

Portal Cliente queda en carril paralelo.

## 8. Siguiente secuencia

```text
CLOUD V7
→ AUDITORÍA VISUAL CHATGPT
→ CODEX SOLO EMPALME
→ ACTUALIZAR SOURCE LOCK
→ SOURCE/STATIC PASS
→ ÚNICO HOSTING DEV
→ LABORATORIO REAL
→ CLEANUP EXACTO
→ VALIDACIÓN HUMANA
→ CUTOVER AUTORIZADO
```

## 9. Estado seguro

- cambios proveedor: 0;
- Hosting/Cloud Run: 0;
- producción/merge: 0;
- Auth/Firestore/Storage/HR writes: 0;
- Make/Gemini/pagos: 0.

## 10. Clasificación

- **Reusable CXOrbia:** manifest overlay, scanner sin self-match y laboratorio honesto.
- **Exclusivo TyA:** release slice Admin/Operaciones + Shopper.
- **Cloud/prototipo:** V7 visual pendiente.
- **Academia:** diferencia entre observación y ejecución real.
- **Sin impacto producción:** producción intacta.
